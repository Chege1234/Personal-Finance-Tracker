-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

-- Ensure RLS is enabled
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper checks
-- SELECT: Users can view their own budgets
CREATE POLICY "Users can view their own budgets" ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can insert budgets where user_id matches their auth.uid()
CREATE POLICY "Users can insert their own budgets" ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own budgets
CREATE POLICY "Users can update their own budgets" ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own budgets
CREATE POLICY "Users can delete their own budgets" ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);