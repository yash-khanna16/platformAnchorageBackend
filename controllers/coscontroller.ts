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
} from "../service/cosservice";
import { itemDetailsType, orderType } from "../types/cos";

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
  console.log("email: ", email);
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
    const result = await putItemService(itemDetails);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong, please try again!" });
  }
};

export const addOrder = async (req: Request, res: Response) => {
  try {
    const orderDetails: orderType = req.body.orderDetails;
    console.log(orderDetails);
    const result = await addOrderService(orderDetails);
    console.log(result);
    res.status(200).send(result);
  } catch (error: any) {
    if (error.notAvailable) {
      res.status(401).send(error);
    } else {
      res.status(500).send("Something went wrong!");
    }
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const orderid: string = req.headers.orderid as string;
    const reason: string = req.headers.reason as string;
    const result = await deleteOrderService(orderid, reason);
    console.log(`Order deleted with order id: ${orderid}`);
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
    console.log("body: ", req.body);
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