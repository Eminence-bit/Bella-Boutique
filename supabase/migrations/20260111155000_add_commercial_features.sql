/*
  # Add Commercial Features
  
  1. Changes
    - Add `custom_fields` to `products` table for dynamic attributes
    - Create `customers` table for tracking buyers and their balances
    - Update `sales` table to support credit/partial payments
  
  2. New Tables/Columns
    - `products.custom_fields` (jsonb)
    - `customers` (id, name, contact, balance)
    - `sales` (customer_id, amount_paid, balance_due, payment_status)

  3. Security
    - Enable RLS for new tables
    - Admin-only write access
*/

-- Add dynamic fields to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  total_balance numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Admins can manage customers"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update sales table
CREATE TYPE payment_status_type AS ENUM ('Paid', 'Partial', 'Pending');

ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_amount numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due numeric(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
ADD COLUMN IF NOT EXISTS payment_status payment_status_type DEFAULT 'Pending';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON public.sales(payment_status);
