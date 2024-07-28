import { Router } from "express";
import { fetchBookingByRoom, sendOTPByEmail, verifyOTP } from "../controllers/coscontroller";
const router = Router();

router.get("/fetchBookingByRoom", fetchBookingByRoom)
router.get("/sendOTPbyEmail", sendOTPByEmail)
router.get("/verifyOTP", verifyOTP)

export default router;