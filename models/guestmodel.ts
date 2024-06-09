import { QueryResult } from "pg";
import pool from "../db";
import { getAllGuests, getNamedGuests, getAdmin, addGuestQuery, fetchResv, addBookingDetails, editBookingDetails, serverTime, fetchThisRoom, fetchGuest, fetchRooms, deleteBooking, findRoomConflict,editGuestQuery,findRoom,addRoom ,getRoom,setActive,hideThisRoom, EmailTemplate, GetEmailTemplate, fetchAvailRoom} from "./queries";


export async function fetchGuests(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getAllGuests);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllGuests(guestName: string): Promise<QueryResult<any>> {
  try {
    // console.log(guestName);
    const result = await pool.query(getNamedGuests, [guestName]);
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

export async function addGuestData(guestData: { guestEmail: string, guestName: string, guestPhone: number, guestCompany: string, guestVessel: string, guestRank: string }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(addGuestQuery, [guestData.guestEmail, guestData.guestName, guestData.guestPhone, guestData.guestCompany, guestData.guestVessel, guestData.guestRank]);
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


export async function editBooking(bookingData: { bookingId: string, checkout: Date, email: string, meal_veg: number, meal_non_veg: number, remarks: string, additional: string }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(editBookingDetails, [bookingData.bookingId, bookingData.checkout, bookingData.email, bookingData.meal_veg, bookingData.meal_non_veg, bookingData.remarks, bookingData.additional]);
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

export async function editGuest(guestData: { guestEmail: string, guestName: string, guestPhone: number, guestCompany: string, guestVessel: string, guestRank: string }): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(editGuestQuery, [guestData.guestEmail, guestData.guestName, guestData.guestPhone, guestData.guestCompany, guestData.guestVessel, guestData.guestRank]);
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





