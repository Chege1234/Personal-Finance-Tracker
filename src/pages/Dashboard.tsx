import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import BudgetCard from '@/components/finance/BudgetCard';
import DailyBalanceCard from '@/components/finance/DailyBalanceCard';
import SpendingForm from '@/components/finance/SpendingForm';
import SpendingList from '@/components/finance/SpendingList';
import { getBudgetForMonth, getSpendingEntriesForMonth, getSpendingEntriesForDate, updateBudget } from '@/db/api';
import { getCurrentMonth, getCurrentYear, formatDate, getDaysInMonth, formatCurrency } from '@/lib/finance-utils';
import { useToast } from '@/hooks/use-toast';
import type { Budget, SpendingEntry, DailyBalance, Currency } from '@/types/index';
import { Plus, Settings } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [budget, setBudget] = useState<Budget | null>(null);
    const [monthlyEntries, setMonthlyEntries] = useState<SpendingEntry[]>([]);
    const [todayEntries, setTodayEntries] = useState<SpendingEntry[]>([]);
    const [dailyBalance, setDailyBalance] = useState<DailyBalance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [newBudgetAmount, setNewBudgetAmount] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    const today = formatDate(new Date());

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [budgetData, monthEntries, todayData] = await Promise.all([
                getBudgetForMonth(currentMonth, currentYear),
                getSpendingEntriesForMonth(currentMonth, currentYear),
                getSpendingEntriesForDate(today)
            ]);

            if (!budgetData) {
                navigate('/budget-setup');
                return;
            }

            setBudget(budgetData);
            setMonthlyEntries(monthEntries);
            setTodayEntries(todayData);

            // Calculate daily balance
            calculateDailyBalance(budgetData, monthEntries, todayData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateDailyBalance = (
        budgetData: Budget,
        monthEntries: SpendingEntry[],
        todayData: SpendingEntry[]
    ) => {
        const currentDay = new Date().getDate();
        const dailyBudget = budgetData.daily_budget;
        const budgetStartDate = new Date(budgetData.start_date);
        const budgetStartDay = budgetStartDate.getDate();

        // Calculate carryover only from budget start date, not from day 1
        let carryover = 0;

        // Only calculate carryover if budget was created before today
        if (budgetStartDay < currentDay) {
            for (let day = budgetStartDay; day < currentDay; day++) {
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEntries = monthEntries.filter((e) => e.date === dateStr);
                const daySpent = dayEntries.reduce((sum, e) => sum + Number(e.amount), 0);
                carryover += dailyBudget - daySpent;
            }
        }

        const todaySpent = todayData.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalAvailable = dailyBudget + carryover;
        const remaining = totalAvailable - todaySpent;

        setDailyBalance({
            date: today,
            dailyBudget,
            carryover,
            totalAvailable,
            spent: todaySpent,
            remaining,
        });
    };

    const handleEditBudget = () => {
        if (budget) {
            setNewBudgetAmount(budget.monthly_amount.toString());
            setIsEditDialogOpen(true);
        }
    };

    const handleUpdateBudget = async () => {
        if (!budget) return;

        const amount = Number(newBudgetAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid budget amount.',
                variant: 'destructive',
            });
            return;
        }

        setIsUpdating(true);
        try {
            await updateBudget(budget.id, amount, budget.days_in_month);

            toast({
                title: 'Budget Updated',
                description: `Your monthly budget has been updated to ${formatCurrency(amount, budget.currency as Currency)}.`,
            });

            setIsEditDialogOpen(false);
            await loadData();
        } catch (error) {
            console.error('Error updating budget:', error);
            toast({
                title: 'Error',
                description: 'Failed to update budget. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-64 bg-muted" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 bg-muted" />
                    <Skeleton className="h-64 bg-muted" />
                </div>
                <Skeleton className="h-96 bg-muted" />
            </div>
        );
    }

    if (!budget || !dailyBalance) {
        return null;
    }

    const totalSpent = monthlyEntries.reduce((sum, e) => sum + Number(e.amount), 0);
    const remaining = budget.monthly_amount - totalSpent;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-primary">
                            {new Date().toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </h1>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleEditBudget}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Edit Budget</span>
                            </Button>
                            <Button
                                onClick={() => navigate('/analytics')}
                                variant="outline"
                                className="text-sm font-medium"
                            >
                                Analytics
                            </Button>
                            <Button
                                onClick={() => navigate('/history')}
                                variant="outline"
                                className="text-sm font-medium"
                            >
                                History
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                {/* 1. Today's Allowance - Most Prominent */}
                <div className="mb-8">
                    <DailyBalanceCard balance={dailyBalance} currency={budget.currency as Currency} />
                </div>

                {/* 2. Record Spending Form */}
                <div className="mb-8">
                    <SpendingForm onSuccess={loadData} />
                </div>

                {/* 3. Today's Spending List */}
                <div className="mb-8">
                    <SpendingList
                        entries={todayEntries}
                        currency={budget.currency as Currency}
                        onDelete={loadData}
                        title="Today's Spending"
                    />
                </div>

                {/* 4. Remaining Budget */}
                <div className="mb-8">
                    <Card className="card-shadow-lg border-border">
                        <CardContent className="p-6 md:p-8">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    Remaining Budget
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl md:text-5xl font-bold number-display ${remaining >= 0 ? 'text-success' : 'text-destructive'
                                        }`}>
                                        {formatCurrency(Math.abs(remaining), budget.currency as Currency)}
                                    </span>
                                    {remaining < 0 && (
                                        <span className="text-lg text-destructive font-medium">over</span>
                                    )}
                                </div>
                                <div className="pt-4">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>Budget Progress</span>
                                        <span>{Math.min(Math.round((totalSpent / budget.monthly_amount) * 100), 100)}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${totalSpent <= budget.monthly_amount ? 'bg-success' : 'bg-destructive'
                                                }`}
                                            style={{ width: `${Math.min((totalSpent / budget.monthly_amount) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 5. Monthly Overview */}
                <div className="mb-8">
                    <BudgetCard budget={budget} totalSpent={totalSpent} remaining={remaining} />
                </div>

                {/* 6. Spending History */}
                <div>
                    <SpendingList
                        entries={monthlyEntries}
                        currency={budget.currency as Currency}
                        onDelete={loadData}
                        showDate={true}
                        groupByDate={true}
                        title="Spending History"
                    />
                </div>
            </div>

            {/* Edit Budget Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Monthly Budget</DialogTitle>
                        <DialogDescription>
                            Update your budget for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                            The daily budget will be recalculated automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget-amount">Monthly Budget Amount</Label>
                            <Input
                                id="budget-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newBudgetAmount}
                                onChange={(e) => setNewBudgetAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="text-lg"
                            />
                            <p className="text-sm text-muted-foreground">
                                Current: {formatCurrency(budget.monthly_amount, budget.currency as Currency)}
                            </p>
                            {newBudgetAmount && Number(newBudgetAmount) > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    New daily budget: {formatCurrency(Number(newBudgetAmount) / budget.days_in_month, budget.currency as Currency)}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateBudget}
                            disabled={isUpdating || !newBudgetAmount || Number(newBudgetAmount) <= 0}
                        >
                            {isUpdating ? 'Updating...' : 'Update Budget'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
