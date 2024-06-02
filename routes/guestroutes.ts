import { Router } from "express";
import { getAllGuests,searchAllGuests,loginAdmin,addNewGuests,getReserv,addBooking,editBooking,getAvailableRooms,getThisRooms,deleteBooking, findConflict} from "../controllers/guestcontroller";
const router = Router();

router.get("/getGuests", getAllGuests);
router.get("/searchAllGuest",searchAllGuests);
router.get("/loginAdmin",loginAdmin);
router.post("/addGuests",addNewGuests);
router.get("/getReserv",getReserv);
router.post("/addBooking",addBooking);
router.post("/editBooking",editBooking);
router.post("/getAvailableRooms",getAvailableRooms);
router.get("/getThisRooms",getThisRooms);
router.post('/deleteBooking',deleteBooking);
router.post('/findConflict',findConflict);


export default router;