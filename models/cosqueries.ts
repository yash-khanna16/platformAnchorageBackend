export const fetchBookingFromRoomQuery = `SELECT *
FROM bookings
WHERE room = $1
  AND CURRENT_TIMESTAMP BETWEEN checkin AND checkout;
`

export const updateOTPQuery = `UPDATE guests SET otp = $2, expiry= $3, tries = $4 where email = $1`

export const fetchOTPQuery = `SELECT otp, expiry, tries FROM guests where email=$1`;

export const fetchAllItemsQuery = `SELECT * FROM items;`

export const putItemQuery = `INSERT INTO items (item_id,name,description, price, type, category, available, time_to_prepare, base_price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`

export const addOrderQuery = `INSERT INTO orders (booking_id, room, remarks, created_at, status) VALUES ($1,$2,$3,$4,$5) RETURNING order_id;`

export const deleteOrderQuery = `DELETE FROM orders WHERE order_id = $1`;

export const deleteOrderDetailsQuery = `DELETE FROM order_details WHERE order_id = $1`;

export const fetchOrderByBookingIdQuery = `SELECT * FROM orders JOIN order_details ON orders.order_id = order_details.order_id JOIN items ON order_details.item_id = items.item_id WHERE orders.booking_id = $1 `

export const fetchAllOrdersQuery = `
  SELECT 
    orders.*,
    order_details.*,
    items.*,
    guests.name AS guest_name
  FROM orders 
  JOIN order_details ON orders.order_id = order_details.order_id 
  JOIN items ON order_details.item_id = items.item_id 
  JOIN (
    SELECT * FROM bookings 
    UNION ALL 
    SELECT * FROM logs
  ) AS all_bookings ON orders.booking_id = all_bookings.booking_id 
  JOIN guests ON all_bookings.guest_email = guests.email;
`;


export const updateOrderStatusQuery = `UPDATE orders SET status = $1 WHERE order_id = $2; `

export const updateItemQuery = `UPDATE items SET name = $1, description = $2, price = $3, type = $4, category = $5, available = $6, time_to_prepare = $7, base_price = $9 WHERE item_id = $8;`

export const deleteItemQuery = `DELETE FROM items WHERE item_id=$1`;

export const fetchOrderDetailsByOrderIdQuery = `  
SELECT 
    orders.*,
    order_details.*,
    items.*,
    guests.name AS guest_name
  FROM orders 
  JOIN order_details ON orders.order_id = order_details.order_id 
  JOIN items ON order_details.item_id = items.item_id 
  JOIN (
    SELECT * FROM bookings 
    UNION ALL 
    SELECT * FROM logs
  ) AS all_bookings ON orders.booking_id = all_bookings.booking_id 
  JOIN guests ON all_bookings.guest_email = guests.email
  WHERE orders.order_id = $1;`

  export const fetchBookingByEmailIdQuery = `SELECT * FROM guests JOIN bookings ON bookings.guest_email = guests.email where guests.email=$1`;

  export const fetchAvailabilityOfItemsQuery = "SELECT item_id,name, available FROM items WHERE item_id = ANY($1::text[])"
