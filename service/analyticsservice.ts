import { QueryResult } from "pg";
import { getAverageBreakfastBoughtPerDay, getAverageBreakfastBoughtPerDayQuarter, getAverageBreakfastBoughtPerDayYear, getAverageCompanyBookingForMonthandYear, getAverageCompanyBookingForQuarterandYear, getAverageCompanyBookingForYear, getAverageMealsBoughtPerDay, getAverageMealsBoughtPerDayQuarter, getAverageMealsBoughtPerDayYear, getRoomsBookedPerDay, getRoomsBookedPerDayQuarter, getRoomsBookedPerDayYear } from "../models/analyticsmodel";

export async function fetchRoomsBookedPerDay(year:number, month: number) {
    return new Promise((resolve, reject) => {
        getRoomsBookedPerDay(year,month)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
} 

export async function fetchAverageCompanyBookingForMonthandYear(year: number, month: number) {
    return new Promise((resolve, reject) => {
        getAverageCompanyBookingForMonthandYear(year, month)
            .then((results) => {
                const res = results.rows.filter((row:{company: string|null,average_rooms_booked: string })=>row.company !== null)
                resolve(res);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}

export async function fetchAverageMealsBoughtPerDay(year: number, month: number) {
    return new Promise((resolve, reject) => {
        getAverageMealsBoughtPerDay(year, month)
            .then((results) => {
                results.rows.map((row:{average_meals_per_day: string|null,booking_date: string}) => row.average_meals_per_day=row.average_meals_per_day ? row.average_meals_per_day:'0' )
                console.log("results: ", results.rows)
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}
export async function fetchAverageBreakfastBoughtPerDay(year: number, month: number) {
    return new Promise((resolve, reject) => {
        getAverageBreakfastBoughtPerDay(year, month)
            .then((results) => {
                results.rows.map((row:{average_breakfasts_per_day: string|null,booking_date: string}) => row.average_breakfasts_per_day=row.average_breakfasts_per_day ? row.average_breakfasts_per_day:'0' )
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}
export async function fetchRoomsBookedPerDayQuarter(year:string, quarter: string) {
    return new Promise((resolve, reject) => {
        getRoomsBookedPerDayQuarter(year,quarter)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
} 

export async function fetchAverageCompanyBookingForQuarterandYear(year: string, quarter: string) {
    return new Promise((resolve, reject) => {
        getAverageCompanyBookingForQuarterandYear(year, quarter)
            .then((results) => {
                const res = results.rows.filter((row:{company: string|null,average_rooms_booked: string })=>row.company !== null)
                resolve(res);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}

export async function fetchAverageMealsBoughtPerDayQuarter(year: string, quarter: string) {
    return new Promise((resolve, reject) => {
        getAverageMealsBoughtPerDayQuarter(year, quarter)
            .then((results) => {
                results.rows.map((row:{average_meals_per_day: string|null,booking_date: string}) => row.average_meals_per_day=row.average_meals_per_day ? row.average_meals_per_day:'0' )
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}
export async function fetchAverageBreakfastBoughtPerDayQuarter(year: string, quarter: string) {
    return new Promise((resolve, reject) => {
        getAverageBreakfastBoughtPerDayQuarter(year, quarter)
            .then((results) => {
                results.rows.map((row:{average_breakfasts_per_day: string|null,booking_date: string}) => row.average_breakfasts_per_day=row.average_breakfasts_per_day ? row.average_breakfasts_per_day:'0' )
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}
export async function fetchRoomsBookedPerDayYear(year:string) {
    return new Promise((resolve, reject) => {
        getRoomsBookedPerDayYear(year)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
} 

export async function fetchAverageCompanyBookingForYear(year: string) {
    return new Promise((resolve, reject) => {
        getAverageCompanyBookingForYear(year)
            .then((results) => {
                const res = results.rows.filter((row:{company: string|null,average_rooms_booked: string })=>row.company !== null)
                resolve(res);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}

export async function fetchAverageMealsBoughtPerDayYear(year: string) {
    return new Promise((resolve, reject) => {
        getAverageMealsBoughtPerDayYear(year)
            .then((results) => {
                results.rows.map((row:{average_meals_per_day: string|null,booking_date: string}) => row.average_meals_per_day=row.average_meals_per_day ? row.average_meals_per_day:'0' )
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}
export async function fetchAverageBreakfastBoughtPerDayYear(year: string) {
    return new Promise((resolve, reject) => {
        getAverageBreakfastBoughtPerDayYear(year)
            .then((results) => {
                results.rows.map((row:{average_breakfasts_per_day: string|null,booking_date: string}) => row.average_breakfasts_per_day=row.average_breakfasts_per_day ? row.average_breakfasts_per_day:'0' )
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}