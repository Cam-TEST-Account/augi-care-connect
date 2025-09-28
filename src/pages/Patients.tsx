import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Filter,
  AlertTriangle,
  Clock,
  MessageSquare,
  Phone,
  Video,
  FileText,
  Calendar,
  Pill,
  Users,
  Share2,
  ShieldCheck
} from 'lucide-react';

const patients = [
  {
    id: 1,
    name: 'Emily Rodriguez (Test Patient)',
    age: 34,
    mrn: 'MRN-001234',
    lastVisit: '2024-01-15',
    condition: 'Hypertension, Type 2 Diabetes',
    riskScore: 'High',
    avatar: '/placeholder-patient1.jpg',
    providers: [
      { name: 'Dr. Sarah Chen', system: 'Epic/MyChart', specialty: 'Cardiology' },
      { name: 'Dr. Michael Roberts', system: 'Athena', specialty: 'Endocrinology' }
    ],
    recentLabs: ['A1C: 8.2%', 'BP: 145/92', 'LDL: 165'],
    activeRx: ['Metformin 1000mg', 'Lisinopril 10mg', 'Atorvastatin 20mg']
  },
  {
    id: 2,
    name: 'Michael Thompson (Test Patient)',
    age: 56,
    mrn: 'MRN-005678',
    lastVisit: '2024-01-10',
    condition: 'Diabetes Type 2, CAD',
    riskScore: 'Critical',
    avatar: '/placeholder-patient2.jpg',
    providers: [
      { name: 'Dr. Jennifer Lee', system: 'Cerner', specialty: 'Primary Care' },
      { name: 'Dr. David Wilson', system: 'Epic/MyChart', specialty: 'Cardiology' }
    ],
    recentLabs: ['Troponin: Elevated', 'A1C: 9.1%', 'eGFR: 45'],
    activeRx: ['Insulin Glargine', 'Metoprolol', 'Clopidogrel']
  }
];

const PatientCard = ({ patient }: { patient: typeof patients[0] }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'text-destructive border-destructive bg-destructive/10';
      case 'High': return 'text-warning border-warning bg-warning/10';
      default: return 'text-muted-foreground border-border';
    }
  };

  const handlePrescribe = () => {
    navigate('/records', { state: { patient, section: 'prescriptions' } });
    toast({
      title: 'Opening Prescription Management',
      description: `Managing prescriptions for ${patient.name}`,
    });
  };

  const handleTelehealth = () => {
    navigate('/telehealth', { state: { patient } });
    toast({
      title: 'Starting Telehealth Session',
      description: `Connecting with ${patient.name}...`,
    });
  };

  const handleShareCare = () => {
    toast({
      title: 'Care Team Coordination',
      description: `Sharing care plan for ${patient.name} with team`,
    });
  };

  const handleNotes = () => {
    navigate('/records', { state: { patient, section: 'notes' } });
    toast({
      title: 'Opening Clinical Notes',
      description: `Viewing notes for ${patient.name}`,
    });
  };

  const handleProviderMessage = (provider: any) => {
    navigate('/messages', { state: { provider, patient } });
    toast({
      title: 'Opening Provider Chat',
      description: `Starting secure conversation with ${provider.name}`,
    });
  };

  const handleViewFullRecord = () => {
    navigate('/records', { state: { patient } });
  };

  return (
    <Card className="hover:shadow-soft transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={patient.avatar} />
              <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">Age {patient.age} • {patient.mrn}</p>
              <p className="text-sm text-muted-foreground mt-1">{patient.condition}</p>
            </div>
          </div>
          <Badge className={getRiskColor(patient.riskScore)}>
            {patient.riskScore === 'Critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {patient.riskScore} Risk
          </Badge>
        </div>

        {/* Cross-EHR Provider Network */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2 text-primary" />
            Care Team Across EHRs
          </h4>
          <div className="space-y-2">
            {patient.providers.map((provider, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{provider.name}</p>
                  <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">{provider.system}</Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleProviderMessage(provider)}
                    title={`Message ${provider.name}`}
                  >
                    <MessageSquare className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex flex-col items-center p-3 h-auto"
            onClick={handlePrescribe}
          >
            <Pill className="w-4 h-4 mb-1 text-primary" />
            <span className="text-xs">Prescribe</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex flex-col items-center p-3 h-auto"
            onClick={handleTelehealth}
          >
            <Video className="w-4 h-4 mb-1 text-primary" />
            <span className="text-xs">Telehealth</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex flex-col items-center p-3 h-auto"
            onClick={handleShareCare}
          >
            <Share2 className="w-4 h-4 mb-1 text-primary" />
            <span className="text-xs">Share Care</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex flex-col items-center p-3 h-auto"
            onClick={handleNotes}
          >
            <FileText className="w-4 h-4 mb-1 text-primary" />
            <span className="text-xs">Notes</span>
          </Button>
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-foreground mb-1">Recent Labs</h5>
            {patient.recentLabs.map((lab, idx) => (
              <p key={idx} className="text-muted-foreground text-xs">{lab}</p>
            ))}
          </div>
          <div>
            <h5 className="font-medium text-foreground mb-1">Active Prescriptions</h5>
            {patient.activeRx.slice(0, 2).map((rx, idx) => (
              <p key={idx} className="text-muted-foreground text-xs">{rx}</p>
            ))}
            {patient.activeRx.length > 2 && (
              <p className="text-xs text-primary">+{patient.activeRx.length - 2} more</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Last visit: {patient.lastVisit}
          </span>
          <Button size="sm" onClick={handleViewFullRecord}>View Full Record</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Patients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check if we have a selected patient from navigation
  const selectedPatient = location.state?.selectedPatient;

  const handleAddPatient = () => {
    toast({
      title: 'Add New Patient',
      description: 'Opening patient registration form...',
    });
    // Here you would typically open a modal or navigate to a form
  };

  const handleFilters = () => {
    toast({
      title: 'Advanced Filters',
      description: 'Opening filter options...',
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
            <p className="text-muted-foreground">Unified care across multiple EHR systems</p>
          </div>
          <Button onClick={handleAddPatient}>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search patients by name, MRN, or condition..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Patients</TabsTrigger>
            <TabsTrigger value="critical">Critical Risk</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="telehealth">Telehealth Ready</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {selectedPatient && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-primary">
                    Viewing details for: {selectedPatient.name}
                  </p>
                </CardContent>
              </Card>
            )}
            <div className="grid gap-6">
              {filteredPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="critical" className="space-y-4">
            <div className="grid gap-6">
              {filteredPatients.filter(p => p.riskScore === 'Critical').map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Recent Activity</h3>
                <p className="text-muted-foreground">Patients with activity in the last 48 hours will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="telehealth" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Telehealth Ready</h3>
                <p className="text-muted-foreground">Patients enrolled in telehealth programs will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Compliance Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">HIPAA Compliant Cross-EHR Communication</h4>
                <p className="text-sm text-muted-foreground">All provider communications are encrypted and logged for audit compliance. Patient consent is verified for each care team member.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Patients;