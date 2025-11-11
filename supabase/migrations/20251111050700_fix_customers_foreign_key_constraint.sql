/*
  # Fix Customers Foreign Key Constraint
  
  1. Changes
    - Drop existing foreign key constraint that's causing issues
    - Recreate with proper NULL handling
    - Make business_id nullable for customers
    - Allow customers to be created without business assignment initially
    
  2. Purpose
    - Fix "violates foreign key constraint fk_customers_business" error
    - Allow flexible customer creation
    - Maintain data integrity while being practical
*/

-- Drop the existing problematic foreign key constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS fk_customers_business;

-- Make business_id nullable if it isn't already
ALTER TABLE customers ALTER COLUMN business_id DROP NOT NULL;

-- Add back the foreign key with ON DELETE SET NULL for safety
ALTER TABLE customers 
  ADD CONSTRAINT fk_customers_business 
  FOREIGN KEY (business_id) 
  REFERENCES businesses(id) 
  ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);