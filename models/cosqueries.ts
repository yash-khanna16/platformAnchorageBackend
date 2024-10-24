export const fetchBookingFromRoomQuery = `SELECT *
FROM bookings
WHERE room = $1
AND CURRENT_TIMESTAMP BETWEEN checkin AND checkout;
`;

export const updateOTPQuery = `UPDATE guests SET otp = $2, expiry= $3, tries = $4 where email = $1`;

export const fetchOTPQuery = `SELECT otp, expiry, tries FROM guests where email=$1`;

export const fetchAllItemsQuery = `SELECT * FROM items JOIN category ON items.category_id=category.category_id;`;

export const addOrderQuery = `INSERT INTO orders (booking_id, room, remarks, created_at, status) VALUES ($1,$2,$3,$4,$5) RETURNING order_id;`;

export const deleteOrderQuery = `DELETE FROM orders WHERE order_id = $1`;

export const deleteOrderDetailsQuery = `DELETE FROM order_details WHERE order_id = $1`;

export const fetchOrderByBookingIdQuery = `
  SELECT 
    orders.order_id, 
    orders.booking_id, 
    orders.created_at, 
    order_details.item_id, 
    orders.status,
    order_details.name, 
    order_details.description, 
    order_details.qty,
    order_details.type,
    order_details.price,
    orders.rating,
    orders.feedback,
    order_details.category
  FROM 
    orders 
    JOIN order_details ON orders.order_id = order_details.order_id 
  WHERE 
    orders.booking_id = $1
    ORDER BY created_at DESC;
`;

export const fetchAllOrdersQuery = `
  SELECT 
    orders.*,
    order_details.*,
    guests.name AS guest_name,
    guests.email AS guest_email
  FROM orders 
  JOIN order_details ON orders.order_id = order_details.order_id 
  left JOIN (
    SELECT * FROM bookings 
    UNION ALL 
    SELECT * FROM logs
  ) AS all_bookings ON orders.booking_id = all_bookings.booking_id 
  left JOIN guests ON all_bookings.guest_email = guests.email;
`;

export const updateOrderStatusQuery = `UPDATE orders SET status = $1 WHERE order_id = $2; `;

export const updateItemQuery = `UPDATE items SET name = $1, description = $2, price = $3, type = $4, category_id = $5, available = $6, time_to_prepare = $7, base_price = $9 WHERE item_id = $8;`;

export const deleteItemQuery = `DELETE FROM items WHERE item_id=$1`;

export const fetchOrderDetailsByOrderIdQuery = `  
SELECT 
    orders.*,
    order_details.*,
    items.*,
    guests.name AS guest_name,
    guests.email AS guest_email
  FROM orders 
  JOIN order_details ON orders.order_id = order_details.order_id 
  JOIN items ON order_details.item_id = items.item_id 
  JOIN (
    SELECT * FROM bookings 
    UNION ALL 
    SELECT * FROM logs
  ) AS all_bookings ON orders.booking_id = all_bookings.booking_id 
  JOIN guests ON all_bookings.guest_email = guests.email
  WHERE orders.order_id = $1;`;

export const fetchBookingByEmailIdQuery = `SELECT * FROM guests JOIN bookings ON bookings.guest_email = guests.email where guests.email=$1`;

export const fetchBookingByBookingIdQuery = `SELECT * FROM guests JOIN bookings ON bookings.guest_email = guests.email where bookings.booking_id=$1`;

export const fetchAvailabilityOfItemsQuery = "SELECT item_id,name, available FROM items WHERE item_id = ANY($1::text[])";

export const setDelayQuery = 'UPDATE orders SET delay=$1 WHERE order_id=$2;'

export const updateFeedbackQuery = 'UPDATE orders SET rating = $1, feedback = $2 WHERE order_id=$3;'

export const fetchFeedbackCOSQuery = `SELECT * FROM feedback where booking_id = $1;`

export const insertFeedbackCOSQuery = `INSERT INTO feedback (type, booking_id, rating, comment, last_modified) VALUES ($1,$2,$3,$4,$5);`

export const fetchCategoryQuery = `SELECT * FROM category where category = $1;`

export const addCategoryQuery = `INSERT INTO category (category_id,category,sequence) VALUES($1,$2,$3)`

export const updateCategorySequenceQuery = 'UPDATE category SET sequence=$2 WHERE category=$1'

export const updateCategoryNameQuery = 'UPDATE category SET category=$2 WHERE category=$1'

export const getCategoryItemsCountQuery = `SELECT * FROM items WHERE category_id = (SELECT category_id FROM items WHERE item_id = $1)`

export const deleteCategoryQuery = `DELETE  FROM category WHERE category_id = (SELECT category_id FROM items WHERE item_id = $1)`


export const fetchBestSellerQuery = `WITH RankedItems AS (
    SELECT 
        category, 
        name, 
        COUNT(*) AS occurrence_count,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY COUNT(*) DESC) AS rank
    FROM order_details
    GROUP BY category, name
)
SELECT category, name, occurrence_count
FROM RankedItems
WHERE rank <= 2
ORDER BY category, occurrence_count DESC;`
