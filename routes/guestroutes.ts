import { Router } from "express";
import { getAllGuests,searchAllGuests,loginAdmin,addNewGuests,getReserv,addBooking,editBooking,getAvailableRooms,getThisRooms} from "../controllers/guestcontroller";
const router = Router();

router.get("/getGuests", getAllGuests);
router.get("/searchAllGuest",searchAllGuests);
router.get("/getAdmin",loginAdmin);
router.post("/addGuests",addNewGuests);
router.get("/getReserv",getReserv);
router.post("/addBooking",addBooking);
router.post("/editBooking",editBooking);
router.get("/getAvailableRooms",getAvailableRooms);
router.get("/getThisRooms",getThisRooms);

export default router;