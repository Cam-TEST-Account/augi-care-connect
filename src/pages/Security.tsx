import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { BackupRecovery } from '@/components/backup/BackupRecovery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  FileText,
  Key
} from 'lucide-react';

export default function Security() {
  return (
    <DashboardLayout>
      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>
        
        <TabsContent value="backup">
          <BackupRecovery />
        </TabsContent>
        
        <TabsContent value="compliance">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">HIPAA Compliance</h1>
                <p className="text-muted-foreground">Healthcare compliance controls and audit management</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  SOC 2 Compliant
                </Badge>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Security Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Security Score</p>
                      <p className="text-3xl font-bold text-green-600">98%</p>
                      <p className="text-xs text-green-600 mt-1">Excellent</p>
                    </div>
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Threats</p>
                      <p className="text-3xl font-bold text-foreground">0</p>
                      <p className="text-xs text-green-600 mt-1">All clear</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Failed Logins (24h)</p>
                      <p className="text-3xl font-bold text-foreground">3</p>
                      <p className="text-xs text-muted-foreground">Within normal range</p>
                    </div>
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Data Breaches</p>
                      <p className="text-3xl font-bold text-green-600">0</p>
                      <p className="text-xs text-green-600 mt-1">Zero incidents</p>
                    </div>
                    <Database className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* HIPAA Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary" />
                    HIPAA Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { requirement: 'Administrative Safeguards', status: 'Compliant', score: '100%' },
                      { requirement: 'Physical Safeguards', status: 'Compliant', score: '98%' },
                      { requirement: 'Technical Safeguards', status: 'Compliant', score: '99%' },
                      { requirement: 'Breach Notification', status: 'Compliant', score: '100%' },
                      { requirement: 'Business Associate Agreements', status: 'Compliant', score: '100%' }
                    ].map((item) => (
                      <div key={item.requirement} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{item.requirement}</p>
                          <p className="text-sm text-muted-foreground">Compliance Score: {item.score}</p>
                        </div>
                        <Badge variant="default" className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SOC 2 Type II Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { control: 'Security', description: 'Information and systems are protected against unauthorized access', status: 'Compliant' },
                      { control: 'Availability', description: 'Information and systems are available for operation and use', status: 'Compliant' },
                      { control: 'Processing Integrity', description: 'System processing is complete, valid, accurate, timely', status: 'Compliant' },
                      { control: 'Confidentiality', description: 'Information designated as confidential is protected', status: 'Compliant' },
                      { control: 'Privacy', description: 'Personal information is collected, used, retained, and disclosed', status: 'Compliant' }
                    ].map((control) => (
                      <div key={control.control} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{control.control}</h4>
                          <Badge variant="default" className="bg-green-600 text-white text-xs">
                            {control.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{control.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">HIPAA</h4>
                    <p className="text-sm text-muted-foreground">Health Insurance Portability and Accountability Act</p>
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-600">Certified</Badge>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">SOC 2 Type II</h4>
                    <p className="text-sm text-muted-foreground">Service Organization Control 2</p>
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-600">Certified</Badge>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">GDPR</h4>
                    <p className="text-sm text-muted-foreground">General Data Protection Regulation</p>
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-600">Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}