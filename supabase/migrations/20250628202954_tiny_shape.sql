/*
  # Fix user registration and RLS policies

  1. Tables
    - Ensure users table exists with proper structure
    - Add missing constraints and indexes

  2. Security
    - Drop and recreate all RLS policies to avoid conflicts
    - Fix is_admin function to handle non-existent users
    - Enable proper user registration flow

  3. Functions
    - Update trigger function for updated_at
    - Fix is_admin function with proper error handling
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to create their own profile during registration" ON public.users;
DROP POLICY IF EXISTS "Allow reading during registration" ON public.users;
DROP POLICY IF EXISTS "Admins can read all salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can create salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can update salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete salon users" ON public.users;

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'employee',
  avatar text,
  is_active boolean NOT NULL DEFAULT true,
  salon_id text NOT NULL,
  salon_name text NOT NULL,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_key' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- Add check constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_email_format'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_role_valid'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT check_role_valid 
    CHECK (role IN ('admin', 'manager', 'employee'));
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_salon_id ON public.users (salon_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users (is_active);

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create or replace the is_admin function with proper error handling
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT role = 'admin' AND is_active = true
      FROM public.users
      WHERE id = auth.uid()
    ),
    false
  );
$$;

-- Create new RLS policies

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own profile (with restrictions)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing their role or salon_id
    role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
    salon_id = (SELECT salon_id FROM public.users WHERE id = auth.uid())
  );

-- Policy for new user registration - this is the key policy for registration
CREATE POLICY "Allow users to create their own profile during registration"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Temporary policy to allow reading during registration process
CREATE POLICY "Allow reading during registration"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin policies using the improved is_admin function
CREATE POLICY "Admins can read all salon users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can create salon users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() AND id != auth.uid());

CREATE POLICY "Admins can update salon users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (is_admin() AND id != auth.uid())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete salon users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (is_admin() AND id != auth.uid());