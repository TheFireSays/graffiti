-- Auth hardening: email verification helper + audit column
--
-- Password changes are handled client-side via supabase.auth.updateUser().
-- This migration adds a server-side helper to check email verification status
-- and an email_verified column on the public users table for convenience.

-- Convenience column on public.users (kept in sync by the app layer)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Server-side function to check email verification from auth.users
CREATE OR REPLACE FUNCTION public.is_email_verified()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (email_confirmed_at IS NOT NULL)
  FROM auth.users
  WHERE id = auth.uid();
$$;

-- Allow authenticated users to call the function
GRANT EXECUTE ON FUNCTION public.is_email_verified() TO authenticated;
