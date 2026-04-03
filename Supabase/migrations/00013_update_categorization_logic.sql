-- Update the recategorize_entry function to use description as category if no match
CREATE OR REPLACE FUNCTION recategorize_entry(description_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Return 'Uncategorized' for null or empty descriptions
  IF description_text IS NULL OR TRIM(description_text) = '' THEN
    RETURN 'Uncategorized';
  END IF;

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
  
  -- If no keyword match, return the original description as category
  RETURN TRIM(description_text);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the auto-categorize trigger function
CREATE OR REPLACE FUNCTION auto_categorize_spending()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-categorize if category is null or empty
  -- Don't override existing categories (including custom ones)
  IF NEW.category IS NULL OR NEW.category = '' THEN
    NEW.category := recategorize_entry(NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recategorize existing entries that are 'Other' or null
UPDATE spending_entries
SET category = recategorize_entry(description)
WHERE category IS NULL OR category = '' OR category = 'Other';