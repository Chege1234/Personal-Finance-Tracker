import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CategorySpending, Currency } from '@/types/index';
import { formatCurrency } from '@/lib/finance-utils';

interface CategoryChartProps {
    categoryData: CategorySpending[];
    currency: Currency;
}

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export default function CategoryChart({ categoryData, currency }: CategoryChartProps) {
    if (categoryData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">No data available yet.</p>
                </CardContent>
            </Card>
        );
    }

    const chartData = categoryData.map((item) => ({
        name: item.category,
        value: Number(item.amount.toFixed(2)),
        percentage: item.percentage,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                            }}
                            formatter={(value: number) => formatCurrency(value, currency)}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-2">
                    {categoryData.map((item, index) => (
                        <div key={item.category} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span>{item.category}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-muted-foreground">{item.count} entries</span>
                                <span className="font-semibold">{formatCurrency(item.amount, currency)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
