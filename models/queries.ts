export const getAllGuests = "SELECT * FROM guests";

export const getNamedGuests = `SELECT * FROM guests JOIN bookings ON bookings.guest_email = guests.email where guests.name ilike $1`;

export const getAdmin= "Select * FROM admin where email=$1";

export const addGuestQuery= "INSERT INTO guests (email,name,phone,company,vessel,rank)values($1,$2,$3,$4,$5,$6)";

export const fetchResv = "SELECT * FROM bookings JOIN guests ON guests.email=bookings.guest_email where room=$1";

export const addBookingDetails = "insert into bookings(booking_id,checkin,checkout,guest_email,meal_veg,meal_non_veg,remarks,additional_info,room,breakfast)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";

export const editBookingDetails = "update bookings SET checkin=$2,checkout = $3,guest_email = $4,meal_veg = $5,meal_non_veg = $6,remarks = $7,additional_info = $8, breakfast=$9 where booking_id=$1";

export const serverTime = "SELECT current_timestamp AT TIME ZONE 'Asia/Kolkata' AS server_time";

export const fetchAvailRoom = `
SELECT 
  room, 
  CASE 
    WHEN EXISTS (
      SELECT 1
      FROM bookings
      WHERE room = b.room
        AND (
          ($1 <= checkin AND $2 > checkin)  
          OR 
          ($1 < checkout AND $2 >= checkout)  
          OR 
          ($1 >= checkin AND $1 < checkout)  
          OR 
          ($2 > checkin AND $2 <= checkout)
        )
    )
    THEN 'false'
    ELSE 'true'
  END AS condition_met 
FROM bookings b

GROUP BY room
`;


export const fetchThisRoom=`SELECT 
COUNT(*) AS conflict_count
FROM bookings
WHERE room = $3
AND (
  ($1 <= checkin AND $2 > checkin)  -- new booking starts before existing booking ends
  OR 
  ($1 < checkout AND $2 >= checkout)  -- new booking ends after existing booking starts
  OR 
  ($1 >= checkin AND $1 < checkout)  -- new booking starts within an existing booking
  OR 
  ($2 > checkin AND $2 <= checkout)  -- new booking ends within an existing booking
);`;

export const fetchGuest="Select * from guests where email=$1";

export const fetchRooms="Select * from rooms where active='true'";

export const deleteBooking="DELETE from bookings where booking_id=$1";


export const deleteGuestDetails="DELETE from guests where email=$1";

export const findRoomConflict=`SELECT *
FROM bookings
WHERE room = $3
  AND (
    (checkin <= $1 AND checkout >= $2)
    OR (checkin >= $1 AND checkout <= $2)
    OR (checkin <= $1 AND checkout >= $1 AND checkout <= $2)
    OR (checkin >= $1 AND checkin <= $2 AND checkout >= $2)
  );
`;

export const editGuestQuery= "Update guests set name=$2,phone=$3,company=$4,vessel=$5,rank=$6 where email=$1";

export const editGuestEmail= "Update guests set email=$1,name=$2,phone=$3,company=$4,vessel=$5,rank=$6 where email=$7";

export const findRoom= "SELECT r.room , COUNT(b.room) AS status FROM rooms r LEFT JOIN bookings b ON r.room = b.room  AND $1 BETWEEN b.checkin AND b.checkout where r.active='true' GROUP BY r.room;";

export const addRoom="insert into rooms (room,active) values($1,'true')";

export const getRoom="select * from rooms where room = $1"; 

export const setActive="update rooms set active='true' where room =$1"; 

export const hideThisRoom="update rooms set active='false' where room =$1"; 

export const EmailTemplate = "UPDATE emails set content=$2, subject=$3 where template_name=$1"

export const GetEmailTemplate= "SELECT content, subject from emails where template_name = $1";