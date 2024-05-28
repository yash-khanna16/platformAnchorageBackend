import { Router } from "express";
import { getAllGuests } from "../controllers/guestcontroller";
const router = Router();

router.get("/getGuests", getAllGuests)

export default router;