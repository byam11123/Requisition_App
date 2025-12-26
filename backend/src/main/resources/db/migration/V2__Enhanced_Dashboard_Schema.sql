-- Enable UUID extension if not enabled (useful for future, though we use Long IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Organization Table (Table exists in V1, so we ALTER it)
-- fields in V1: id, name, created_at
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'FREE';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Set defaults for existing rows if needed
UPDATE organizations SET contact_email = 'admin@default.com' WHERE contact_email IS NULL;
ALTER TABLE organizations ALTER COLUMN contact_email SET NOT NULL;

-- 2. Update Users Table for Multi-Tenancy
-- Add organization_id column allowing NULL initially for migration of existing users
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(255);

-- Create a default organization for existing users to prevent data loss
-- Create a default organization for existing users to prevent data loss (Avoid duplicate if exists)
INSERT INTO organizations (name, contact_email, address) 
SELECT 'Default Organization', 'admin@default.com', 'System generated default organization'
WHERE NOT EXISTS (SELECT 1 FROM organizations);

-- Assign all existing users to the default organization
UPDATE users SET organization_id = (SELECT id FROM organizations LIMIT 1) WHERE organization_id IS NULL;

-- Now make organization_id NOT NULL and add Foreign Key constraint
ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT fk_user_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- Update User Roles (Convert existing roles if necessary, or just rely on enum string compatibility)
-- Assuming existing roles 'ADMIN', 'MANAGER', 'EMPLOYEE' map reasonably well to new roles.
-- 'EMPLOYEE' should be updated to 'PURCHASER'
UPDATE users SET role = 'PURCHASER' WHERE role = 'EMPLOYEE';

-- 3. Update Requisitions Table
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS organization_id BIGINT;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS request_id VARCHAR(50) UNIQUE;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'NOT_DONE';
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS dispatch_status VARCHAR(50) DEFAULT 'NOT_DISPATCHED';
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'NORMAL';

-- Add new business fields
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS site_address VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS material_description VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS po_details VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS required_for VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS indent_no VARCHAR(50);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS mode_of_payment VARCHAR(50);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS payment_details VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS card_subtitle_info VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP;

-- Dispatch tracking
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS dispatched_by BIGINT;
ALTER TABLE requisitions ADD CONSTRAINT fk_requisition_dispatched_by FOREIGN KEY (dispatched_by) REFERENCES users(id);

-- Timestamps
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS manager_time TIMESTAMP;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS accountant_time TIMESTAMP;

-- Assign all existing requisitions to the default organization
UPDATE requisitions SET organization_id = (SELECT id FROM organizations LIMIT 1) WHERE organization_id IS NULL;

-- Enforce NOT NULL on organization_id
ALTER TABLE requisitions ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE requisitions ADD CONSTRAINT fk_requisition_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- Generate Request IDs for existing records (e.g., REQ-0001, REQ-0002)
WITH ranked_reqs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM requisitions
)
UPDATE requisitions
SET request_id = CONCAT('REQ-', LPAD(rr.rn::text, 4, '0'))
FROM ranked_reqs rr
WHERE requisitions.id = rr.id AND requisitions.request_id IS NULL;


-- 4. Create Attachments Table
CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_size BIGINT,
    category VARCHAR(50), -- ITEM, BILL, PAYMENT
    uploaded_by BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_requisition FOREIGN KEY (requisition_id) REFERENCES requisitions(id),
    CONSTRAINT fk_attachment_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 5. Create Indexes for Performance
CREATE INDEX idx_user_organization ON users(organization_id);
CREATE INDEX idx_requisition_organization ON requisitions(organization_id);
CREATE INDEX idx_requisition_status ON requisitions(status);
CREATE INDEX idx_requisition_approval_status ON requisitions(approval_status);
CREATE INDEX idx_requisition_created_at ON requisitions(created_at DESC);
