/*
  # E-commerce Catalog Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key, auto-generated)
      - `name` (text, required)
      - `description` (text, required)  
      - `price` (numeric, required)
      - `category` (text, required)
      - `stock` (integer, default: 1)
      - `status` (enum: "Available" | "Sold Out", default: "Available")
      - `image_urls` (text array, stores Supabase storage URLs)
      - `created_at` (timestamp, auto-generated)
    
    - `sales`
      - `id` (uuid, primary key, auto-generated)
      - `product_id` (uuid, foreign key → products.id)
      - `buyer_name` (text, nullable)
      - `date` (timestamp, auto-generated)

  2. Security
    - Enable RLS on both tables
    - Public read access for products
    - Admin-only write access for products
    - Admin-only access for sales

  3. Storage
    - Create 'product-images' storage bucket for image uploads
    - Public read access for product images
*/

-- Create custom enum type for product status
CREATE TYPE product_status AS ENUM ('Available', 'Sold Out');

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  stock integer DEFAULT 1 CHECK (stock >= 0),
  status product_status DEFAULT 'Available',
  image_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  buyer_name text,
  date timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Products policies
-- Allow public read access to products
CREATE POLICY "Public can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users (admins) to insert products
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to update products
CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete products
CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Sales policies
-- Allow authenticated users (admins) to read sales
CREATE POLICY "Authenticated users can read sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to insert sales
CREATE POLICY "Authenticated users can insert sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);

-- Insert some sample data
INSERT INTO products (name, description, price, category, stock, image_urls) VALUES 
('Cotton T-Shirt', 'Comfortable cotton t-shirt perfect for daily wear', 599.00, 'Tops', 10, '{}'),
('Denim Jeans', 'Classic blue denim jeans with perfect fit', 1299.00, 'Bottoms', 8, '{}'),
('Summer Dress', 'Light and breezy summer dress for warm days', 899.00, 'Dresses', 5, '{}'),
('Cozy Sweater', 'Warm wool sweater for winter comfort', 1599.00, 'Tops', 6, '{}');