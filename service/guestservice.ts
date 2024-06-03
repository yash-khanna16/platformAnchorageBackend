import { fetchGuests, fetchAllGuests, fetchAdmin, addGuestData, fetchRoomResv, addBooking, editBooking, fetchAvailRooms, fetchThisRooms, findGuest, fetchAllRooms, removeBooking, findConflict, editGuest,findInstantRoom } from "../models/guestmodel";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { priorityQueue } from './priorityqueue';

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
        user: 'deepanshupal2003@gmail.com',
        pass: process.env.NODEMAILER_PASSWORD
    }
});


type BookingData = {
    checkin: Date,
    checkout: Date,
    email: string,
    meal_veg: number,
    meal_non_veg: number,
    remarks: string,
    additional: string,
    room: string,
    name: string,
    phone: number,
    company: string,
    vessel: string,
    rank: string,
    breakfast: number,
    booking_id: string
};

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
                // console.log(results.rows);
                if (results.rows.length === 0) {
                    reject("No such guest present");
                }
                else {
                    resolve(results.rows);
                }
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
                            process.env.JWT_SECRET_KEY as string,
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

export function addGuests(guestData: { guestEmail: string, guestName: string, guestPhone: number, guestCompany: string, guestVessel: string, guestRank: string }): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const isGuest = await findGuest(guestData.guestEmail);
        if (isGuest.rows.length === 0) {
            addGuestData(guestData)
                .then((results) => {
                    resolve(results.rows);
                })
                .catch((error) => {
                    console.log(error)
                    reject("internal server error");
                });
        }
        else {
            reject("Email already present");
        }
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

export function addBookingData(bookingData: { checkin: Date, checkout: Date, email: string, meal_veg: number, meal_non_veg: number, remarks: string, additional: string, room: string, name: string, phone: number, company: string, vessel: string, rank: string, breakfast: number }): Promise<any> {
    return new Promise(async (resolve, reject) => {
        bookingData.checkin = new Date(bookingData.checkin);
        bookingData.checkout = new Date(bookingData.checkout);
        const checkData = { checkin: bookingData.checkin, checkout: bookingData.checkout, room: bookingData.room }
        const go_on = await fetchThisRooms(checkData);
        console.log(go_on.rows[0]);
        if (go_on.rows.length === 0 || (go_on.rows[0].condition_met === 'true')) {
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
                    priorityQueue.enqueue(bookingDataWithId);
                    // console.log("booking ho gyi");
                    resolve("Booking added suceessfull");
                })
                .catch((error) => {
                    console.log(error);
                    reject("internal server error");
                });
        }
        else {
            console.log("here");
            reject("room unavailable");
            return;
        }
    });
}

export function editBookingData(bookingData: { bookingId: string, checkin: Date, checkout: Date, email: string, meal_veg: number, meal_non_veg: number, remarks: string, additional: string, room: string, name: string, phone: number, company: string, vessel: string, rank: string, breakfast: number }): Promise<any> {
    return new Promise(async (resolve, reject) => {
        bookingData.checkin = new Date(bookingData.checkin);
        bookingData.checkout = new Date(bookingData.checkout);
        const checkData = { room: bookingData.room, checkin: bookingData.checkin, checkout: bookingData.checkout }
        const conflicts = await findConflict(checkData);
        console.log(conflicts.rows, conflicts);
        if (conflicts.rows.length == 1) {
            editBooking(bookingData)
                .then(async (results) => {
                    const guestData = { guestEmail: bookingData.email, guestName: bookingData.name, guestPhone: bookingData.phone, guestCompany: bookingData.company, guestVessel: bookingData.vessel, guestRank: bookingData.rank }
                    try {
                        const isGuest = await findGuest(bookingData.email);
                        if (isGuest.rows.length === 0) {
                            try {
                                await addGuestData(guestData);
                                resolve("Booking Edited");
                            } catch (error) {
                                console.log(error);
                                reject("internal server error");
                                return;
                            }
                        }
                        else{
                            const updateGuest = editGuest(guestData);
                            resolve("Booking Edited");
                        }
                    }
                    catch {
                        reject("Error changing the guest details")
                    }
                })
                .catch((error) => {
                    console.log(error)
                    reject("internal server error");
                });
        }
        else {
            reject("room is booked for the given range cant change the checkout date");
            return;
        }
    });
}

export async function fetchAvailableRooms(checkData: { checkin: Date, checkout: Date }): Promise<any> {
    console.log("hello");
    checkData.checkin = new Date(checkData.checkin);
    checkData.checkout = new Date(checkData.checkout);
    console.log(checkData.checkin);
    console.log(checkData.checkout);
    try {
        const allRooms = await fetchAllRooms();
        const result = await fetchAvailRooms(checkData);
        const conditionMap = new Map(result.rows.map((room: { room: string, condition_met: string }) => [room.room, room.condition_met]));
        const availableRooms = allRooms.rows.filter((room: { room: string }) => conditionMap.get(room.room) !== 'false');
        console.log(allRooms.rows);
        console.log(result.rows);
        console.log(availableRooms);
        return availableRooms;
    } catch (error) {
        console.error(error);
        throw new Error("internal server error");
    }
}


export async function getThisRoom(checkData: { checkin: Date, checkout: Date, room: string }): Promise<any> {
    try {
        const result = await fetchThisRooms(checkData);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new Error("internal server error");
    }
}


monitorQueue();

export async function triggerBooking(booking: BookingData) {
    const mailOptions = {
        from: 'deepanshupal2003@gmail.com',
        to: booking.email,
        subject: 'Booking Reminder',
        text: `Dear ${booking.name},\n\nThis is a reminder for your booking at our hotel Anchorage. Your check-in time is at ${booking.checkin}.\n\nThank you,\nHotel Anchorage Management`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}


function monitorQueue() {

    setInterval(() => {
        if (!priorityQueue.isEmpty()) {
            const topBooking = priorityQueue.peek();
            // console.log(topBooking, "1");
            if (topBooking) {
                const currentTime = new Date();
                // console.log(currentTime, "2");
                // console.log(topBooking.checkin, "3");
                if (currentTime >= topBooking.checkin) {
                    triggerBooking(topBooking);
                    priorityQueue.dequeue();
                    // console.log("pop hogya");
                }
            }
        }
    }, 10000);
}

export function deleteThisBooking(bookingId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        removeBooking(bookingId)
            .then((results) => {
                priorityQueue.getAllEntries();
                priorityQueue.removeById(bookingId);
                priorityQueue.getAllEntries();
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("internal server error");
            });
    });
}


export function findConflictEntries(bookingData: { checkin: Date, checkout: Date, room: string }): Promise<any> {
    return new Promise((resolve, reject) => {
        bookingData.checkin = new Date(bookingData.checkin);
        bookingData.checkout = new Date(bookingData.checkout);
        findConflict(bookingData)
            .then((results) => {
                resolve(results.rows);
            })
            .catch((error) => {
                console.log(error)
                reject("internal server error");
            });
    });
}

export function getInstantRoom(): Promise<any> {
    return new Promise(async(resolve, reject) => {
        const allRooms=await fetchAllRooms();
        const newDate=new Date();
        console.log("here: ", newDate)
        const bookingData={checkin:newDate,checkout:newDate};
       findInstantRoom(newDate).then((result)=>{
           result.rows.map((row) => {
               row.status = row.status+"/4";
           })
           resolve(result.rows)
       }).catch((error)=>{
        reject("Internal Server Error");
       })

        // const occupancyMap = new Map(allRooms.rows.map((room: { room: string, occupancy:string }) => [room.room, '4/4']));
        //  allRooms.rows.map(async(room)=>{
        //     findConflict({...bookingData,room:room.room})
        //     .then((results) => {
        //         if(results.rows.length===1){
                    
        //         }
        //     })
        //     .catch((error) => {
        //         console.log(error)
        //         reject("internal server error");
        //     });
            
        // })
        
    });
}

