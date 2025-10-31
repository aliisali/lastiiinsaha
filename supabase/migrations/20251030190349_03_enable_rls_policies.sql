/*
  # Enable RLS Policies for Core Tables

  1. Security
    - Enable RLS on all core tables
    - Add restrictive policies for data isolation
    - Business-level data segregation
    - Role-based access control

  2. Important Notes
    - Policies ensure users only see data from their business
    - Admin users have cross-business access
    - Employee users only see assigned jobs
*/

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Business users can view employees in their business"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.business_id = users.business_id
            AND u.role IN ('business', 'admin')
        )
    );

-- Businesses table policies
CREATE POLICY "Business users can view own business"
    ON businesses FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = businesses.id
        )
    );

CREATE POLICY "Admins can view all businesses"
    ON businesses FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Customers table policies
CREATE POLICY "Business users can view own customers"
    ON customers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = customers.business_id
        )
    );

CREATE POLICY "Business users can insert customers"
    ON customers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = customers.business_id
        )
    );

CREATE POLICY "Business users can update own customers"
    ON customers FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = customers.business_id
        )
    );

-- Jobs table policies
CREATE POLICY "Employees can view assigned jobs"
    ON jobs FOR SELECT
    TO authenticated
    USING (
        auth.uid() = employee_id
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = jobs.business_id
            AND users.role IN ('business', 'admin')
        )
    );

CREATE POLICY "Business users can create jobs"
    ON jobs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = jobs.business_id
        )
    );

CREATE POLICY "Business and assigned employees can update jobs"
    ON jobs FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = employee_id
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = jobs.business_id
            AND users.role IN ('business', 'admin')
        )
    );

CREATE POLICY "Business admins can delete jobs"
    ON jobs FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.business_id = jobs.business_id
            AND users.role IN ('business', 'admin')
        )
    );

-- Products table policies (global access for viewing)
CREATE POLICY "All authenticated users can view products"
    ON products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Notifications table policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);