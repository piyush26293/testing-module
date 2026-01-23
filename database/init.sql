-- =====================================================
-- AI-Powered Testing Platform - Database Schema
-- PostgreSQL DDL Script
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'project_manager', 'qa_lead', 'qa_engineer', 'developer', 'viewer');
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE test_case_status AS ENUM ('draft', 'active', 'deprecated', 'archived');
CREATE TYPE test_case_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'passed', 'failed', 'skipped', 'error');
CREATE TYPE execution_trigger AS ENUM ('manual', 'scheduled', 'ci_cd', 'api');
CREATE TYPE browser_type AS ENUM ('chromium', 'firefox', 'webkit', 'chrome', 'edge');
CREATE TYPE step_type AS ENUM ('navigate', 'click', 'type', 'select', 'wait', 'assert', 'custom');
CREATE TYPE locator_strategy AS ENUM ('css', 'xpath', 'text', 'role', 'testid', 'ai_generated');

-- =====================================================
-- TABLES
-- =====================================================

-- Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'viewer',
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- API Keys Table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    scopes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    base_url VARCHAR(500),
    status project_status DEFAULT 'active',
    settings JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, slug)
);

-- Project Members Table
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'viewer',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Test Suites Table
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_suite_id UUID REFERENCES test_suites(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Test Cases Table
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    suite_id UUID REFERENCES test_suites(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status test_case_status DEFAULT 'draft',
    priority test_case_priority DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_ai_generated BOOLEAN DEFAULT false,
    ai_metadata JSONB DEFAULT '{}'::jsonb,
    preconditions TEXT,
    postconditions TEXT,
    timeout INTEGER DEFAULT 30000,
    retry_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Test Steps Table
CREATE TABLE test_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    step_type step_type NOT NULL,
    description TEXT,
    action VARCHAR(255) NOT NULL,
    target_element VARCHAR(500),
    target_locator locator_strategy,
    input_data TEXT,
    expected_result TEXT,
    timeout INTEGER DEFAULT 5000,
    screenshot_enabled BOOLEAN DEFAULT true,
    ai_generated_locator BOOLEAN DEFAULT false,
    locator_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Test Executions Table
CREATE TABLE test_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    test_case_id UUID REFERENCES test_cases(id) ON DELETE SET NULL,
    suite_id UUID REFERENCES test_suites(id) ON DELETE SET NULL,
    execution_name VARCHAR(255),
    status execution_status DEFAULT 'pending',
    trigger execution_trigger DEFAULT 'manual',
    browser browser_type DEFAULT 'chromium',
    environment VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    error_message TEXT,
    stack_trace TEXT,
    video_url VARCHAR(500),
    summary JSONB DEFAULT '{}'::jsonb,
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Execution Logs Table
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES test_executions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES test_steps(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL,
    status execution_status NOT NULL,
    message TEXT,
    error_message TEXT,
    screenshot_url VARCHAR(500),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Screenshots Table
CREATE TABLE screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES test_executions(id) ON DELETE CASCADE,
    log_id UUID REFERENCES execution_logs(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- AI Generated Tests Table
CREATE TABLE ai_generated_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    test_case_id UUID REFERENCES test_cases(id) ON DELETE SET NULL,
    url VARCHAR(500) NOT NULL,
    user_flow_description TEXT,
    generated_steps JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    model_used VARCHAR(100),
    tokens_used INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Self Healing Records Table
CREATE TABLE self_healing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES test_executions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES test_steps(id) ON DELETE SET NULL,
    original_locator VARCHAR(500) NOT NULL,
    healed_locator VARCHAR(500) NOT NULL,
    locator_strategy locator_strategy NOT NULL,
    confidence_score DECIMAL(3,2),
    success BOOLEAN,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Executions Table
CREATE TABLE scheduled_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    suite_id UUID REFERENCES test_suites(id) ON DELETE SET NULL,
    test_case_ids UUID[] DEFAULT '{}',
    name VARCHAR(255) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    browser browser_type DEFAULT 'chromium',
    environment VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100),
    time_period_start TIMESTAMP WITH TIME ZONE,
    time_period_end TIMESTAMP WITH TIME ZONE,
    summary JSONB DEFAULT '{}'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    ai_insights TEXT,
    file_path VARCHAR(500),
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Refresh Tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- API Keys
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- Projects
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- Project Members
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- Test Suites
CREATE INDEX idx_test_suites_project_id ON test_suites(project_id);
CREATE INDEX idx_test_suites_parent_suite_id ON test_suites(parent_suite_id);

-- Test Cases
CREATE INDEX idx_test_cases_project_id ON test_cases(project_id);
CREATE INDEX idx_test_cases_suite_id ON test_cases(suite_id);
CREATE INDEX idx_test_cases_status ON test_cases(status);
CREATE INDEX idx_test_cases_priority ON test_cases(priority);
CREATE INDEX idx_test_cases_tags ON test_cases USING GIN(tags);
CREATE INDEX idx_test_cases_is_ai_generated ON test_cases(is_ai_generated);

-- Test Steps
CREATE INDEX idx_test_steps_test_case_id ON test_steps(test_case_id);
CREATE INDEX idx_test_steps_order_index ON test_steps(order_index);

-- Test Executions
CREATE INDEX idx_test_executions_project_id ON test_executions(project_id);
CREATE INDEX idx_test_executions_test_case_id ON test_executions(test_case_id);
CREATE INDEX idx_test_executions_suite_id ON test_executions(suite_id);
CREATE INDEX idx_test_executions_status ON test_executions(status);
CREATE INDEX idx_test_executions_trigger ON test_executions(trigger);
CREATE INDEX idx_test_executions_started_at ON test_executions(started_at);

-- Execution Logs
CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_execution_logs_step_id ON execution_logs(step_id);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);

-- Screenshots
CREATE INDEX idx_screenshots_execution_id ON screenshots(execution_id);
CREATE INDEX idx_screenshots_log_id ON screenshots(log_id);

-- AI Generated Tests
CREATE INDEX idx_ai_generated_tests_project_id ON ai_generated_tests(project_id);
CREATE INDEX idx_ai_generated_tests_test_case_id ON ai_generated_tests(test_case_id);
CREATE INDEX idx_ai_generated_tests_status ON ai_generated_tests(status);

-- Self Healing Records
CREATE INDEX idx_self_healing_records_execution_id ON self_healing_records(execution_id);
CREATE INDEX idx_self_healing_records_step_id ON self_healing_records(step_id);

-- Scheduled Executions
CREATE INDEX idx_scheduled_executions_project_id ON scheduled_executions(project_id);
CREATE INDEX idx_scheduled_executions_is_active ON scheduled_executions(is_active);
CREATE INDEX idx_scheduled_executions_next_run_at ON scheduled_executions(next_run_at);

-- Reports
CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_time_period_start ON reports(time_period_start);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON test_suites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_steps_updated_at BEFORE UPDATE ON test_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_executions_updated_at BEFORE UPDATE ON test_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_generated_tests_updated_at BEFORE UPDATE ON ai_generated_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_executions_updated_at BEFORE UPDATE ON scheduled_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment test case version
CREATE OR REPLACE FUNCTION increment_test_case_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (
        OLD.name != NEW.name OR
        OLD.description != NEW.description OR
        OLD.status != NEW.status
    ) THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_test_case_version_trigger BEFORE UPDATE ON test_cases
    FOR EACH ROW EXECUTE FUNCTION increment_test_case_version();

-- Function to update execution summary
CREATE OR REPLACE FUNCTION update_execution_summary()
RETURNS TRIGGER AS $$
DECLARE
    passed_count INTEGER;
    failed_count INTEGER;
    skipped_count INTEGER;
    error_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT 
        COUNT(CASE WHEN status = 'passed' THEN 1 END),
        COUNT(CASE WHEN status = 'failed' THEN 1 END),
        COUNT(CASE WHEN status = 'skipped' THEN 1 END),
        COUNT(CASE WHEN status = 'error' THEN 1 END),
        COUNT(*)
    INTO passed_count, failed_count, skipped_count, error_count, total_count
    FROM execution_logs
    WHERE execution_id = NEW.execution_id;

    UPDATE test_executions
    SET summary = jsonb_build_object(
        'total', total_count,
        'passed', passed_count,
        'failed', failed_count,
        'skipped', skipped_count,
        'error', error_count,
        'pass_rate', CASE WHEN total_count > 0 THEN ROUND((passed_count::DECIMAL / total_count) * 100, 2) ELSE 0 END
    )
    WHERE id = NEW.execution_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_execution_summary_trigger AFTER INSERT OR UPDATE ON execution_logs
    FOR EACH ROW EXECUTE FUNCTION update_execution_summary();

-- =====================================================
-- VIEWS
-- =====================================================

-- Active Test Cases View
CREATE OR REPLACE VIEW active_test_cases AS
SELECT 
    tc.id,
    tc.project_id,
    tc.suite_id,
    tc.name,
    tc.description,
    tc.status,
    tc.priority,
    tc.tags,
    tc.version,
    tc.is_ai_generated,
    tc.created_at,
    tc.updated_at,
    p.name as project_name,
    ts.name as suite_name,
    u.first_name || ' ' || u.last_name as created_by_name,
    (SELECT COUNT(*) FROM test_steps WHERE test_case_id = tc.id) as step_count,
    (SELECT MAX(started_at) FROM test_executions WHERE test_case_id = tc.id) as last_execution_at
FROM test_cases tc
LEFT JOIN projects p ON tc.project_id = p.id
LEFT JOIN test_suites ts ON tc.suite_id = ts.id
LEFT JOIN users u ON tc.created_by = u.id
WHERE tc.deleted_at IS NULL AND tc.status = 'active';

-- Execution Statistics View
CREATE OR REPLACE VIEW execution_statistics AS
SELECT 
    te.project_id,
    p.name as project_name,
    DATE(te.started_at) as execution_date,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN te.status = 'passed' THEN 1 END) as passed,
    COUNT(CASE WHEN te.status = 'failed' THEN 1 END) as failed,
    COUNT(CASE WHEN te.status = 'error' THEN 1 END) as errors,
    COUNT(CASE WHEN te.status = 'skipped' THEN 1 END) as skipped,
    ROUND(AVG(te.duration_ms), 2) as avg_duration_ms,
    ROUND(
        (COUNT(CASE WHEN te.status = 'passed' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(*), 0)) * 100, 2
    ) as pass_rate
FROM test_executions te
LEFT JOIN projects p ON te.project_id = p.id
WHERE te.started_at IS NOT NULL
GROUP BY te.project_id, p.name, DATE(te.started_at);

-- Project Dashboard View
CREATE OR REPLACE VIEW project_dashboard AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.status,
    p.created_at,
    o.name as organization_name,
    COUNT(DISTINCT tc.id) as total_test_cases,
    COUNT(DISTINCT CASE WHEN tc.status = 'active' THEN tc.id END) as active_test_cases,
    COUNT(DISTINCT ts.id) as total_test_suites,
    COUNT(DISTINCT te.id) as total_executions,
    COUNT(DISTINCT CASE WHEN te.status = 'passed' AND te.started_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN te.id END) as recent_passed,
    COUNT(DISTINCT CASE WHEN te.status = 'failed' AND te.started_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN te.id END) as recent_failed,
    MAX(te.started_at) as last_execution_at
FROM projects p
LEFT JOIN organizations o ON p.organization_id = o.id
LEFT JOIN test_cases tc ON p.id = tc.project_id AND tc.deleted_at IS NULL
LEFT JOIN test_suites ts ON p.id = ts.project_id AND ts.deleted_at IS NULL
LEFT JOIN test_executions te ON p.id = te.project_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name, p.slug, p.description, p.status, p.created_at, o.name;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default organization
INSERT INTO organizations (id, name, slug, description, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'default-org', 'Default organization for development', true);

-- Insert admin user (password: admin123)
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@testing-platform.com', '$2b$10$K8xZ7Z0Z5Z5Z5Z5Z5Z5Z5uKYVJ9X9X9X9X9X9X9X9X9X9X9X9X9X9', 'Admin', 'User', 'admin', true, true),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'qa@testing-platform.com', '$2b$10$K8xZ7Z0Z5Z5Z5Z5Z5Z5Z5uKYVJ9X9X9X9X9X9X9X9X9X9X9X9X9X9', 'QA', 'Engineer', 'qa_engineer', true, true);

-- Insert sample project
INSERT INTO projects (id, organization_id, name, slug, description, base_url, status, created_by)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sample E-commerce Project', 'sample-ecommerce', 'Sample project for e-commerce testing', 'https://example.com', 'active', '00000000-0000-0000-0000-000000000001');

-- Insert project members
INSERT INTO project_members (project_id, user_id, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'qa_engineer');

-- Insert sample test suite
INSERT INTO test_suites (id, project_id, name, description, created_by)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Login & Authentication', 'Tests for login and authentication flows', '00000000-0000-0000-0000-000000000001');

-- Insert sample test case
INSERT INTO test_cases (id, project_id, suite_id, name, description, status, priority, tags, created_by)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Valid Login Test', 'Test login with valid credentials', 'active', 'high', ARRAY['login', 'smoke'], '00000000-0000-0000-0000-000000000001');

-- Insert sample test steps
INSERT INTO test_steps (test_case_id, order_index, step_type, description, action, target_element, target_locator, expected_result)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 1, 'navigate', 'Navigate to login page', 'navigate', '/login', 'css', 'Login page is displayed'),
    ('00000000-0000-0000-0000-000000000001', 2, 'type', 'Enter username', 'type', '#username', 'css', 'Username is entered'),
    ('00000000-0000-0000-0000-000000000001', 3, 'type', 'Enter password', 'type', '#password', 'css', 'Password is entered'),
    ('00000000-0000-0000-0000-000000000001', 4, 'click', 'Click login button', 'click', '#login-button', 'css', 'User is logged in'),
    ('00000000-0000-0000-0000-000000000001', 5, 'assert', 'Verify dashboard is displayed', 'assert', '.dashboard', 'css', 'Dashboard is visible');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
