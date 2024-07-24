export const RoomsBookedPerDay = `
  WITH daily_series AS (
    SELECT 
      generate_series(
        date_trunc('month', make_date($1, $2, 1)),
        CASE 
          WHEN $1 = EXTRACT(YEAR FROM current_date) AND $2 = EXTRACT(MONTH FROM current_date) THEN current_date
          ELSE date_trunc('month', make_date($1, $2, 1)) + interval '1 month' - interval '1 day'
        END,
        interval '1 day'
      ) AS booking_date
  ),
  booking_counts AS (
    SELECT 
      ds.booking_date,
      b.booking_id,
      b.checkin,
      b.checkout,
      -- Calculate booking count for the current day
      CASE
        -- Full booking for the previous day if checkin time is before 08:00 AM
        WHEN ds.booking_date = date_trunc('day', b.checkin) - interval '1 day' AND b.checkin::time < '08:00:00' THEN 1
        -- Full booking for the check-in day
        WHEN ds.booking_date = date_trunc('day', b.checkin) THEN 1
        -- Full booking for days between check-in and checkout (inclusive)
        WHEN ds.booking_date > date_trunc('day', b.checkin) AND ds.booking_date < date_trunc('day', b.checkout) THEN 1
        -- Full booking for the checkout day if checkout time is after 06:00 PM
        WHEN ds.booking_date = date_trunc('day', b.checkout) AND b.checkout::time >= '18:00:00' THEN 1
        -- Half booking for the checkout day if checkout time is between 12:00 PM and 06:00 PM
        WHEN ds.booking_date = date_trunc('day', b.checkout) AND b.checkout::time >= '12:00:00' AND b.checkout::time < '18:00:00' THEN 0.5
        ELSE 0
      END AS booking_count
    FROM 
      daily_series ds
    LEFT JOIN 
      (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
      ON ds.booking_date BETWEEN date_trunc('day', b.checkin) - interval '1 day' AND date_trunc('day', b.checkout)
  )
  SELECT 
    booking_date, 
    SUM(booking_count) AS rooms_booked
  FROM 
    booking_counts
  GROUP BY 
    booking_date
  ORDER BY 
    booking_date;

`;
// export const RoomsBookedPerDay = `
// WITH daily_bookings AS (
//   SELECT 
//     dr.booking_date, 
//     COUNT(b.room) AS rooms_booked
//   FROM 
//     generate_series(
//       date_trunc('month', make_date($1, $2, 1)),
//       CASE 
//         WHEN $1 = EXTRACT(YEAR FROM current_date) AND $2 = EXTRACT(MONTH FROM current_date) THEN current_date
//         ELSE date_trunc('month', make_date($1, $2, 1)) + interval '1 month' - interval '1 day'
//       END,
//       interval '1 day'
//     ) AS dr(booking_date)
//   LEFT JOIN 
//     (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
//     ON dr.booking_date BETWEEN b.checkin AND b.checkout
//   GROUP BY 
//     dr.booking_date
//   ORDER BY 
//     dr.booking_date
// )
// SELECT 
//   booking_date, 
//   rooms_booked
// FROM 
//   daily_bookings;
// `

export const averageCompanyBookingForMonthandYear = `
WITH daily_bookings AS (
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
    (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
    ON dr.booking_date BETWEEN b.checkin AND b.checkout
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
  company;
`;

// export const RoomsBookedPerQuarter = `
// WITH quarterly_bookings AS (
//   SELECT 
//     dr.booking_date, 
//     COUNT(b.room) AS rooms_booked
//   FROM 
//     generate_series(
//       date_trunc('quarter', to_date($1::text || '-' || (($2 - 1) * 3 + 1)::text, 'YYYY-MM')),
//       CASE 
//         WHEN $1::int = EXTRACT(YEAR FROM current_date) AND $2::int = EXTRACT(QUARTER FROM current_date) THEN current_date
//         ELSE date_trunc('quarter', to_date($1::text || '-' || (($2 - 1) * 3 + 1)::text, 'YYYY-MM')) + interval '3 months' - interval '1 day'
//       END,
//       interval '1 day'
//     ) AS dr(booking_date)
//   LEFT JOIN 
//     (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
//     ON dr.booking_date BETWEEN b.checkin AND b.checkout
//   GROUP BY 
//     dr.booking_date
//   ORDER BY 
//     dr.booking_date
// )
// SELECT 
//   booking_date, 
//   rooms_booked
// FROM 
//   quarterly_bookings;

// `;

export const RoomsBookedPerQuarter = `
WITH daily_series AS (
  SELECT 
    generate_series(
      CASE 
        WHEN $2 = 1 THEN make_date($1, 1, 1)
        WHEN $2 = 2 THEN make_date($1, 4, 1)
        WHEN $2 = 3 THEN make_date($1, 7, 1)
        WHEN $2 = 4 THEN make_date($1, 10, 1)
      END,
      CASE 
        WHEN $1 = EXTRACT(YEAR FROM current_date) AND $2 = EXTRACT(QUARTER FROM current_date) THEN current_date
        WHEN $2 = 1 THEN make_date($1, 3, 31)
        WHEN $2 = 2 THEN make_date($1, 6, 30)
        WHEN $2 = 3 THEN make_date($1, 9, 30)
        WHEN $2 = 4 THEN make_date($1, 12, 31)
      END,
      interval '1 day'
    ) AS booking_date
),
booking_counts AS (
  SELECT 
    ds.booking_date,
    b.booking_id,
    b.checkin,
    b.checkout,
    -- Calculate booking count for the current day
    CASE
      -- Full booking for the previous day if checkin time is before 08:00 AM
      WHEN ds.booking_date = date_trunc('day', b.checkin) - interval '1 day' AND b.checkin::time < '08:00:00' THEN 1
      -- Full booking for the check-in day
      WHEN ds.booking_date = date_trunc('day', b.checkin) THEN 1
      -- Full booking for days between check-in and checkout (inclusive)
      WHEN ds.booking_date > date_trunc('day', b.checkin) AND ds.booking_date < date_trunc('day', b.checkout) THEN 1
      -- Full booking for the checkout day if checkout time is after 06:00 PM
      WHEN ds.booking_date = date_trunc('day', b.checkout) AND b.checkout::time >= '18:00:00' THEN 1
      -- Half booking for the checkout day if checkout time is between 12:00 PM and 06:00 PM
      WHEN ds.booking_date = date_trunc('day', b.checkout) AND b.checkout::time >= '12:00:00' AND b.checkout::time < '18:00:00' THEN 0.5
      ELSE 0
    END AS booking_count
  FROM 
    daily_series ds
  LEFT JOIN 
    (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
    ON ds.booking_date BETWEEN date_trunc('day', b.checkin) - interval '1 day' AND date_trunc('day', b.checkout)
)
SELECT 
  booking_date, 
  SUM(booking_count) AS rooms_booked
FROM 
  booking_counts
GROUP BY 
  booking_date
ORDER BY 
  booking_date;

  `;
export const AverageMealsBoughtPerDay = `
WITH date_range AS (
    SELECT
        DATE_TRUNC('month', TO_DATE($1 || '-' || $2 || '-01', 'YYYY-MM-DD')) AS start_date,
        CASE
            WHEN $1::INTEGER = EXTRACT(YEAR FROM CURRENT_DATE) AND $2::INTEGER = EXTRACT(MONTH FROM CURRENT_DATE) THEN CURRENT_DATE
            ELSE (DATE_TRUNC('month', TO_DATE($1 || '-' || $2 || '-01', 'YYYY-MM-DD')) + INTERVAL '1 month' - INTERVAL '1 day')
        END AS end_date
),
all_dates AS (
    SELECT
        generate_series(
            (SELECT start_date FROM date_range),
            (SELECT end_date FROM date_range),
            INTERVAL '1 day'
        )::date AS date
)
SELECT
    ad.date AS booking_date,
    COALESCE(SUM(COALESCE(m.lunch_veg, 0) + COALESCE(m.lunch_nonveg, 0) + COALESCE(m.dinner_veg, 0) + COALESCE(m.dinner_nonveg, 0)), 0) AS average_meals_per_day
FROM
    all_dates ad
LEFT JOIN
    public.meals m ON m.date = ad.date
GROUP BY
    ad.date
ORDER BY
    ad.date;


`;

export const AverageBreakfastBoughtPerDay = `
WITH date_range AS (
    SELECT
        DATE_TRUNC('month', TO_DATE($1 || '-' || $2 || '-01', 'YYYY-MM-DD')) AS start_date,
        CASE
            WHEN $1::INTEGER = EXTRACT(YEAR FROM CURRENT_DATE) AND $2::INTEGER = EXTRACT(MONTH FROM CURRENT_DATE) THEN CURRENT_DATE
            ELSE (DATE_TRUNC('month', TO_DATE($1 || '-' || $2 || '-01', 'YYYY-MM-DD')) + INTERVAL '1 month' - INTERVAL '1 day')
        END AS end_date
),
all_dates AS (
    SELECT
        generate_series(
            (SELECT start_date FROM date_range),
            (SELECT end_date FROM date_range),
            INTERVAL '1 day'
        )::date AS date
)
SELECT
    ad.date AS booking_date,
    COALESCE(SUM(COALESCE(m.breakfast_veg, 0) + COALESCE(m.breakfast_nonveg, 0)), 0) AS average_breakfasts_per_day
FROM
    all_dates ad
LEFT JOIN
    public.meals m ON m.date = ad.date
GROUP BY
    ad.date
ORDER BY
    ad.date;

`;

export const averageCompanyBookingForQuarterandYear = `
WITH quarterly_bookings AS (
  SELECT 
    dr.booking_date, 
    g.company, 
    COUNT(b.room) AS rooms_booked
  FROM 
    generate_series(
      date_trunc('quarter', to_date($1::text || '-' || (($2 - 1) * 3 + 1)::text, 'YYYY-MM')),
      CASE 
        WHEN $1::int = EXTRACT(YEAR FROM current_date) AND $2::int = EXTRACT(QUARTER FROM current_date) THEN current_date
        ELSE date_trunc('quarter', to_date($1::text || '-' || (($2 - 1) * 3 + 1)::text, 'YYYY-MM')) + interval '3 months' - interval '1 day'
      END,
      interval '1 day'
    ) AS dr(booking_date)
  LEFT JOIN 
    (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
    ON dr.booking_date BETWEEN b.checkin AND b.checkout
  LEFT JOIN 
    guests g ON b.guest_email = g.email
  GROUP BY 
    dr.booking_date, g.company
)
SELECT 
  company, 
  AVG(rooms_booked) AS average_rooms_booked
FROM 
  quarterly_bookings
GROUP BY 
  company
ORDER BY 
  company;
`;

export const AverageMealsBoughtPerQuarter = `
WITH date_range AS (
    SELECT
        DATE_TRUNC('quarter', TO_DATE($1 || '-' || ((($2 - 1) * 3 + 1)) || '-01', 'YYYY-MM-DD')) AS start_date,
        CASE
            WHEN $1::INTEGER = EXTRACT(YEAR FROM CURRENT_DATE) AND $2::INTEGER = EXTRACT(QUARTER FROM CURRENT_DATE) THEN CURRENT_DATE
            ELSE (DATE_TRUNC('quarter', TO_DATE($1 || '-' || ((($2 - 1) * 3 + 1)) || '-01', 'YYYY-MM-DD')) + INTERVAL '3 months' - INTERVAL '1 day')
        END AS end_date
),
all_dates AS (
    SELECT
        generate_series(
            (SELECT start_date FROM date_range),
            (SELECT end_date FROM date_range),
            INTERVAL '1 day'
        )::date AS date
)
SELECT
    ad.date AS booking_date,
    COALESCE(SUM(COALESCE(m.lunch_veg, 0) + COALESCE(m.lunch_nonveg, 0) + COALESCE(m.dinner_veg, 0) + COALESCE(m.dinner_nonveg, 0)), 0) AS average_meals_per_day
FROM
    all_dates ad
LEFT JOIN
    public.meals m ON m.date = ad.date
GROUP BY
    ad.date
ORDER BY
    ad.date;


`;

export const AverageBreakfastBoughtPerQuarter = `
WITH date_range AS (
    SELECT
        DATE_TRUNC('quarter', TO_DATE($1 || '-' || ((($2 - 1) * 3 + 1)) || '-01', 'YYYY-MM-DD')) AS start_date,
        CASE
            WHEN $1::INTEGER = EXTRACT(YEAR FROM CURRENT_DATE) AND $2::INTEGER = EXTRACT(QUARTER FROM CURRENT_DATE) THEN CURRENT_DATE
            ELSE (DATE_TRUNC('quarter', TO_DATE($1 || '-' || ((($2 - 1) * 3 + 1)) || '-01', 'YYYY-MM-DD')) + INTERVAL '3 months' - INTERVAL '1 day')
        END AS end_date
),
all_dates AS (
    SELECT
        generate_series(
            (SELECT start_date FROM date_range),
            (SELECT end_date FROM date_range),
            INTERVAL '1 day'
        )::date AS date
)
SELECT
    ad.date AS booking_date,
    COALESCE(SUM(COALESCE(m.breakfast_veg, 0) + COALESCE(m.breakfast_nonveg, 0)), 0) AS average_breakfasts_per_day
FROM
    all_dates ad
LEFT JOIN
    public.meals m ON m.date = ad.date
GROUP BY
    ad.date
ORDER BY
    ad.date;

`;

// export const RoomsBookedPerYear = `
// WITH yearly_bookings AS (
//   SELECT 
//     dr.booking_date, 
//     COUNT(b.room) AS rooms_booked
//   FROM 
//     generate_series(
//       date_trunc('year', make_date($1, 1, 1)),
//       CASE 
//         WHEN $1 = EXTRACT(YEAR FROM current_date) THEN current_date
//         ELSE date_trunc('year', make_date($1, 1, 1)) + interval '1 year' - interval '1 day'
//       END,
//       interval '1 day'
//     ) AS dr(booking_date)
//   LEFT JOIN 
//     (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
//     ON dr.booking_date BETWEEN b.checkin AND b.checkout
//   GROUP BY 
//     dr.booking_date
//   ORDER BY 
//     dr.booking_date
// )
// SELECT 
//   booking_date, 
//   rooms_booked
// FROM 
//   yearly_bookings;
// `;
export const RoomsBookedPerYear = `
WITH daily_series AS (
  SELECT 
    generate_series(
      make_date($1, 1, 1),
      CASE 
        WHEN $1 = EXTRACT(YEAR FROM current_date) THEN current_date
        ELSE make_date($1, 12, 31)
      END,
      interval '1 day'
    ) AS booking_date
),
booking_counts AS (
  SELECT 
    ds.booking_date,
    b.booking_id,
    b.checkin,
    b.checkout,
    -- Calculate booking count for the current day
    CASE
      -- Full booking for the previous day if checkin time is before 08:00 AM
      WHEN ds.booking_date = date_trunc('day', b.checkin) - interval '1 day' AND b.checkin::time < '08:00:00' THEN 1
      -- Full booking for the check-in day
      WHEN ds.booking_date = date_trunc('day', b.checkin) THEN 1
      -- Full booking for days between check-in and checkout (inclusive)
      WHEN ds.booking_date > date_trunc('day', b.checkin) AND ds.booking_date < date_trunc('day', b.checkout) THEN 1
      -- Full booking for the checkout day if checkout time is after 06:00 PM
      WHEN ds.booking_date = date_trunc('day', b.checkout) AND b.checkout::time >= '18:00:00' THEN 1
      -- Half booking for the checkout day if checkout time is between 12:00 PM and 06:00 PM
      WHEN ds.booking_date = date_trunc('day', b.checkout) AND b.checkout::time >= '12:00:00' AND b.checkout::time < '18:00:00' THEN 0.5
      ELSE 0
    END AS booking_count
  FROM 
    daily_series ds
  LEFT JOIN 
    (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
    ON ds.booking_date BETWEEN date_trunc('day', b.checkin) - interval '1 day' AND date_trunc('day', b.checkout)
)
SELECT 
  booking_date, 
  SUM(booking_count) AS rooms_booked
FROM 
  booking_counts
GROUP BY 
  booking_date
ORDER BY 
  booking_date;

`;

export const averageCompanyBookingForYear = `
WITH yearly_bookings AS (
  SELECT 
    dr.booking_date, 
    g.company, 
    COUNT(b.room) AS rooms_booked
  FROM 
    generate_series(
      date_trunc('year', make_date($1, 1, 1)),
      CASE 
        WHEN $1 = EXTRACT(YEAR FROM current_date) THEN current_date
        ELSE date_trunc('year', make_date($1, 1, 1)) + interval '1 year' - interval '1 day'
      END,
      interval '1 day'
    ) AS dr(booking_date)
  LEFT JOIN 
    (SELECT * FROM bookings UNION ALL SELECT * FROM logs) b 
    ON dr.booking_date BETWEEN b.checkin AND b.checkout
  LEFT JOIN 
    guests g ON b.guest_email = g.email
  GROUP BY 
    dr.booking_date, g.company
)
SELECT 
  company, 
  AVG(rooms_booked) AS average_rooms_booked
FROM 
  yearly_bookings
GROUP BY 
  company
ORDER BY 
  company;
`;
export const AverageMealsBoughtPerYear = `
WITH date_range AS (
    SELECT
        DATE_TRUNC('year', TO_DATE($1 || '-01-01', 'YYYY-MM-DD')) AS start_date,
        CASE
            WHEN $1::INTEGER = EXTRACT(YEAR FROM CURRENT_DATE) THEN CURRENT_DATE
            ELSE (DATE_TRUNC('year', TO_DATE($1 || '-01-01', 'YYYY-MM-DD')) + INTERVAL '1 year' - INTERVAL '1 day')
        END AS end_date
),
all_dates AS (
    SELECT
        generate_series(
            (SELECT start_date FROM date_range),
            (SELECT end_date FROM date_range),
            INTERVAL '1 day'
        )::date AS date
)
SELECT
    ad.date AS booking_date,
    COALESCE(SUM(COALESCE(m.lunch_veg, 0) + COALESCE(m.lunch_nonveg, 0) + COALESCE(m.dinner_veg, 0) + COALESCE(m.dinner_nonveg, 0)), 0) AS average_meals_per_day
FROM
    all_dates ad
LEFT JOIN
    public.meals m ON m.date = ad.date
GROUP BY
    ad.date
ORDER BY
    ad.date;
`;
export const AverageBreakfastBoughtPerYear = `
WITH date_range AS (
    SELECT
        DATE_TRUNC('year', TO_DATE($1 || '-01-01', 'YYYY-MM-DD')) AS start_date,
        CASE
            WHEN $1::INTEGER = EXTRACT(YEAR FROM CURRENT_DATE) THEN CURRENT_DATE
            ELSE (DATE_TRUNC('year', TO_DATE($1 || '-01-01', 'YYYY-MM-DD')) + INTERVAL '1 year' - INTERVAL '1 day')
        END AS end_date
),
all_dates AS (
    SELECT
        generate_series(
            (SELECT start_date FROM date_range),
            (SELECT end_date FROM date_range),
            INTERVAL '1 day'
        )::date AS date
)
SELECT
    ad.date AS booking_date,
    COALESCE(SUM(COALESCE(m.breakfast_veg, 0) + COALESCE(m.breakfast_nonveg, 0)), 0) AS average_breakfasts_per_day
FROM
    all_dates ad
LEFT JOIN
    public.meals m ON m.date = ad.date
GROUP BY
    ad.date
ORDER BY
    ad.date;
`;
