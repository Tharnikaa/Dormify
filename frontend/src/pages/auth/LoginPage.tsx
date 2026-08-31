import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { LogIn, GraduationCap, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleTabChange = (tab: 'student' | 'admin') => {
    setActiveTab(tab);
    setRollNumber('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = activeTab === 'student' 
        ? { rollNumber, email, password } 
        : { email, identifier: email, password };

      const res: any = await api.post('/auth/login', payload);
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
      setActiveTab('student');
      setRollNumber('2025503598');
      setEmail('tharnikaa@student.annauniv.edu');
      setPassword('Password123!');
    } else if (type === 'admin') {
      setActiveTab('admin');
      setEmail('admin@dormify.edu');
      setPassword('Password123!');
    } else if (type === 'hod') {
      setActiveTab('admin');
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
        style={{ maxWidth: '480px', width: '100%', border: '1px solid var(--border-dark)', padding: '36px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MADRAS INSTITUTE OF TECHNOLOGY
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
            MIT Hostels Admission & ERP Portal
          </div>
        </div>

        {/* 2-Entry Selection Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: '4px',
            border: '1px solid var(--border-medium)',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('student')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: activeTab === 'student' ? '1px solid var(--border-dark)' : '1px solid transparent',
              background: activeTab === 'student' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'student' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={16} /> Student Entry
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: activeTab === 'admin' ? '1px solid var(--border-dark)' : '1px solid transparent',
              background: activeTab === 'admin' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={16} /> Admin / Office
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'student' ? (
            <>
              {/* Field 1: Roll Number */}
              <div className="form-group">
                <label className="form-label">University Roll Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2025503598"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Field 2: Gmail / Email */}
              <div className="form-group">
                <label className="form-label">Student Gmail / Registered Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. tharnikaa@gmail.com or student@annauniv.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">Official Admin Email ID *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. admin@dormify.edu or warden@mitindia.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Hostel wardens & administrative staff official email
              </div>
            </div>
          )}

          {/* Field 3: Password */}
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
            <LogIn size={14} /> {submitting ? 'Authenticating...' : activeTab === 'student' ? 'Sign In as Student' : 'Sign In as Admin / Office'}
          </button>
        </form>

        {activeTab === 'student' ? (
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px' }}>
            New student? <Link to="/register" style={{ fontWeight: 700, textDecoration: 'underline' }}>Register Student Account</Link>
          </div>
        ) : (
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
            Admin accounts are provisioned and authorized by the Hostel Office.
          </div>
        )}

        {/* Development Quick Fill Options */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border-medium)', fontSize: '11px' }}>
          <div style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Quick Demo Fill:
          </div>
          {activeTab === 'student' ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleQuickFill('student')}>
                <UserCheck size={12} /> Student Demo (2025503598)
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleQuickFill('admin')}>
                <KeyRound size={12} /> Hostel Admin (admin@dormify.edu)
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleQuickFill('hod')}>
                <KeyRound size={12} /> HOD / Warden (hod.cs@dormify.edu)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

