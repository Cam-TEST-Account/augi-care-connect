import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface VitalTrendsChartProps {
  data: Array<{
    date: string;
    systolic: number;
    diastolic: number;
    heartRate: number;
    weight: number;
    glucose?: number;
  }>;
  metric: 'bloodPressure' | 'heartRate' | 'weight' | 'glucose';
  title: string;
}

const VitalTrendsChart: React.FC<VitalTrendsChartProps> = ({ data, metric, title }) => {
  // Mock data if none provided
  const mockData = [
    { date: '2024-01-01', systolic: 120, diastolic: 80, heartRate: 72, weight: 175, glucose: 95 },
    { date: '2024-01-08', systolic: 125, diastolic: 82, heartRate: 75, weight: 174, glucose: 110 },
    { date: '2024-01-15', systolic: 130, diastolic: 85, heartRate: 78, weight: 173, glucose: 125 },
    { date: '2024-01-22', systolic: 135, diastolic: 88, heartRate: 80, weight: 172, glucose: 140 },
    { date: '2024-01-29', systolic: 140, diastolic: 90, heartRate: 82, weight: 171, glucose: 160 },
    { date: '2024-02-05', systolic: 142, diastolic: 92, heartRate: 85, weight: 170, glucose: 180 },
    { date: '2024-02-12', systolic: 145, diastolic: 95, heartRate: 88, weight: 169, glucose: 200 },
  ];

  const chartData = data.length > 0 ? data : mockData;

  const getMetricConfig = () => {
    switch (metric) {
      case 'bloodPressure':
        return {
          lines: [
            { key: 'systolic', color: '#ef4444', name: 'Systolic' },
            { key: 'diastolic', color: '#3b82f6', name: 'Diastolic' },
          ],
          yAxisDomain: [60, 160],
          referenceLines: [
            { value: 140, label: 'High Systolic', color: '#ef4444' },
            { value: 90, label: 'High Diastolic', color: '#f59e0b' },
          ],
        };
      case 'heartRate':
        return {
          lines: [{ key: 'heartRate', color: '#10b981', name: 'Heart Rate' }],
          yAxisDomain: [50, 120],
          referenceLines: [
            { value: 100, label: 'Elevated', color: '#f59e0b' },
          ],
        };
      case 'weight':
        return {
          lines: [{ key: 'weight', color: '#8b5cf6', name: 'Weight (lbs)' }],
          yAxisDomain: [150, 200],
          referenceLines: [],
        };
      case 'glucose':
        return {
          lines: [{ key: 'glucose', color: '#f59e0b', name: 'Glucose (mg/dL)' }],
          yAxisDomain: [70, 250],
          referenceLines: [
            { value: 180, label: 'High', color: '#ef4444' },
            { value: 126, label: 'Elevated', color: '#f59e0b' },
          ],
        };
      default:
        return { lines: [], yAxisDomain: [0, 100], referenceLines: [] };
    }
  };

  const config = getMetricConfig();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
              {metric === 'glucose' && ' mg/dL'}
              {metric === 'heartRate' && ' bpm'}
              {metric === 'weight' && ' lbs'}
              {metric === 'bloodPressure' && ' mmHg'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis 
                domain={config.yAxisDomain}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {config.referenceLines.map((refLine, index) => (
                <ReferenceLine
                  key={index}
                  y={refLine.value}
                  stroke={refLine.color}
                  strokeDasharray="5 5"
                  label={{ value: refLine.label, position: 'left' }}
                />
              ))}
              
              {config.lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalTrendsChart;