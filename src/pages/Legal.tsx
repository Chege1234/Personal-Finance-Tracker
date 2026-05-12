import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export default function Legal() {
    const navigate = useNavigate();

    return (
        <div className="app-page animate-in">
            <div className="app-content py-10 space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Legal Information</h1>
                </div>

                <div className="surface-panel p-8 space-y-6 prose prose-invert max-w-none">
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">Legal Notice</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Personal Finance Tracker is an independent application designed for personal use. We are not a financial institution, bank, or registered investment advisor.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            All original content, features, and functionality of this application are owned by the developers and are protected by international copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">Jurisdiction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Any legal issues arising from the use of this application shall be governed by the laws of the jurisdiction in which the developer is located, without regard to its conflict of law provisions.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
