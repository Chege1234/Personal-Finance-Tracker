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

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('install-prompt-dismissed');
        if (dismissed) {
            return;
        }

        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(iOS);

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show prompt after a delay
        if (iOS) {
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('install-prompt-dismissed', 'true');
    };

    if (!showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-slide-in">
            <Card className="shadow-2xl border-2 border-primary/20">
                <CardHeader className="relative bg-gradient-to-r from-primary/10 to-secondary/10">
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
                    ) : (
                        <Button
                            onClick={handleInstallClick}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Install Now
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
