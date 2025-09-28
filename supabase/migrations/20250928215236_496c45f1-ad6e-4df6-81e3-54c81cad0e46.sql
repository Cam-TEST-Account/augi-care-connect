-- Fix critical security issue with EHR connections access tokens
-- Add proper ownership tracking and implement stricter RLS policies

-- First, add a column to track which provider created the connection
ALTER TABLE public.ehr_connections 
ADD COLUMN IF NOT EXISTS created_by_provider_id uuid;

-- Update existing records to assign ownership (if any exist)
-- For now, we'll set it to the primary provider of the patient
UPDATE public.ehr_connections 
SET created_by_provider_id = (
    SELECT p.primary_provider_id 
    FROM public.patients p 
    WHERE p.id = ehr_connections.patient_id
)
WHERE created_by_provider_id IS NULL;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Providers can view EHR connections for their patients" ON public.ehr_connections;
DROP POLICY IF EXISTS "Providers can manage EHR connections" ON public.ehr_connections;

-- Create new secure policies with strict access controls

-- 1. Only the provider who created the connection can view it (includes tokens)
CREATE POLICY "Provider can view own EHR connections"
ON public.ehr_connections
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.provider_profiles pp
        WHERE pp.user_id = auth.uid() 
            AND pp.id = ehr_connections.created_by_provider_id
    )
);

-- 2. Only organization super admins can view all EHR connections in their org (for admin purposes)
CREATE POLICY "Super admins can view organization EHR connections"
ON public.ehr_connections
FOR SELECT
TO authenticated
USING (
    has_organization_role_safe(auth.uid(), organization_id, 'super_admin')
);

-- 3. Only the provider who created the connection can modify it
CREATE POLICY "Provider can manage own EHR connections"
ON public.ehr_connections
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.provider_profiles pp
        WHERE pp.user_id = auth.uid() 
            AND pp.id = ehr_connections.created_by_provider_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.provider_profiles pp
        WHERE pp.user_id = auth.uid() 
            AND pp.id = ehr_connections.created_by_provider_id
    )
);

-- 4. Super admins can manage EHR connections in their organization
CREATE POLICY "Super admins can manage organization EHR connections"
ON public.ehr_connections
FOR ALL
TO authenticated
USING (has_organization_role_safe(auth.uid(), organization_id, 'super_admin'))
WITH CHECK (has_organization_role_safe(auth.uid(), organization_id, 'super_admin'));

-- 5. Providers can create new EHR connections for patients they treat
CREATE POLICY "Providers can create EHR connections for their patients"
ON public.ehr_connections
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.patients p
        JOIN public.provider_profiles pp ON pp.user_id = auth.uid()
        WHERE p.id = ehr_connections.patient_id 
            AND (
                p.primary_provider_id = pp.id OR
                EXISTS (
                    SELECT 1 FROM public.appointments a
                    WHERE a.patient_id = p.id AND a.provider_id = pp.id
                )
            )
    ) AND
    created_by_provider_id = (
        SELECT pp.id FROM public.provider_profiles pp 
        WHERE pp.user_id = auth.uid()
    )
);

-- Add constraints to ensure data integrity
ALTER TABLE public.ehr_connections
ADD CONSTRAINT fk_ehr_connections_created_by_provider
FOREIGN KEY (created_by_provider_id) 
REFERENCES public.provider_profiles(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ehr_connections_created_by_provider 
ON public.ehr_connections(created_by_provider_id);

CREATE INDEX IF NOT EXISTS idx_ehr_connections_organization 
ON public.ehr_connections(organization_id);

-- Add audit trigger for EHR connections
DROP TRIGGER IF EXISTS audit_ehr_connections_trigger ON public.ehr_connections;
CREATE TRIGGER audit_ehr_connections_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.ehr_connections
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();