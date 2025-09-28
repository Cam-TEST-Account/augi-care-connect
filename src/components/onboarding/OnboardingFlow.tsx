import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle } from 'lucide-react';

interface OnboardingData {
  professionalEmail: string;
  professionalPhone: string;
  specialty: string;
  npiNumber: string;
  organizationName: string;
  department: string;
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

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    professionalEmail: '',
    professionalPhone: '',
    specialty: '',
    npiNumber: '',
    organizationName: '',
    department: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
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
      const { error } = await supabase
        .from('provider_profiles')
        .update({
          professional_email: data.professionalEmail,
          professional_phone: data.professionalPhone,
          specialty: data.specialty,
          npi_number: data.npiNumber,
          organization_name: data.organizationName,
          department: data.department,
          onboarding_completed: true
        })
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
        return data.specialty && data.npiNumber;
      case 3:
        return data.organizationName;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to AugiCare</h1>
          <p className="text-muted-foreground">Let's set up your professional profile</p>
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
              {currentStep === 2 && "Enter your medical credentials and specialty"}
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
                <div className="space-y-2">
                  <Label htmlFor="specialty">Medical Specialty *</Label>
                  <Select value={data.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICAL_SPECIALTIES.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npiNumber">NPI Number *</Label>
                  <Input
                    id="npiNumber"
                    placeholder="1234567890"
                    maxLength={10}
                    value={data.npiNumber}
                    onChange={(e) => handleInputChange('npiNumber', e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <p className="text-sm text-muted-foreground">10-digit National Provider Identifier</p>
                </div>
              </>
            )}

            {currentStep === 3 && (
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