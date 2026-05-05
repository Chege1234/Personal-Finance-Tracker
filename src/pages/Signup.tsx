import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
    const navigate = useNavigate();
    const { signUpWithEmail } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        try {
            const { error } = await signUpWithEmail(data.email, data.password);

            if (error) {
                console.error('Signup error:', error);
                toast({
                    title: 'Signup failed',
                    description: error.message || 'Failed to create account',
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Account created!',
                description: 'Welcome to Personal Finance Tracker',
            });

            // Wait a moment for the profile to be created
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Auto-login after signup and redirect to budget setup
            navigate('/budget-setup', { replace: true });
        } catch (error) {
            console.error('Signup exception:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-page px-4 py-10">
            <div className="mx-auto grid w-full max-w-[1380px] gap-8 lg:grid-cols-[1.2fr_0.9fr]">
                <div className="hidden rounded-2xl border border-border/70 bg-card/70 p-10 lg:flex lg:flex-col lg:justify-between">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Personal Finance Tracker</p>
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Start with a clear monthly plan.</h1>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Set your budget once, then track each transaction in seconds from phone or desktop.
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">Designed to keep budgeting practical and stress-free.</p>
                </div>

                <Card className="surface-panel w-full">
                    <CardHeader className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="rounded-xl border border-border bg-muted p-3">
                            <Wallet className="h-6 w-6 text-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">Create your account</CardTitle>
                    <CardDescription>Set up your workspace and start tracking today</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="your.email@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-foreground underline underline-offset-4"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
    );
}
