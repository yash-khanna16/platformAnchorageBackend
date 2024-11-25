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
  updateCategoryModel,
  fetchAllCouponsModel,
  fetchCouponDetailsModel,
  fetchItemsModel,
  fetchUserRestrictionModel,
  fetchUsageRestrictionModel,
  fetchCategoryRestrictionModel,
  fetchItemRestrictionModel,
  fetchCouponFreeItemsModel,
  putCouponUsageModel,
  fetchCouponUsageCountModel,
  fetchAllCouponsAdminModel,
  fetchCategory,
  addCategory,
  fetchOriginalCategory,
  deleteCategory,
  fetchBestSeller,
  addCouponAdminModel,
  deleteCouponAdminModel,
  updateCouponAdminModel,
  fetchCheckInByRoomModel,
  updateCheckinGuestModel,
} from "../models/cosmodel";
import { fetchMovementByBookingIdModel } from "../models/movementmodel";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import { adminCoupon, Coupon, FreeItem, itemDetailsType, OrderDetails, orderType } from "../types/cos";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "../socket";
import jwt from "jsonwebtoken";
import { couponPendingQueue } from "./priorityqueue";
import {
  fetchMealsByBookingIdAnDateModel as fetchMealsByBookingIdAndDateModel,
  fetchMealsByBookingIdModel,
  findGuest,
  updateMealsModel,
} from "../models/guestmodel";
import { fetchMealsByBookingId } from "../controllers/guestcontroller";

dotenv.config();
const { ROOM_CODE } = process.env;

const maxTries = 10;
const COUPON_MAIL_INTERVAL = 35 * 60 * 1000; // 35 minutes
const CHECK_INTERVAL = 10000; // 10 seconds

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
  // remember to change before pushing code
  host: "us3.smtp.mailhostbox.com",
  port: 587,
  auth: {
    user: process.env.COS_EMAIL_USER,
    pass: process.env.COS_EMAIL_PASSWORD,
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

export async function fetchAllItemsService(bookingId: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const bestSelling = await fetchBestSeller();
      const bestSellingNames = bestSelling.map((item: any) => item.name);

      const allItems = await fetchAllItemsModel();
      let meals: MealDetails = (await fetchMealsByBookingIdAndDateModel(bookingId, new Date()))[0];

      if (!meals) {
        meals = {
          booking_id: bookingId,
          date: new Date(), // Initialize with the current date
          breakfast_veg: 0,
          breakfast_nonveg: 0,
          lunch_veg: 0,
          lunch_nonveg: 0,
          dinner_veg: 0,
          dinner_nonveg: 0,
        };
      }

      const mealCategories = [
        process.env.BREAKFAST_VEG_ID,
        process.env.LUNCH_VEG_ID,
        process.env.DINNER_VEG_ID,
        process.env.BREAKFAST_NON_VEG_ID,
        process.env.LUNCH_NON_VEG_ID,
        process.env.DINNER_NON_VEG_ID,
      ];

      const enrichedItems = allItems.map((item: any) => {
        const isBestSeller = bestSellingNames.includes(item.name);
        let isMealAvailable: boolean | undefined;

        if (mealCategories.includes(item.item_id)) {
          switch (item.item_id) {
            case process.env.BREAKFAST_VEG_ID:
              isMealAvailable = meals.breakfast_veg > 0 || meals.breakfast_nonveg > 0 ? false : true;
              break;
            case process.env.BREAKFAST_NON_VEG_ID:
              isMealAvailable = meals.breakfast_veg > 0 || meals.breakfast_nonveg > 0 ? false : true;
              break;
            case process.env.LUNCH_VEG_ID:
              isMealAvailable = meals.lunch_veg > 0 || meals.lunch_nonveg > 0 ? false : true;
              break;
            case process.env.LUNCH_NON_VEG_ID:
              isMealAvailable = meals.lunch_veg > 0 || meals.lunch_nonveg > 0 ? false : true;
              break;
            case process.env.DINNER_VEG_ID:
              isMealAvailable = meals.dinner_veg > 0 || meals.dinner_nonveg > 0 ? false : true;
              break;
            case process.env.DINNER_NON_VEG_ID:
              isMealAvailable = meals.dinner_veg > 0 || meals.dinner_nonveg > 0 ? false : true;
              break;
            default:
              break;
          }
        }
        return {
          ...item,
          bestSeller: isBestSeller,
          ...(isMealAvailable !== undefined && { isMealAvailable }),
        };
      });

      resolve(enrichedItems);
    } catch (error) {
      console.log("Error fetching all items", error);
      reject("Error fetching all items");
    }
  });
}

export async function putItemService(itemDetails: itemDetailsType) {
  return new Promise(async (resolve, reject) => {
    itemDetails.item_id = uuidv4();
    const categoryAvailable = await fetchCategory(itemDetails.category);
    if (categoryAvailable.length === 0) {
      itemDetails.category_id = uuidv4();
      await addCategory(itemDetails);
      putItemModel(itemDetails)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          console.log("error inserting  items", error);
          reject("Error inserting item");
        });
    } else {
      itemDetails.sequence = categoryAvailable[0].sequence;
      itemDetails.category_id = categoryAvailable[0].category_id;
      console.log(itemDetails);
      putItemModel(itemDetails)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          console.log("error inserting  items", error);
          reject("Error inserting item");
        });
    }
  });
}

async function checkMealsRedemption(
  booking_id: string,
  date: Date,
  items: { item_id: string; qty: number }[]
): Promise<{ canRedeemAll: boolean; redeemedMeals: string[] }> {
  const mealCategories = {
    breakfast: [process.env.BREAKFAST_VEG_ID, process.env.BREAKFAST_NON_VEG_ID],
    lunch: [process.env.LUNCH_VEG_ID, process.env.LUNCH_NON_VEG_ID],
    dinner: [process.env.DINNER_VEG_ID, process.env.DINNER_NON_VEG_ID],
  };

  // Group meal items by category
  const mealItems = items.filter((item) => Object.values(mealCategories).flat().includes(item.item_id));

  if (mealItems.length === 0) {
    return { canRedeemAll: true, redeemedMeals: [] }; // No meal items; no meals redeemed
  }

  const meals = (await fetchMealsByBookingIdAndDateModel(booking_id, date))[0];
  console.log("fetched Meals: ", meals)
  const currentMeals = meals || {
    breakfast_veg: 0,
    breakfast_nonveg: 0,
    lunch_veg: 0,
    lunch_nonveg: 0,
    dinner_veg: 0,
    dinner_nonveg: 0,
  };

  const redeemedMeals: string[] = [];
  let canRedeemAll = true;


  for (const [mealType, [vegId, nonVegId]] of Object.entries(mealCategories)) {
    const vegQty = mealItems.find((item) => item.item_id === vegId)?.qty || 0;
    const nonVegQty = mealItems.find((item) => item.item_id === nonVegId)?.qty || 0;

    console.log("mealType: ", mealType)

    console.log("veg qty: ", vegQty)
    console.log("nonVeg qty: ", nonVegQty)

    // Check if the current meal type has been redeemed
    if ((currentMeals[`${mealType}_veg`] || 0) + vegQty > 0 || (currentMeals[`${mealType}_nonveg`] || 0) + nonVegQty > 0) {
      redeemedMeals.push(mealType);
    }

    // Check if the daily limit is exceeded for this meal type
    const totalQty = (currentMeals[`${mealType}_veg`] || 0) + (currentMeals[`${mealType}_nonveg`] || 0) + vegQty + nonVegQty;

    console.log("total Qty: ", totalQty)
    if (totalQty > 1) {
      canRedeemAll = false;
    }
  }

  return { canRedeemAll, redeemedMeals };
}

// Function to update the meal details in the database
async function updateMeals(booking_id: string, items: { item_id: string; qty: number }[], redemptionDate: Date) {
  let meals: MealDetails = (await fetchMealsByBookingIdAndDateModel(booking_id, redemptionDate))[0];

  if (!meals) {
    meals = {
      booking_id: booking_id,
      date: redemptionDate,
      breakfast_veg: 0,
      breakfast_nonveg: 0,
      lunch_veg: 0,
      lunch_nonveg: 0,
      dinner_veg: 0,
      dinner_nonveg: 0,
    };
  }

  items.forEach((item) => {
    switch (item.item_id) {
      case process.env.BREAKFAST_VEG_ID:
        meals.breakfast_veg = (meals.breakfast_veg || 0) + item.qty;
        break;
      case process.env.BREAKFAST_NON_VEG_ID:
        meals.breakfast_nonveg = (meals.breakfast_nonveg || 0) + item.qty;
        break;
      case process.env.LUNCH_VEG_ID:
        meals.lunch_veg = (meals.lunch_veg || 0) + item.qty;
        break;
      case process.env.LUNCH_NON_VEG_ID:
        meals.lunch_nonveg = (meals.lunch_nonveg || 0) + item.qty;
        break;
      case process.env.DINNER_VEG_ID:
        meals.dinner_veg = (meals.dinner_veg || 0) + item.qty;
        break;
      case process.env.DINNER_NON_VEG_ID:
        meals.dinner_nonveg = (meals.dinner_nonveg || 0) + item.qty;
        break;
      default:
        break;
    }
  });

  meals.date = new Date(meals.date); // Ensure the date field is correctly set

  try {
    await updateMealsModel([meals]);
    console.log("Meals successfully updated.");
  } catch (error) {
    console.error("Failed to update meals: ", error);
    throw new Error("Failed to update meals in the database.");
  }
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
            .then(async (availability) => {
              let notAvailable: { item_id: string; name: string; available: boolean }[] = [];
              availability.map((item: { item_id: string; name: string; available: boolean }) => {
                if (!item.available) notAvailable.push(item);
              });

              if (notAvailable.length === 0) {
                // const maxPreparationTime = Math.max(...order.items.map((item) => item.time_to_prepare));
                const redemptionDate = new Date(
                  new Date().getTime() +
                    order.time_to_prepare * 60 * 1000 + // Convert minutes to milliseconds
                    order.delay * 60 * 1000
                );

                // Call the function to check meal redemption
                const mealStatus = await checkMealsRedemption(order.booking_id, redemptionDate, order.items);

                if (mealStatus.canRedeemAll) {
                  updateMeals(order.booking_id, order.items, redemptionDate)
                    .then(() => {
                      if (order.coupon_id) {
                        validateCouponService(order.coupon_id, order.email, order)
                          .then((res) => {
                            order.discount = res.discount;
                            placeOrder(order, booking)
                              .then((res) => {
                                const coupon_usage_id = uuidv4();
                                putCouponUsageModel(
                                  order.coupon_id,
                                  order.email,
                                  coupon_usage_id,
                                  res.details.order_id,
                                  new Date().toISOString(),
                                  true
                                )
                                  .then(() => {
                                    console.log("Coupon usage inserted successfully!");
                                  })
                                  .catch((error) => {
                                    console.log("Error inserting coupon usage: ", error);
                                  })
                                  .finally(() => {
                                    resolve(res);
                                  });
                              })
                              .catch((error) => {
                                reject(error);
                              });
                          })
                          .catch((error) => {
                            if (error.message === "internal server error") {
                              reject("Error validating coupon");
                            } else {
                              reject(error.message);
                            }
                          });
                      } else {
                        order.discount = 0;
                        placeOrder(order, booking)
                          .then((res) => {
                            resolve(res);
                          })
                          .catch((error) => {
                            reject(error);
                          });
                      }
                    })
                    .catch((error) => {
                      console.log("Error updating meals ", error);
                      reject("Error updating meals");
                    });
                } else {
                  console.log("Can't redeem these meals: ", mealStatus.redeemedMeals);
                  const formattedMeals = mealStatus.redeemedMeals.join(", ");
                  reject({
                    mealsRedeemed: `The following meals have already been redeemed today: ${formattedMeals}`,
                  });
                }
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

function placeOrder(order: orderType, booking: any): Promise<any> {
  return new Promise((resolve, reject) => {
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
            cc: process.env.OWNER_EMAIL,
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
                                                  <strong>Order SubTotal:</strong> ₹${details[0].items.reduce(
                                                    (total, item) => total + item.price * item.qty,
                                                    0
                                                  )}<br>
                                                              <strong>Discount:</strong> ₹${order.discount}<br>
                                                              <strong>Platform Fee:</strong> ₹2<br>
                                                              <strong>Order Total:</strong> ₹${
                                                                details[0].items.reduce(
                                                                  (total, item) => total + item.price * item.qty,
                                                                  0
                                                                ) -
                                                                order.discount +
                                                                2
                                                              }<br>
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
                                                                60000 +
                                                              5 * 60 * 60 * 1000 +
                                                              30 * 60 * 1000
                                                          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                      </p>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 20px;">
                                                      <p style="margin: 10px 0; color: #555;">We are currently processing your order, and you can expect it to be ready in approximately <strong>${details[0].items.reduce(
                                                        (max, item) => (item.time_to_prepare > max ? item.time_to_prepare : max),
                                                        0
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

const getCurrentDateInYYYYMMDD = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export async function updateOrderStatusService(orderid: string, status: string) {
  return new Promise((resolve, reject) => {
    updateOrderStatusModel(orderid, status)
      .then(async (results) => {
        try {
          const res = await fetchOrderDetailsByOrderId(orderid);
          const transformedResults = convertOrders(res);
          const details: OrderDetails[] = Object.values(transformedResults);
          console.log("res: ", details[0]);

          if (status === "Delivered") {
            // let meals: MealDetails = (await fetchMealsByBookingIdAndDateModel(details[0].booking_id, new Date()))[0];

            // if (!meals) {
            //   meals = {
            //     booking_id: details[0].booking_id,
            //     date: new Date(),
            //     breakfast_veg: 0,
            //     breakfast_nonveg: 0,
            //     lunch_veg: 0,
            //     lunch_nonveg: 0,
            //     dinner_veg: 0,
            //     dinner_nonveg: 0,
            //   };
            // }
            // console.log("meals: ", meals);

            // details[0].items.map((item) => {
            //   switch (item.item_id) {
            //     case process.env.BREAKFAST_VEG_ID:
            //       meals.breakfast_veg = (meals.breakfast_veg || 0) + item.qty;
            //       break;
            //     case process.env.LUNCH_VEG_ID:
            //       meals.lunch_veg = (meals.lunch_veg || 0) + item.qty;
            //       break;
            //     case process.env.DINNER_VEG_ID:
            //       meals.dinner_veg = (meals.dinner_veg || 0) + item.qty;
            //       break;
            //     case process.env.BREAKFAST_NON_VEG_ID:
            //       meals.breakfast_nonveg = (meals.breakfast_nonveg || 0) + item.qty;
            //       break;
            //     case process.env.LUNCH_NON_VEG_ID:
            //       meals.lunch_nonveg = (meals.lunch_nonveg || 0) + item.qty;
            //       break;
            //     case process.env.DINNER_NON_VEG_ID:
            //       meals.dinner_nonveg = (meals.dinner_nonveg || 0) + item.qty;
            //       break;
            //     default:
            //       break; // Handle items that don't match any meal type
            //   }
            // });
            // meals.date = new Date(meals.date);
            // console.log("updating meals");

            // try {
            //   await updateMealsModel([meals]);
            //   console.log("meals updated...");
            // } catch (error) {
            //   console.log("failed to update meals: ", error);
            // }
            // // }

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
  return new Promise(async (resolve, reject) => {
    const categoryAvailable = await fetchCategory(itemDetails.category);
    const originalCategory = await fetchOriginalCategory(itemDetails.item_id);
    if (originalCategory.length < 2) {
      await deleteCategory(itemDetails.item_id);
    }
    if (categoryAvailable.length === 0) {
      itemDetails.category_id = uuidv4();
      await addCategory(itemDetails);
      updateItemModel(itemDetails)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          console.log("error updating item status", error);
          reject("Error update item status!");
        });
    } else {
      console.log(categoryAvailable);
      itemDetails.category_id = categoryAvailable[0].category_id;
      updateItemModel(itemDetails)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          console.log("error updating item status", error);
          reject("Error update item status!");
        });
    }
  });
}

export async function deleteItemService(itemid: string) {
  return new Promise(async (resolve, reject) => {
    const originalCategory = await fetchOriginalCategory(itemid);
    if (originalCategory.length < 2) {
      await deleteCategory(itemid);
    }
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
    insertFeedbackCOSModel(type, booking_id, rating, comment, last_modified)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error inserting feedback COS", error);
        reject("Error inserting feedback COS!");
      });
  });
}
export async function updateCategoryService(originalCategory: string, newCategory: string, categories: string[]) {
  return new Promise((resolve, reject) => {
    updateCategoryModel(originalCategory, newCategory, categories)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error inserting feedback COS", error);
        reject("Error inserting feedback COS!");
      });
  });
}
export async function fetchAllCouponsService(email: string) {
  return new Promise((resolve, reject) => {
    const last_modified = new Date();
    fetchAllCouponsModel(email)
      .then((results) => {
        console.log("results: ", results);
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching coupons", error);
        reject("Error fetching coupons!");
      });
  });
}

export async function validateCouponService(
  coupon_id: string,
  email: string,
  cart: orderType
): Promise<{ discount: number; freeItems: { item_id: string; qty: number }[] }> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("fetching details of coupon_id: ", coupon_id);
      const coupon: Coupon = (await fetchCouponDetailsModel(coupon_id))[0];

      if (!isCouponValid(coupon)) {
        reject({ message: "Invalid Coupon" });
        return;
      }

      const couponUsageRestriction = await checkCouponUsageRestriction(coupon);
      if (!couponUsageRestriction) {
        reject({ message: "This coupon has reached its usage limit." });
        return;
      }

      const cartContraints = await checkCartConstraints(coupon, cart);
      if (cartContraints && cartContraints < 0) {
        reject({ message: `Add item worth ₹${-cartContraints} to claim this coupon.` });
        return;
      }

      const userRestriction = await checkUserRestriction(coupon_id, email);
      if (!userRestriction) {
        reject({ message: "You are ineligible to use this coupon." });
        return;
      }

      const usageRestriction = await checkUsageRestriction(coupon, email);
      if (!usageRestriction) {
        reject({ message: "This Coupon has already been redeemed." });
        return;
      }

      const categoryRestriction = await checkCategoryRestriction(coupon_id, cart);
      if (!categoryRestriction.hasMatchingCategory) {
        const allowedCategories = categoryRestriction.allowedCategories.map((category) => `"${category.category}"`);

        let message;
        if (allowedCategories.length === 1) {
          message = `Add item from ${allowedCategories[0]} to your cart to claim this coupon.`;
        } else if (allowedCategories.length === 2) {
          message = `Add item from ${allowedCategories.join(" or ")} to your cart to claim this coupon.`;
        } else {
          const lastCategory = allowedCategories.pop();
          message = `Add item from ${allowedCategories.join(", ")} or ${lastCategory} to your cart to claim this coupon.`;
        }

        reject({ message });
        return;
      }

      const itemRestriction = await checkItemRestriction(coupon_id, cart);
      if (!itemRestriction.hasMatchingItem) {
        const allowedItems = itemRestriction.allowedItems.map((item) => `"${item.qty_to_add}x ${item.name}"`);

        let message;
        if (allowedItems.length === 1) {
          message = `Add ${allowedItems[0]} to your cart to claim this coupon.`;
        } else if (allowedItems.length === 2) {
          message = `Add ${allowedItems.join(" and ")} to your cart to claim this coupon.`;
        } else {
          const lastItem = allowedItems.pop();
          message = `Add ${allowedItems.join(", ")} or ${lastItem} to your cart to claim this coupon.`;
        }

        reject({ message });
        return;
      }

      // coupon is now validated

      const allItemIds = cart.items.map((item) => item.item_id); // Get existing cart item IDs

      if (coupon.coupon_type === "free_item") {
        const freeItems: FreeItem[] = await fetchCouponFreeItemsModel(coupon.coupon_id);
        let discount = 0;
        const updatedFreeItems: FreeItem[] = [];

        console.log("free item: ", freeItems);

        freeItems.forEach((freeItem) => {
          updatedFreeItems.push({ ...freeItem });
          discount += freeItem.price * freeItem.qty;
        });

        resolve({ discount: discount, freeItems: updatedFreeItems });
        console.log("hello: ", { discount: discount, freeItems: updatedFreeItems });
        return;
      } else if (coupon.coupon_type === "flat_discount") {
        resolve({ discount: Number(coupon.discount_value), freeItems: [] });
        return;
      } else if (coupon.coupon_type === "percentage_discount" && coupon.percentage_discount) {
        const cartTotal = await calculateCartValue(cart);
        let discount = 0;

        if (coupon.max_discount) {
          discount = Math.min(coupon.max_discount, (cartTotal * coupon.percentage_discount) / 100);
        } else {
          discount = (cartTotal * coupon.percentage_discount) / 100;
        }

        resolve({ discount: discount, freeItems: [] });
        return;
      } else {
        console.log("here here");
        reject({ message: "Invalid Coupon" });
        return;
      }
    } catch (error) {
      console.log("Internal Server Error", error);
      reject("internal server error");
    }
  });
}

async function isCouponValid(coupon: Coupon) {
  if (!coupon || coupon.is_active === false) {
    return false;
  }

  const currentDate = new Date();

  const isStartDateValid = !coupon.start_date || new Date(coupon.start_date) <= currentDate;
  const isEndDateValid = !coupon.end_date || new Date(coupon.end_date) >= currentDate;

  return isStartDateValid && isEndDateValid;
}

async function checkCouponUsageRestriction(coupon: Coupon) {
  try {
    if (!coupon.usage_limit) return true;

    const res = await fetchCouponUsageCountModel(coupon.coupon_id);
    if (res.length === 0) return true;

    const count = Number(res[0].usage_count);
    return count < coupon.usage_limit;
  } catch (error) {
    console.log("Error fetching coupon usage", error);
    throw new Error("Error fetching coupon usage");
  }
}

async function checkCartConstraints(coupon: Coupon, cart: orderType): Promise<number | undefined> {
  try {
    const cartTotal = await calculateCartValue(cart);
    if (!coupon.min_order_value) return 0;
    return cartTotal - coupon.min_order_value;
  } catch (error) {
    console.log("Error fetching cart items", error);
    throw new Error("Error fetching cart items");
  }
}

async function calculateCartValue(cart: orderType): Promise<number> {
  try {
    let cartTotal = 0;

    const itemIds = cart.items.map((item) => item.item_id);
    const itemsResult: itemDetailsType[] = await fetchItemsModel(itemIds);
    cart.items.forEach((cartItem) => {
      const matchedItem = itemsResult.find((dbItem) => dbItem.item_id === cartItem.item_id);
      if (matchedItem) {
        cartTotal += matchedItem.price * cartItem.qty;
      }
    });
    return cartTotal;
  } catch (error) {
    console.log("Error fetching cart items", error);
    throw new Error("Error fetching cart items");
  }
}

async function checkUserRestriction(coupon_id: string, email: string): Promise<boolean> {
  try {
    const result = await fetchUserRestrictionModel(coupon_id);
    return result.length === 0 || result.some((user: any) => user.user_email === email);
  } catch (error) {
    console.log("Error fetching user restriction ", error);
    throw new Error("Error fetching user restriction");
  }
}

async function checkUsageRestriction(coupon: Coupon, email: string): Promise<boolean> {
  try {
    const result = await fetchUsageRestrictionModel(coupon.coupon_id, email);
    if (!coupon.user_usage_limit) return true;
    return result.length < coupon.user_usage_limit;
  } catch (error) {
    console.log("Error fetching usage restriction ", error);
    throw new Error("Error fetching usage restriction");
  }
}

async function checkCategoryRestriction(
  coupon_id: string,
  cart: orderType
): Promise<{ hasMatchingCategory: boolean; allowedCategories: { category_id: string; category: string }[] }> {
  try {
    const result = await fetchCategoryRestrictionModel(coupon_id);
    console.log("result category: ", result);
    if (result.length === 0) return { hasMatchingCategory: true, allowedCategories: [] };

    const itemIds = cart.items.map((item) => item.item_id);
    const itemsResult: itemDetailsType[] = await fetchItemsModel(itemIds);

    const allowedCategories = result
      .filter((restriction: { category_id: string; is_allowed: boolean }) => restriction.is_allowed)
      .map((restriction: { category_id: string; category: string }) => ({
        category_id: restriction.category_id,
        category: restriction.category,
      }));

    const hasMatchingCategory = itemsResult.some((item) =>
      allowedCategories.some(
        (allowedCategory: { category_id: string; category: string }) => allowedCategory.category_id === item.category_id
      )
    );

    return { hasMatchingCategory, allowedCategories };
  } catch (error) {
    console.log("Error fetching item restriction", error);
    throw new Error("Error fetching item restriction");
  }
}

async function checkItemRestriction(
  coupon_id: string,
  cart: orderType
): Promise<{ hasMatchingItem: boolean; allowedItems: { item_id: string; name: string; qty: number; qty_to_add: number }[] }> {
  try {
    const result = await fetchItemRestrictionModel(coupon_id);

    // If no restrictions, assume all items are allowed
    if (result.length === 0) return { hasMatchingItem: true, allowedItems: [] };

    const cartItemsById = new Map(cart.items.map((item) => [item.item_id, item.qty]));
    const allowedItems = result.map((restriction: { item_id: string; name: string; qty: number }) => {
      const cartQty = cartItemsById.get(restriction.item_id) || 0;
      const qty_to_add = Math.max(restriction.qty - cartQty, 0);
      return {
        item_id: restriction.item_id,
        name: restriction.name,
        qty: restriction.qty,
        qty_to_add,
      };
    });

    // Check if all restricted items have quantities less than or equal to quantities in cart
    const hasMatchingItem = allowedItems.every((allowedItem: any) => {
      const cartQty = cartItemsById.get(allowedItem.item_id) || 0;
      return allowedItem.qty <= cartQty;
    });

    return { hasMatchingItem, allowedItems };
  } catch (error) {
    console.log("Error fetching item restriction", error);
    throw new Error("Error fetching item restriction");
  }
}

export async function fetchAllCouponsAdminService() {
  return new Promise((resolve, reject) => {
    const last_modified = new Date();
    fetchAllCouponsAdminModel()
      .then((results) => {
        console.log("results: ", transformCoupons(results));
        resolve(transformCoupons(results));
      })
      .catch((error) => {
        console.log("error fetching coupons", error);
        reject("Error fetching coupons!");
      });
  });
}
export function transformCoupons(coupons: any): any[] {
  const transformedCoupons: any = {};

  coupons.forEach((coupon: any) => {
    const { coupon_id } = coupon;

    if (!transformedCoupons[coupon_id]) {
      // Initialize the coupon entry with empty arrays and Map for unique applicable_items
      transformedCoupons[coupon_id] = {
        ...coupon,
        free_items: new Map<
          string,
          {
            // Use Map to ensure unique free_items by item_id
            item_id: string;
            qty: number;
            name: string;
            price: number;
            type: string;
            category_id: string;
            available: boolean;
            time_to_prepare: number;
            base_price: number;
          }
        >(),
        applicable_category: new Set<string>(), // Set for unique category names
        applicable_items: new Map<string, { item_id: string; qty: number }>(), // Map for unique item_id with qty
        selectedGuest: new Set<string>(), // Set for unique user emails
      };
    }

    // Add to free_items map if the coupon type is 'free_item' and it has an associated item
    if (coupon.free_item_id && !transformedCoupons[coupon_id].free_items.has(coupon.free_item_id)) {
      transformedCoupons[coupon_id].free_items.set(coupon.free_item_id, {
        item_id: coupon.free_item_id,
        qty: coupon.free_item_qty ?? 0,
        name: coupon.free_item_name ?? "",
        price: coupon.free_item_price ?? 0,
        type: coupon.free_item_type ?? "",
        category_id: coupon.free_item_category_id ?? "",
        available: coupon.free_item_available ?? false,
        time_to_prepare: coupon.free_item_time_to_prepare ?? 0,
        base_price: coupon.free_item_base_price ?? 0,
      });
    }

    // Add unique category name to applicable_category set
    if (coupon.restricted_category_name) {
      transformedCoupons[coupon_id].applicable_category.add(coupon.restricted_category_name);
    }

    // Add unique item to applicable_items map based on item_id
    if (coupon.restricted_item_id) {
      transformedCoupons[coupon_id].applicable_items.set(coupon.restricted_item_id, {
        item_id: coupon.restricted_item_id,
        qty: coupon.qty ?? 0,
      });
    }

    // Add unique user email to selectedGuest set
    if (coupon.restricted_user_email) {
      transformedCoupons[coupon_id].selectedGuest.add(coupon.restricted_user_email);
    }
  });

  // Convert Set and Map objects back to arrays for each coupon
  Object.values(transformedCoupons).forEach((coupon: any) => {
    coupon.free_items = Array.from(coupon.free_items.values()); // Convert free_items Map to array of objects
    coupon.applicable_categories = Array.from(coupon.applicable_category);
    coupon.applicable_items = Array.from(coupon.applicable_items.values()); // Convert Map to array of objects
    coupon.selectedGuests = Array.from(coupon.selectedGuest);
  });

  // Convert the transformedCoupons object back into an array
  return Object.values(transformedCoupons);
}

export async function fetchCheckinByRoomService(room: string) {
  return new Promise((resolve, reject) => {
    fetchCheckInByRoomModel(room)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching checkin by room", error);
        reject("Error fetching checkin by room!");
      });
  });
}

export async function updateCheckinGuestService(
  booking_id: string,
  document_url: string,
  email: string,
  room: string,
  name: string,
  document_url_back: string | null
) {
  return new Promise((resolve, reject) => {
    updateCheckinGuestModel(booking_id, document_url, email, room, document_url_back)
    .then((results) => {
      const coupon: Coupon = results.coupon;
      couponPendingQueue.enqueue({
        room: room,
        coupon_code: coupon.code,
        coupon_id: coupon.coupon_id,
        description: coupon.description,
        email: email,
        date_created: new Date(),
        name: name,
      });
      resolve({ message: results.message });
    })
    .catch((error) => {
      console.log("error updating checkin ", error);
      reject("Error updating checkin ");
    });
  });
}

export function addCouponAdminService(couponData: adminCoupon): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      couponData.coupon_id = uuidv4();
      couponData.created_at = new Date().toISOString();
      couponData.modified_at = new Date().toISOString();
      couponData.restriction_id = uuidv4();
      const result = await addCouponAdminModel(couponData);
      resolve({ message: "Coupon added succesfully" });
      return;
    } catch (error) {
      console.log("Error adding coupon ", error);
      reject("Error entering coupon");
    }
  });
}
export function deleteCouponAdminService(coupon_id: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      await deleteCouponAdminModel(coupon_id);
      resolve({ message: "Coupon deleted successfully" });
      return;
    } catch (error) {
      console.log("Error deleting successfully ", error);
      reject("Error deleting coupon");
    }
  });
}
export function updateCouponAdminService(couponData: adminCoupon): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      couponData.modified_at = new Date().toISOString();
      await updateCouponAdminModel(couponData);
      resolve({ message: "Coupon updated succesfully" });
      return;
    } catch (error) {
      console.log("Error updating coupon ", error);
      reject("Error updating coupon");
    }
  });
}

function monitorCouponQueue() {
  setInterval(async () => {
    const coupon = couponPendingQueue.peek();
    
    if (coupon) {
      const timeElapsed = Date.now() - coupon.date_created.getTime();
      
      if (timeElapsed > COUPON_MAIL_INTERVAL) {
        console.log("Sending coupon pending mail to: ", coupon.email);
        const mailOptions = {
          from: process.env.COS_EMAIL,
          to: coupon.email,
          subject: "Your Exclusive Coupon Awaits - Don’t Miss Out!",
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Coupon Reminder</title>
          </head>
          <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
          <td align="center" style="padding: 20px;">
          <table width="470" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <!-- Welcome Message -->
          <tr>
          <td style="padding: 20px; text-align: center;">
          <p style="color: #555; font-size: 16px; margin: 0;">Hi <span style="font-weight: 600; ">${coupon.name}</span>,</p>
          <p style="font-size: 24px; font-weight: bold; color: #e3342f; text-transform: uppercase; margin: 10px 0;">Your Check-in is Complete!</p>
          <p style="color: #555; font-size: 16px; margin: 0;">We’re excited to offer you a special coupon!</p>
          </td>
          </tr>
          
          <!-- Coupon Section -->
          <tr>
          <td style="padding: 0 20px 10px;">
          <div style="background: linear-gradient(to right, #fef2f2, #fff7ed); border-radius: 12px; padding: 20px;">
          <p style="color: #64748b; font-size: 16px; font-weight: 500; text-align: center; margin: 0 0 15px;">${coupon.description}</p>
          <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; text-align: center; box-shadow: 0px 1px 4px rgba(0,0,0,0.1);">
          <span style="font-size: 24px; font-weight: bold; color: #e3342f;">${coupon.coupon_code}</span>
          </div>
          </div>
          </td>
          </tr>
          
          <!-- Claim Button -->
          <tr>
          <td style="padding: 0 20px 20px;">
          <a href="https://orders.platformanchorage.com/home?room=${coupon.room}" style="display: block; background-color: #e3342f; color: #ffffff; font-size: 16px; font-weight: bold; text-align: center; text-decoration: none; padding: 12px; border-radius: 8px; transition: background-color 0.3s; margin-top: 15px;">
          Tap here to claim your coupon and enjoy the perks!
          </a>
          </td>
          </tr>
          
          <!-- Footer -->
          <tr>
          
          <td style="padding: 20px; text-align: center; background-color: #f4f4f4;color: #777; font-weight: 500">
          <p style="margin: 0 0; color: #777; font-weight: 500">Thank you for choosing Anchorage. We look forward to serving you again!</p>
          </td>
          </tr>
          <tr>
          <td style="padding: 0 20px 20px; text-align: center; background-color: #f4f4f4;">
          <p style="margin: 0; color: #777;">Anchorage | <a href="tel:+91 8287340468" style="color: #0073e6;">+91 8287340468</a></p>
          </td>
          </p>
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
            console.log("Coupon reminder email sent to: ", coupon.email, " response: ", info.response);
          }
        });
        
        couponPendingQueue.dequeue(); // Remove the processed coupon
      }
    }
  }, CHECK_INTERVAL);
}

monitorCouponQueue();

export async function fetchGuestDataByEmailService(guestEmail: string) {
  return new Promise((resolve, reject) => {
    findGuest(guestEmail)
      .then((results) => {
        resolve(results.rows[0]);
      })
      .catch((error) => {
        console.log("error fetching checkin by room", error);
        reject("Error fetching checkin by room!");
      });
  });
}