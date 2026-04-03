-- Create categories table for persistent category management
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, normalized_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_normalized_name ON categories(user_id, normalized_name);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Function to normalize category names
CREATE OR REPLACE FUNCTION normalize_category_name(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(TRIM(REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s]', '', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Seed standard categories for existing users with predefined colors
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  user_id,
  'Food',
  'food',
  '#19C37D'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'food'
)
ON CONFLICT (user_id, normalized_name) DO NOTHING;

INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  user_id,
  'Transport',
  'transport',
  '#5B6CFF'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'transport'
)
ON CONFLICT (user_id, normalized_name) DO NOTHING;

INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  user_id,
  'Bills',
  'bills',
  '#EF4444'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'bills'
)
ON CONFLICT (user_id, normalized_name) DO NOTHING;

INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  user_id,
  'Entertainment',
  'entertainment',
  '#8B5CF6'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'entertainment'
)
ON CONFLICT (user_id, normalized_name) DO NOTHING;

INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  user_id,
  'Shopping',
  'shopping',
  '#06B6D4'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'shopping'
)
ON CONFLICT (user_id, normalized_name) DO NOTHING;

INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  user_id,
  'Health',
  'health',
  '#10B981'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'health'
)
ON CONFLICT (user_id, normalized_name) DO NOTHING;

INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  user_id,
  'Education',
  'education',
  '#F59E0B'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'education'
)
ON CONFLICT (user_id, normalized_name) DO NOTHING;

INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  user_id,
  'Savings',
  'savings',
  '#EC4899'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'savings'
)
ON CONFLICT (user_id, normalized_name) DO NOTHING;