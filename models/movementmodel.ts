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

export async function deleteMovementModel(movement_id: string) {

  try {
    console.log("1")
    const deletePassengersQuery = `
    DELETE FROM passengers
    WHERE passenger_id IN (
      SELECT passenger_id
      FROM passenger_movement
      WHERE movement_id = $1
      );
      `;
      await pool.query(deletePassengersQuery, [movement_id]);
      console.log("2")
      
      // Delete related records from passenger_movement table
      const deletePassengerMovementQuery = `
      DELETE FROM passenger_movement
      WHERE movement_id = $1;
      `;
      await pool.query(deletePassengerMovementQuery, [movement_id]);
      console.log("3")
      
      // Delete the movement
      const deleteMovementQuery = `
      DELETE FROM movement
      WHERE movement_id = $1;
      `;
      await pool.query(deleteMovementQuery, [movement_id]);
      console.log("4")
    console.log('Movement and related records deleted successfully');
    return {message: "Movement and related records deleted successfully"};
  } catch (err) {
    console.log('Error deleting movement and related records:', err);
    return {message: "Error deleting movement and related records"};
  } 
}



