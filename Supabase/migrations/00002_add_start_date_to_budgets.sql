-- Add start_date to budgets table to track when budget was created
ALTER TABLE budgets ADD COLUMN start_date DATE NOT NULL DEFAULT CURRENT_DATE;