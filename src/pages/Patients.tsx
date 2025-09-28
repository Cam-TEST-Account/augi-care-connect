import { EnhancedPatientDashboard } from '@/components/patients/EnhancedPatientDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const Patients = () => {
  return (
    <DashboardLayout>
      <EnhancedPatientDashboard />
    </DashboardLayout>
  );
};

export default Patients;