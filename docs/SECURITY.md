# Security Hardening Guide

This document outlines the security measures implemented in the Personal Finance Tracker and provides instructions for further hardening via the Supabase Dashboard.

## Implemented Security Measures

### 1. Authorization (IDOR Prevention)
- **Row Level Security (RLS)**: Enabled on all project tables (`budgets`, `spending_entries`, `categories`, `profiles`).
- **Policy Enforcement**: Every query strictly checks `auth.uid() = user_id` (or `id` for profiles), ensuring no user can access or modify another user's data.
- **Client-side Enforcement**: API calls in `src/db/api.ts` include redundant `user_id` filters as a secondary defense layer.

### 2. Input Validation & Sanitization
- **Zod Schemas**: All data entry points (Signup, Budget Setup, Spending Form) use `zod` for strict type and format validation.
- **Sanitization Utility**: `src/lib/sanitization.ts` provides `sanitizeInput` to prevent XSS and script injection by escaping HTML characters and removing control characters.
- **Currency Validation**: `validateCurrency` ensures numeric inputs are valid, non-negative, and properly rounded.

### 3. Secure Logging
- **Centralized Logger**: `src/lib/logger.ts` handles all application logging.
- **Environment Awareness**: 
    - **Development**: Full logs with context and colors.
    - **Production**: Debug/Info logs are suppressed; only Warnings, Errors, and Security events are logged.
- **Security Event Tracking**: Specifically logs failed login attempts, unauthorized access attempts (e.g., non-admins trying to reach the Admin Panel), and budget updates.

### 4. Secret Management
- **Frontend Isolation**: No service role keys or sensitive secrets are used in the frontend code.
- **Environment Variables**: All API URLs and keys are managed via `.env` files (see `.env.example`).

## Required Supabase Dashboard Configuration

To fully secure the application, the following settings should be configured in your Supabase project:

### Authentication Settings (Auth -> Settings)
1. **Email Verification**: Ensure "Confirm Email" is enabled.
2. **Secure Passwords**: 
   - Set minimum password length (recommended: 8+).
   - Require at least one digit and one special character if possible.
3. **Session Management**:
   - Set "JWT Expiry" to a reasonable time (e.g., 3600 seconds / 1 hour).
   - Enable "Refresh Token Rotation" to prevent token reuse.
4. **MFA**: Consider enabling Multi-Factor Authentication for sensitive accounts.

### Rate Limiting (Auth -> Rate Limits)
Configure rate limits for the following to prevent brute force and abuse:
- **Email/Password Sign-in**: Limit attempts per IP/Email.
- **Sign-up**: Limit new account creation per IP.
- **Email Sending**: Limit password reset and verification emails.

### Database Security
- **Public Schema**: Ensure the `public` schema only contains tables intended for client access.
- **Service Role**: NEVER expose the `service_role` key in your frontend or public repositories.

### Deployment Security
- **HTTPS**: Supabase enforces HTTPS by default for all API calls.
- **HSTS**: If deploying to Vercel/Netlify, enable "Enforce HTTPS" and HSTS headers.
- **Content Security Policy (CSP)**: Implement a CSP header to prevent unauthorized script execution and data exfiltration.
