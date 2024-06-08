import { QueryResult } from "pg";
import { getAverageCompanyBookingForMonthandYear, getAverageMealsBoughtPerDay, getRoomsBookedPerDay } from "../models/analyticsmodel";

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
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("Internal Server Error");
            });
    });
}