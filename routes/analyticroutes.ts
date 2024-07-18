import { Router } from "express";
import {
  getRoomsBookedPerDay,
  getAverageCompanyBookingForMonthandYear,
  getAverageMealsBoughtPerDay,
  getAverageBreakfastBoughtPerDay,
  getRoomsBookedPerDayQuarter,
  getAverageCompanyBookingForQuarterandYear,
  getAverageMealsBoughtPerDayQuarter,
  getAverageBreakfastBoughtPerDayQuarter,
  getRoomsBookedPerDayYear,
  getAverageCompanyBookingForYear,
  getAverageMealsBoughtPerDayYear,
  getAverageBreakfastBoughtPerDayYear,
} from "../controllers/analyticscontroller";
const router = Router();

router.get("/getRoomsBookedPerDay", getRoomsBookedPerDay);
router.get("/getAverageCompanyBookingForMonthandYear", getAverageCompanyBookingForMonthandYear);
router.get("/getAverageMealsBoughtPerDay", getAverageMealsBoughtPerDay);
router.get("/getAverageBreakfastBoughtPerDay", getAverageBreakfastBoughtPerDay);
router.get("/getRoomsBookedPerDayQuarter", getRoomsBookedPerDayQuarter);
router.get("/getAverageCompanyBookingForQuarterandYear", getAverageCompanyBookingForQuarterandYear);
router.get("/getAverageMealsBoughtPerDayQuarter", getAverageMealsBoughtPerDayQuarter);
router.get("/getAverageBreakfastBoughtPerDayQuarter", getAverageBreakfastBoughtPerDayQuarter);
router.get("/getRoomsBookedPerDayYear", getRoomsBookedPerDayYear);
router.get("/getAverageCompanyBookingForYear", getAverageCompanyBookingForYear);
router.get("/getAverageMealsBoughtPerDayYear", getAverageMealsBoughtPerDayYear);
router.get("/getAverageBreakfastBoughtPerDayYear", getAverageBreakfastBoughtPerDayYear);

export default router;
