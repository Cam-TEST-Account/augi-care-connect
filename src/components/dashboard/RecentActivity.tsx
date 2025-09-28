import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  MessageSquare, 
  Calendar, 
  UserPlus,
  Video,
  Pill
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'appointment',
    title: 'Completed telehealth consultation',
    patient: 'Emily Rodriguez (Test Patient)',
    time: '2 hours ago',
    icon: Video,
    status: 'completed'
  },
  {
    id: 2,
    type: 'message',
    title: 'New secure message received',
    patient: 'Michael Thompson (Test Patient)',
    time: '4 hours ago',
    icon: MessageSquare,
    status: 'unread'
  },
  {
    id: 3,
    type: 'prescription',
    title: 'Prescription sent to pharmacy',
    patient: 'Sarah Williams (Test Patient)',
    time: '6 hours ago',
    icon: Pill,
    status: 'sent'
  },
  {
    id: 4,
    type: 'record',
    title: 'Lab results uploaded',
    patient: 'David Chen (Test Patient)',
    time: '1 day ago',
    icon: FileText,
    status: 'review'
  },
  {
    id: 5,
    type: 'registration',
    title: 'New patient registered',
    patient: 'Lisa Park (Test Patient)',
    time: '2 days ago',
    icon: UserPlus,
    status: 'new'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return <Badge variant="outline" className="text-success border-success">Completed</Badge>;
    case 'unread': return <Badge variant="default">New</Badge>;
    case 'sent': return <Badge variant="outline" className="text-medical-blue border-medical-blue">Sent</Badge>;
    case 'review': return <Badge variant="outline" className="text-warning border-warning">Review</Badge>;
    case 'new': return <Badge variant="outline" className="text-primary border-primary">New</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export const RecentActivity: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="p-2 bg-primary/10 rounded-full">
                <activity.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">Patient: {activity.patient}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};