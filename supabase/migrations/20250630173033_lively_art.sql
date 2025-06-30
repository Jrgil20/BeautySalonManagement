/*
  # Add Foreign Key for products.supplier_id

  1. Database Changes
    - Add foreign key constraint between products.supplier_id and suppliers.id_supplier
    - Ensure referential integrity between products and suppliers tables
    - Handle existing data that might not have valid supplier references

  2. Data Integrity
    - Products can only reference existing suppliers
    - When a supplier is deleted, products can have their supplier_id set to NULL
    - Prevents orphaned product records with invalid supplier references

  3. Performance
    - Foreign key constraint will automatically create an index if one doesn't exist
    - Improves query performance for joins between products and suppliers
*/

-- First, let's check if there are any products with supplier_id that don't exist in suppliers table
-- and set them to NULL to avoid foreign key constraint violations
UPDATE products 
SET supplier_id = NULL 
WHERE supplier_id IS NOT NULL 
AND supplier_id NOT IN (SELECT id_supplier FROM suppliers);

-- Add the foreign key constraint
-- ON DELETE SET NULL means if a supplier is deleted, the product's supplier_id becomes NULL
-- This preserves the product while removing the invalid reference
ALTER TABLE products 
ADD CONSTRAINT fk_products_supplier_id 
FOREIGN KEY (supplier_id) 
REFERENCES suppliers(id_supplier) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Add a comment to document the relationship
COMMENT ON CONSTRAINT fk_products_supplier_id ON products IS 
'Foreign key constraint ensuring products.supplier_id references a valid supplier. ON DELETE SET NULL preserves products when supplier is deleted.';