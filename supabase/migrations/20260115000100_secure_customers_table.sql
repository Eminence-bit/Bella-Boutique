-- Enhanced Security for Customers Table
-- Applied as part of security audit on 2026-01-15

-- ============================================
-- CUSTOMERS TABLE - Enhanced RLS Policies
-- ============================================

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;

-- Create admin-only policies for customers
CREATE POLICY "Admin only can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin only can insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin only can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin only can delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Add index for faster customer lookups by phone
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;

-- Add index for faster customer lookups by email
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON POLICY "Admin only can read customers" ON customers IS 
  'Security: Only admin users can view customer information';

COMMENT ON POLICY "Admin only can insert customers" ON customers IS 
  'Security: Only admin users can create new customers';

COMMENT ON POLICY "Admin only can update customers" ON customers IS 
  'Security: Only admin users can modify customer information';

COMMENT ON POLICY "Admin only can delete customers" ON customers IS 
  'Security: Only admin users can delete customers';

COMMENT ON TABLE customers IS 
  'Stores customer information for credit tracking and sales management. Admin access only.';
