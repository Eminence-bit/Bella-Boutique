-- Insert profile for admin user if it doesn't exist
INSERT INTO public.profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@bellaboutique.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
