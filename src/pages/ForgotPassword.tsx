import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/db/supabase';
import { Loader2, Wallet, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const resetSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ForgotPassword() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm<ResetFormData>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ResetFormData) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to send reset email',
                    variant: 'destructive',
                });
                return;
            }

            setEmailSent(true);
            toast({
                title: 'Email sent!',
                description: 'Check your inbox for password reset instructions.',
            });
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

    if (emailSent) {
        return (
            <div className="app-page flex items-center justify-center p-4">
                <Card className="surface-panel w-full max-w-md">
                    <CardHeader className="space-y-3 text-center">
                        <div className="flex justify-center">
                            <div className="rounded-xl border border-border bg-muted p-3">
                                <CheckCircle className="h-6 w-6 text-foreground" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-semibold tracking-tight">Check your email</CardTitle>
                        <CardDescription>
                            We've sent password reset instructions to your email address
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Click the link in the email to reset your password. The link will expire in 1 hour.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setEmailSent(false)}
                            >
                                Send Another Email
                            </Button>
                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-foreground underline underline-offset-4"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="app-page flex items-center justify-center p-4">
            <Card className="surface-panel w-full max-w-md">
                <CardHeader className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="rounded-xl border border-border bg-muted p-3">
                            <Wallet className="h-6 w-6 text-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">Reset password</CardTitle>
                    <CardDescription>
                        Enter your email to receive password reset instructions
                    </CardDescription>
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

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Remember your password?{' '}
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
    );
}
