import { Router } from "express";
import { getRoomsBookedPerDay,getAverageCompanyBookingForMonthandYear, getAverageMealsBoughtPerDay } from "../controllers/analyticscontroller";
const router = Router();


router.get("/getRoomsBookedPerDay",getRoomsBookedPerDay);
router.get("/getAverageCompanyBookingForMonthandYear", getAverageCompanyBookingForMonthandYear)
router.get("/getAverageMealsBoughtPerDay", getAverageMealsBoughtPerDay)

export default router;