import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { ToastContainer } from '../components/common/ToastContainer';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path.includes('/student/dashboard')) return 'Student Portal Dashboard';
    if (path.includes('/student/profile')) return 'Student Profile Details';
    if (path.includes('/student/fee-upload')) return 'Hostel Fee Verification';
    if (path.includes('/student/room-selection')) return 'Interactive Floor Plan & Bed Selection';
    if (path.includes('/student/allocation-letter')) return 'Official Allocation Letter';
    if (path.includes('/student/settings')) return 'Account Settings';

    if (path.includes('/admin/dashboard')) return 'Administrative Control Dashboard';
    if (path.includes('/admin/students')) return 'Student Directory Management';
    if (path.includes('/admin/fee-verification')) return 'Hostel Fee Receipt Verifications';
    if (path.includes('/admin/hostel-mgmt')) return 'Hostel Structure & Room Maintenance';
    if (path.includes('/admin/manual-allocation')) return 'Manual Allocation Override';
    if (path.includes('/admin/reports')) return 'Institutional Reports & Analytics';
    if (path.includes('/admin/audit-logs')) return 'Immutable System Audit Logs';

    return 'DORMIFY Hostel ERP System';
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle(location.pathname)} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
