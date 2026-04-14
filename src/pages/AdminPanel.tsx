import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { logger } from '@/lib/logger';

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
        // Check if user is admin
        if (profile && profile.role !== 'admin') {
            logger.security('Non-admin user attempted to access Admin Panel', { 
                userId: profile.id, 
                role: profile.role 
            });
            navigate('/');
            return;
        }

        if (profile && profile.role === 'admin') {
            logger.info('Admin accessed Admin Panel', { userId: profile.id });
            fetchUsers();
        }
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
            logger.error('Error fetching users in Admin Panel', error);
        } finally {
            setLoading(false);
        }
    };

    if (!profile || profile.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        Admin Panel
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage users and view system information
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{users.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-secondary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Admins</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-secondary">
                                {users.filter(u => u.role === 'admin').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-accent/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-accent">
                                {users.filter(u => u.role === 'user').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                            View all registered users and their roles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full bg-muted" />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead>User ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">
                                                        {user.email || 'No email'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.role === 'admin' ? (
                                                            <Badge className="bg-gradient-to-r from-primary to-secondary">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                Admin
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                <UserIcon className="h-3 w-3 mr-1" />
                                                                User
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(user.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {user.id.slice(0, 8)}...
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
