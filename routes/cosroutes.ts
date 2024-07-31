import { Router } from "express";
import { addOrder, deleteItem, deleteOrder, fetchAllItems, fetchAllOrders, fetchBookingByRoom, fetchOrdersByBookingId, putItem, sendOTPByEmail, updateItemStatus, updateOrderStatus, verifyOTP } from "../controllers/coscontroller";
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
router.get("/updateOrderStatus", updateOrderStatus)
router.get("/updateItemStatus", updateItemStatus)
router.get("/deleteItem", deleteItem)

export default router;