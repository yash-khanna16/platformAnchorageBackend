import { Request, Response } from "express";
import { getGuests,searchGuests,getAdmin,addGuests,getRoomResv,addBookingData,editBookingData,fetchAvailableRooms,getThisRoom, triggerBooking } from "../service/guestservice";

export const getAllGuests = (req: Request, res: Response): void => {
    try {
        getGuests().then((results)=> {
          res.status(200).send(results);
        }) 
        .catch ((error)=> {
          res.status(500).send("internal server error");
        })
    } catch (error) {
      res.status(400).send({message: "There is some error encountered!"});
      console.log("error: ", error);
    }
  };

export const searchAllGuests = (req: Request, res: Response): void => {
  const guestName=req.headers.guestname as string;
    try {
        searchGuests(guestName).then((results)=> {
          res.status(200).send(results);
        }) 
        .catch ((error)=> {
          res.status(500).send("internal server error");
        })
    } catch (error) {
      res.status(400).send({message: "There is some error encountered!"});
      console.log("error: ", error);
    }
  };

export const loginAdmin = (req: Request, res: Response): void => {
  const adminId=req.headers['email'] as string;
  const password=req.headers['password'] as string;
  console.log(adminId);
  console.log(password);
    try {
        getAdmin(adminId,password).then((token)=> {
          // res.cookie('token', token, { httpOnly: true, secure: true});
          console.log(token);
          res.status(200).send({token:token});
        }) 
        .catch ((error)=> {
          res.status(500).send({message:"internal server error"});
        })
    } catch (error) {
      res.status(400).send({message: "There is some error encountered!"});
      console.log("error: ", error);
    }
  };
  
  export const addNewGuests = (req: Request, res: Response): void => {
    const {guestData}=req.body;
      try {
          addGuests(guestData).then((results)=> {
            res.status(200).send(results);
          }) 
          .catch ((error)=> {
            res.status(500).send("internal server error");
          })
      } catch (error) {
        res.status(400).send({message: "There is some error encountered!"});
        console.log("error: ", error);
      }
    };

  export const getReserv = (req: Request, res: Response): void => {
    const {roomNo}=req.body;
      try {
          getRoomResv(roomNo).then((results)=> {
            res.status(200).send(results);
          }) 
          .catch ((error)=> {
            res.status(500).send("internal server error");
          })
      } catch (error) {
        res.status(400).send({message: "There is some error encountered!"});
        console.log("error: ", error);
      }
    };

  export const addBooking = (req: Request, res: Response): void => {
    const {bookingData}=req.body;
      try {
          addBookingData(bookingData).then((results)=> {
            res.status(200).send(results);
          }) 
          .catch ((error)=> {
            res.status(500).send("internal server error");
          })
      } catch (error) {
        res.status(400).send({message: "There is some error encountered!"});
        console.log("error: ", error);
      }
    };
  
  export const editBooking = (req: Request, res: Response): void => {
    const {bookingData}=req.body;
      try {
          editBookingData(bookingData).then((results)=> {
            res.status(200).send(results);
          }) 
          .catch ((error)=> {
            res.status(500).send("internal server error");
          })
      } catch (error) {
        res.status(400).send({message: "There is some error encountered!"});
        console.log("error: ", error);
      }
    };

  export const getAvailableRooms = (req: Request, res: Response): void => {
    console.log(req.body)
    const {checkData}=req.body;
      try {
          fetchAvailableRooms(checkData).then((results)=> {
            res.status(200).send(results);
          }) 
          .catch ((error)=> {
            res.status(500).send({message: "internal server error"});
          })
      } catch (error) {
        res.status(400).send({message: "There is some error encountered!"});
        console.log("error: ", error);
      }
    };

  export const getThisRooms = (req: Request, res: Response): void => {
    const {checkData}=req.body;
      try {
          getThisRoom(checkData).then((results)=> {
            res.status(200).send(results);
          }) 
          .catch ((error)=> {
            res.status(500).send("internal server error");
          })
      } catch (error) {
        res.status(400).send({message: "There is some error encountered!"});
        console.log("error: ", error);
      }
    };