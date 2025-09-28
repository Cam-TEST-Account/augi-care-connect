-- Fix database function security by adding SET search_path = public to functions that don't have it
-- This prevents potential SQL injection and ensures functions operate in the correct schema

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.provider_profiles (
        user_id, 
        email, 
        first_name, 
        last_name
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update cleanup_expired_oauth_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.ehr_oauth_sessions 
  WHERE expires_at < NOW();
END;
$function$;

-- Update get_account_pricing function to be more secure
CREATE OR REPLACE FUNCTION public.get_account_pricing(_account_type account_type)
RETURNS TABLE(super_admin_price numeric, physician_price numeric, administrator_price numeric, max_super_admins integer, max_physicians integer, max_administrators integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT 
        CASE _account_type
            WHEN 'small_practice' THEN 499.00::DECIMAL(10,2)
            WHEN 'enterprise_practice' THEN 439.00::DECIMAL(10,2)
            WHEN 'hospital' THEN 399.00::DECIMAL(10,2)
        END,
        CASE _account_type
            WHEN 'small_practice' THEN 499.00::DECIMAL(10,2)
            WHEN 'enterprise_practice' THEN 439.00::DECIMAL(10,2)
            WHEN 'hospital' THEN 399.00::DECIMAL(10,2)
        END,
        CASE _account_type
            WHEN 'small_practice' THEN 299.00::DECIMAL(10,2)
            WHEN 'enterprise_practice' THEN 249.00::DECIMAL(10,2)
            WHEN 'hospital' THEN 199.00::DECIMAL(10,2)
        END,
        CASE _account_type
            WHEN 'small_practice' THEN 1
            WHEN 'enterprise_practice' THEN 3
            WHEN 'hospital' THEN 5
        END,
        CASE _account_type
            WHEN 'small_practice' THEN 3
            WHEN 'enterprise_practice' THEN 25
            WHEN 'hospital' THEN -1  -- unlimited
        END,
        CASE _account_type
            WHEN 'small_practice' THEN 2
            WHEN 'enterprise_practice' THEN 25
            WHEN 'hospital' THEN -1  -- unlimited
        END;
$function$;