import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Brain, Users, Zap } from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  date: string;
  confidence: number;
  reason: string;
  patientPreference?: boolean;
  providerOptimal?: boolean;
}

interface SmartSchedulingProps {
  patientId?: string;
  providerId?: string;
  appointmentType?: string;
}

const SmartScheduling: React.FC<SmartSchedulingProps> = ({
  patientId,
  providerId,
  appointmentType = 'follow-up'
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Mock AI-suggested time slots
  const suggestedSlots: TimeSlot[] = [
    {
      id: '1',
      time: '10:00 AM',
      date: 'Tomorrow',
      confidence: 95,
      reason: 'Patient prefers morning appointments, low clinic volume',
      patientPreference: true,
      providerOptimal: true,
    },
    {
      id: '2',
      time: '2:30 PM',
      date: 'Thursday',
      confidence: 88,
      reason: 'Optimal follow-up timing based on treatment plan',
      providerOptimal: true,
    },
    {
      id: '3',
      time: '9:15 AM',
      date: 'Friday',
      confidence: 82,
      reason: 'Early slot available, matches patient history',
      patientPreference: true,
    },
    {
      id: '4',
      time: '3:45 PM',
      date: 'Monday',
      confidence: 75,
      reason: 'Next available slot with preferred provider',
    },
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 80) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return 'default';
    if (confidence >= 80) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Suggested Optimal Times
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on patient preferences, provider schedule, and clinic efficiency
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedSlots.map((slot) => (
          <div
            key={slot.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedSlot === slot.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => setSelectedSlot(slot.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{slot.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{slot.time}</span>
                </div>
              </div>
              <Badge 
                variant={getConfidenceBadge(slot.confidence)}
                className={getConfidenceColor(slot.confidence)}
              >
                {slot.confidence}% match
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{slot.reason}</p>
            
            <div className="flex gap-2">
              {slot.patientPreference && (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Patient Preferred
                </Badge>
              )}
              {slot.providerOptimal && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Provider Optimal
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {selectedSlot && (
          <div className="pt-4 border-t">
            <Button className="w-full">
              Schedule Appointment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartScheduling;