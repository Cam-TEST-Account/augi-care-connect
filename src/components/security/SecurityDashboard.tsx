import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Key,
  Database,
  Activity,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  resolved: boolean;
}

interface SecurityMetrics {
  activeUsers: number;
  failedLogins: number;
  securityAlerts: number;
  dataAccessAttempts: number;
  complianceScore: number;
}

export function SecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeUsers: 0,
    failedLogins: 0,
    securityAlerts: 0,
    dataAccessAttempts: 0,
    complianceScore: 95
  });
  const [loading, setLoading] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [auditingEnabled, setAuditingEnabled] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  const fetchSecurityData = async () => {
    try {
      // Fetch audit logs for security events
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (auditError) throw auditError;

      // Transform audit logs to security events
      const events: SecurityEvent[] = auditData?.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        event_type: log.action,
        severity: getSeverityFromAction(log.action),
        description: `${log.action} on ${log.resource_type}${log.resource_id ? ` (${log.resource_id})` : ''}`,
        user_id: log.user_id,
        ip_address: log.ip_address,
        resolved: true
      })) || [];

      setSecurityEvents(events);

      // Calculate metrics from audit data
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentEvents = auditData?.filter(log => 
        new Date(log.timestamp) > last24Hours
      ) || [];

      setMetrics({
        activeUsers: new Set(recentEvents.map(e => e.user_id)).size,
        failedLogins: recentEvents.filter(e => 
          e.action === 'login_failed' || e.action === 'auth_failed'
        ).length,
        securityAlerts: events.filter(e => 
          e.severity === 'high' || e.severity === 'critical'
        ).length,
        dataAccessAttempts: recentEvents.filter(e => 
          e.action === 'select' || e.action === 'view'
        ).length,
        complianceScore: calculateComplianceScore(events)
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityFromAction = (action: string): 'low' | 'medium' | 'high' | 'critical' => {
    const highSeverityActions = ['delete', 'unauthorized_access', 'login_failed'];
    const mediumSeverityActions = ['update', 'modify', 'export'];
    
    if (highSeverityActions.some(a => action.includes(a))) return 'high';
    if (mediumSeverityActions.some(a => action.includes(a))) return 'medium';
    return 'low';
  };

  const calculateComplianceScore = (events: SecurityEvent[]): number => {
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const highEvents = events.filter(e => e.severity === 'high').length;
    
    let score = 100;
    score -= criticalEvents * 10;
    score -= highEvents * 5;
    
    return Math.max(score, 0);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'destructive' as const;
      case 'medium': return 'secondary' as const;
      case 'low': return 'default' as const;
      default: return 'outline' as const;
    }
  };

  const handleSecuritySettingChange = async (setting: string, enabled: boolean) => {
    try {
      // In a real implementation, these would update actual security settings
      toast({
        title: "Security Setting Updated",
        description: `${setting} has been ${enabled ? 'enabled' : 'disabled'}`,
      });

      // Log the security setting change
      await supabase.from('audit_logs').insert({
        action: 'security_setting_changed',
        resource_type: 'security_settings',
        details: { setting, enabled },
        user_id: user?.id
      });

    } catch (error) {
      console.error('Error updating security setting:', error);
      toast({
        title: "Error",
        description: "Failed to update security setting",
        variant: "destructive",
      });
    }
  };

  const exportSecurityReport = async () => {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        metrics,
        securityEvents: securityEvents.slice(0, 100),
        settings: {
          encryptionEnabled,
          auditingEnabled,
          mfaRequired
        }
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Security Report Exported",
        description: "Security report has been downloaded successfully",
      });

    } catch (error) {
      console.error('Error exporting security report:', error);
      toast({
        title: "Error",
        description: "Failed to export security report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security events, compliance, and system protection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportSecurityReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={fetchSecurityData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <h3 className="text-2xl font-bold">{metrics.activeUsers}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <h3 className="text-2xl font-bold">{metrics.failedLogins}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                <h3 className="text-2xl font-bold">{metrics.securityAlerts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Database className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Data Access</p>
                <h3 className="text-2xl font-bold">{metrics.dataAccessAttempts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <h3 className="text-2xl font-bold">{metrics.complianceScore}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Compliance Score</span>
                <span>{metrics.complianceScore}%</span>
              </div>
              <Progress value={metrics.complianceScore} className="w-full" />
            </div>
            
            {metrics.complianceScore < 90 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Compliance score is below recommended threshold. Review security events and implement necessary measures.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="font-medium">Data Encryption</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Encrypt sensitive data at rest and in transit
                </p>
              </div>
              <Switch
                checked={encryptionEnabled}
                onCheckedChange={(checked) => {
                  setEncryptionEnabled(checked);
                  handleSecuritySettingChange('Data Encryption', checked);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="font-medium">Audit Logging</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Log all system access and data modifications
                </p>
              </div>
              <Switch
                checked={auditingEnabled}
                onCheckedChange={(checked) => {
                  setAuditingEnabled(checked);
                  handleSecuritySettingChange('Audit Logging', checked);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  <span className="font-medium">Multi-Factor Authentication</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Require additional verification for user logins
                </p>
              </div>
              <Switch
                checked={mfaRequired}
                onCheckedChange={(checked) => {
                  setMfaRequired(checked);
                  handleSecuritySettingChange('Multi-Factor Authentication', checked);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 p-6">
                {securityEvents.slice(0, 20).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`}
                        title={`${event.severity} severity`}
                      />
                      <div>
                        <p className="font-medium text-sm">{event.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(event.timestamp).toLocaleString()}</span>
                          {event.ip_address && (
                            <span>• IP: {event.ip_address}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                ))}
                
                {securityEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Security Events</h3>
                    <p className="text-muted-foreground">
                      No recent security events to display
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}