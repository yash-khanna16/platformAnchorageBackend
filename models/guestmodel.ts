import { QueryResult } from "pg";
import pool from "../db";
import {
  getAllGuests,
  getNamedGuests,
  getAdmin,
  addGuestQuery,
  fetchResv,
  addBookingDetails,
  editBookingDetails,
  serverTime,
  fetchThisRoom,
  fetchGuest,
  fetchRooms,
  deleteBooking,
  findRoomConflict,
  editGuestQuery,
  findRoom,
  addRoom,
  getRoom,
  setActive,
  hideThisRoom,
  EmailTemplate,
  GetEmailTemplate,
  fetchAvailRoom,
  editGuestEmail,
  deleteGuestDetails,
  getUpcoming,
  fetchBookingByBookingIdQuery,
  fetchMealsByDateQuery,
  fetchMealsByBookingIdQuery,
  fetchBookingLogsQuery,
  addToAuditLogs,
  fetchAdminByPass,
  getAuditLogsServiceQuery,
  fetchBookingDetailsQuery,
  fetchPassengerDetailsQuery,
  fetchExternalPassengerDetailsQuery,
  fetchAllFeedbackQuery,
  fetchAllOrderFeedbackQuery,
  fetchAllOrders,
} from "./queries";
import {fetchMovementQueryByMovementId} from "./movementqueries"

type Item = {
  name: string;
  qty: number;
  price: number;
};

type OrderDataType = {
  order_id: number;
  booking_id: string;
  room: string;
  created_at: string;
  status: string;
  remarks: string;
  items: Item[]; // Updated to include an array of items
  name: string;
  email: string;
  phone: string;
  discount: number;
};

interface OrderData {
  order_id: number;
  booking_id: string;
  room: string;
  created_at: string;
  status: string;
  order_remarks: string;
  name: string;
  email: string;
  phone: string;
  item_name: string;
  qty: number;
  price: number;
}

interface GuestData {
  email: string;
  name: string;
  phone: string;
  company: string;
  vessel: string;
  rank: string;
  id: string;
  booking_id: string;
  checkin: string;
  checkout: string;
  meal_veg: number;
  meal_non_veg: number;
  booking_remarks: string;
  additional_info: string;
  room: string;
  breakfast: number;
  document_url: string;
  orders: OrderDataType[];
}

export async function fetchAllGuests(): Promise<GuestData[]> {
  try {
    const guestsResult = await pool.query(getNamedGuests);
    const guests = guestsResult.rows;

    // Fetch all orders
    const ordersResult = await pool.query(fetchAllOrders);
    const orders = ordersResult.rows;

    console.log("orders: ", orders)

    // Create a map to aggregate orders by order_id
    const ordersMap: Record<string, OrderDataType> = {};

    orders.forEach((order:any) => {
      const orderId = order.order_id;

      // Check if the order already exists in the ordersMap
      if (!ordersMap[orderId]) {
        // Initialize the order with guest details and an empty items array
        ordersMap[orderId] = {
          order_id: orderId,
          booking_id: order.booking_id,
          room: order.room,
          created_at: order.created_at,
          status: order.status,
          remarks: order.order_remarks,
          items: [], // Initialize an empty items array
          name: order.name,
          email: order.email,
          phone: order.phone,
          discount: order.discount
        };
      }

      // Add item details to the items array for the corresponding order
      ordersMap[orderId].items.push({
        name: order.item_name,
        qty: order.qty,
        price: order.price,
      });
    });

    // Convert the ordersMap to an array
    const combinedOrders = Object.values(ordersMap);

    // Merge orders into guests
    const guestsWithOrders = guests.map((guest: GuestData) => ({
      ...guest,
      orders: combinedOrders.filter(order => order.booking_id === guest.booking_id) || [],
    }));

    return guestsWithOrders;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchGuests(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getAllGuests);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchAdmin(adminId: string): Promise<QueryResult<any>> {
  try {
    console.log("hello")
    const result = await pool.query(getAdmin, [adminId]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addGuestData(guestData: {
  guestEmail: string;
  guestName: string;
  guestPhone: number;
  guestCompany: string;
  guestVessel: string;
  guestRank: string;
  guestId: string;
}): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(addGuestQuery, [
      guestData.guestEmail,
      guestData.guestName,
      guestData.guestPhone,
      guestData.guestCompany,
      guestData.guestVessel,
      guestData.guestRank,
      guestData.guestId,
    ]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchRoomResv(roomNo: string): Promise<any[]> {
  try {
    // Fetch room reservations
    const resvResult = await pool.query(fetchResv, [roomNo]);
    const reservations = resvResult.rows;

    // Fetch all orders related to the room
    const ordersResult = await pool.query(fetchAllOrders);
    const orders = ordersResult.rows;
    console.log("ORDERS: ", orders)

    // Create a map to aggregate orders by order_id
    const ordersMap: Record<string, OrderDataType> = {};

    orders.forEach((order: any) => {
      const orderId = order.order_id;

      // Check if the order already exists in the ordersMap
      if (!ordersMap[orderId]) {
        // Initialize the order with guest details and an empty items array
        ordersMap[orderId] = {
          order_id: orderId,
          booking_id: order.booking_id,
          room: order.room,
          created_at: order.created_at,
          status: order.status,
          remarks: order.order_remarks,
          items: [], // Initialize an empty items array
          name: order.name,
          email: order.email,
          phone: order.phone,
          discount: order.discount,
        };
      }

      // Add item details to the items array for the corresponding order
      ordersMap[orderId].items.push({
        name: order.item_name,
        qty: order.qty,
        price: order.price,
      });
    });

    // Convert the ordersMap to an array
    const combinedOrders = Object.values(ordersMap);

    // Merge orders into reservations
    const reservationsWithOrders = reservations.map((reservation: any) => ({
      ...reservation,
      orders: combinedOrders.filter(order => order.booking_id === reservation.booking_id) || [],
    }));

    return reservationsWithOrders;
  } catch (error) {
    throw error;
  }
}

export async function addBooking(bookingData: {
  booking_id: string;
  checkin: Date;
  checkout: Date;
  email: string;
  meal_veg: number;
  meal_non_veg: number;
  remarks: string;
  additional: string;
  room: string;
  breakfast: number;
}): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(addBookingDetails, [
      bookingData.booking_id,
      bookingData.checkin,
      bookingData.checkout,
      bookingData.email,
      bookingData.meal_veg,
      bookingData.meal_non_veg,
      bookingData.remarks,
      bookingData.additional,
      bookingData.room,
      bookingData.breakfast,
    ]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function editBooking(bookingData: {
  bookingId: string;
  checkin: Date;
  checkout: Date;
  email: string;
  meal_veg: number;
  meal_non_veg: number;
  remarks: string;
  additional: string;
  breakfast: number;
  room: string;
}): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(editBookingDetails, [
      bookingData.bookingId,
      bookingData.checkin,
      bookingData.checkout,
      bookingData.email,
      bookingData.meal_veg,
      bookingData.meal_non_veg,
      bookingData.remarks,
      bookingData.additional,
      bookingData.breakfast,
      bookingData.room,
    ]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getServerTime(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(serverTime);
    return result.rows[0].server_time;
  } catch (error) {
    throw error;
  }
}

export async function fetchAvailRooms(checkData: {
  checkin: Date;
  checkout: Date;
}): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchAvailRoom, [checkData.checkin, checkData.checkout]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchThisRooms(checkData: {
  checkin: Date;
  checkout: Date;
  room: string;
}): Promise<QueryResult<any>> {
  
  try {
    const result = await pool.query(fetchThisRoom, [
      checkData.checkin,
      checkData.checkout,
      checkData.room,
    ]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function findGuest(email: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchGuest, [email]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function deleteGuest(email: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(deleteGuestDetails, [email]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllRooms(): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchRooms);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function removeBooking(bookingId: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(deleteBooking, [bookingId]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function findConflict(checkData: {
  room: string;
  checkin: Date;
  checkout: Date;
}): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(findRoomConflict, [
      checkData.checkin,
      checkData.checkout,
      checkData.room,
    ]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function editGuest(guestData: {
  guestEmail: string;
  guestName: string;
  guestPhone: number;
  guestCompany: string;
  guestVessel: string;
  guestRank: string;
  guestId: string;
}): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(editGuestQuery, [
      guestData.guestEmail,
      guestData.guestName,
      guestData.guestPhone,
      guestData.guestCompany,
      guestData.guestVessel,
      guestData.guestRank,
      guestData.guestId,
    ]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function updateGuestEmail(guestData: {
  guestEmail: string;
  guestName: string;
  guestPhone: number;
  guestCompany: string;
  guestVessel: string;
  guestRank: string;
  guestOrgEmail: string;
}): Promise<QueryResult<any>> {
  try {
    
    const result = await pool.query(editGuestEmail, [
      guestData.guestEmail,
      guestData.guestName,
      guestData.guestPhone,
      guestData.guestCompany,
      guestData.guestVessel,
      guestData.guestRank,
      guestData.guestOrgEmail,
    ]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function findInstantRoom(date: Date): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(findRoom, [date]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function newRoom(room: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(addRoom, [room]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchRoom(room: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getRoom, [room]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function setIsActive(room: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(setActive, [room]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function hideRoom(room: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(hideThisRoom, [room]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function editEmailTemplate(
  template: string,
  content: string,
  subject: string
): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(EmailTemplate, [template, content, subject]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getEmailTemplate(template_name: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(GetEmailTemplate, [template_name]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchUpcoming(room: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(getUpcoming, [room]);
    return result.rows[0].upcoming;
  } catch (error) {
    throw error;
  }
}

export async function fetchBookingByBookingId(bookingID: string): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(fetchBookingByBookingIdQuery, [bookingID]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function updateMealsModel(mealDetailsList: MealDetails[]) {
  try {
    const values = mealDetailsList
      .map((mealDetails, index) => {
        return `(
        $${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, 
        $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8}
      )`;
      })
      .join(",");

    const upsertQuery = `
      INSERT INTO meals (
        booking_id, date, breakfast_veg, breakfast_nonveg, lunch_veg, lunch_nonveg, dinner_veg, dinner_nonveg
      ) VALUES ${values}
      ON CONFLICT (booking_id, date) DO UPDATE
      SET
        breakfast_veg = EXCLUDED.breakfast_veg,
        breakfast_nonveg = EXCLUDED.breakfast_nonveg,
        lunch_veg = EXCLUDED.lunch_veg,
        lunch_nonveg = EXCLUDED.lunch_nonveg,
        dinner_veg = EXCLUDED.dinner_veg,
        dinner_nonveg = EXCLUDED.dinner_nonveg;
    `;

    const params = mealDetailsList.flatMap((mealDetails) => [
      mealDetails.booking_id,
      mealDetails.date,
      mealDetails.breakfast_veg,
      mealDetails.breakfast_nonveg,
      mealDetails.lunch_veg,
      mealDetails.lunch_nonveg,
      mealDetails.dinner_veg,
      mealDetails.dinner_nonveg,
    ]);

    

    await pool.query(upsertQuery, params);

    // await client.query('COMMIT');
    return { message: "Meals updated successfully!" };
  } catch (error) {
    console.error("Error updating meals:", error);
    throw new Error("Error updating meals");
  }
}

export async function fetchMealsByDateModel(date: string) {
  try {
    const result = await pool.query(fetchMealsByDateQuery, [date]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchMealsByBookingIdModel(bookingId: string) {
  try {
    const result = await pool.query(fetchMealsByBookingIdQuery, [bookingId]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchBookingLogsModel() {
  try {
    const result = await pool.query(fetchBookingLogsQuery);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function addAuditLogsModal(newAuditData:{user:string,endpoint:string,time:Date,auditId:string,name:string,phone:string}) {
  try {
    const result = await pool.query(addToAuditLogs,[newAuditData.auditId,newAuditData.time,newAuditData.user,newAuditData.endpoint,newAuditData.name,newAuditData.phone]);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function fetchAdminByPassword(password:string) {
  try {
    const result = await pool.query(fetchAdminByPass,[password]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}
export async function getAuditLogsServiceModel() {
  try {
    const result = await pool.query(getAuditLogsServiceQuery);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function fetchBookingDetails(bookingId:string) {
  try {
    const result = await pool.query(fetchBookingDetailsQuery,[bookingId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}
export async function fetchPassengerDetails(passengerId:string) {
  try {
    const result = await pool.query(fetchPassengerDetailsQuery,[passengerId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}
export async function fetchExternalPassengerDetails(passengerId:string) {
  try {
    const result = await pool.query(fetchExternalPassengerDetailsQuery,[passengerId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}
export async function fetchMovementDetails(movementId:string) {
  try {
    const result = await pool.query(fetchMovementQueryByMovementId,[movementId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}
export async function fetchAllFeedbackModel() {
  try {
    const resultFeedback = await pool.query(fetchAllFeedbackQuery);
    const resultsOrderFeedback = await pool.query(fetchAllOrderFeedbackQuery);

    console.log("result feedbacK: ", resultFeedback.rows);
    console.log("order feedback: ", resultsOrderFeedback.rows);
    
    // Combine both results
    const combinedResults = [
      ...resultFeedback.rows,
      ...resultsOrderFeedback.rows,
    ];

    return combinedResults;
  } catch (error) {
    throw error;
  }
}