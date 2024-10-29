import { Request, Response } from "express";
import {
  addOrderService,
  deleteItemService,
  deleteOrderService,
  fetchAllItemsService,
  fetchAllOrdersService,
  fetchBookingFromRoomService,
  fetchOrderByBookingIdService,
  putItemService,
  sendOTPByEmailService,
  updateItemService,
  updateOrderStatusService,
  verifyOTPService,
  fetchBookingByBookingIdService,
  updateDelayService,
  fetchScheduleByBookingIdService,
  updateFeedbackService,
  fetchFeedBackCOSService,
  insertFeedBackCOSService,
  updateCategoryService,
  fetchAllCouponsService,
  validateCouponService,
  fetchAllCouponsAdminService,
  addCouponAdminService,
  deleteCouponAdminService,
  updateCouponAdminService,
  fetchCheckinByRoomService,
  updateCheckinGuestService,
} from "../service/cosservice";
import { adminCoupon, Coupon, FreeItem, itemDetailsType, OrderDetails, orderType } from "../types/cos";

export const fetchBookingByRoom = async (req: Request, res: Response) => {
  const room = req.headers.room as string;
  try {
    const result = await fetchBookingFromRoomService(room);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const sendOTPByEmail = async (req: Request, res: Response) => {
  const email = req.headers.email as string;

  try {
    const result = await sendOTPByEmailService(email);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const verifyOTP = async (req: Request, res: Response) => {
  const email = req.headers.email as string;
  const otp = req.headers.otp as string;
  try {
    const result = await verifyOTPService(email, otp);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const fetchAllItems = async (req: Request, res: Response) => {
  try {
    const result = await fetchAllItemsService();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const putItem = async (req: Request, res: Response) => {
  try {
    const itemDetails: itemDetailsType = req.body.itemDetails;
    console.log(itemDetails)
    const result = await putItemService(itemDetails);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const addOrder = async (req: Request, res: Response) => {
  try {
    const orderDetails: orderType = req.body.orderDetails;
    const result = await addOrderService(orderDetails);

    res.status(200).send(result);
  } catch (error: any) {
    if (error.notAvailable) {
      res.status(401).send(error);
    } else if (error.booking_expired) {
      res.status(415).send(error)
    } else {
      res.status(500).send("Something went wrong!");
    }
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    
    const orderid: string = req.headers.orderid as string;
    const reason: string = req.headers.reason as string;
    const reject: boolean = req.headers.reject === "true";
    const result = await deleteOrderService(orderid, reason, reject);
    
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const fetchOrdersByBookingId = async (req: Request, res: Response) => {
  try {
    const bookingId = req.headers.bookingid as string;
    const result = await fetchOrderByBookingIdService(bookingId);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const fetchAllOrders = async (req: Request, res: Response) => {
  try {
    const result = await fetchAllOrdersService();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderid = req.headers.orderid as string;
    const status = req.headers.status as string;
    const result = await updateOrderStatusService(orderid, status);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const itemdetails: itemDetailsType = req.body.itemDetails as itemDetailsType;
    console.log(itemdetails)
    const result = await updateItemService(itemdetails);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const itemid = req.headers.itemid as string;
    const result = await deleteItemService(itemid);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const fetchBookingByBookingId = async (req: Request, res: Response) => {
  try {
    const bookingId = req.headers.bookingid as string;
    
    const result = await fetchBookingByBookingIdService(bookingId);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const fetchSchedule = async (req: Request, res: Response) => {
  try {
    const bookingId = req.headers.bookingid as string;
    const result = await fetchScheduleByBookingIdService(bookingId);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const updateDelay = async (req: Request, res: Response) => {
  try {
    const delay = req.headers.delay as string;
    const order_id = req.headers.orderid as string
    
    const result = await updateDelayService(delay, order_id);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const rating = Number(req.headers.rating);
    const order_id = req.headers.orderid as string
    const feedback = req.headers.feedback as string;
    
    const result = await updateFeedbackService(rating, feedback, order_id);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const fetchFeedbackCOS = async (req: Request, res: Response) => {
  try {
    const booking_id = req.headers.bookingid as string;
    
    const result = await fetchFeedBackCOSService(booking_id);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const insertFeedbackCOS = async (req: Request, res: Response) => {
  try {
    const booking_id = req.body.bookingid as string;
    const type = req.body.type as string;
    const rating = Number(req.body.rating as string);
    const comment = req.body.comment as string
    
    const result = await insertFeedBackCOSService(type, booking_id, rating, comment);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const originalCategory = req.body.originalCategory as string;
    const newCategory = req.body.newCategory as string;
    const categories=req.body.categories;
    console.log("hello");
    const result = await updateCategoryService(originalCategory, newCategory,categories);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const fetchAllCoupons = async (req: Request, res: Response) => {
  try {    
    const email = req.headers.email as string;
    const result = await fetchAllCouponsService(email);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {    
    const email = req.body.email as string;
    const coupon_id = req.body.coupon_id as string;
    const cart = req.body.cart as orderType;

    console.log("email: ", email, "coupon_id: ", coupon_id, "cart: ", cart)
    const result = await validateCouponService(coupon_id,email, cart);
    res.status(200).send(result);
  } catch (error:any) {
    console.log("result controller: ", error)

    if (error.message==="internal server error") {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      res.status(405).send(error)
    }
  }
};

export const fetchAllCouponsAdmin = async (req: Request, res: Response) => {
  try {    
    const result = await fetchAllCouponsAdminService();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const addCoupon = async (req: Request, res: Response) => {
  try {    
    const couponData:adminCoupon=req.body.couponData;
    const result = await addCouponAdminService(couponData);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const deleteCoupon = async (req: Request, res: Response) => {
  try {    
    const couponData:adminCoupon=req.body.couponData;
    const result = await deleteCouponAdminService(couponData);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const updateCoupon = async (req: Request, res: Response) => {
  try {    
    const couponData:adminCoupon=req.body.couponData;
    const result = await updateCouponAdminService(couponData);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const fetchCheckinByRoom = async (req: Request, res: Response) => {
  try {    
    const room = req.headers.room as string;
    const result = await fetchCheckinByRoomService(room);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};
export const updateCheckinGuest = async (req: Request, res: Response) => {
  try {    
    const booking_id= req.body.booking_id as string;
    const email= req.body.email as string;
    const document_url= req.body.document_url as string;
    
    const result = await updateCheckinGuestService(booking_id,document_url,email);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};



