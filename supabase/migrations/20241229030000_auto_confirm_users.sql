-- Enable auto-confirm for new users (Development helper)
-- This ensures users can login immediately without email verification
-- and helps prevent "fake success" on duplicate registration by making users active immediately.

CREATE OR REPLACE FUNCTION public.handle_new_user_auto_confirm()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_auto_confirm();
