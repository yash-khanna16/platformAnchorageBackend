import { Request, Response } from "express";
import { fetchBookingFromRoomService, sendOTPByEmailService, verifyOTPService } from "../service/cosservice";

export const fetchBookingByRoom=async(req: Request, res: Response) => {
    const room = req.headers.room as string;
    try {
        const result = await fetchBookingFromRoomService(room);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Something went wrong, please try again!' });
      }
}
export const sendOTPByEmail=async(req: Request, res: Response) => {
    const email = req.headers.email as string;
    console.log("email: ", email)
    try {
        const result = await sendOTPByEmailService(email);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Something went wrong, please try again!' });
      }
}
export const verifyOTP=async(req: Request, res: Response) => {
    const email = req.headers.email as string;
    const otp = req.headers.otp as string;
    try {
        const result = await verifyOTPService(email, otp);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Something went wrong, please try again!' });
      }
}


