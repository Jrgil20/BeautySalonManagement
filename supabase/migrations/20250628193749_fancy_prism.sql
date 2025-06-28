/*
  # Add user registration policy

  1. Security Changes
    - Add policy to allow new user registration
    - Allow authenticated users to insert their own user profile during signup
    - Ensure users can only create profiles with their own auth.uid()

  This policy is specifically needed for the registration flow where:
  1. User signs up with Supabase Auth (becomes authenticated)
  2. User profile needs to be created in the users table
  3. The auth.uid() matches the id being inserted
*/

-- Add policy to allow authenticated users to insert their own profile during registration
CREATE POLICY "Allow users to create their own profile during registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);