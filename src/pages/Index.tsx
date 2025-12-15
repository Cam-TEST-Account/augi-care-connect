import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { PatientList } from '@/components/dashboard/PatientList';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TelehealthPanel } from '@/components/telehealth/TelehealthPanel';
import { ProviderTeam } from '@/components/providers/ProviderTeam';
import { CompliancePanel } from '@/components/compliance/CompliancePanel';
import { useAuth } from '@/hooks/useAuth';
import { getGreetingMessage } from '@/utils/userUtils';
import { useTestDataSeeding } from '@/hooks/useTestDataSeeding';
import { InvitePatientDialog } from '@/components/patients/InvitePatientDialog';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Stethoscope, Clock, Shield } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  
  // Automatically seed test data for new users
  useTestDataSeeding();
  
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="relative p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-border overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-augi-sage rounded-r-full"></div>
          <div className="relative z-10 ml-2 sm:ml-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-augi-forest mb-2">Provider Dashboard</h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">{getGreetingMessage(user)}</p>
            </div>
            <InvitePatientDialog />
          </div>
        </div>

        {/* Augi Benefits Banner */}
        <Card className="bg-augi-cream border-augi-sage/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-augi-forest mb-2">Pre-Appointment Preparation Made Easy</h3>
                <p className="text-sm text-muted-foreground">
                  Ideal for urgent care, concierge PCPs, and therapy practices. 
                  Get complete patient health history before visits.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-augi-forest">
                  <Stethoscope className="w-4 h-4" />
                  <span>Urgent Care</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-augi-forest">
                  <Clock className="w-4 h-4" />
                  <span>Concierge</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-augi-forest">
                  <Shield className="w-4 h-4" />
                  <span>Therapy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <OverviewCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 animate-slide-up">
          {/* Patient List - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <PatientList />
          </div>
          
          {/* Recent Activity - Takes 1 column */}
          <div className="xl:col-span-1">
            <RecentActivity />
          </div>
        </div>

        {/* Telehealth Section */}
        <div className="animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center">
            <div className="w-1 h-5 sm:h-6 bg-augi-sage rounded-full mr-3"></div>
            Telehealth Center
          </h2>
          <TelehealthPanel />
        </div>

        {/* Provider Team & Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-slide-up">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center">
              <div className="w-1 h-5 sm:h-6 bg-augi-sage rounded-full mr-3"></div>
              Care Team
            </h2>
            <ProviderTeam />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center">
              <div className="w-1 h-5 sm:h-6 bg-augi-forest rounded-full mr-3"></div>
              Compliance Dashboard
            </h2>
            <CompliancePanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
