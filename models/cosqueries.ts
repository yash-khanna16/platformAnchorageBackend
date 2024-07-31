export const fetchBookingFromRoomQuery = `SELECT *
FROM bookings
WHERE room = $1
  AND CURRENT_TIMESTAMP BETWEEN checkin AND checkout;
`

export const updateOTPQuery = `UPDATE guests SET otp = $2, expiry= $3, tries = $4 where email = $1`

export const fetchOTPQuery = `SELECT otp, expiry, tries FROM guests where email=$1`;

export const fetchAllItemsQuery = `SELECT * FROM items;`

export const putItemQuery = `INSERT INTO items (item_id,name,description, price, type, category) VALUES ($1,$2,$3,$4,$5,$6);`

export const addOrderQuery = `INSERT INTO orders (booking_id, room, remarks, created_at, status) VALUES ($1,$2,$3,$4,$5) RETURNING order_id;`

export const deleteOrderQuery = `DELETE FROM orders WHERE order_id = $1`;

export const deleteOrderDetailsQuery = `DELETE FROM order_details WHERE order_id = $1`;

export const fetchOrderByBookingIdQuery = `SELECT * FROM orders JOIN order_details ON orders.order_id = order_details.order_id WHERE orders.booking_id = $1 `

export const fetchAllOrdersQuery = `SELECT * FROM orders JOIN order_details ON orders.order_id = order_details.order_id `

