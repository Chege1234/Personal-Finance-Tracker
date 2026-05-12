import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

interface UserProfile {
    id: string;
    email: string | null;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

export default function AdminPanel() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile && profile.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [profile, navigate]);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!profile || profile.role !== 'admin') return null;

    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    const statsCards = [
        {
            label: 'Total Users',
            value: users.length,
            icon: Users,
            color: 'text-primary',
            bg: 'bg-primary/8',
        },
        {
            label: 'Admins',
            value: adminCount,
            icon: Shield,
            color: 'text-warning',
            bg: 'bg-warning/8',
        },
        {
            label: 'Regular Users',
            value: userCount,
            icon: UserIcon,
            color: 'text-accent',
            bg: 'bg-accent/8',
        },
    ];

    return (
        <div className="app-page animate-in pb-nav-safe md:pb-0">
            <div className="app-content py-6 md:py-8 space-y-6">
                {/* Page Header */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Admin Panel
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">
                        Manage users and view system information
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {statsCards.map(({ label, value, icon: Icon, color, bg }) => (
                        <Card key={label} className="surface-panel card-shadow">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium">{label}</p>
                                        <p className={`text-2xl md:text-3xl font-bold number-display mt-0.5 ${color}`}>
                                            {loading ? '—' : value}
                                        </p>
                                    </div>
                                    <div className={`hidden md:flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Users List */}
                <Card className="surface-panel card-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">All Users</CardTitle>
                        <CardDescription className="text-xs">
                            View all registered users and their roles
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-xl bg-muted" />
                                ))}
                            </div>
                        ) : users.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No users found
                            </p>
                        ) : (
                            <>
                                {/* ── Mobile card list (hidden on md+) ─── */}
                                <div className="space-y-2 md:hidden">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-start justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 gap-3"
                                        >
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {user.email || 'No email'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Joined{' '}
                                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                                <p className="font-mono text-[10px] text-muted-foreground/70">
                                                    {user.id.slice(0, 10)}…
                                                </p>
                                            </div>
                                            <div className="shrink-0 pt-0.5">
                                                {user.role === 'admin' ? (
                                                    <Badge className="gap-1 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-medium">
                                                        <Shield className="h-3 w-3" />
                                                        Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="gap-1 text-xs font-medium">
                                                        <UserIcon className="h-3 w-3" />
                                                        User
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Desktop table (hidden below md) ─── */}
                                <div className="hidden md:block rounded-xl border border-border/60 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/60 bg-muted/40">
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Joined</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-4 py-3.5 font-medium text-foreground">
                                                        {user.email || 'No email'}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        {user.role === 'admin' ? (
                                                            <Badge className="gap-1 bg-primary/12 text-primary border border-primary/20 hover:bg-primary/18 text-xs">
                                                                <Shield className="h-3 w-3" />
                                                                Admin
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="gap-1 text-xs">
                                                                <UserIcon className="h-3 w-3" />
                                                                User
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-muted-foreground">
                                                        {new Date(user.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                                                        {user.id.slice(0, 8)}…
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
