import { Router } from "express";
import { getAllGuests,searchAllGuests,loginAdmin,addNewGuests,getReserv,addBooking,editBooking,getAvailableRooms,getThisRooms,deleteBooking, findConflict,instantAvailableRooms} from "../controllers/guestcontroller";
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
router.get('/deleteBooking',deleteBooking);
// router.post('/findConflict',findConflict);
router.get('/instantAvailableRooms',instantAvailableRooms);


export default router;