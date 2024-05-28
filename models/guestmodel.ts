import { QueryResult } from "pg";
import pool from "../db";

export async function fetchGuests(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query("SELECT * FROM guests");
    return result;
  } catch (error) {
    throw error;
  }
}


