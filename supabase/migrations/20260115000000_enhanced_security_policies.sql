-- Enhanced Security Policies for Bella Boutique
-- Applied as part of security audit on 2026-01-15

-- ============================================
-- PRODUCTS TABLE - Enhanced RLS Policies
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Create admin-only policies for products
-- Only users with 'admin' role can insert products
CREATE POLICY "Admin only can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only users with 'admin' role can update products
CREATE POLICY "Admin only can update products"
  ON products
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

-- Only users with 'admin' role can delete products
CREATE POLICY "Admin only can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SALES TABLE - Enhanced RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON sales;

-- Create admin-only policies for sales
CREATE POLICY "Admin only can read sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin only can insert sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin only can update sales"
  ON sales
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

CREATE POLICY "Admin only can delete sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PROFILES TABLE - Enhanced Security
-- ============================================

-- Ensure users cannot escalate their own role
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile (except role)"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Add index on profiles.role for faster admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role = 'admin';

-- Add index on profiles.id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON POLICY "Admin only can insert products" ON products IS 
  'Security: Only admin users can create new products';

COMMENT ON POLICY "Admin only can update products" ON products IS 
  'Security: Only admin users can modify existing products';

COMMENT ON POLICY "Admin only can delete products" ON products IS 
  'Security: Only admin users can delete products';

COMMENT ON POLICY "Users can update own profile (except role)" ON profiles IS 
  'Security: Users can update their profile but cannot change their role';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- To verify policies are working, run these queries:
-- 1. Check all policies on products table:
--    SELECT * FROM pg_policies WHERE tablename = 'products';
-- 
-- 2. Check all policies on profiles table:
--    SELECT * FROM pg_policies WHERE tablename = 'profiles';
--
-- 3. Check admin users:
--    SELECT id, role, created_at FROM profiles WHERE role = 'admin';
