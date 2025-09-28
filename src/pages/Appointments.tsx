import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone,
  MapPin,
  Plus,
  Filter,
  Users,
  AlertCircle
} from 'lucide-react';

const appointments = [
  {
    id: 1,
    patient: 'Emily Rodriguez',
    time: '9:00 AM',
    duration: '30 min',
    type: 'Follow-up',
    mode: 'Telehealth',
    status: 'Confirmed',
    avatar: '/placeholder-patient1.jpg',
    reason: 'Diabetes Management'
  },
  {
    id: 2,
    patient: 'Michael Thompson',
    time: '10:30 AM', 
    duration: '45 min',
    type: 'Consultation',
    mode: 'In-Person',
    status: 'Pending',
    avatar: '/placeholder-patient2.jpg',
    reason: 'Cardiac Follow-up'
  },
  {
    id: 3,
    patient: 'Sarah Williams',
    time: '2:00 PM',
    duration: '30 min',
    type: 'Initial Visit',
    mode: 'Telehealth',
    status: 'Confirmed',
    avatar: '/placeholder-patient3.jpg',
    reason: 'New Patient Intake'
  }
];

const AppointmentCard = ({ appointment }: { appointment: typeof appointments[0] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-success/10 text-success border-success';
      case 'Pending': return 'bg-warning/10 text-warning border-warning';
      case 'Cancelled': return 'bg-destructive/10 text-destructive border-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getModeIcon = (mode: string) => {
    return mode === 'Telehealth' ? Video : MapPin;
  };

  const ModeIcon = getModeIcon(appointment.mode);

  return (
    <Card className="hover:shadow-soft transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={appointment.avatar} />
              <AvatarFallback>{appointment.patient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{appointment.patient}</h3>
              <p className="text-sm text-muted-foreground">{appointment.reason}</p>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {appointment.time}
            </span>
            <span className="flex items-center">
              <ModeIcon className="w-4 h-4 mr-1" />
              {appointment.mode}
            </span>
            <span>{appointment.duration}</span>
          </div>
          <div className="flex space-x-2">
            {appointment.mode === 'Telehealth' && (
              <Button size="sm" variant="outline">
                <Video className="w-4 h-4 mr-1" />
                Join
              </Button>
            )}
            <Button size="sm" variant="ghost">Reschedule</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Appointments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">Manage your schedule across all care modalities</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Telehealth</p>
                  <p className="text-2xl font-bold text-foreground">5</p>
                </div>
                <Video className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In-Person</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">2</p>
                </div>
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Views */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4">
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Week View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4 h-96">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="border border-border rounded-lg p-2">
                      <h4 className="font-medium text-center mb-2">{day}</h4>
                      <div className="space-y-2">
                        {day === 'Wed' && (
                          <div className="bg-primary/10 p-2 rounded text-xs">
                            <p className="font-medium">9:00 AM</p>
                            <p>Emily R.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="telehealth" className="space-y-4">
            <div className="space-y-4">
              {appointments.filter(apt => apt.mode === 'Telehealth').map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Calendar Integration</h3>
                <p className="text-muted-foreground">Full calendar view with drag-and-drop scheduling coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;