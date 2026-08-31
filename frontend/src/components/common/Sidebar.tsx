import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  FileCheck,
  Building2,
  BookmarkCheck,
  FileText,
  History,
  Settings,
  LogOut,
  Bell,
  CheckCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isStudent = user?.role === 'STUDENT';

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">MIT HOSTELS</div>
          <span className="brand-badge">{user?.role || 'ERP'}</span>
        </div>

        <nav className="sidebar-nav">
          {isStudent ? (
            <>
              <NavLink to="/student/dashboard" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} /> Overview
              </NavLink>
              <NavLink to="/student/profile" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserCheck size={16} /> My Profile
              </NavLink>
              <NavLink to="/student/fee-upload" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FileCheck size={16} /> Fee Receipt
              </NavLink>
              <NavLink to="/student/room-selection" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Building2 size={16} /> Floor Map & Rooms
              </NavLink>
              <NavLink to="/student/allocation-letter" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CheckCircle size={16} /> Allocation Letter
              </NavLink>
              <NavLink to="/student/settings" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Settings size={16} /> Account Settings
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} /> Admin Dashboard
              </NavLink>
              <NavLink to="/admin/students" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserCheck size={16} /> Students Directory
              </NavLink>
              <NavLink to="/admin/fee-verification" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FileCheck size={16} /> Fee Verifications
              </NavLink>
              <NavLink to="/admin/hostel-mgmt" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Building2 size={16} /> Hostel Structure
              </NavLink>
              <NavLink to="/admin/manual-allocation" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <BookmarkCheck size={16} /> Manual Allocation
              </NavLink>
              <NavLink to="/admin/reports" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FileText size={16} /> Reports & Analytics
              </NavLink>
              <NavLink to="/admin/audit-logs" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
                <History size={16} /> Audit Logs
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={logout} title="Sign Out" style={{ color: 'var(--text-muted)' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
