import { Router } from "express";
import { addOrder, deleteItem, deleteOrder, fetchAllItems, fetchAllOrders, fetchBookingByRoom, fetchOrdersByBookingId, putItem, sendOTPByEmail, updateItemStatus, updateOrderStatus, verifyOTP } from "../controllers/coscontroller";
const router = Router();


router.post("/putItem", putItem)
router.get("/fetchAllItems", fetchAllItems)
router.get("/fetchAllOrders", fetchAllOrders)
router.get("/updateOrderStatus", updateOrderStatus)
router.get("/updateItemStatus", updateItemStatus)
router.get("/deleteItem", deleteItem)
router.get("/deleteOrder", deleteOrder)

export default router;