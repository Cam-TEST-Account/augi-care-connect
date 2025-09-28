import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  Pill, 
  TestTube, 
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserDisplayInfo } from '@/utils/userUtils';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'appointment' | 'lab' | 'prescription' | 'vitals' | 'note' | 'alert';
  title: string;
  description: string;
  provider?: string;
  critical?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

interface PatientTimelineProps {
  patientId: string;
  events?: TimelineEvent[];
}

const PatientTimeline: React.FC<PatientTimelineProps> = ({ patientId, events = [] }) => {
  const { user } = useAuth();
  const userInfo = getUserDisplayInfo(user);
  
  // Mock timeline events
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      date: new Date(),
      type: 'alert',
      title: 'Critical Lab Alert',
      description: 'Glucose level 450 mg/dL - Immediate attention required',
      critical: true,
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'vitals',
      title: 'Vital Signs Recorded',
      description: 'BP: 140/90, HR: 85, Temp: 98.6°F',
      provider: 'Nurse Johnson',
      trend: 'up',
    },
    {
      id: '3',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'prescription',
      title: 'Medication Prescribed',
      description: 'Metformin 500mg - Take twice daily with meals',
      provider: userInfo.displayName,
    },
    {
      id: '4',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'appointment',
      title: 'Follow-up Visit',
      description: 'Routine diabetes management check-up',
      provider: userInfo.displayName,
    },
    {
      id: '5',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: 'lab',
      title: 'Lab Results',
      description: 'HbA1c: 8.2% (elevated), Glucose: 180 mg/dL',
      provider: 'Lab Tech',
      trend: 'up',
    },
  ];

  const timelineEvents = events.length > 0 ? events : mockEvents;

  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'lab':
        return <TestTube className="h-4 w-4" />;
      case 'prescription':
        return <Pill className="h-4 w-4" />;
      case 'vitals':
        return <Heart className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Stethoscope className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-warning" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-success" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: TimelineEvent['type'], critical?: boolean) => {
    if (critical) return 'border-l-destructive';
    
    switch (type) {
      case 'alert':
        return 'border-l-destructive';
      case 'appointment':
        return 'border-l-primary';
      case 'lab':
        return 'border-l-warning';
      case 'prescription':
        return 'border-l-success';
      case 'vitals':
        return 'border-l-info';
      case 'note':
        return 'border-l-muted';
      default:
        return 'border-l-muted';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Patient Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {index < timelineEvents.length - 1 && (
                <div className="absolute left-5 top-10 w-px h-8 bg-muted" />
              )}
              <div className={`flex gap-3 p-3 rounded-lg border-l-4 ${getEventColor(event.type, event.critical)} ${event.critical ? 'bg-destructive/5' : 'bg-muted/20'}`}>
                <div className={`flex-shrink-0 p-2 rounded-full ${event.critical ? 'bg-destructive text-destructive-foreground' : 'bg-muted'}`}>
                  {getIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    {getTrendIcon(event.trend)}
                    {event.critical && (
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{formatTime(event.date)}</span>
                    {event.provider && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <span>{event.provider}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientTimeline;