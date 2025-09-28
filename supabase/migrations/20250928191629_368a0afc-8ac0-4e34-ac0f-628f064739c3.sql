-- Create invitation system for organization onboarding
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  email TEXT NOT NULL,
  invited_role user_role NOT NULL,
  specialties TEXT[], -- For doctors, can have up to 3 specialties
  admin_type TEXT, -- For admin roles: 'office_admin', 'nurse_rn', 'other'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invitations
CREATE POLICY "Super admins can manage invitations for their organization" 
ON public.invitations 
FOR ALL 
USING (has_organization_role(auth.uid(), organization_id, 'super_admin'::user_role));

CREATE POLICY "Users can view invitations sent to their email" 
ON public.invitations 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Update provider_profiles to support multiple specialties and admin types
ALTER TABLE public.provider_profiles 
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS admin_type TEXT;

-- Create function to update timestamps
CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_organization_id ON public.invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON public.invitations(expires_at);

-- Create function to validate invitation and set user organization
CREATE OR REPLACE FUNCTION public.accept_invitation(_token UUID, _user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  result JSONB;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE invitation_token = _token
    AND expires_at > now()
    AND accepted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Check if user email matches invitation
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = _user_id AND email = invitation_record.email
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email does not match invitation');
  END IF;

  -- Update provider profile with invitation details
  UPDATE public.provider_profiles
  SET organization_id = invitation_record.organization_id,
      specialties = invitation_record.specialties,
      admin_type = invitation_record.admin_type,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Create user role
  INSERT INTO public.user_roles (
    user_id, 
    organization_id, 
    role, 
    granted_by_user_id
  ) VALUES (
    _user_id,
    invitation_record.organization_id,
    invitation_record.invited_role,
    invitation_record.invited_by_user_id
  );

  -- Mark invitation as accepted
  UPDATE public.invitations
  SET accepted_at = now(),
      accepted_by_user_id = _user_id,
      updated_at = now()
  WHERE id = invitation_record.id;

  result := jsonb_build_object(
    'success', true,
    'organization_id', invitation_record.organization_id,
    'role', invitation_record.invited_role,
    'specialties', invitation_record.specialties,
    'admin_type', invitation_record.admin_type
  );

  RETURN result;
END;
$$;