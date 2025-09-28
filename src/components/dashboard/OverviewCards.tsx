import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

const stats = [
  {
    title: 'Total Patients',
    value: '247',
    change: '+12 this month',
    icon: Users,
    trend: 'up'
  },
  {
    title: 'Today\'s Appointments',
    value: '8',
    change: '2 telehealth',
    icon: Calendar,
    trend: 'stable'
  },
  {
    title: 'High-Risk Patients',
    value: '15',
    change: '3 critical',
    icon: AlertTriangle,
    trend: 'warning'
  },
  {
    title: 'Avg Response Time',
    value: '12m',
    change: '5m faster',
    icon: Clock,
    trend: 'up'
  }
];

export const OverviewCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-card shadow-soft border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1 text-success" />}
              {stat.trend === 'warning' && <AlertTriangle className="w-3 h-3 mr-1 text-warning" />}
              {stat.change}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};