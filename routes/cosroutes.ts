import { Router } from "express";
import { addOrder, deleteOrder, fetchAllItems, fetchAllOrders, fetchBookingByRoom, fetchOrdersByBookingId, putItem, sendOTPByEmail, verifyOTP } from "../controllers/coscontroller";
const router = Router();

router.get("/fetchBookingByRoom", fetchBookingByRoom)
router.get("/sendOTPbyEmail", sendOTPByEmail)
router.get("/verifyOTP", verifyOTP)
router.get("/fetchAllItems", fetchAllItems)
router.post("/putItem", putItem)
router.post("/addOrder", addOrder)
router.get("/deleteOrder", deleteOrder)
router.get("/fetchOrdersByBookingId", fetchOrdersByBookingId)
router.get("/fetchAllOrders", fetchAllOrders)

export default router;