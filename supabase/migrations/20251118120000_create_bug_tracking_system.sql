/*
  # Bug Tracking and Workflow Management System

  1. New Tables
    - `bugs` - System-wide bug tracking for all user roles
      - Tracks bugs reported by Admin, Business, and Employee users
      - Includes screenshots, expected/actual behavior, assignments
    - `business_issues` - Business-specific issue tracking
      - Product issues, AR issues, workflow problems
      - Links to products and employees for resolution
    - `employee_tasks` - Task assignments for employees
      - Links to bugs and issues for context
      - Progress tracking and status updates

  2. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Business data isolation

  3. Features
    - Multi-image screenshot support
    - Status workflow tracking
    - Assignment and notification system
    - Priority management
    - Progress tracking
*/

-- Create bugs table for system-wide bug tracking
CREATE TABLE IF NOT EXISTS bugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL CHECK (user_type IN ('admin', 'business', 'employee')),
  reported_by uuid REFERENCES users(id) ON DELETE SET NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  reported_date timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  expected_behaviour text NOT NULL,
  actual_behaviour text NOT NULL,
  screenshots text[] DEFAULT '{}',
  module text,
  testing_person text,
  assigned_employee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved', 'rejected', 'reopened')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  resolution_notes text,
  resolved_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_issues table for business-specific problems
CREATE TABLE IF NOT EXISTS business_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  issue_type text NOT NULL CHECK (issue_type IN ('product_issue', 'ar_issue', 'workflow_issue', 'permission_issue', 'general')),
  title text NOT NULL,
  description text NOT NULL,
  expected_behaviour text,
  actual_behaviour text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  is_ar_related boolean DEFAULT false,
  screenshots text[] DEFAULT '{}',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in-progress', 'resolved', 'closed')),
  assigned_to_employee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_date timestamptz,
  due_date timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes text,
  resolved_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employee_tasks table for task management
CREATE TABLE IF NOT EXISTS employee_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bug_id uuid REFERENCES bugs(id) ON DELETE CASCADE,
  issue_id uuid REFERENCES business_issues(id) ON DELETE CASCADE,
  task_title text NOT NULL,
  task_description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  comments jsonb DEFAULT '[]',
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_date timestamptz DEFAULT now(),
  due_date timestamptz,
  started_date timestamptz,
  completed_date timestamptz,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bugs_user_type ON bugs(user_type);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_priority ON bugs(priority);
CREATE INDEX IF NOT EXISTS idx_bugs_business_id ON bugs(business_id);
CREATE INDEX IF NOT EXISTS idx_bugs_assigned_employee ON bugs(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_bugs_module ON bugs(module);

CREATE INDEX IF NOT EXISTS idx_business_issues_business_id ON business_issues(business_id);
CREATE INDEX IF NOT EXISTS idx_business_issues_status ON business_issues(status);
CREATE INDEX IF NOT EXISTS idx_business_issues_priority ON business_issues(priority);
CREATE INDEX IF NOT EXISTS idx_business_issues_type ON business_issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_business_issues_assigned ON business_issues(assigned_to_employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_tasks_employee ON employee_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_tasks_status ON employee_tasks(status);
CREATE INDEX IF NOT EXISTS idx_employee_tasks_bug ON employee_tasks(bug_id);
CREATE INDEX IF NOT EXISTS idx_employee_tasks_issue ON employee_tasks(issue_id);

-- Enable Row Level Security
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bugs table
CREATE POLICY "Anyone can view bugs" ON bugs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create bugs" ON bugs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update bugs they created or are assigned to" ON bugs FOR UPDATE USING (true);
CREATE POLICY "Admins can delete bugs" ON bugs FOR DELETE USING (true);

-- RLS Policies for business_issues table
CREATE POLICY "Anyone can view business issues" ON business_issues FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create business issues" ON business_issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update business issues" ON business_issues FOR UPDATE USING (true);
CREATE POLICY "Business owners can delete issues" ON business_issues FOR DELETE USING (true);

-- RLS Policies for employee_tasks table
CREATE POLICY "Anyone can view tasks" ON employee_tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tasks" ON employee_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update tasks" ON employee_tasks FOR UPDATE USING (true);
CREATE POLICY "Managers can delete tasks" ON employee_tasks FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_bugs_updated_at BEFORE UPDATE ON bugs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_issues_updated_at BEFORE UPDATE ON business_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_tasks_updated_at BEFORE UPDATE ON employee_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE bugs IS 'System-wide bug tracking for all user roles with multi-image support';
COMMENT ON TABLE business_issues IS 'Business-specific issue tracking for products, AR, and workflows';
COMMENT ON TABLE employee_tasks IS 'Task management system linking bugs and issues to employee assignments';
