import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { SpendingEntry, Currency } from '@/types/index';
import { formatCurrency } from '@/lib/finance-utils';
import { Trash2, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { deleteSpendingEntry } from '@/db/api';
import { useToast } from '@/hooks/use-toast';

interface SpendingListProps {
    entries: SpendingEntry[];
    currency: Currency;
    onDelete?: () => void;
    showDate?: boolean;
    groupByDate?: boolean;
    title?: string;
}

export default function SpendingList({ entries, currency, onDelete, showDate = false, groupByDate = false, title = 'Spending Entries' }: SpendingListProps) {
    const { toast } = useToast();
    const today = new Date().toISOString().split('T')[0];

    // Track which dates are expanded (today is expanded by default)
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set([today]));

    const toggleDate = (date: string) => {
        setExpandedDates(prev => {
            const newSet = new Set(prev);
            if (newSet.has(date)) {
                newSet.delete(date);
            } else {
                newSet.add(date);
            }
            return newSet;
        });
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSpendingEntry(id);
            toast({
                title: 'Deleted',
                description: 'Spending entry removed.',
            });
            onDelete?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete entry.',
                variant: 'destructive',
            });
        }
    };

    // Group entries by date if groupByDate is true
    const groupedEntries = groupByDate
        ? entries.reduce((groups, entry) => {
            const date = entry.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(entry);
            return groups;
        }, {} as Record<string, SpendingEntry[]>)
        : { all: entries };

    // Sort dates in descending order (most recent first)
    const sortedDates = Object.keys(groupedEntries).sort((a, b) => {
        if (a === 'all') return 0;
        return new Date(b).getTime() - new Date(a).getTime();
    });

    if (entries.length === 0) {
        return (
            <Card className="card-shadow border-border">
                <CardContent className="p-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            {title}
                        </p>
                        <p className="text-sm text-muted-foreground py-8 text-center">
                            No spending entries yet.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const renderEntry = (entry: SpendingEntry) => {
        const isToday = entry.date === today;

        return (
            <div
                key={entry.id}
                className="flex items-start justify-between py-3 border-b border-border last:border-0"
            >
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{entry.description}</p>
                        {entry.category && (
                            <Badge variant="secondary" className="text-xs">
                                {entry.category}
                            </Badge>
                        )}
                    </div>
                    {showDate && !groupByDate && (
                        <p className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold number-display text-foreground">
                        {formatCurrency(Number(entry.amount), currency)}
                    </span>
                    {isToday && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this spending entry? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card className="card-shadow border-border">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {title}
                    </p>

                    {groupByDate ? (
                        <div className="space-y-4">
                            {sortedDates.map((date) => {
                                const dateEntries = groupedEntries[date];
                                const dateTotal = dateEntries.reduce((sum, e) => sum + Number(e.amount), 0);
                                const dateObj = new Date(date);
                                const isToday = date === today;
                                const isYesterday = date === new Date(Date.now() - 86400000).toISOString().split('T')[0];
                                const isExpanded = expandedDates.has(date);

                                let dateLabel = dateObj.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                });

                                if (isToday) dateLabel = `Today, ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
                                if (isYesterday) dateLabel = `Yesterday, ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

                                return (
                                    <div key={date} className="space-y-3">
                                        {/* Date Header - Clickable */}
                                        <button
                                            onClick={() => toggleDate(date)}
                                            className="w-full flex items-center justify-between pb-2 border-b-2 border-border hover:bg-accent/5 transition-colors rounded-t-lg px-2 -mx-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="font-semibold text-sm text-foreground">{dateLabel}</h3>
                                                <span className="text-xs text-muted-foreground">
                                                    ({dateEntries.length} {dateEntries.length === 1 ? 'entry' : 'entries'})
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold number-display text-foreground">
                                                {formatCurrency(dateTotal, currency)}
                                            </span>
                                        </button>

                                        {/* Entries for this date - Only show if expanded */}
                                        {isExpanded && (
                                            <div className="space-y-0 pl-6">
                                                {dateEntries.map(renderEntry)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {entries.map(renderEntry)}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
