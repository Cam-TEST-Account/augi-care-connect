import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Copy, Check, X, Plus, Mail, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Invitation {
  id: string;
  email: string;
  invited_role: string;
  specialties?: string[];
  admin_type?: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  invitation_token: string;
}

const MEDICAL_SPECIALTIES = [
  'Internal Medicine', 'Family Medicine', 'Cardiology', 'Dermatology',
  'Emergency Medicine', 'Endocrinology', 'Gastroenterology', 'Hematology/Oncology',
  'Infectious Disease', 'Nephrology', 'Neurology', 'Obstetrics/Gynecology',
  'Ophthalmology', 'Orthopedic Surgery', 'Otolaryngology', 'Pathology',
  'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology', 'Surgery', 'Urology', 'Other'
];

const ADMIN_TYPES = [
  { value: 'office_admin', label: 'Office Admin' },
  { value: 'nurse_rn', label: 'Nurse/RN' },
  { value: 'other', label: 'Other' }
];

export function InvitationManager() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'physician' | 'administrator'>('physician');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [adminType, setAdminType] = useState('');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invitations",
        variant: "destructive",
      });
    }
  };

  const createInvitation = async () => {
    if (!user || !email) return;

    setLoading(true);
    try {
      // Get user's organization
      const { data: userOrg, error: orgError } = await supabase.rpc('get_user_organization', {
        _user_id: user.id
      });

      if (orgError) throw orgError;

      const invitationData = {
        email,
        invited_role: role,
        organization_id: userOrg,
        invited_by_user_id: user.id,
        specialties: role === 'physician' ? selectedSpecialties : null,
        admin_type: role === 'administrator' ? adminType : null
      };

      const { data, error } = await supabase
        .from('invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Invitation Created!",
        description: `Invitation sent to ${email}`,
      });

      // Reset form
      setEmail('');
      setSelectedSpecialties([]);
      setAdminType('');
      setShowForm(false);
      
      // Refresh invitations
      fetchInvitations();
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to create invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationLink = async (token: string) => {
    const link = `${window.location.origin}/onboarding?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
    
    toast({
      title: "Link Copied!",
      description: "Invitation link copied to clipboard",
    });
  };

  const addSpecialty = (specialty: string) => {
    if (selectedSpecialties.length < 3 && !selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(prev => [...prev, specialty]);
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => prev.filter(s => s !== specialty));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'physician': return 'Doctor';
      case 'administrator': return 'Administrator';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Invitations</h2>
          <p className="text-muted-foreground">Invite doctors and administrators to your organization</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Invitation
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Invitation</CardTitle>
            <CardDescription>Send a personalized invitation to join your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={role} onValueChange={(value: 'physician' | 'administrator') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physician">Doctor/Physician</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === 'physician' && (
              <div className="space-y-2">
                <Label>Specialties (up to 3)</Label>
                <Select 
                  onValueChange={addSpecialty}
                  disabled={selectedSpecialties.length >= 3}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add a specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDICAL_SPECIALTIES.filter(s => !selectedSpecialties.includes(s)).map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSpecialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeSpecialty(specialty)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {role === 'administrator' && (
              <div className="space-y-2">
                <Label>Administrator Type *</Label>
                <Select value={adminType} onValueChange={setAdminType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={createInvitation}
                disabled={loading || !email || !role || (role === 'administrator' && !adminType)}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Create Invitation
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending & Recent Invitations</CardTitle>
          <CardDescription>Track invitation status and copy links</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No invitations yet. Create your first invitation above.
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{invitation.email}</span>
                        <Badge variant={invitation.accepted_at ? "default" : isExpired(invitation.expires_at) ? "destructive" : "secondary"}>
                          {invitation.accepted_at ? "Accepted" : isExpired(invitation.expires_at) ? "Expired" : "Pending"}
                        </Badge>
                        <Badge variant="outline">
                          {getRoleDisplay(invitation.invited_role)}
                        </Badge>
                      </div>
                      
                      {invitation.specialties && invitation.specialties.length > 0 && (
                        <div className="flex gap-1 mb-1">
                          {invitation.specialties.map(specialty => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {invitation.admin_type && (
                        <Badge variant="outline" className="text-xs mb-1">
                          {ADMIN_TYPES.find(t => t.value === invitation.admin_type)?.label}
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {formatDate(invitation.created_at)}
                        </span>
                        {!invitation.accepted_at && (
                          <span>Expires {formatDate(invitation.expires_at)}</span>
                        )}
                        {invitation.accepted_at && (
                          <span>Accepted {formatDate(invitation.accepted_at)}</span>
                        )}
                      </div>
                    </div>
                    
                    {!invitation.accepted_at && !isExpired(invitation.expires_at) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.invitation_token)}
                      >
                        {copiedToken === invitation.invitation_token ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}