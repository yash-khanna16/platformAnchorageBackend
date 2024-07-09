import { Router } from "express";
import  * as controller from "../controllers/guestcontroller";
const router = Router();

router.get("/getGuests", controller.getAllGuests);
router.get("/searchAllGuest",controller.searchAllGuests);
router.post("/addGuests",controller.addNewGuests);
router.get("/getReserv",controller.getReserv);
router.post("/addBooking",controller.addBooking);
router.post("/editBooking",controller.editBooking);
router.post("/getAvailableRooms",controller.getAvailableRooms);
// router.get("/getThisRooms",getThisRooms);
router.get('/deleteBooking',controller.deleteBooking);
// router.post('/findConflict',findConflict);
router.get('/instantAvailableRooms',controller.instantAvailableRooms);
router.post('/addRoom',controller.addRoom);
router.post('/deleteRoom',controller.deleteRoom);
router.post("/editEmailTempalate", controller.editEmailTemplate)
router.get("/getEmailTemplate", controller.getEmailTemplate)
router.get("/updateMeals", controller.updateMeals)
router.get("/fetchMealsByDate", controller.fetchMealsByDate)



export default router;