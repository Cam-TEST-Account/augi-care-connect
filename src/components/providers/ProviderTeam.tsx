import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  UserPlus,
  Shield,
  Stethoscope,
  Brain
} from 'lucide-react';
import augiLogo from '@/assets/augi-logo.png';

const teamMembers = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    role: 'Cardiologist',
    specialty: 'Lead Provider',
    status: 'online',
    patients: 247,
    avatar: '/placeholder-dr1.jpg',
    icon: Stethoscope
  },
  {
    id: 2,
    name: 'Dr. Michael Rodriguez',
    role: 'Neurologist',
    specialty: 'Consulting',
    status: 'in-appointment',
    patients: 156,
    avatar: '/placeholder-dr2.jpg',
    icon: Brain
  },
  {
    id: 3,
    name: 'Dr. Emily Park',
    role: 'Internal Medicine',
    specialty: 'Primary Care',
    status: 'offline',
    patients: 203,
    avatar: '/placeholder-dr3.jpg',
    icon: Stethoscope
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'online': return <Badge variant="outline" className="text-success border-success">Online</Badge>;
    case 'in-appointment': return <Badge variant="outline" className="text-warning border-warning">In Session</Badge>;
    case 'offline': return <Badge variant="secondary">Offline</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export const ProviderTeam: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Care Team
          </span>
          <Button size="sm" variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-4 border border-border rounded-lg bg-gradient-card hover:shadow-soft transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-full">
                      {member.id === 1 ? (
                        <img src={augiLogo} alt="Augi" className="w-3 h-3" />
                      ) : (
                        <member.icon className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(member.status)}
                      <Badge variant="outline">{member.patients} patients</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={member.status === 'offline'}>
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-accent/30 rounded-lg border border-accent">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">HIPAA Compliance</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All team communications are encrypted and audit-logged for compliance. 
            Patient access permissions are managed through role-based controls.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};