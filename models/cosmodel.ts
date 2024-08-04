import pool from "../db";
import { itemDetailsType, orderType } from "../types/cos";
import {
  addOrderQuery,
  deleteItemQuery,
  deleteOrderDetailsQuery,
  deleteOrderQuery,
  fetchAllItemsQuery,
  fetchAllOrdersQuery,
  fetchBookingByEmailIdQuery,
  fetchBookingFromRoomQuery,
  fetchOrderByBookingIdQuery,
  fetchOrderDetailsByOrderIdQuery,
  fetchOTPQuery,
  putItemQuery,
  updateItemStatusQuery,
  updateOrderStatusQuery,
  updateOTPQuery,
} from "./cosqueries";

export async function fetchBookingByRoomModel(room: string) {
  try {
    const result = await pool.query(fetchBookingFromRoomQuery, [room]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching booking from room", error);
    throw new Error("Error fetching booking from room");
  }
}

export async function updateOTP(email: string, otp: string, expiry: number, tries: number) {
  try {
    const result = await pool.query(updateOTPQuery, [email, otp, expiry, tries]);
    return result.rows;
  } catch (error) {
    console.error("Error updating OTP", error);
    throw new Error("Error updating OTP");
  }
}

export async function fetchOTP(email: string) {
  try {
    const result = await pool.query(fetchOTPQuery, [email]);
    return result.rows;
  } catch (error) {
    console.error("Error updating OTP", error);
    throw new Error("Error updating OTP");
  }
}

export async function fetchAllItemsModel() {
  try {
    const result = await pool.query(fetchAllItemsQuery);
    return result.rows;
  } catch (error) {
    console.error("Error fetching items", error);
    throw new Error("Error fetching items");
  }
}

export async function putItemModel(itemDetails: itemDetailsType) {
  try {
    await pool.query(putItemQuery, [
      itemDetails.item_id,
      itemDetails.name,
      itemDetails.description,
      itemDetails.price,
      itemDetails.type,
      itemDetails.category,
      true,
      itemDetails.time_to_prepare
    ]);
    return { message: "Item inserted successfully!" };
  } catch (error) {
    console.error("Error inserting item", error);
    throw new Error("Error inserting item");
  }
}

export async function addOrderModel(orderDetails: orderType) {
  try {
    console.log("hello")
    const result = await pool.query(addOrderQuery, [
      orderDetails.booking_id,
      orderDetails.room,
      orderDetails.remarks,
      orderDetails.created_at,
      orderDetails.status,
    ]);
    const order_id = result.rows[0].order_id;

    orderDetails.order_id = order_id;

    const addOrderDetailsQuery = `
      INSERT INTO public.order_details (order_id, item_id, qty)
      VALUES ${orderDetails.items.map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`).join(", ")}
    `;

    const orderDetailsValues = orderDetails.items.flatMap((item) => [item.item_id, item.qty]);
    const queryValues = [orderDetails.order_id, ...orderDetailsValues];

    await pool.query(addOrderDetailsQuery, queryValues);

    return { message: "Order added successfully!", order_id: orderDetails.order_id };
  } catch (error) {
    console.error("Error adding order", error);
    throw new Error("Error adding order");
  }
}

export async function deleteOrderModel(orderid: string) {
  try {
    await pool.query(deleteOrderQuery, [orderid]);
    await pool.query(deleteOrderDetailsQuery, [orderid]);

    return { message: "Deleted order successfully!" };
  } catch (error) {
    console.error("Error deleting order", error);
    throw new Error("Error deleting order");
  }
}

export async function fetchOrderByBookingIdModel(bookingId: string) {
  try {
    const result = await pool.query(fetchOrderByBookingIdQuery, [bookingId]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching order", error);
    throw new Error("Error fetching order");
  }
}

export async function fetchAllOrdersModel() {
  try {
    const result = await pool.query(fetchAllOrdersQuery);
    return result.rows;
  } catch (error) {
    console.error("Error fetching order", error);
    throw new Error("Error fetching order");
  }
}

export async function updateOrderStatusModel(orderid: string, status: string) {
  try {
    await pool.query(updateOrderStatusQuery, [status, orderid]);
    return {message: "Order status updated successfully"};
  } catch (error) {
    console.error("Error updating order status", error);
    throw new Error("Error updating order status");
  }
}

export async function updateItemStatusModel(itemid: string, available: boolean) {
  try {
    await pool.query(updateItemStatusQuery, [available, itemid]);
    return {message: "Item status updated successfully"};
  } catch (error) {
    console.error("Error updating item status", error); 
    throw new Error("Error updating item status");
  }
}

export async function deleteItemModel(itemid: string) {
  try {
    await pool.query(deleteItemQuery, [itemid]);
    return {message: "Item deleted successfully"};
  } catch (error) {
    console.error("Error updating item status", error); 
    throw new Error("Error updating item status");
  }
}

export async function fetchOrderDetailsByOrderId(orderid: string) {
  try {
    const result = await pool.query(fetchOrderDetailsByOrderIdQuery, [orderid]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching order", error); 
    throw new Error("Error fetching order");
  }
}

export async function fetchBookingByEmailId(emailId: string) {
  try {
    const  result = await pool.query(fetchBookingByEmailIdQuery, [emailId]);
    return (result.rows);
  } catch (error) {
    console.error("Error updating item status", error); 
    throw new Error("Error updating item status");
  }
}

