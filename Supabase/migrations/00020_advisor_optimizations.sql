-- 1. Security Fix: Recreate public_profiles as SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) 
AS 
SELECT id, role FROM public.profiles;

-- 2. Performance Fix: Consolidate RLS policies on profiles with subquery pattern
-- Drop old policies (including those from previous manual cycles)
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Create consolidated SELECT policy using optimized (SELECT auth.uid()) pattern
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO public
USING ((SELECT auth.uid()) = id OR is_admin((SELECT auth.uid())));

-- Create consolidated UPDATE policy using optimized (SELECT auth.uid()) pattern
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO public
USING ((SELECT auth.uid()) = id OR is_admin((SELECT auth.uid())))
WITH CHECK ((SELECT auth.uid()) = id OR is_admin((SELECT auth.uid())));

-- Create consolidated DELETE policy (admins only)
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE TO public
USING (is_admin((SELECT auth.uid())));

-- 3. Cleanup: Optimize indices
-- Ensure primary foreign key indices are present for performance
CREATE INDEX IF NOT EXISTS idx_spending_entries_user_id ON public.spending_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- Drop truly redundant indices if they exist (based on initial advisor recommendation)
-- Note: advisor sometimes conflicts with FK requirements; we prioritize FK stability.
DROP INDEX IF EXISTS public.idx_budgets_month_year;
