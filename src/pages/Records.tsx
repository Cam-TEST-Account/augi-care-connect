import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Search, 
  Download,
  Eye,
  Share2,
  Filter,
  Calendar,
  User,
  Activity,
  Database,
  Shield,
  Link
} from 'lucide-react';

const Records = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get patient and section data from navigation
  const patient = location.state?.patient;
  const section = location.state?.section;

  const handleFilters = () => {
    toast({
      title: 'Advanced Filters',
      description: 'Opening record filter options...',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Exporting Records',
      description: 'Preparing records for download...',
    });
  };

  const handleViewRecord = (record: any) => {
    toast({
      title: 'Opening Record',
      description: `Viewing ${record.type} for ${record.patient}`,
    });
  };

  const handleShareRecord = (record: any) => {
    toast({
      title: 'Sharing Record',
      description: `Sharing ${record.type} with care team`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Records</h1>
            <p className="text-muted-foreground">
              Unified view of patient data across all connected EHR systems
              {patient && ` - Viewing records for ${patient.name}`}
              {section && ` (${section})`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search records by patient, condition, date, or provider..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">2,847</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Dashboard */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="recent">Recent Records</TabsTrigger>
            <TabsTrigger value="by-patient">By Patient</TabsTrigger>
            <TabsTrigger value="by-provider">By Provider</TabsTrigger>
            <TabsTrigger value="ehr-sources">EHR Sources</TabsTrigger>
            <TabsTrigger value="integration">FHIR Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-4">
            <div className="space-y-4">
              {[
                {
                  patient: 'Emily Rodriguez (Test Patient)',
                  type: 'Lab Results',
                  date: '2024-01-20',
                  provider: 'Dr. Sarah Chen',
                  source: 'Epic MyChart',
                  status: 'New',
                  priority: 'High'
                },
                {
                  patient: 'Michael Thompson (Test Patient)',
                  type: 'Consultation Notes',
                  date: '2024-01-19',
                  provider: 'Dr. Jennifer Lee',
                  source: 'Cerner',
                  status: 'Reviewed',
                  priority: 'Normal'
                },
                {
                  patient: 'Sarah Williams (Test Patient)',
                  type: 'Prescription',
                  date: '2024-01-18',
                  provider: 'Dr. Michael Roberts',
                  source: 'Athena',
                  status: 'Processed',
                  priority: 'Normal'
                }
              ].map((record, idx) => (
                <Card key={idx} className="hover:shadow-soft transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{record.patient}</h3>
                          <p className="text-sm text-muted-foreground">{record.type} • {record.provider}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">{record.source}</Badge>
                            <Badge variant={record.status === 'New' ? 'default' : 'secondary'} className="text-xs">
                              {record.status}
                            </Badge>
                            {record.priority === 'High' && (
                              <Badge variant="destructive" className="text-xs">High Priority</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{record.date}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewRecord(record)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShareRecord(record)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="by-patient" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Emily Rodriguez (Test Patient)', records: 23, lastUpdate: '2 hours ago', ehrSystems: ['Epic', 'Athena'] },
                { name: 'Michael Thompson (Test Patient)', records: 18, lastUpdate: '1 day ago', ehrSystems: ['Cerner', 'Epic'] },
                { name: 'Sarah Williams (Test Patient)', records: 31, lastUpdate: '3 hours ago', ehrSystems: ['Athena', 'NextGen'] }
              ].map((patient, idx) => (
                <Card key={idx} className="hover:shadow-soft transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">{patient.name}</h3>
                      <Badge variant="outline">{patient.records} records</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Last update: {patient.lastUpdate}</p>
                      <div className="flex space-x-1">
                        {patient.ehrSystems.map((system) => (
                          <Badge key={system} variant="secondary" className="text-xs">{system}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="by-provider" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Dr. Sarah Chen', specialty: 'Cardiology', records: 45, ehr: 'Epic MyChart' },
                { name: 'Dr. Jennifer Lee', specialty: 'Primary Care', records: 38, ehr: 'Cerner' },
                { name: 'Dr. Michael Roberts', specialty: 'Endocrinology', records: 29, ehr: 'Athena' }
              ].map((provider, idx) => (
                <Card key={idx} className="hover:shadow-soft transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                      </div>
                      <Badge variant="outline">{provider.records} records</Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">{provider.ehr}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ehr-sources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connected EHR Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Epic MyChart', records: '1,240', status: 'Active', lastSync: '2 minutes ago' },
                      { name: 'Cerner PowerChart', records: '856', status: 'Active', lastSync: '5 minutes ago' },
                      { name: 'Athena Health', records: '632', status: 'Active', lastSync: '1 minute ago' },
                      { name: 'NextGen', records: '119', status: 'Syncing', lastSync: 'In progress' }
                    ].map((ehr) => (
                      <div key={ehr.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Database className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{ehr.name}</p>
                            <p className="text-sm text-muted-foreground">{ehr.records} records • Last sync: {ehr.lastSync}</p>
                          </div>
                        </div>
                        <Badge variant={ehr.status === 'Active' ? 'default' : 'secondary'}>
                          {ehr.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Synchronization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Real-time Sync</h4>
                      <p className="text-sm text-muted-foreground">Records are automatically synchronized every 5 minutes for real-time updates.</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Conflict Resolution</h4>
                      <p className="text-sm text-muted-foreground">Intelligent merge algorithms handle conflicting data from multiple sources.</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Audit Trail</h4>
                      <p className="text-sm text-muted-foreground">Complete tracking of all data changes and their sources for compliance.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Link className="w-5 h-5 mr-2 text-primary" />
                    FHIR R4 Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Standardized Data Exchange</h4>
                      <p className="text-sm text-muted-foreground">All patient data is normalized to FHIR R4 standards for seamless interoperability.</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">API-First Architecture</h4>
                      <p className="text-sm text-muted-foreground">RESTful FHIR APIs enable easy integration with third-party applications.</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Bulk Data Export</h4>
                      <p className="text-sm text-muted-foreground">Support for FHIR Bulk Data export for analytics and reporting needs.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AugiPass Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Bidirectional Sync</h4>
                      <p className="text-sm text-muted-foreground">All provider updates automatically sync back to patient's AugiPass account.</p>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Patient-Controlled Data</h4>
                      <p className="text-sm text-muted-foreground">Patients maintain full control over their unified health record across all providers.</p>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Complete Health Picture</h4>
                      <p className="text-sm text-muted-foreground">Access to wearables, genomics, pharmacy, and lab data from AugiPass.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FHIR Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Supported FHIR Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Patient', 'Practitioner', 'Organization', 'Encounter',
                    'Observation', 'Condition', 'Procedure', 'MedicationRequest',
                    'AllergyIntolerance', 'DiagnosticReport', 'DocumentReference', 'CarePlan'
                  ].map((resource) => (
                    <div key={resource} className="p-3 border border-border rounded-lg text-center">
                      <p className="text-sm font-medium text-foreground">{resource}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Compliance Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Data Security & Compliance</h4>
                <p className="text-sm text-muted-foreground">All patient records are encrypted at rest and in transit. Access is logged and audited for HIPAA compliance.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Records;