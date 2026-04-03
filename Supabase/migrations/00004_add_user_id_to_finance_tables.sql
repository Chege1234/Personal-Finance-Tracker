-- Add user_id to budgets table
ALTER TABLE budgets ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add user_id to spending_entries table
ALTER TABLE spending_entries ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Update existing policies to be user-specific
DROP POLICY IF EXISTS "Allow all operations on budgets" ON budgets;
DROP POLICY IF EXISTS "Allow all operations on spending_entries" ON spending_entries;

-- Budgets policies
CREATE POLICY "Users can view their own budgets" ON budgets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Spending entries policies
CREATE POLICY "Users can view their own spending entries" ON spending_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spending entries" ON spending_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spending entries" ON spending_entries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spending entries" ON spending_entries
  FOR DELETE TO authenticated USING (auth.uid() = user_id);