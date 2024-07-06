import { editMovementDetailsType, movementDetailsType } from "../constants/movement";
import { addCarModel, addDriverModel, addMovementModel, checkConflict, deleteCarModel, deleteDriverModel, deletePassengerFromMovementModel, editMovementModel, fetchAllCarsModel, fetchAllDriversModel, fetchAvailableCarsModel, fetchAvailableDriversModel, fetchMovementModel } from "../models/movementmodel";

export async function fetchMovementService() {
  return new Promise((resolve, reject) => {
    fetchMovementModel()
      .then((results) => {
        // const movements: { [key: string]: any } = {};
        // results.rows.forEach((row:any) => {
        //   const movement_id = row.movement_id;
      
        //   if (!movements[movement_id]) {
        //     movements[movement_id] = {
        //       movement_id: row.movement_id,
        //       pickup_location: row.pickup_location,
        //       pickup_time: row.pickup_time,
        //       return_time: row.return_time,
        //       car_number: row.car_number,
        //       driver: row.driver,
        //       car_name: row.car_name,
        //       drop_location: row.drop_location,
        //       passengers: []
        //     };
        //   }
      
        //   const passenger = {
        //     passenger_id: row.passenger_id,
        //     name: row.passenger_name,
        //     phone: row.phone,
        //     company: row.company,
        //     remark: row.remark,
        //     booking_id: row.booking_id
        //   };
      
        //   movements[movement_id].passengers.push(passenger);
        // });
      
        resolve(results.rows);
        // resolve(results.rows);
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
    if (!(details.driver === "Default" || details.car_number === "Default")) {
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

    editMovementModel(details) .then((results) => {
      resolve(results)
    }).catch((error)=>{
      console.log("error editing movement details: ", error)
      reject("Error editing movement details")
    })
  })
}
export async function fetchAvailableCarsService(pickup_time: string, return_time: string) {
  return new Promise((resolve, reject) => {
    pickup_time = new Date(pickup_time).toISOString();
    return_time = new Date(return_time).toISOString();

    fetchAvailableCarsModel(pickup_time, return_time) .then((results) => {
      resolve(results.rows)
    }).catch((error)=>{
      console.log("error editing movement details: ", error)
      reject("Error editing movement details")
    })
  })
}
export async function fetchAvailableDriversService(pickup_time: string, return_time: string) {
  return new Promise((resolve, reject) => {
    pickup_time = new Date(pickup_time).toISOString();
    return_time = new Date(return_time).toISOString();

    fetchAvailableDriversModel(pickup_time, return_time) .then((results) => {
      resolve(results.rows)
    }).catch((error)=>{
      console.log("error editing movement details: ", error)
      reject("Error editing movement details")
    })
  })
}

export async function addCarService(name: string, number: string) {
  return new Promise((resolve, reject) => {

    addCarModel(name, number) .then((results) => {
      resolve(results)
    }).catch((error)=>{
      console.log("error adding car", error)
      reject("Error adding car!")
    })
  })
}
export async function deleteCarService(number: string) {
  return new Promise((resolve, reject) => {

    deleteCarModel(number) .then((results) => {
      resolve(results)
    }).catch((error)=>{
      console.log("error deleting car", error)
      reject("Error deleting car!")
    })
  })
}
export async function addDriverService(name: string, number: string) {
  return new Promise((resolve, reject) => {

    addDriverModel(name, number) .then((results) => {
      resolve(results)
    }).catch((error)=>{
      console.log("error adding Driver", error)
      reject("Error adding Driver!")
    })
  })
}
export async function deleteDriverService(name: string) {
  return new Promise((resolve, reject) => {

    deleteDriverModel(name) .then((results) => {
      resolve(results)
    }).catch((error)=>{
      console.log("error deleting car", error)
      reject("Error deleting car!")
    })
  })
}
export async function deletePassengerFromMovementService(movement_id: string, passenger_id: string) {
  return new Promise((resolve, reject) => {

    deletePassengerFromMovementModel(movement_id, passenger_id) .then((results) => {
      resolve(results)
    }).catch((error)=>{
      console.log("error deleting movement", error)
      reject("Error deleting movement!")
    })
  })
}

export async function fetchAllCarsService() {
  return new Promise((resolve, reject) => {

    fetchAllCarsModel().then((results) => {
      resolve(results)
    }).catch((error)=>{
      console.log("error deleting movement", error)
      reject("Error deleting movement!")
    })
  })
}

export async function fetchAllDriversService() {
  return new Promise((resolve, reject) => {

    fetchAllDriversModel() .then((results) => {
      resolve(results)
    }).catch((error)=>{
      console.log("error deleting movement", error)
      reject("Error deleting movement!")
    })
  })
}




