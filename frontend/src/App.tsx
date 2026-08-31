import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './layouts/AppLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { FeeUploadPage } from './pages/student/FeeUploadPage';
import { RoomSelectionPage } from './pages/student/RoomSelectionPage';
import { AllocationLetterPage } from './pages/student/AllocationLetterPage';
import { StudentSettingsPage } from './pages/student/StudentSettingsPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StudentManagementPage } from './pages/admin/StudentManagementPage';
import { FeeVerificationPage } from './pages/admin/FeeVerificationPage';
import { HostelManagementPage } from './pages/admin/HostelManagementPage';
import { ManualAllocationPage } from './pages/admin/ManualAllocationPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Authenticating user session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/admin/dashboard'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Student Portal */}
              <Route path="/student/dashboard" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboardPage /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute roles={['STUDENT']}><StudentProfilePage /></ProtectedRoute>} />
              <Route path="/student/fee-upload" element={<ProtectedRoute roles={['STUDENT']}><FeeUploadPage /></ProtectedRoute>} />
              <Route path="/student/room-selection" element={<ProtectedRoute roles={['STUDENT']}><RoomSelectionPage /></ProtectedRoute>} />
              <Route path="/student/allocation-letter" element={<ProtectedRoute roles={['STUDENT']}><AllocationLetterPage /></ProtectedRoute>} />
              <Route path="/student/settings" element={<ProtectedRoute roles={['STUDENT']}><StudentSettingsPage /></ProtectedRoute>} />

              {/* Admin Portal */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN', 'HOD']}><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute roles={['ADMIN', 'HOD']}><StudentManagementPage /></ProtectedRoute>} />
              <Route path="/admin/fee-verification" element={<ProtectedRoute roles={['ADMIN', 'HOD']}><FeeVerificationPage /></ProtectedRoute>} />
              <Route path="/admin/hostel-mgmt" element={<ProtectedRoute roles={['ADMIN', 'HOD']}><HostelManagementPage /></ProtectedRoute>} />
              <Route path="/admin/manual-allocation" element={<ProtectedRoute roles={['ADMIN', 'HOD']}><ManualAllocationPage /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute roles={['ADMIN', 'HOD']}><ReportsPage /></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['ADMIN', 'HOD']}><AuditLogsPage /></ProtectedRoute>} />
            </Route>

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
