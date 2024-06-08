import { Request, Response } from "express";
import { fetchAverageCompanyBookingForMonthandYear, fetchAverageMealsBoughtPerDay, fetchRoomsBookedPerDay } from "../service/analyticsservice";

export const getRoomsBookedPerDay=async(req: Request, res: Response) => {
    try {        
        const year = parseInt(req.headers.year as string);
        const month = parseInt(req.headers.month as string);
        fetchRoomsBookedPerDay(year,month).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}

export const getAverageCompanyBookingForMonthandYear=async(req: Request, res:Response) => {
    try {
        const year = parseInt(req.headers.year as string);
        const month = parseInt(req.headers.month as string);
        fetchAverageCompanyBookingForMonthandYear(year,month).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const getAverageMealsBoughtPerDay=async(req: Request, res:Response) => {
    try {
        const year = parseInt(req.headers.year as string);
        const month = parseInt(req.headers.month as string);
        fetchAverageMealsBoughtPerDay(year,month).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}