-- V3: Approval Workflow Enhancement
-- Adds payment tracking, file uploads, and workflow fields

-- Add payment tracking fields
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS payment_utr_no VARCHAR(100);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(15,2);

-- Add file upload URLs
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS payment_photo_url VARCHAR(500);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS material_photo_url VARCHAR(500);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS bill_photo_url VARCHAR(500);

-- Add workflow tracking fields
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS material_received BOOLEAN DEFAULT FALSE;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS receipt_notes TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_requisitions_approval_status ON requisitions(approval_status);
CREATE INDEX IF NOT EXISTS idx_requisitions_payment_status ON requisitions(payment_status);
CREATE INDEX IF NOT EXISTS idx_requisitions_organization_status ON requisitions(organization_id, status);
