import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PatientCard } from './PatientCard';

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

  const handleQuickAction = (patientId: string, action: string) => {
    const patient = patients.find(p => p.id === patientId);
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';
    
    switch (action) {
      case 'schedule':
        toast({
          title: 'Scheduling',
          description: `Opening calendar for ${patientName}`,
        });
        break;
      case 'message':
        toast({
          title: 'Messaging',
          description: `Opening secure message to ${patientName}`,
        });
        break;
      case 'records':
        toast({
          title: 'Medical Records',
          description: `Opening records for ${patientName}`,
        });
        break;
      case 'call':
        if (patient?.phone) {
          window.open(`tel:${patient.phone}`, '_self');
        }
        break;
      case 'email':
        if (patient?.email) {
          window.open(`mailto:${patient.email}`, '_blank');
        }
        break;
      default:
        toast({
          title: 'Action',
          description: `${action} for ${patientName}`,
        });
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive patient management and analytics</p>
        </div>
        <Button className="primary-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 enhanced-search-input"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="depth-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All registered patients</p>
          </CardContent>
        </Card>

        <Card className="depth-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card className="depth-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently in care</p>
          </CardContent>
        </Card>

        <Card className="depth-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Visits</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.pendingVisits}</div>
            <p className="text-xs text-muted-foreground">Scheduled appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Patient Records ({filteredPatients.length})</h2>
        {filteredPatients.length === 0 ? (
          <Card className="depth-card">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No patients found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};