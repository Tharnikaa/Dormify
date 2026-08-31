import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Application, getHostelPreferenceDetails } from '../../types';
import { Timeline } from '../../components/common/Timeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ArrowRight, FileCheck, Building2, CheckCircle2, User, Home, Sparkles, AlertCircle } from 'lucide-react';

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
  const student = user?.studentProfile;
  const yearOfStudy = student?.yearOfStudy || 1;
  const preferredHostel = student?.preferredHostel || (student?.gender === 'FEMALE' ? 'RAJAM_NRI' : 'ORCHID');
  const hostelDetails = getHostelPreferenceDetails(student?.gender || 'MALE', preferredHostel, yearOfStudy);
  const remainingDue = student?.remainingFeeDue || 0;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="swiss-card" style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Welcome, {user?.name}
            </div>
            <div style={{ fontSize: '12px', color: '#AAAAAA', marginTop: '4px' }}>
              Roll Number: <strong>{student?.rollNumber || 'N/A'}</strong> | Department: {student?.department} | Level: {yearOfStudy === 1 ? '1st Year' : `${yearOfStudy}th Year`}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: 700 }}>
            🏛️ {hostelDetails.name} ({hostelDetails.feeFormatted})
          </div>
        </div>
      </div>

      {/* Reassignment & Remaining Fee Alert Banner */}
      {remainingDue > 0 && (
        <div style={{ background: '#FEF7E0', border: '1px solid #F9AB00', padding: '16px 20px', borderRadius: '4px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} color="#B06000" />
            <div>
              <div style={{ fontWeight: 800, color: '#B06000', fontSize: '14px' }}>
                Hostel Reassigned to {hostelDetails.name} • Fee Difference Due: ₹{remainingDue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: '#7A4100', marginTop: '2px' }}>
                Your hostel complex was updated by the Administration. Please submit the payment receipt for the balance to select your room.
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/fee-upload')}>
            Pay & Upload Receipt (₹{remainingDue.toLocaleString('en-IN')}) <ArrowRight size={14} />
          </button>
        </div>
      )}

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

            {(status === 'PROFILE_COMPLETED' || (status as string) === 'FEE_PENDING') && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {remainingDue > 0
                    ? `Your assigned hostel is ${hostelDetails.name}. A remaining balance of ₹${remainingDue.toLocaleString('en-IN')} is due. Please upload your payment receipt for verification.`
                    : `Your student profile is active for ${hostelDetails.name} (Fee: ${hostelDetails.feeFormatted}). Please upload your hostel fee payment receipt to proceed with room selection.`}
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/student/fee-upload')}>
                  <FileCheck size={14} /> Upload Fee Receipt ({remainingDue > 0 ? `₹${remainingDue.toLocaleString('en-IN')}` : hostelDetails.feeFormatted}) <ArrowRight size={14} />
                </button>
              </div>
            )}

            {status === 'FEE_SUBMITTED' && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Fee receipt <strong>{application?.feeReceipt?.receiptNumber}</strong> (₹{application?.feeReceipt?.amount?.toLocaleString('en-IN')}) is currently pending verification by the Hostel Administration. Once approved, room selection in <strong>{hostelDetails.name}</strong> will unlock automatically.
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <StatusBadge status="PENDING" label="Awaiting Admin Verification" />
                </div>
              </div>
            )}

            {(status === 'FEE_VERIFIED' || status === 'ROOM_SELECTION') && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Your fee payment of <strong>₹{application?.feeReceipt?.amount?.toLocaleString('en-IN')}</strong> has been approved! Interactive Hostel Floor Plan & Bed Selection is now active for <strong>{hostelDetails.name}</strong>.
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
            <div className="card-title" style={{ marginBottom: '16px' }}>Hostel Plan & Fee Record</div>
            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <div>Accommodation: <strong>{hostelDetails.name}</strong></div>
              <div>Assigned Fee: <strong>{hostelDetails.feeFormatted}</strong></div>
            </div>
            {application?.feeReceipt ? (
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--border-medium)', paddingTop: '10px' }}>
                <div>Receipt No: <strong>{application.feeReceipt.receiptNumber}</strong></div>
                <div>Amount Paid: <strong>₹{application.feeReceipt.amount.toLocaleString('en-IN')}</strong></div>
                <div>Status: <StatusBadge status={application.feeReceipt.status} /></div>
                {application.feeReceipt.rejectionReason && (
                  <div style={{ color: '#991B1B', marginTop: '4px' }}>
                    Reason: {application.feeReceipt.rejectionReason}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-medium)', paddingTop: '10px' }}>
                No fee receipt uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
