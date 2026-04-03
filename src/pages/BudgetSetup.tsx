import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createBudget } from '@/db/api';
import { getCurrentMonth, getCurrentYear, getDaysInMonth } from '@/lib/finance-utils';
import type { Currency } from '@/types/index';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const budgetSchema = z.object({
    monthlyAmount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    currency: z.enum(['USD', 'KSH', 'TRY']),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function BudgetSetup() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);

    const form = useForm<BudgetFormData>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            monthlyAmount: '',
            currency: 'USD',
        },
    });

    const watchedAmount = form.watch('monthlyAmount');
    const dailyBudget = watchedAmount && !isNaN(Number(watchedAmount)) ? Number(watchedAmount) / daysInMonth : 0;

    const onSubmit = async (data: BudgetFormData) => {
        setIsSubmitting(true);
        try {
            await createBudget(
                currentMonth,
                currentYear,
                Number(data.monthlyAmount),
                data.currency,
                daysInMonth
            );

            toast({
                title: 'Budget created',
                description: `Monthly budget of ${data.monthlyAmount} ${data.currency} has been set.`,
            });

            navigate('/');
        } catch (error) {
            console.error('Budget creation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create budget. Please try again.';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-2xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Set Monthly Budget</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure your budget for {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <Card className="shadow-lg border-2 border-primary/20">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                        <CardTitle>Budget Configuration</CardTitle>
                        <CardDescription>
                            This month has {daysInMonth} days. Your budget will be divided equally across all days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                    <SelectItem value="KSH">KSH (KSh)</SelectItem>
                                                    <SelectItem value="TRY">Turkish Lira (₺)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="monthlyAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monthly Budget Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="text-lg font-semibold"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter your total budget for the month
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {dailyBudget > 0 && (
                                    <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20 shadow-sm">
                                        <p className="text-sm text-muted-foreground">Daily Budget</p>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            {dailyBudget.toFixed(2)} {form.watch('currency')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This is your base daily spending limit
                                        </p>
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Set Budget
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border-2 border-accent/20 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
                        <CardTitle className="text-lg">How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm pt-4">
                        <p className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Your monthly budget is divided equally across all days</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-secondary font-bold">•</span>
                            <span>Unused budget from any day rolls forward to the next day</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-accent font-bold">•</span>
                            <span>Overspending reduces your available budget for the next day</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-success font-bold">•</span>
                            <span>Budget resets at the start of each month</span>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
