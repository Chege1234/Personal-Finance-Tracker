import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SpendingEntry, Currency } from '@/types/index';
import { formatCurrency } from '@/lib/finance-utils';

interface MonthlyTrendChartProps {
    entries: SpendingEntry[];
    currency: Currency;
    dailyBudget: number;
}

export default function MonthlyTrendChart({ entries, currency, dailyBudget }: MonthlyTrendChartProps) {
    // Group entries by date
    const dailySpending = new Map<string, number>();

    for (const entry of entries) {
        const date = entry.date;
        dailySpending.set(date, (dailySpending.get(date) || 0) + Number(entry.amount));
    }

    // Convert to chart data
    const chartData = Array.from(dailySpending.entries())
        .map(([date, amount]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            spent: Number(amount.toFixed(2)),
            budget: Number(dailyBudget.toFixed(2)),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Last 14 days

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Daily Spending Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">No data available yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                            }}
                            formatter={(value: number) => formatCurrency(value, currency)}
                        />
                        <Legend />
                        <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="budget" fill="hsl(var(--muted))" name="Daily Budget" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
