import { Router } from "express";
import {
  addCar,
  addDriver,
  addMovement,
  deleteCar,
  deleteDriver,
  deletePassengerFromMovement,
  editMovement,
  fetchavailableCars,
  fetchavailableDrivers,
  fetchMovevment,
} from "../controllers/movementcontroller";
const router = Router();

router.get("/fetchMovement", fetchMovevment);
router.post("/addMovement", addMovement);
router.post("/editMovement", editMovement);
router.get("/fetchAvailableCars", fetchavailableCars);
router.get("/fetchAvailableDrivers", fetchavailableDrivers);
router.post("/addCar", addCar);
router.get("/deleteCar", deleteCar);
router.post("/addDriver", addDriver);
router.get("/deleteDriver", deleteDriver);
router.get("/deletePassengerFromMovement", deletePassengerFromMovement);

export default router;
