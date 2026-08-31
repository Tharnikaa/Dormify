import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptUploader } from '../../components/fee/ReceiptUploader';
import { api } from '../../services/api';
import { Application, getHostelFee, getHostelPreferenceDetails } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

export const FeeUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const res: any = await api.get('/students/me/application');
      setApplication(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const receipt = application?.feeReceipt;
  const student = user?.studentProfile;
  const yearOfStudy = student?.yearOfStudy || 1;
  const preferredHostel = student?.preferredHostel || (student?.gender === 'FEMALE' ? 'RAJAM_NRI' : 'ORCHID');
  const hostelDetails = getHostelPreferenceDetails(student?.gender || 'MALE', preferredHostel, yearOfStudy);

  const totalFee = getHostelFee(yearOfStudy, preferredHostel);
  const remainingDue = student?.remainingFeeDue || 0;
  const isFeeDifferenceDue = remainingDue > 0;
  const alreadyPaid = (student?.totalFeePaid || 0);

  const suggestedAmount = isFeeDifferenceDue ? remainingDue : totalFee;

  return (
    <div>
      {/* Student Assigned Fee Summary Banner */}
      <div className="swiss-card" style={{ marginBottom: '24px' }}>
        <div className="card-header-row">
          <div className="card-title">Assigned Hostel Accommodation & Fee</div>
          <span className="status-badge badge-AVAILABLE">{hostelDetails.name}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div>Assigned Hostel Complex: <strong>{hostelDetails.name}</strong></div>
            <div style={{ marginTop: '4px', fontSize: '12px' }}>Academic Level: {yearOfStudy === 1 ? '1st Year (Odd Semester)' : `${yearOfStudy}th Year`}</div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>Institutional Rate: ₹{totalFee.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ textAlign: 'right', background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--border-medium)' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
              {isFeeDifferenceDue ? 'Remaining Balance Due' : 'Total Required Amount'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: isFeeDifferenceDue ? '#B06000' : 'var(--text-primary)' }}>
              ₹{suggestedAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Differential Fee Notice if Reassigned */}
        {isFeeDifferenceDue && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: '#FEF7E0', border: '1px solid #F9AB00', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="#B06000" />
            <div style={{ fontSize: '12px', color: '#7A4100' }}>
              <strong>Hostel Upgrade Settlement:</strong> You have previously paid <strong>₹{alreadyPaid.toLocaleString('en-IN')}</strong>. The remaining balance for <strong>{hostelDetails.name}</strong> is <strong>₹{remainingDue.toLocaleString('en-IN')}</strong>. Please upload the receipt for the difference.
            </div>
          </div>
        )}
      </div>

      {receipt && (
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div className="card-header-row">
            <div className="card-title">Submitted Receipt Status</div>
            <StatusBadge status={receipt.status} />
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>Receipt Number: <strong>{receipt.receiptNumber}</strong></div>
            <div>Amount: <strong>₹{receipt.amount.toLocaleString('en-IN')}</strong></div>
            <div>Submitted On: {new Date(receipt.submissionDate).toLocaleString()}</div>
            {receipt.rejectionReason && (
              <div style={{ color: '#991B1B', fontWeight: 600, marginTop: '8px' }}>
                Rejection Reason: "{receipt.rejectionReason}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render uploader if no receipt, or rejected, or remaining difference is due */}
      {(!receipt || receipt.status === 'REJECTED' || isFeeDifferenceDue || (application?.status as string) === 'FEE_PENDING') && (
        <ReceiptUploader
          onSuccess={fetchApplication}
          suggestedAmount={suggestedAmount}
          hostelTypeName={isFeeDifferenceDue ? `${hostelDetails.name} (Remaining Balance)` : hostelDetails.name}
        />
      )}
    </div>
  );
};
