-- V6: Track users responsible for approval and payment steps

ALTER TABLE requisitions
    ADD COLUMN approved_by BIGINT,
    ADD COLUMN paid_by BIGINT;

ALTER TABLE requisitions
    ADD CONSTRAINT fk_requisitions_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);

ALTER TABLE requisitions
    ADD CONSTRAINT fk_requisitions_paid_by FOREIGN KEY (paid_by) REFERENCES users(id);
