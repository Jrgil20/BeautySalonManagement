/*
  # Fix User Registration RLS Policies

  This migration fixes the Row Level Security policies for the users table to ensure
  that new users can successfully create their profile records during registration.

  ## Changes Made
  1. Drop and recreate the admin policies to prevent conflicts with self-registration
  2. Ensure the admin creation policy only applies when creating other users
  3. Maintain all existing security while fixing the registration flow

  ## Security
  - Users can still only read/update their own data
  - Admins can still manage users in their salon
  - Self-registration works without conflicts
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can create salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can update salon users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete salon users" ON public.users;

-- Recreate admin policies with proper conditions to avoid conflicts
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