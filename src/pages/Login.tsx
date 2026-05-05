import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
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

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signInWithEmail, signInWithGoogle } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const from = (location.state as { from?: string })?.from || '/';

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const { error } = await signInWithEmail(data.email, data.password);

            if (error) {
                toast({
                    title: 'Login failed',
                    description: error.message || 'Invalid email or password',
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Welcome back!',
                description: 'You have successfully logged in.',
            });

            navigate(from, { replace: true });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                toast({
                    title: 'Google Login failed',
                    description: error.message || 'Could not authenticate with Google',
                    variant: 'destructive',
                });
            }
            // Supabase OAuth redirects to Google, so we don't handle navigation here
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="app-page px-4 py-10">
            <div className="mx-auto grid w-full max-w-[1380px] gap-8 lg:grid-cols-[1.2fr_0.9fr]">
                <div className="hidden rounded-2xl border border-border/70 bg-card/70 p-10 lg:flex lg:flex-col lg:justify-between">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Personal Finance Tracker</p>
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground">See exactly where your money goes.</h1>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Track daily spending, understand patterns, and stay within your monthly target using one simple dashboard.
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">Built for fast daily check-ins, not spreadsheet-heavy workflows.</p>
                </div>

                <Card className="surface-panel w-full">
                    <CardHeader className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="rounded-xl border border-border bg-muted p-3">
                            <Wallet className="h-6 w-6 text-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
                    <CardDescription>Sign in to continue to your dashboard</CardDescription>
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
                                                autoComplete="email"
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

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </Form>
                    
                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        className="mt-6 w-full border-border/70"
                        disabled={isLoading}
                        onClick={handleGoogleSignIn}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                        )}
                        Google
                    </Button>

                    <div className="mt-4 text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-primary hover:text-secondary transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-medium text-foreground underline underline-offset-4"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
    );
}
