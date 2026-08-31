import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { ShieldCheck, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res: any = await api.post('/auth/login', { email, password });
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
      setEmail('alex.rivera@student.dormify.edu');
      setPassword('Password123!');
    } else if (type === 'admin') {
      setEmail('admin@dormify.edu');
      setPassword('Password123!');
    } else if (type === 'hod') {
      setEmail('hod.cs@dormify.edu');
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
        style={{ maxWidth: '440px', width: '100%', border: '1px solid var(--border-dark)', padding: '36px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            DORMIFY
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
            University Hostel ERP Portal
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="user@dormify.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <LogIn size={14} /> {submitting ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px' }}>
          New student? <Link to="/register" style={{ fontWeight: 700, textDecoration: 'underline' }}>Register Account</Link>
        </div>

        {/* Development Quick Fill Options */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border-medium)', fontSize: '11px' }}>
          <div style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Development Quick Fill:
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickFill('student')}>
              Student
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickFill('admin')}>
              Admin
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickFill('hod')}>
              HOD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
