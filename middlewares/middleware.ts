import { configDotenv } from "dotenv";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { decode } from "punycode";
import { addAuditLogs, getAuditLogs } from "../service/guestservice";

dotenv.config();

export async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.token as string;
  console.log(token);
  if (!token) {
    console.log("no token");
    return res.status(401).send({ message: "Access Denied" });
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    const skipAuditLog = [
      "/searchAllGuest",
      "/getReserv",
      "/getAvailableRooms",
      "/instantAvailableRooms",
      "/getEmailTemplate",
      "/fetchMealsByDate",
      "/fetchMealsByBookingId",
      "/fetchOccupancyByBooking",
      "/fetchBookingLogs",
      "/fetchAuditLog",
      "/fetchMovement",
      "/fetchAvailableCars",
      "/fetchAvailableDrivers",
      "/fetchAllCars",
      "/fetchAllDrivers",
      "/fetchEachPassenger",
      "/fetchMovementByBookingId",
      "/fetchEachPassenger",
    ];
    const skipAuditLogUrls = [
      "/deleteBooking",
      "/deleteMovementFromMovementId",
      "/deletePassengerFromMovement",
    ];

    if (!skipAuditLog.includes(req.url)) {
      if (!skipAuditLogUrls.includes(req.url)) {
        await addAuditLogs({
          user: decoded.email,
          endpoint: req.originalUrl,
        });
      } else {
        if (req.url === "/deleteBooking") {
          await getAuditLogs({
            password: req.headers.password as string,
            id: req.headers.bookingid as string,
            endpoint: req.originalUrl,
          });
        } else if (req.url === "/deletePassengerFromMovement") {
          await getAuditLogs({
            password: req.headers.password as string,
            id: req.headers.passengerid as string,
            endpoint: req.originalUrl,
          });
        } else {
          await getAuditLogs({
            password: req.headers.password as string,
            id: req.headers.movementid as string,
            endpoint: req.originalUrl,
          });
        }
      }
    }
    next();
  } catch (error) {
    console.error("Invalid Token:", error);
    res.status(400).send({ message: "Invalid Token" });
  }
}
