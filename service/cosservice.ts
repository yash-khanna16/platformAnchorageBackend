import {
  addOrderModel,
  deleteItemModel,
  deleteOrderModel,
  fetchAllItemsModel,
  fetchAllOrdersModel,
  fetchAvailabilityOfItems,
  fetchBookingByEmailId,
  fetchBookingByRoomModel,
  fetchOrderByBookingIdModel,
  fetchBookingByBookingIdModel,
  fetchOTP,
  putItemModel,
  updateItemModel,
  updateOrderStatusModel,
  updateOTP,
  fetchOrderDetailsByOrderId,
  updateDelayModel,
  updateFeedbackModel,
  fetchFeedbackCOSModel,
  insertFeedbackCOSModel,
} from "../models/cosmodel";
import { fetchMovementByBookingIdModel } from "../models/movementmodel";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import { itemDetailsType, orderType } from "../types/cos";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "../socket";
import jwt from "jsonwebtoken";

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

const transporterCOS = nodemailer.createTransport({
  // service: "gmail", // You can use any email service
  host: "us3.smtp.mailhostbox.com",
  port: 587,
  auth: {
    user: process.env.COS_EMAIL_USER,
    pass: process.env.COS_EMAIL_PASSWORD,
  },
});

type OrderDetails = {
  order_id: string;
  booking_id: string;
  room: string;
  remarks: string;
  created_at: string; // Consider changing to number if you want it as a timestamp in milliseconds
  status: string;
  guest_name: string;
  guest_email: string;
  items: Array<{
    item_id: string;
    name: string;
    description: string;
    price: number;
    qty: number;
    type: string;
    category: string;
    available: boolean;
    time_to_prepare: number;
  }>;
};

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

      const token = jwt.sign(
        {
          bookingId: booking[0].booking_id,
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
    fetchBookingByBookingIdModel(order.booking_id)
      .then((booking) => {
        const checkin = new Date(booking.checkin).getTime();
        const checkout = new Date(booking.checkout).getTime();
        const currentTime = new Date().getTime();
        if (currentTime < checkout && currentTime > checkin) {
          fetchAvailabilityOfItems(order.items.map((item) => item.item_id))
            .then((availability) => {
              let notAvailable: { item_id: string; name: string; available: boolean }[] = [];
              availability.map((item: { item_id: string; name: string; available: boolean }) => {
                if (!item.available) notAvailable.push(item);
              });
              if (notAvailable.length === 0) {
                addOrderModel(order)
                  .then(async (results) => {
                    try {
                      const io = getIO();
                      let details: OrderDetails[] = (await fetchAllOrdersService()) as OrderDetails[];
                      if (ROOM_CODE) {
                        io.to(ROOM_CODE).emit("order_received", details);
                      }

                      const mailOptions = {
                        from: process.env.COS_EMAIL,
                        to: booking.email,
                        bcc: process.env.ADMIN_EMAIL,
                        subject: `Items Confirmation - [Order #${details[0].order_id}]`,
                        html: `
                          <!DOCTYPE html>
                          <html lang="en">
                          <head>
                              <meta charset="UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <title>Items Confirmation</title>
                          </head>
                          <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td align="center" style="padding: 20px;">
                                          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #ddd;">
                                              <tr>
                                                  <td style="padding: 20px; text-align: center;">
                                                      <img src="https://drive.usercontent.google.com/download?id=10uMrHQslBy2zOrWxaQ03nAvSbwTQZiQZ" alt="Anchorage" style="max-width: 80px; height: auto; margin-bottom: 20px;">
                                                      <h1 style="margin: 0; color: #333;">Items Confirmation</h1>
                                                      <p style="margin: 10px 0 20px; color: #777;">Order #${
                                                        details[0].order_id
                                                      }</p>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 20px;">
                                                      <p style="margin: 10px 0; color: #555;">Dear ${details[0].guest_name},</p>
                                                      <p style="margin: 10px 0; color: #555;">Thank you for your purchase! We are pleased to confirm your order <strong>#${
                                                        details[0].order_id
                                                      }</strong>.</p>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 20px 20px 20px 20px;">
                                                      <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
                                                      <p style="margin-top: 0;">
                                                          <strong>Order Number:</strong> ${details[0].order_id} <br>
                                                          <strong>Order Date:</strong> ${new Date(
                                                            parseInt(details[0].created_at)
                                                          ).toLocaleDateString()} <br>
                                                          <strong>Room No:</strong> ${booking.room} <br>
                                                          <strong>Total Items:</strong> ${details[0].items.length} <br>
                                                          <strong>Order Total:</strong> ₹${details[0].items.reduce(
                                                            (total, item) => total + item.price * item.qty,
                                                            0
                                                          )}
                                                      </p>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 20px 20px 20px 20px;">
                                                      <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
                                                      <ul style="margin: 0; padding: 0; list-style-type: none;">
                                                          ${details[0].items
                                                            .map(
                                                              (item) => `
                                                              <li style="margin: 10px 0;">
                                                                  <strong>${item.name}</strong> - Quantity: ${item.qty} - Price: ₹${item.price}
                                                                  <br>
                                                                  <em>${item.description}</em>
                                                              </li>
                                                          `
                                                            )
                                                            .join("")}
                                                      </ul>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 20px 20px 20px 20px;">
                                                      <h3 style="color: #333; margin-top: 0;">Expected Waiting Time</h3>
                                                      <p style="margin-top: 0;">
                                                          <strong>Preparation Time:</strong> ${details[0].items.reduce(
                                                            (max, item) =>
                                                              item.time_to_prepare > max ? item.time_to_prepare : max,
                                                            0
                                                          )} minutes <br>
                                                          <strong>Estimated Delivery/Pickup Time:</strong> ${new Date(
                                                            parseInt(details[0].created_at) +
                                                              details[0].items.reduce(
                                                                (max, item) =>
                                                                  item.time_to_prepare > max ? item.time_to_prepare : max,
                                                                0
                                                              ) *
                                                                60000
                                                          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                      </p>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 20px;">
                                                      <p style="margin: 10px 0; color: #555;">We are currently processing your order, and you can expect it to be ready in approximately <strong>${details[0].items.reduce(
                                                          (max, item) => item.time_to_prepare > max ? item.time_to_prepare : max, 0
                                                        )} minutes</strong>.</p>
                                                      <p style="margin: 10px 0; color: #555;">If you have any questions or need to make changes to your order, please feel free to contact us  <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a></p>
                                                      <p style="margin: 10px 0; color: #555;">For any complaints or queries, you can reach our front desk at: <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a></p>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 20px; text-align: center; background-color: #f4f4f4;">
                                                      <p style="margin: 0; color: #777;">Anchorage | <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a></p>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </body>
                          </html>
                        `,
                      };
                      
                      transporterCOS.sendMail(mailOptions, (error, info) => {
                        if (error) {
                          console.log("Error sending email:", error);
                        } else {
                          console.log("Email sent to: ", booking.email, " response: ", info.response);
                        }
                      });

                      resolve({ message: "Order received successfully", details: details[0] });
                    } catch (error) {
                      console.log("error fetching order details");
                    }
                  })
                  .catch((error) => {
                    console.log("error adding order", error);
                    reject("Error adding order");
                  });
              } else {
                console.log("error adding order, following items not available now: ", notAvailable);
                reject({ notAvailable: notAvailable });
              }
            })
            .catch((error) => {
              console.log("error fetching availability of items in order", error);
              reject("error fetching availability of items in order");
            });
        } else {
          console.log("booking expired");
          reject({ booking_expired: "Booking expired" });
        }
      })
      .catch((error) => {
        console.log("Error fetching booking");
        reject("Error Fetching Booking");
      });
  });
}

export async function deleteOrderService(orderId: string, reason: string, reject: boolean) {
  return new Promise(async (resolve, rejectFn) => {
    try {
      const orderDetails = await fetchOrderDetailsByOrderId(orderId);
      await deleteOrderModel(orderId);

      const io = getIO();
      let details = await fetchAllOrdersService();
      if (ROOM_CODE) {
        io.to(ROOM_CODE).emit("order_deleted", details);
      }

      if (reject) {
        const mailOptions = {
          from: process.env.COS_EMAIL,
          to: orderDetails[0].guest_email,
          subject: `Items Cancellation - [Order #${orderDetails[0].order_id}]`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Items Update</title>
            </head>
            <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #ddd;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <img src="https://drive.usercontent.google.com/download?id=10uMrHQslBy2zOrWxaQ03nAvSbwTQZiQZ" alt="Anchorage" style="max-width: 80px; height: auto; margin-bottom: 20px;">
                                        <h1 style="margin: 0; color: #333;">Item Cancellation</h1>
                                        <p style="margin: 10px 0 20px; color: #777;">Order #${orderDetails[0].order_id}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 10px 0; color: #555;">Dear ${orderDetails[0].guest_name},</p>
                                        <p style="margin: 10px 0; color: #555;">We regret to inform you that we are unable to process your order at this time</p>
                                        <p style="margin: 10px 0; color: #555;">We apologize for any inconvenience this may cause. Please feel free to reach out to us if you have any questions or need further assistance.</p>
                                        <p style="margin: 10px 0; color: #555;">You can contact us at  <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a>.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px; text-align: center; background-color: #f4f4f4;">
                                        <p style="margin: 0; color: #777;">Anchorage | <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
          `,
        };

        transporterCOS.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending email:", error);
          } else {
            console.log("Rejection email sent to:", orderDetails[0].guest_email, "response:", info.response);
          }
        });
      }

      resolve({ details: details });
    } catch (error) {
      console.log("Error processing order deletion:", error);
      rejectFn("Error deleting order");
    }
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
      delay,
      guest_email,
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
        guest_email,
        delay,
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
      .then(async (results) => {
        try {
          const res = await fetchOrderDetailsByOrderId(orderid);
          const transformedResults = convertOrders(res);
          const details: OrderDetails[] = Object.values(transformedResults);

          if (status === "Delivered") {
            const mailOptions = {
              from: process.env.COS_EMAIL,
              to: details[0].guest_email,
              subject: `Items Delivered - [Order #${details[0].order_id}]`,
              html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Item Delivered</title>
                </head>
                <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #ddd;">
                                    <tr>
                                        <td style="padding: 20px; text-align: center;">
                                            <img src="https://drive.usercontent.google.com/download?id=10uMrHQslBy2zOrWxaQ03nAvSbwTQZiQZ" alt="Anchorage" style="max-width: 80px; height: auto; margin-bottom: 20px;">
                                            <h1 style="margin: 0; color: #333;">Your Items have been Delivered!</h1>
                                            <p style="margin: 10px 0 20px; color: #777;">Order #${details[0].order_id}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px;">
                                            <p style="margin: 10px 0; color: #555;">Dear ${details[0].guest_name},</p>
                                            <p style="margin: 10px 0; color: #555;">We are happy to inform you that your order has been successfully delivered to your room <strong>${
                                              details[0].room
                                            }</strong>.</p>
                                            <p style="margin: 10px 0; color: #555;">Here is a summary of your order:</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px;">
                                            <h3 style="color: #333;">Order Summary</h3>
                                            <ul style="margin: 0; padding: 0; list-style-type: none;">
                                                ${details[0].items
                                                  .map(
                                                    (item) => `
                                                    <li style="margin: 10px 0;">
                                                        <strong>${item.name}</strong> - Quantity: ${item.qty} - Price: ₹${item.price}
                                                        <br>
                                                        <em>${item.description}</em>
                                                    </li>
                                                `
                                                  )
                                                  .join("")}
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px;">
                                            <p style="margin: 10px 0; color: #555;">If your order has not been delivered, please contact the front desk immediately at <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a>.</p>
                                            <p style="margin: 10px 0; color: #555;">For any other questions or issues, feel free to reach out to us as well:</p>
                                            <p style="margin: 10px 0; color: #555;">
                                                <strong>Customer Support:</strong> <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a><br>
                            
                                            </p>
                                            <p style="margin: 10px 0; color: #555;">Thank you for choosing Anchorage. We look forward to serving you again!</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px; text-align: center; background-color: #f4f4f4;">
                                            <p style="margin: 0; color: #777;">Anchorage | <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a></p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
              `,
            };

            transporterCOS.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log("Error sending email:", error);
              } else {
                console.log("Email sent to: ", details[0].guest_email, " response: ", info.response);
              }
            });
          }
        } catch (error) {
          console.log("Error sending mail: ", error);
        } finally {
          resolve(results);
        }
      })
      .catch((error) => {
        console.log("error updating order status", error);
        reject("Error update order status!");
      });
  });
}

export async function updateItemService(itemDetails: itemDetailsType) {
  return new Promise((resolve, reject) => {
    updateItemModel(itemDetails)
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
export async function fetchBookingByBookingIdService(bookingId: string) {
  return new Promise((resolve, reject) => {
    fetchBookingByBookingIdModel(bookingId)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error deleting item", error);
        reject("Error deleting item!");
      });
  });
}
export async function fetchScheduleByBookingIdService(bookingId: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const movements = await fetchMovementByBookingIdModel(bookingId);
      const booking = await fetchBookingByBookingIdModel(bookingId);
      const schedule: { [key: string]: any } = {};

      movements.forEach(
        (movementData: {
          movement_id: string;
          booking_id: string;
          car_number: string;
          driver: string;
          pickup_location: string;
          pickup_time: Date;
          return_time: Date;
          drop_location: string;
        }) => {
          if (!schedule[movementData.movement_id]) {
            schedule[movementData.movement_id] = {
              type: "Movement",
              dateTime: movementData.pickup_time,
              pickUpLocation: movementData.pickup_location,
              dropLocation: movementData.drop_location,
            };
          }
        }
      );

      schedule[booking.checkin] = {
        type: "Checkin",
        dateTime: booking.checkin,
        pickUpLocation: "",
        dropLocation: "",
      };
      schedule[booking.checkout] = {
        type: "Checkout",
        dateTime: booking.checkout,
        pickUpLocation: "",
        dropLocation: "",
      };

      const ordersArray = Object.values(schedule);
      // Sort the array in ascending order by dateTime
      ordersArray.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

      resolve(ordersArray);
    } catch (error) {
      console.log("error fetching schedule", error);
      reject("Something went wrong");
    }
  });
}
export async function updateDelayService(delay: string, order_id: string) {
  return new Promise((resolve, reject) => {
    updateDelayModel(delay, order_id)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error updating delay", error);
        reject("Error updating delay!");
      });
  });
}
export async function updateFeedbackService(rating: number, feedback: string, order_id: string) {
  return new Promise((resolve, reject) => {
    updateFeedbackModel(rating, feedback, order_id)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error updating feedback", error);
        reject("Error updating feedback!");
      });
  });
}

export async function fetchFeedBackCOSService(booking_id: string) {
  return new Promise((resolve, reject) => {
    fetchFeedbackCOSModel(booking_id)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching feedback COS", error);
        reject("Error fetching feedback COS!");
      });
  });
}

export async function insertFeedBackCOSService(type: string, booking_id: string, rating: number, comment: string) {
  return new Promise((resolve, reject) => {
    const last_modified = new Date();
    insertFeedbackCOSModel(type, booking_id, rating, comment,last_modified)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error inserting feedback COS", error);
        reject("Error inserting feedback COS!");
      });
  });
}
