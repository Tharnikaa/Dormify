import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const StudentSettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="swiss-card">
      <div className="card-title" style={{ marginBottom: '20px' }}>Account Settings</div>
      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>Account Email: <strong>{user?.email}</strong></div>
        <div>User Identity: <strong>{user?.name}</strong></div>
        <div>Role: <strong>{user?.role}</strong></div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
          Password resets and security updates are managed by the University IT Helpdesk.
        </div>
      </div>
    </div>
  );
};
