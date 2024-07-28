export const fetchMovementQuery = `SELECT 
    m.movement_id,
    m.pickup AS pickup_time,
    m.return AS return_time,
    m.number AS car_number,
    m.driver,
    p.passenger_id,
    c.name AS car_name,
    CASE
        WHEN b.booking_id IS NOT NULL OR l.booking_id IS NOT NULL THEN FALSE
        WHEN b.booking_id IS NOT NULL OR l.booking_id IS NOT NULL THEN FALSE
        ELSE TRUE
    END AS external_booking,
    CASE
        WHEN b.booking_id IS NOT NULL THEN g.name
        WHEN l.booking_id IS NOT NULL THEN lg.name
        ELSE ep.name
    END AS passenger_name,
    CASE
        WHEN b.booking_id IS NOT NULL THEN g.phone
        WHEN l.booking_id IS NOT NULL THEN lg.phone
        ELSE ep.phone
    END AS phone,
    m.location AS drop_location,
    CASE
        WHEN b.booking_id IS NOT NULL THEN g.company
        WHEN l.booking_id IS NOT NULL THEN lg.company
        ELSE ep.company
    END AS company,
    p.remark
FROM 
    public.movement m
LEFT JOIN 
    public.cars c ON m.car_number = c.number
LEFT JOIN 
    cars c ON m.number = c.name
LEFT JOIN 
    passenger p ON m.movement_id = p.movement_id
LEFT JOIN 
    bookings b ON p.passenger_id = b.booking_id
LEFT JOIN 
    logs l ON p.passenger_id = l.booking_id
LEFT JOIN 
    guests g ON b.guest_email = g.email
LEFT JOIN 
    guests lg ON l.guest_email = lg.email
LEFT JOIN 
    public.external_passenger ep ON p.passenger_id = ep.passenger_id
WHERE 
    (b.booking_id IS NULL AND l.booking_id IS NULL AND p.passenger_id IS NOT NULL)
    OR (b.booking_id IS NOT NULL)
    OR (l.booking_id IS NOT NULL)
ORDER BY m.movement_id, passenger_name;

`;

export const checkConflictQuery = `
SELECT *
FROM movement
WHERE
    (driver = $1 OR car_number = $2)
    AND
    (
    ($3 <= pickup_time AND $4 >= pickup_time) OR
    ($3 <= return_time AND $4 >= return_time) OR
    ($3 >= pickup_time AND $4 <= return_time) OR
    ($3 <= pickup_time AND $4 >= return_time) 
    )
`;

export const fetchAvailableCarsQuery = `
SELECT *
    FROM cars
    WHERE number NOT IN (
        SELECT m2.car_number
        FROM movement m2
        WHERE (
        ($1 <= m2.pickup_time AND $2 >= m2.pickup_time) OR
        ($1 <= m2.return_time AND $2 >= m2.return_time) OR
        ($1 >= m2.pickup_time AND $2 <= m2.return_time) OR
        ($1 <= m2.pickup_time AND $2 >= m2.return_time) 
        )
    );
`;
export const fetchAvailableDriversQuery = `
SELECT *
    FROM drivers
    WHERE name NOT IN (
        SELECT m2.driver
        FROM movement m2
        WHERE (
        ($1 <= m2.pickup_time AND $2 >= m2.pickup_time) OR
        ($1 <= m2.return_time AND $2 >= m2.return_time) OR
        ($1 >= m2.pickup_time AND $2 <= m2.return_time) OR
        ($1 <= m2.pickup_time AND $2 >= m2.return_time) 
        )
    );
`;
export const addCarQuery = `INSERT INTO cars (name,number) values ($1,$2)`;

export const deleteCarQuery = "DELETE FROM cars where number = $1";

export const addDriverQuery = "INSERT INTO drivers (name,phone) values ($1,$2)";

export const deleteDriverQuery = "DELETE FROM drivers WHERE name = $1";

export const fetchAllCarsQuery = `
SELECT 
    c.number AS number,c.name AS name,
    CASE 
        WHEN m.movement_id IS NULL THEN 1
        ELSE 0
    END AS status
FROM
    cars c
LEFT JOIN 
    movement m 
ON 
    c.number = m.car_number
    AND (CURRENT_TIMESTAMP BETWEEN m.pickup_time AND m.return_time);
`;

export const fetchAllDriversQuery = `SELECT 
    d.name AS name, d.phone as phone,
    CASE 
        WHEN m.movement_id IS NULL THEN 1
        ELSE 0
    END AS status
FROM 
    drivers d
LEFT JOIN 
    movement m 
ON 
    d.name = m.driver
    AND (CURRENT_TIMESTAMP BETWEEN m.pickup_time AND m.return_time);
;`;

export const fetchMovementByBookingIdQuery = `
  SELECT 
    m.movement_id,
    p.booking_id,
    m.car_number,
    m.driver,
    m.pickup_location,
    m.pickup_time,
    m.return_time,
    m.drop_location
  FROM 
    movement AS m
  INNER JOIN 
    passengers AS p
  ON 
    m.movement_id = p.movement_id
  WHERE 
    p.booking_id = $1
  UNION
  SELECT 
    ml.movement_id,
    pl.booking_id,
    ml.car_number,
    ml.driver,
    ml.pickup_location,
    ml.pickup_time,
    ml.return_time,
    ml.drop_location
  FROM 
    movement_logs AS ml
  INNER JOIN 
    passengers_logs AS pl
  ON 
    ml.movement_id = pl.movement_id
  WHERE 
    pl.booking_id = $1
`;
export const deleteMovementByBookingIdQueryFromPassengers = `
DELETE FROM passengers
WHERE booking_id = $1;
  `;
export const deleteMovementByBookingIdQueryFromPassengersLog = `
DELETE FROM passengers_logs
WHERE booking_id = $1;
  `;


  export const fetchMovementQueryByMovementId = `SELECT 
    m.movement_id,
    m.pickup_location,
    m.pickup_time,
    m.return_time,
    m.car_number,
    m.driver,
    p.booking_id,
    c.name AS car_name,
    CASE
        WHEN b.booking_id IS NOT NULL THEN FALSE
        ELSE TRUE
    END AS external_booking,
    CASE
        WHEN b.booking_id IS NOT NULL THEN g.name
        ELSE ep.name
    END AS passenger_name,
    p.passenger_id AS passenger_id,
    CASE
        WHEN b.booking_id IS NOT NULL THEN g.phone
        ELSE ep.phone
    END AS phone,
    m.drop_location AS drop_location,
    CASE
        WHEN b.booking_id IS NOT NULL THEN g.company
        ELSE ep.company
    END AS company,
    p.remark
FROM 
    movement m
LEFT JOIN 
    cars c ON m.car_number = c.number
LEFT JOIN 
    passengers p ON m.movement_id = p.movement_id
LEFT JOIN 
    bookings b ON p.booking_id = b.booking_id
LEFT JOIN 
    guests g ON b.guest_email = g.email
LEFT JOIN 
    external_passenger ep ON p.passenger_id = ep.passenger_id
WHERE 
    ((b.booking_id IS NULL AND p.passenger_id IS NOT NULL)
    OR (b.booking_id IS NOT NULL) )
    AND (m.movement_id=$1)
ORDER BY m.movement_id, passenger_name;
`;