-- Step 1: Create a function to get a unique color for a user's category
CREATE OR REPLACE FUNCTION get_unique_color_for_user(p_user_id UUID, p_category_name TEXT)
RETURNS TEXT AS $$
DECLARE
  v_color TEXT;
  v_used_colors TEXT[];
  v_palette TEXT[] := ARRAY['#5B6CFF', '#19C37D', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981', '#EC4899'];
  v_color_candidate TEXT;
  v_index INT;
BEGIN
  -- Get all colors already used by this user
  SELECT ARRAY_AGG(DISTINCT color) INTO v_used_colors
  FROM categories
  WHERE user_id = p_user_id;
  
  -- If no colors used yet, return first color
  IF v_used_colors IS NULL THEN
    RETURN v_palette[1];
  END IF;
  
  -- Find first unused color
  FOREACH v_color_candidate IN ARRAY v_palette
  LOOP
    IF NOT (v_color_candidate = ANY(v_used_colors)) THEN
      RETURN v_color_candidate;
    END IF;
  END LOOP;
  
  -- If all colors used, use hash-based selection
  v_index := (LENGTH(p_category_name) + ASCII(SUBSTRING(p_category_name, 1, 1))) % 8 + 1;
  RETURN v_palette[v_index];
END;
$$ LANGUAGE plpgsql;

-- Step 2: Recategorize items that should be in standard categories
-- Biscuit, Crisps, Snacks, Drink -> Food
UPDATE spending_entries
SET category = 'Food'
WHERE LOWER(category) IN ('biscuit', 'crisps', 'snacks', 'drink')
  AND EXISTS (SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'food');

-- Fare -> Transport
UPDATE spending_entries
SET category = 'Transport'
WHERE LOWER(category) IN ('fare')
  AND EXISTS (SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'transport');

-- Soap, Wallet -> Shopping
UPDATE spending_entries
SET category = 'Shopping'
WHERE LOWER(category) IN ('soap', 'wallet')
  AND EXISTS (SELECT 1 FROM categories WHERE categories.user_id = spending_entries.user_id AND categories.normalized_name = 'shopping');

-- Step 3: Delete orphaned categories (categories with no spending entries)
DELETE FROM categories
WHERE id IN (
  SELECT c.id
  FROM categories c
  LEFT JOIN spending_entries se ON se.category = c.name AND se.user_id = c.user_id
  WHERE se.id IS NULL
  AND c.normalized_name NOT IN ('food', 'transport', 'bills', 'entertainment', 'shopping', 'health', 'education', 'savings')
);

-- Step 4: Fix duplicate colors by reassigning unique colors
-- Create a temporary table to track which categories need new colors
CREATE TEMP TABLE categories_to_fix AS
SELECT 
  c1.id,
  c1.user_id,
  c1.name,
  c1.color,
  c1.created_at,
  ROW_NUMBER() OVER (PARTITION BY c1.user_id, c1.color ORDER BY c1.created_at) as rn
FROM categories c1
WHERE EXISTS (
  SELECT 1 FROM categories c2
  WHERE c2.user_id = c1.user_id 
  AND c2.color = c1.color 
  AND c2.id != c1.id
);

-- Update categories that are duplicates (keep the first one, change others)
UPDATE categories c
SET color = get_unique_color_for_user(c.user_id, c.name)
FROM categories_to_fix ctf
WHERE c.id = ctf.id AND ctf.rn > 1;

DROP TABLE categories_to_fix;