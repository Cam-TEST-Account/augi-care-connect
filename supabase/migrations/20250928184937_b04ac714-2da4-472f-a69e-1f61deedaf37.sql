-- Create table for OAuth sessions during EHR integration
CREATE TABLE IF NOT EXISTS public.ehr_oauth_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  ehr_system TEXT NOT NULL CHECK (ehr_system IN ('epic', 'athena')),
  state TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on OAuth sessions table
ALTER TABLE public.ehr_oauth_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for OAuth sessions (providers can manage sessions for their patients)
CREATE POLICY "Providers can manage OAuth sessions for their patients" 
ON public.ehr_oauth_sessions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM patients p 
  JOIN provider_profiles pp ON pp.id = p.primary_provider_id
  WHERE pp.user_id = auth.uid() AND p.id = ehr_oauth_sessions.patient_id
));

-- Add new columns to ehr_connections table for OAuth integration
ALTER TABLE public.ehr_connections 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS encounter_id TEXT;

-- Create function to clean up expired OAuth sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ehr_oauth_sessions 
  WHERE expires_at < NOW();
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ehr_oauth_sessions_state ON public.ehr_oauth_sessions(state);
CREATE INDEX IF NOT EXISTS idx_ehr_oauth_sessions_expires_at ON public.ehr_oauth_sessions(expires_at);

-- Add unique constraint to prevent duplicate connections per patient-EHR system
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_patient_ehr_system'
  ) THEN
    ALTER TABLE public.ehr_connections 
    ADD CONSTRAINT unique_patient_ehr_system 
    UNIQUE (patient_id, ehr_system);
  END IF;
END $$;