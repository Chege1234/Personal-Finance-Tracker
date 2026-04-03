import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

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
        // One-time migration: remove old permanent dismissal key
        localStorage.removeItem('install-prompt-dismissed');

        // Check if already installed as standalone
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Detect iOS (Safari doesn't fire beforeinstallprompt)
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(iOS);

        // Check if dismissed in last 7 days (not permanent block)
        const dismissedAt = localStorage.getItem('install-prompt-dismissed-at');
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const recentlyDismissed = dismissedAt && Date.now() - parseInt(dismissedAt) < sevenDays;

        // Listen for the beforeinstallprompt event (Chrome/Edge/Android)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            if (!recentlyDismissed) {
                // Show after a short delay so it doesn't pop up immediately on page load
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS Safari: show manual instruction prompt after delay
        if (iOS && !recentlyDismissed) {
            setTimeout(() => setShowPrompt(true), 3000);
        }

        // Listen for app install event to hide the prompt
        window.addEventListener('appinstalled', () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
            setIsInstalled(true);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="shadow-2xl border-2 border-primary/20">
                <CardHeader className="relative bg-gradient-to-r from-primary/10 to-secondary/10 pb-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
                            <Smartphone className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">Install App</CardTitle>
                    </div>
                    <CardDescription>
                        Install Personal Finance Tracker for quick access and offline use
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {isIOS ? (
                        <div className="space-y-3 text-sm">
                            <p className="font-medium">To install on iOS:</p>
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                <li>Tap the Share button <span className="inline-block">📤</span></li>
                                <li>Scroll down and tap "Add to Home Screen"</li>
                                <li>Tap "Add" to confirm</li>
                            </ol>
                        </div>
                    ) : deferredPrompt ? (
                        <Button
                            onClick={handleInstallClick}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Install Now
                        </Button>
                    ) : (
                        <div className="space-y-3 text-sm">
                            <p className="font-medium">To install on desktop:</p>
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                <li>Click the install icon <span className="inline-block">⬇️</span> in your browser's address bar</li>
                                <li>Or open the browser menu and select "Install app"</li>
                            </ol>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
