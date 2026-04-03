import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import SpendingList from '@/components/finance/SpendingList';
import MonthlyTrendChart from '@/components/finance/MonthlyTrendChart';
import CategoryChart from '@/components/finance/CategoryChart';
import { getBudgetForMonth, getSpendingEntriesForMonth, getAllSpendingEntries } from '@/db/api';
import { getCurrentMonth, getCurrentYear, calculateCategorySpending, generateSpendingInsights } from '@/lib/finance-utils';
import type { Budget, SpendingEntry, Currency } from '@/types/index';
import { ArrowLeft, Lightbulb } from 'lucide-react';

export default function History() {
    const navigate = useNavigate();
    const [budget, setBudget] = useState<Budget | null>(null);
    const [monthlyEntries, setMonthlyEntries] = useState<SpendingEntry[]>([]);
    const [allEntries, setAllEntries] = useState<SpendingEntry[]>([]);
    const [insights, setInsights] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const budgetData = await getBudgetForMonth(currentMonth, currentYear);

            if (!budgetData) {
                navigate('/budget-setup');
                return;
            }

            setBudget(budgetData);

            const monthEntries = await getSpendingEntriesForMonth(currentMonth, currentYear);
            setMonthlyEntries(monthEntries);

            const allData = await getAllSpendingEntries();
            setAllEntries(allData);

            // Generate insights
            const generatedInsights = generateSpendingInsights(monthEntries);
            setInsights(generatedInsights);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-64 bg-muted" />
                <Skeleton className="h-96 bg-muted" />
            </div>
        );
    }

    if (!budget) {
        return null;
    }

    const categoryData = calculateCategorySpending(monthlyEntries);
    const totalSpent = monthlyEntries.reduce((sum, e) => sum + Number(e.amount), 0);

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-primary/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">History & Analytics</h1>
                    <p className="text-muted-foreground">View your spending patterns</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-lg border-2 border-primary/20">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                        <CardTitle className="text-sm text-muted-foreground">Total Spent This Month</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-3xl font-bold text-primary">{totalSpent.toFixed(2)} {budget.currency}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2 border-secondary/20">
                    <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
                        <CardTitle className="text-sm text-muted-foreground">Total Entries</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-3xl font-bold text-secondary">{monthlyEntries.length}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2 border-accent/20">
                    <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
                        <CardTitle className="text-sm text-muted-foreground">Average Per Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-3xl font-bold text-accent">
                            {monthlyEntries.length > 0 ? (totalSpent / monthlyEntries.length).toFixed(2) : '0.00'} {budget.currency}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {insights.length > 0 && (
                <Card className="border-2 border-primary/20 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-warning" />
                            AI Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ul className="space-y-2">
                            {insights.map((insight, index) => (
                                <li key={index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
                                    <span className="text-primary mt-1 font-bold">•</span>
                                    <span>{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="charts" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                    <TabsTrigger value="charts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">Charts</TabsTrigger>
                    <TabsTrigger value="entries" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-white">All Entries</TabsTrigger>
                </TabsList>

                <TabsContent value="charts" className="space-y-6">
                    <MonthlyTrendChart
                        entries={monthlyEntries}
                        currency={budget.currency as Currency}
                        dailyBudget={budget.daily_budget}
                    />
                    <CategoryChart categoryData={categoryData} currency={budget.currency as Currency} />
                </TabsContent>

                <TabsContent value="entries">
                    <SpendingList
                        entries={allEntries}
                        currency={budget.currency as Currency}
                        onDelete={loadData}
                        showDate={true}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
