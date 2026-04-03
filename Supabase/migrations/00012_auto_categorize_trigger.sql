-- Create a trigger to automatically categorize spending entries on insert/update
CREATE OR REPLACE FUNCTION auto_categorize_spending()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-categorize if category is null, empty, or 'Other'
  IF NEW.category IS NULL OR NEW.category = '' OR NEW.category = 'Other' THEN
    NEW.category := recategorize_entry(NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_categorize_spending ON spending_entries;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER trigger_auto_categorize_spending
  BEFORE INSERT OR UPDATE ON spending_entries
  FOR EACH ROW
  EXECUTE FUNCTION auto_categorize_spending();