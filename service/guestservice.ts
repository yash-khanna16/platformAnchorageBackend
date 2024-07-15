import {
  fetchGuests,
  fetchAllGuests,
  fetchAdmin,
  addGuestData,
  fetchRoomResv,
  addBooking,
  editBooking,
  fetchAvailRooms,
  fetchThisRooms,
  findGuest,
  fetchAllRooms,
  removeBooking,
  findConflict,
  editGuest,
  findInstantRoom,
  newRoom,
  fetchRoom,
  setIsActive,
  hideRoom,
  editEmailTemplate,
  getEmailTemplate,
  updateGuestEmail,
  deleteGuest,
  fetchUpcoming,
  fetchBookingByBookingId,
  updateMealsModel,
  fetchMealsByDateModel,
  fetchMealsByBookingIdModel
} from "../models/guestmodel";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { priorityQueue } from "./priorityqueue";
import { resolve } from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  // service: "gmail", // You can use any email service
  host: 'smtp.mailgun.org',
  port: 465,
  auth: {
    user: process.env.NODE_MAIL_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

type BookingData = {
  checkin: Date;
  checkout: Date;
  email: string;
  meal_veg: number;
  meal_non_veg: number;
  remarks: string;
  additional: string;
  room: string;
  name: string;
  phone: number;
  company: string;
  vessel: string;
  rank: string;
  breakfast: number;
  booking_id: string;
};

export function getGuests(): Promise<any> {
  return new Promise((resolve, reject) => {
    fetchGuests()
      .then((results) => {
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);

        reject("internal server error");
      });
  });
}

export function searchGuests(): Promise<any> {
  return new Promise((resolve, reject) => {
    fetchAllGuests()
      .then((results) => {
        // console.log(results.rows);
        if (results.rows.length === 0) {
          reject("No such guest present");
        } else {
          resolve(results.rows);
        }
      })
      .catch((error) => {
        console.log(error);
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
          const compare = await bcrypt.compare(
            password,
            results.rows[0].password
          );

          if (compare) {
            const token = jwt.sign(
              {
                email: adminId,
                role: results.rows[0].role,
              },
              process.env.JWT_SECRET_KEY as string
            );

            resolve(token);
          } else {
            reject("Incorrect password");
          }
        } catch (error) {
          console.error("Error comparing passwords:", error);
          reject("Internal server error");
        }
      })
      .catch((error) => {
        console.error("Error fetching admin:", error);
        reject("Internal server error");
      });
  });
}

export function addGuests(guestData: {
  guestEmail: string;
  guestName: string;
  guestPhone: number;
  guestCompany: string;
  guestVessel: string;
  guestRank: string;
  guestId: string;
}): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const isGuest = await findGuest(guestData.guestEmail);
    if (isGuest.rows.length === 0) {
      addGuestData(guestData)
        .then((results) => {
          resolve(results.rows);
        })
        .catch((error) => {
          console.log(error);
          reject("internal server error");
        });
    } else {
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
        console.log(error);
        reject("internal server error");
      });
  });
}

export function addBookingData(bookingData: {
  checkin: Date;
  checkout: Date;
  email: string;
  meal_veg: number;
  meal_non_veg: number;
  remarks: string;
  additional: string;
  room: string;
  name: string;
  phone: number;
  company: string;
  vessel: string;
  rank: string;
  breakfast: number;
  guestId: string;
}): Promise<any> {
  return new Promise(async (resolve, reject) => {
    bookingData.checkin = new Date(bookingData.checkin);
    bookingData.checkout = new Date(bookingData.checkout);
    if (bookingData.email.length === 0) {
      let auxEmail = uuidv4();
      auxEmail = `${auxEmail}@chotahaathi.com`
      bookingData.email = auxEmail;
    }
    const checkData = {
      checkin: bookingData.checkin,
      checkout: bookingData.checkout,
      room: bookingData.room,
    };
    const go_on = await fetchThisRooms(checkData);
    const output = Number(go_on.rows[0].conflict_count);
    if (output <= 3) {
      const isGuest = await findGuest(bookingData.email);
      const guestData = {
        guestEmail: bookingData.email,
        guestName: bookingData.name,
        guestPhone: bookingData.phone,
        guestCompany: bookingData.company,
        guestVessel: bookingData.vessel,
        guestRank: bookingData.rank,
        guestId: bookingData.guestId
      };
      if (isGuest.rows.length === 0) {
        try {
          await addGuestData(guestData);
        } catch (error) {
          console.log(error);
          reject("internal server error");
          return;
        }
      } else {
        const updateGuest = editGuest(guestData);
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
    } else {
      console.log("here");
      reject("room unavailable");
      return;
    }
  });
}

export function editBookingData(bookingData: {
  bookingId: string;
  checkin: Date;
  checkout: Date;
  email: string;
  meal_veg: number;
  meal_non_veg: number;
  remarks: string;
  additional: string;
  room: string;
  name: string;
  phone: number;
  company: string;
  vessel: string;
  rank: string;
  breakfast: number;
  originalEmail: string;
  guestId: string;

}): Promise<any> {
  return new Promise(async (resolve, reject) => {
    bookingData.checkin = new Date(bookingData.checkin);
    bookingData.checkout = new Date(bookingData.checkout);
    const checkData = {
      room: bookingData.room,
      checkin: bookingData.checkin,
      checkout: bookingData.checkout,
    };
    const conflicts = await findConflict(checkData);
    console.log("hello", conflicts.rows);
    if (conflicts.rows.length <= 4) {
      const originalCheckin = await fetchBookingByBookingId(bookingData.bookingId);
      editBooking(bookingData)
        .then(async (results) => {
          try {
            if (bookingData.originalEmail === bookingData.email) {
              const guestData = {
                guestEmail: bookingData.email,
                guestName: bookingData.name,
                guestPhone: bookingData.phone,
                guestCompany: bookingData.company,
                guestVessel: bookingData.vessel,
                guestRank: bookingData.rank,
                guestId: bookingData.guestId
              };
              await editGuest(guestData);
              const newOriginalCheckin = new Date(originalCheckin.rows[0].checkin);
              console.log(newOriginalCheckin);
              console.log(bookingData.checkin);
              if (newOriginalCheckin.toISOString() !== bookingData.checkin.toISOString()) {
                const queueBooking = {
                  checkin: bookingData.checkin,
                  checkout: bookingData.checkout,
                  email: bookingData.email,
                  meal_veg: bookingData.meal_veg,
                  meal_non_veg: bookingData.meal_non_veg,
                  remarks: bookingData.remarks,
                  additional: bookingData.additional,
                  room: bookingData.room,
                  name: bookingData.name,
                  phone: bookingData.phone,
                  company: bookingData.company,
                  vessel: bookingData.vessel,
                  rank: bookingData.rank,
                  breakfast: bookingData.breakfast,
                  booking_id: bookingData.bookingId
                }
                try {
                  priorityQueue.removeById(bookingData.bookingId);
                  priorityQueue.enqueue(queueBooking);
                  priorityQueue.getAllEntries();
                  resolve("Edit booking successfull");
                }
                catch {
                  priorityQueue.getAllEntries();
                  resolve("Edit booking successfull");
                }
              }
              resolve("successfully editted");
            }
            else {
              const isGuest = await findGuest(bookingData.email);
              if (isGuest.rows.length === 0) {
                try {
                  const guestData = {
                    guestEmail: bookingData.email,
                    guestName: bookingData.name,
                    guestPhone: bookingData.phone,
                    guestCompany: bookingData.company,
                    guestVessel: bookingData.vessel,
                    guestRank: bookingData.rank,
                    guestOrgEmail: bookingData.originalEmail
                  };
                  await updateGuestEmail(guestData);
                  resolve("successfully editted")
                } catch (error) {
                  console.log(error);
                  reject("internal server error");
                  return;
                }
              } else {
                const guestData = {
                  guestEmail: bookingData.email,
                  guestName: bookingData.name,
                  guestPhone: bookingData.phone,
                  guestCompany: bookingData.company,
                  guestVessel: bookingData.vessel,
                  guestRank: bookingData.rank,
                  guestId: bookingData.guestId
                };
                await editGuest(guestData);
                await deleteGuest(bookingData.originalEmail);
              }
              const queueBooking = {
                checkin: bookingData.checkin,
                checkout: bookingData.checkout,
                email: bookingData.email,
                meal_veg: bookingData.meal_veg,
                meal_non_veg: bookingData.meal_non_veg,
                remarks: bookingData.remarks,
                additional: bookingData.additional,
                room: bookingData.room,
                name: bookingData.name,
                phone: bookingData.phone,
                company: bookingData.company,
                vessel: bookingData.vessel,
                rank: bookingData.rank,
                breakfast: bookingData.breakfast,
                booking_id: bookingData.bookingId
              }
              try {
                priorityQueue.removeById(bookingData.bookingId);
                priorityQueue.enqueue(queueBooking);
                resolve("Edit booking successfull");
              }
              catch {
                priorityQueue.enqueue(queueBooking);
                resolve("Edit booking successfull");
              }
              resolve("editted successfully");
            }

          }
          catch {
            reject("Error changing the guest details");
          }
        })
        .catch((error) => {
          console.log(error);
          reject("internal server error");
        });
    } else {
      reject(
        "room is booked for the given range cant change the checkout date"
      );
      return;
    }
  });
}

export async function fetchAvailableRooms(checkData: {
  checkin: Date;
  checkout: Date;
}): Promise<any> {
  console.log("hello");
  checkData.checkin = new Date(checkData.checkin);
  checkData.checkout = new Date(checkData.checkout);
  console.log(checkData.checkin);
  console.log(checkData.checkout);
  try {
    const allRooms = await fetchAllRooms();
    console.log("here 1", allRooms)
    const result = await fetchAvailRooms(checkData);
    console.log("here 2", result)
    const conditionMap = new Map(
      result.rows.map((room: { room: string; condition_met: string }) => [
        room.room,
        room.condition_met,
      ])
    );
    const availableRooms = allRooms.rows.filter(
      (room: { room: string }) => conditionMap.get(room.room) !== "false"
    );
    console.log(allRooms.rows);
    console.log(result.rows);
    console.log(availableRooms);
    return availableRooms;
  } catch (error) {
    console.error(error);
    throw new Error("internal server error");
  }
}

export async function getThisRoom(checkData: {
  checkin: Date;
  checkout: Date;
  room: string;
}): Promise<any> {
  try {
    const result = await fetchThisRooms(checkData);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("internal server error");
  }
}

monitorQueue();

export async function triggerBooking(booking: BookingData) {
  if (!booking.email.includes("@chotahaathi.com")) {
    const result = await fetchEmailTemplate("welcome");
    const content = result.content;
    const subject = result.subject;
    const mailOptions = {
      from: process.env.NODE_MAIL_FROM_EMAIL,
      to: booking.email,
      subject: subject,
      text: content,
    };
    console.log(`Sending Email to ${booking.email} from: ${process.env.NODE_MAIL_FROM_EMAIL} user: ${process.env.NODE_MAIL_USER} `)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent to: ", booking.email, " response: ", info.response);
      }
    });
  } else {
    console.log("temp email found!")
  }
}

function monitorQueue() {
  setInterval(() => {
    if (!priorityQueue.isEmpty()) {
      const topBooking = priorityQueue.peek();
      if (topBooking) {
        const currentTime = new Date();
        const newTime = new Date(currentTime);
        newTime.setHours(newTime.getHours() + 2);
        if (newTime >= topBooking.checkin) {
          triggerBooking(topBooking);
          priorityQueue.dequeue();
        }
      }
    }
  }, 10000);
}

export function deleteThisBooking(bookingId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    removeBooking(bookingId)
      .then((results) => {
        try {
          priorityQueue.removeById(bookingId);
          resolve(results.rows);
        }
        catch {
          resolve(results.rows);
        }
      })
      .catch((error) => {
        console.log(error);
        reject("internal server error");
      });
  });
}

export function findConflictEntries(bookingData: {
  checkin: Date;
  checkout: Date;
  room: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    bookingData.checkin = new Date(bookingData.checkin);
    bookingData.checkout = new Date(bookingData.checkout);
    findConflict(bookingData)
      .then((results) => {
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("internal server error");
      });
  });
}

export function getInstantRoom(): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const newDate = new Date();
      console.log("here: ", newDate);
      const bookingData = { checkin: newDate, checkout: newDate };

      const result = await findInstantRoom(newDate);

      // Wait for all fetchUpcoming promises to resolve
      const updatedRows = await Promise.all(result.rows.map(async (row) => {
        row.status = row.status + "/4";
        const res = await fetchUpcoming(row.room);
        row.upcoming = res;
        return row;
      }));

      resolve(updatedRows);
    } catch (error) {
      reject("Internal Server Error");
    }
  });
}


export function addNewRoom(room: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const isRoom = await fetchRoom(room);
    if (isRoom.rows.length === 1) {
      try {
        setIsActive(room);
        resolve("Room added successfully");
      } catch {
        reject("server issue");
      }
    } else {
      newRoom(room)
        .then((results) => {
          resolve("Room added successfully");
        })
        .catch((error) => {
          console.log(error);
          reject("internal server error");
        });
    }
  });
}

export function removeRoom(room: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const isRoomvalid = await fetchRoomResv(room);
    if (isRoomvalid.rows.length >= 1) {
      reject("no change");
    } else {
      hideRoom(room)
        .then((results) => {
          resolve("Room deleted successfully");
        })
        .catch((error) => {
          console.log(error);
          reject("internal server error");
        });
    }
  });
}

export function updateEmailTemplate(template: string, content: string, subject: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    editEmailTemplate(template, content, subject)
      .then((results) => {
        resolve({ message: "Template Edited Successfully" });
      })
      .catch((error) => {
        console.log(error);
        reject({ message: "internal server error" });
      });
  });
}

export function fetchEmailTemplate(template_name: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    getEmailTemplate(template_name)
      .then((results) => {
        resolve(results.rows[0]);
      })
      .catch((error) => {
        console.log(error);
        reject("internal server error");
      });
  });
}
export function updateMealsService(mealDetails: MealDetails[] ): Promise<any> {
  return new Promise(async (resolve, reject) => {
    mealDetails.map((meal) => {
      console.log("date ", meal.date)
      meal.date = new Date(meal.date);
    })
    updateMealsModel(mealDetails)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log(error);
        reject("internal server error");
      });
  });
}

export function fetchMealsByDateService(date: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const newDate = new Date(new Date(date).getTime() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
    console.log("new date: ", newDate)
    fetchMealsByDateModel(newDate)
      .then((results) => {
        results.rows.map((row:any) => {
          row.date = newDate;
        })
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("internal server error");
      });
  });
}
export function fetchMealsByBookingIdService(bookingId: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    fetchMealsByBookingIdModel(bookingId)
      .then((results) => {
        results.rows.map((row:any) => {
          row.date = new Date(new Date(row.date).getTime() + 5.5 * 60 * 60 * 1000)
        })
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("internal server error");
      });
  });
}





