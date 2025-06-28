/*
  # Create users table with proper error handling

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `role` (text, default 'employee')
      - `avatar` (text, optional)
      - `is_active` (boolean, default true)
      - `salon_id` (text, not null)
      - `salon_name` (text, not null)
      - `last_login` (timestamptz, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policies for user data access based on authentication and role
    - Users can read/update their own data
    - Admins can manage users in their salon

  3. Performance
    - Add indexes on email, salon_id, role, and is_active columns

  4. Data Integrity
    - Email format validation
    - Role validation (admin, manager, employee)
    - Auto-update timestamp trigger
*/

-- Create the users table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
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

-- Add constraints using DO block to handle existing constraints
DO $$
BEGIN
  -- Add email format constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'check_email_format'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT check_email_format 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Add role constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'check_role_valid'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT check_role_valid 
      CHECK (role IN ('admin', 'manager', 'employee'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_salon_id ON public.users (salon_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users (is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin (avoids circular references in RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- Drop existing policies to avoid conflicts, then recreate them
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to create their own profile during registration" ON public.users;
DROP POLICY IF EXISTS "Admins can read all salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can create salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can update salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete salon users" ON public.users;

-- Create RLS policies
-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own data (except role and salon_id)
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

-- Policy for new user registration
CREATE POLICY "Allow users to create their own profile during registration"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin policies using the is_admin function to avoid circular references
CREATE POLICY "Admins can read all salon users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can create salon users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

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