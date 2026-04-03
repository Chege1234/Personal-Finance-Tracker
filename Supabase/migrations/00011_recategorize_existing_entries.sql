-- Recategorize existing spending entries based on their descriptions
-- This will update all entries with null or 'Other' categories

-- First, let's create a function to categorize based on keywords
CREATE OR REPLACE FUNCTION recategorize_entry(description_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Food & Dining
  IF description_text ~* '(food|restaurant|lunch|dinner|breakfast|cafe|coffee|meal|grocery|groceries|supermarket|market|pizza|burger|sushi|starbucks|mcdonald|kfc|subway|domino|delivery|takeout|bakery|deli|bistro|diner|eatery|snack|drink|beverage)' THEN
    RETURN 'Food & Dining';
  END IF;
  
  -- Transportation
  IF description_text ~* '(uber|lyft|taxi|cab|bus|train|gas|fuel|parking|transport|metro|subway|railway|airline|flight|car|vehicle|toll|petrol|diesel|ride|commute)' THEN
    RETURN 'Transportation';
  END IF;
  
  -- Shopping
  IF description_text ~* '(shop|store|mall|clothes|clothing|shoes|amazon|online|retail|purchase|buy|ebay|walmart|target|fashion|apparel|accessories|electronics|gadget|appliance)' THEN
    RETURN 'Shopping';
  END IF;
  
  -- Entertainment
  IF description_text ~* '(movie|cinema|game|concert|show|entertainment|netflix|spotify|subscription|streaming|music|video|theater|ticket|event|festival|club|bar|pub|recreation)' THEN
    RETURN 'Entertainment';
  END IF;
  
  -- Health
  IF description_text ~* '(doctor|hospital|pharmacy|medicine|medical|health|gym|fitness|clinic|dental|dentist|therapy|wellness|insurance|prescription|vitamin|supplement|workout|yoga)' THEN
    RETURN 'Health';
  END IF;
  
  -- Bills & Utilities
  IF description_text ~* '(bill|electricity|water|internet|phone|rent|utility|mortgage|insurance|subscription|service|payment|fee|charge|cable|wifi|broadband|mobile)' THEN
    RETURN 'Bills & Utilities';
  END IF;
  
  -- Education
  IF description_text ~* '(book|course|class|school|education|tuition|learning|university|college|training|workshop|seminar|study|textbook|supplies|stationery)' THEN
    RETURN 'Education';
  END IF;
  
  -- Personal Care
  IF description_text ~* '(haircut|salon|spa|beauty|cosmetics|personal|barber|manicure|pedicure|massage|skincare|grooming|hygiene)' THEN
    RETURN 'Personal Care';
  END IF;
  
  -- Default to Other
  RETURN 'Other';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update all entries
UPDATE spending_entries
SET category = recategorize_entry(description)
WHERE category IS NULL OR category = 'Other' OR category = '' OR category NOT IN ('Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Health', 'Bills & Utilities', 'Education', 'Personal Care');