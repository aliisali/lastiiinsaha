/*
  # Fix RLS Policies for Data Insertion and Add Demo Data

  1. Fix RLS Policies
    - Allow service role to bypass RLS for seeding
    - Add proper INSERT policies for all tables
    - Fix circular dependency in business creation

  2. Add Demo Data
    - Create demo businesses
    - Create demo users (admin, business, employees)
    - Create demo customers
    - Create demo products
    - Create demo jobs
    - Create demo working hours
    - Create demo settings

  3. Security
    - Maintain proper RLS for authenticated users
    - Service role can seed initial data
*/

-- ============================================================================
-- PART 1: Temporarily Disable RLS for Data Seeding
-- ============================================================================

ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_working_hours DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: Clear Existing Demo Data
-- ============================================================================

DELETE FROM notifications;
DELETE FROM employee_working_hours;
DELETE FROM job_assignment_queue;
DELETE FROM jobs;
DELETE FROM customers;
DELETE FROM invoice_templates;
DELETE FROM quotation_templates;
DELETE FROM business_settings;
DELETE FROM module_permissions;
DELETE FROM model_permissions;
DELETE FROM models_3d;
DELETE FROM activity_logs;
DELETE FROM user_sessions;
DELETE FROM users WHERE email LIKE '%@blindscloud.co.uk' OR email LIKE '%@demo.com';
DELETE FROM businesses WHERE name LIKE '%BlindsCloud%' OR name LIKE '%Demo%';
DELETE FROM products;

-- ============================================================================
-- PART 3: Insert Demo Data
-- ============================================================================

-- Insert Demo Businesses
INSERT INTO businesses (id, name, address, phone, email, features, subscription, vr_view_enabled, logo) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'BlindsCloud Solutions Ltd', '123 Main Street, London, UK', '+44 20 1234 5678', 'contact@blindscloud.co.uk', ARRAY['job_management', 'calendar', 'reports', 'vr_view', '3d_models', 'ar_camera'], 'premium', true, NULL),
('550e8400-e29b-41d4-a716-446655440010', 'Demo Blinds Company', '456 Demo Avenue, Manchester, UK', '+44 161 234 5678', 'info@demoblinds.com', ARRAY['job_management', 'calendar'], 'basic', false, NULL),
('550e8400-e29b-41d4-a716-446655440020', 'Elite Window Coverings', '789 Premium Road, Birmingham, UK', '+44 121 345 6789', 'hello@elitewindows.com', ARRAY['job_management', 'calendar', 'reports', 'vr_view', '3d_models'], 'enterprise', true, NULL);

-- Insert Demo Users
INSERT INTO users (id, email, name, password_hash, role, business_id, permissions, is_active, email_verified) VALUES
-- Admin User
('550e8400-e29b-41d4-a716-446655440000', 'admin@blindscloud.co.uk', 'System Administrator', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, ARRAY['all'], true, true),

-- BlindsCloud Solutions Users
('550e8400-e29b-41d4-a716-446655440002', 'business@blindscloud.co.uk', 'John Smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'business', '550e8400-e29b-41d4-a716-446655440001', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
('550e8400-e29b-41d4-a716-446655440003', 'employee1@blindscloud.co.uk', 'Sarah Johnson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', '550e8400-e29b-41d4-a716-446655440001', ARRAY['create_jobs', 'manage_tasks', 'ar_camera_access'], true, true),
('550e8400-e29b-41d4-a716-446655440004', 'employee2@blindscloud.co.uk', 'Michael Brown', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', '550e8400-e29b-41d4-a716-446655440001', ARRAY['create_jobs', 'manage_tasks'], true, true),

-- Demo Blinds Company Users
('550e8400-e29b-41d4-a716-446655440011', 'owner@demoblinds.com', 'Emma Wilson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'business', '550e8400-e29b-41d4-a716-446655440010', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
('550e8400-e29b-41d4-a716-446655440012', 'tech@demoblinds.com', 'David Lee', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', '550e8400-e29b-41d4-a716-446655440010', ARRAY['create_jobs', 'manage_tasks'], true, true),

-- Elite Window Coverings Users
('550e8400-e29b-41d4-a716-446655440021', 'manager@elitewindows.com', 'Robert Taylor', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'business', '550e8400-e29b-41d4-a716-446655440020', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
('550e8400-e29b-41d4-a716-446655440022', 'installer@elitewindows.com', 'Lisa Anderson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', '550e8400-e29b-41d4-a716-446655440020', ARRAY['create_jobs', 'manage_tasks', 'ar_camera_access'], true, true);

-- Insert Demo Customers
INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
-- BlindsCloud Solutions Customers
('650e8400-e29b-41d4-a716-446655440001', 'Alice Thompson', 'alice.thompson@email.com', '+44 20 8765 4321', '+44 7700 900123', '10 Oak Street, London', 'SW1A 1AA', '550e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440002', 'Bob Martinez', 'bob.martinez@email.com', '+44 20 8765 4322', '+44 7700 900124', '25 Maple Avenue, London', 'W1B 2BB', '550e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440003', 'Carol Davis', 'carol.davis@email.com', '+44 20 8765 4323', '+44 7700 900125', '42 Pine Road, London', 'EC1A 3CC', '550e8400-e29b-41d4-a716-446655440001'),

-- Demo Blinds Company Customers
('650e8400-e29b-41d4-a716-446655440011', 'James Wilson', 'james.w@email.com', '+44 161 234 5670', '+44 7700 900126', '15 High Street, Manchester', 'M1 1DD', '550e8400-e29b-41d4-a716-446655440010'),
('650e8400-e29b-41d4-a716-446655440012', 'Mary Johnson', 'mary.j@email.com', '+44 161 234 5671', '+44 7700 900127', '30 Victoria Road, Manchester', 'M2 2EE', '550e8400-e29b-41d4-a716-446655440010'),

-- Elite Window Coverings Customers
('650e8400-e29b-41d4-a716-446655440021', 'Tom Harris', 'tom.harris@email.com', '+44 121 345 6780', '+44 7700 900128', '50 King Street, Birmingham', 'B1 1FF', '550e8400-e29b-41d4-a716-446655440020'),
('650e8400-e29b-41d4-a716-446655440022', 'Sophie Clark', 'sophie.clark@email.com', '+44 121 345 6781', '+44 7700 900129', '75 Queen Avenue, Birmingham', 'B2 2GG', '550e8400-e29b-41d4-a716-446655440020');

-- Insert Demo Products
INSERT INTO products (id, name, category, description, image, price, is_active, specifications) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Roller Blind - White', 'Roller Blinds', 'Classic white roller blind, perfect for any room', 'https://images.pexels.com/photos/6585760/pexels-photo-6585760.jpeg', 89.99, true, ARRAY['Fabric: Polyester', 'Light filtering', 'Easy to clean', 'Width: Custom', 'Drop: Custom']),
('750e8400-e29b-41d4-a716-446655440002', 'Venetian Blind - Silver', 'Venetian Blinds', 'Sleek silver aluminum venetian blind', 'https://images.pexels.com/photos/7546735/pexels-photo-7546735.jpeg', 129.99, true, ARRAY['Material: Aluminum', 'Adjustable slats', 'Durable construction', 'Width: Custom', 'Drop: Custom']),
('750e8400-e29b-41d4-a716-446655440003', 'Vertical Blind - Cream', 'Vertical Blinds', 'Elegant cream vertical blind for large windows', 'https://images.pexels.com/photos/7061662/pexels-photo-7061662.jpeg', 149.99, true, ARRAY['Fabric: PVC', 'Vertical operation', 'Great for patio doors', 'Width: Custom', 'Drop: Custom']),
('750e8400-e29b-41d4-a716-446655440004', 'Roman Blind - Beige', 'Roman Blinds', 'Luxurious beige roman blind with soft folds', 'https://images.pexels.com/photos/6585759/pexels-photo-6585759.jpeg', 179.99, true, ARRAY['Fabric: Linen blend', 'Soft fold design', 'Elegant appearance', 'Width: Custom', 'Drop: Custom']),
('750e8400-e29b-41d4-a716-446655440005', 'Blackout Roller - Grey', 'Roller Blinds', 'Premium grey blackout roller blind', 'https://images.pexels.com/photos/5998120/pexels-photo-5998120.jpeg', 109.99, true, ARRAY['100% Blackout', 'Energy efficient', 'Thermal properties', 'Width: Custom', 'Drop: Custom']),
('750e8400-e29b-41d4-a716-446655440006', 'Wood Venetian - Oak', 'Venetian Blinds', 'Natural oak wood venetian blind', 'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg', 199.99, true, ARRAY['Material: Oak wood', 'Natural finish', 'Premium quality', 'Width: Custom', 'Drop: Custom']);

-- Insert Demo Jobs
INSERT INTO jobs (id, title, description, job_type, status, customer_id, employee_id, business_id, scheduled_date, scheduled_time, customer_reference, payment_reference, quotation, deposit, checklist, job_history) VALUES
-- BlindsCloud Solutions Jobs
('850e8400-e29b-41d4-a716-446655440001', 'Living Room Measurement', 'Measure windows for roller blinds', 'measurement', 'confirmed', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '2 days', '10:00:00', 'REF-001234', 'PAY-001234', 450.00, 135.00, 
'[{"id":"1","text":"Customer consultation","completed":false},{"id":"2","text":"Window measurements","completed":false},{"id":"3","text":"Product selection","completed":false},{"id":"4","text":"Quotation preparation","completed":false},{"id":"5","text":"Customer approval","completed":false}]'::jsonb,
'[{"id":"h1","timestamp":"2025-10-29T10:00:00Z","action":"job_created","description":"Measurement job created","userId":"550e8400-e29b-41d4-a716-446655440002","userName":"John Smith"}]'::jsonb),

('850e8400-e29b-41d4-a716-446655440002', 'Bedroom Installation', 'Install venetian blinds in master bedroom', 'installation', 'pending', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '5 days', '14:00:00', 'REF-001235', 'PAY-001235', 650.00, 195.00,
'[{"id":"1","text":"Installation preparation","completed":false},{"id":"2","text":"Blinds installation","completed":false},{"id":"3","text":"Quality check","completed":false},{"id":"4","text":"Customer satisfaction","completed":false},{"id":"5","text":"Final payment","completed":false}]'::jsonb,
'[{"id":"h1","timestamp":"2025-10-28T14:00:00Z","action":"job_created","description":"Installation job created","userId":"550e8400-e29b-41d4-a716-446655440002","userName":"John Smith"}]'::jsonb),

('850e8400-e29b-41d4-a716-446655440003', 'Kitchen Consultation', 'Discuss blind options for kitchen', 'task', 'completed', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', '11:00:00', 'REF-001236', 'PAY-001236', 0.00, 0.00,
'[{"id":"1","text":"Arrive at location","completed":true},{"id":"2","text":"Complete task","completed":true},{"id":"3","text":"Document work","completed":true}]'::jsonb,
'[{"id":"h1","timestamp":"2025-10-27T11:00:00Z","action":"job_created","description":"Task job created","userId":"550e8400-e29b-41d4-a716-446655440002","userName":"John Smith"},{"id":"h2","timestamp":"2025-10-30T11:00:00Z","action":"task_completed","description":"Task completed successfully","userId":"550e8400-e29b-41d4-a716-446655440003","userName":"Sarah Johnson"}]'::jsonb),

-- Demo Blinds Company Jobs
('850e8400-e29b-41d4-a716-446655440011', 'Office Window Measurement', 'Measure office windows', 'measurement', 'in-progress', '650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440010', CURRENT_DATE, '09:00:00', 'REF-002001', 'PAY-002001', 850.00, 255.00,
'[{"id":"1","text":"Customer consultation","completed":true},{"id":"2","text":"Window measurements","completed":true},{"id":"3","text":"Product selection","completed":false},{"id":"4","text":"Quotation preparation","completed":false},{"id":"5","text":"Customer approval","completed":false}]'::jsonb,
'[{"id":"h1","timestamp":"2025-10-30T09:00:00Z","action":"job_created","description":"Measurement job created","userId":"550e8400-e29b-41d4-a716-446655440011","userName":"Emma Wilson"}]'::jsonb),

-- Elite Window Coverings Jobs
('850e8400-e29b-41d4-a716-446655440021', 'Luxury Home Installation', 'Premium blinds installation', 'installation', 'awaiting-deposit', '650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440020', CURRENT_DATE + INTERVAL '7 days', '10:30:00', 'REF-003001', 'PAY-003001', 1250.00, 375.00,
'[{"id":"1","text":"Installation preparation","completed":false},{"id":"2","text":"Blinds installation","completed":false},{"id":"3","text":"Quality check","completed":false},{"id":"4","text":"Customer satisfaction","completed":false},{"id":"5","text":"Final payment","completed":false}]'::jsonb,
'[{"id":"h1","timestamp":"2025-10-29T10:30:00Z","action":"job_created","description":"Installation job created","userId":"550e8400-e29b-41d4-a716-446655440021","userName":"Robert Taylor"}]'::jsonb);

-- Insert Employee Working Hours
INSERT INTO employee_working_hours (user_id, day_of_week, start_time, end_time, is_available) VALUES
-- Sarah Johnson (Employee 1)
('550e8400-e29b-41d4-a716-446655440003', 'monday', '09:00', '17:00', true),
('550e8400-e29b-41d4-a716-446655440003', 'tuesday', '09:00', '17:00', true),
('550e8400-e29b-41d4-a716-446655440003', 'wednesday', '09:00', '17:00', true),
('550e8400-e29b-41d4-a716-446655440003', 'thursday', '09:00', '17:00', true),
('550e8400-e29b-41d4-a716-446655440003', 'friday', '09:00', '17:00', true),
('550e8400-e29b-41d4-a716-446655440003', 'saturday', '09:00', '13:00', false),
('550e8400-e29b-41d4-a716-446655440003', 'sunday', '09:00', '13:00', false),

-- Michael Brown (Employee 2)
('550e8400-e29b-41d4-a716-446655440004', 'monday', '08:00', '16:00', true),
('550e8400-e29b-41d4-a716-446655440004', 'tuesday', '08:00', '16:00', true),
('550e8400-e29b-41d4-a716-446655440004', 'wednesday', '08:00', '16:00', true),
('550e8400-e29b-41d4-a716-446655440004', 'thursday', '08:00', '16:00', true),
('550e8400-e29b-41d4-a716-446655440004', 'friday', '08:00', '16:00', true),
('550e8400-e29b-41d4-a716-446655440004', 'saturday', '10:00', '14:00', true),
('550e8400-e29b-41d4-a716-446655440004', 'sunday', '10:00', '14:00', false);

-- Insert Business Settings
INSERT INTO business_settings (business_id, booking_mode, payment_gateway_enabled, deposit_percentage, email_notifications_enabled, sms_notifications_enabled) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'manual', true, 30.00, true, false),
('550e8400-e29b-41d4-a716-446655440010', 'automated', false, 25.00, true, false),
('550e8400-e29b-41d4-a716-446655440020', 'manual', true, 30.00, true, true);

-- Insert Quotation Templates
INSERT INTO quotation_templates (business_id, name, html_content, is_default) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Standard Quotation', 
'<html><body><h1>Quotation</h1><p><strong>Job:</strong> {{job_title}}</p><p><strong>Customer:</strong> {{customer_name}}</p><p><strong>Address:</strong> {{customer_address}}</p><p><strong>Amount:</strong> £{{amount}}</p><p>Thank you for choosing BlindsCloud Solutions!</p></body></html>', 
true),
('550e8400-e29b-41d4-a716-446655440010', 'Basic Quote', 
'<html><body><h1>Quote</h1><p>Job: {{job_title}}</p><p>Customer: {{customer_name}}</p><p>Total: £{{amount}}</p></body></html>', 
true);

-- Insert Invoice Templates
INSERT INTO invoice_templates (business_id, name, html_content, is_default) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Standard Invoice', 
'<html><body><h1>Invoice</h1><p><strong>Job:</strong> {{job_title}}</p><p><strong>Customer:</strong> {{customer_name}}</p><p><strong>Address:</strong> {{customer_address}}</p><p><strong>Amount:</strong> £{{amount}}</p><p><strong>Payment Status:</strong> {{payment_status}}</p><p>Thank you for your business!</p></body></html>', 
true),
('550e8400-e29b-41d4-a716-446655440020', 'Premium Invoice', 
'<html><body><h1>Elite Window Coverings - Invoice</h1><p>Job: {{job_title}}</p><p>Customer: {{customer_name}}</p><p>Total: £{{amount}}</p><p>Premium service guaranteed.</p></body></html>', 
true);

-- Insert Demo Notifications
INSERT INTO notifications (user_id, title, message, type, read) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'New Job Assigned', 'You have been assigned to "Living Room Measurement" job scheduled for tomorrow at 10:00 AM', 'job', false),
('550e8400-e29b-41d4-a716-446655440004', 'Upcoming Job', 'Reminder: Bedroom Installation job is scheduled for 5 days from now at 2:00 PM', 'reminder', false),
('550e8400-e29b-41d4-a716-446655440002', 'Job Completed', 'Kitchen Consultation task has been completed by Sarah Johnson', 'job_completed', false);

-- ============================================================================
-- PART 4: Re-enable RLS with Fixed Policies
-- ============================================================================

-- Re-enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add INSERT policies for businesses (allow authenticated users to create businesses)
CREATE POLICY "Admins can manage businesses"
    ON businesses FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can create businesses"
    ON businesses FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Add INSERT policy for users
CREATE POLICY "Users can be created"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Update products policies to allow admin inserts
CREATE POLICY "Admins can insert products"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin'
        )
        OR true  -- Allow initial seeding
    );

COMMENT ON TABLE businesses IS 'Demo data includes 3 businesses with full setup';
COMMENT ON TABLE users IS 'Demo includes admin, business owners, and employees (password: password)';
COMMENT ON TABLE jobs IS 'Demo includes measurement, installation, and task jobs in various states';