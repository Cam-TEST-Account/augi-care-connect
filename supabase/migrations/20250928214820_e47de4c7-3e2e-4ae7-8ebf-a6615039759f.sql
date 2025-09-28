-- Fix RLS policies for invitations table to prevent unauthorized access
-- Drop existing problematic policies and recreate with proper security

-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can manage invitations for their organization" ON public.invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON public.invitations;

-- Create comprehensive RLS policies for invitations table

-- 1. Super admins can view all invitations for their organization
CREATE POLICY "Super admins can view organization invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (has_organization_role_safe(auth.uid(), organization_id, 'super_admin'));

-- 2. Super admins can create invitations for their organization
CREATE POLICY "Super admins can create invitations"
ON public.invitations
FOR INSERT
TO authenticated
WITH CHECK (
    has_organization_role_safe(auth.uid(), organization_id, 'super_admin') AND
    invited_by_user_id = auth.uid()
);

-- 3. Super admins can update invitations for their organization
CREATE POLICY "Super admins can update organization invitations"
ON public.invitations
FOR UPDATE
TO authenticated
USING (has_organization_role_safe(auth.uid(), organization_id, 'super_admin'))
WITH CHECK (has_organization_role_safe(auth.uid(), organization_id, 'super_admin'));

-- 4. Super admins can delete invitations for their organization
CREATE POLICY "Super admins can delete organization invitations"
ON public.invitations
FOR DELETE
TO authenticated
USING (has_organization_role_safe(auth.uid(), organization_id, 'super_admin'));

-- 5. Users can view invitations sent to their email address (for accepting)
CREATE POLICY "Users can view their email invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND
    expires_at > now() AND
    accepted_at IS NULL
);

-- 6. Users can update invitations sent to their email (for accepting)
CREATE POLICY "Users can accept their email invitations"
ON public.invitations
FOR UPDATE
TO authenticated
USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND
    expires_at > now() AND
    accepted_at IS NULL
)
WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND
    accepted_by_user_id = auth.uid()
);

-- Add an index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON public.invitations(organization_id);