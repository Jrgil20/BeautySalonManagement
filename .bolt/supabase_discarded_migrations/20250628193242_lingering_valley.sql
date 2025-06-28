/*
  # Create users table for authentication and user management

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `role` (text, not null, default 'employee')
      - `avatar` (text, optional)
      - `is_active` (boolean, default true)
      - `salon_id` (text, not null)
      - `salon_name` (text, not null)
      - `last_login` (timestamptz, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read their own data
    - Add policies for admins to manage users in their salon

  3. Constraints
    - Email format validation
    - Role validation (admin, manager, employee)
    - Foreign key reference to auth.users

  4. Indexes
    - Index on email for faster lookups
    - Index on salon_id for salon-based queries
    - Index on role for role-based queries

  5. Triggers
    - Auto-update updated_at timestamp on row updates
*/

-- Create the users table
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

-- Add constraints
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS check_role_valid 
CHECK (role IN ('admin', 'manager', 'employee'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_salon_id ON public.users (salon_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users (is_active);

-- Create function to update updated_at timestamp if it doesn't exist
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
    salon_id = (SELECT salon_id FROM public.users WHERE id = auth.uid()) AND
    role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- Policy for admins to read all users in their salon
CREATE POLICY "Admins can read salon users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    salon_id = (
      SELECT salon_id 
      FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to insert new users in their salon
CREATE POLICY "Admins can create salon users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    salon_id = (
      SELECT salon_id 
      FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update users in their salon
CREATE POLICY "Admins can update salon users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    salon_id = (
      SELECT salon_id 
      FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    salon_id = (
      SELECT salon_id 
      FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to delete users in their salon (except themselves)
CREATE POLICY "Admins can delete salon users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (
    id != auth.uid() AND
    salon_id = (
      SELECT salon_id 
      FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );