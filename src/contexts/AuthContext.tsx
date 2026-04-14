import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface Profile {
    id: string;
    email: string | null;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            logger.error('Failed to get user profile', error);
            return null;
        }
        return data;
    } catch (err) {
        logger.error('Unexpected error fetching profile', err);
        return null;
    }
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
    const [user, setUser] = React.useState<User | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [loading, setLoading] = React.useState(true);

    const refreshProfile = async () => {
        if (!user) {
            setProfile(null);
            return;
        }

        const profileData = await getProfile(user.id);
        setProfile(profileData);
    };

    React.useEffect(() => {
        let isMounted = true;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!isMounted) return;
            
            setUser(session?.user ?? null);
            if (session?.user) {
                logger.info('User session restored', { userId: session.user.id });
                getProfile(session.user.id).then(profile => {
                    if (isMounted) setProfile(profile);
                });
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            logger.info(`Auth event: ${event}`, { userId: session?.user?.id });
            
            setUser(session?.user ?? null);
            
            if (session?.user) {
                const profileData = await getProfile(session.user.id);
                if (isMounted) setProfile(profileData);
            } else {
                if (isMounted) setProfile(null);
                if (event === 'SIGNED_OUT') {
                    logger.info('User signed out successfully');
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                logger.security('Failed login attempt', { email, error: error.message });
                throw error;
            }
            
            logger.info('User signed in with email', { email });
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

            if (error) {
                logger.security('Failed signup attempt', { email, error: error.message });
                throw error;
            }
            
            logger.info('New user signed up', { email });
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            logger.error('Error during sign out', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithEmail, signInWithGoogle, signUpWithEmail, signOut, refreshProfile }}>
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
