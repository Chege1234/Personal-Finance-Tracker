import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="app-page animate-in">
            <div className="app-content py-10 space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                </div>

                <div className="surface-panel p-8 space-y-6 prose prose-invert max-w-none">
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">1. Data Collection</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We collect minimal data necessary to provide our financial tracking services. This includes your email address for authentication and the financial data you voluntarily enter into the application.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Your financial data is used solely for generating your personal dashboards and reports. We do not sell, share, or use your data for advertising purposes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">3. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures to protect your data. All communication between your device and our servers is encrypted using SSL/TLS.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">4. Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You have the right to access, export, or delete your data at any time through the application settings or by contacting our support.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
