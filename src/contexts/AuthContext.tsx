import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface Profile {
    id: string;
    email: string | null;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Failed to get user profile:', error);
        return null;
    }
    return data;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const queryClient = useQueryClient();

    // Use query for profile - this provides caching and deduplication
    const { data: profile, isLoading: profileLoading, refetch } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: () => (user ? getProfile(user.id) : Promise.resolve(null)),
        enabled: !!user,
        staleTime: 1000 * 60 * 15, // Cache profile for 15 minutes
    });

    const refreshProfile = async () => {
        await refetch();
    };

    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) {
                queryClient.setQueryData(['profile', undefined], null);
            }
        });

        return () => subscription.unsubscribe();
    }, [queryClient]);

    const loading = authLoading || (!!user && profileLoading);

    const signInWithEmail = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}`,
                },
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        queryClient.setQueryData(['profile', user?.id], null);
    };

    return (
        <AuthContext.Provider value={{ user, profile: profile || null, loading, signInWithEmail, signInWithGoogle, signUpWithEmail, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
