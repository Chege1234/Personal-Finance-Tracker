import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(iOS);

        const dismissedAt = localStorage.getItem('install-prompt-dismissed-at');
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const recentlyDismissed = Boolean(dismissedAt && Date.now() - Number.parseInt(dismissedAt, 10) < sevenDays);
        let showTimer: ReturnType<typeof setTimeout> | null = null;

        const schedulePrompt = () => {
            if (recentlyDismissed) return;
            showTimer = setTimeout(() => setShowPrompt(true), 2000);
        };

        const handleBeforeInstallPrompt = (e: Event) => {
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            schedulePrompt();
        };

        const handleAppInstalled = () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
            setIsInstalled(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        if (iOS) {
            schedulePrompt();
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            if (showTimer) {
                clearTimeout(showTimer);
            }
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('install-prompt-dismissed-at', Date.now().toString());
    };

    if (isInstalled || !showPrompt) {
        return null;
    }

    return (
        <div className="fixed inset-x-4 bottom-4 z-50 animate-in slide-in-from-bottom-3 duration-300 md:inset-x-auto md:right-4 md:w-[380px]">
            <Card className="border border-border/70 bg-background/95 backdrop-blur">
                <CardHeader className="relative space-y-3 pb-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-3 h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={handleDismiss}
                        aria-label="Dismiss install prompt"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>

                    <div className="flex items-center gap-2.5 pr-8">
                        <div className="rounded-md border border-border bg-muted p-2">
                            <Smartphone className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-base font-semibold tracking-tight">Install this app</CardTitle>
                    </div>

                    <CardDescription>
                        Open your budget tracker faster and keep it available even when your connection drops.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-1">
                    {isIOS ? (
                        <div className="space-y-2.5 text-sm">
                            <p className="font-medium text-foreground">On iPhone/iPad:</p>
                            <ol className="space-y-1.5 text-muted-foreground">
                                <li>1. Tap Share in Safari.</li>
                                <li>2. Choose Add to Home Screen.</li>
                                <li>3. Tap Add.</li>
                            </ol>
                        </div>
                    ) : deferredPrompt ? (
                        <div className="space-y-2">
                            <Button onClick={handleInstallClick} className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Install app
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Takes a few seconds and adds quick-launch access from your home screen or desktop.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 text-sm">
                            <p className="font-medium text-foreground">On desktop:</p>
                            <ol className="space-y-1.5 text-muted-foreground">
                                <li>1. Click the install icon in the address bar.</li>
                                <li>2. Or open browser menu and choose Install app.</li>
                            </ol>
                        </div>
                    )}

                    <Button variant="ghost" className="h-8 w-full text-xs text-muted-foreground" onClick={handleDismiss}>
                        Not now
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
