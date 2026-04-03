import { Card, CardContent } from '@/components/ui/card';
import type { DailyBalance, Currency } from '@/types/index';
import { formatCurrency } from '@/lib/finance-utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DailyBalanceCardProps {
    balance: DailyBalance;
    currency: Currency;
}

export default function DailyBalanceCard({ balance, currency }: DailyBalanceCardProps) {
    const hasCarryover = balance.carryover !== 0;
    const isPositiveCarryover = balance.carryover > 0;
    const availableToday = balance.totalAvailable - balance.spent;
    const isOverspent = availableToday < 0;
    const overspentAmount = isOverspent ? Math.abs(availableToday) : 0;

    return (
        <Card className="card-shadow-lg border-border">
            <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Today's Allowance
                    </p>

                    {/* Available Today - Most Prominent */}
                    {!isOverspent ? (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Available Now</p>
                            <p className="text-4xl md:text-5xl font-bold number-display text-accent">
                                {formatCurrency(availableToday, currency)}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Available Now</p>
                                <p className="text-4xl md:text-5xl font-bold number-display text-muted-foreground">
                                    {formatCurrency(0, currency)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-destructive font-medium">Overspent</p>
                                <p className="text-3xl md:text-4xl font-bold number-display text-destructive">
                                    {formatCurrency(overspentAmount, currency)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-border space-y-3">
                        {/* Daily Budget */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Daily Budget</span>
                            <span className="text-base font-semibold number-display text-foreground">
                                {formatCurrency(balance.dailyBudget, currency)}
                            </span>
                        </div>

                        {/* Carryover */}
                        {hasCarryover && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isPositiveCarryover ? (
                                        <TrendingUp className="h-4 w-4 text-success" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-destructive" />
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        {isPositiveCarryover ? 'Saved' : 'Overspent'}
                                    </span>
                                </div>
                                <span className={`text-base font-semibold number-display ${isPositiveCarryover ? 'text-success' : 'text-destructive'
                                    }`}>
                                    {isPositiveCarryover ? '+' : ''}{formatCurrency(balance.carryover, currency)}
                                </span>
                            </div>
                        )}

                        {/* Spent Today */}
                        {balance.spent > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Spent Today</span>
                                <span className={`text-base font-semibold number-display ${isOverspent ? 'text-destructive' : 'text-foreground'
                                    }`}>
                                    {formatCurrency(balance.spent, currency)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
