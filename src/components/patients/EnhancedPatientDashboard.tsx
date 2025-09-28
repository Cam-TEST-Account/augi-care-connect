import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Phone, 
  Mail, 
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Filter,
  SortAsc,
  MoreHorizontal,
  Activity,
  TrendingUp,
  Heart
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BiomarkerTrendsChart } from '@/components/charts/BiomarkerTrendsChart';
import { WearableDataChart } from '@/components/charts/WearableDataChart';
import { PredictiveRiskAnalysis } from '@/components/analysis/PredictiveRiskAnalysis';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth: string;
  gender?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  status: 'active' | 'inactive' | 'deceased' | 'transferred';
  last_visit_date?: string;
  next_appointment_date?: string;
  mrn?: string;
  created_at: string;
}

export function EnhancedPatientDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('last_visit');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortPatients();
  }, [patients, searchTerm, riskFilter, statusFilter, sortBy]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
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

  const filterAndSortPatients = () => {
    let filtered = patients.filter(patient => {
      const matchesSearch = 
        patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk = riskFilter === 'all' || patient.risk_level === riskFilter;
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });

    // Sort patients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'last_visit':
          if (!a.last_visit_date && !b.last_visit_date) return 0;
          if (!a.last_visit_date) return 1;
          if (!b.last_visit_date) return -1;
          return new Date(b.last_visit_date).getTime() - new Date(a.last_visit_date).getTime();
        case 'risk_score':
          return b.risk_score - a.risk_score;
        case 'next_appointment':
          if (!a.next_appointment_date && !b.next_appointment_date) return 0;
          if (!a.next_appointment_date) return 1;
          if (!b.next_appointment_date) return -1;
          return new Date(a.next_appointment_date).getTime() - new Date(b.next_appointment_date).getTime();
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-purple-500';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'destructive' as const;
      case 'medium': return 'secondary' as const;
      case 'low': return 'default' as const;
      default: return 'outline' as const;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleQuickAction = async (action: string, patient: Patient) => {
    // These would typically navigate to specific pages or open modals
    switch (action) {
      case 'schedule':
        toast({
          title: "Schedule Appointment",
          description: `Opening scheduler for ${patient.first_name} ${patient.last_name}`,
        });
        break;
      case 'message':
        toast({
          title: "Send Message",
          description: `Opening message composer for ${patient.first_name} ${patient.last_name}`,
        });
        break;
      case 'records':
        toast({
          title: "View Records",
          description: `Opening medical records for ${patient.first_name} ${patient.last_name}`,
        });
        break;
      case 'call':
        if (patient.phone) {
          window.open(`tel:${patient.phone}`);
        }
        break;
      case 'email':
        if (patient.email) {
          window.open(`mailto:${patient.email}`);
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <p className="text-muted-foreground">
            Enhanced patient management with biomarker tracking and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <User className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
          <TabsTrigger value="wearables">Wearable Data</TabsTrigger>
          <TabsTrigger value="analytics">Risk Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, MRN, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_visit">Last Visit</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="risk_score">Risk Score</SelectItem>
                <SelectItem value="next_appointment">Next Appointment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <h3 className="text-2xl font-bold">{patients.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <h3 className="text-2xl font-bold">
                  {patients.filter(p => p.risk_level === 'high').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <h3 className="text-2xl font-bold">
                  {patients.filter(p => p.status === 'active').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Visits</p>
                <h3 className="text-2xl font-bold">
                  {patients.filter(p => p.next_appointment_date).length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patients ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-2 p-6">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" alt={`${patient.first_name} ${patient.last_name}`} />
                          <AvatarFallback>
                            {getInitials(patient.first_name, patient.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div 
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getRiskColor(patient.risk_level)}`}
                          title={`${patient.risk_level} risk`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold truncate">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <Badge variant={getRiskBadgeVariant(patient.risk_level)}>
                            {patient.risk_level} risk
                          </Badge>
                          {patient.status === 'active' ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <span className="font-medium">MRN:</span>
                            <span className="ml-1">{patient.mrn || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Last visit: {formatDate(patient.last_visit_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Next: {formatDate(patient.next_appointment_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Quick Actions */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('schedule', patient)}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('message', patient)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('records', patient)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {patient.phone && (
                            <DropdownMenuItem onClick={() => handleQuickAction('call', patient)}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call Patient
                            </DropdownMenuItem>
                          )}
                          {patient.email && (
                            <DropdownMenuItem onClick={() => handleQuickAction('email', patient)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Timeline
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
    </TabsContent>

    <TabsContent value="biomarkers" className="space-y-6">
      <BiomarkerTrendsChart 
        patientName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "Emily Rodriguez"}
      />
    </TabsContent>

    <TabsContent value="wearables" className="space-y-6">
      <WearableDataChart 
        patientName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "Emily Rodriguez"}
      />
    </TabsContent>

    <TabsContent value="analytics" className="space-y-6">
      <PredictiveRiskAnalysis 
        patientName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "Emily Rodriguez"}
        overallRiskScore={selectedPatient?.risk_score || 72}
      />
    </TabsContent>
  </Tabs>
  </div>
  );
}