import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/finance-utils';
import type { Currency } from '@/types/index';

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

interface SpendingByCategoryChartProps {
    data: CategoryData[];
    currency: Currency;
    totalSpent: number;
}

export function SpendingByCategoryChart({ data, currency, totalSpent }: SpendingByCategoryChartProps) {
    // Sort by value descending
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <Card className="card-shadow-lg border-border">
            <CardContent className="p-6 md:p-8">
                {/* Section Title */}
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                    By Category
                </h3>

                {/* Chart and Legend Container */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Donut Chart - Left Side */}
                    <div className="w-full md:w-1/2 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={sortedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={2}
                                    dataKey="value"
                                    strokeWidth={0}
                                    cornerRadius={4}
                                >
                                    {sortedData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend - Right Side */}
                    <div className="w-full md:w-1/2 space-y-3">
                        {sortedData.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-4 py-2"
                            >
                                {/* Color Dot + Category Name */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {entry.name}
                                    </span>
                                </div>

                                {/* Amount - Right Aligned */}
                                <span className="text-sm font-semibold text-foreground tabular-nums">
                                    {formatCurrency(entry.value, currency)}
                                </span>
                            </div>
                        ))}

                        {/* Total Row */}
                        <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
                            <span className="text-sm font-semibold text-foreground">
                                Total
                            </span>
                            <span className="text-sm font-bold text-foreground tabular-nums">
                                {formatCurrency(totalSpent, currency)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {sortedData.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">No spending data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
