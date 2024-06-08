export const RoomsBookedPerDay = `
WITH daily_bookings AS (
  SELECT 
    dr.booking_date, 
    COUNT(b.room) AS rooms_booked
  FROM 
    generate_series(
      date_trunc('month', make_date($1, $2, 1)),
      CASE 
        WHEN $1 = EXTRACT(YEAR FROM current_date) AND $2 = EXTRACT(MONTH FROM current_date) THEN current_date
        ELSE date_trunc('month', make_date($1, $2, 1)) + interval '1 month' - interval '1 day'
      END,
      interval '1 day'
    ) AS dr(booking_date)
  LEFT JOIN 
    bookings b ON dr.booking_date BETWEEN b.checkin AND b.checkout
  GROUP BY 
    dr.booking_date
  ORDER BY 
    dr.booking_date
)
SELECT 
  booking_date, 
  rooms_booked
FROM 
  daily_bookings;
`;

export const averageCompanyBookingForMonthandYear = `WITH daily_bookings AS (
        SELECT 
          dr.booking_date, 
          g.company, 
          COUNT(b.room) AS rooms_booked
        FROM 
          generate_series(
            date_trunc('month', make_date($1, $2, 1)),
            CASE 
              WHEN $1 = EXTRACT(YEAR FROM current_date) AND $2 = EXTRACT(MONTH FROM current_date) THEN current_date
              ELSE date_trunc('month', make_date($1, $2, 1)) + interval '1 month' - interval '1 day'
            END,
            interval '1 day'
          ) AS dr(booking_date)
        LEFT JOIN 
          bookings b ON dr.booking_date BETWEEN b.checkin AND b.checkout
        LEFT JOIN 
          guests g ON b.guest_email = g.email
        GROUP BY 
          dr.booking_date, g.company
      )
      SELECT 
        company, 
        AVG(rooms_booked) AS average_rooms_booked
      FROM 
        daily_bookings
      GROUP BY 
        company
      ORDER BY 
        company;`;

export const AverageMealsBoughtPerDay = `
  WITH daily_meals AS (
    SELECT 
      dr.booking_date,
      (b.meal_veg + b.meal_non_veg + b.breakfast) / (EXTRACT(EPOCH FROM (b.checkout - b.checkin)) / 86400 + 1) AS daily_meals
    FROM 
      generate_series(
        date_trunc('month', make_date($1, $2, 1)),
        CASE 
          WHEN $1 = EXTRACT(YEAR FROM current_date) AND $2 = EXTRACT(MONTH FROM current_date) THEN current_date
          ELSE date_trunc('month', make_date($1, $2, 1)) + interval '1 month' - interval '1 day'
        END,
        interval '1 day'
      ) AS dr(booking_date)
    LEFT JOIN bookings b ON dr.booking_date BETWEEN b.checkin AND b.checkout
  )
  SELECT 
    booking_date, 
    AVG(daily_meals) AS average_meals_per_day
  FROM 
    daily_meals
  GROUP BY 
    booking_date
  ORDER BY 
    booking_date;
`;
