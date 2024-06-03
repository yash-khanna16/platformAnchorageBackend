import { Request, Response } from "express";
import { getGuests, searchGuests, getAdmin, addGuests, getRoomResv, addBookingData, editBookingData, fetchAvailableRooms, getThisRoom, triggerBooking, deleteThisBooking, findConflictEntries,getInstantRoom } from "../service/guestservice";

export const getAllGuests = (req: Request, res: Response): void => {
  try {
    getGuests().then((results) => {
      res.status(200).send(results);
    })
      .catch((error) => {
        res.status(500).send("internal server error");
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const searchAllGuests = (req: Request, res: Response): void => {
  const guestName = req.headers.guestname as string;
  // console.log(guestName);
  try {
    searchGuests(guestName).then((results) => {
      res.status(200).send(results);
    })
      .catch((error) => {
        if (error === "No such guest present") {
          res.status(401).send({ message: "No such guest present" });
        }
        else {
          res.status(500).send({ message: "internal server error" });
        }
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const loginAdmin = (req: Request, res: Response): void => {
  const adminId = req.headers['email'] as string;
  const password = req.headers['password'] as string;
  console.log(adminId);
  console.log(password);
  try {
    getAdmin(adminId, password).then((token) => {
      console.log(token);
      res.status(200).send({ token: token });
    })
      .catch((error) => {
        console.log(error);
        if (error === "Admin not found") {
          res.status(401).send({ message: error });
        }
        else if (error = "Incorrect password")
          res.status(402).send({ message: error });
        else {
          res.status(500).send({ message: "internal server error" })
        }
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const addNewGuests = (req: Request, res: Response): void => {
  const { guestData } = req.body;
  try {
    addGuests(guestData).then((results) => {
      res.status(200).send({ message: "Guest Added Successfully!" });
    })
      .catch((error) => {
        if (error === "Email already present") {
          res.status(401).send({ message: "This email is already present" });
        }
        else {
          res.status(500).send({ message: "internal server error" });
        }
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const getReserv = (req: Request, res: Response): void => {
  const roomNo = req.headers.roomno as string;
  try {
    getRoomResv(roomNo).then((results) => {
      res.status(200).send(results);
    })
      .catch((error) => {
        res.status(500).send({ message: "internal server error" });
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const addBooking = (req: Request, res: Response): void => {
  // console.log(req.body)
  const { bookingData } = req.body;
  try {
    addBookingData(bookingData).then((results) => {
        res.status(200).send({ message: results });
    })
      .catch((error) => {
        if(error==="room unavailable"){
        res.status(401).send({ message: "This room is already booked for the given period of time"});
      }
      else{
        res.status(500).send({ message: "internal server error"});

      }
      })
  } catch (error) {
    res.status(400).send({ message: "Something Went Wrong, Please try again!" });
    console.log("error: ", error);
  }
};

export const editBooking = (req: Request, res: Response): void => {
  const { bookingData } = req.body;
  console.log("body: ", req.body)
  try {
    editBookingData(bookingData).then((results) => {
        res.status(200).send({ message: "Edited Successfully!" });
    })
      .catch((error) => {
        if (error === "room is booked for the given range cant change the checkout date") {
          res.status(401).send({ message: "Room not available for the given checkout" });
        }
        else if(error==="Error changing the guest details"){
          res.status(402).send({ message: error });
        }
        else{
          res.status(500).send({ message: "internal server error" });
        }
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const getAvailableRooms = (req: Request, res: Response): void => {
  console.log(req.body)
  const { checkData } = req.body;
  try {
    fetchAvailableRooms(checkData).then((results) => {
      res.status(200).send(results);
    })
      .catch((error) => {
        res.status(500).send({ message: "internal server error" });
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const getThisRooms = (req: Request, res: Response): void => {
  const { checkData } = req.body;
  try {
    getThisRoom(checkData).then((results) => {
      res.status(200).send(results);
    })
      .catch((error) => {
        res.status(500).send("internal server error");
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const deleteBooking = (req: Request, res: Response): void => {
  const bookingId = req.headers.bookingid as string;
  try {
    deleteThisBooking(bookingId).then((results) => {
      res.status(200).send({ message: "Booking deleted successfully!" });
    })
      .catch((error) => {
        res.status(500).send({ message: "Internal Server Error" });
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};
export const findConflict = (req: Request, res: Response): void => {
  const { bookingData } = req.body;
  try {
    findConflictEntries(bookingData).then((results) => {
      res.status(200).send(results);
    })
      .catch((error) => {
        res.status(500).send("internal server error");
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};

export const instantAvailableRooms = (req: Request, res: Response): void => {
  try {
    getInstantRoom().then((results) => {
      res.status(200).send(results);
    })
      .catch((error) => {
        res.status(500).send("internal server error");
      })
  } catch (error) {
    res.status(400).send({ message: "There is some error encountered!" });
    console.log("error: ", error);
  }
};