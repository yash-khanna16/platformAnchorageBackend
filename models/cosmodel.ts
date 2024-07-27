import pool from "../db";
import { fetchBookingFromRoomQuery } from "./cosqueries";

export async function fetchBookingByRoomModel(room: string) {
    try {
      const result = await pool.query(fetchBookingFromRoomQuery, [room]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching booking from room", error);
      throw new Error("Error fetching booking from room");
    }
  }