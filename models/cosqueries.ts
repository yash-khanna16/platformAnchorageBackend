export const fetchBookingFromRoomQuery = `SELECT *
FROM bookings
WHERE room = $1
  AND CURRENT_TIMESTAMP BETWEEN checkin AND checkout;
`

export const updateOTPQuery = `UPDATE guests SET otp = $2, expiry= $3, tries = $4 where email = $1`

export const fetchOTPQuery = `SELECT otp, expiry, tries FROM guests where email=$1`;