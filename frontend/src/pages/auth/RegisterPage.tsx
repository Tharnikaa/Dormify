import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { HOSTEL_TYPES, getHostelTypeDetails, ADMISSION_QUOTAS, BOYS_HOSTELS, GIRLS_HOSTELS, getHostelPreferenceDetails } from '../../types';
import { UserPlus, Building, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    hostelType: 'REGULAR_NON_AC',
    quota: 'TNEA',
    preferredHostel: 'ORCHID',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    gender: 'MALE',
    address: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const selectedHostelDetails = getHostelPreferenceDetails(formData.gender, formData.preferredHostel);
  const availableHostels = formData.gender === 'FEMALE' ? GIRLS_HOSTELS : BOYS_HOSTELS;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'gender') {
      const defaultHostel = value === 'FEMALE' ? GIRLS_HOSTELS[0].id : BOYS_HOSTELS[0].id;
      setFormData({ ...formData, gender: value, preferredHostel: defaultHostel });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res: any = await api.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      showToast('Registration successful! Profile and fee allocation initialized.', 'success');
      navigate('/student/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: '30px 20px',
      }}
    >
      <div
        className="swiss-card"
        style={{ maxWidth: '720px', width: '100%', border: '1px solid var(--border-dark)', padding: '36px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MADRAS INSTITUTE OF TECHNOLOGY
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
            MIT Hostels Student Registration & Fee Assignment
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Gmail / Institutional Email *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="e.g. tharnikaa@gmail.com or student@annauniv.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roll / Registration Number *</label>
              <input
                type="text"
                name="rollNumber"
                className="form-input"
                placeholder="e.g. 2025503598"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                <option value="Automobile Engineering">Automobile Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Production Technology">Production Technology</option>
                <option value="Rubber & Plastics Technology">Rubber & Plastics Technology</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Hostel Complex Preference (Based on selected Gender) */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hostel Complex Preference *</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  {formData.gender === 'FEMALE' ? 'Girls Hostels' : 'Boys Hostels'}
                </span>
              </label>
              <select
                name="preferredHostel"
                className="form-select"
                value={formData.preferredHostel}
                onChange={handleChange}
                style={{ fontWeight: 600, fontSize: '13px' }}
                required
              >
                {availableHostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type of Admission Quota Column */}
            <div className="form-group">
              <label className="form-label">Type of Admission Quota *</label>
              <select
                name="quota"
                className="form-select"
                value={formData.quota}
                onChange={handleChange}
                style={{ fontWeight: 600, fontSize: '12px' }}
                required
              >
                {ADMISSION_QUOTAS.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Fee Breakdown Card */}
            <div
              style={{
                gridColumn: 'span 2',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-medium)',
                borderRadius: '4px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Assigned Institutional Fee (INR)
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedHostelDetails.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedHostelDetails.features}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {selectedHostelDetails.feeFormatted}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Term Fee (INR)
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Student Phone</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+91 98401 23456"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guardian Name</label>
              <input
                type="text"
                name="guardianName"
                className="form-input"
                placeholder="Parent / Guardian Name"
                value={formData.guardianName}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={submitting}>
            <UserPlus size={14} /> {submitting ? 'Creating Profile...' : 'Complete Registration & Assign Fee'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px' }}>
          Already registered? <Link to="/login" style={{ fontWeight: 700, textDecoration: 'underline' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};
