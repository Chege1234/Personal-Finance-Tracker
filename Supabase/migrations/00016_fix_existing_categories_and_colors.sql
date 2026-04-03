-- Map old category names to new standardized names in spending_entries
UPDATE spending_entries
SET category = CASE
  WHEN category = 'Food & Dining' THEN 'Food'
  WHEN category = 'Transportation' THEN 'Transport'
  WHEN category = 'Bills & Utilities' THEN 'Bills'
  WHEN category = 'Personal Care' THEN 'Health'
  ELSE category
END
WHERE category IN ('Food & Dining', 'Transportation', 'Bills & Utilities', 'Personal Care');

-- Ensure all users have standard categories with correct colors
-- This will insert missing standard categories for each user

-- Food (#19C37D - green)
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT user_id, 'Food', 'food', '#19C37D'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = spending_entries.user_id 
  AND categories.normalized_name = 'food'
)
ON CONFLICT (user_id, normalized_name) DO UPDATE
SET color = '#19C37D', name = 'Food';

-- Transport (#5B6CFF - blue-violet)
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT user_id, 'Transport', 'transport', '#5B6CFF'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = spending_entries.user_id 
  AND categories.normalized_name = 'transport'
)
ON CONFLICT (user_id, normalized_name) DO UPDATE
SET color = '#5B6CFF', name = 'Transport';

-- Bills (#EF4444 - red)
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT user_id, 'Bills', 'bills', '#EF4444'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = spending_entries.user_id 
  AND categories.normalized_name = 'bills'
)
ON CONFLICT (user_id, normalized_name) DO UPDATE
SET color = '#EF4444', name = 'Bills';

-- Entertainment (#8B5CF6 - purple)
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT user_id, 'Entertainment', 'entertainment', '#8B5CF6'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = spending_entries.user_id 
  AND categories.normalized_name = 'entertainment'
)
ON CONFLICT (user_id, normalized_name) DO UPDATE
SET color = '#8B5CF6', name = 'Entertainment';

-- Shopping (#06B6D4 - cyan)
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT user_id, 'Shopping', 'shopping', '#06B6D4'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = spending_entries.user_id 
  AND categories.normalized_name = 'shopping'
)
ON CONFLICT (user_id, normalized_name) DO UPDATE
SET color = '#06B6D4', name = 'Shopping';

-- Health (#10B981 - teal)
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT user_id, 'Health', 'health', '#10B981'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = spending_entries.user_id 
  AND categories.normalized_name = 'health'
)
ON CONFLICT (user_id, normalized_name) DO UPDATE
SET color = '#10B981', name = 'Health';

-- Education (#F59E0B - amber)
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT user_id, 'Education', 'education', '#F59E0B'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = spending_entries.user_id 
  AND categories.normalized_name = 'education'
)
ON CONFLICT (user_id, normalized_name) DO UPDATE
SET color = '#F59E0B', name = 'Education';

-- Savings (#EC4899 - pink)
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT user_id, 'Savings', 'savings', '#EC4899'
FROM spending_entries
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = spending_entries.user_id 
  AND categories.normalized_name = 'savings'
)
ON CONFLICT (user_id, normalized_name) DO UPDATE
SET color = '#EC4899', name = 'Savings';

-- Create categories for any custom category names that exist in spending_entries
-- but don't have a corresponding entry in the categories table
INSERT INTO categories (user_id, name, normalized_name, color)
SELECT DISTINCT 
  se.user_id,
  se.category,
  normalize_category_name(se.category),
  -- Assign color based on hash of category name for consistency
  CASE (ASCII(LOWER(se.category)) % 8)
    WHEN 0 THEN '#5B6CFF'
    WHEN 1 THEN '#19C37D'
    WHEN 2 THEN '#F59E0B'
    WHEN 3 THEN '#EF4444'
    WHEN 4 THEN '#8B5CF6'
    WHEN 5 THEN '#06B6D4'
    WHEN 6 THEN '#10B981'
    ELSE '#EC4899'
  END
FROM spending_entries se
WHERE se.category IS NOT NULL 
  AND se.category != ''
  AND se.category NOT IN ('Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Health', 'Education', 'Savings', 'Uncategorized')
  AND NOT EXISTS (
    SELECT 1 FROM categories c
    WHERE c.user_id = se.user_id 
    AND c.normalized_name = normalize_category_name(se.category)
  )
ON CONFLICT (user_id, normalized_name) DO NOTHING;