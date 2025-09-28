import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  AlertTriangle,
  Video,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_visit_date?: string;
  next_appointment_date?: string;
  email?: string;
  external_patient_id?: string;
  mrn?: string;
}

export const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPatients = async () => {
    if (!user) return;

    try {
      // Get user's organization and provider profile
      const { data: profile } = await supabase
        .from('provider_profiles')
        .select('organization_id, id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Fetch patients for the organization, limit to 6 for dashboard
      const { data: patientsData, error } = await supabase
        .from('patients')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active')
        .order('last_visit_date', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPatients(patientsData || []);

    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const handleViewAll = () => {
    navigate('/patients');
  };

  const handleTelehealthCall = (patient: Patient) => {
    navigate('/telehealth', { state: { patient } });
    toast({
      title: 'Starting Telehealth Session',
      description: `Connecting with ${patient.first_name} ${patient.last_name}...`,
    });
  };

  const handleOpenChat = (patient: Patient) => {
    navigate('/messages', { state: { selectedPatient: patient } });
    toast({
      title: 'Opening Messages',
      description: `Viewing conversation with ${patient.first_name} ${patient.last_name}`,
    });
  };

  const handleViewNotes = (patient: Patient) => {
    navigate('/records', { state: { selectedPatient: patient } });
    toast({
      title: 'Opening Medical Records',
      description: `Viewing records for ${patient.first_name} ${patient.last_name}`,
    });
  };

  const handlePatientClick = (patient: Patient) => {
    navigate('/patients', { state: { selectedPatient: patient } });
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const isTestPatient = (patient: Patient) => {
    return patient.email?.includes('testpatient.com') || patient.external_patient_id?.startsWith('EXT-');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No recent visits';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Patients</span>
          <Button size="sm" onClick={handleViewAll}>View All</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <p className="font-medium">No patients found</p>
                <p className="text-sm mt-1">Add your first patient to get started</p>
              </div>
            </div>
          ) : (
            patients.map((patient) => (
              <div 
                key={patient.id} 
                className="p-4 border border-border rounded-lg bg-gradient-card hover:shadow-soft transition-all cursor-pointer"
                onClick={() => handlePatientClick(patient)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {patient.first_name} {patient.last_name}
                        {isTestPatient(patient) && (
                          <span className="text-xs text-orange-600 ml-2">(Test Patient)</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Age {getAge(patient.date_of_birth)} • MRN: {patient.mrn || 'Not assigned'}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getRiskBadgeVariant(patient.risk_level) as any}>
                          {patient.risk_level === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {patient.risk_level} risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTelehealthCall(patient);
                      }}
                      title="Start Telehealth Call"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenChat(patient);
                      }}
                      title="Open Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewNotes(patient);
                      }}
                      title="View Medical Notes"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Last visit: {formatDate(patient.last_visit_date)}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Next: {formatDate(patient.next_appointment_date)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};