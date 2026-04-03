import { Card, CardContent } from '@/components/ui/card';
import type { Budget, Currency } from '@/types/index';
import { formatCurrency } from '@/lib/finance-utils';

interface BudgetCardProps {
    budget: Budget;
    totalSpent: number;
    remaining: number;
}

export default function BudgetCard({ budget, totalSpent, remaining }: BudgetCardProps) {
    const isOverBudget = remaining < 0;

    return (
        <Card className="card-shadow border-border">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Monthly Overview
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Total Budget */}
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Budget</p>
                            <p className="text-lg font-semibold number-display text-foreground">
                                {formatCurrency(budget.monthly_amount, budget.currency as Currency)}
                            </p>
                        </div>

                        {/* Total Spent */}
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Spent</p>
                            <p className="text-lg font-semibold number-display text-foreground">
                                {formatCurrency(totalSpent, budget.currency as Currency)}
                            </p>
                        </div>

                        {/* Remaining */}
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Left</p>
                            <p className={`text-lg font-semibold number-display ${isOverBudget ? 'text-destructive' : 'text-success'
                                }`}>
                                {formatCurrency(Math.abs(remaining), budget.currency as Currency)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
