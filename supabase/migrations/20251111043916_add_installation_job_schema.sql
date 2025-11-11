/*
  # Add Installation Job Schema and Invoice Templates

  1. New Tables
    - `invoice_templates` - Store business invoice templates
    
  2. New Columns on Jobs Table
    - `installation_photos` (jsonb) - Array of photo URLs
    - `customer_signature` (text) - Base64 signature data
    - `signed_by` (text) - Customer name who signed
    - `signed_at` (timestamptz) - Signature timestamp
    - `final_payment_method` (varchar) - cash/bank_transfer/online
    - `final_payment_reference` (varchar) - Payment reference
    - `balance_paid` (boolean) - Balance payment status
    - `balance_paid_at` (timestamptz) - Balance payment timestamp
    - `invoice_number` (varchar) - Generated invoice number
    - `invoice_sent_at` (timestamptz) - Invoice sent timestamp

  3. Purpose
    - Track complete installation workflow
    - Store all installation evidence (photos, signature)
    - Record payment details
    - Link invoice templates to businesses
*/

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  content text NOT NULL,
  template_type varchar(50) DEFAULT 'standard',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add installation-related columns to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'installation_photos'
  ) THEN
    ALTER TABLE jobs ADD COLUMN installation_photos jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'customer_signature'
  ) THEN
    ALTER TABLE jobs ADD COLUMN customer_signature text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'signed_by'
  ) THEN
    ALTER TABLE jobs ADD COLUMN signed_by varchar(255) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'signed_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN signed_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'final_payment_method'
  ) THEN
    ALTER TABLE jobs ADD COLUMN final_payment_method varchar(50) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'final_payment_reference'
  ) THEN
    ALTER TABLE jobs ADD COLUMN final_payment_reference varchar(255) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'balance_paid'
  ) THEN
    ALTER TABLE jobs ADD COLUMN balance_paid boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'balance_paid_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN balance_paid_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE jobs ADD COLUMN invoice_number varchar(255) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'invoice_sent_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN invoice_sent_at timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Enable RLS on invoice_templates
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_templates
CREATE POLICY "Users can view templates from their business"
  ON invoice_templates FOR SELECT
  USING (true);

CREATE POLICY "Business users can manage their templates"
  ON invoice_templates FOR ALL
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_templates_business ON invoice_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_invoice_number ON jobs(invoice_number);
CREATE INDEX IF NOT EXISTS idx_jobs_balance_paid ON jobs(balance_paid);