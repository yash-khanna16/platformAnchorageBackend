import { QueryResult } from "pg";
import pool from "../db";
import { getAllGuests } from "./queries";


export async function fetchGuests(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getAllGuests);
    return result;
  } catch (error) {
    throw error;
  }
}


