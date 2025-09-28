import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  todaysAppointments: number;
  telehealthToday: number;
  highRiskPatients: number;
  criticalPatients: number;
  testPatientsCount: number;
}

export const OverviewCards: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todaysAppointments: 0,
    telehealthToday: 0,
    highRiskPatients: 0,
    criticalPatients: 0,
    testPatientsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [removingTestData, setRemovingTestData] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('provider_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Fetch all patients for the organization
      const { data: patients } = await supabase
        .from('patients')
        .select('risk_level, email, external_patient_id')
        .eq('organization_id', profile.organization_id);

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: appointments } = await supabase
        .from('appointments')
        .select('telehealth_enabled')
        .eq('organization_id', profile.organization_id)
        .gte('scheduled_date', `${today}T00:00:00`)
        .lt('scheduled_date', `${today}T23:59:59`);

      // Calculate stats
      const totalPatients = patients?.length || 0;
      const testPatientsCount = patients?.filter(p => 
        p.email?.includes('testpatient.com') || p.external_patient_id?.startsWith('EXT-')
      ).length || 0;
      
      const highRiskPatients = patients?.filter(p => 
        p.risk_level === 'high' || p.risk_level === 'critical'
      ).length || 0;
      
      const criticalPatients = patients?.filter(p => 
        p.risk_level === 'critical'
      ).length || 0;

      const todaysAppointments = appointments?.length || 0;
      const telehealthToday = appointments?.filter(a => a.telehealth_enabled).length || 0;

      setStats({
        totalPatients,
        todaysAppointments,
        telehealthToday,
        highRiskPatients,
        criticalPatients,
        testPatientsCount
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeTestPatients = async () => {
    if (!user) return;

    setRemovingTestData(true);
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('provider_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Call the remove test patients function
      const { error } = await supabase.rpc('remove_test_patients', {
        _organization_id: profile.organization_id
      });

      if (error) throw error;

      toast({
        title: "Test Data Removed",
        description: "All test patients and their data have been successfully removed.",
      });

      // Refresh stats
      await fetchStats();

    } catch (error) {
      console.error('Error removing test patients:', error);
      toast({
        title: "Error",
        description: "Failed to remove test data",
        variant: "destructive",
      });
    } finally {
      setRemovingTestData(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const dashboardCards = [
    {
      title: 'Total Patients',
      value: loading ? '...' : stats.totalPatients.toString(),
      change: stats.testPatientsCount > 0 ? `${stats.testPatientsCount} test patients` : 'Real patients only',
      icon: Users,
      trend: 'up'
    },
    {
      title: "Today's Appointments",
      value: loading ? '...' : stats.todaysAppointments.toString(),
      change: stats.telehealthToday > 0 ? `${stats.telehealthToday} telehealth` : 'No telehealth today',
      icon: Calendar,
      trend: 'stable'
    },
    {
      title: 'High-Risk Patients',
      value: loading ? '...' : stats.highRiskPatients.toString(),
      change: stats.criticalPatients > 0 ? `${stats.criticalPatients} critical` : 'No critical patients',
      icon: AlertTriangle,
      trend: stats.criticalPatients > 0 ? 'warning' : 'stable'
    },
    {
      title: 'Response Time',
      value: '12m',
      change: '5m faster',
      icon: Clock,
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardCards.map((stat, index) => (
          <Card key={index} className="bg-gradient-card shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1 text-success flex-shrink-0" />}
                {stat.trend === 'warning' && <AlertTriangle className="w-3 h-3 mr-1 text-warning flex-shrink-0" />}
                <span className="truncate">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Data Management */}
      {stats.testPatientsCount > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-orange-900">Test Data Active</h3>
                  <p className="text-xs sm:text-sm text-orange-700">
                    You have {stats.testPatientsCount} test patients. Remove them when ready to use real data.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchStats}
                  disabled={loading}
                  className="hidden sm:flex"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchStats}
                  disabled={loading}
                  className="sm:hidden"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={removeTestPatients}
                  disabled={removingTestData}
                  className="hidden sm:flex"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {removingTestData ? 'Removing...' : 'Remove Test Data'}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={removeTestPatients}
                  disabled={removingTestData}
                  className="sm:hidden"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};