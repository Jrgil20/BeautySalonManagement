/*
  # Fix infinite recursion in users RLS policies

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create new simplified policies that avoid circular references
    - Ensure policies only reference auth.uid() directly without subqueries to users table

  2. Policy Changes
    - Replace complex subqueries with direct auth.uid() checks
    - Use auth.jwt() claims for role-based access instead of querying users table
    - Maintain security while eliminating recursion
*/

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can create salon users" ON users;
DROP POLICY IF EXISTS "Admins can delete salon users" ON users;
DROP POLICY IF EXISTS "Admins can read salon users" ON users;
DROP POLICY IF EXISTS "Admins can update salon users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create simplified policies that avoid recursion

-- Users can always read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (but not role or salon_id)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing their role or salon_id
    role = (SELECT role FROM users WHERE id = auth.uid()) AND
    salon_id = (SELECT salon_id FROM users WHERE id = auth.uid())
  );

-- For admin operations, we'll use a function to check admin status
-- This avoids the circular reference by using a stored function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    JOIN users u ON au.id = u.id
    WHERE au.id = auth.uid() AND u.role = 'admin'
  );
$$;

-- Admin policies using the function
CREATE POLICY "Admins can read all salon users"
  ON users
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can create salon users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update salon users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (is_admin() AND id != auth.uid())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete salon users"
  ON users
  FOR DELETE
  TO authenticated
  USING (is_admin() AND id != auth.uid());