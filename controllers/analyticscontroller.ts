import { Request, Response } from "express";
import { fetchAverageBreakfastBoughtPerDay, fetchAverageBreakfastBoughtPerDayQuarter, fetchAverageBreakfastBoughtPerDayYear, fetchAverageCompanyBookingForMonthandYear, fetchAverageCompanyBookingForQuarterandYear, fetchAverageCompanyBookingForYear, fetchAverageMealsBoughtPerDay, fetchAverageMealsBoughtPerDayQuarter, fetchAverageMealsBoughtPerDayYear, fetchRoomsBookedPerDay, fetchRoomsBookedPerDayQuarter, fetchRoomsBookedPerDayYear } from "../service/analyticsservice";

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
export const getAverageBreakfastBoughtPerDay=async(req: Request, res:Response) => {
    try {
        const year = parseInt(req.headers.year as string);
        const month = parseInt(req.headers.month as string);
        fetchAverageBreakfastBoughtPerDay(year,month).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const getRoomsBookedPerDayQuarter=async(req: Request, res: Response) => {
    try {        
        const year = (req.headers.year as string);
        const quarter = (req.headers.quarter as string);
        // console.log(year, quarter)
        fetchRoomsBookedPerDayQuarter(year,quarter).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}

export const getAverageCompanyBookingForQuarterandYear=async(req: Request, res:Response) => {
    try {
        const year = (req.headers.year as string);
        const quarter = (req.headers.quarter as string);
        fetchAverageCompanyBookingForQuarterandYear(year,quarter).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const getAverageMealsBoughtPerDayQuarter=async(req: Request, res:Response) => {
    try {
        const year = (req.headers.year as string);
        const quarter = (req.headers.quarter as string);
        fetchAverageMealsBoughtPerDayQuarter(year,quarter).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const getAverageBreakfastBoughtPerDayQuarter=async(req: Request, res:Response) => {
    try {
        const year = (req.headers.year as string);
        const quarter = (req.headers.quarter as string);
        fetchAverageBreakfastBoughtPerDayQuarter(year,quarter).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const getRoomsBookedPerDayYear=async(req: Request, res: Response) => {
    try {        
        const year = (req.headers.year as string);
        fetchRoomsBookedPerDayYear(year).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}

export const getAverageCompanyBookingForYear=async(req: Request, res:Response) => {
    try {
        const year = (req.headers.year as string);
        fetchAverageCompanyBookingForYear(year).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const getAverageMealsBoughtPerDayYear=async(req: Request, res:Response) => {
    try {
        const year = (req.headers.year as string);
        fetchAverageMealsBoughtPerDayYear(year).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const getAverageBreakfastBoughtPerDayYear=async(req: Request, res:Response) => {
    try {
        const year = (req.headers.year as string);
        fetchAverageBreakfastBoughtPerDayYear(year).then(result=>{
            res.status(200).send(result)
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"})
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}