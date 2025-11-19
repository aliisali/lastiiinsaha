/*
  # Add Installation Scheduling Fields and Statuses

  ## Overview
  This migration adds support for the deposit payment validation and installation scheduling workflow.

  ## Changes Made

  ### 1. New Job Status Values
  - `deposit-paid-pending-schedule` - Deposit has been paid, installation needs to be scheduled
  - `pending-installation-schedule` - Alternative status for pending installation scheduling

  ### 2. New Job Fields
  - `deposit_paid_at` (timestamptz) - Timestamp when deposit was paid
  - `needs_installation_scheduling` (boolean) - Flag indicating job requires installation scheduling
  - `installation_scheduling_skipped` (boolean) - Flag indicating scheduling was deferred

  ## Purpose
  These changes enforce a controlled workflow where:
  1. Deposit payment is required before installation scheduling
  2. Jobs awaiting installation scheduling are tracked separately
  3. Business users can schedule installations from the Job Assignment Center

  ## Security
  - No RLS changes needed as these are just additional columns
  - Existing RLS policies will apply to the new fields
*/

-- Add new columns to jobs table
DO $$
BEGIN
  -- Add deposit_paid_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'deposit_paid_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN deposit_paid_at timestamptz DEFAULT NULL;
  END IF;

  -- Add needs_installation_scheduling column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'needs_installation_scheduling'
  ) THEN
    ALTER TABLE jobs ADD COLUMN needs_installation_scheduling boolean DEFAULT false;
  END IF;

  -- Add installation_scheduling_skipped column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'installation_scheduling_skipped'
  ) THEN
    ALTER TABLE jobs ADD COLUMN installation_scheduling_skipped boolean DEFAULT false;
  END IF;
END $$;

-- Add helpful comments to document the new fields
COMMENT ON COLUMN jobs.deposit_paid_at IS 'Timestamp when the deposit payment was received';
COMMENT ON COLUMN jobs.needs_installation_scheduling IS 'Indicates this job requires installation scheduling in the Job Assignment Center';
COMMENT ON COLUMN jobs.installation_scheduling_skipped IS 'Indicates installation scheduling was deferred by the user';

-- Create an index on needs_installation_scheduling for faster queries in Job Assignment Center
CREATE INDEX IF NOT EXISTS idx_jobs_needs_scheduling
ON jobs(needs_installation_scheduling)
WHERE needs_installation_scheduling = true;

-- Create an index on deposit_paid_at for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_jobs_deposit_paid_at
ON jobs(deposit_paid_at)
WHERE deposit_paid_at IS NOT NULL;
