-- Create enum types for account management
CREATE TYPE account_type AS ENUM ('small_practice', 'enterprise_practice', 'hospital');
CREATE TYPE user_role AS ENUM ('super_admin', 'physician', 'administrator');
CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'cancelled', 'trial');

-- Create organizations table for multi-tenancy
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    account_type account_type NOT NULL,
    subscription_status subscription_status NOT NULL DEFAULT 'trial',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    billing_email TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT
);

-- Create subscriptions table for billing management
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    account_type account_type NOT NULL,
    super_admin_seats INTEGER NOT NULL DEFAULT 1,
    physician_seats INTEGER NOT NULL DEFAULT 0,
    administrator_seats INTEGER NOT NULL DEFAULT 0,
    super_admin_price_per_seat DECIMAL(10,2) NOT NULL,
    physician_price_per_seat DECIMAL(10,2) NOT NULL,
    administrator_price_per_seat DECIMAL(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles table for role-based access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    granted_by_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Update provider_profiles to include organization reference
ALTER TABLE public.provider_profiles 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Update patients table to include organization reference for data segregation
ALTER TABLE public.patients 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Update all other tables to include organization_id for proper data segregation
ALTER TABLE public.appointments 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.clinical_notes 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.prescriptions 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.lab_results 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.vital_signs 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.secure_messages 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.ehr_connections 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles within organization
CREATE OR REPLACE FUNCTION public.has_organization_role(_user_id UUID, _organization_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
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

-- Create function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT ur.organization_id
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
        AND ur.is_active = true
    LIMIT 1;
$$;

-- Create function to check if user can access patient data
CREATE OR REPLACE FUNCTION public.can_access_patient_data(_user_id UUID, _organization_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
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

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization"
ON public.organizations
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
            AND ur.organization_id = organizations.id
            AND ur.is_active = true
    )
);

CREATE POLICY "Super admins can update their organization"
ON public.organizations
FOR UPDATE
USING (
    public.has_organization_role(auth.uid(), organizations.id, 'super_admin')
);

-- RLS Policies for subscriptions
CREATE POLICY "Super admins can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (
    public.has_organization_role(auth.uid(), subscriptions.organization_id, 'super_admin')
);

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their organization"
ON public.user_roles
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
            AND ur.organization_id = user_roles.organization_id
            AND ur.is_active = true
    )
);

CREATE POLICY "Super admins can manage user roles"
ON public.user_roles
FOR ALL
USING (
    public.has_organization_role(auth.uid(), user_roles.organization_id, 'super_admin')
);

-- Update existing RLS policies to include organization-based access
DROP POLICY IF EXISTS "Providers can view their patients" ON public.patients;
CREATE POLICY "Users can view patients in their organization"
ON public.patients
FOR SELECT
USING (
    public.can_access_patient_data(auth.uid(), patients.organization_id)
);

DROP POLICY IF EXISTS "Providers can insert patients" ON public.patients;
CREATE POLICY "Physicians can create patients"
ON public.patients
FOR INSERT
WITH CHECK (
    public.has_organization_role(auth.uid(), patients.organization_id, 'physician')
    OR public.has_organization_role(auth.uid(), patients.organization_id, 'super_admin')
);

DROP POLICY IF EXISTS "Providers can update their patients" ON public.patients;
CREATE POLICY "Physicians can update patients in their organization"
ON public.patients
FOR UPDATE
USING (
    public.has_organization_role(auth.uid(), patients.organization_id, 'physician')
    OR public.has_organization_role(auth.uid(), patients.organization_id, 'super_admin')
);

-- Update provider_profiles RLS
DROP POLICY IF EXISTS "Providers can view their own profile" ON public.provider_profiles;
CREATE POLICY "Users can view their own profile"
ON public.provider_profiles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can update their own profile" ON public.provider_profiles;
CREATE POLICY "Users can update their own profile"
ON public.provider_profiles
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can insert their own profile" ON public.provider_profiles;
CREATE POLICY "Users can insert their own profile"
ON public.provider_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing for different account types
INSERT INTO public.organizations (name, account_type, subscription_status)
VALUES ('Demo Small Practice', 'small_practice', 'trial');

-- Create initial subscription pricing structure function
CREATE OR REPLACE FUNCTION public.get_account_pricing(_account_type account_type)
RETURNS TABLE(
    super_admin_price DECIMAL(10,2),
    physician_price DECIMAL(10,2),
    administrator_price DECIMAL(10,2),
    max_super_admins INTEGER,
    max_physicians INTEGER,
    max_administrators INTEGER
)
LANGUAGE SQL
STABLE
AS $$
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
$$;