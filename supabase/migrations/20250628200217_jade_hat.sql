-- Fix user registration and authentication issues

-- First, let's make sure the users table has the correct structure
-- and that RLS policies are properly configured

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow users to create their own profile during registration" ON users;
DROP POLICY IF EXISTS "Admins can create salon users" ON users;
DROP POLICY IF EXISTS "Admins can delete salon users" ON users;
DROP POLICY IF EXISTS "Admins can read all salon users" ON users;
DROP POLICY IF EXISTS "Admins can update salon users" ON users;

-- Recreate the is_admin function to be more reliable
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- Policy to allow users to insert their own profile during registration
-- This is crucial for the signup process
CREATE POLICY "Allow users to create their own profile during registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin policies using the improved function
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

-- Ensure the users table has proper constraints
-- Add missing constraints if they don't exist
DO $$
BEGIN
  -- Check if email format constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'check_email_format'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT check_email_format 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Check if role constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'check_role_valid'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT check_role_valid 
      CHECK (role IN ('admin', 'manager', 'employee'));
  END IF;
END $$;

-- Ensure indexes exist for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_salon_id ON users (salon_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

-- Make sure the updated_at trigger function exists and is working
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();