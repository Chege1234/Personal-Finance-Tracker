-- Make user_id NOT NULL in spending_entries table
ALTER TABLE spending_entries ALTER COLUMN user_id SET NOT NULL;