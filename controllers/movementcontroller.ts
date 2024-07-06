import { Request, Response } from "express";
import { addCarService, addDriverService, addMovementService, deleteCarService, deleteDriverService, deleteMovementService, editMovementService, fetchAvailableCarsService, fetchAvailableDriversService, fetchMovementService } from "../service/movementservice";
import { editMovementDetailsType, movementDetailsType } from "../constants/movement";

export const fetchMovevment=async(req: Request, res: Response) => {
    try {        
        fetchMovementService().then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}

export const addMovement=async(req: Request, res: Response) => {
    const details:movementDetailsType = req.body;
    try {        
        addMovementService(details).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
    
}
export const editMovement=async(req: Request, res: Response) => {
    const details:editMovementDetailsType = req.body;
    try {        
        editMovementService(details).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const fetchavailableCars=async(req: Request, res: Response) => {
    const pickup_time = req.headers.pickuptime as string;
    const return_time = req.headers.returntime as string;
    console.log("pickup time, ", pickup_time, "return time: ", return_time)
    try {        
        fetchAvailableCarsService(pickup_time, return_time).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const fetchavailableDrivers=async(req: Request, res: Response) => {
    const pickup_time = req.headers.pickuptime as string;
    const return_time = req.headers.returntime as string;
    console.log("pickup time, ", pickup_time, "return time: ", return_time)
    try {        
        fetchAvailableDriversService(pickup_time, return_time).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}

export const addCar=async(req: Request, res: Response) => {
    const name = req.body.name as string;
    const number = req.body.number as string;
    try {        
        addCarService(name, number).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const deleteCar=async(req: Request, res: Response) => {
    const number = req.headers.number as string;
    try {        
        deleteCarService(number).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const addDriver=async(req: Request, res: Response) => {
    const name = req.body.name as string;
    const phone = req.body.phone as string;
    try {        
        addDriverService(name, phone).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const deleteDriver=async(req: Request, res: Response) => {
    const name = req.headers.name as string;
    try {        
        deleteDriverService(name).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}
export const deleteMovement=async(req: Request, res: Response) => {
    const movement_id = req.headers.movementid as string;
    try {        
        deleteMovementService(movement_id).then(result=>{
            res.status(200).send(result);
        }).catch(error=>{
            res.status(500).send({message: "Internal Server Error"});
        })
    } catch(error) {
        res.status(500).send({message: "Something went wrong, Please try again!"})  
    }
}