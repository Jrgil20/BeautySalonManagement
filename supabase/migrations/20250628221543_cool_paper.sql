/*
  # Add RLS policies for services table

  1. Security Policies
    - Enable authenticated users to read services from their salon
    - Enable authenticated users to insert services for their salon
    - Enable authenticated users to update services from their salon
    - Enable authenticated users to delete services from their salon

  2. Policy Details
    - All policies check that the service's salon_id matches the user's salon_id
    - Uses auth.uid() to get the current authenticated user
    - Joins with users table to get the user's salon_id
*/

-- Policy for SELECT operations
CREATE POLICY "Users can read services from their salon"
  ON services
  FOR SELECT
  TO authenticated
  USING (salon_id = (SELECT salon_id FROM public.users WHERE id = auth.uid()));

-- Policy for INSERT operations
CREATE POLICY "Users can insert services for their salon"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (salon_id = (SELECT salon_id FROM public.users WHERE id = auth.uid()));

-- Policy for UPDATE operations
CREATE POLICY "Users can update services from their salon"
  ON services
  FOR UPDATE
  TO authenticated
  USING (salon_id = (SELECT salon_id FROM public.users WHERE id = auth.uid()))
  WITH CHECK (salon_id = (SELECT salon_id FROM public.users WHERE id = auth.uid()));

-- Policy for DELETE operations
CREATE POLICY "Users can delete services from their salon"
  ON services
  FOR DELETE
  TO authenticated
  USING (salon_id = (SELECT salon_id FROM public.users WHERE id = auth.uid()));