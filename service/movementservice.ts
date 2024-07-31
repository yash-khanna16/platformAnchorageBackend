import { editMovementDetailsType, movementDetailsType } from "../types/movement";
import {
  addCarModel,
  addDriverModel,
  addMovementModel,
  checkConflict,
  deleteCarModel,
  deleteMovementByBookingIdModel,
  deleteDriverModel,
  deleteMovementModel,
  deletePassengerFromMovementModel,
  editMovementModel,
  fetchAllCarsModel,
  fetchAllDriversModel,
  fetchAvailableCarsModel,
  fetchAvailableDriversModel,
  fetchMovementByBookingIdModel,
  fetchMovementModel,
} from "../models/movementmodel";
import { convertUTCToIST } from "./guestservice";

export async function fetchMovementService() {
  return new Promise((resolve, reject) => {
    fetchMovementModel()
      .then((results) => {
        // console.log("first ", results)
        const movements: { [key: string]: any } = {};
        console.log(results.rows);
        results.rows.forEach((row: any) => {
          const movement_id = row.movement_id;

          if (!movements[movement_id]) {
            movements[movement_id] = {
              movement_id: row.movement_id,
              pickup_location: row.pickup_location,
              pickup_time: row.pickup_time,
              return_time: row.return_time,
              car_number: row.car_number,
              driver: row.driver,
              car_name: row.car_name,
              drop_location: row.drop_location,
              passengers: [],
            };
          }

          const passenger = {
            passenger_id: row.passenger_id,
            name: row.passenger_name,
            phone: row.phone,
            company: row.company,
            remark: row.remark,
            external_booking: row.external_booking,
            booking_id: row.booking_id,
          };

          movements[movement_id].passengers.push(passenger);
        });

        const movementsArray = Object.values(movements);
        resolve(movementsArray);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}
export async function fetchEachPassengerService() {
  return new Promise((resolve, reject) => {
    fetchMovementModel()
      .then((results) => {
        const movements: { [key: string]: any } = {};
        resolve(results.rows);
      })
      .catch((error) => {
        console.log(error);
        reject("Internal Server Error");
      });
  });
}

export async function addMovementService(details: movementDetailsType) {
  return new Promise((resolve, reject) => {
    details.pickup_time = new Date(details.pickup_time).toISOString();
    details.return_time = new Date(details.return_time).toISOString();
    console.log("details: ", details);
    if (!(details.driver === "default" || details.car_number === "default")) {
      checkConflict(details.driver, details.car_number, details.pickup_time, details.return_time)
        .then((conflict) => {
          console.log("conflicts: ", conflict.rows);
          if (conflict.rows.length > 0) {
            resolve("Conflicting movements!");
          } else {
            addMovementModel(details)
              .then((results) => {
                resolve(results);
              })
              .catch((error) => {
                console.log(error);
                reject("Internal Server Error");
              });
          }
        })
        .catch((error) => {
          console.log("Error fetching conflict ", error);
          reject("Error fetching conflict");
        });
    } else {
      addMovementModel(details)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          console.log(error);
          reject("Internal Server Error");
        });
    }
  });
}

export async function editMovementService(details: editMovementDetailsType) {
  return new Promise((resolve, reject) => {
    details.pickup_time = new Date(details.pickup_time).toISOString();
    details.return_time = new Date(details.return_time).toISOString();

    if (!(details.driver === "default" || details.car_number === "default")) {
      checkConflict(details.driver, details.car_number, details.pickup_time, details.return_time)
        .then((conflict) => {
          let conflicts = conflict.rows.filter(
            (row: any) => row.movement_id !== details.movement_id
          );
          console.log("conflicts: ", conflicts);
          if (conflicts.length > 0) {
            resolve({ message: "Conflicting Movements!", conflicts: conflicts });
          } else {
            editMovementModel(details)
              .then((results) => {
                resolve(results);
              })
              .catch((error) => {
                console.log(error);
                reject("Internal Server Error");
              });
          }
        })
        .catch((error) => {
          console.log("Error fetching conflict ", error);
          reject("Error fetching conflict");
        });
    } else {
      editMovementModel(details)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          console.log(error);
          reject("Internal Server Error");
        });
    }
  });
}
export async function fetchAvailableCarsService(pickup_time: string, return_time: string) {
  return new Promise((resolve, reject) => {
    pickup_time = new Date(pickup_time).toISOString();
    return_time = new Date(return_time).toISOString();

    fetchAvailableCarsModel(pickup_time, return_time)
      .then((results) => {
        resolve(results.rows);
      })
      .catch((error) => {
        console.log("error editing movement details: ", error);
        reject("Error editing movement details");
      });
  });
}
export async function fetchAvailableDriversService(pickup_time: string, return_time: string) {
  return new Promise((resolve, reject) => {
    pickup_time = new Date(pickup_time).toISOString();
    return_time = new Date(return_time).toISOString();

    fetchAvailableDriversModel(pickup_time, return_time)
      .then((results) => {
        resolve(results.rows);
      })
      .catch((error) => {
        console.log("error editing movement details: ", error);
        reject("Error editing movement details");
      });
  });
}

export async function addCarService(name: string, number: string) {
  return new Promise((resolve, reject) => {
    addCarModel(name, number)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error adding car", error);
        reject("Error adding car!");
      });
  });
}
export async function deleteCarService(number: string) {
  return new Promise((resolve, reject) => {
    deleteCarModel(number)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error deleting car", error);
        reject("Error deleting car!");
      });
  });
}
export async function addDriverService(name: string, number: string) {
  return new Promise((resolve, reject) => {
    addDriverModel(name, number)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error adding Driver", error);
        reject("Error adding Driver!");
      });
  });
}
export async function deleteDriverService(name: string) {
  return new Promise((resolve, reject) => {
    deleteDriverModel(name)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error deleting car", error);
        reject("Error deleting car!");
      });
  });
}
export async function deletePassengerFromMovementService(
  movement_id: string,
  passenger_id: string
) {
  return new Promise((resolve, reject) => {
    deletePassengerFromMovementModel(movement_id, passenger_id)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error deleting movement", error);
        reject("Error deleting movement!");
      });
  });
}

export async function fetchAllCarsService() {
  return new Promise((resolve, reject) => {
    fetchAllCarsModel()
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error deleting movement", error);
        reject("Error deleting movement!");
      });
  });
}

export async function fetchAllDriversService() {
  return new Promise((resolve, reject) => {
    fetchAllDriversModel()
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error deleting movement", error);
        reject("Error deleting movement!");
      });
  });
}
export async function deleteMovementService(movementId: string) {
  return new Promise((resolve, reject) => {
    deleteMovementModel(movementId)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error deleting movement", error);
        reject("Error deleting movement!");
      });
  });
}
export async function fetchMovementByBookingIdService(bookingId: string) {
  return new Promise((resolve, reject) => {
    fetchMovementByBookingIdModel(bookingId)
      .then((results) => {
        results.forEach((result: any) => {
          result.pickup_time = convertUTCToIST(new Date(result.pickup_time));
          result.return_time = convertUTCToIST(new Date(result.return_time));
        });
        console.log("results: ", results);
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching movement by booking id", error);
        reject("error fetching movement by booking id");
      });
  });
}
export async function deleteMovementByBookingIdService(bookingId: string) {
  return new Promise((resolve, reject) => {
    deleteMovementByBookingIdModel(bookingId)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        console.log("error fetching movement by booking id", error);
        reject("error fetching movement by booking id");
      });
  });
}
