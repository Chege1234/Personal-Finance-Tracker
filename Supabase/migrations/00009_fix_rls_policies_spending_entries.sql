-- Drop existing policies on spending_entries
DROP POLICY IF EXISTS "Users can view their own spending entries" ON spending_entries;
DROP POLICY IF EXISTS "Users can insert their own spending entries" ON spending_entries;
DROP POLICY IF EXISTS "Users can update their own spending entries" ON spending_entries;
DROP POLICY IF EXISTS "Users can delete their own spending entries" ON spending_entries;

-- Ensure RLS is enabled
ALTER TABLE spending_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for spending_entries
-- SELECT: Users can view their own spending entries
CREATE POLICY "Users can view their own spending entries" ON spending_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can insert spending entries where user_id matches their auth.uid()
CREATE POLICY "Users can insert their own spending entries" ON spending_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own spending entries
CREATE POLICY "Users can update their own spending entries" ON spending_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own spending entries
CREATE POLICY "Users can delete their own spending entries" ON spending_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);