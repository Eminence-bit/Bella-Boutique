-- Fix products with empty or null categories
-- Applied as part of bug fix on 2026-01-15

-- Update any products with empty or null categories to 'Uncategorized'
UPDATE products 
SET category = 'Uncategorized' 
WHERE category IS NULL OR category = '' OR TRIM(category) = '';

-- Add constraint to prevent empty categories in future
ALTER TABLE products 
ADD CONSTRAINT check_category_not_empty 
CHECK (category IS NOT NULL AND TRIM(category) != '');

-- Add comment
COMMENT ON CONSTRAINT check_category_not_empty ON products IS 
  'Ensures category field is never empty or whitespace-only';
