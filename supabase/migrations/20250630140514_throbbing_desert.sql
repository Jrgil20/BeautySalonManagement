/*
  # Add RLS policies for products table

  1. Security
    - Add policy for authenticated users to read products from their salon
    - Add policy for authenticated users to insert products for their salon
    - Add policy for authenticated users to update products from their salon
    - Add policy for authenticated users to delete products from their salon

  2. Notes
    - Products table already has RLS enabled but was missing policies
    - Policies ensure users can only access products from their own salon
    - Uses the same pattern as suppliers and services tables
*/

-- Policy for reading products from user's salon
CREATE POLICY "Users can read products from their salon"
  ON products
  FOR SELECT
  TO authenticated
  USING (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())));

-- Policy for inserting products for user's salon
CREATE POLICY "Users can insert products for their salon"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())));

-- Policy for updating products from user's salon
CREATE POLICY "Users can update products from their salon"
  ON products
  FOR UPDATE
  TO authenticated
  USING (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())))
  WITH CHECK (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())));

-- Policy for deleting products from user's salon
CREATE POLICY "Users can delete products from their salon"
  ON products
  FOR DELETE
  TO authenticated
  USING (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())));