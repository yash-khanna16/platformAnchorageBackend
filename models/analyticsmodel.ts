import pool from "../db";
import { AverageBreakfastBoughtPerDay, AverageBreakfastBoughtPerQuarter, AverageBreakfastBoughtPerYear, averageCompanyBookingForMonthandYear, averageCompanyBookingForQuarterandYear, averageCompanyBookingForYear, AverageMealsBoughtPerDay, AverageMealsBoughtPerQuarter, AverageMealsBoughtPerYear, RoomsBookedPerDay, RoomsBookedPerQuarter, RoomsBookedPerYear,fetchTotalProfitPerDayQuery,fetchTotalProfitPerDayQueryForQuarter,fetchTotalProfitPerDayQueryForYear} from "./analyticsqueries";

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
export async function getAverageBreakfastBoughtPerDay(year:number, month:number) {
  try {
    const result = await pool.query(AverageBreakfastBoughtPerDay,[year, month]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function getRoomsBookedPerDayQuarter(year:string,quarter:string) {
  try {
    
    const result = await pool.query(RoomsBookedPerQuarter,[year,quarter]);
    return result;
  } catch (error) {
        throw error;
      }
    }

    export async function getAverageCompanyBookingForQuarterandYear(year:string, quarter: string) {
      try {
    const result = await pool.query(averageCompanyBookingForQuarterandYear,[year, quarter]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getAverageMealsBoughtPerDayQuarter(year:string, quarter:string) {
  try {
    const result = await pool.query(AverageMealsBoughtPerQuarter,[year, quarter]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function getAverageBreakfastBoughtPerDayQuarter(year:string, quarter:string) {
  try {
    const result = await pool.query(AverageBreakfastBoughtPerQuarter,[year, quarter]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function getRoomsBookedPerDayYear(year:string) {
    try {
      const result = await pool.query(RoomsBookedPerYear,[year]);
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  export async function getAverageCompanyBookingForYear(year:string) {
    try {
      const result = await pool.query(averageCompanyBookingForYear,[year]);
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  export async function getAverageMealsBoughtPerDayYear(year:string) {
    try {
      const result = await pool.query(AverageMealsBoughtPerYear,[year]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function getAverageBreakfastBoughtPerDayYear(year:string) {
  try {
    const result = await pool.query(AverageBreakfastBoughtPerYear,[year]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function fetchTotalProfitPerDayModel(year:number, month:number) {
  try {
    const result = await pool.query(fetchTotalProfitPerDayQuery,[year, month]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function fetchTotalProfitPerQuarterModel(year:number, month:number) {
  try {
    const result = await pool.query(fetchTotalProfitPerDayQueryForQuarter,[year, month]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function fetchTotalProfitPerYearModel(year:number, month:number) {
  try {
    const result = await pool.query(fetchTotalProfitPerDayQueryForYear,[year]);
    return result;
  } catch (error) {
    throw error;
  }
}