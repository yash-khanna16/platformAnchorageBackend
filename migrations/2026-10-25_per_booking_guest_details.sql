-- Give every booking its own copy of the guest's details.
--
-- Why: name, phone, company, vessel, rank and ID used to live only on the
-- shared `guests` row, one row per email. Every booking that used the same
-- email shared (and overwrote) that one row, so:
--   * a new booking with a reused email changed the vessel/company/name shown
--     on older bookings with that email;
--   * check-in moved a booking onto an existing guest row and it suddenly
--     showed another person's name;
--   * check-in/edit renamed the shared row's email, leaving other bookings
--     pointing at an email with no guest row ("ghost" bookings that count
--     towards occupancy but are hidden from the room list).
--
-- This adds the six columns to `bookings` and `logs` (same names, same order,
-- so the existing `SELECT * FROM bookings UNION ALL SELECT * FROM logs`
-- queries keep working) and copies today's values in from `guests`.
--
-- Safe to run more than once: columns are only added if missing, and only
-- rows that have never been filled are copied. Run it once BEFORE deploying
-- the backend and once more right AFTER, to fill any booking the old backend
-- created in between.

-- Fail fast instead of queueing behind a long-running lock (which would make
-- the site hang while we wait).
SET lock_timeout = '5s';

BEGIN;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guest_name character varying,
  ADD COLUMN IF NOT EXISTS guest_phone character varying,
  ADD COLUMN IF NOT EXISTS guest_company character varying,
  ADD COLUMN IF NOT EXISTS guest_vessel character varying,
  ADD COLUMN IF NOT EXISTS guest_rank character varying,
  ADD COLUMN IF NOT EXISTS guest_id_number character varying;

ALTER TABLE logs
  ADD COLUMN IF NOT EXISTS guest_name character varying,
  ADD COLUMN IF NOT EXISTS guest_phone character varying,
  ADD COLUMN IF NOT EXISTS guest_company character varying,
  ADD COLUMN IF NOT EXISTS guest_vessel character varying,
  ADD COLUMN IF NOT EXISTS guest_rank character varying,
  ADD COLUMN IF NOT EXISTS guest_id_number character varying;

UPDATE bookings b
SET guest_name = g.name,
    guest_phone = g.phone,
    guest_company = g.company,
    guest_vessel = g.vessel,
    guest_rank = g.rank,
    guest_id_number = g.id
FROM guests g
WHERE g.email = b.guest_email
  AND b.guest_name IS NULL AND b.guest_phone IS NULL AND b.guest_company IS NULL
  AND b.guest_vessel IS NULL AND b.guest_rank IS NULL AND b.guest_id_number IS NULL;

UPDATE logs l
SET guest_name = g.name,
    guest_phone = g.phone,
    guest_company = g.company,
    guest_vessel = g.vessel,
    guest_rank = g.rank,
    guest_id_number = g.id
FROM guests g
WHERE g.email = l.guest_email
  AND l.guest_name IS NULL AND l.guest_phone IS NULL AND l.guest_company IS NULL
  AND l.guest_vessel IS NULL AND l.guest_rank IS NULL AND l.guest_id_number IS NULL;

COMMIT;
