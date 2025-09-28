import React from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TelehealthPanel } from '@/components/telehealth/TelehealthPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  Users, 
  Clock, 
  Signal,
  Settings,
  Shield,
  Monitor,
  Headphones
} from 'lucide-react';

const Telehealth = () => {
  const location = useLocation();
  const { toast } = useToast();
  
  // Get patient or appointment data from navigation
  const patient = location.state?.patient;
  const appointment = location.state?.appointment;

  const handleTelehealthSettings = () => {
    toast({
      title: 'Telehealth Settings',
      description: 'Opening video and audio configuration...',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Telehealth Center</h1>
            <p className="text-muted-foreground">
              Secure, HIPAA-compliant virtual consultations
              {patient && ` - Active session with ${patient.name}`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-success border-success">
              <Signal className="w-3 h-3 mr-1" />
              Online
            </Badge>
            <Button variant="outline" onClick={handleTelehealthSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Telehealth Panel */}
        <TelehealthPanel />

        {/* Telehealth Features */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Platform Features</TabsTrigger>
            <TabsTrigger value="integrations">EHR Integrations</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Session Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">HD Video Calls</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Crystal clear video quality with adaptive streaming for reliable connections.</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 1080p HD video support</li>
                    <li>• Auto bandwidth adjustment</li>
                    <li>• Background blur/replacement</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Screen Sharing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Share medical records, test results, and educational materials seamlessly.</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Full screen or application sharing</li>
                    <li>• Annotation tools</li>
                    <li>• Medical image viewing</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Multi-Provider Sessions</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Coordinate care with multiple specialists in real-time consultations.</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Up to 8 participants</li>
                    <li>• Cross-EHR provider invites</li>
                    <li>• Session recording options</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Headphones className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Audio-Only Option</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Low-bandwidth consultations with professional audio quality.</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Echo cancellation</li>
                    <li>• Noise suppression</li>
                    <li>• Auto gain control</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Session Recording</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">HIPAA-compliant recording for documentation and review purposes.</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Encrypted local storage</li>
                    <li>• Patient consent tracking</li>
                    <li>• Automatic transcription</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Security Features</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">End-to-end encryption with enterprise-grade security protocols.</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• AES-256 encryption</li>
                    <li>• Waiting room controls</li>
                    <li>• Session access logs</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supported EHR Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Epic MyChart', status: 'Active', sessions: '1,240' },
                      { name: 'Cerner PowerChart', status: 'Active', sessions: '856' },
                      { name: 'Athena Health', status: 'Active', sessions: '632' },
                      { name: 'NextGen', status: 'Pending', sessions: '0' },
                      { name: 'eClinicalWorks', status: 'Active', sessions: '298' }
                    ].map((ehr) => (
                      <div key={ehr.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{ehr.name}</p>
                          <p className="text-sm text-muted-foreground">{ehr.sessions} sessions this month</p>
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
                  <CardTitle>Integration Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Seamless Data Flow</h4>
                      <p className="text-sm text-muted-foreground">Session notes automatically sync to patient records in their primary EHR system.</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Provider Coordination</h4>
                      <p className="text-sm text-muted-foreground">Invite specialists from different EHR systems to the same consultation.</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Unified Patient View</h4>
                      <p className="text-sm text-muted-foreground">Access comprehensive patient data during calls, regardless of source system.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary" />
                    HIPAA Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'End-to-end encryption for all communications',
                      'Secure patient consent and authorization',
                      'Comprehensive audit logging',
                      'BAA-compliant data handling',
                      'PHI access controls and monitoring'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SOC 2 Type II</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Annual third-party security audits',
                      'Continuous monitoring and alerting',
                      'Data center security certifications',
                      'Employee background checks',
                      'Incident response procedures'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">2,847</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-xs text-success mt-1">+15% from last month</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">98.7%</p>
                    <p className="text-sm text-muted-foreground">Connection Success</p>
                    <p className="text-xs text-success mt-1">+0.3% improvement</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">4.8</p>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    <p className="text-xs text-muted-foreground mt-1">Patient satisfaction</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Telehealth;