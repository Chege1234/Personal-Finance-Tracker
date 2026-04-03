import Dashboard from './pages/Dashboard';
import BudgetSetup from './pages/BudgetSetup';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminPanel from './pages/AdminPanel';
import type { ReactNode } from 'react';

interface RouteConfig {
    name: string;
    path: string;
    element: ReactNode;
    visible?: boolean;
}

const routes: RouteConfig[] = [
    {
        name: 'Login',
        path: '/login',
        element: <Login />,
        visible: false,
    },
    {
        name: 'Signup',
        path: '/signup',
        element: <Signup />,
        visible: false,
    },
    {
        name: 'Forgot Password',
        path: '/forgot-password',
        element: <ForgotPassword />,
        visible: false,
    },
    {
        name: 'Reset Password',
        path: '/reset-password',
        element: <ResetPassword />,
        visible: false,
    },
    {
        name: 'Dashboard',
        path: '/',
        element: <Dashboard />,
        visible: true,
    },
    {
        name: 'Budget Setup',
        path: '/budget-setup',
        element: <BudgetSetup />,
        visible: false,
    },
    {
        name: 'History',
        path: '/history',
        element: <History />,
        visible: true,
    },
    {
        name: 'Analytics',
        path: '/analytics',
        element: <Analytics />,
        visible: true,
    },
    {
        name: 'Admin Panel',
        path: '/admin',
        element: <AdminPanel />,
        visible: false,
    },
];

export default routes;
