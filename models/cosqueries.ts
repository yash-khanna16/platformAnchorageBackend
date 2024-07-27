export const fetchBookingFromRoomQuery = `SELECT *
FROM bookings
WHERE room = $1
  AND CURRENT_TIMESTAMP BETWEEN checkin AND checkout;
`