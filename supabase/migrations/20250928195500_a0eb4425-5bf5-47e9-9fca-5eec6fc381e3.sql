-- Fix infinite recursion in user_roles RLS policies by creating security definer functions
-- and updating RLS policies for organizations table

-- First, create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_organization_safe(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT ur.organization_id
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
        AND ur.is_active = true
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_organization_role_safe(_user_id uuid, _organization_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = _user_id
            AND ur.organization_id = _organization_id
            AND ur.role = _role
            AND ur.is_active = true
    );
$$;

-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;

-- Create new safe policies for user_roles
CREATE POLICY "Users can view roles in their organization"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR 
    has_organization_role_safe(auth.uid(), organization_id, 'super_admin')
);

CREATE POLICY "Super admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_organization_role_safe(auth.uid(), organization_id, 'super_admin'))
WITH CHECK (has_organization_role_safe(auth.uid(), organization_id, 'super_admin'));

-- Add missing RLS policies for organizations table (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Super admins can create organizations') THEN
        CREATE POLICY "Super admins can create organizations"
        ON public.organizations
        FOR INSERT
        TO authenticated
        WITH CHECK (true); -- Allow creation, role assignment happens after
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Prevent unauthorized organization deletion') THEN
        CREATE POLICY "Prevent unauthorized organization deletion"
        ON public.organizations
        FOR DELETE
        TO authenticated
        USING (has_organization_role_safe(auth.uid(), id, 'super_admin'));
    END IF;
END $$;

-- Add audit logging triggers for critical tables
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        timestamp
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        jsonb_build_object(
            'old', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
        ),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_patients_trigger ON public.patients;
CREATE TRIGGER audit_patients_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_user_roles_trigger ON public.user_roles;
CREATE TRIGGER audit_user_roles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_provider_profiles_trigger ON public.provider_profiles;
CREATE TRIGGER audit_provider_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.provider_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();