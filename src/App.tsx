import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';

import routes from './routes';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { RouteGuard } from '@/components/common/RouteGuard';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layouts/Header';
import InstallPrompt from '@/components/common/InstallPrompt';

const App: React.FC = () => {
    return (
        <ThemeProvider defaultTheme="dark">
            <Router>
                <AuthProvider>
                    <RouteGuard>
                        <IntersectObserver />
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-grow">
                                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
                                    <Routes>
                                        {routes.map((route, index) => (
                                            <Route
                                                key={index}
                                                path={route.path}
                                                element={route.element}
                                            />
                                        ))}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Suspense>
                            </main>
                        </div>
                        <InstallPrompt />
                        <Toaster />
                    </RouteGuard>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
};

export default App;
