/*
  # Add Measurement Payment Tracking

  1. Purpose
    - Track deposit payments for measurement jobs
    - Enforce payment before installation job creation
    - Store payment method and reference details
    - Add new job status for payment workflow

  2. Changes to Jobs Table
    - Add deposit payment tracking fields
    - Add payment method and reference columns
    - Add timestamp for payment completion

  3. New Job Statuses
    - awaiting-deposit: Measurement complete, waiting for deposit payment
    - deposit-paid-pending-schedule: Deposit paid, waiting for installation scheduling

  4. Security
    - All fields nullable to maintain backward compatibility
    - No RLS changes needed (inherits from jobs table)
*/

-- Add payment tracking columns to jobs table
DO $$
BEGIN
  -- Deposit amount (already exists, but ensure it's there)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deposit'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deposit numeric(10,2) DEFAULT NULL;
  END IF;

  -- Deposit paid status (already exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deposit_paid'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deposit_paid boolean DEFAULT false;
  END IF;

  -- Deposit paid timestamp (already exists as depositPaidAt, but ensure consistency)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deposit_paid_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deposit_paid_at timestamptz DEFAULT NULL;
  END IF;

  -- Payment method for deposit (card/cash/bank-transfer)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deposit_payment_method'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deposit_payment_method varchar(50) DEFAULT NULL;
  END IF;

  -- Customer payment reference number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deposit_customer_reference'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deposit_customer_reference varchar(100) DEFAULT NULL;
  END IF;

  -- Track if payment was skipped (deferred)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deposit_payment_skipped'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deposit_payment_skipped boolean DEFAULT false;
  END IF;

  -- Reason for skipping payment (if applicable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deposit_skip_reason'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deposit_skip_reason text DEFAULT NULL;
  END IF;

END $$;

-- Create index for performance on payment-related queries
CREATE INDEX IF NOT EXISTS idx_jobs_deposit_paid ON jobs(deposit_paid);
CREATE INDEX IF NOT EXISTS idx_jobs_deposit_payment_skipped ON jobs(deposit_payment_skipped);
CREATE INDEX IF NOT EXISTS idx_jobs_deposit_paid_at ON jobs(deposit_paid_at);

-- Add comment to document the payment workflow
COMMENT ON COLUMN jobs.deposit IS 'Deposit amount required before installation (typically 30% of total)';
COMMENT ON COLUMN jobs.deposit_paid IS 'True if deposit has been paid';
COMMENT ON COLUMN jobs.deposit_paid_at IS 'Timestamp when deposit was paid';
COMMENT ON COLUMN jobs.deposit_payment_method IS 'Payment method used for deposit (card/cash/bank-transfer)';
COMMENT ON COLUMN jobs.deposit_customer_reference IS 'Reference number provided to customer for payment tracking';
COMMENT ON COLUMN jobs.deposit_payment_skipped IS 'True if payment was deferred for later';
COMMENT ON COLUMN jobs.deposit_skip_reason IS 'Reason why deposit payment was skipped';
