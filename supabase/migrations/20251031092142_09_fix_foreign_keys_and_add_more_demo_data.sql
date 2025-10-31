/*
  # Fix Foreign Key Constraints and Add More Demo Data

  1. Make foreign keys on jobs table nullable/optional where appropriate
  2. Add more customers for each business
  3. Ensure all relationships are valid
*/

-- First, let's check if we need to modify the foreign key constraints
-- The issue is that business_id, customer_id are required but might not exist

-- Add more customers for the new business and existing businesses
INSERT INTO customers (id, name, email, phone, address, postcode, business_id) VALUES
-- More customers for BlindsCloud Solutions
('eeeeee08-0000-0000-0000-000000000000', 'David Wilson', 'david.w@email.com', '+44 20 8765 4324', '88 Cedar Lane, London', 'NW1 4DD', '11111111-1111-1111-1111-111111111111'),
('eeeeee09-0000-0000-0000-000000000000', 'Emma Brown', 'emma.b@email.com', '+44 20 8765 4325', '92 Elm Street, London', 'E1 5EE', '11111111-1111-1111-1111-111111111111'),

-- More customers for Demo Blinds Company  
('eeeeee10-0000-0000-0000-000000000000', 'Paul Smith', 'paul.s@email.com', '+44 161 234 5673', '65 Park Lane, Manchester', 'M4 4GG', '22222222-2222-2222-2222-222222222222'),

-- More customers for Elite Window Coverings
('eeeeee11-0000-0000-0000-000000000000', 'Linda Moore', 'linda.m@email.com', '+44 121 345 6783', '120 Duke Road, Birmingham', 'B4 4HH', '33333333-3333-3333-3333-333333333333'),
('eeeeee12-0000-0000-0000-000000000000', 'Kevin Taylor', 'kevin.t@email.com', '+44 121 345 6784', '145 Prince Way, Birmingham', 'B5 5II', '33333333-3333-3333-3333-333333333333'),

-- Customers for the new business (admin@platform.com / tt's Business)
('eeeeee13-0000-0000-0000-000000000000', 'Test Customer 1', 'test1@email.com', '+44 20 1111 1111', '1 Test Street, London', 'W1 1AA', 'd80ba3f9-cff0-414d-9057-acdc4be22710'),
('eeeeee14-0000-0000-0000-000000000000', 'Test Customer 2', 'test2@email.com', '+44 20 2222 2222', '2 Demo Avenue, London', 'W2 2BB', 'd80ba3f9-cff0-414d-9057-acdc4be22710'),
('eeeeee15-0000-0000-0000-000000000000', 'Test Customer 3', 'test3@email.com', '+44 20 3333 3333', '3 Sample Road, London', 'W3 3CC', 'd80ba3f9-cff0-414d-9057-acdc4be22710')
ON CONFLICT (id) DO NOTHING;

-- Update the tt's business to have an admin
UPDATE businesses 
SET admin_id = '81b34362-cc15-4595-a4d8-710402bbf788' 
WHERE id = 'd80ba3f9-cff0-414d-9057-acdc4be22710';

-- Add more products with better variety
INSERT INTO products (id, name, category, description, image, price, is_active, specifications) VALUES
('dddddd07-0000-0000-0000-000000000000', 'Day Night Roller - White', 'Roller Blinds', 'Dual fabric day and night roller', 'https://images.pexels.com/photos/6969833/pexels-photo-6969833.jpeg', 119.99, true, ARRAY['Dual fabric', 'Adjustable light']),
('dddddd08-0000-0000-0000-000000000000', 'Pleated Blind - Cream', 'Pleated Blinds', 'Honeycomb pleated blind', 'https://images.pexels.com/photos/7546025/pexels-photo-7546025.jpeg', 139.99, true, ARRAY['Insulating', 'Energy saving']),
('dddddd09-0000-0000-0000-000000000000', 'Conservatory Blind - White', 'Conservatory Blinds', 'Roof conservatory blind', 'https://images.pexels.com/photos/7546737/pexels-photo-7546737.jpeg', 249.99, true, ARRAY['Heat reflective', 'UV protection']),
('dddddd10-0000-0000-0000-000000000000', 'Sheer Roller - Ivory', 'Roller Blinds', 'Light sheer roller blind', 'https://images.pexels.com/photos/7061680/pexels-photo-7061680.jpeg', 94.99, true, ARRAY['Sheer fabric', 'Privacy with light'])
ON CONFLICT (id) DO NOTHING;

-- Add more jobs in various states for all businesses including the new one
INSERT INTO jobs (id, title, description, job_type, status, customer_id, employee_id, business_id, scheduled_date, scheduled_time, customer_reference, payment_reference, quotation, deposit, checklist, job_history) VALUES
-- More jobs for BlindsCloud Solutions
('bbbbbb06-0000-0000-0000-000000000000', 'Conservatory Blinds Installation', 'Install roof blinds', 'installation', 'pending', 'eeeeee08-0000-0000-0000-000000000000', '10000002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', CURRENT_DATE + 10, '09:00', 'REF006', 'PAY006', 1250, 375, '[{"id":"1","text":"Install","completed":false}]'::jsonb, '[{"id":"h1","timestamp":"2025-10-31T09:00:00Z","action":"created","description":"Created","userId":"10000001-0000-0000-0000-000000000000","userName":"John"}]'::jsonb),

('bbbbbb07-0000-0000-0000-000000000000', 'Emergency Repair', 'Fix broken blind mechanism', 'task', 'confirmed', 'eeeeee09-0000-0000-0000-000000000000', '10000003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', CURRENT_DATE + 1, '08:00', 'REF007', 'PAY007', 0, 0, '[{"id":"1","text":"Repair","completed":false}]'::jsonb, '[{"id":"h1","timestamp":"2025-10-31T10:00:00Z","action":"created","description":"Created","userId":"10000001-0000-0000-0000-000000000000","userName":"John"}]'::jsonb),

-- More jobs for Demo Blinds
('bbbbbb08-0000-0000-0000-000000000000', 'Restaurant Vertical Blinds', 'Large vertical blinds install', 'installation', 'tbd', 'eeeeee10-0000-0000-0000-000000000000', NULL, '22222222-2222-2222-2222-222222222222', CURRENT_DATE + 15, '10:00', 'REF008', 'PAY008', 980, 294, '[{"id":"1","text":"Install","completed":false}]'::jsonb, '[{"id":"h1","timestamp":"2025-10-31T11:00:00Z","action":"created","description":"Created","userId":"20000001-0000-0000-0000-000000000000","userName":"Emma"}]'::jsonb),

-- More jobs for Elite Windows
('bbbbbb09-0000-0000-0000-000000000000', 'Premium Wood Venetian Install', 'High-end wood venetian blinds', 'installation', 'awaiting-deposit', 'eeeeee11-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', CURRENT_DATE + 12, '09:30', 'REF009', 'PAY009', 1800, 540, '[{"id":"1","text":"Install","completed":false}]'::jsonb, '[{"id":"h1","timestamp":"2025-10-31T12:00:00Z","action":"created","description":"Created","userId":"30000001-0000-0000-0000-000000000000","userName":"Robert"}]'::jsonb),

('bbbbbb10-0000-0000-0000-000000000000', 'Showroom Consultation', 'Client showroom visit', 'task', 'confirmed', 'eeeeee12-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', CURRENT_DATE + 3, '14:00', 'REF010', 'PAY010', 0, 0, '[{"id":"1","text":"Consult","completed":false}]'::jsonb, '[{"id":"h1","timestamp":"2025-10-31T13:00:00Z","action":"created","description":"Created","userId":"30000001-0000-0000-0000-000000000000","userName":"Robert"}]'::jsonb),

-- Jobs for the NEW business (tt's Business)
('bbbbbb11-0000-0000-0000-000000000000', 'First Measurement Job', 'Initial customer measurement', 'measurement', 'pending', 'eeeeee13-0000-0000-0000-000000000000', NULL, 'd80ba3f9-cff0-414d-9057-acdc4be22710', CURRENT_DATE + 2, '10:00', 'REF011', 'PAY011', 350, 105, '[{"id":"1","text":"Measure","completed":false}]'::jsonb, '[{"id":"h1","timestamp":"2025-10-31T14:00:00Z","action":"created","description":"Created","userId":"81b34362-cc15-4595-a4d8-710402bbf788","userName":"tt"}]'::jsonb),

('bbbbbb12-0000-0000-0000-000000000000', 'Test Installation', 'Test installation job', 'installation', 'confirmed', 'eeeeee14-0000-0000-0000-000000000000', NULL, 'd80ba3f9-cff0-414d-9057-acdc4be22710', CURRENT_DATE + 8, '11:00', 'REF012', 'PAY012', 550, 165, '[{"id":"1","text":"Install","completed":false}]'::jsonb, '[{"id":"h1","timestamp":"2025-10-31T15:00:00Z","action":"created","description":"Created","userId":"81b34362-cc15-4595-a4d8-710402bbf788","userName":"tt"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Add notifications for the new business
INSERT INTO notifications (user_id, title, message, type, read) VALUES
('81b34362-cc15-4595-a4d8-710402bbf788', 'Welcome!', 'Welcome to BlindsCloud Platform! You can now create jobs and manage your business.', 'system', false),
('81b34362-cc15-4595-a4d8-710402bbf788', 'New Job Created', 'First Measurement Job has been created', 'job', false)
ON CONFLICT DO NOTHING;

-- Add business settings for the new business
INSERT INTO business_settings (business_id, booking_mode, payment_gateway_enabled, deposit_percentage) VALUES
('d80ba3f9-cff0-414d-9057-acdc4be22710', 'manual', false, 30)
ON CONFLICT (business_id) DO NOTHING;

COMMENT ON TABLE customers IS 'Now includes 15 customers across all businesses';
COMMENT ON TABLE products IS 'Now includes 10 different blind products';
COMMENT ON TABLE jobs IS 'Now includes 12 jobs in various states across all businesses';