import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText,
  Heart,
  Activity,
  Moon,
  TrendingUp
} from 'lucide-react';
import { BiomarkerTrendsChart } from '@/components/charts/BiomarkerTrendsChart';
import { WearableDataChart } from '@/components/charts/WearableDataChart';
import { PredictiveRiskAnalysis } from '@/components/analysis/PredictiveRiskAnalysis';
import { ProviderTeam } from '@/components/providers/ProviderTeam';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  status: string;
  last_visit_date?: string;
  next_appointment_date?: string;
  mrn?: string;
}

interface PatientCardProps {
  patient: Patient;
  onQuickAction: (patientId: string, action: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onQuickAction }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not scheduled';
    return new Date(dateStr).toLocaleDateString();
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const patientName = `${patient.first_name} ${patient.last_name}`;

  return (
    <Card className="depth-card w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(patient.first_name, patient.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">{patientName}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getRiskBadgeVariant(patient.risk_level)} className="text-xs">
                  {patient.risk_level} Risk
                </Badge>
                <span className="text-sm text-muted-foreground">MRN: {patient.mrn}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onQuickAction(patient.id, 'schedule')}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Schedule
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onQuickAction(patient.id, 'message')}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
            <TabsTrigger value="wearables">Wearables</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Contact Info</h4>
                <div className="space-y-1">
                  {patient.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Appointments</h4>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last Visit:</span>
                    <br />
                    {formatDate(patient.last_visit_date)}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Next Visit:</span>
                    <br />
                    {formatDate(patient.next_appointment_date)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Risk Analysis</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(patient.risk_level).replace('text-', 'bg-')}`} />
                  <span className="text-sm font-medium">Risk Score: {patient.risk_score}/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onQuickAction(patient.id, 'records')}
                className="flex flex-col items-center py-3 h-auto"
              >
                <FileText className="w-5 h-5 mb-1" />
                <span className="text-xs">Records</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onQuickAction(patient.id, 'call')}
                className="flex flex-col items-center py-3 h-auto"
              >
                <Phone className="w-5 h-5 mb-1" />
                <span className="text-xs">Call</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onQuickAction(patient.id, 'email')}
                className="flex flex-col items-center py-3 h-auto"
              >
                <Mail className="w-5 h-5 mb-1" />
                <span className="text-xs">Email</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onQuickAction(patient.id, 'vitals')}
                className="flex flex-col items-center py-3 h-auto"
              >
                <Heart className="w-5 h-5 mb-1" />
                <span className="text-xs">Vitals</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="biomarkers" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Biomarker Trends</h4>
              </div>
              <BiomarkerTrendsChart patientName={patientName} />
            </div>
          </TabsContent>

          <TabsContent value="wearables" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Moon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-blue-900">Sleep</div>
                  <div className="text-xs text-blue-700">7.2 hrs avg</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-green-900">Activity</div>
                  <div className="text-xs text-green-700">8,234 steps</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Heart className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-purple-900">HRV</div>
                  <div className="text-xs text-purple-700">42 ms</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-orange-900">Trends</div>
                  <div className="text-xs text-orange-700">Improving</div>
                </div>
              </div>
              <WearableDataChart patientName={patientName} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="space-y-4">
              <PredictiveRiskAnalysis patientName={patientName} />
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Care Team Collaboration</h4>
                <ProviderTeam />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};