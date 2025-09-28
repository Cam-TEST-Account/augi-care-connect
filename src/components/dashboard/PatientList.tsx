import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  AlertTriangle,
  Video,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const patients = [
  {
    id: 1,
    name: 'Emily Rodriguez (Test Patient)',
    age: 34,
    condition: 'Hypertension',
    riskScore: 'High',
    lastVisit: '2024-01-15',
    nextAppointment: '2024-02-01',
    unreadMessages: 2,
    avatar: '/placeholder-patient1.jpg'
  },
  {
    id: 2,
    name: 'Michael Thompson (Test Patient)',
    age: 56,
    condition: 'Diabetes Type 2',
    riskScore: 'Medium',
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-30',
    unreadMessages: 0,
    avatar: '/placeholder-patient2.jpg'
  },
  {
    id: 3,
    name: 'Sarah Williams (Test Patient)',
    age: 42,
    condition: 'Heart Disease',
    riskScore: 'Critical',
    lastVisit: '2024-01-20',
    nextAppointment: '2024-01-25',
    unreadMessages: 1,
    avatar: '/placeholder-patient3.jpg'
  }
];

const getRiskBadgeVariant = (risk: string) => {
  switch (risk) {
    case 'Critical': return 'destructive';
    case 'High': return 'warning';
    case 'Medium': return 'default';
    default: return 'secondary';
  }
};

export const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewAll = () => {
    navigate('/patients');
  };

  const handleTelehealthCall = (patient: typeof patients[0]) => {
    navigate('/telehealth', { state: { patient } });
    toast({
      title: 'Starting Telehealth Session',
      description: `Connecting with ${patient.name}...`,
    });
  };

  const handleOpenChat = (patient: typeof patients[0]) => {
    navigate('/messages', { state: { selectedPatient: patient } });
    toast({
      title: 'Opening Messages',
      description: `Viewing conversation with ${patient.name}`,
    });
  };

  const handleViewNotes = (patient: typeof patients[0]) => {
    navigate('/records', { state: { selectedPatient: patient } });
    toast({
      title: 'Opening Medical Records',
      description: `Viewing records for ${patient.name}`,
    });
  };

  const handlePatientClick = (patient: typeof patients[0]) => {
    navigate('/patients', { state: { selectedPatient: patient } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Patients</span>
          <Button size="sm" onClick={handleViewAll}>View All</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient) => (
            <div 
              key={patient.id} 
              className="p-4 border border-border rounded-lg bg-gradient-card hover:shadow-soft transition-all cursor-pointer"
              onClick={() => handlePatientClick(patient)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarImage src={patient.avatar} />
                    <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">Age {patient.age} • {patient.condition}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={getRiskBadgeVariant(patient.riskScore) as any}>
                        {patient.riskScore === 'Critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {patient.riskScore} Risk
                      </Badge>
                      {patient.unreadMessages > 0 && (
                        <Badge variant="outline">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {patient.unreadMessages} new
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTelehealthCall(patient);
                    }}
                    title="Start Telehealth Call"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChat(patient);
                    }}
                    title="Open Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewNotes(patient);
                    }}
                    title="View Medical Notes"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Last visit: {patient.lastVisit}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Next: {patient.nextAppointment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};