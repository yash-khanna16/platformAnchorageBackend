import { Request, Response } from "express";
import { getGuests } from "../service/guestservice";

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
  