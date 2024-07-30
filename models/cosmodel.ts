import pool from "../db";
import { fetchBookingFromRoomQuery, fetchOTPQuery, updateOTPQuery } from "./cosqueries";

export async function fetchBookingByRoomModel(room: string) {
  try {
    const result = await pool.query(fetchBookingFromRoomQuery, [room]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching booking from room", error);
    throw new Error("Error fetching booking from room");
  }
}

export async function updateOTP(email: string, otp: string, expiry: number, tries: number) {
  try {
    const result = await pool.query(updateOTPQuery, [email, otp, expiry, tries]);
    return result.rows;
  } catch (error) {
    console.error("Error updating OTP", error);
    throw new Error("Error updating OTP");
  }
}

export async function fetchOTP(email: string,) {
  try {
    const result = await pool.query(fetchOTPQuery, [email]);
    return result.rows;
  } catch (error) {
    console.error("Error updating OTP", error);
    throw new Error("Error updating OTP");
  }
}


