import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router';
import { LogOut, User, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show header on login/signup pages
    if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password' || location.pathname === '/reset-password') {
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-3">
                    <img
                        src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9fxfm5xqp14w/conv-9fxfnx2x3q4g/20260211/file-9k0hknwuspvk.png"
                        alt="Personal Finance Tracker Logo"
                        className="h-12 w-auto object-contain"
                    />
                    <span className="text-xl font-bold text-foreground">
                        Finance Tracker
                    </span>
                </Link>

                {user && (
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {profile?.role === 'admin' && (
                            <Link to="/admin">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Shield className="h-4 w-4" />
                                    <span className="hidden md:inline">Admin</span>
                                </Button>
                            </Link>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="hidden md:inline">{profile?.email || 'User'}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem disabled>
                                    <span className="text-sm text-muted-foreground">{profile?.email}</span>
                                </DropdownMenuItem>
                                {profile?.role === 'admin' && (
                                    <DropdownMenuItem disabled>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span className="text-sm font-semibold">Admin</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </header>
    );
}
