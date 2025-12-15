import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Search,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PatientDetailView } from './PatientDetailView';
import { InvitePatientDialog } from './InvitePatientDialog';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  status: string;
  last_visit_date?: string;
  next_appointment_date?: string;
  mrn?: string;
}

export const EnhancedPatientDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch patients',
          variant: 'destructive',
        });
      } else {
        setPatients(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.mrn?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: patients.length,
    highRisk: patients.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length,
    active: patients.filter(p => p.status === 'active').length,
    pendingVisits: patients.filter(p => p.next_appointment_date).length,
  };

  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // If a patient is selected, show the detail view
  if (selectedPatient) {
    return (
      <div>
        <Button 
          variant="ghost" 
          className="mb-4 text-augi-forest"
          onClick={() => setSelectedPatient(null)}
        >
          ← Back to Patient List
        </Button>
        <PatientDetailView patient={selectedPatient} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-muted-foreground">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-augi-forest">Patients</h1>
          <p className="text-muted-foreground">Pre-appointment preparation for your practice</p>
        </div>
        <InvitePatientDialog 
          trigger={
            <Button className="bg-augi-sage hover:bg-augi-sage/90 text-white gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Patients to Augi FREE
            </Button>
          }
        />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-border"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-augi-cream flex items-center justify-center">
                <Users className="w-5 h-5 text-augi-forest" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-semibold text-augi-coral">{stats.highRisk}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-augi-coral" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-semibold text-augi-sage">{stats.active}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-augi-sage" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Visits</p>
                <p className="text-2xl font-semibold text-foreground">{stats.pendingVisits}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-augi-cream flex items-center justify-center">
                <Calendar className="w-5 h-5 text-augi-forest" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Patient Records ({filteredPatients.length})</h2>
        {filteredPatients.length === 0 ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No patients found</p>
              <InvitePatientDialog 
                trigger={
                  <Button className="bg-augi-forest hover:bg-augi-forest/90 text-white">
                    Invite Your First Patient
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <Card 
                key={patient.id} 
                className="bg-white border border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPatient(patient)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 bg-augi-sage/20">
                        <AvatarFallback className="bg-augi-sage/30 text-augi-forest font-medium">
                          {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          MRN: {patient.mrn || 'N/A'} • DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getRiskBadgeClass(patient.risk_level)} text-xs`}>
                        {patient.risk_level} risk
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {patient.next_appointment_date 
                          ? `Next: ${new Date(patient.next_appointment_date).toLocaleDateString()}`
                          : 'No upcoming visit'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
