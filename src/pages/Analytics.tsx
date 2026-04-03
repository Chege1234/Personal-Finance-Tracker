import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getSpendingEntriesForMonth, getBudgetForMonth, getAllCategories } from '@/db/api';
import { getCurrentMonth, getCurrentYear, formatCurrency, CATEGORY_ICONS } from '@/lib/finance-utils';
import type { SpendingEntry, Currency, Category } from '@/types/index';
import { SpendingByCategoryChart } from '@/components/charts/SpendingByCategoryChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Sparkles, Calendar, DollarSign, ArrowLeft, Home, History } from 'lucide-react';

interface CategoryData {
    name: string;
    value: number;
    percentage: number;
    icon: string;
    color: string;
}

interface DailySpending {
    date: string;
    amount: number;
}

export default function Analytics() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<SpendingEntry[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [selectedYear, setSelectedYear] = useState(getCurrentYear());
    const [currency, setCurrency] = useState<Currency>('USD');
    const [isLoading, setIsLoading] = useState(true);
    const [showFullReport, setShowFullReport] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [entriesData, budgetData, categoriesData] = await Promise.all([
                getSpendingEntriesForMonth(selectedMonth, selectedYear),
                getBudgetForMonth(selectedMonth, selectedYear),
                getAllCategories(),
            ]);

            setEntries(entriesData);
            setCategories(categoriesData);
            if (budgetData) {
                setCurrency(budgetData.currency as Currency);
            }
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate category spending with colors from database
    const categorySpending = entries.reduce((acc, entry) => {
        const category = entry.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += Number(entry.amount);
        return acc;
    }, {} as Record<string, number>);

    const totalSpent = entries.reduce((sum, e) => sum + Number(e.amount), 0);

    // Create category color map from database
    const categoryColorMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.color;
        return acc;
    }, {} as Record<string, string>);

    // Prepare chart data with persisted colors
    const chartData = Object.entries(categorySpending)
        .map(([name, value]) => ({
            name,
            value,
            color: categoryColorMap[name] || '#6B7280', // Fallback color
        }))
        .sort((a, b) => b.value - a.value);

    // Create sorted categories with percentages for insights
    const sortedCategories = chartData.map(item => ({
        name: item.name,
        value: item.value,
        percentage: (item.value / totalSpent) * 100,
        icon: CATEGORY_ICONS[item.name] || '📌',
        color: item.color,
    }));

    // Calculate daily spending for line chart
    const dailySpending = entries.reduce((acc, entry) => {
        const date = new Date(entry.date).getDate();
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += Number(entry.amount);
        return acc;
    }, {} as Record<number, number>);

    const lineChartData: DailySpending[] = Object.entries(dailySpending)
        .map(([date, amount]) => ({
            date: `Day ${date}`,
            amount,
        }))
        .sort((a, b) => parseInt(a.date.split(' ')[1]) - parseInt(b.date.split(' ')[1]));

    // Calculate insights
    const largestCategory = sortedCategories[0];
    const averageDailySpend = totalSpent / new Date(selectedYear, selectedMonth, 0).getDate();
    const transactionCount = entries.length;
    const averageTransactionSize = totalSpent / transactionCount;

    // Generate automatic lightweight insights
    const getAutomaticInsights = () => {
        const insights: string[] = [];

        if (largestCategory) {
            insights.push(`Your largest spending category is ${largestCategory.icon} ${largestCategory.name} at ${formatCurrency(largestCategory.value, currency)} (${largestCategory.percentage.toFixed(1)}% of total).`);
        }

        if (averageDailySpend > 0) {
            insights.push(`You're spending an average of ${formatCurrency(averageDailySpend, currency)} per day this month.`);
        }

        return insights;
    };

    // Generate full AI report
    const generateFullReport = () => {
        setShowFullReport(true);
    };

    const getFullReport = () => {
        const report = {
            summary: `You've spent ${formatCurrency(totalSpent, currency)} across ${transactionCount} transactions this month.`,
            patterns: [] as string[],
            risks: [] as string[],
            opportunities: [] as string[],
            recommendations: [] as string[],
        };

        // Behavioral patterns
        if (averageTransactionSize > averageDailySpend * 2) {
            report.patterns.push(`Your average transaction (${formatCurrency(averageTransactionSize, currency)}) is significantly higher than your daily average, suggesting fewer but larger purchases.`);
        }

        // Category-level risks
        if (largestCategory && largestCategory.percentage > 40) {
            report.risks.push(`${largestCategory.icon} ${largestCategory.name} accounts for ${largestCategory.percentage.toFixed(1)}% of your spending - consider if this aligns with your priorities.`);
        }

        // Opportunities
        const smallCategories = sortedCategories.filter(cat => cat.percentage < 5 && cat.percentage > 0);
        if (smallCategories.length > 3) {
            report.opportunities.push(`You have ${smallCategories.length} small spending categories. Consolidating or eliminating some could simplify your budget.`);
        }

        // Actionable recommendations
        if (largestCategory && largestCategory.name === 'Food & Dining' && largestCategory.percentage > 30) {
            report.recommendations.push(`Consider meal planning or cooking at home more often to reduce ${largestCategory.icon} Food & Dining expenses.`);
        }

        if (sortedCategories.some(cat => cat.name === 'Entertainment' && cat.percentage > 20)) {
            report.recommendations.push(`Review your 🎬 Entertainment subscriptions - you might be paying for services you rarely use.`);
        }

        return report;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
                    <Skeleton className="h-12 w-64 mb-8 bg-muted" />
                    <div className="grid gap-6 md:grid-cols-3 mb-8">
                        <Skeleton className="h-32 bg-muted" />
                        <Skeleton className="h-32 bg-muted" />
                        <Skeleton className="h-32 bg-muted" />
                    </div>
                    <Skeleton className="h-96 bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl space-y-8">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate('/')}
                            className="shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-primary">Analytics</h1>
                            <p className="text-sm text-muted-foreground mt-1">Understand your spending patterns</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="gap-2"
                        >
                            <Home className="h-4 w-4" />
                            <span className="hidden sm:inline">Home</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/history')}
                            className="gap-2"
                        >
                            <History className="h-4 w-4" />
                            <span className="hidden sm:inline">History</span>
                        </Button>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="flex justify-end">
                    <Select
                        value={`${selectedMonth}-${selectedYear}`}
                        onValueChange={(value) => {
                            const [month, year] = value.split('-').map(Number);
                            setSelectedMonth(month);
                            setSelectedYear(year);
                        }}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                                const month = getCurrentMonth() - i;
                                const year = getCurrentYear() + Math.floor((getCurrentMonth() - i - 1) / 12);
                                const adjustedMonth = ((month - 1 + 12) % 12) + 1;
                                return (
                                    <SelectItem key={`${adjustedMonth}-${year}`} value={`${adjustedMonth}-${year}`}>
                                        {new Date(year, adjustedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {entries.length === 0 ? (
                    <Card className="card-shadow border-border">
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No spending data yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Start recording your expenses to see insights and analytics.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Spending Overview Summary */}
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="card-shadow border-border">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <DollarSign className="h-5 w-5 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                            Total Spent
                                        </p>
                                    </div>
                                    <p className="text-3xl font-bold number-display text-foreground">
                                        {formatCurrency(totalSpent, currency)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {transactionCount} transactions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="card-shadow border-border">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-accent/10">
                                            <span className="text-xl">{largestCategory?.icon}</span>
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                            Top Category
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-foreground">
                                        {largestCategory?.name || 'N/A'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {largestCategory ? formatCurrency(largestCategory.value, currency) : '-'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="card-shadow border-border">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-success/10">
                                            <TrendingUp className="h-5 w-5 text-success" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                            Daily Average
                                        </p>
                                    </div>
                                    <p className="text-3xl font-bold number-display text-foreground">
                                        {formatCurrency(averageDailySpend, currency)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        per day this month
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Spending by Category Pie Chart */}
                        <Card className="card-shadow border-border">
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* Premium Donut Chart */}
                                    <SpendingByCategoryChart
                                        data={chartData}
                                        currency={currency}
                                        totalSpent={totalSpent}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Spending Over Time Line Chart */}
                        {lineChartData.length > 1 && (
                            <Card className="card-shadow border-border">
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-1">Spending Over Time</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Daily spending trend for this month
                                            </p>
                                        </div>

                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={lineChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                    <XAxis
                                                        dataKey="date"
                                                        stroke="hsl(var(--muted-foreground))"
                                                        style={{ fontSize: '12px' }}
                                                    />
                                                    <YAxis
                                                        stroke="hsl(var(--muted-foreground))"
                                                        style={{ fontSize: '12px' }}
                                                        tickFormatter={(value) => formatCurrency(value, currency)}
                                                    />
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                                                        <p className="font-semibold text-foreground">{payload[0].payload.date}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {formatCurrency(payload[0].value as number, currency)}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="amount"
                                                        stroke="hsl(var(--accent))"
                                                        strokeWidth={2}
                                                        dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* AI Insights Section */}
                        <Card className="card-shadow border-border">
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-accent" />
                                                Insights
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {showFullReport ? 'Detailed analysis of your spending' : 'Quick overview of your spending patterns'}
                                            </p>
                                        </div>

                                        {!showFullReport && (
                                            <Button
                                                onClick={generateFullReport}
                                                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                            >
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                Generate Full Report
                                            </Button>
                                        )}
                                    </div>

                                    {!showFullReport ? (
                                        <div className="space-y-3">
                                            {getAutomaticInsights().map((insight, index) => (
                                                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                                                    <div className="p-1.5 rounded-full bg-accent/10 mt-0.5">
                                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                                    </div>
                                                    <p className="text-sm text-foreground flex-1">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {(() => {
                                                const report = getFullReport();
                                                return (
                                                    <>
                                                        {/* Summary */}
                                                        <div>
                                                            <h4 className="font-semibold text-foreground mb-2">Summary</h4>
                                                            <p className="text-sm text-muted-foreground">{report.summary}</p>
                                                        </div>

                                                        {/* Patterns */}
                                                        {report.patterns.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold text-foreground mb-2">Spending Patterns</h4>
                                                                <ul className="space-y-2">
                                                                    {report.patterns.map((pattern, index) => (
                                                                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                            <span className="text-accent mt-0.5">•</span>
                                                                            <span>{pattern}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Risks */}
                                                        {report.risks.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                                                    <TrendingDown className="h-4 w-4 text-warning" />
                                                                    Areas to Watch
                                                                </h4>
                                                                <ul className="space-y-2">
                                                                    {report.risks.map((risk, index) => (
                                                                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                            <span className="text-warning mt-0.5">•</span>
                                                                            <span>{risk}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Opportunities */}
                                                        {report.opportunities.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                                                    <TrendingUp className="h-4 w-4 text-success" />
                                                                    Opportunities
                                                                </h4>
                                                                <ul className="space-y-2">
                                                                    {report.opportunities.map((opportunity, index) => (
                                                                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                            <span className="text-success mt-0.5">•</span>
                                                                            <span>{opportunity}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Recommendations */}
                                                        {report.recommendations.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold text-foreground mb-2">Recommendations</h4>
                                                                <ul className="space-y-2">
                                                                    {report.recommendations.map((recommendation, index) => (
                                                                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                            <span className="text-accent mt-0.5">→</span>
                                                                            <span>{recommendation}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowFullReport(false)}
                                                            className="w-full"
                                                        >
                                                            Show Less
                                                        </Button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction History */}
                        <Card className="card-shadow border-border">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            All Transactions
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {entries.length} transaction{entries.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    <div className="space-y-0 max-h-96 overflow-y-auto">
                                        {entries.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between py-3 border-b border-border last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {CATEGORY_ICONS[entry.category || 'Other']}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-foreground">{entry.description}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })} • {entry.category || 'Other'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-lg font-semibold number-display text-foreground">
                                                    {formatCurrency(Number(entry.amount), currency)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
