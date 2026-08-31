import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotification();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res: any = await api.post('/auth/login', { identifier, password });
      login(res.data.token, res.data.user);
      showToast(`Welcome back, ${res.data.user.name}!`, 'success');

      if (res.data.user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (type: 'student' | 'admin' | 'hod') => {
    if (type === 'student') {
      setIdentifier('2025503598'); // Can log in by Roll Number!
      setPassword('Password123!');
    } else if (type === 'admin') {
      setIdentifier('admin@dormify.edu');
      setPassword('Password123!');
    } else if (type === 'hod') {
      setIdentifier('hod.cs@dormify.edu');
      setPassword('Password123!');
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
        padding: '20px',
      }}
    >
      <div
        className="swiss-card"
        style={{ maxWidth: '460px', width: '100%', border: '1px solid var(--border-dark)', padding: '36px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MADRAS INSTITUTE OF TECHNOLOGY
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
            MIT Hostels Admission & ERP Portal
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">University Roll Number / Email *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2025503598 or student@mitindia.edu"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
            <LogIn size={14} /> {submitting ? 'Authenticating...' : 'Sign In to MIT Hostels'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px' }}>
          New student? <Link to="/register" style={{ fontWeight: 700, textDecoration: 'underline' }}>Register Student Account</Link>
        </div>

        {/* Development Quick Fill Options */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border-medium)', fontSize: '11px' }}>
          <div style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Development Quick Fill:
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickFill('student')}>
              Student (By Roll No)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickFill('admin')}>
              Hostel Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
