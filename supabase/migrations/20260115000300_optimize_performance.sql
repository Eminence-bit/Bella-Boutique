-- Performance Optimization Migration
-- Applied on 2026-01-15

-- ============================================
-- OPTIMIZE PRODUCTS TABLE
-- ============================================

-- Add composite index for common queries (category + status + created_at)
CREATE INDEX IF NOT EXISTS idx_products_category_status_created 
ON products(category, status, created_at DESC);

-- Add index for stock lookups
CREATE INDEX IF NOT EXISTS idx_products_stock 
ON products(stock) WHERE stock > 0;

-- Add index for price range queries
CREATE INDEX IF NOT EXISTS idx_products_price 
ON products(price);

-- ============================================
-- OPTIMIZE SALES TABLE
-- ============================================

-- Add composite index for sales queries
CREATE INDEX IF NOT EXISTS idx_sales_date_status 
ON sales(date DESC, payment_status);

-- Add index for customer sales lookup
CREATE INDEX IF NOT EXISTS idx_sales_customer_date 
ON sales(customer_id, date DESC) WHERE customer_id IS NOT NULL;

-- ============================================
-- OPTIMIZE PROFILES TABLE
-- ============================================

-- Add index for email lookups (if email is stored)
-- This helps with admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_created 
ON profiles(created_at DESC);

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

-- Update statistics for better query planning
ANALYZE products;
ANALYZE sales;
ANALYZE customers;
ANALYZE profiles;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON INDEX idx_products_category_status_created IS 
  'Optimizes catalog filtering by category and status with date sorting';

COMMENT ON INDEX idx_products_stock IS 
  'Optimizes queries for available products (stock > 0)';

COMMENT ON INDEX idx_sales_date_status IS 
  'Optimizes sales dashboard queries by date and payment status';
