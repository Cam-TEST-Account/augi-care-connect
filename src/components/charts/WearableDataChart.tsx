import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Watch, Footprints, Heart, Moon, Activity, Target } from 'lucide-react';

interface WearableData {
  date: string;
  steps: number;
  heartRateVariability: number;
  sleepHours: number;
  activeMinutes: number;
  caloriesBurned: number;
  distanceKm: number;
  restingHeartRate: number;
}

interface WearableDataChartProps {
  data?: WearableData[];
  patientName?: string;
}

const mockData: WearableData[] = [
  { date: '2024-03-01', steps: 8500, heartRateVariability: 42, sleepHours: 7.2, activeMinutes: 45, caloriesBurned: 2100, distanceKm: 6.8, restingHeartRate: 65 },
  { date: '2024-03-02', steps: 9200, heartRateVariability: 45, sleepHours: 6.8, activeMinutes: 52, caloriesBurned: 2250, distanceKm: 7.4, restingHeartRate: 63 },
  { date: '2024-03-03', steps: 7800, heartRateVariability: 38, sleepHours: 8.1, activeMinutes: 38, caloriesBurned: 1950, distanceKm: 6.2, restingHeartRate: 67 },
  { date: '2024-03-04', steps: 10500, heartRateVariability: 48, sleepHours: 7.5, activeMinutes: 65, caloriesBurned: 2400, distanceKm: 8.4, restingHeartRate: 62 },
  { date: '2024-03-05', steps: 9800, heartRateVariability: 46, sleepHours: 7.0, activeMinutes: 58, caloriesBurned: 2300, distanceKm: 7.8, restingHeartRate: 64 },
  { date: '2024-03-06', steps: 11200, heartRateVariability: 50, sleepHours: 8.3, activeMinutes: 72, caloriesBurned: 2550, distanceKm: 9.0, restingHeartRate: 61 },
  { date: '2024-03-07', steps: 6500, heartRateVariability: 35, sleepHours: 6.5, activeMinutes: 25, caloriesBurned: 1800, distanceKm: 5.2, restingHeartRate: 68 },
];

export const WearableDataChart: React.FC<WearableDataChartProps> = ({ 
  data = mockData, 
  patientName = "Patient" 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWeeklyAverage = (values: number[]) => {
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const weeklySteps = getWeeklyAverage(data.map(d => d.steps));
  const weeklySleep = (data.map(d => d.sleepHours).reduce((a, b) => a + b, 0) / data.length).toFixed(1);
  const weeklyHRV = getWeeklyAverage(data.map(d => d.heartRateVariability));
  const weeklyActive = getWeeklyAverage(data.map(d => d.activeMinutes));

  // Goals and progress
  const stepGoal = 10000;
  const sleepGoal = 8;
  const activeGoal = 60;
  const hrvGoal = 50;

  const stepProgress = Math.min((weeklySteps / stepGoal) * 100, 100);
  const sleepProgress = Math.min((parseFloat(weeklySleep) / sleepGoal) * 100, 100);
  const activeProgress = Math.min((weeklyActive / activeGoal) * 100, 100);
  const hrvProgress = Math.min((weeklyHRV / hrvGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Watch className="h-5 w-5 mr-2" />
            Wearable Data Summary - {patientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Footprints className="h-6 w-6 text-blue-600" />
                <Badge variant={stepProgress >= 80 ? 'default' : 'secondary'}>
                  {stepProgress.toFixed(0)}%
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{weeklySteps.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Daily Steps (avg)</p>
              <Progress value={stepProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Goal: {stepGoal.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Moon className="h-6 w-6 text-purple-600" />
                <Badge variant={sleepProgress >= 80 ? 'default' : 'secondary'}>
                  {sleepProgress.toFixed(0)}%
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{weeklySleep}h</h3>
              <p className="text-sm text-muted-foreground">Sleep (avg)</p>
              <Progress value={sleepProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Goal: {sleepGoal}h</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-6 w-6 text-green-600" />
                <Badge variant={activeProgress >= 80 ? 'default' : 'secondary'}>
                  {activeProgress.toFixed(0)}%
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{weeklyActive}min</h3>
              <p className="text-sm text-muted-foreground">Active Time (avg)</p>
              <Progress value={activeProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Goal: {activeGoal}min</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Heart className="h-6 w-6 text-red-600" />
                <Badge variant={hrvProgress >= 80 ? 'default' : 'secondary'}>
                  {hrvProgress.toFixed(0)}%
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{weeklyHRV}ms</h3>
              <p className="text-sm text-muted-foreground">HRV (avg)</p>
              <Progress value={hrvProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Goal: {hrvGoal}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 'dataMax + 2000']}
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value)}`}
                  formatter={(value) => [`${value?.toLocaleString()} steps`, 'Steps']}
                />
                <Bar 
                  dataKey="steps" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heart Rate Variability</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis 
                  domain={[20, 60]}
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value)}`}
                  formatter={(value) => [`${value} ms`, 'HRV']}
                />
                <Line 
                  type="monotone" 
                  dataKey="heartRateVariability" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sleep and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sleep Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 10]}
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value)}`}
                  formatter={(value) => [`${value} hours`, 'Sleep']}
                />
                <Bar 
                  dataKey="sleepHours" 
                  fill="hsl(var(--secondary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 'dataMax + 10']}
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value)}`}
                  formatter={(value) => [`${value} minutes`, 'Active Time']}
                />
                <Line 
                  type="monotone" 
                  dataKey="activeMinutes" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};