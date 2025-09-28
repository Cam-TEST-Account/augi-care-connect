import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  MessageSquare, 
  Calendar, 
  UserPlus,
  Video,
  Pill,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ActivityItem {
  id: string;
  type: 'appointment' | 'message' | 'prescription' | 'record' | 'registration' | 'note';
  title: string;
  patient_name: string;
  timestamp: string;
  status: string;
  details?: any;
}

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      // Get user's organization and provider profile
      const { data: profile } = await supabase
        .from('provider_profiles')
        .select('organization_id, id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const activities: ActivityItem[] = [];

      // Fetch recent appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id, scheduled_date, status, appointment_type, telehealth_enabled,
          patients (first_name, last_name, email)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(3);

      appointments?.forEach(apt => {
        if (apt.patients) {
          const patient = apt.patients as any;
          activities.push({
            id: `apt-${apt.id}`,
            type: apt.telehealth_enabled ? 'appointment' : 'appointment',
            title: apt.telehealth_enabled ? 'Telehealth consultation' : `${apt.appointment_type} appointment`,
            patient_name: `${patient.first_name} ${patient.last_name}${patient.email?.includes('testpatient.com') ? ' (Test)' : ''}`,
            timestamp: apt.scheduled_date,
            status: apt.status === 'completed' ? 'completed' : 'scheduled',
            details: apt
          });
        }
      });

      // Fetch recent clinical notes
      const { data: notes } = await supabase
        .from('clinical_notes')
        .select(`
          id, created_at, title, note_type, is_signed,
          patients (first_name, last_name, email)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(3);

      notes?.forEach(note => {
        if (note.patients) {
          const patient = note.patients as any;
          activities.push({
            id: `note-${note.id}`,
            type: 'note',
            title: `${note.note_type}: ${note.title}`,
            patient_name: `${patient.first_name} ${patient.last_name}${patient.email?.includes('testpatient.com') ? ' (Test)' : ''}`,
            timestamp: note.created_at,
            status: note.is_signed ? 'signed' : 'draft',
            details: note
          });
        }
      });

      // Fetch recent patients (registrations)
      const { data: newPatients } = await supabase
        .from('patients')
        .select('id, created_at, first_name, last_name, email')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(2);

      newPatients?.forEach(patient => {
        activities.push({
          id: `reg-${patient.id}`,
          type: 'registration',
          title: 'New patient registered',
          patient_name: `${patient.first_name} ${patient.last_name}${patient.email?.includes('testpatient.com') ? ' (Test)' : ''}`,
          timestamp: patient.created_at,
          status: 'new',
          details: patient
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activities.slice(0, 5)); // Show only 5 most recent

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recent activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Video;
      case 'message': return MessageSquare;
      case 'prescription': return Pill;
      case 'record': return FileText;
      case 'registration': return UserPlus;
      case 'note': return FileText;
      default: return Activity;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case 'scheduled': return <Badge variant="default">Scheduled</Badge>;
      case 'signed': return <Badge variant="outline" className="text-blue-600 border-blue-600">Signed</Badge>;
      case 'draft': return <Badge variant="outline" className="text-orange-600 border-orange-600">Draft</Badge>;
      case 'new': return <Badge variant="outline" className="text-primary border-primary">New</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return time.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <p className="font-medium">No recent activity</p>
                <p className="text-sm mt-1">Activity will appear here as you use the system</p>
              </div>
            </div>
          ) : (
            activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">Patient: {activity.patient_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};