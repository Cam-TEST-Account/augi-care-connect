-- Create enum types for account management (check if exists first)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE account_type AS ENUM ('small_practice', 'enterprise_practice', 'hospital');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'physician', 'administrator');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'cancelled', 'trial');
    END IF;
END $$;

-- Create organizations table for multi-tenancy
CREATE TABLE IF NOT EXISTS public.organizations (
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
CREATE TABLE IF NOT EXISTS public.subscriptions (
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
CREATE TABLE IF NOT EXISTS public.user_roles (
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

-- Add organization_id to existing tables if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'organization_id') THEN
        ALTER TABLE public.provider_profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'organization_id') THEN
        ALTER TABLE public.patients ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'organization_id') THEN
        ALTER TABLE public.appointments ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinical_notes' AND column_name = 'organization_id') THEN
        ALTER TABLE public.clinical_notes ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'organization_id') THEN
        ALTER TABLE public.prescriptions ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_results' AND column_name = 'organization_id') THEN
        ALTER TABLE public.lab_results ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vital_signs' AND column_name = 'organization_id') THEN
        ALTER TABLE public.vital_signs ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'secure_messages' AND column_name = 'organization_id') THEN
        ALTER TABLE public.secure_messages ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ehr_connections' AND column_name = 'organization_id') THEN
        ALTER TABLE public.ehr_connections ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer functions for role checking
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

-- Create RLS policies for organizations
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
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

DROP POLICY IF EXISTS "Super admins can update their organization" ON public.organizations;
CREATE POLICY "Super admins can update their organization"
ON public.organizations
FOR UPDATE
USING (
    public.has_organization_role(auth.uid(), organizations.id, 'super_admin')
);

-- Create RLS policies for subscriptions
DROP POLICY IF EXISTS "Super admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Super admins can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (
    public.has_organization_role(auth.uid(), subscriptions.organization_id, 'super_admin')
);

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
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

DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;
CREATE POLICY "Super admins can manage user roles"
ON public.user_roles
FOR ALL
USING (
    public.has_organization_role(auth.uid(), user_roles.organization_id, 'super_admin')
);

-- Create triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create pricing function
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