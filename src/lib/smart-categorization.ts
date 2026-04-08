import type { Category } from '@/types/index';
import { getAllCategories, createCategory, getCategoryByNormalizedName } from '@/db/api';

// Fixed color palette for categories
const COLOR_PALETTE = [
    '#5B6CFF', // blue-violet
    '#19C37D', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#10B981', // teal
    '#EC4899', // pink
];

// Predefined keyword mappings for initial categorization
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Food': [
        'bread', 'chicken', 'rice', 'ugali', 'groceries', 'supermarket', 'restaurant',
        'lunch', 'dinner', 'snacks', 'eggs', 'milk', 'food', 'breakfast', 'meal',
        'cafe', 'coffee', 'pizza', 'burger', 'sushi', 'bakery', 'deli', 'eatery',
        'biscuit', 'crisps', 'drink', 'beverage', 'juice', 'soda', 'water', 'tea',
        'snack', 'fruit', 'vegetable', 'meat', 'fish', 'cheese', 'yogurt', 'cereal'
    ],
    'Transport': [
        'fuel', 'petrol', 'gas', 'uber', 'bolt', 'taxi', 'bus', 'train', 'parking',
        'transport', 'lyft', 'cab', 'metro', 'subway', 'railway', 'flight', 'airline',
        'car', 'vehicle', 'toll', 'diesel', 'ride', 'commute', 'fare', 'matatu'
    ],
    'Bills': [
        'rent', 'electricity', 'water', 'internet', 'wifi', 'phone', 'airtime',
        'subscription', 'bill', 'utility', 'mortgage', 'cable', 'broadband', 'mobile',
        'service', 'payment', 'fee', 'charge', 'insurance'
    ],
    'Entertainment': [
        'netflix', 'spotify', 'movies', 'games', 'cinema', 'entertainment', 'movie',
        'game', 'concert', 'show', 'streaming', 'music', 'video', 'theater', 'ticket',
        'event', 'festival', 'club', 'bar', 'pub', 'recreation', 'party'
    ],
    'Shopping': [
        'clothes', 'shoes', 'electronics', 'gadgets', 'shop', 'store', 'mall',
        'clothing', 'amazon', 'online', 'retail', 'purchase', 'buy', 'ebay',
        'walmart', 'target', 'fashion', 'apparel', 'accessories', 'gadget', 'appliance',
        'soap', 'wallet', 'bag', 'watch', 'jewelry', 'cosmetics', 'perfume'
    ],
    'Health': [
        'hospital', 'pharmacy', 'medicine', 'gym', 'health', 'doctor', 'medical',
        'fitness', 'clinic', 'dental', 'dentist', 'therapy', 'wellness', 'insurance',
        'prescription', 'vitamin', 'supplement', 'workout', 'yoga', 'exercise'
    ],
    'Education': [
        'books', 'courses', 'tuition', 'book', 'course', 'class', 'school',
        'education', 'learning', 'university', 'college', 'training', 'workshop',
        'seminar', 'study', 'textbook', 'supplies', 'stationery', 'pen', 'notebook'
    ],
    'Savings': [
        'savings', 'investment', 'stocks', 'crypto', 'invest', 'save', 'deposit',
        'portfolio', 'fund', 'bond', 'dividend', 'retirement'
    ],
};

/**
 * Normalize a string for comparison
 */
export const normalizeString = (str: string): string => {
    return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[len1][len2];
};

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
    const normalized1 = normalizeString(str1);
    const normalized2 = normalizeString(str2);

    // Exact match
    if (normalized1 === normalized2) return 1.0;

    // Token overlap similarity
    const tokens1 = normalized1.split(/\s+/);
    const tokens2 = normalized2.split(/\s+/);
    const commonTokens = tokens1.filter(t => tokens2.includes(t)).length;
    const tokenSimilarity = (2 * commonTokens) / (tokens1.length + tokens2.length);

    // Levenshtein similarity
    const maxLen = Math.max(normalized1.length, normalized2.length);
    const distance = levenshteinDistance(normalized1, normalized2);
    const levenshteinSimilarity = 1 - distance / maxLen;

    // Weighted average (favor token similarity for multi-word matches)
    return tokenSimilarity * 0.6 + levenshteinSimilarity * 0.4;
};

/**
 * Get next color from palette (deterministic based on category count)
 */
const getNextColor = (existingCategories: Category[]): string => {
    const usedColors = new Set(existingCategories.map(c => c.color));

    // Find first unused color
    for (const color of COLOR_PALETTE) {
        if (!usedColors.has(color)) {
            return color;
        }
    }

    // If all colors used, cycle through palette
    const index = existingCategories.length % COLOR_PALETTE.length;
    return COLOR_PALETTE[index];
};

/**
 * Check if description matches any predefined category keywords
 */
const matchPredefinedCategory = (description: string): string | null => {
    const normalized = normalizeString(description);

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                return category;
            }
        }
    }

    return null;
};

/**
 * Smart categorization with semantic similarity matching
 * 
 * Algorithm:
 * 1. Normalize transaction description
 * 2. Check predefined keywords first (for common categories)
 * 3. Compare against existing user categories using similarity
 * 4. If similarity >= 0.5, assign to existing category (lowered threshold)
 * 5. Check if it's a single-word item that should go to standard category
 * 6. Only create new category if truly unique
 */
export const smartCategorize = async (description: string): Promise<string> => {
    if (!description || description.trim() === '') {
        return 'Uncategorized';
    }

    const normalized = normalizeString(description);

    // Step 1: Check predefined keywords (most aggressive)
    const predefinedMatch = matchPredefinedCategory(description);
    if (predefinedMatch) {
        // Ensure category exists in database
        let category = await getCategoryByNormalizedName(predefinedMatch.toLowerCase());
        if (!category) {
            // Create it with appropriate color
            const existingCategories = await getAllCategories();
            const color = getNextColor(existingCategories);
            category = await createCategory(predefinedMatch, color);
        }
        
        if (!category) {
            return 'Other';
        }
        
        return category.name;
    }

    // Step 2: Get all existing categories
    const existingCategories = await getAllCategories();

    // Step 3: Find best matching category using similarity (lowered threshold to 0.5)
    let bestMatch: Category | null = null;
    let bestScore = 0;
    const SIMILARITY_THRESHOLD = 0.5; // Lowered from 0.75 to be more aggressive

    for (const category of existingCategories) {
        const similarity = calculateSimilarity(description, category.name);
        if (similarity > bestScore) {
            bestScore = similarity;
            bestMatch = category;
        }
    }

    // Step 4: If good match found, use it
    if (bestMatch && bestScore >= SIMILARITY_THRESHOLD) {
        return bestMatch.name;
    }

    // Step 5: For single-word items, default to Shopping if no better match
    const words = normalized.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 1 && words[0].length <= 15) {
        // Single word items like "soap", "wallet", "biscuit" should go to Shopping
        const shoppingCategory = existingCategories.find(c => c.normalized_name === 'shopping');
        if (shoppingCategory) {
            return shoppingCategory.name;
        }
    }

    // Step 6: Check if category with this normalized name already exists
    let existingCategory = await getCategoryByNormalizedName(normalized);
    if (existingCategory) {
        return existingCategory.name;
    }

    // Step 7: Last resort - create new category with next available color
    const categoryName = description.trim();
    const color = getNextColor(existingCategories);
    const newCategory = await createCategory(categoryName, color);

    return newCategory.name;
};

/**
 * Get category color (from database)
 */
export const getCategoryColor = async (categoryName: string): Promise<string> => {
    const normalized = normalizeString(categoryName);
    const category = await getCategoryByNormalizedName(normalized);

    if (category) {
        return category.color;
    }

    // Fallback color
    return '#6B7280';
};