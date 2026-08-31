import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Application } from '../../types';
import { Timeline } from '../../components/common/Timeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ArrowRight, FileCheck, Building2, CheckCircle2, User, Home } from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/students/me/application');
      setApplication(res.data);
    } catch (err) {
      console.error('Failed to load application:', err);
    } finally {
      setLoading(false);
    }
  };

  const status = application?.status || 'PROFILE_COMPLETED';
  const feeStatus = application?.feeReceipt?.status || 'NOT_SUBMITTED';
  const allocation = application?.allocation;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="swiss-card" style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Welcome, {user?.name}
        </div>
        <div style={{ fontSize: '12px', color: '#AAAAAA', marginTop: '4px' }}>
          Roll Number: <strong>{user?.studentProfile?.rollNumber || 'N/A'}</strong> | Department: {user?.studentProfile?.department}
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <Timeline currentStatus={status} />

      {/* Primary Action Banner & Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          {/* Action Card based on Lifecycle Stage */}
          <div className="swiss-card">
            <div className="card-header-row">
              <div className="card-title">Current Application Status</div>
              <StatusBadge status={status} />
            </div>

            {status === 'PROFILE_COMPLETED' && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Your student profile is active. To proceed with room selection, please upload your official hostel fee payment receipt for administrative verification.
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/student/fee-upload')}>
                  <FileCheck size={14} /> Upload Fee Receipt <ArrowRight size={14} />
                </button>
              </div>
            )}

            {status === 'FEE_SUBMITTED' && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Fee receipt <strong>{application?.feeReceipt?.receiptNumber}</strong> is currently pending verification by the Hostel Administration. Once approved, room selection will unlock automatically.
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <StatusBadge status="PENDING" label="Awaiting Admin Verification" />
                </div>
              </div>
            )}

            {(status === 'FEE_VERIFIED' || status === 'ROOM_SELECTION') && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Your fee payment of <strong>${application?.feeReceipt?.amount}</strong> has been approved! Interactive Hostel Floor Plan & Bed Selection is now active.
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/student/room-selection')}>
                  <Building2 size={14} /> Proceed to Interactive Room Selection <ArrowRight size={14} />
                </button>
              </div>
            )}

            {status === 'ALLOCATED' && allocation && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Congratulations! Your hostel room allocation is confirmed for Academic Session <strong>{application?.academicYear?.name}</strong>.
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '16px', border: '1px solid var(--border-medium)', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Home size={18} /> Room {allocation.bed?.room?.roomNumber} — Bed {allocation.bed?.bedNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Hostel: <strong>{allocation.bed?.room?.floor?.block?.hostel?.name}</strong> | Block: {allocation.bed?.room?.floor?.block?.name} | Floor: {allocation.bed?.room?.floor?.name}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => navigate('/student/allocation-letter')}>
                  <CheckCircle2 size={14} /> Download Official Allocation Letter <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Roommate Information (if allocated) */}
          {status === 'ALLOCATED' && allocation && (
            <div className="swiss-card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Roommate Information</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Your room has a total capacity of {allocation.bed?.room?.capacity} beds.
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Fee & Academic Quick Overview */}
        <div>
          <div className="swiss-card">
            <div className="card-title" style={{ marginBottom: '16px' }}>Fee Receipt Record</div>
            {application?.feeReceipt ? (
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>Receipt No: <strong>{application.feeReceipt.receiptNumber}</strong></div>
                <div>Amount: <strong>${application.feeReceipt.amount}</strong></div>
                <div>Status: <StatusBadge status={application.feeReceipt.status} /></div>
                {application.feeReceipt.rejectionReason && (
                  <div style={{ color: '#991B1B', marginTop: '4px' }}>
                    Reason: {application.feeReceipt.rejectionReason}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No fee receipt uploaded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
