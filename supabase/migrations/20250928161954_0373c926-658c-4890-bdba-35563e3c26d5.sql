-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create enum types for healthcare system
CREATE TYPE provider_role AS ENUM ('physician', 'nurse', 'pa', 'np', 'admin', 'tech');
CREATE TYPE patient_status AS ENUM ('active', 'inactive', 'deceased', 'transferred');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE message_type AS ENUM ('clinical', 'administrative', 'system', 'alert');
CREATE TYPE ehr_system AS ENUM ('epic', 'cerner', 'athena', 'allscripts', 'nextgen', 'other');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create provider profiles table
CREATE TABLE public.provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    npi_number VARCHAR(10) UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role provider_role NOT NULL DEFAULT 'physician',
    specialty TEXT,
    license_number TEXT,
    license_state TEXT,
    organization_name TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_patient_id TEXT, -- For EHR integration
    mrn TEXT UNIQUE, -- Medical Record Number
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    primary_provider_id UUID REFERENCES public.provider_profiles(id),
    status patient_status DEFAULT 'active',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level risk_level DEFAULT 'low',
    last_visit_date TIMESTAMP WITH TIME ZONE,
    next_appointment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create EHR connections table for cross-EHR provider tracking
CREATE TABLE public.ehr_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_external_id TEXT NOT NULL, -- Provider ID in external EHR
    provider_name TEXT NOT NULL,
    ehr_system ehr_system NOT NULL,
    ehr_facility_name TEXT,
    specialty TEXT,
    last_sync_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    appointment_type TEXT NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    telehealth_enabled BOOLEAN DEFAULT false,
    telehealth_link TEXT,
    chief_complaint TEXT,
    notes TEXT,
    visit_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    quantity INTEGER,
    refills INTEGER DEFAULT 0,
    prescribed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date DATE,
    end_date DATE,
    instructions TEXT,
    ndc_code TEXT, -- National Drug Code
    dea_schedule TEXT,
    is_controlled BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    pharmacy_name TEXT,
    pharmacy_phone TEXT,
    external_prescription_id TEXT, -- For e-prescribing integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinical notes table
CREATE TABLE public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id),
    note_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_signed BOOLEAN DEFAULT false,
    signed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create secure messages table for provider communication
CREATE TABLE public.secure_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    sender_provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    recipient_provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message_body TEXT NOT NULL,
    message_type message_type DEFAULT 'clinical',
    is_urgent BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    read_date TIMESTAMP WITH TIME ZONE,
    parent_message_id UUID REFERENCES public.secure_messages(id),
    ehr_source ehr_system,
    external_message_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vital signs table
CREATE TABLE public.vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recorded_by_provider_id UUID REFERENCES public.provider_profiles(id),
    recorded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    bmi DECIMAL(4,1),
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    temperature_c DECIMAL(4,1),
    oxygen_saturation INTEGER,
    blood_glucose INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lab results table
CREATE TABLE public.lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    ordered_by_provider_id UUID REFERENCES public.provider_profiles(id),
    test_name TEXT NOT NULL,
    test_code TEXT,
    result_value TEXT,
    reference_range TEXT,
    unit TEXT,
    status TEXT DEFAULT 'completed',
    abnormal_flag BOOLEAN DEFAULT false,
    collected_date TIMESTAMP WITH TIME ZONE,
    resulted_date TIMESTAMP WITH TIME ZONE,
    lab_facility TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit logs for HIPAA compliance
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    provider_id UUID REFERENCES public.provider_profiles(id),
    patient_id UUID REFERENCES public.patients(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ehr_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;