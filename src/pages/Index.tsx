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

const Index = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="floating-panel p-8 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground rounded-2xl relative overflow-hidden"
             style={{ background: 'var(--gradient-primary)' }}>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-primary-foreground mb-2">Provider Dashboard</h1>
            <p className="text-primary-foreground/90 text-lg">{getGreetingMessage(user)}</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Overview Cards */}
        <OverviewCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          {/* Patient List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <PatientList />
          </div>
          
          {/* Recent Activity - Takes 1 column */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>

        {/* Telehealth Section */}
        <div className="animate-slide-up">
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-glow rounded-full mr-3"></div>
            Telehealth Center
          </h2>
          <TelehealthPanel />
        </div>

        {/* Provider Team & Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-secondary to-secondary/80 rounded-full mr-3"></div>
              Care Team
            </h2>
            <ProviderTeam />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-medical-teal to-medical-blue rounded-full mr-3"></div>
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
