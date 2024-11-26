import { Router } from "express";
import { addOrder, deleteItem, deleteOrder, fetchAllItems, fetchAllOrders,fetchBookingByBookingId, fetchBookingByRoom, fetchOrdersByBookingId, putItem, sendOTPByEmail, updateItem, updateOrderStatus, verifyOTP,fetchSchedule, updateFeedback, fetchFeedbackCOS, insertFeedbackCOS, fetchAllCoupons, validateCoupon, updateCheckinGuest, fetchCheckinByRoom ,fetchGuestDataByEmail} from "../controllers/coscontroller";
const router = Router();

router.get("/fetchBookingByRoom", fetchBookingByRoom)
router.get("/sendOTPbyEmail", sendOTPByEmail)
router.get("/fetchAllItems", fetchAllItems)
router.get("/verifyOTP", verifyOTP)
router.post("/addOrder", addOrder)
router.get("/fetchOrdersByBookingId", fetchOrdersByBookingId)
router.get("/fetchBookingByBookingId", fetchBookingByBookingId)
router.get("/fetchSchedule", fetchSchedule)
router.get("/updateFeedback", updateFeedback)
router.get("/fetchFeedbackCOS", fetchFeedbackCOS)
router.post("/insertFeedbackCOS", insertFeedbackCOS)
router.get("/fetchAllCoupons", fetchAllCoupons)
router.post("/validateCoupon", validateCoupon)
router.post("/checkinGuest",updateCheckinGuest)
router.get("/fetchCheckInByBoom", fetchCheckinByRoom)
router.get("/fetchGuestDataByEmail", fetchGuestDataByEmail)

export default router;