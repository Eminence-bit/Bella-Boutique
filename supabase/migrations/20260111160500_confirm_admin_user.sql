-- Manually confirm the admin user to bypass email verification
-- This is a one-time data fix for the initial setup.

DO $$
BEGIN
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE email = 'admin@bellaboutique.com';
END $$;
