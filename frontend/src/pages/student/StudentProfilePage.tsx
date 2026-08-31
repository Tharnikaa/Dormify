import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { StudentProfile } from '../../types';
import { UserCheck, Save } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const [profile, setProfile] = useState<StudentProfile | null>(user?.studentProfile || null);

  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    guardianName: profile?.guardianName || '',
    guardianPhone: profile?.guardianPhone || '',
    address: profile?.address || '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.studentProfile) {
      setProfile(user.studentProfile);
      setFormData({
        phone: user.studentProfile.phone || '',
        guardianName: user.studentProfile.guardianName || '',
        guardianPhone: user.studentProfile.guardianPhone || '',
        address: user.studentProfile.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/students/me/profile', formData);
      await refreshUser();
      showToast('Profile details updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="swiss-card">
        <div className="card-title" style={{ marginBottom: '20px' }}>Institutional Student Record</div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={user?.name || ''} disabled style={{ background: 'var(--bg-subtle)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input type="text" className="form-input" value={profile?.rollNumber || ''} disabled style={{ background: 'var(--bg-subtle)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input type="text" className="form-input" value={profile?.department || ''} disabled style={{ background: 'var(--bg-subtle)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <input type="text" className="form-input" value={profile?.gender || ''} disabled style={{ background: 'var(--bg-subtle)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guardian / Parent Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guardian Phone *</label>
              <input
                type="text"
                className="form-input"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Residential Address *</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
