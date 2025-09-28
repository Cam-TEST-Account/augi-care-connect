import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface BiomarkerData {
  date: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  glucose: number;
  weight: number;
  cholesterol: number;
}

interface BiomarkerTrendsChartProps {
  data?: BiomarkerData[];
  patientName?: string;
}

const mockData: BiomarkerData[] = [
  { date: '2024-01-01', bloodPressureSystolic: 145, bloodPressureDiastolic: 95, heartRate: 78, glucose: 140, weight: 68.5, cholesterol: 220 },
  { date: '2024-01-15', bloodPressureSystolic: 142, bloodPressureDiastolic: 92, heartRate: 76, glucose: 135, weight: 68.2, cholesterol: 215 },
  { date: '2024-02-01', bloodPressureSystolic: 138, bloodPressureDiastolic: 88, heartRate: 74, glucose: 128, weight: 67.8, cholesterol: 210 },
  { date: '2024-02-15', bloodPressureSystolic: 135, bloodPressureDiastolic: 85, heartRate: 72, glucose: 125, weight: 67.5, cholesterol: 205 },
  { date: '2024-03-01', bloodPressureSystolic: 132, bloodPressureDiastolic: 82, heartRate: 70, glucose: 120, weight: 67.2, cholesterol: 200 },
  { date: '2024-03-15', bloodPressureSystolic: 130, bloodPressureDiastolic: 80, heartRate: 68, glucose: 118, weight: 67.0, cholesterol: 195 },
];

export const BiomarkerTrendsChart: React.FC<BiomarkerTrendsChartProps> = ({ 
  data = mockData, 
  patientName = "Patient" 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTrend = (values: number[]) => {
    if (values.length < 2) return 'stable';
    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-500';
      case 'decreasing':
        return 'text-green-500';
      default:
        return 'text-yellow-500';
    }
  };

  const bpSystolicTrend = getTrend(data.map(d => d.bloodPressureSystolic));
  const glucoseTrend = getTrend(data.map(d => d.glucose));
  const heartRateTrend = getTrend(data.map(d => d.heartRate));

  return (
    <div className="space-y-6">
      {/* Trend Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Biomarker Trends - {patientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Blood Pressure</p>
                <p className="text-xs text-muted-foreground">Systolic trending</p>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(bpSystolicTrend)}
                <Badge variant={bpSystolicTrend === 'decreasing' ? 'default' : 'secondary'}>
                  {bpSystolicTrend}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Blood Glucose</p>
                <p className="text-xs text-muted-foreground">Fasting levels</p>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(glucoseTrend)}
                <Badge variant={glucoseTrend === 'decreasing' ? 'default' : 'secondary'}>
                  {glucoseTrend}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Heart Rate</p>
                <p className="text-xs text-muted-foreground">Resting BPM</p>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(heartRateTrend)}
                <Badge variant={heartRateTrend === 'stable' ? 'default' : 'secondary'}>
                  {heartRateTrend}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood Pressure Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis 
                domain={[60, 160]}
                fontSize={12}
              />
              <Tooltip 
                labelFormatter={(value) => `Date: ${formatDate(value)}`}
                formatter={(value, name) => [
                  `${value} mmHg`,
                  name === 'bloodPressureSystolic' ? 'Systolic' : 'Diastolic'
                ]}
              />
              <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="5 5" label="High Systolic" />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" label="High Diastolic" />
              <Line 
                type="monotone" 
                dataKey="bloodPressureSystolic" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="bloodPressureDiastolic" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Glucose and Heart Rate Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Glucose</CardTitle>
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
                  domain={[70, 180]}
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value)}`}
                  formatter={(value) => [`${value} mg/dL`, 'Glucose']}
                />
                <ReferenceLine y={126} stroke="#ef4444" strokeDasharray="5 5" label="High" />
                <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="5 5" label="Normal" />
                <Line 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heart Rate</CardTitle>
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
                  domain={[50, 100]}
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value)}`}
                  formatter={(value) => [`${value} BPM`, 'Heart Rate']}
                />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="5 5" label="High" />
                <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="5 5" label="Normal" />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
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