-- Drop the existing global unique constraint on (month, year)
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_month_year_key;

-- Create a new unique constraint on (user_id, month, year)
-- This allows multiple users to have budgets for the same month/year
-- but prevents a single user from having duplicate budgets for the same period
ALTER TABLE budgets ADD CONSTRAINT budgets_user_month_year_key 
  UNIQUE (user_id, month, year);

-- Add comment to document the constraint purpose
COMMENT ON CONSTRAINT budgets_user_month_year_key ON budgets IS 
  'Ensures each user can only have one budget per month/year combination';