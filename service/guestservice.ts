import { fetchGuests } from "../models/guestmodel";


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