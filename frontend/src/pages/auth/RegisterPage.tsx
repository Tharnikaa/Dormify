import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: 'Computer Science',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    gender: 'MALE',
    address: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res: any = await api.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      showToast('Registration successful! Profile initialized.', 'success');
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
        style={{ maxWidth: '640px', width: '100%', border: '1px solid var(--border-dark)', padding: '36px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MADRAS INSTITUTE OF TECHNOLOGY
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
            MIT Hostels Student Registration
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
              <label className="form-label">Institutional Email *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="jane.doe@student.dormify.edu"
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
                placeholder="STU2026099"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Student Phone</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+1 (555) 000-0000"
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={submitting}>
            <UserPlus size={14} /> {submitting ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px' }}>
          Already registered? <Link to="/login" style={{ fontWeight: 700, textDecoration: 'underline' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};
