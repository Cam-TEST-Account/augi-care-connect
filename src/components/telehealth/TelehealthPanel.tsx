import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone,
  Monitor,
  Users
} from 'lucide-react';

const upcomingConsults = [
  {
    id: 1,
    patient: 'Emily Rodriguez',
    time: '2:00 PM',
    duration: '30 min',
    type: 'Follow-up',
    avatar: '/placeholder-patient1.jpg'
  },
  {
    id: 2,
    patient: 'Michael Thompson', 
    time: '3:30 PM',
    duration: '45 min',
    type: 'Initial Consultation',
    avatar: '/placeholder-patient2.jpg'
  }
];

export const TelehealthPanel: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Session */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Video className="w-5 h-5 mr-2 text-primary" />
              Telehealth Console
            </span>
            <Badge variant="outline" className="text-success border-success">
              Available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-card p-6 rounded-lg border">
            <div className="text-center">
              <Monitor className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Ready for Consultations</h3>
              <p className="text-muted-foreground mb-6">Your telehealth session is ready. Click below to start your next appointment.</p>
              <div className="flex justify-center space-x-3">
                <Button>
                  <Video className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingConsults.map((consult) => (
              <div key={consult.id} className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={consult.avatar} />
                      <AvatarFallback>{consult.patient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{consult.patient}</h4>
                      <p className="text-sm text-muted-foreground">{consult.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{consult.time}</p>
                    <p className="text-xs text-muted-foreground">{consult.duration}</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Video className="w-3 h-3 mr-1" />
                    Join
                  </Button>
                  <Button size="sm" variant="ghost">
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Video className="w-6 h-6 mb-2" />
              <span className="text-sm">Start Emergency Consult</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Phone className="w-6 h-6 mb-2" />
              <span className="text-sm">Audio Only Call</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Monitor className="w-6 h-6 mb-2" />
              <span className="text-sm">Screen Share</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm">Group Session</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};