import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  Users, 
  Calendar, 
  Phone, 
  MessageSquare, 
  ArrowUp, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WaitlistEntry {
  id: string;
  patientName: string;
  patientId: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  contactMethod: 'phone' | 'message' | 'email';
  addedDate: Date;
  estimatedWait: string;
}

interface WaitlistManagementProps {
  appointments?: any[];
}

const WaitlistManagement: React.FC<WaitlistManagementProps> = ({ appointments = [] }) => {
  const { toast } = useToast();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([
    {
      id: '1',
      patientName: 'Maria Garcia (Test Patient)',
      patientId: 'p1',
      appointmentType: 'Follow-up',
      preferredDate: '2024-01-15',
      preferredTime: '10:00 AM',
      priority: 'urgent',
      contactMethod: 'phone',
      addedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedWait: '2-3 days',
    },
    {
      id: '2',
      patientName: 'Robert Kim (Test Patient)',
      patientId: 'p2',
      appointmentType: 'Annual Checkup',
      preferredDate: '2024-01-16',
      preferredTime: '2:00 PM',
      priority: 'high',
      contactMethod: 'message',
      addedDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
      estimatedWait: '1 week',
    },
    {
      id: '3',
      patientName: 'Lisa Thompson (Test Patient)',
      patientId: 'p3',
      appointmentType: 'Consultation',
      preferredDate: '2024-01-17',
      preferredTime: '9:00 AM',
      priority: 'normal',
      contactMethod: 'email',
      addedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      estimatedWait: '2 weeks',
    },
  ]);

  const [availableSlots] = useState([
    { date: 'Tomorrow', time: '11:30 AM', reason: 'Cancellation' },
    { date: 'Thursday', time: '3:15 PM', reason: 'No-show' },
    { date: 'Friday', time: '9:45 AM', reason: 'Rescheduled' },
  ]);

  const getPriorityColor = (priority: WaitlistEntry['priority']): "default" | "destructive" | "outline" | "secondary" => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityIcon = (priority: WaitlistEntry['priority']) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getContactIcon = (method: WaitlistEntry['contactMethod']) => {
    switch (method) {
      case 'phone':
        return <Phone className="h-3 w-3" />;
      case 'message':
        return <MessageSquare className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const handleOfferSlot = (waitlistEntryId: string, slotIndex: number) => {
    const entry = waitlist.find(e => e.id === waitlistEntryId);
    const slot = availableSlots[slotIndex];
    
    if (entry && slot) {
      toast({
        title: 'Appointment Offered',
        description: `${entry.patientName} has been offered ${slot.date} at ${slot.time}`,
      });
      
      // Optimistic update - remove from waitlist
      setWaitlist(prev => prev.filter(e => e.id !== waitlistEntryId));
    }
  };

  const handleMovePriority = (entryId: string, direction: 'up' | 'down') => {
    const currentIndex = waitlist.findIndex(e => e.id === entryId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= waitlist.length) return;
    
    const newWaitlist = [...waitlist];
    [newWaitlist[currentIndex], newWaitlist[newIndex]] = [newWaitlist[newIndex], newWaitlist[currentIndex]];
    setWaitlist(newWaitlist);
    
    toast({
      title: 'Priority Updated',
      description: `${waitlist[currentIndex].patientName} moved ${direction} in waitlist`,
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just added';
  };

  return (
    <div className="space-y-6">
      {/* Available Slots Alert */}
      {availableSlots.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <Calendar className="h-4 w-4" />
              Available Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableSlots.map((slot, index) => (
                <div key={index} className="p-3 bg-background rounded-lg border">
                  <div className="font-medium text-sm">{slot.date} - {slot.time}</div>
                  <div className="text-xs text-muted-foreground">{slot.reason}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waitlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Appointment Waitlist ({waitlist.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waitlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No patients on waitlist</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitlist.map((entry, index) => (
                <div key={entry.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleMovePriority(entry.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {entry.patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h4 className="font-medium text-sm">{entry.patientName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {entry.appointmentType} • Prefers {entry.preferredDate} at {entry.preferredTime}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={getPriorityColor(entry.priority)}
                            className="text-xs"
                          >
                            {getPriorityIcon(entry.priority)}
                            {entry.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getContactIcon(entry.contactMethod)}
                            {entry.contactMethod}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Added {formatTimeAgo(entry.addedDate)}
                      </p>
                      <p className="text-xs font-medium">
                        Est. wait: {entry.estimatedWait}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot, slotIndex) => (
                      <Button
                        key={slotIndex}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleOfferSlot(entry.id, slotIndex)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Offer {slot.date} {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistManagement;