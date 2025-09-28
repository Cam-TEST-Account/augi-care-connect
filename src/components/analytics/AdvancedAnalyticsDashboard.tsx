import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  Stethoscope,
  Heart,
  Brain,
  Shield
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsData {
  patientVolume: {
    total: number;
    active: number;
    newThisMonth: number;
    trend: number;
  };
  appointments: {
    scheduled: number;
    completed: number;
    cancelled: number;
    noShows: number;
    utilizationRate: number;
  };
  clinical: {
    avgVisitDuration: number;
    notesCompleted: number;
    prescriptionsWritten: number;
    labOrdersCompleted: number;
  };
  quality: {
    patientSatisfaction: number;
    clinicalOutcomes: number;
    complianceScore: number;
    errorRate: number;
  };
  financial: {
    revenue: number;
    collectionRate: number;
    avgReimbursement: number;
    trends: any[];
  };
}

const mockAnalyticsData: AnalyticsData = {
  patientVolume: {
    total: 1247,
    active: 891,
    newThisMonth: 47,
    trend: 12.3
  },
  appointments: {
    scheduled: 156,
    completed: 142,
    cancelled: 8,
    noShows: 6,
    utilizationRate: 91.0
  },
  clinical: {
    avgVisitDuration: 22,
    notesCompleted: 134,
    prescriptionsWritten: 89,
    labOrdersCompleted: 45
  },
  quality: {
    patientSatisfaction: 4.7,
    clinicalOutcomes: 94.2,
    complianceScore: 97.8,
    errorRate: 0.02
  },
  financial: {
    revenue: 45780,
    collectionRate: 96.5,
    avgReimbursement: 287,
    trends: []
  }
};

const patientVolumeData = [
  { month: 'Jan', patients: 1156, newPatients: 45 },
  { month: 'Feb', patients: 1198, newPatients: 52 },
  { month: 'Mar', patients: 1234, newPatients: 48 },
  { month: 'Apr', patients: 1267, newPatients: 39 },
  { month: 'May', patients: 1289, newPatients: 44 },
  { month: 'Jun', patients: 1247, newPatients: 47 }
];

const appointmentData = [
  { day: 'Mon', scheduled: 28, completed: 26, cancelled: 1, noShow: 1 },
  { day: 'Tue', scheduled: 32, completed: 30, cancelled: 2, noShow: 0 },
  { day: 'Wed', scheduled: 29, completed: 27, cancelled: 1, noShow: 1 },
  { day: 'Thu', scheduled: 35, completed: 33, cancelled: 1, noShow: 1 },
  { day: 'Fri', scheduled: 32, completed: 26, cancelled: 3, noShow: 3 }
];

const specialtyDistribution = [
  { name: 'Cardiology', value: 35, color: '#ef4444' },
  { name: 'Internal Medicine', value: 28, color: '#3b82f6' },
  { name: 'Endocrinology', value: 22, color: '#10b981' },
  { name: 'Gastroenterology', value: 15, color: '#f59e0b' }
];

const outcomesTrends = [
  { month: 'Jan', satisfaction: 4.5, outcomes: 92.1, compliance: 96.2 },
  { month: 'Feb', satisfaction: 4.6, outcomes: 93.4, compliance: 97.1 },
  { month: 'Mar', satisfaction: 4.4, outcomes: 91.8, compliance: 95.9 },
  { month: 'Apr', satisfaction: 4.7, outcomes: 94.2, compliance: 97.8 },
  { month: 'May', satisfaction: 4.8, outcomes: 95.1, compliance: 98.2 },
  { month: 'Jun', satisfaction: 4.7, outcomes: 94.2, compliance: 97.8 }
];

export function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalyticsData);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would aggregate data from various tables
      const { data: patientsCount } = await supabase
        .from('patients')
        .select('id', { count: 'exact' });

      const { data: appointmentsCount } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' });

      // For now, using mock data with some real counts
      setAnalytics(prev => ({
        ...prev,
        patientVolume: {
          ...prev.patientVolume,
          total: patientsCount?.length || prev.patientVolume.total
        },
        appointments: {
          ...prev.appointments,
          scheduled: appointmentsCount?.length || prev.appointments.scheduled
        }
      }));
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalytics();
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated with the latest information",
    });
  };

  const exportReport = () => {
    toast({
      title: "Exporting Report",
      description: "Analytics report is being generated...",
    });
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number',
    color = 'blue' 
  }: {
    title: string;
    value: number;
    change?: number;
    icon: any;
    format?: 'number' | 'currency' | 'percentage';
    color?: string;
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return `$${val.toLocaleString()}`;
        case 'percentage':
          return `${val.toFixed(1)}%`;
        default:
          return val.toLocaleString();
      }
    };

    const getChangeColor = (change?: number) => {
      if (!change) return 'text-muted-foreground';
      return change > 0 ? 'text-green-600' : 'text-red-600';
    };

    const getChangeIcon = (change?: number) => {
      if (!change) return null;
      return change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-2">{formatValue(value)}</h3>
              {change !== undefined && (
                <div className={`flex items-center mt-2 text-sm ${getChangeColor(change)}`}>
                  {getChangeIcon(change)}
                  <span className="ml-1">{Math.abs(change)}% from last period</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg bg-${color}-500/10`}>
              <Icon className={`h-6 w-6 text-${color}-500`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into practice performance and patient outcomes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Patients"
          value={analytics.patientVolume.total}
          change={analytics.patientVolume.trend}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Appointment Utilization"
          value={analytics.appointments.utilizationRate}
          change={5.2}
          icon={Calendar}
          format="percentage"
          color="green"
        />
        <MetricCard
          title="Monthly Revenue"
          value={analytics.financial.revenue}
          change={8.7}
          icon={DollarSign}
          format="currency"
          color="purple"
        />
        <MetricCard
          title="Patient Satisfaction"
          value={analytics.quality.patientSatisfaction}
          change={2.1}
          icon={Heart}
          color="red"
        />
      </div>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Volume Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Patient Volume Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={patientVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="patients" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="newPatients" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Specialty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Patient Distribution by Specialty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <Legend />
                    {specialtyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {specialtyDistribution.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Clinical Excellence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compliance Score</span>
                    <span>{analytics.quality.complianceScore}%</span>
                  </div>
                  <Progress value={analytics.quality.complianceScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Clinical Outcomes</span>
                    <span>{analytics.quality.clinicalOutcomes}%</span>
                  </div>
                  <Progress value={analytics.quality.clinicalOutcomes} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Activity className="h-5 w-5 mr-2" />
                  Operational Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Appointment Efficiency</span>
                    <span>{analytics.appointments.utilizationRate}%</span>
                  </div>
                  <Progress value={analytics.appointments.utilizationRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Documentation Rate</span>
                    <span>94.3%</span>
                  </div>
                  <Progress value={94.3} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Collection Rate</span>
                    <span>{analytics.financial.collectionRate}%</span>
                  </div>
                  <Progress value={analytics.financial.collectionRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue Target</span>
                    <span>87.2%</span>
                  </div>
                  <Progress value={87.2} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Weekly Appointment Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="cancelled" fill="#f59e0b" name="Cancelled" />
                  <Bar dataKey="noShow" fill="#ef4444" name="No Show" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Quality Outcomes Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={outcomesTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="satisfaction" stroke="#ef4444" strokeWidth={2} name="Patient Satisfaction" />
                  <Line type="monotone" dataKey="outcomes" stroke="#3b82f6" strokeWidth={2} name="Clinical Outcomes %" />
                  <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2} name="Compliance Score %" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}