import pool from "../db";
import { averageCompanyBookingForMonthandYear, AverageMealsBoughtPerDay, RoomsBookedPerDay} from "./analyticsqueries";

export async function getRoomsBookedPerDay(year:number,month:number) {
    try {
        const result = await pool.query(RoomsBookedPerDay,[year,month]);
        return result;
      } catch (error) {
        throw error;
      }
}

export async function getAverageCompanyBookingForMonthandYear(year:number, month: number) {
  try {
    const result = await pool.query(averageCompanyBookingForMonthandYear,[year, month]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getAverageMealsBoughtPerDay(year:number, month:number) {
  try {
    const result = await pool.query(AverageMealsBoughtPerDay,[year, month]);
    return result;
  } catch (error) {
    throw error;
  }
}