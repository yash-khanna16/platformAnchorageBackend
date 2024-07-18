export type movementDetailsType = {
  pickup_location: string;
  pickup_time: string;
  return_time: string;
  drop_location: string;
  driver: string;
  car_number: string;
  passengers: passengerType[];
};

export type passengerType = {
  booking_id: string|null;
  company?: string;
  phone?: string;
  remark?: string;
  name?: string;
};

export type editMovementDetailsType = {
  movement_id: string;
  pickup_location: string;
  pickup_time: string;
  return_time: string;
  drop_location: string;
  driver: string;
  car_number: string;
  passengers: editPassengerType[];
};

export type editPassengerType = {
  booking_id: string|null;
  passenger_id: string|null;
  company?: string|null;
  phone?: string|null;
  remark?: string|null;
  name?: string|null;
};