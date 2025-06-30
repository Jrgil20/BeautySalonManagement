/*
  # Add foreign key constraints to other tables

  1. Foreign Key Constraints
    - Add FK constraint from products.salon_id to salons.id_salon
    - Add FK constraint from services.salon_id to salons.id_salon
    - Add FK constraint from suppliers.salon_id to salons.id_salon

  2. Data Integrity
    - Use ON DELETE RESTRICT to prevent accidental deletion of salons with data
    - Use ON UPDATE CASCADE to maintain referential integrity

  3. Performance
    - Existing indexes on salon_id columns will support FK constraints
*/

-- Add foreign key constraint from products.salon_id to salons.id_salon
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_salon_id 
FOREIGN KEY (salon_id) 
REFERENCES public.salons(id_salon) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Add comment to document the relationship
COMMENT ON CONSTRAINT fk_products_salon_id ON public.products IS 
'Foreign key constraint ensuring products.salon_id references a valid salon. ON DELETE RESTRICT prevents deletion of salons with associated products.';

-- Add foreign key constraint from services.salon_id to salons.id_salon
ALTER TABLE public.services 
ADD CONSTRAINT fk_services_salon_id 
FOREIGN KEY (salon_id) 
REFERENCES public.salons(id_salon) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Add comment to document the relationship
COMMENT ON CONSTRAINT fk_services_salon_id ON public.services IS 
'Foreign key constraint ensuring services.salon_id references a valid salon. ON DELETE RESTRICT prevents deletion of salons with associated services.';

-- Add foreign key constraint from suppliers.salon_id to salons.id_salon
ALTER TABLE public.suppliers 
ADD CONSTRAINT fk_suppliers_salon_id 
FOREIGN KEY (salon_id) 
REFERENCES public.salons(id_salon) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Add comment to document the relationship
COMMENT ON CONSTRAINT fk_suppliers_salon_id ON public.suppliers IS 
'Foreign key constraint ensuring suppliers.salon_id references a valid salon. ON DELETE RESTRICT prevents deletion of salons with associated suppliers.';