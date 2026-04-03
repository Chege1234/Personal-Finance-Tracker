import { supabase } from './supabase';
import type { Budget, SpendingEntry } from '@/types/index';

// Budget operations
export const getBudgetForMonth = async (month: number, year: number): Promise<Budget | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const createBudget = async (
    month: number,
    year: number,
    monthlyAmount: number,
    currency: string,
    daysInMonth: number
): Promise<Budget> => {
    try {
        // Get current user with detailed error checking
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('Auth check:', { user: user?.id, authError });

        if (authError) {
            console.error('Auth error:', authError);
            throw new Error(`Authentication error: ${authError.message}`);
        }

        if (!user) {
            console.error('No user found in session');
            throw new Error('Not authenticated. Please log in again.');
        }

        const dailyBudget = monthlyAmount / daysInMonth;
        const startDate = formatDate(new Date());

        console.log('Creating budget with data:', {
            month,
            year,
            monthly_amount: monthlyAmount,
            currency,
            days_in_month: daysInMonth,
            daily_budget: dailyBudget,
            start_date: startDate,
            user_id: user.id,
        });

        const { data, error } = await supabase
            .from('budgets')
            .insert({
                month,
                year,
                monthly_amount: monthlyAmount,
                currency,
                days_in_month: daysInMonth,
                daily_budget: dailyBudget,
                start_date: startDate,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Budget creation error:', error);
            throw new Error(`Failed to create budget: ${error.message}`);
        }

        console.log('Budget created successfully:', data);
        return data;
    } catch (error) {
        console.error('createBudget exception:', error);
        throw error;
    }
};

export const updateBudget = async (
    budgetId: string,
    monthlyAmount: number,
    daysInMonth: number
): Promise<Budget> => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('Auth error:', authError);
            throw new Error(`Authentication error: ${authError.message}`);
        }

        if (!user) {
            console.error('No user found in session');
            throw new Error('Not authenticated. Please log in again.');
        }

        const dailyBudget = monthlyAmount / daysInMonth;

        console.log('Updating budget with data:', {
            budgetId,
            monthly_amount: monthlyAmount,
            daily_budget: dailyBudget,
        });

        const { data, error } = await supabase
            .from('budgets')
            .update({
                monthly_amount: monthlyAmount,
                daily_budget: dailyBudget,
            })
            .eq('id', budgetId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Budget update error:', error);
            throw new Error(`Failed to update budget: ${error.message}`);
        }

        console.log('Budget updated successfully:', data);
        return data;
    } catch (error) {
        console.error('updateBudget exception:', error);
        throw error;
    }
};

// Helper function to format date
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Spending operations
export const getSpendingEntriesForDate = async (date: string): Promise<SpendingEntry[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('spending_entries')
        .select('*')
        .eq('date', date)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
};

export const getSpendingEntriesForMonth = async (month: number, year: number): Promise<SpendingEntry[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    const { data, error } = await supabase
        .from('spending_entries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
};

export const getSpendingEntriesForDateRange = async (startDate: string, endDate: string): Promise<SpendingEntry[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('spending_entries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
};

export const createSpendingEntry = async (
    date: string,
    amount: number,
    description: string,
    category: string | null
): Promise<SpendingEntry> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('spending_entries')
        .insert({
            date,
            amount,
            description,
            category,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteSpendingEntry = async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('spending_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
};

export const updateSpendingEntry = async (
    id: string,
    updates: Partial<Pick<SpendingEntry, 'category' | 'description' | 'amount'>>
): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('spending_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
};

export const getAllSpendingEntries = async (): Promise<SpendingEntry[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('spending_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1000);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
};

// Category operations
export const getAllCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
};

export const createCategory = async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const normalizedName = name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');

    const { data, error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            name,
            normalized_name: normalizedName,
            color,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getCategoryByNormalizedName = async (normalizedName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('normalized_name', normalizedName)
        .maybeSingle();

    if (error) throw error;
    return data;
};
