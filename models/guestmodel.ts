import { QueryResult } from "pg";
import pool from "../db";
import { getAllGuests, getNamedGuests, getAdmin, addGuestQuery, fetchResv, addBookingDetails, editBookingDetails, serverTime, fetchThisRoom, fetchGuest, fetchRooms, deleteBooking, findRoomConflict,editGuestQuery,findRoom,addRoom ,getRoom,setActive,hideThisRoom, EmailTemplate, GetEmailTemplate, fetchAvailRoom,editGuestEmail,deleteGuestDetails,getUpcoming, fetchBookingByBookingIdQuery, fetchMealsByDateQuery, fetchMealsByBookingIdQuery
} from "./queries";


export async function fetchGuests(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getAllGuests);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllGuests(): Promise<QueryResult<any>> {
  try {
    // console.log(guestName);
    const result = await pool.query(getNamedGuests);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchAdmin(adminId: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getAdmin, [adminId]);
    // console.log(result.rows);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addGuestData(guestData: { guestEmail: string, guestName: string, guestPhone: number, guestCompany: string, guestVessel: string, guestRank: string; guestId: string; }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(addGuestQuery, [guestData.guestEmail, guestData.guestName, guestData.guestPhone, guestData.guestCompany, guestData.guestVessel, guestData.guestRank, guestData.guestId]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchRoomResv(roomNo: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchResv, [roomNo]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addBooking(bookingData: { booking_id: string, checkin: Date, checkout: Date, email: string, meal_veg: number, meal_non_veg: number, remarks: string, additional: string, room: string, breakfast: number }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(addBookingDetails, [bookingData.booking_id, bookingData.checkin, bookingData.checkout, bookingData.email, bookingData.meal_veg, bookingData.meal_non_veg, bookingData.remarks, bookingData.additional, bookingData.room, bookingData.breakfast]);
    return result;
  } catch (error) {
    throw error;
  }
}


export async function editBooking(bookingData: { bookingId: string,checkin:Date, checkout: Date, email: string, meal_veg: number, meal_non_veg: number, remarks: string, additional: string,breakfast:number,room:string }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(editBookingDetails, [bookingData.bookingId,bookingData.checkin, bookingData.checkout, bookingData.email, bookingData.meal_veg, bookingData.meal_non_veg, bookingData.remarks, bookingData.additional,bookingData.breakfast,bookingData.room]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getServerTime(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(serverTime);
    return result.rows[0].server_time;
  } catch (error) {
    throw error;
  }
}

export async function fetchAvailRooms(checkData: { checkin: Date, checkout: Date }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchAvailRoom, [checkData.checkin, checkData.checkout]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchThisRooms(checkData: { checkin: Date, checkout: Date, room: string }): Promise<QueryResult<any>> {
  console.log(checkData);
  try {
    const result = await pool.query(fetchThisRoom, [checkData.checkin, checkData.checkout, checkData.room]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function findGuest(email: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchGuest, [email]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function deleteGuest(email: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(deleteGuestDetails, [email]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllRooms(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchRooms);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function removeBooking(bookingId: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(deleteBooking, [bookingId]);
    return result;
  } catch (error) {
    throw error;
  }
}


export async function findConflict(checkData: { room: string, checkin: Date, checkout: Date }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(findRoomConflict, [checkData.checkin, checkData.checkout, checkData.room]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function editGuest(guestData: { guestEmail: string, guestName: string, guestPhone: number, guestCompany: string, guestVessel: string, guestRank: string; guestId: string; }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(editGuestQuery, [guestData.guestEmail, guestData.guestName, guestData.guestPhone, guestData.guestCompany, guestData.guestVessel, guestData.guestRank, guestData.guestId]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function updateGuestEmail(guestData: { guestEmail: string, guestName: string, guestPhone: number, guestCompany: string, guestVessel: string, guestRank: string ,guestOrgEmail:string}): Promise<QueryResult<any>> {
  try {
    console.log(guestData);
    const result = await pool.query(editGuestEmail, [guestData.guestEmail, guestData.guestName, guestData.guestPhone, guestData.guestCompany, guestData.guestVessel, guestData.guestRank,guestData.guestOrgEmail]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function findInstantRoom(date: Date): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(findRoom, [date]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function newRoom(room:string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(addRoom, [room]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchRoom(room:string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getRoom,[room]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function setIsActive(room:string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(setActive,[room]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function hideRoom(room:string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(hideThisRoom,[room]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function editEmailTemplate(template: string, content: string, subject: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(EmailTemplate,[template, content, subject]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getEmailTemplate(template_name: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(GetEmailTemplate,[template_name]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchUpcoming(room: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getUpcoming, [room]);
    return result.rows[0].upcoming;
  } catch (error) {
    throw error;
  }
}

export async function fetchBookingByBookingId(bookingID: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchBookingByBookingIdQuery, [bookingID]);
      return result;
  } catch(error) {
    throw error;
  }
}

export async function updateMealsModel(mealDetailsList: MealDetails[]) {
  try {

    const values = mealDetailsList.map((mealDetails, index) => {
      return `(
        $${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, 
        $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8}
      )`;
    }).join(',');

    const upsertQuery = `
      INSERT INTO meals (
        booking_id, date, breakfast_veg, breakfast_nonveg, lunch_veg, lunch_nonveg, dinner_veg, dinner_nonveg
      ) VALUES ${values}
      ON CONFLICT (booking_id, date) DO UPDATE
      SET
        breakfast_veg = EXCLUDED.breakfast_veg,
        breakfast_nonveg = EXCLUDED.breakfast_nonveg,
        lunch_veg = EXCLUDED.lunch_veg,
        lunch_nonveg = EXCLUDED.lunch_nonveg,
        dinner_veg = EXCLUDED.dinner_veg,
        dinner_nonveg = EXCLUDED.dinner_nonveg;
    `;

    const params = mealDetailsList.flatMap(mealDetails => [
      mealDetails.booking_id,
      mealDetails.date,
      mealDetails.breakfast_veg,
      mealDetails.breakfast_nonveg,
      mealDetails.lunch_veg,
      mealDetails.lunch_nonveg,
      mealDetails.dinner_veg,
      mealDetails.dinner_nonveg,
    ]);

    console.log("query: ", upsertQuery, "params: ", params)

    await pool.query(upsertQuery, params);

    // await client.query('COMMIT');
    return { message: 'Meals updated successfully!' };
  } catch (error) {
    console.error('Error updating meals:', error);
    throw new Error('Error updating meals');
  }
}

export async function fetchMealsByDateModel(date: string) {
  try {
    const result = await pool.query(fetchMealsByDateQuery, [date]);
      return result;
  } catch(error) {
    throw error;
  }
}

export async function fetchMealsByBookingIdModel(bookingId: string) {
  try {
    console.log("bookingId ", bookingId)
    const result = await pool.query(fetchMealsByBookingIdQuery, [bookingId]);
      return result;
  } catch(error) {
    throw error;
  }
}






