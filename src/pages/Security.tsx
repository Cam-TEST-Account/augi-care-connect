import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const Security = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security & Compliance</h1>
            <p className="text-muted-foreground">HIPAA-compliant security controls and audit management</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-success border-success">
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
                  <p className="text-3xl font-bold text-success">98%</p>
                  <p className="text-xs text-success mt-1">Excellent</p>
                </div>
                <Shield className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Threats</p>
                  <p className="text-3xl font-bold text-foreground">0</p>
                  <p className="text-xs text-success mt-1">All clear</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-success" />
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
                  <p className="text-3xl font-bold text-success">0</p>
                  <p className="text-xs text-success mt-1">Zero incidents</p>
                </div>
                <Database className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Tabs */}
        <Tabs defaultValue="compliance" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="compliance">HIPAA Compliance</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="encryption">Data Protection</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compliance" className="space-y-6">
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
                        <Badge variant="default" className="bg-success text-success-foreground">
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
                          <Badge variant="default" className="bg-success text-success-foreground text-xs">
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

            <Card>
              <CardHeader>
                <CardTitle>Compliance Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg text-center">
                    <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">HIPAA</h4>
                    <p className="text-sm text-muted-foreground">Health Insurance Portability and Accountability Act</p>
                    <Badge variant="outline" className="mt-2 text-success border-success">Certified</Badge>
                  </div>
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">SOC 2 Type II</h4>
                    <p className="text-sm text-muted-foreground">Service Organization Control 2</p>
                    <Badge variant="outline" className="mt-2 text-success border-success">Certified</Badge>
                  </div>
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg text-center">
                    <Database className="w-8 h-8 text-success mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">GDPR</h4>
                    <p className="text-sm text-muted-foreground">General Data Protection Regulation</p>
                    <Badge variant="outline" className="mt-2 text-success border-success">Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="access" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2 text-primary" />
                    Role-Based Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { role: 'System Administrator', users: 2, permissions: 'Full system access', lastReview: '2024-01-15' },
                      { role: 'Provider', users: 12, permissions: 'Patient data, clinical tools', lastReview: '2024-01-10' },
                      { role: 'Nurse', users: 8, permissions: 'Patient data (limited), documentation', lastReview: '2024-01-10' },
                      { role: 'Support Staff', users: 5, permissions: 'Scheduling, basic patient info', lastReview: '2024-01-08' }
                    ].map((role) => (
                      <div key={role.role} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{role.role}</h4>
                          <Badge variant="outline">{role.users} users</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{role.permissions}</p>
                        <p className="text-xs text-muted-foreground">Last reviewed: {role.lastReview}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Multi-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">MFA Enrollment</h4>
                        <span className="text-2xl font-bold text-success">100%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">All users have multi-factor authentication enabled</p>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-medium text-foreground">Supported Methods:</h5>
                      {[
                        'SMS Text Messages',
                        'Authenticator Apps (Google, Microsoft)',
                        'Hardware Security Keys (FIDO2)',
                        'Biometric Authentication'
                      ].map((method) => (
                        <div key={method} className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-foreground">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Session Timeout</h4>
                    <p className="text-2xl font-bold text-foreground">15 min</p>
                    <p className="text-sm text-muted-foreground">Automatic logout after inactivity</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Active Sessions</h4>
                    <p className="text-2xl font-bold text-foreground">23</p>
                    <p className="text-sm text-muted-foreground">Currently logged in users</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Concurrent Limit</h4>
                    <p className="text-2xl font-bold text-foreground">2</p>
                    <p className="text-sm text-muted-foreground">Sessions per user account</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-primary" />
                  Recent Audit Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { timestamp: '2024-01-20 14:32:15', user: 'Dr. Sarah Chen', action: 'Accessed patient record', resource: 'Emily Rodriguez (MRN-001234)', ip: '192.168.1.45' },
                    { timestamp: '2024-01-20 14:28:42', user: 'Nurse Johnson', action: 'Updated vital signs', resource: 'Michael Thompson (MRN-005678)', ip: '192.168.1.23' },
                    { timestamp: '2024-01-20 14:15:18', user: 'Dr. Michael Roberts', action: 'Prescription created', resource: 'Sarah Williams (MRN-009012)', ip: '192.168.1.67' },
                    { timestamp: '2024-01-20 13:58:33', user: 'Admin User', action: 'User permission changed', resource: 'Staff Account: nurse.smith@clinic.com', ip: '192.168.1.10' },
                    { timestamp: '2024-01-20 13:45:22', user: 'Dr. Jennifer Lee', action: 'Clinical note created', resource: 'Annual physical exam', ip: '192.168.1.34' }
                  ].map((event, idx) => (
                    <div key={idx} className="p-3 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-medium text-foreground">{event.user}</span>
                            <span className="text-sm text-muted-foreground">{event.action}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.resource}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{event.timestamp}</p>
                          <p>IP: {event.ip}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">1,247</p>
                  <p className="text-sm text-muted-foreground">Events Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">27</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">7 years</p>
                  <p className="text-sm text-muted-foreground">Retention Period</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="encryption" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-primary" />
                    Data Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Data at Rest</h4>
                        <Badge variant="outline" className="text-success border-success">AES-256</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">All database files and backups are encrypted using AES-256 encryption</p>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Data in Transit</h4>
                        <Badge variant="outline" className="text-success border-success">TLS 1.3</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">All network communications use TLS 1.3 encryption</p>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Key Management</h4>
                        <Badge variant="outline" className="text-success border-success">HSM</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Encryption keys are stored in hardware security modules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Recovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Backup Frequency</h4>
                      <p className="text-sm text-muted-foreground">Automated backups every 4 hours with encrypted storage</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Recovery Time Objective</h4>
                      <p className="text-2xl font-bold text-foreground">Under 4 hours</p>
                      <p className="text-sm text-muted-foreground">Maximum acceptable downtime</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Recovery Point Objective</h4>
                      <p className="text-2xl font-bold text-foreground">Under 1 hour</p>
                      <p className="text-sm text-muted-foreground">Maximum acceptable data loss</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-success">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">< 5 min</p>
                  <p className="text-sm text-muted-foreground">Alert Response</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Intrusion Detection', status: 'Active', description: 'Real-time monitoring for suspicious network activity' },
                    { metric: 'Vulnerability Scanning', status: 'Active', description: 'Automated scanning for security vulnerabilities' },
                    { metric: 'File Integrity Monitoring', status: 'Active', description: 'Monitoring critical system files for unauthorized changes' },
                    { metric: 'User Behavior Analytics', status: 'Active', description: 'AI-powered detection of anomalous user behavior' }
                  ].map((monitor) => (
                    <div key={monitor.metric} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">{monitor.metric}</h4>
                        <p className="text-sm text-muted-foreground">{monitor.description}</p>
                      </div>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {monitor.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Security;