import {
  addOrderModel,
  deleteOrderModel,
  fetchAllItemsModel,
  fetchAllOrdersModel,
  fetchBookingByRoomModel,
  fetchOrderByBookingIdModel,
  fetchOTP,
  putItemModel,
  updateOTP,
} from "../models/cosmodel";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import { itemDetailsType, orderType } from "../types/cos";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

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
      return { message: "Verified" };
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
    order.created_at = new Date();
    addOrderModel(order)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error adding order", error);
        reject("Error adding order");
      });
  });
}

export async function deleteOrderService(orderId: string) {
  return new Promise((resolve, reject) => {
    deleteOrderModel(orderId)
      .then((results) => {
        resolve(results);
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

export async function fetchAllOrdersService() {
  return new Promise((resolve, reject) => {
    fetchAllOrdersModel()
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching all orders", error);
        reject("Error fetching all orders!");
      });
  });
}
