import { fetchGuests, fetchAllGuests, fetchAdmin, addGuestData, fetchRoomResv, addBooking, editBooking, fetchAvailRooms,fetchThisRooms,findGuest } from "../models/guestmodel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const secretkey="chotahathi"
import { v4 as uuidv4 } from 'uuid';

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

export function searchGuests(guestName: string): Promise<any> {
    const newGuestName = `%${guestName}%`;
    return new Promise((resolve, reject) => {
        fetchAllGuests(newGuestName)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("internal server error");
            });
    });
}

export function getAdmin(adminId: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fetchAdmin(adminId)
            .then(async (results) => {
                try {
                    
                    if (results.rows.length === 0) {
                        console.log("hello");
                        reject("Admin not found");
                        return;
                    }
                    const compare = await bcrypt.compare(password, results.rows[0].password);
                    
                    if (compare) {
                        const token = jwt.sign(
                            {
                                email: adminId,
                                role: results.rows[0].role,
                            },
                            secretkey,
                        );
                        
                        resolve(token);
                    } else {
                        reject("Incorrect password");
                    }
                } catch (error) {
                    console.error('Error comparing passwords:', error);
                    reject("Internal server error");
                }
            })
            .catch((error) => {
                console.error('Error fetching admin:', error);
                reject("Internal server error");
            });
    });
}

export function addGuests(guestData: { guestEmail: string, guestName: string, guestPhone: number, guestCompany: string, guestVessel: string,guestRank:string }): Promise<any> {
    return new Promise((resolve, reject) => {
        addGuestData(guestData)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("internal server error");
            });
    });
}
export function getRoomResv(roomNo: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fetchRoomResv(roomNo)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("internal server error");
            });
    });
}

export function addBookingData(bookingData: { checkin: Date, checkout: Date, email: string, meal_veg: number, meal_non_veg: number, remarks: string, additional: string, room: string, name: string, phone: number, company: string, vessel: string, rank: string, breakfast:number}): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const isGuest = await findGuest(bookingData.email);
        if (isGuest.rows.length === 0) {
            const guestData = { guestEmail: bookingData.email, guestName: bookingData.name, guestPhone: bookingData.phone, guestCompany: bookingData.company, guestVessel: bookingData.vessel, guestRank: bookingData.rank }
            try {
                await addGuestData(guestData);
            } catch (error) {
                console.log(error);
                reject("internal server error");
                return;
            }
        }
        const booking_id = uuidv4();
        const bookingDataWithId = { ...bookingData, booking_id };

        addBooking(bookingDataWithId)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error);
                reject("internal server error");
            });
    });
}

export function editBookingData(bookingData: { bookingId: string, checkout: Date, email: string, meal_veg: number, meal_non_veg: number, remarks: string, additional: string }): Promise<any> {
    return new Promise((resolve, reject) => {
        editBooking(bookingData)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("internal server error");
            });
    });
}

export async function fetchAvailableRooms(checkData: { checkin: Date, checkout: Date}): Promise<any> {
    try {
      const result = await fetchAvailRooms(checkData);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw new Error("internal server error");
    }
  }
  
export async function getThisRoom(checkData: { checkin: Date, checkout: Date,room:string}): Promise<any> {
    try {
      const result = await fetchThisRooms(checkData);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw new Error("internal server error");
    }
  }
  



