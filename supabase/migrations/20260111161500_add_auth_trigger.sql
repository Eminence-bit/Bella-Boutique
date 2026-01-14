-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    new.id,
    CASE 
      WHEN new.email = 'admin@bellaboutique.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Manually re-run the logic for existing users just in case
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT * FROM auth.users LOOP
    INSERT INTO public.profiles (id, role)
    VALUES (
        u.id, 
        CASE WHEN u.email = 'admin@bellaboutique.com' THEN 'admin' ELSE 'user' END
    )
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
  END LOOP;
END;
$$;
