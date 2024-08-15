import { Router } from "express";
import { addOrder, deleteItem, deleteOrder, fetchAllItems, fetchAllOrders, fetchBookingByRoom, fetchOrdersByBookingId, putItem, sendOTPByEmail, updateDelay, updateItem, updateOrderStatus, verifyOTP } from "../controllers/coscontroller";
const router = Router();


router.post("/putItem", putItem)
router.get("/fetchAllItems", fetchAllItems)
router.get("/fetchAllOrders", fetchAllOrders)
router.get("/updateOrderStatus", updateOrderStatus)
router.post("/updateItem", updateItem)
router.get("/deleteItem", deleteItem)
router.get("/deleteOrder", deleteOrder)
router.get("/updateDelay", updateDelay)

export default router;