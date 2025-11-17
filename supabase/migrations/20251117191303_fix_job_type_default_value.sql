/*
  # Fix Job Type Default Value
  
  1. Changes
    - Change job_type column default from 'installation' to 'measurement'
    - This ensures new jobs default to measurement (the typical first step)
    - Maintains CHECK constraint for valid values: 'measurement', 'installation', 'task'
  
  2. Notes
    - Existing jobs are not affected
    - Only impacts new job creation when job_type is not explicitly provided
    - Measurement is a more logical default as it typically precedes installation
*/

-- Update the default value for job_type column
ALTER TABLE jobs ALTER COLUMN job_type SET DEFAULT 'measurement';