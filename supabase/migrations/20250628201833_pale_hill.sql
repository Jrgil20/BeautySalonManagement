/*
  # Fix user registration database insertion

  1. Security Changes
    - Update RLS policies to allow proper user registration
    - Add policy for email confirmation flow
    - Fix admin policies to avoid conflicts

  2. Database Changes
    - Ensure proper user profile creation during registration
*/

-- First, let's check and fix the is_admin function to handle cases where user doesn't exist yet
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' AND is_active = true 
     FROM public.users 
     WHERE id = auth.uid()), 
    false
  );
$$;

-- Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to create their own profile during registration" ON public.users;
DROP POLICY IF EXISTS "Admins can read all salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can create salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can update salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete salon users" ON public.users;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own profile (prevent role/salon changes)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
    salon_id = (SELECT salon_id FROM public.users WHERE id = auth.uid())
  );

-- Policy for new user registration - this is the key policy for registration
CREATE POLICY "Allow users to create their own profile during registration"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin policies - these should not interfere with self-registration
CREATE POLICY "Admins can read all salon users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin can create users for others (not themselves)
CREATE POLICY "Admins can create salon users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() AND id != auth.uid());

-- Admin can update other users (not themselves through this policy)
CREATE POLICY "Admins can update salon users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (is_admin() AND id != auth.uid())
  WITH CHECK (is_admin());

-- Admin can delete other users (not themselves)
CREATE POLICY "Admins can delete salon users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (is_admin() AND id != auth.uid());

-- Add a policy to allow reading user data during the registration process
-- This helps with the signup flow
CREATE POLICY "Allow reading during registration"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Make sure the table has proper permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;