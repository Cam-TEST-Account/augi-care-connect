import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight,
  Video,
  MapPin,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface Appointment {
  id: string;
  scheduled_date: string;
  duration_minutes: number;
  appointment_type: string;
  telehealth_enabled: boolean;
  status: string;
  patients: {
    first_name: string;
    last_name: string;
  };
}

interface AppointmentCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  open,
  onOpenChange
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAppointments();
    }
  }, [open, currentMonth]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current user's provider profile
      const { data: providerProfile, error: profileError } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get start and end of current month
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Fetch appointments for the current month
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_date,
          duration_minutes,
          appointment_type,
          telehealth_enabled,
          status,
          patients!inner (
            first_name,
            last_name
          )
        `)
        .eq('provider_id', providerProfile.id)
        .gte('scheduled_date', monthStart.toISOString())
        .lte('scheduled_date', monthEnd.toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      setAppointments(data as Appointment[] || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.scheduled_date), date)
    );
  };

  const getDayAppointmentCount = (date: Date) => {
    return getAppointmentsForDate(date).length;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Appointment Calendar - {format(currentMonth, 'MMMM yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {eachDayOfInterval({
                    start: startOfMonth(currentMonth),
                    end: endOfMonth(currentMonth)
                  }).map((date) => {
                    const appointmentCount = getDayAppointmentCount(date);
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                      <Button
                        key={date.toISOString()}
                        variant={isSelected ? "default" : "ghost"}
                        className={`h-16 flex flex-col justify-center items-center relative ${
                          isToday ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <span className="text-sm font-medium">
                          {format(date, 'd')}
                        </span>
                        {appointmentCount > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="absolute bottom-1 text-xs px-1 h-4"
                          >
                            {appointmentCount}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Appointments */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-4">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h4>
                
                {loading ? (
                  <p className="text-muted-foreground text-center">Loading...</p>
                ) : selectedDateAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center">No appointments</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {appointment.patients.first_name[0]}{appointment.patients.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {appointment.patients.first_name} {appointment.patients.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.appointment_type}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="flex items-center text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                {format(new Date(appointment.scheduled_date), 'h:mm a')}
                              </span>
                              <span className="flex items-center text-xs text-muted-foreground">
                                {appointment.telehealth_enabled ? (
                                  <Video className="w-3 h-3 mr-1" />
                                ) : (
                                  <MapPin className="w-3 h-3 mr-1" />
                                )}
                                {appointment.telehealth_enabled ? 'Virtual' : 'In-Person'}
                              </span>
                            </div>
                            <Badge 
                              variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                              className="text-xs mt-1"
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total appointments this month: {appointments.length}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};