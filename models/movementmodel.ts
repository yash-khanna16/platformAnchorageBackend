import { editMovementDetailsType, movementDetailsType } from "../constants/movement";
import pool from "../db";
import { addCarQuery, addDriverQuery, checkConflictQuery, deleteCarQuery, deleteDriverQuery, fetchAvailableCarsQuery, fetchAvailableDriversQuery, fetchMovementQuery } from "./movementqueries";
import { v4 as uuidv4 } from "uuid";

export async function fetchMovementModel() {
  try {
    const result = await pool.query(fetchMovementQuery);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addMovementModel(details: movementDetailsType) {
  const { pickup_location, pickup_time, return_time, drop_location, driver, car_number, passengers } = details;

  const movement_id = uuidv4();

  console.log("details: ", details);

  try {
    // First query: Insert into movement table
    const queryMovement = `
          INSERT INTO movement
          (movement_id, pickup_location, pickup_time, return_time, car_number, driver, drop_location)
          VALUES
          ($1, $2, $3, $4, $5, $6, $7)
      `;
    const paramsMovement = [movement_id, pickup_location, pickup_time, return_time, car_number, driver, drop_location];

    await pool.query(queryMovement, paramsMovement);

    for (let index = 0; index < passengers.length; index++) {
      const passenger = passengers[index];
      const passenger_id = uuidv4();
      const booking_id = passenger.booking_id;
      const company = booking_id ? null : passenger.company || null;
      const phone = booking_id ? null : passenger.phone || null;
      const remark = passenger.remark;
      const name = booking_id ? null : passenger.name || null;

      const queryPassengerMovement = `
              INSERT INTO passengers
              (movement_id, booking_id, passenger_id, remark)
              VALUES
              ($1, $2, $3, $4)
          `;
      const paramsPassengerMovement = [movement_id, booking_id, passenger_id, remark];

      await pool.query(queryPassengerMovement, paramsPassengerMovement);

      if (!booking_id) {
        const queryPassenger = `
                INSERT INTO external_passenger
                (passenger_id, company, phone, name)
                VALUES
                ($1, $2, $3, $4)
            `;
        const paramsPassenger = [passenger_id, company, phone, name];
        await pool.query(queryPassenger, paramsPassenger);
      }

    }
    return { message: "Movement added successfully!" };
  } catch (error) {
    console.error("Error adding movement:", error);
    return { message: "Error adding movement" };
  }
}

export async function checkConflict(driver: string, car: string, pickup_time: string, return_time: string) {
  try {
    console.log("pickup ", pickup_time, "return ", return_time);
    const result = await pool.query(checkConflictQuery, [driver, car, pickup_time, return_time]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function editMovementModel(details: editMovementDetailsType) {
  const { movement_id, pickup_location, pickup_time, return_time, drop_location, driver, car_number, passengers } = details;

  try {
    // Update the movement
    const updateMovementQuery = `
      UPDATE movement
      SET 
        pickup_location = $2,
        pickup_time = $3,
        return_time = $4,
        drop_location = $5,
        driver = $6,
        car_number = $7
      WHERE
        movement_id = $1
    `;
    await pool.query(updateMovementQuery, [movement_id, pickup_location, pickup_time, return_time, drop_location, driver, car_number]);

    // Upsert each passenger and update passenger_movement
    for (const passenger of passengers) {
      let { passenger_id, booking_id, company, phone, remark, name } = passenger;

      if (!passenger_id) {
        passenger_id = uuidv4();
      }
      if (booking_id) {
        name = company = phone = null;
      }
      // Upsert passenger
      if (!booking_id) {
        const upsertPassengerQuery = `
          INSERT INTO external_passenger (passenger_id, company, phone, name)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (passenger_id) DO UPDATE
          SET 
            company = EXCLUDED.company,
            phone = EXCLUDED.phone,
            name = EXCLUDED.name;
        `;
        await pool.query(upsertPassengerQuery, [passenger_id, company, phone, name]);
      }

      const upsertPassengerMovementQuery = `
        INSERT INTO passengers (passenger_id, booking_id, movement_id, remark)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (passenger_id) DO UPDATE
        SET 
          booking_id = EXCLUDED.booking_id,
          remark = EXCLUDED.remark;
      `;
      await pool.query(upsertPassengerMovementQuery, [passenger_id, booking_id, movement_id, remark]);
    }

    return { message: 'Movement updated successfully!' };
  } catch (error) {
    console.error('Error updating movement:', error);
    throw new Error('Error updating movement');
  }
}

export async function fetchAvailableCarsModel(pickup_time: string, return_time: string) {
  try {
    // console.log("first ", pickup_time, return_time);
    const result = await pool.query(fetchAvailableCarsQuery,[pickup_time, return_time]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function fetchAvailableDriversModel(pickup_time: string, return_time: string) {
  try {
    // console.log("first ", pickup_time, return_time);
    const result = await pool.query(fetchAvailableDriversQuery,[pickup_time, return_time]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addCarModel(name: string, number: string) {
  try {
    const result = await pool.query(addCarQuery,[name, number]);
    return {message: "Car added successfully!"};
  } catch (error) {
    throw error;
  }
}
export async function deleteCarModel(number: string) {
  try {
    const result = await pool.query(deleteCarQuery,[number]);
    return {message: "Car deleted successfully!"};
  } catch (error) {
    throw error;
  }
}
export async function addDriverModel(name: string, phone: string) {
  try {
    const result = await pool.query(addDriverQuery,[name, phone]);
    return {message: "Driver added successfully!"};
  } catch (error) {
    throw error;
  }
}
export async function deleteDriverModel(name: string) {
  try {
    const result = await pool.query(deleteDriverQuery,[name]);
    return {message: "Driver deleted successfully!"};
  } catch (error) {
    throw error;
  }
}

export async function deletePassengerFromMovementModel(movementId: string, passengerId: string) {
  // const client = await pool.connect();
  try {
      // await client.query('BEGIN');

      // Fetch booking_id and check passenger count in the same query
      console.log("data: ", movementId, passengerId)
      const result = await pool.query(`
          WITH passenger_info AS (
              SELECT
                  booking_id,
                  (SELECT COUNT(*) FROM passengers WHERE movement_id = $2) as passenger_count
              FROM passengers
              WHERE passenger_id = $1 AND movement_id = $2
          ),
          delete_passenger AS (
              DELETE FROM passengers
              WHERE passenger_id = $1 AND movement_id = $2
              RETURNING *
          )
          SELECT passenger_info.booking_id, passenger_info.passenger_count
          FROM passenger_info
          LEFT JOIN delete_passenger ON true
      `, [passengerId, movementId]);
      console.log(result.rows)

      const { booking_id: bookingId, passenger_count: passengerCount } = result.rows[0];
      console.log("booking id", bookingId, "passenger count ", passengerCount)

      // If booking_id is not null, delete from external_passenger table
      if (!bookingId) {
          await pool.query(`
              DELETE FROM external_passenger
              WHERE passenger_id = $1
          `, [passengerId]);
      }

      // If no passengers are left in the movement, delete the movement
      if (passengerCount === '1') { // Since we already deleted one passenger, check for 1
          await pool.query(`
              DELETE FROM movement
              WHERE movement_id = $1
          `, [movementId]);
      }

      // await client.query('COMMIT');
      return { message: 'Passenger and related records deleted successfully.' };
  } catch (error) {
      // await client.query('ROLLBACK');
      console.error('Error deleting passenger:', error);
      throw new Error('Error deleting passenger');
  } 
}



