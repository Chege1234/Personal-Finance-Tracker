import { ArrowLeft, Mail, Globe } from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="app-page animate-in">
            <div className="app-content py-10 space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Terms & Conditions</h1>
                </div>

                <div className="surface-panel p-8 md:p-12 space-y-10">
                    <div className="space-y-4 border-b border-border/60 pb-8">
                        <h2 className="text-2xl font-semibold text-foreground">Personal Finance Tracker</h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Effective Date: May 12, 2026</p>
                        <p className="text-muted-foreground leading-relaxed max-w-3xl">
                            Please read these Terms and Conditions ("Terms") carefully before using Personal Finance Tracker. By accessing or using the App, you agree to be bound by these Terms. If you do not agree, you must not use the Service.
                        </p>
                    </div>

                    <div className="space-y-12 prose prose-invert max-w-none">
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                By creating an account, accessing, or using the App in any manner, you confirm that you have read, understood, and agree to these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and Personal Finance Tracker.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms. We will notify you of material changes via the App or the email address associated with your account.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">2. Description of Service</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Personal Finance Tracker is a web-based personal finance management application that allows users to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Track income, expenses, and budgets</li>
                                <li>Categorize and visualize financial transactions</li>
                                <li>Set financial goals and monitor progress</li>
                                <li>Generate reports and summaries of financial activity</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed">
                                The Service is provided for personal, non-commercial use only. It is not a licensed financial institution, bank, investment advisor, or credit service. Nothing in the App constitutes financial, investment, tax, or legal advice.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">3. Eligibility</h3>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Be at least 18 years of age, or the age of majority in your jurisdiction, whichever is higher</li>
                                <li>Have the legal capacity to enter into a binding agreement</li>
                                <li>Not be barred from receiving services under applicable law</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed">
                                By using the App, you represent and warrant that you meet all of the above eligibility requirements.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">4. User Accounts</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                To access core features of the App, you must register for an account. When creating your account, you agree to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and promptly update your account information</li>
                                <li>Keep your login credentials confidential and not share them with any third party</li>
                                <li>Notify us immediately of any unauthorized access to or use of your account</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed">
                                You are solely responsible for all activity that occurs under your account. We will not be liable for any loss or damage arising from your failure to maintain the security of your account credentials.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-semibold text-foreground">5. Data Collection and Storage</h3>
                            <div className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground/90">5.1 Financial Data</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    Your financial data — including but not limited to transaction records, account balances, budget entries, and financial goals — is stored on our servers via Supabase, a third-party database infrastructure provider. By using the Service, you expressly consent to this storage and processing.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground/90">5.2 What We Store</h4>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Account credentials (email address, encrypted password)</li>
                                    <li>Manually entered financial transaction data</li>
                                    <li>Budget and goal configurations</li>
                                    <li>App usage data and preferences</li>
                                    <li>Device and browser information for security purposes</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground/90">5.3 What We Do Not Store</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    Personal Finance Tracker does not connect to, access, or store data from any bank account, payment card, or financial institution directly. All financial data entered into the App is inputted manually by you. We do not collect social security numbers, bank account numbers, or payment card details.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground/90">5.4 Data Retention</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    We retain your data for as long as your account remains active, or as necessary to provide the Service. You may request deletion of your account and associated data at any time by contacting us. Upon deletion, your data will be removed from active systems within a reasonable timeframe, subject to applicable legal obligations.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">6. Privacy</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Your use of the Service is also governed by our <Link to="/privacy" className="text-primary underline underline-offset-4">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of information as described in our Privacy Policy. We take reasonable technical and organizational measures to protect your data against unauthorized access, loss, or disclosure.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                However, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security and disclaim liability for unauthorized access that is beyond our reasonable control.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">7. Acceptable Use</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                You agree to use the Service only for lawful purposes. You must not:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Use the Service to commit fraud or engage in any illegal financial activity</li>
                                <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure</li>
                                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                                <li>Reverse engineer, decompile, or disassemble any part of the App</li>
                                <li>Use the Service to transmit any malicious code, viruses, or harmful data</li>
                                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                                <li>Attempt to probe, scan, or test the vulnerability of the system</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">8. Intellectual Property</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                All content, features, and functionality of the Service — including but not limited to the software, design, text, graphics, logos, and interface — are owned by or licensed to Personal Finance Tracker and are protected by applicable intellectual property laws.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                You retain ownership of all financial data you enter into the Service. By entering data, you grant us a limited license to store, process, and display that data solely for the purpose of providing the Service to you.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">9. Third-Party Services</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                The Service relies on third-party infrastructure providers, including Supabase for database services and Vercel for application hosting. These providers operate under their own terms of service and privacy policies. We are not responsible for the practices or content of any third-party service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">10. Disclaimers</h3>
                            <p className="text-foreground font-medium italic">
                                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                The App is a personal financial tracking tool only. It does not provide financial advice, and any decisions you make based on information within the App are made solely at your own risk. We strongly recommend consulting a qualified financial professional for any major financial decisions.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">11. Limitation of Liability</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PERSONAL FINANCE TRACKER AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">17. Contact Us</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about these Terms and Conditions, please contact us:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <a href="mailto:lewiskariuki04@gmail.com" className="text-primary hover:underline">lewiskariuki04@gmail.com</a>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Globe className="h-4 w-4" />
                                    <a href="https://personal-fin-track.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">personal-fin-track.vercel.app</a>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="pt-8 border-t border-border/60 text-center">
                        <p className="text-sm text-muted-foreground">© 2026 Personal Finance Tracker — All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


