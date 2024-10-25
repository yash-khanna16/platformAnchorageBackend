import pool from "../db";
import { itemDetailsType, orderType } from "../types/cos";
import {
  addOrderQuery,
  deleteItemQuery,
  deleteOrderDetailsQuery,
  deleteOrderQuery,
  fetchAllItemsQuery,
  fetchAllOrdersQuery,
  fetchAvailabilityOfItemsQuery,
  fetchBookingByEmailIdQuery,
  fetchBookingFromRoomQuery,
  fetchOrderByBookingIdQuery,
  fetchOrderDetailsByOrderIdQuery,
  fetchOTPQuery,
  updateItemQuery,
  updateOrderStatusQuery,
  updateOTPQuery,
  fetchBookingByBookingIdQuery,
  setDelayQuery as updateDelayQuery,
  updateFeedbackQuery,
  fetchFeedbackCOSQuery,
  insertFeedbackCOSQuery,
  fetchItemsQuery,
  fetchCouponDetailsQuery,
  fetchAllCouponsQuery,
  addCategoryQuery,
  fetchCategoryQuery,
  updateCategorySequenceQuery,
  updateCategoryNameQuery,
  fetchBestSellerQuery,
  deleteCategoryQuery,
  getCategoryItemsCountQuery,
  fetchAllCouponsAdminQuery,
  insertCouponUsageFreeItemsQuery,
  putCouponUsageQuery,
  fetchCouponUsageCountQuery,
  fetchCouponFreeItemsQuery,
  fetchItemRestrictionQuery,
  fetchCategoryRestrictionQuery,
  fetchUsageRestrictionQuery,
  fetchUserRestrictionQuery,
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
    const putItemQuery=`INSERT INTO items (item_id,name,description, price, type, category_id, available, time_to_prepare, base_price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`
    await pool.query(putItemQuery, [
      itemDetails.item_id,
      itemDetails.name,
      itemDetails.description,
      itemDetails.price,
      itemDetails.type,
      itemDetails.category_id,
      true,
      itemDetails.time_to_prepare,
      itemDetails.base_price
    ]);
    return { message: "Item inserted successfully!" };
  } catch (error) {
    console.error("Error inserting item", error);
    throw new Error("Error inserting item");
  }
}

export async function addOrderModel(orderDetails: orderType) {
  try {
    // Insert order into the orders table
    const result = await pool.query(addOrderQuery, [
      orderDetails.booking_id,
      orderDetails.room,
      orderDetails.remarks,
      orderDetails.created_at,
      orderDetails.status,
      orderDetails.discount
    ]);
    
    const order_id = result.rows[0].order_id;
    orderDetails.order_id = order_id;

    const fetchItemsQuery = `
      SELECT * FROM public.items
      WHERE item_id = ANY($1::varchar[]);
    `;

    const itemIds = orderDetails.items.map(item => item.item_id);

    const itemsResult = await fetchItemsModel(itemIds);
    const items:itemDetailsType[] = itemsResult;

    const addOrderDetailsQuery = `
      INSERT INTO public.order_details (order_id, item_id, qty, name, description, price, type, category, available, time_to_prepare, base_price)
      VALUES ${orderDetails.items.map((_, index) => 
        `($1, $${index * 10 + 2}, $${index * 10 + 3}, $${index * 10 + 4}, $${index * 10 + 5}, $${index * 10 + 6}, $${index * 10 + 7}, $${index * 10 + 8}, $${index * 10 + 9}, $${index * 10 + 10}, $${index * 10 + 11})`
      ).join(", ")}
    `;

    const orderDetailsValues = orderDetails.items.flatMap((item) => {
      const itemDetails = items.find(i => i.item_id === item.item_id);
      return [
        item.item_id, 
        item.qty,
        itemDetails?.name,
        itemDetails?.description,
        itemDetails?.price,
        itemDetails?.type,
        itemDetails?.category,
        itemDetails?.available,
        itemDetails?.time_to_prepare,
        itemDetails?.base_price
      ];
    });

    // Combine order_id with item details
    const queryValues = [orderDetails.order_id, ...orderDetailsValues];

    // Insert the data into order_details
    await pool.query(addOrderDetailsQuery, queryValues);

    return { message: "Order added successfully!", order_id: orderDetails.order_id };
  } catch (error) {
    console.error("Error adding order", error);
    throw new Error("Error adding order");
  }
}

export async function fetchItemsModel(items: string[]):Promise<itemDetailsType[]> {
  try {
    const res = await pool.query(fetchItemsQuery, [items]);
    return res.rows;
  } catch(error) {
    console.error("Error fetching items, ", error)
    throw new Error("Error fetching items");
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

    if (result.rows.length === 0) {
      return [];
    }

    const orders: { [key: string]: any } = {};
    

    result.rows.forEach((row:{order_id:Number,booking_id:string, item_id:string, name:string, description:string, qty:Number, created_at:Number,price:Number, type: string,status:string, rating: Number, feedback: string,category:string, discount: number}) => {
      const { order_id,booking_id, item_id, name, description, qty, created_at,price, type,status, rating, feedback,category,discount } = row;

      const orderIdKey = order_id.toString();
      if (!orders[orderIdKey]) {
        orders[orderIdKey] = {
          orderId: order_id,
          bookingId: booking_id,
          orderedOn: created_at,
          orderStatus: status,
          rating: rating,
          feedback: feedback,
          discount: discount,
          items: [],
        };
      }

      orders[orderIdKey].items.push({
        itemId: item_id,
        itemName: name,
        itemDescription: description,
        itemQty: qty,
        itemPrice:price,
        itemType: type,
        itemCategory:category
      });
    });


    const ordersArray = Object.values(orders);


    ordersArray.sort((a, b) => b.orderId - a.orderId);

    

    return ordersArray;
  } catch (error) {
    console.error("Error fetching orders", error);
    throw new Error("Error fetching orders");
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
    return { message: "Order status updated successfully" };
  } catch (error) {
    console.error("Error updating order status", error);
    throw new Error("Error updating order status");
  }
}

export async function updateItemModel(itemDetails: itemDetailsType) {
  try {
    
    await pool.query(updateItemQuery, [
      itemDetails.name,
      itemDetails.description,
      itemDetails.price,
      itemDetails.type,
      itemDetails.category_id,
      itemDetails.available,
      itemDetails.time_to_prepare,
      itemDetails.item_id,
      itemDetails.base_price
    ]);
    
    return { message: "Item updated successfully" };
  } catch (error) {
    console.error("Error updating item", error);
    throw new Error("Error updating item");
  }
}

export async function deleteItemModel(itemid: string) {
  try {
    await pool.query(deleteItemQuery, [itemid]);
    return { message: "Item deleted successfully" };
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
    const result = await pool.query(fetchBookingByEmailIdQuery, [emailId]);
    return (result.rows);
  } catch (error) {
    console.error("Error updating item status", error);
    throw new Error("Error updating item status");
  }
}

export async function fetchBookingByBookingIdModel(bookingId: string) {
  try {
    
    const result = await pool.query(fetchBookingByBookingIdQuery, [bookingId]);
    return (result.rows[0]);
  } catch (error) {
    console.error("Error updating item status", error);
    throw new Error("Error updating item status");
  }
}


export async function fetchAvailabilityOfItems(items: string[]) {
  try {
    const result = await pool.query(fetchAvailabilityOfItemsQuery, [items]);
    return result.rows;
  } catch (error) {
    console.error("Error updating item status", error);
    throw new Error("Error updating item status");
  }
}
export async function updateDelayModel(delay: string, order_id: string) {
  try {
    const result = await pool.query(updateDelayQuery, [delay, order_id]);
    return result.rows;
  } catch (error) {
    console.error("Error updating delay", error);
    throw new Error("Error updating delay");
  }
}
export async function updateFeedbackModel(rating: number, feedback: string, order_id: string) {
  try {
    const result = await pool.query(updateFeedbackQuery, [rating, feedback, order_id]);
    return result.rows;
  } catch (error) {
    console.error("Error updating feedback", error);
    throw new Error("Error updating feedback");
  }
}

export async function fetchFeedbackCOSModel(booking_id: string) {
  try {
    const result = await pool.query(fetchFeedbackCOSQuery, [booking_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching feedback cos", error);
    throw new Error("Error fetching feedback cos");
  }
}
export async function insertFeedbackCOSModel(type: string, booking_id: string, rating: number, comment: string, last_modified: Date) {
  try {
    const result = await pool.query(insertFeedbackCOSQuery, [type, booking_id, rating, comment, last_modified]);
    return result.rows;
  } catch (error) {
    console.error("Error updating feedback cos", error);
    throw new Error("Error updating feedback cos");
  }
}
export async function updateCategoryModel(originalCategory: string, newCategory: string,categories:string[]) {
  try {
    await pool.query('BEGIN');

    for (const [index, category] of categories.entries()) {
      await pool.query(updateCategorySequenceQuery, [category, index + 1]);
    }

    await pool.query(updateCategoryNameQuery, [originalCategory, newCategory]);

    await pool.query('COMMIT');

    return { message: 'Category updated successfully' };
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error updating feedback cos", error);
    throw new Error("Error updating feedback cos");
  }
}


export async function fetchCategory(category: string) {
  try {
    const result = await pool.query(fetchCategoryQuery, [category]);
    return result.rows;
  } catch (error) {
    console.error("Error updating feedback cos", error);
    throw new Error("Error updating feedback cos");
  }
}
export async function addCategory(itemDetails:itemDetailsType) {
  try {
    const result = await pool.query(addCategoryQuery, [itemDetails.category_id,itemDetails.category,itemDetails.sequence]);
    return result.rows;
  } catch (error) {
    console.error("Error updating feedback cos", error);
    throw new Error("Error updating feedback cos");
  }
}

export async function fetchAllCouponsModel() {
  try {
    const result = await pool.query(fetchAllCouponsQuery);
    console.log("fetch All coupons: ", result.rows)
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupons", error);
    throw new Error("Error fetching coupons");
  }
}

export async function fetchCouponDetailsModel(coupon_id: string) {
  try {
    const result = await pool.query(fetchCouponDetailsQuery, [coupon_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupon details", error);
    throw new Error("Error fetching coupon details");
  }
}
export async function fetchUserRestrictionModel(coupon_id: string, email: string) {
  try {
    const result = await pool.query(fetchUserRestrictionQuery, [coupon_id, email]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupon user restriction", error);
    throw new Error("Error fetching coupon user restriction");
  }
}
export async function fetchUsageRestrictionModel(coupon_id: string, email: string) {
  try {
    const result = await pool.query(fetchUsageRestrictionQuery, [coupon_id, email]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupon usage restriction", error);
    throw new Error("Error fetching coupon usage restriction");
  }
}
export async function fetchCategoryRestrictionModel(coupon_id: string) {
  try {
    const result = await pool.query(fetchCategoryRestrictionQuery, [coupon_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupon category restriction", error);
    throw new Error("Error fetching coupon category restriction");
  }
}
export async function fetchItemRestrictionModel(coupon_id: string) {
  try {
    const result = await pool.query(fetchItemRestrictionQuery, [coupon_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupon usage restriction", error);
    throw new Error("Error fetching coupon usage restriction");
  }
}

export async function fetchCouponFreeItemsModel(coupon_id: string) {
  try {
    const result = await pool.query(fetchCouponFreeItemsQuery, [coupon_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupon free items ", error);
    throw new Error("Error fetching coupon free items ");
  }
}
export async function fetchCouponUsageCountModel(coupon_id: string) {
  try {
    const result = await pool.query(fetchCouponUsageCountQuery, [coupon_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupon usage ", error);
    throw new Error("Error fetching coupon usage ");
  }
}

export async function putCouponUsageModel(coupon_id: string, email: string, usage_id: string, order_id: number, created_at: string, is_redeemed: boolean ) {
  try {
    const result = await pool.query(putCouponUsageQuery, [
      usage_id,
      coupon_id,
      email,
      order_id,
      is_redeemed,
      created_at,
    ]);
    await pool.query(insertCouponUsageFreeItemsQuery, [usage_id, coupon_id, created_at])
    return {message: "Usage inserted successfully"};
  } catch (error) {
    console.error("Error inserting coupon usage: ", error);
    throw new Error("Error inserting coupon usage");
  }
}

export async function fetchAllCouponsAdminModel() {
  try {
    const result = await pool.query(fetchAllCouponsAdminQuery);
    return result.rows;
  } catch (error) {
    console.error("Error fetching coupons ", error);
    throw new Error("Error fetching coupons");
  }
}


export async function fetchOriginalCategory(item_id:string) {
  try {
    const result = await pool.query(getCategoryItemsCountQuery, [item_id]);
    return result.rows;
  } catch (error) {
    console.error("Error updating feedback cos", error);
    throw new Error("Error updating feedback cos");
  }
}
export async function deleteCategory(item_id:string) {
  try {
    const result = await pool.query(deleteCategoryQuery, [item_id]);
    return result.rows;
  } catch (error) {
    console.error("Error updating feedback cos", error);
    throw new Error("Error updating feedback cos");
  }
}
export async function fetchBestSeller() {
  try {
    const result = await pool.query(fetchBestSellerQuery);
    return result.rows;
  } catch (error) {
    console.error("Error updating feedback cos", error);
    throw new Error("Error updating feedback cos");
  }
}