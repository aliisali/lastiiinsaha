/*
  # Add Demo Measurement Jobs
  
  1. Overview
    - Adds 8 new demo measurement jobs across different businesses
    - Creates 8 new customers for the measurement jobs
    - Provides diverse scenarios: pending, confirmed, in-progress, completed, tbd, awaiting-deposit
    - Includes realistic measurements data, quotations, and job history
  
  2. New Customers
    - 3 customers for BlindsCloud Solutions Ltd
    - 2 customers for Demo Blinds Company  
    - 2 customers for Elite Window Coverings
    - 1 customer for tt's Business
    
  3. New Measurement Jobs
    - Various statuses to showcase workflow stages
    - Realistic window measurements with locations
    - Job history tracking creation and updates
    - Scheduled dates spread across the next few weeks
    
  4. Purpose
    - Provide comprehensive demo data for testing measurement workflow
    - Showcase measurement job features across different scenarios
    - Enable testing of job filtering, assignment, and progression
*/

-- Add new customers for measurement jobs
INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id, created_at) VALUES
-- Customers for BlindsCloud Solutions (11111111-1111-1111-1111-111111111111)
('eeeeee20-0000-0000-0000-000000000000', 'Margaret Thompson', 'margaret.t@email.com', '+44 20 7890 1234', '+44 7700 900001', '45 Oak Avenue, Kensington, London', 'SW7 3AB', '11111111-1111-1111-1111-111111111111', NOW()),
('eeeeee21-0000-0000-0000-000000000000', 'James Anderson', 'james.a@email.com', '+44 20 7890 1235', '+44 7700 900002', '78 Maple Drive, Chelsea, London', 'SW3 5CD', '11111111-1111-1111-1111-111111111111', NOW()),
('eeeeee22-0000-0000-0000-000000000000', 'Patricia Wilson', 'patricia.w@email.com', '+44 20 7890 1236', '+44 7700 900003', '12 Birch Lane, Mayfair, London', 'W1K 6EF', '11111111-1111-1111-1111-111111111111', NOW()),

-- Customers for Demo Blinds Company (22222222-2222-2222-2222-222222222222)
('eeeeee23-0000-0000-0000-000000000000', 'Robert Brown', 'robert.b@email.com', '+44 161 234 5680', '+44 7700 900004', '156 Market Street, Manchester', 'M1 1PT', '22222222-2222-2222-2222-222222222222', NOW()),
('eeeeee24-0000-0000-0000-000000000000', 'Jennifer Davis', 'jennifer.d@email.com', '+44 161 234 5681', '+44 7700 900005', '89 Oxford Road, Manchester', 'M13 9PL', '22222222-2222-2222-2222-222222222222', NOW()),

-- Customers for Elite Window Coverings (33333333-3333-3333-3333-333333333333)
('eeeeee25-0000-0000-0000-000000000000', 'Michael Johnson', 'michael.j@email.com', '+44 121 345 6790', '+44 7700 900006', '234 High Street, Birmingham', 'B4 7SL', '33333333-3333-3333-3333-333333333333', NOW()),
('eeeeee26-0000-0000-0000-000000000000', 'Sarah Williams', 'sarah.w@email.com', '+44 121 345 6791', '+44 7700 900007', '67 Broad Street, Birmingham', 'B15 1AU', '33333333-3333-3333-3333-333333333333', NOW()),

-- Customer for tt's Business (d80ba3f9-cff0-414d-9057-acdc4be22710)
('eeeeee27-0000-0000-0000-000000000000', 'Elizabeth Martinez', 'elizabeth.m@email.com', '+44 20 8888 9999', '+44 7700 900008', '98 Victoria Street, London', 'SW1E 5JL', 'd80ba3f9-cff0-414d-9057-acdc4be22710', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add demo measurement jobs with diverse scenarios
INSERT INTO jobs (
  id, title, description, job_type, status, 
  customer_id, employee_id, business_id, 
  scheduled_date, scheduled_time, 
  customer_reference, payment_reference, 
  quotation, deposit, deposit_paid,
  checklist, measurements, job_history, 
  created_at
) VALUES

-- Job 1: Completed measurement with full data
('bbbbbb20-0000-0000-0000-000000000000', 
 'Master Bedroom Blinds Measurement', 
 'Measure windows for blackout blinds in master bedroom', 
 'measurement', 'completed', 
 'eeeeee20-0000-0000-0000-000000000000', '10000002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
 CURRENT_DATE - 5, '10:00',
 'REF-M001', 'PAY-M001',
 850, 255, true,
 '[
   {"id":"1","text":"Customer consultation","completed":true},
   {"id":"2","text":"Window measurements","completed":true},
   {"id":"3","text":"Product selection","completed":true},
   {"id":"4","text":"Quotation preparation","completed":true},
   {"id":"5","text":"Customer approval","completed":true}
 ]'::jsonb,
 '[
   {"id":"W1","windowId":"W1","width":"120","height":"150","location":"Master Bedroom - Main Window","notes":"South facing, needs blackout"},
   {"id":"W2","windowId":"W2","width":"90","height":"150","location":"Master Bedroom - Side Window","notes":""}
 ]'::jsonb,
 '[
   {"id":"h1","timestamp":"2025-10-27T09:00:00Z","action":"job_created","description":"Measurement job created","userId":"10000001-0000-0000-0000-000000000000","userName":"John Smith"},
   {"id":"h2","timestamp":"2025-10-27T10:00:00Z","action":"job_assigned","description":"Assigned to installer","userId":"10000001-0000-0000-0000-000000000000","userName":"John Smith"},
   {"id":"h3","timestamp":"2025-10-27T10:30:00Z","action":"measurements_completed","description":"All measurements taken","userId":"10000002-0000-0000-0000-000000000000","userName":"Mike Johnson"},
   {"id":"h4","timestamp":"2025-10-27T11:00:00Z","action":"quotation_sent","description":"Quotation sent to customer","userId":"10000002-0000-0000-0000-000000000000","userName":"Mike Johnson"},
   {"id":"h5","timestamp":"2025-10-27T15:30:00Z","action":"job_completed","description":"Customer approved quotation","userId":"10000002-0000-0000-0000-000000000000","userName":"Mike Johnson"}
 ]'::jsonb,
 NOW() - INTERVAL '5 days'),

-- Job 2: In-progress measurement
('bbbbbb21-0000-0000-0000-000000000000',
 'Living Room & Dining Area Measurement',
 'Measure for roller blinds in open-plan living space',
 'measurement', 'in-progress',
 'eeeeee21-0000-0000-0000-000000000000', '10000003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
 CURRENT_DATE, '14:00',
 'REF-M002', 'PAY-M002',
 0, 0, false,
 '[
   {"id":"1","text":"Customer consultation","completed":true},
   {"id":"2","text":"Window measurements","completed":true},
   {"id":"3","text":"Product selection","completed":false},
   {"id":"4","text":"Quotation preparation","completed":false},
   {"id":"5","text":"Customer approval","completed":false}
 ]'::jsonb,
 '[
   {"id":"W1","windowId":"W1","width":"200","height":"180","location":"Living Room - Front Window","notes":"Triple window, need 3 blinds"},
   {"id":"W2","windowId":"W2","width":"140","height":"180","location":"Dining Area Window","notes":"Adjacent to kitchen"}
 ]'::jsonb,
 '[
   {"id":"h1","timestamp":"2025-11-17T08:00:00Z","action":"job_created","description":"Measurement job created","userId":"10000001-0000-0000-0000-000000000000","userName":"John Smith"},
   {"id":"h2","timestamp":"2025-11-17T14:00:00Z","action":"job_started","description":"Started measurements","userId":"10000003-0000-0000-0000-000000000000","userName":"Sarah Davis"}
 ]'::jsonb,
 NOW()),

-- Job 3: Confirmed and awaiting appointment
('bbbbbb22-0000-0000-0000-000000000000',
 'Conservatory Roof Blinds Measurement',
 'Measure roof panels for pleated conservatory blinds',
 'measurement', 'confirmed',
 'eeeeee22-0000-0000-0000-000000000000', '10000002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
 CURRENT_DATE + 3, '09:30',
 'REF-M003', 'PAY-M003',
 0, 0, false,
 '[
   {"id":"1","text":"Customer consultation","completed":false},
   {"id":"2","text":"Window measurements","completed":false},
   {"id":"3","text":"Product selection","completed":false},
   {"id":"4","text":"Quotation preparation","completed":false},
   {"id":"5","text":"Customer approval","completed":false}
 ]'::jsonb,
 '[]'::jsonb,
 '[
   {"id":"h1","timestamp":"2025-11-15T11:00:00Z","action":"job_created","description":"Measurement job created","userId":"10000001-0000-0000-0000-000000000000","userName":"John Smith"},
   {"id":"h2","timestamp":"2025-11-15T11:15:00Z","action":"job_assigned","description":"Assigned to Mike Johnson","userId":"10000001-0000-0000-0000-000000000000","userName":"John Smith"}
 ]'::jsonb,
 NOW() - INTERVAL '2 days'),

-- Job 4: Pending appointment
('bbbbbb23-0000-0000-0000-000000000000',
 'Office Building Windows Measurement',
 'Commercial measurement for 15 office windows',
 'measurement', 'pending',
 'eeeeee23-0000-0000-0000-000000000000', NULL, '22222222-2222-2222-2222-222222222222',
 CURRENT_DATE + 7, '11:00',
 'REF-M004', 'PAY-M004',
 0, 0, false,
 '[
   {"id":"1","text":"Customer consultation","completed":false},
   {"id":"2","text":"Window measurements","completed":false},
   {"id":"3","text":"Product selection","completed":false},
   {"id":"4","text":"Quotation preparation","completed":false},
   {"id":"5","text":"Customer approval","completed":false}
 ]'::jsonb,
 '[]'::jsonb,
 '[
   {"id":"h1","timestamp":"2025-11-17T09:30:00Z","action":"job_created","description":"Large commercial measurement job created","userId":"20000001-0000-0000-0000-000000000000","userName":"Emma Wilson"}
 ]'::jsonb,
 NOW()),

-- Job 5: TBD status (needs rescheduling)
('bbbbbb24-0000-0000-0000-000000000000',
 'Kitchen & Bathroom Blinds Measurement',
 'Measure for moisture-resistant blinds',
 'measurement', 'tbd',
 'eeeeee24-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
 CURRENT_DATE + 14, '10:00',
 'REF-M005', 'PAY-M005',
 0, 0, false,
 '[
   {"id":"1","text":"Customer consultation","completed":false},
   {"id":"2","text":"Window measurements","completed":false},
   {"id":"3","text":"Product selection","completed":false},
   {"id":"4","text":"Quotation preparation","completed":false},
   {"id":"5","text":"Customer approval","completed":false}
 ]'::jsonb,
 '[]'::jsonb,
 '[
   {"id":"h1","timestamp":"2025-11-10T14:00:00Z","action":"job_created","description":"Measurement job created","userId":"20000001-0000-0000-0000-000000000000","userName":"Emma Wilson"},
   {"id":"h2","timestamp":"2025-11-12T09:00:00Z","action":"rescheduled","description":"Customer requested date change","userId":"20000002-0000-0000-0000-000000000000","userName":"David Lee"}
 ]'::jsonb,
 NOW() - INTERVAL '7 days'),

-- Job 6: Awaiting deposit
('bbbbbb25-0000-0000-0000-000000000000',
 'Luxury Apartment Full Measurement',
 'Measure all windows in 3-bedroom luxury apartment',
 'measurement', 'awaiting-deposit',
 'eeeeee25-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
 CURRENT_DATE + 10, '10:30',
 'REF-M006', 'PAY-M006',
 1450, 435, false,
 '[
   {"id":"1","text":"Customer consultation","completed":true},
   {"id":"2","text":"Window measurements","completed":true},
   {"id":"3","text":"Product selection","completed":true},
   {"id":"4","text":"Quotation preparation","completed":true},
   {"id":"5","text":"Customer approval","completed":true}
 ]'::jsonb,
 '[
   {"id":"W1","windowId":"W1","width":"180","height":"200","location":"Master Bedroom","notes":"Floor to ceiling window"},
   {"id":"W2","windowId":"W2","width":"160","height":"200","location":"Living Room","notes":"Bay window - 3 panels"},
   {"id":"W3","windowId":"W3","width":"120","height":"180","location":"Bedroom 2","notes":"Standard window"},
   {"id":"W4","windowId":"W4","width":"120","height":"180","location":"Bedroom 3","notes":"Standard window"},
   {"id":"W5","windowId":"W5","width":"80","height":"120","location":"Kitchen","notes":"Small window above sink"}
 ]'::jsonb,
 '[
   {"id":"h1","timestamp":"2025-11-12T10:00:00Z","action":"job_created","description":"Measurement job created","userId":"30000001-0000-0000-0000-000000000000","userName":"Robert Clark"},
   {"id":"h2","timestamp":"2025-11-13T10:30:00Z","action":"measurements_completed","description":"All measurements taken","userId":"30000002-0000-0000-0000-000000000000","userName":"Lisa Brown"},
   {"id":"h3","timestamp":"2025-11-13T15:00:00Z","action":"quotation_sent","description":"Quotation sent - awaiting deposit","userId":"30000002-0000-0000-0000-000000000000","userName":"Lisa Brown"}
 ]'::jsonb,
 NOW() - INTERVAL '5 days'),

-- Job 7: Confirmed for Elite Windows
('bbbbbb26-0000-0000-0000-000000000000',
 'Home Office Blind Measurement',
 'Measure for smart motorized blinds in home office',
 'measurement', 'confirmed',
 'eeeeee26-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
 CURRENT_DATE + 5, '13:00',
 'REF-M007', 'PAY-M007',
 0, 0, false,
 '[
   {"id":"1","text":"Customer consultation","completed":false},
   {"id":"2","text":"Window measurements","completed":false},
   {"id":"3","text":"Product selection","completed":false},
   {"id":"4","text":"Quotation preparation","completed":false},
   {"id":"5","text":"Customer approval","completed":false}
 ]'::jsonb,
 '[]'::jsonb,
 '[
   {"id":"h1","timestamp":"2025-11-16T09:00:00Z","action":"job_created","description":"Smart blinds measurement requested","userId":"30000001-0000-0000-0000-000000000000","userName":"Robert Clark"}
 ]'::jsonb,
 NOW() - INTERVAL '1 day'),

-- Job 8: New pending job for tt's Business
('bbbbbb27-0000-0000-0000-000000000000',
 'New Build Property Measurement',
 'Full property measurement for new construction',
 'measurement', 'pending',
 'eeeeee27-0000-0000-0000-000000000000', NULL, 'd80ba3f9-cff0-414d-9057-acdc4be22710',
 CURRENT_DATE + 4, '09:00',
 'REF-M008', 'PAY-M008',
 0, 0, false,
 '[
   {"id":"1","text":"Customer consultation","completed":false},
   {"id":"2","text":"Window measurements","completed":false},
   {"id":"3","text":"Product selection","completed":false},
   {"id":"4","text":"Quotation preparation","completed":false},
   {"id":"5","text":"Customer approval","completed":false}
 ]'::jsonb,
 '[]'::jsonb,
 '[
   {"id":"h1","timestamp":"2025-11-17T10:00:00Z","action":"job_created","description":"New build measurement job created","userId":"81b34362-cc15-4595-a4d8-710402bbf788","userName":"tt"}
 ]'::jsonb,
 NOW())

ON CONFLICT (id) DO NOTHING;

-- Create index for faster job_type queries
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_status_job_type ON jobs(status, job_type);

COMMENT ON TABLE jobs IS 'Now includes 11 total measurement jobs with diverse scenarios across all businesses';
COMMENT ON TABLE customers IS 'Added 8 new customers specifically for measurement job scenarios';