import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { PatientList } from '@/components/dashboard/PatientList';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TelehealthPanel } from '@/components/telehealth/TelehealthPanel';
import { ProviderTeam } from '@/components/providers/ProviderTeam';
import { CompliancePanel } from '@/components/compliance/CompliancePanel';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Provider Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Chen. Here's your patient overview.</p>
        </div>

        {/* Overview Cards */}
        <OverviewCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Telehealth Center</h2>
          <TelehealthPanel />
        </div>

        {/* Provider Team & Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Care Team</h2>
            <ProviderTeam />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Compliance Dashboard</h2>
            <CompliancePanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
