/*
  # Add Parent Job Data Column to Jobs Table

  1. Changes
    - Add `parent_job_data` JSONB column to `jobs` table to cache parent measurement job data
    - This allows installation jobs to have immediate access to measurement data without additional queries
    - Improves performance and ensures data is available even if parent job is modified

  2. Notes
    - Column is nullable and only used for installation jobs created from measurement jobs
    - Data is stored as JSONB for flexible structure and efficient querying
    - Existing jobs are not affected
*/

-- Add parent_job_data column to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'parent_job_data'
  ) THEN
    ALTER TABLE jobs ADD COLUMN parent_job_data JSONB DEFAULT NULL;
  END IF;
END $$;

-- Add index for efficient queries on parent job data
CREATE INDEX IF NOT EXISTS idx_jobs_parent_job_id ON jobs(parent_job_id) WHERE parent_job_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN jobs.parent_job_data IS 'Cached parent job data for installation jobs created from measurement jobs. Stores complete measurement job information as JSONB for fast access.';