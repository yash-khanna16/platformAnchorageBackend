export const getAllGuests = "SELECT * FROM guests";

export const getNamedGuests = `SELECT * FROM guests JOIN bookings ON bookings.guest_email = guests.email where guests.name like $1`;

export const getAdmin= "Select * FROM admin where email=$1";

export const addGuestQuery= "INSERT INTO guests (email,name,phone,company,vessel,rank)values($1,$2,$3,$4,$5,$6)";

export const fetchResv = "SELECT * FROM bookings JOIN guests ON guests.email=bookings.guest_email where room=$1";

export const addBookingDetails = "insert into bookings(booking_id,checkin,checkout,guest_email,meal_veg,meal_non_veg,remarks,additional_info,room,breakfast)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";

export const editBookingDetails = "update bookings SET checkout = $2,guest_email = $3,meal_veg = $4,meal_non_veg = $5,remarks = $6,additional_info = $7 where booking_id=$1";

export const serverTime = "SELECT current_timestamp AT TIME ZONE 'Asia/Kolkata' AS server_time";

// export const fetchRoom = `SELECT 
// room, 
// CASE 
//   WHEN COUNT(*) = SUM(
//     CASE 
//       WHEN (
//         (checkin < $1 AND checkout > $2) 
//         OR (checkin < $1 AND $2 > checkout AND $1 < checkout) 
//         OR (checkin > $1 AND checkout < $2) 
//         OR (checkin > $1 AND $2 < checkout AND $2 > checkin)
//       ) 
//       THEN 1 
//       ELSE 0 
//     END
//   ) 
//   THEN 'false' 
//   ELSE 'true' 
// END AS condition_met 
// FROM bookings 
// GROUP BY room;`
// ;
export const fetchRoom = `SELECT 
room, 
CASE 
  WHEN COUNT(*) = SUM(
    CASE 
      WHEN (
        (checkin <= $1 AND checkout >= $2) 
        OR (checkin >= $1 AND checkout <= $2) 
        OR (checkin <= $1 AND checkout >= $1 AND checkout <= $2) 
        OR (checkin >= $1 AND checkin <= $2 AND checkout >= $2)
      ) 
      THEN 1 
      ELSE 0 
    END
  ) 
  THEN 'false' 
  ELSE 'true' 
END AS condition_met 
FROM bookings 
GROUP BY room;`
;

export const fetchThisRoom=`SELECT 
room, 
CASE 
  WHEN COUNT(*) = SUM(
    CASE 
      WHEN (
        (checkin <= $1 AND checkout >= $2) 
        OR (checkin >= $1 AND checkout <= $2) 
        OR (checkin <= $1 AND checkout >= $1 AND checkout <= $2) 
        OR (checkin >= $1 AND checkin <= $2 AND checkout >= $2)
      ) 
      THEN 1 
      ELSE 0 
    END
  ) 
  THEN 'false' 
  ELSE 'true' 
END AS condition_met 
FROM bookings 
where room=$3
GROUP BY room;`;

export const fetchGuest="Select * from guests where email=$1"

export const fetchRooms="Select * from rooms"