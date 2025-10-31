/*
  # Job Workflow Enhancements

  1. New Tables
    - `employee_working_hours` - Store employee availability schedules for automated booking
    - `business_settings` - Store business preferences for booking mode and templates
    - `quotation_templates` - Store customizable quotation templates
    - `invoice_templates` - Store customizable invoice templates
    - `job_assignment_queue` - Queue for manual job assignment by business users

  2. Changes to Existing Tables
    - Extend `jobs` table with Tasks support and enhanced workflow fields
    - Add job_type to support 'measurement', 'installation', and 'task'
    - Add fields for payment tracking, customer references, and workflow states

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for role-based access

  4. Important Notes
    - Supports both automated and manual booking workflows
    - Enables measurement-to-installation job conversion
    - Customer payment portal support via reference numbers
    - Email confirmation system integration ready
*/

-- Employee Working Hours Table
CREATE TABLE IF NOT EXISTS employee_working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, day_of_week)
);

-- Business Settings Table
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
    booking_mode VARCHAR(20) DEFAULT 'manual' CHECK (booking_mode IN ('automated', 'manual')),
    payment_gateway_enabled BOOLEAN DEFAULT false,
    deposit_percentage NUMERIC(5,2) DEFAULT 50.00,
    default_quotation_template_id UUID,
    default_invoice_template_id UUID,
    email_notifications_enabled BOOLEAN DEFAULT true,
    sms_notifications_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotation Templates Table
CREATE TABLE IF NOT EXISTS quotation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Templates Table
CREATE TABLE IF NOT EXISTS invoice_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Assignment Queue Table (for manual booking mode)
CREATE TABLE IF NOT EXISTS job_assignment_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'cancelled')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance jobs table with workflow fields
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(50) DEFAULT 'installation' CHECK (job_type IN ('measurement', 'installation', 'task'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_time TIME DEFAULT '09:00:00';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deposit NUMERIC(10,2) DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS customer_reference VARCHAR(255) UNIQUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quotation_sent BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS measurements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS selected_products JSONB DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS parent_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

-- Task-specific fields
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS task_name VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS task_completed BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS task_comments TEXT;

-- Email tracking
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Installation images tracking
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS installation_images TEXT[] DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ar_screenshots TEXT[] DEFAULT '{}';

-- Product selection
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS chosen_product_id VARCHAR(255);

-- Payment tracking
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255) UNIQUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC(10,2) DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS final_payment_paid BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS final_payment_date TIMESTAMP WITH TIME ZONE;

-- Invoice tracking
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_working_hours_user_id ON employee_working_hours(user_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_business_id ON business_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_quotation_templates_business_id ON quotation_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_business_id ON invoice_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_job_assignment_queue_business_id ON job_assignment_queue(business_id);
CREATE INDEX IF NOT EXISTS idx_job_assignment_queue_status ON job_assignment_queue(status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_payment_reference ON jobs(payment_reference);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_reference ON jobs(customer_reference);
CREATE INDEX IF NOT EXISTS idx_jobs_parent_job_id ON jobs(parent_job_id);

-- Enable RLS on new tables
ALTER TABLE employee_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignment_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_working_hours
CREATE POLICY "Employees can view own working hours"
    ON employee_working_hours FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Employees can update own working hours"
    ON employee_working_hours FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can insert own working hours"
    ON employee_working_hours FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can delete own working hours"
    ON employee_working_hours FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Business users can view employee working hours"
    ON employee_working_hours FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u1, users u2
            WHERE u1.id = auth.uid()
            AND u2.id = employee_working_hours.user_id
            AND u1.business_id = u2.business_id
            AND u1.role IN ('business', 'admin')
        )
    );

-- RLS Policies for business_settings
CREATE POLICY "Business users can view own business settings"
    ON business_settings FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = business_settings.business_id
        )
    );

CREATE POLICY "Business admins can update settings"
    ON business_settings FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = business_settings.business_id
            AND users.role IN ('business', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = business_settings.business_id
            AND users.role IN ('business', 'admin')
        )
    );

CREATE POLICY "Business admins can insert settings"
    ON business_settings FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = business_settings.business_id
            AND users.role IN ('business', 'admin')
        )
    );

-- RLS Policies for templates (quotation and invoice)
CREATE POLICY "Business users can view own quotation templates"
    ON quotation_templates FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = quotation_templates.business_id
        )
    );

CREATE POLICY "Business admins can manage quotation templates"
    ON quotation_templates FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = quotation_templates.business_id
            AND users.role IN ('business', 'admin')
        )
    );

CREATE POLICY "Business users can view own invoice templates"
    ON invoice_templates FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = invoice_templates.business_id
        )
    );

CREATE POLICY "Business admins can manage invoice templates"
    ON invoice_templates FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = invoice_templates.business_id
            AND users.role IN ('business', 'admin')
        )
    );

-- RLS Policies for job_assignment_queue
CREATE POLICY "Business users can view assignment queue"
    ON job_assignment_queue FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = job_assignment_queue.business_id
            AND users.role IN ('business', 'admin')
        )
    );

CREATE POLICY "Business users can manage assignments"
    ON job_assignment_queue FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = job_assignment_queue.business_id
            AND users.role IN ('business', 'admin')
        )
    );

-- Insert default business settings for existing businesses
INSERT INTO business_settings (business_id, booking_mode, payment_gateway_enabled, deposit_percentage)
SELECT id, 'manual', false, 50.00
FROM businesses
WHERE NOT EXISTS (
    SELECT 1 FROM business_settings WHERE business_settings.business_id = businesses.id
);

-- Create default quotation template
INSERT INTO quotation_templates (business_id, name, html_content, is_default)
SELECT 
    b.id,
    'Default Quotation Template',
    '<html><body><h1>Quotation</h1><p>Job: {{job_title}}</p><p>Customer: {{customer_name}}</p><p>Amount: {{amount}}</p></body></html>',
    true
FROM businesses b
WHERE NOT EXISTS (
    SELECT 1 FROM quotation_templates WHERE quotation_templates.business_id = b.id
);

-- Create default invoice template
INSERT INTO invoice_templates (business_id, name, html_content, is_default)
SELECT 
    b.id,
    'Default Invoice Template',
    '<html><body><h1>Invoice</h1><p>Job: {{job_title}}</p><p>Customer: {{customer_name}}</p><p>Amount: {{amount}}</p></body></html>',
    true
FROM businesses b
WHERE NOT EXISTS (
    SELECT 1 FROM invoice_templates WHERE invoice_templates.business_id = b.id
);