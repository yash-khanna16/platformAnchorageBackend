import { QueryResult } from "pg";
import pool from "../db";
import { getAllGuests,getNamedGuests,getAdmin } from "./queries";


export async function fetchGuests(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getAllGuests);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllGuests(guestName:string): Promise<QueryResult<any>> {

  try {
    const result = await pool.query(getNamedGuests,[guestName]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchAdmin(adminId:string,password:string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getAdmin,[adminId,password]);
    return result;
  } catch (error) {
    throw error;
  }
}

