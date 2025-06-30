/*
  # Populate salons table and update users table

  1. Data Migration
    - Insert unique salon_id and salon_name combinations from users table into salons table
    - Add foreign key constraint from users.salon_id to salons.id_salon
    - Remove salon_name column from users table

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity during migration

  3. Performance
    - Update indexes as needed
*/

-- First, populate the salons table with unique salon data from users table
INSERT INTO public.salons (id_salon, name, created_at, updated_at)
SELECT DISTINCT 
  salon_id, 
  salon_name,
  MIN(created_at) as created_at,
  now() as updated_at
FROM public.users 
WHERE salon_id IS NOT NULL AND salon_name IS NOT NULL
GROUP BY salon_id, salon_name
ON CONFLICT (id_salon) DO NOTHING;

-- Add foreign key constraint from users.salon_id to salons.id_salon
-- Use ON DELETE RESTRICT to prevent accidental deletion of salons with users
ALTER TABLE public.users 
ADD CONSTRAINT fk_users_salon_id 
FOREIGN KEY (salon_id) 
REFERENCES public.salons(id_salon) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Add comment to document the relationship
COMMENT ON CONSTRAINT fk_users_salon_id ON public.users IS 
'Foreign key constraint ensuring users.salon_id references a valid salon. ON DELETE RESTRICT prevents deletion of salons with associated users.';

-- Remove the salon_name column from users table since it's now in salons table
ALTER TABLE public.users DROP COLUMN IF EXISTS salon_name;