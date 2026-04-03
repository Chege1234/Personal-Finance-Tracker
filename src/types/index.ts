export interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    withCount?: boolean;
}

// Finance types
export interface Budget {
    id: string;
    month: number;
    year: number;
    monthly_amount: number;
    currency: string;
    days_in_month: number;
    daily_budget: number;
    start_date: string;
    created_at: string;
}

export interface SpendingEntry {
    id: string;
    date: string;
    amount: number;
    description: string;
    category: string | null;
    created_at: string;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    normalized_name: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface DailyBalance {
    date: string;
    dailyBudget: number;
    carryover: number;
    totalAvailable: number;
    spent: number;
    remaining: number;
}

export interface MonthlyStats {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    daysElapsed: number;
    daysRemaining: number;
    averageDailySpending: number;
}

export interface CategorySpending {
    category: string;
    amount: number;
    count: number;
    percentage: number;
}

export type Currency = 'USD' | 'KSH' | 'TRY';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    USD: '$',
    KSH: 'KSh',
    TRY: '₺',
};
