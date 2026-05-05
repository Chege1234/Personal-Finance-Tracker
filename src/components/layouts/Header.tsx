import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router';
import { BarChart3, History, Home, LogOut, Shield, User } from 'lucide-react';
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

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur">
            <div className="app-content flex h-16 items-center justify-between gap-4 px-4">
                <Link to="/" className="flex items-center gap-3 shrink-0">
                    <img
                        src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9fxfm5xqp14w/conv-9fxfnx2x3q4g/20260211/file-9k0hknwuspvk.png"
                        alt="Personal Finance Tracker Logo"
                        className="h-9 w-auto object-contain"
                    />
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                        Finance Tracker
                    </span>
                </Link>

                {user && (
                    <div className="flex items-center gap-2">
                        <nav className="hidden items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1 md:flex">
                            <Link to="/">
                                <Button variant={isActive('/') ? 'default' : 'ghost'} size="sm" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Home
                                </Button>
                            </Link>
                            <Link to="/history">
                                <Button variant={isActive('/history') ? 'default' : 'ghost'} size="sm" className="gap-2">
                                    <History className="h-4 w-4" />
                                    History
                                </Button>
                            </Link>
                            <Link to="/analytics">
                                <Button variant={isActive('/analytics') ? 'default' : 'ghost'} size="sm" className="gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Analytics
                                </Button>
                            </Link>
                        </nav>

                        <ThemeToggle />
                        {profile?.role === 'admin' && (
                            <Link to="/admin">
                                <Button variant="outline" size="sm" className="gap-2 border-border/70">
                                    <Shield className="h-4 w-4" />
                                    <span className="hidden md:inline">Admin</span>
                                </Button>
                            </Link>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 border border-transparent hover:border-border/70">
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
