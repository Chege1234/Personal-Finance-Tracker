import { lazy } from 'react';
import type { ReactNode } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const BudgetSetup = lazy(() => import('./pages/BudgetSetup'));
const History = lazy(() => import('./pages/History'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

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
