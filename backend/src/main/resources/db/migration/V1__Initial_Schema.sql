-- Organizations (for future multi-tenancy)
CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'EMPLOYEE',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requisition Types
CREATE TABLE requisition_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requisitions
CREATE TABLE requisitions (
    id BIGSERIAL PRIMARY KEY,
    requisition_type_id BIGINT NOT NULL REFERENCES requisition_types(id),
    created_by BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'DRAFT',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    description TEXT,
    amount DECIMAL(15,2),
    data TEXT, -- JSON content stored as TEXT for simplicity/compatibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_requisitions_status ON requisitions(status);
CREATE INDEX idx_requisitions_created_at ON requisitions(created_at DESC);

-- Approvals
CREATE TABLE approvals (
    id BIGSERIAL PRIMARY KEY,
    requisition_id BIGINT NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
    approver_id BIGINT NOT NULL REFERENCES users(id),
    sequence_order INT,
    status VARCHAR(50) DEFAULT 'PENDING',
    comment TEXT,
    action_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_requisition ON approvals(requisition_id, sequence_order);

-- Sync Logs
CREATE TABLE sync_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    entity_type VARCHAR(100),
    entity_id BIGINT,
    operation VARCHAR(20),
    payload TEXT, -- JSON content
    synced BOOLEAN DEFAULT false,
    sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_logs_synced ON sync_logs(synced, created_at DESC);

-- Insert initial data
INSERT INTO requisition_types (name, description) VALUES 
('Purchase', 'Purchase requisition for goods/services'),
('Repair & Maintenance', 'Repair and maintenance requests'),
('Salary Advance', 'Salary advance requests');
