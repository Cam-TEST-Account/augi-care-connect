import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  FileText, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserDisplayInfo } from '@/utils/userUtils';

const complianceMetrics = [
  {
    title: 'HIPAA Compliance',
    status: 'Active',
    lastAudit: '2024-01-15',
    score: '98%',
    icon: Shield,
    variant: 'success'
  },
  {
    title: 'SOC 2 Type II',
    status: 'Certified',
    lastAudit: '2023-12-01',
    score: '100%',
    icon: Lock,
    variant: 'success'
  },
  {
    title: 'Data Encryption',
    status: 'AES-256',
    lastAudit: 'Real-time',
    score: '100%',
    icon: Lock,
    variant: 'success'
  },
  {
    title: 'Access Logs',
    status: 'Monitoring',
    lastAudit: 'Live',
    score: '100%',
    icon: Activity,
    variant: 'success'
  }
];


export const CompliancePanel: React.FC = () => {
  const { user } = useAuth();
  const userInfo = getUserDisplayInfo(user);

  const recentAudits = [
    {
      id: 1,
      type: 'Data Access',
      user: userInfo.displayName,
      action: 'Viewed patient record',
      patient: 'Emily Rodriguez',
      timestamp: '2024-01-28 14:32:15',
      status: 'authorized'
    },
    {
      id: 2,
      type: 'Telehealth',
      user: userInfo.displayName,
      action: 'Started video consultation',
      patient: 'Michael Thompson',
      timestamp: '2024-01-28 13:45:22',
      status: 'authorized'
    },
    {
      id: 3,
      type: 'Data Export',
      user: 'System Admin',
      action: 'Exported audit logs',
      patient: 'N/A',
      timestamp: '2024-01-28 12:00:00',
      status: 'authorized'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Compliance Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceMetrics.map((metric, index) => (
          <Card key={index} className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <metric.icon className="w-4 h-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-success border-success flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {metric.status}
                </Badge>
              </div>
              <h3 className="font-medium text-foreground mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-primary mb-1">{metric.score}</p>
              <p className="text-xs text-muted-foreground">Last audit: {metric.lastAudit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Recent Audit Log
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="p-3 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {audit.user} - {audit.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {audit.patient !== 'N/A' && `Patient: ${audit.patient} • `}
                      {audit.timestamp}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-success border-success flex items-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Authorized
                </Badge>
              </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground">Security & Compliance Status</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AugiCare maintains HIPAA and SOC 2 Type II compliance with end-to-end encryption, 
                comprehensive audit logging, and role-based access controls. All patient data 
                is encrypted at rest and in transit using industry-standard protocols.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                View Compliance Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};