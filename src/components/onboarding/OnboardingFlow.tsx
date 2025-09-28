import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, X, Plus } from 'lucide-react';

interface OnboardingData {
  professionalEmail: string;
  professionalPhone: string;
  specialties: string[];
  adminType?: string;
  npiNumber?: string;
  organizationName: string;
  department: string;
}

interface InvitationData {
  role: string;
  specialties?: string[];
  admin_type?: string;
  organization_id: string;
}

const MEDICAL_SPECIALTIES = [
  'Internal Medicine',
  'Family Medicine', 
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Gastroenterology',
  'Hematology/Oncology',
  'Infectious Disease',
  'Nephrology',
  'Neurology',
  'Obstetrics/Gynecology',
  'Ophthalmology',
  'Orthopedic Surgery',
  'Otolaryngology',
  'Pathology',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology',
  'Other'
];

const ADMIN_TYPES = [
  { value: 'office_admin', label: 'Office Admin' },
  { value: 'nurse_rn', label: 'Nurse/RN' },
  { value: 'other', label: 'Other' }
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [data, setData] = useState<OnboardingData>({
    professionalEmail: '',
    professionalPhone: '',
    specialties: [],
    adminType: '',
    npiNumber: '',
    organizationName: '',
    department: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for invitation token
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && user) {
      handleInvitationToken(token);
    }
  }, [searchParams, user]);

  const handleInvitationToken = async (token: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('accept_invitation', {
        _token: token,
        _user_id: user.id
      });

      if (error) throw error;

      const resultData = result as any;
      if (resultData?.success) {
        setInvitation({
          role: resultData.role,
          specialties: resultData.specialties || [],
          admin_type: resultData.admin_type,
          organization_id: resultData.organization_id
        });

        // Pre-fill data based on invitation
        setData(prev => ({
          ...prev,
          specialties: resultData.specialties || [],
          adminType: resultData.admin_type || ''
        }));

        toast({
          title: "Invitation Accepted!",
          description: "Please complete your profile setup.",
        });
      } else {
        toast({
          title: "Invalid Invitation",
          description: resultData?.error || "The invitation link is invalid or expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to process invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = invitation ? 2 : 3; // Skip organization step if invited
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof OnboardingData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialty = (specialty: string) => {
    if (data.specialties.length < 3 && !data.specialties.includes(specialty)) {
      setData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    }
  };

  const removeSpecialty = (specialty: string) => {
    setData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData: any = {
        professional_email: data.professionalEmail,
        professional_phone: data.professionalPhone,
        onboarding_completed: true
      };

      // Handle role-specific data
      if (invitation?.role === 'physician') {
        updateData.specialties = data.specialties;
        updateData.npi_number = data.npiNumber;
      } else if (invitation?.role === 'administrator') {
        updateData.admin_type = data.adminType;
      }

      // If no invitation, this is a standalone signup
      if (!invitation) {
        updateData.organization_name = data.organizationName;
        updateData.department = data.department;
        updateData.specialty = data.specialties[0]; // Legacy field
      }

      const { error } = await supabase
        .from('provider_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Onboarding Complete!",
        description: "Your professional profile has been set up successfully.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.professionalEmail && data.professionalPhone;
      case 2:
        if (invitation?.role === 'physician') {
          return data.specialties.length > 0 && data.npiNumber;
        } else if (invitation?.role === 'administrator') {
          return data.adminType;
        }
        // For standalone signup, check specialties or admin type
        return data.specialties.length > 0 || data.adminType;
      case 3:
        return data.organizationName;
      default:
        return false;
    }
  };

  const getRoleDisplay = () => {
    if (!invitation) return "Provider";
    
    switch (invitation.role) {
      case 'physician':
        return "Doctor";
      case 'administrator':
        return "Administrator";
      case 'super_admin':
        return "Super Admin";
      default:
        return "Provider";
    }
  };

  if (loading && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Processing invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to AugiCare</h1>
          <p className="text-muted-foreground">
            {invitation 
              ? `Complete your ${getRoleDisplay()} profile setup`
              : "Let's set up your professional profile"
            }
          </p>
          {invitation && (
            <Badge variant="secondary" className="mt-2">
              Invited as {getRoleDisplay()}
            </Badge>
          )}
          <div className="mt-6">
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Contact Information"}
              {currentStep === 2 && "Professional Details"}
              {currentStep === 3 && "Organization Information"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Provide your professional contact details"}
              {currentStep === 2 && invitation?.role === 'physician' && "Enter your medical credentials and specialties (up to 3)"}
              {currentStep === 2 && invitation?.role === 'administrator' && "Select your administrative role"}
              {currentStep === 2 && !invitation && "Choose your role and credentials"}
              {currentStep === 3 && "Organization and department information"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="professionalEmail">Professional Email *</Label>
                  <Input
                    id="professionalEmail"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={data.professionalEmail}
                    onChange={(e) => handleInputChange('professionalEmail', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professionalPhone">Professional Phone *</Label>
                  <Input
                    id="professionalPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={data.professionalPhone}
                    onChange={(e) => handleInputChange('professionalPhone', e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                {(invitation?.role === 'physician' || !invitation) && (
                  <>
                    <div className="space-y-2">
                      <Label>Medical Specialties * (up to 3)</Label>
                      <Select 
                        onValueChange={addSpecialty}
                        disabled={data.specialties.length >= 3}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add a specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICAL_SPECIALTIES.filter(s => !data.specialties.includes(s)).map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.specialties.map((specialty) => (
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
                    
                    {(invitation?.role === 'physician' || data.specialties.length > 0) && (
                      <div className="space-y-2">
                        <Label htmlFor="npiNumber">NPI Number *</Label>
                        <Input
                          id="npiNumber"
                          placeholder="1234567890"
                          maxLength={10}
                          value={data.npiNumber || ''}
                          onChange={(e) => handleInputChange('npiNumber', e.target.value.replace(/\D/g, ''))}
                          required
                        />
                        <p className="text-sm text-muted-foreground">10-digit National Provider Identifier</p>
                      </div>
                    )}
                  </>
                )}

                {(invitation?.role === 'administrator' || (!invitation && data.specialties.length === 0)) && (
                  <div className="space-y-2">
                    <Label htmlFor="adminType">Administrative Role *</Label>
                    <Select value={data.adminType} onValueChange={(value) => handleInputChange('adminType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
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
              </>
            )}

            {currentStep === 3 && !invitation && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    placeholder="General Hospital"
                    value={data.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Internal Medicine"
                    value={data.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!isStepValid() || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}