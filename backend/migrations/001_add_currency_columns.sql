-- Migration: Add currency support to purchase_orders table
-- Created: 2024
-- Purpose: Add currency column and dual-price fields for USD/GBP support

-- Add currency column (TEXT, default USD)
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add price_usd column (NUMERIC for precision)
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS price_usd NUMERIC;

-- Add price_gbp column (NUMERIC for precision)
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS price_gbp NUMERIC;

-- Create index for currency filtering
CREATE INDEX IF NOT EXISTS idx_purchase_orders_currency ON purchase_orders(currency);

-- Update existing records: Set currency based on existing data
-- If price exists and currency is NULL/default, assume USD
UPDATE purchase_orders
SET currency = 'USD'
WHERE currency IS NULL;

-- Update existing records: Populate price_usd for USD orders
UPDATE purchase_orders
SET price_usd = price
WHERE currency = 'USD' AND price_usd IS NULL;

-- Update existing records: Populate price_gbp for GBP orders
UPDATE purchase_orders
SET price_gbp = price
WHERE currency = 'GBP' AND price_gbp IS NULL;

-- Verify the migration
SELECT
    'Columns added successfully' as status,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN currency = 'USD' THEN 1 END) as usd_rows,
    COUNT(CASE WHEN currency = 'GBP' THEN 1 END) as gbp_rows,
    COUNT(CASE WHEN price_usd IS NOT NULL THEN 1 END) as rows_with_usd_price,
    COUNT(CASE WHEN price_gbp IS NOT NULL THEN 1 END) as rows_with_gbp_price
FROM purchase_orders;
