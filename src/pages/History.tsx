import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getSpendingEntriesForMonth, getBudgetForMonth, updateSpendingEntry } from '@/db/api';
import { getCurrentMonth, getCurrentYear, formatCurrency, CATEGORY_ICONS, getAllCategories } from '@/lib/finance-utils';
import type { SpendingEntry, Currency } from '@/types/index';
import { ArrowLeft, Edit2, Calendar, ChevronDown, ChevronRight, Home, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function History() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [entries, setEntries] = useState<SpendingEntry[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [selectedYear, setSelectedYear] = useState(getCurrentYear());
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [isLoading, setIsLoading] = useState(true);
    const [editingEntry, setEditingEntry] = useState<SpendingEntry | null>(null);
    const [newCategory, setNewCategory] = useState<string>('');
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

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

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [entriesData, budgetData] = await Promise.all([
                getSpendingEntriesForMonth(selectedMonth, selectedYear),
                getBudgetForMonth(selectedMonth, selectedYear),
            ]);

            setEntries(entriesData);
            if (budgetData) {
                setCurrency(budgetData.currency as Currency);
            }
        } catch (error) {
            console.error('Error loading history data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditCategory = (entry: SpendingEntry) => {
        setEditingEntry(entry);
        setNewCategory(entry.category || 'Other');
    };

    const handleSaveCategory = async () => {
        if (!editingEntry) return;

        try {
            await updateSpendingEntry(editingEntry.id, {
                category: newCategory,
            });

            toast({
                title: 'Updated',
                description: 'Category updated successfully.',
            });

            setEditingEntry(null);
            loadData();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update category.',
                variant: 'destructive',
            });
        }
    };

    // Filter entries
    const filteredEntries = selectedCategory === 'all'
        ? entries
        : entries.filter(e => (e.category || 'Uncategorized') === selectedCategory);

    // Group by date
    const groupedEntries = filteredEntries.reduce((acc, entry) => {
        const date = entry.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(entry);
        return acc;
    }, {} as Record<string, SpendingEntry[]>);

    const sortedDates = Object.keys(groupedEntries).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    // Get unique categories from entries (sorted by usage)
    const categoryCounts = entries.reduce((acc, e) => {
        const cat = e.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const categoriesInUse = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([cat]) => cat);

    const allCategories = getAllCategories();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
                    <Skeleton className="h-12 w-64 mb-8 bg-muted" />
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
                            <h1 className="text-2xl md:text-3xl font-bold text-primary">Transaction History</h1>
                            <p className="text-sm text-muted-foreground mt-1">View and manage your spending</p>
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
                            onClick={() => navigate('/analytics')}
                            className="gap-2"
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="card-shadow border-border">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Month Selector */}
                            <div className="flex-1">
                                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Month
                                </Label>
                                <Select
                                    value={`${selectedMonth}-${selectedYear}`}
                                    onValueChange={(value) => {
                                        const [month, year] = value.split('-').map(Number);
                                        setSelectedMonth(month);
                                        setSelectedYear(year);
                                    }}
                                >
                                    <SelectTrigger>
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

                            {/* Category Filter */}
                            <div className="flex-1">
                                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Category
                                </Label>
                                <Select
                                    value={selectedCategory}
                                    onValueChange={setSelectedCategory}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categoriesInUse.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {CATEGORY_ICONS[category] || '📌'} {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions */}
                {filteredEntries.length === 0 ? (
                    <Card className="card-shadow border-border">
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
                            <p className="text-sm text-muted-foreground">
                                {selectedCategory !== 'all'
                                    ? 'Try selecting a different category or month.'
                                    : 'Start recording your expenses to see them here.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="card-shadow border-border">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {filteredEntries.length} Transaction{filteredEntries.length !== 1 ? 's' : ''}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Total: {formatCurrency(filteredEntries.reduce((sum, e) => sum + Number(e.amount), 0), currency)}
                                    </p>
                                </div>

                                {sortedDates.map((date) => {
                                    const dateEntries = groupedEntries[date];
                                    const dateTotal = dateEntries.reduce((sum, e) => sum + Number(e.amount), 0);
                                    const dateObj = new Date(date);
                                    const isToday = date === new Date().toISOString().split('T')[0];
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
                                                    <h4 className="font-semibold text-sm text-foreground">{dateLabel}</h4>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({dateEntries.length} {dateEntries.length === 1 ? 'entry' : 'entries'})
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold number-display text-foreground">
                                                    {formatCurrency(dateTotal, currency)}
                                                </span>
                                            </button>

                                            {/* Entries - Only show if expanded */}
                                            {isExpanded && (
                                                <div className="space-y-0 pl-6">
                                                    {dateEntries.map((entry) => (
                                                        <div
                                                            key={entry.id}
                                                            className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <span className="text-2xl">
                                                                    {CATEGORY_ICONS[entry.category || 'Uncategorized'] || '📌'}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-foreground">{entry.description}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="text-xs cursor-pointer hover:bg-secondary/80"
                                                                            onClick={() => handleEditCategory(entry)}
                                                                        >
                                                                            {entry.category || 'Uncategorized'}
                                                                        </Badge>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {new Date(entry.created_at).toLocaleTimeString('en-US', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <span className="text-lg font-semibold number-display text-foreground">
                                                                    {formatCurrency(Number(entry.amount), currency)}
                                                                </span>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleEditCategory(entry)}
                                                                >
                                                                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Edit Category Dialog */}
            <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Change the category for this transaction
                        </DialogDescription>
                    </DialogHeader>

                    {editingEntry && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-foreground mb-1">{editingEntry.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatCurrency(Number(editingEntry.amount), currency)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={newCategory} onValueChange={setNewCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCategories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {CATEGORY_ICONS[category]} {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingEntry(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveCategory} className="bg-accent hover:bg-accent/90">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
