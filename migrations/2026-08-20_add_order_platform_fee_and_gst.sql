-- Run this against the production database before deploying the backend
-- changes on the feature/gst-and-platform-fee branch. It adds columns to
-- persist the platform fee and GST actually charged on each order, so
-- historical orders keep showing what was really charged even after a
-- future fee/rate change (rather than being reinterpreted at today's rate).
--
-- Existing rows default to 0 for all three columns - we deliberately do not
-- backfill a guessed historical value (e.g. the old ₹2 platform fee), so
-- old orders simply show no fee/GST rather than a fabricated number. Only
-- orders placed after this migration (and the corresponding code deploy)
-- will have these populated.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee_gst NUMERIC DEFAULT 0;
