-- Manually promote the admin user
-- Fixes the issue where the profile might have been created as 'user' accidentally.

UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@bellaboutique.com');
