import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSpendingEntry } from '@/db/api';
import { formatDate } from '@/lib/finance-utils';
import { smartCategorize } from '@/lib/smart-categorization';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const spendingSchema = z.object({
    amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
});

type SpendingFormData = z.infer<typeof spendingSchema>;

interface SpendingFormProps {
    date?: string;
    onSuccess?: () => void;
}

export default function SpendingForm({ date, onSuccess }: SpendingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<SpendingFormData>({
        resolver: zodResolver(spendingSchema),
        defaultValues: {
            amount: '',
            description: '',
        },
    });

    const onSubmit = async (data: SpendingFormData) => {
        setIsSubmitting(true);
        try {
            const amount = Number(data.amount);
            const category = await smartCategorize(data.description);
            const entryDate = date || formatDate(new Date());

            await createSpendingEntry(entryDate, amount, data.description, category);

            toast({
                title: 'Spending recorded',
                description: `${data.description} - ${amount.toFixed(2)}`,
            });

            form.reset();
            onSuccess?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to record spending. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="card-shadow border-border">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Record Spending
                    </p>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-foreground">Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                className="text-lg font-semibold number-display h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-foreground">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="What did you spend on?"
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Recording...
                                    </>
                                ) : (
                                    'Record Spending'
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
}
