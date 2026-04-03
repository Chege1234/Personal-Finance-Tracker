-- Update categorization function with new category system
CREATE OR REPLACE FUNCTION recategorize_entry(description_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Return 'Uncategorized' for null or empty descriptions
  IF description_text IS NULL OR TRIM(description_text) = '' THEN
    RETURN 'Uncategorized';
  END IF;

  -- Food
  IF description_text ~* '(bread|chicken|rice|ugali|groceries|supermarket|restaurant|lunch|dinner|snacks|eggs|milk|food|breakfast|meal|cafe|coffee|pizza|burger|sushi|bakery|deli|eatery)' THEN
    RETURN 'Food';
  END IF;
  
  -- Transport
  IF description_text ~* '(fuel|petrol|gas|uber|bolt|taxi|bus|train|parking|transport|lyft|cab|metro|subway|railway|flight|airline|car|vehicle|toll|diesel|ride|commute)' THEN
    RETURN 'Transport';
  END IF;
  
  -- Bills
  IF description_text ~* '(rent|electricity|water|internet|wifi|phone|airtime|subscription|bill|utility|mortgage|cable|broadband|mobile|service|payment|fee|charge)' THEN
    RETURN 'Bills';
  END IF;
  
  -- Entertainment
  IF description_text ~* '(netflix|spotify|movies|games|cinema|entertainment|movie|game|concert|show|streaming|music|video|theater|ticket|event|festival|club|bar|pub|recreation)' THEN
    RETURN 'Entertainment';
  END IF;
  
  -- Shopping
  IF description_text ~* '(clothes|shoes|electronics|gadgets|shop|store|mall|clothing|amazon|online|retail|purchase|buy|ebay|walmart|target|fashion|apparel|accessories|gadget|appliance)' THEN
    RETURN 'Shopping';
  END IF;
  
  -- Health
  IF description_text ~* '(hospital|pharmacy|medicine|gym|health|doctor|medical|fitness|clinic|dental|dentist|therapy|wellness|insurance|prescription|vitamin|supplement|workout|yoga)' THEN
    RETURN 'Health';
  END IF;
  
  -- Education
  IF description_text ~* '(books|courses|tuition|book|course|class|school|education|learning|university|college|training|workshop|seminar|study|textbook|supplies|stationery)' THEN
    RETURN 'Education';
  END IF;
  
  -- Savings
  IF description_text ~* '(savings|investment|stocks|crypto|invest|save|deposit|portfolio|fund|bond|dividend|retirement)' THEN
    RETURN 'Savings';
  END IF;
  
  -- If no keyword match, return the original description as category
  RETURN TRIM(description_text);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recategorize all existing entries
UPDATE spending_entries
SET category = recategorize_entry(description);