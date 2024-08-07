import { QueryResult } from "pg";
import {
  getAverageBreakfastBoughtPerDay,
  getAverageBreakfastBoughtPerDayQuarter,
  getAverageBreakfastBoughtPerDayYear,
  getAverageCompanyBookingForMonthandYear,
  getAverageCompanyBookingForQuarterandYear,
  getAverageCompanyBookingForYear,
  getAverageMealsBoughtPerDay,
  getAverageMealsBoughtPerDayQuarter,
  getAverageMealsBoughtPerDayYear,
  getRoomsBookedPerDay,
  getRoomsBookedPerDayQuarter,
  getRoomsBookedPerDayYear,
} from "../models/analyticsmodel";

export async function fetchRoomsBookedPerDay(year: number, month: number) {
  return new Promise((resolve, reject) => {
    getRoomsBookedPerDay(year, month)
      .then((results) => {
        results.rows.map((row: { booking_date: string }) => {
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}

export async function fetchAverageCompanyBookingForMonthandYear(year: number, month: number) {
  return new Promise((resolve, reject) => {
    getAverageCompanyBookingForMonthandYear(year, month)
      .then((results) => {
        const res = results.rows.filter((row: { company: string | null; average_rooms_booked: string }) => row.company !== null);
        resolve(res);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}

export async function fetchAverageMealsBoughtPerDay(year: number, month: number) {
  return new Promise((resolve, reject) => {
    getAverageMealsBoughtPerDay(year, month)
      .then((results) => {
        results.rows.map((row: { average_meals_per_day: string | null; booking_date: string }) => {
          row.average_meals_per_day = row.average_meals_per_day ? row.average_meals_per_day : "0";
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        console.log("results: ", results.rows);
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}
export async function fetchAverageBreakfastBoughtPerDay(year: number, month: number) {
  return new Promise((resolve, reject) => {
    getAverageBreakfastBoughtPerDay(year, month)
      .then((results) => {
        results.rows.map((row: { average_breakfasts_per_day: string | null; booking_date: string }) => {
          row.average_breakfasts_per_day = row.average_breakfasts_per_day ? row.average_breakfasts_per_day : "0";
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}
export async function fetchRoomsBookedPerDayQuarter(year: string, quarter: string) {
  return new Promise((resolve, reject) => {
    getRoomsBookedPerDayQuarter(year, quarter)
      .then((results) => {
        results.rows.map((row: { booking_date: string }) => {
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}

export async function fetchAverageCompanyBookingForQuarterandYear(year: string, quarter: string) {
  return new Promise((resolve, reject) => {
    getAverageCompanyBookingForQuarterandYear(year, quarter)
      .then((results) => {
        const res = results.rows.filter((row: { company: string | null; average_rooms_booked: string }) => row.company !== null);
        resolve(res);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}

export async function fetchAverageMealsBoughtPerDayQuarter(year: string, quarter: string) {
  return new Promise((resolve, reject) => {
    getAverageMealsBoughtPerDayQuarter(year, quarter)
      .then((results) => {
        results.rows.map((row: { average_meals_per_day: string | null; booking_date: string }) => {
          row.average_meals_per_day = row.average_meals_per_day ? row.average_meals_per_day : "0";
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}
export async function fetchAverageBreakfastBoughtPerDayQuarter(year: string, quarter: string) {
  return new Promise((resolve, reject) => {
    getAverageBreakfastBoughtPerDayQuarter(year, quarter)
      .then((results) => {
        results.rows.map((row: { average_breakfasts_per_day: string | null; booking_date: string }) => {
          row.average_breakfasts_per_day = row.average_breakfasts_per_day ? row.average_breakfasts_per_day : "0";
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}
export async function fetchRoomsBookedPerDayYear(year: string) {
  return new Promise((resolve, reject) => {
    getRoomsBookedPerDayYear(year)
      .then((results) => {
        results.rows.map((row: { booking_date: string }) => {
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}

export async function fetchAverageCompanyBookingForYear(year: string) {
  return new Promise((resolve, reject) => {
    getAverageCompanyBookingForYear(year)
      .then((results) => {
        const res = results.rows.filter((row: { company: string | null; average_rooms_booked: string }) => row.company !== null);
        resolve(res);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}

export async function fetchAverageMealsBoughtPerDayYear(year: string) {
  return new Promise((resolve, reject) => {
    getAverageMealsBoughtPerDayYear(year)
      .then((results) => {
        results.rows.map((row: { average_meals_per_day: string | null; booking_date: string }) => {
          row.average_meals_per_day = row.average_meals_per_day ? row.average_meals_per_day : "0";
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}
export async function fetchAverageBreakfastBoughtPerDayYear(year: string) {
  return new Promise((resolve, reject) => {
    getAverageBreakfastBoughtPerDayYear(year)
      .then((results) => {
        results.rows.map((row: { average_breakfasts_per_day: string | null; booking_date: string }) => {
          row.average_breakfasts_per_day = row.average_breakfasts_per_day ? row.average_breakfasts_per_day : "0";
          row.booking_date = toLocalISOString(new Date(row.booking_date));
        });
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}

function toLocalISOString(date: Date): string {
  const pad = (number: number): string => (number < 10 ? "0" : "") + number;

  const year: number = date.getFullYear();
  const month: string = pad(date.getMonth() + 1);
  const day: string = pad(date.getDate());
  const hours: string = pad(date.getHours());
  const minutes: string = pad(date.getMinutes());
  const seconds: string = pad(date.getSeconds());
  const milliseconds: string = (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5);

  const timezoneOffset: number = -date.getTimezoneOffset();
  const sign: string = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours: string = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes: string = pad(Math.abs(timezoneOffset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}:${offsetMinutes}`;
}
