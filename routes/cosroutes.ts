import { Router } from "express";
import { fetchBookingByRoom, sendOTPByEmail } from "../controllers/coscontroller";
const router = Router();

router.get("/fetchBookingByRoom", fetchBookingByRoom)
router.get("/sendOTPbyEmail", sendOTPByEmail)

export default router;