-- Enhanced RLS policies for patients table to ensure HIPAA compliance and PHI protection

-- First, drop existing policies to replace with more secure ones
DROP POLICY IF EXISTS "Users can view patients in their organization" ON public.patients;
DROP POLICY IF EXISTS "Physicians can create patients" ON public.patients;
DROP POLICY IF EXISTS "Physicians can update patients in their organization" ON public.patients;

-- Create enhanced security definer function for strict patient access control
CREATE OR REPLACE FUNCTION public.can_access_patient_strict(_user_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.patients p
        JOIN public.user_roles ur ON ur.organization_id = p.organization_id
        WHERE p.id = _patient_id
            AND ur.user_id = _user_id
            AND ur.role IN ('super_admin', 'physician')
            AND ur.is_active = true
            AND p.organization_id IS NOT NULL
    );
$$;

-- Create function to verify organization membership for patient creation
CREATE OR REPLACE FUNCTION public.can_create_patient_in_org(_user_id uuid, _organization_id uuid)
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
            AND ur.role IN ('super_admin', 'physician')
            AND ur.is_active = true
    );
$$;

-- Strict SELECT policy - only authorized providers in same organization
CREATE POLICY "Strict patient access by organization and role"
ON public.patients
FOR SELECT
TO authenticated
USING (
    can_access_patient_strict(auth.uid(), id)
);

-- Strict INSERT policy - only physicians/admins can create patients in their org
CREATE POLICY "Physicians can create patients in their organization"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id IS NOT NULL 
    AND can_create_patient_in_org(auth.uid(), organization_id)
);

-- Strict UPDATE policy - only authorized providers can update patients
CREATE POLICY "Authorized providers can update patients"
ON public.patients
FOR UPDATE
TO authenticated
USING (
    can_access_patient_strict(auth.uid(), id)
)
WITH CHECK (
    -- Prevent organization_id changes to avoid data leaks
    organization_id = (SELECT organization_id FROM public.patients WHERE id = patients.id)
    AND can_access_patient_strict(auth.uid(), id)
);

-- Add audit trigger for patient modifications (INSERT, UPDATE, DELETE only)
CREATE OR REPLACE FUNCTION public.patient_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Log patient data modifications for HIPAA compliance
    INSERT INTO public.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        patient_id,
        details,
        timestamp
    ) VALUES (
        auth.uid(),
        TG_OP,
        'patients',
        COALESCE(NEW.id::text, OLD.id::text),
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'operation', TG_OP,
            'table', 'patients',
            'patient_mrn', COALESCE(NEW.mrn, OLD.mrn),
            'organization_id', COALESCE(NEW.organization_id, OLD.organization_id),
            'timestamp', NOW()
        ),
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for patient modification auditing (no SELECT trigger)
DROP TRIGGER IF EXISTS patient_audit_trigger ON public.patients;
CREATE TRIGGER patient_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.patient_audit_trigger();

-- Ensure organization_id is never null for new patients (data integrity)
ALTER TABLE public.patients 
ADD CONSTRAINT patients_organization_required 
CHECK (organization_id IS NOT NULL);