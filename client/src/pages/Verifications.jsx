import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import VerificationQueue from '../components/verification/VerificationQueue';

const Verifications = () => {
  return (
    <DashboardLayout title="Verifications" subtitle="Manage document verification requests">
      <VerificationQueue />
    </DashboardLayout>
  );
};
export default Verifications;
