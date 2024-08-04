import {
  addOrderModel,
  deleteItemModel,
  deleteOrderModel,
  fetchAllItemsModel,
  fetchAllOrdersModel,
  fetchBookingByEmailId,
  fetchBookingByRoomModel,
  fetchOrderByBookingIdModel,
  fetchOrderDetailsByOrderId,
  fetchOTP,
  putItemModel,
  updateItemStatusModel,
  updateOrderStatusModel,
  updateOTP,
} from "../models/cosmodel";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import { itemDetailsType, orderType } from "../types/cos";
import { v4 as uuidv4 } from "uuid";
import { convertUTCToIST } from "./guestservice";
import { getIO } from "../socket";
import jwt from "jsonwebtoken"

dotenv.config();
const { ROOM_CODE } = process.env;

const maxTries = 10;

const transporter = nodemailer.createTransport({
  // service: "gmail", // You can use any email service
  host: "smtp.mailgun.org",
  port: 465,
  auth: {
    user: process.env.NODE_MAIL_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export async function fetchBookingFromRoomService(room: string) {
  return new Promise((resolve, reject) => {
    fetchBookingByRoomModel(room)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching booking from room", error);
        reject("Error fetching booking from room!");
      });
  });
}

export async function sendOTPByEmailService(email: string) {
  try {
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const otpInfo = await fetchOTP(email);
    const newExpiry = new Date().getTime();
    const tries = 0;
    const timeRemaining = Number(otpInfo[0].expiry) + 60 * 1000 - newExpiry;
    if (timeRemaining > 0) {
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000)
        .toString()
        .padStart(2, "0");
      return { message: `Please try again after ${minutes}:${seconds} min` };
    }

    await updateOTP(email, otp, newExpiry, tries);
    const mailOptions = {
      from: process.env.NODE_MAIL_FROM_EMAIL,
      to: email,
      subject: "Your One-Time Password (OTP) for Verification",
      html: `Dear User,<br><br>Your One-Time Password (OTP) is: <strong>${otp}</strong><br><br>Please note that this OTP will expire in <strong>5 minutes</strong>.<br><br>If you did not request this OTP, please ignore this email.<br><br>Best regards,<br>Anchorage`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent to: ", email, " response: ", info.response);
      }
    });
    return { message: "OTP Sent Successfully" };
  } catch (error) {
    console.log("Error sending OTP");
    throw new Error("Error sending OTP");
  }
}
// reset tries after verifying
export async function verifyOTPService(email: string, otp: string) {
  try {
    const otpInfo = await fetchOTP(email);
    if (Number(otpInfo[0].expiry) + 5 * 60 * 1000 < new Date().getTime()) {
      return { message: "OTP Expired, Please generate OTP Again!" };
    }
    if (otpInfo[0].tries === maxTries) {
      return { message: "OTP Tries limit reached, Please try again later!" };
    }
    await updateOTP(email, otpInfo[0].otp, otpInfo[0].expiry, otpInfo[0].tries + 1);
    if (otpInfo[0].otp === otp) {
      const booking = await fetchBookingByEmailId(email);
      console.log(booking);
      const token = jwt.sign(
        {
          bookingId:booking[0].booking_id,
        },
        process.env.JWT_SECRET_KEY as string
      );
      return { token: token };
    } else {
      return { message: "Invalid OTP" };
    }
  } catch (error) {
    console.log("error verifying otp", error);
    throw new Error("error verifying otp");
  }
}

export async function fetchAllItemsService() {
  return new Promise((resolve, reject) => {
    fetchAllItemsModel()
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching all items", error);
        reject("Error fetching all items");
      });
  });
}
export async function putItemService(itemDetails: itemDetailsType) {
  return new Promise((resolve, reject) => {
    itemDetails.item_id = uuidv4();
    putItemModel(itemDetails)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error inserting  items", error);
        reject("Error inserting item");
      });
  });
}

export async function addOrderService(order: orderType) {
  return new Promise((resolve, reject) => {
    order.created_at = new Date().getTime().toString();
    addOrderModel(order)
      .then(async (results) => {
        try {
          const io = getIO();
          let details:[] = await fetchAllOrdersService();
          if (ROOM_CODE) {
            io.to(ROOM_CODE).emit("order_received", details);
          }
          resolve({ message: "Order received successfully", details: details[0] });
        } catch (error) {
          console.log("error fetching order details");
        }
      })
      .catch((error) => {
        console.log("error adding order", error);
        reject("Error adding order");
      });
  });
}

export async function deleteOrderService(orderId: string, reason: string) {
  return new Promise((resolve, reject) => {
    deleteOrderModel(orderId)
      .then(async (results) => {
        try {
          const io = getIO();
          let details = await fetchAllOrdersService();
          if (ROOM_CODE) {
            io.to(ROOM_CODE).emit("order_deleted", details);
          }
          resolve({details: details});
        } catch (error) {
          console.log("error fetching order details");
        }
      })
      .catch((error) => {
        console.log("error deleting order", error);
        reject("Error deleting order");
      });
  });
}

export async function fetchOrderByBookingIdService(bookingId: string) {
  return new Promise((resolve, reject) => {
    fetchOrderByBookingIdModel(bookingId)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching order by booking", error);
        reject("Error fetching order by booking");
      });
  });
}

function convertOrders(results: any) {
  const transformedResults = results.reduce((acc: any, curr: any) => {
    const {
      order_id,
      booking_id,
      room,
      remarks,
      created_at,
      status,
      guest_name,
      item_id,
      name,
      description,
      price,
      qty,
      type,
      category,
      available,
      time_to_prepare,
    } = curr;

    const item = { item_id, name, description, price, qty, type, category, available, time_to_prepare };

    if (!acc[order_id]) {
      acc[order_id] = {
        order_id,
        booking_id,
        room,
        remarks,
        created_at,
        status,
        guest_name,
        items: [],
      };
    }

    acc[order_id].items.push(item);

    return acc;
  }, {});

  return transformedResults;
}

export async function fetchAllOrdersService() {
  return new Promise((resolve, reject) => {
    fetchAllOrdersModel()
      .then((results) => {
        const transformedResults = convertOrders(results);
        const sortedResults = Object.values(transformedResults).sort((a: any, b: any) => {
          return Number(b.created_at) - Number(a.created_at);
        });
        resolve(Object.values(sortedResults));
      })
      .catch((error) => {
        console.log("error fetching all orders", error);
        reject("Error fetching all orders!");
      });
  });
}

export async function updateOrderStatusService(orderid: string, status: string) {
  return new Promise((resolve, reject) => {
    updateOrderStatusModel(orderid, status)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error updating order status", error);
        reject("Error update order status!");
      });
  });
}

export async function updateItemStatusService(itemid: string, available: boolean) {
  return new Promise((resolve, reject) => {
    updateItemStatusModel(itemid, available)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error updating item status", error);
        reject("Error update item status!");
      });
  });
}

export async function deleteItemService(itemid: string) {
  return new Promise((resolve, reject) => {
    deleteItemModel(itemid)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error deleting item", error);
        reject("Error deleting item!");
      });
  });
}
