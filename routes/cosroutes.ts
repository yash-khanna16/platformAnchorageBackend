import { Router } from "express";
import { addOrder, deleteItem, deleteOrder, fetchAllItems, fetchAllOrders, fetchBookingByRoom, fetchOrdersByBookingId, putItem, sendOTPByEmail, updateItem, updateOrderStatus, verifyOTP } from "../controllers/coscontroller";
const router = Router();

router.get("/fetchBookingByRoom", fetchBookingByRoom)
router.get("/sendOTPbyEmail", sendOTPByEmail)
router.get("/fetchAllItems", fetchAllItems)
router.get("/verifyOTP", verifyOTP)
router.post("/addOrder", addOrder)
router.get("/fetchOrdersByBookingId", fetchOrdersByBookingId)

export default router;