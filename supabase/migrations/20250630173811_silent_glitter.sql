/*
  # Create salons table

  1. New Tables
    - `salons`
      - `id_salon` (text, primary key)
      - `name` (text, not null)
      - `address` (text, optional)
      - `phone` (text, optional)
      - `email` (text, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `salons` table
    - Add policies for salon data access

  3. Performance
    - Add indexes on name and email columns

  4. Data Integrity
    - Email format validation
    - Auto-update timestamp trigger
*/

-- Create the salons table
CREATE TABLE IF NOT EXISTS public.salons (
  id_salon text PRIMARY KEY,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Add email format constraint
  CONSTRAINT check_salon_email_format 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_salons_name ON public.salons (name);
CREATE INDEX IF NOT EXISTS idx_salons_email ON public.salons (email);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_salons_updated_at ON public.salons;
CREATE TRIGGER update_salons_updated_at
  BEFORE UPDATE ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for salons
-- Users can read salon data for their own salon
CREATE POLICY "Users can read their salon data"
  ON public.salons
  FOR SELECT
  TO authenticated
  USING (id_salon = (SELECT salon_id FROM public.users WHERE id = auth.uid()));

-- Admins can update their salon data
CREATE POLICY "Admins can update their salon data"
  ON public.salons
  FOR UPDATE
  TO authenticated
  USING (
    id_salon = (SELECT salon_id FROM public.users WHERE id = auth.uid()) AND
    is_admin()
  )
  WITH CHECK (
    id_salon = (SELECT salon_id FROM public.users WHERE id = auth.uid()) AND
    is_admin()
  );

-- Admins can insert new salons (for registration process)
CREATE POLICY "Admins can create salons"
  ON public.salons
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR auth.uid() IS NOT NULL);