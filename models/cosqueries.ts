export const fetchBookingFromRoomQuery = `SELECT *
FROM bookings
WHERE room = $1
AND CURRENT_TIMESTAMP BETWEEN checkin AND checkout;
`;

export const updateOTPQuery = `UPDATE guests SET otp = $2, expiry= $3, tries = $4 where email = $1`;

export const fetchOTPQuery = `SELECT otp, expiry, tries FROM guests where email=$1`;

export const fetchAllItemsQuery = `SELECT * FROM items JOIN category ON items.category_id=category.category_id;`;

export const addOrderQuery = `INSERT INTO orders (booking_id, room, remarks, created_at, status, discount) VALUES ($1,$2,$3,$4,$5,$6) RETURNING order_id;`;

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
    order_details.category,
    orders.discount
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


export const fetchItemRestrictionQuery = `
SELECT
  *
FROM
 coupon_item_restriction AS cir
LEFT JOIN
  coupons as c
  ON cir.coupon_id = c.coupon_id
LEFT JOIN
  items as i
  ON i.item_id = cir.item_id
  WHERE c.coupon_id = $1;
`

export const fetchUserRestrictionQuery = `
SELECT
  *
FROM
  coupons AS c
JOIN
  coupon_user_restriction AS cur
  ON c.coupon_id = cur.coupon_id
WHERE c.coupon_id = $1;
  ;
`
export const fetchUsageRestrictionQuery = `
SELECT
  *
FROM
  coupons AS c
JOIN
  coupon_usage AS cur
  ON c.coupon_id = cur.coupon_id
WHERE c.coupon_id = $1 AND cur.user_email=$2;
  ;
`

export const fetchItemsQuery = `
  SELECT * FROM items JOIN category ON items.category_id = category.category_id
  WHERE items.item_id = ANY($1::varchar[]);
`;

export const fetchCouponFreeItemsQuery = `
  SELECT * FROM coupon_free_item AS cfi
  JOIN 
    items AS i
    ON cfi.item_id = i.item_id
  JOIN
    category AS c
    ON c.category_id = i.category_id
  WHERE coupon_id = $1;
  ;
`

export const putCouponUsageQuery = `
INSERT INTO coupon_usage 
(usage_id, coupon_id, user_email, order_id, is_redeemed, created_at, code, description, coupon_type, discount_value, max_discount, min_order_value, start_date, end_date, usage_limit, is_active, coupon_type_description, user_usage_limit, percentage_discount)
SELECT 
    $1, 
    c.coupon_id, 
    $3, 
    $4, 
    $5, 
    $6, 
    c.code, 
    c.description, 
    c.coupon_type, 
    c.discount_value, 
    c.max_discount, 
    c.min_order_value, 
    c.start_date, 
    c.end_date, 
    c.usage_limit, 
    c.is_active, 
    c.coupon_type_description, 
    c.user_usage_limit, 
    c.percentage_discount
FROM coupons c
WHERE c.coupon_id = $2;
`;

export const insertCouponUsageFreeItemsQuery = `
INSERT INTO coupon_usage_free_items (usage_id, item_id, qty, created_at)
SELECT 
    $1,
    cfi.item_id, 
    cfi.qty,  
    $3  
FROM coupon_free_item cfi
WHERE cfi.coupon_id = $2;
`;


export const fetchCouponUsageCountQuery = `SELECT 
    coupon_id,
    COUNT(*) AS usage_count
FROM 
    coupon_usage
WHERE 
    coupon_id = $1
    AND is_redeemed = true
GROUP BY 
    coupon_id;
`

export const fetchAllCouponsAdminQuery = `
SELECT 
  c.coupon_id,
  c.code,
  c.description,
  c.coupon_type,
  c.discount_value,
  c.max_discount,
  c.min_order_value,
  c.start_date,
  c.end_date,
  c.usage_limit,
  c.is_active,
  c.created_at,
  c.modified_at,
  c.coupon_type_description,
  c.user_usage_limit,
  c.percentage_discount,
  cfi.item_id,
  cfi.qty,
  i.name,
  i.price,
  i.type,
  i.category_id,
  i.available,
  i.time_to_prepare,
  i.base_price
FROM 
  coupons AS c
LEFT JOIN
  coupon_free_item AS cfi
ON
  cfi.coupon_id = c.coupon_id
LEFT JOIN
  items AS i
ON
  i.item_id = cfi.item_id
ORDER BY 
  c.is_active DESC,  -- Active coupons first (or modify according to your logic)
  c.code ASC;
`;

export const fetchAllCouponsQuery = `
SELECT c.*
FROM coupons c
LEFT JOIN coupon_user_restriction cur ON c.coupon_id = cur.coupon_id
WHERE c.is_active = true
  AND (cur.is_allowed = true AND cur.user_email = $1 OR cur.restriction_id IS NULL);

`;

export const fetchCouponDetailsQuery = `
SELECT
  *
FROM
  coupons AS c
  WHERE c.coupon_id = $1;
`;

export const fetchCategoryRestrictionQuery = `
SELECT
  *
FROM
  coupon_category_restriction AS ccr
LEFT JOIN
  coupons as c
  ON ccr.coupon_id = c.coupon_id
LEFT JOIN
  category as ct
  ON ct.category_id = ccr.category_id
  WHERE c.coupon_id = $1;`




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
