import { fetchGuests,fetchAllGuests,fetchAdmin } from "../models/guestmodel";


export function getGuests(): Promise<any> {
    return new Promise((resolve, reject) => {
        fetchGuests()
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)

                reject("internal server error");
            });
    });
} 

export function searchGuests(guestName:string): Promise<any> {
    return new Promise((resolve, reject) => {
        fetchAllGuests(guestName)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)

                reject("internal server error");
            });
    });
} 

export function searchAdmin(adminId:string,password:string): Promise<any> {
    return new Promise((resolve, reject) => {
        fetchAdmin(adminId,password)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)

                reject("internal server error");
            });
    });
} 