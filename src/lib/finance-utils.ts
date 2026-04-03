import type { Currency, CURRENCY_SYMBOLS, SpendingEntry, CategorySpending } from '@/types/index';

// Date utilities
export const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
};

export const getCurrentMonth = (): number => {
    return new Date().getMonth() + 1;
};

export const getCurrentYear = (): number => {
    return new Date().getFullYear();
};

export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseDate = (dateString: string): Date => {
    return new Date(dateString);
};

export const isToday = (dateString: string): boolean => {
    const today = formatDate(new Date());
    return dateString === today;
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
};

// Currency utilities
export const formatCurrency = (amount: number, currency: Currency): string => {
    const symbols: Record<Currency, string> = {
        USD: '$',
        KSH: 'KSh',
        TRY: '₺',
    };

    const symbol = symbols[currency];
    const formattedAmount = amount.toFixed(2);

    if (currency === 'KSH') {
        return `${symbol} ${formattedAmount}`;
    }
    return `${symbol}${formattedAmount}`;
};

// Predefined category keyword mappings (MANDATORY)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Food': [
        'bread', 'chicken', 'rice', 'ugali', 'groceries', 'supermarket', 'restaurant',
        'lunch', 'dinner', 'snacks', 'eggs', 'milk', 'food', 'breakfast', 'meal',
        'cafe', 'coffee', 'pizza', 'burger', 'sushi', 'bakery', 'deli', 'eatery'
    ],
    'Transport': [
        'fuel', 'petrol', 'gas', 'uber', 'bolt', 'taxi', 'bus', 'train', 'parking',
        'transport', 'lyft', 'cab', 'metro', 'subway', 'railway', 'flight', 'airline',
        'car', 'vehicle', 'toll', 'diesel', 'ride', 'commute'
    ],
    'Bills': [
        'rent', 'electricity', 'water', 'internet', 'wifi', 'phone', 'airtime',
        'subscription', 'bill', 'utility', 'mortgage', 'cable', 'broadband', 'mobile',
        'service', 'payment', 'fee', 'charge'
    ],
    'Entertainment': [
        'netflix', 'spotify', 'movies', 'games', 'cinema', 'entertainment', 'movie',
        'game', 'concert', 'show', 'streaming', 'music', 'video', 'theater', 'ticket',
        'event', 'festival', 'club', 'bar', 'pub', 'recreation'
    ],
    'Shopping': [
        'clothes', 'shoes', 'electronics', 'gadgets', 'shop', 'store', 'mall',
        'clothing', 'amazon', 'online', 'retail', 'purchase', 'buy', 'ebay',
        'walmart', 'target', 'fashion', 'apparel', 'accessories', 'gadget', 'appliance'
    ],
    'Health': [
        'hospital', 'pharmacy', 'medicine', 'gym', 'health', 'doctor', 'medical',
        'fitness', 'clinic', 'dental', 'dentist', 'therapy', 'wellness', 'insurance',
        'prescription', 'vitamin', 'supplement', 'workout', 'yoga'
    ],
    'Education': [
        'books', 'courses', 'tuition', 'book', 'course', 'class', 'school',
        'education', 'learning', 'university', 'college', 'training', 'workshop',
        'seminar', 'study', 'textbook', 'supplies', 'stationery'
    ],
    'Savings': [
        'savings', 'investment', 'stocks', 'crypto', 'invest', 'save', 'deposit',
        'portfolio', 'fund', 'bond', 'dividend', 'retirement'
    ],
};

export const CATEGORY_ICONS: Record<string, string> = {
    'Food': '🍽️',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Health': '💊',
    'Bills': '📄',
    'Education': '📚',
    'Savings': '💰',
    'Uncategorized': '❓',
    'Other': '📌',
};

export const CATEGORY_COLORS: Record<string, string> = {
    'Food': 'hsl(var(--category-food))',           /* #4CAF50 - Green */
    'Transport': 'hsl(var(--category-transport))', /* #FF9800 - Orange */
    'Bills': 'hsl(var(--category-bills))',         /* #F44336 - Red */
    'Entertainment': 'hsl(var(--category-entertainment))', /* #9C27B0 - Purple */
    'Shopping': 'hsl(var(--category-shopping))',   /* #03A9F4 - Blue */
    'Health': 'hsl(var(--category-health))',       /* #00BCD4 - Cyan */
    'Education': 'hsl(var(--category-education))', /* #FFC107 - Amber */
    'Savings': 'hsl(var(--category-savings))',     /* #8BC34A - Light Green */
    'Other': 'hsl(var(--category-other))',         /* Muted */
};

export const categorizeSpending = (description: string): string => {
    if (!description || description.trim() === '') {
        return 'Uncategorized';
    }

    const lowerDesc = description.toLowerCase().trim();

    // Rule-based keyword matching first
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerDesc.includes(keyword)) {
                return category;
            }
        }
    }

    // If no keyword match, use the original description as category
    // This allows for custom categories based on user's spending patterns
    return description.trim();
};

export const getAllCategories = (): string[] => {
    return [...Object.keys(CATEGORY_KEYWORDS), 'Other'];
};

// Calculate category spending statistics
export const calculateCategorySpending = (entries: SpendingEntry[]): CategorySpending[] => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    let totalAmount = 0;

    for (const entry of entries) {
        const category = entry.category || 'Other';
        const existing = categoryMap.get(category) || { amount: 0, count: 0 };
        categoryMap.set(category, {
            amount: existing.amount + Number(entry.amount),
            count: existing.count + 1,
        });
        totalAmount += Number(entry.amount);
    }

    const result: CategorySpending[] = [];
    for (const [category, data] of categoryMap.entries()) {
        result.push({
            category,
            amount: data.amount,
            count: data.count,
            percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        });
    }

    return result.sort((a, b) => b.amount - a.amount);
};

// Generate spending insights
export const generateSpendingInsights = (entries: SpendingEntry[]): string[] => {
    const insights: string[] = [];

    if (entries.length === 0) {
        return ['No spending data available yet.'];
    }

    // Category analysis
    const categorySpending = calculateCategorySpending(entries);
    if (categorySpending.length > 0) {
        const topCategory = categorySpending[0];
        insights.push(`Your highest spending category is ${topCategory.category} (${topCategory.percentage.toFixed(1)}% of total).`);
    }

    // Day of week analysis
    const daySpending = new Map<string, number>();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const entry of entries) {
        const date = new Date(entry.date);
        const dayName = dayNames[date.getDay()];
        daySpending.set(dayName, (daySpending.get(dayName) || 0) + Number(entry.amount));
    }

    if (daySpending.size > 0) {
        const sortedDays = Array.from(daySpending.entries()).sort((a, b) => b[1] - a[1]);
        insights.push(`You tend to spend most on ${sortedDays[0][0]}s.`);
    }

    // Average spending
    const totalSpent = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
    const avgPerEntry = totalSpent / entries.length;
    insights.push(`Your average transaction amount is ${avgPerEntry.toFixed(2)}.`);

    return insights;
};
