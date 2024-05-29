import { Router } from "express";
import { getAllGuests,searchAllGuests,getAdmin } from "../controllers/guestcontroller";
const router = Router();

router.get("/getGuests", getAllGuests)
router.get("/searchAllGuest",searchAllGuests)
router.get("/getAdmin",getAdmin);

export default router;