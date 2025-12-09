import { Router } from "express";
import { addOrder, deleteItem, deleteOrder, fetchAllItems, fetchAllOrders, putItem, updateDelay, updateItem, updateOrderStatus, updateCategory, fetchAllCouponsAdmin, addCoupon, deleteCoupon, updateCoupon, fetchBookingDataForRoom } from "../controllers/coscontroller";
const router = Router();


router.post("/putItem", putItem)
router.get("/fetchAllItems", fetchAllItems)
router.get("/fetchAllOrders", fetchAllOrders)
router.get("/updateOrderStatus", updateOrderStatus)
router.post("/updateItem", updateItem)
router.get("/deleteItem", deleteItem)
router.get("/deleteOrder", deleteOrder)
router.get("/updateDelay", updateDelay)
router.post("/updateCategory", updateCategory);
router.get("/fetchAllCouponsAdmin", fetchAllCouponsAdmin);
router.post("/addCoupon", addCoupon)
router.post("/deleteCoupon", deleteCoupon)
router.post("/updateCoupon", updateCoupon)
router.get("/getBookingDetailsForRoom",fetchBookingDataForRoom)
router.post("/addOrder", addOrder)

export default router;