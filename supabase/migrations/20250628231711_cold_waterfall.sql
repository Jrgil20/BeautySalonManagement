/*
  # Add RLS policies for suppliers table

  1. Security
    - Add policy for authenticated users to read suppliers from their salon
    - Add policy for authenticated users to insert suppliers for their salon
    - Add policy for authenticated users to update suppliers from their salon
    - Add policy for authenticated users to delete suppliers from their salon

  2. Changes
    - Create SELECT policy: Users can read suppliers from their salon
    - Create INSERT policy: Users can insert suppliers for their salon
    - Create UPDATE policy: Users can update suppliers from their salon
    - Create DELETE policy: Users can delete suppliers from their salon
*/

-- Policy for reading suppliers from user's salon
CREATE POLICY "Users can read suppliers from their salon"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())));

-- Policy for inserting suppliers for user's salon
CREATE POLICY "Users can insert suppliers for their salon"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())));

-- Policy for updating suppliers from user's salon
CREATE POLICY "Users can update suppliers from their salon"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())))
  WITH CHECK (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())));

-- Policy for deleting suppliers from user's salon
CREATE POLICY "Users can delete suppliers from their salon"
  ON suppliers
  FOR DELETE
  TO authenticated
  USING (salon_id = ( SELECT users.salon_id
   FROM users
  WHERE (users.id = auth.uid())));