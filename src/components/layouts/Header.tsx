import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router';
import { BarChart3, FileText, History, Home, LogOut, Shield, ShieldAlert, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

export default function Header() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (AUTH_PATHS.includes(location.pathname)) return null;

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        ...(profile?.role === 'admin' ? [{ path: '/admin', icon: Shield, label: 'Admin' }] : []),
    ];

    const legalItems = [
        { path: '/terms', icon: FileText, label: 'Terms & Conditions' },
        { path: '/privacy', icon: ShieldAlert, label: 'Privacy Policy' },
        { path: '/legal', icon: Shield, label: 'Legal Info' },
    ];

    return (
        <>
            {/* ── Top Header ─────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
                <div className="app-content flex h-14 items-center justify-between gap-3">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img
                            src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9fxfm5xqp14w/conv-9fxfnx2x3q4g/20260211/file-9k0hknwuspvk.png"
                            alt="Finance Tracker Logo"
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-base font-semibold tracking-tight text-foreground hidden sm:block">
                            Finance Tracker
                        </span>
                    </Link>

                    {user && (
                        <div className="flex items-center gap-2">
                            {/* Desktop pill nav */}
                            <nav className="hidden md:flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/50 p-1">
                                {navItems.map(({ path, icon: Icon, label }) => (
                                    <Link key={path} to={path}>
                                        <Button
                                            variant={isActive(path) ? 'default' : 'ghost'}
                                            size="sm"
                                            className="gap-1.5 h-8 px-3 text-xs font-medium"
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {label}
                                        </Button>
                                    </Link>
                                ))}
                            </nav>

                            <div className="flex items-center gap-1.5 ml-1">
                                <ThemeToggle />
                                
                                {/* Legal Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-xl border border-transparent hover:border-border/60"
                                        >
                                            <ShieldAlert className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Legal & Privacy</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {legalItems.map(({ path, icon: Icon, label }) => (
                                            <DropdownMenuItem key={path} asChild>
                                                <Link to={path} className="flex items-center gap-2 cursor-pointer">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{label}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* User dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-2 rounded-xl border border-transparent hover:border-border/60 h-8 px-2.5 ml-1"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <User className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="hidden md:inline text-xs font-medium max-w-[120px] truncate">
                                            {profile?.email?.split('@')[0] || 'User'}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-xs font-medium text-foreground">{profile?.email?.split('@')[0]}</p>
                                            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {profile?.role === 'admin' && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                                                <Shield className="h-4 w-4 text-primary" />
                                                <span className="text-sm">Admin Panel</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Mobile Bottom Navigation ───────────────────────────── */}
            {user && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                >
                    <div className="flex items-stretch h-16">
                        {navItems.map(({ path, icon: Icon, label }) => {
                            const active = isActive(path);
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1 transition-colors duration-150 ${
                                        active
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <div className={`relative flex items-center justify-center rounded-lg w-10 h-6 transition-all duration-150 ${
                                        active ? 'bg-primary/12' : ''
                                    }`}>
                                        <Icon className="h-5 w-5" />
                                        {active && (
                                            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium ${active ? 'text-primary' : ''}`}>
                                        {label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </>
    );
}
