import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptUploader } from '../../components/fee/ReceiptUploader';
import { api } from '../../services/api';
import { Application, getHostelTypeDetails } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

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
  const hostelType = getHostelTypeDetails(user?.studentProfile?.hostelType);

  return (
    <div>
      {/* Student Assigned Fee Summary Banner */}
      <div className="swiss-card" style={{ marginBottom: '24px' }}>
        <div className="card-header-row">
          <div className="card-title">Assigned Hostel Accommodation & Fee</div>
          <span className="status-badge badge-AVAILABLE">{hostelType.name}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div>Selected Plan: <strong>{hostelType.name}</strong></div>
            <div style={{ marginTop: '4px', fontSize: '12px' }}>{hostelType.description}</div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>Features: {hostelType.features}</div>
          </div>
          <div style={{ textAlign: 'right', background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--border-medium)' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
              Required Amount
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
              {hostelType.feeFormatted}
            </div>
          </div>
        </div>
      </div>

      {receipt && (
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div className="card-header-row">
            <div className="card-title">Submitted Receipt Status</div>
            <StatusBadge status={receipt.status} />
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>Receipt Number: <strong>{receipt.receiptNumber}</strong></div>
            <div>Amount Paid: <strong>₹{receipt.amount.toLocaleString('en-IN')}</strong></div>
            <div>Submitted On: {new Date(receipt.submissionDate).toLocaleString()}</div>
            {receipt.rejectionReason && (
              <div style={{ color: '#991B1B', fontWeight: 600, marginTop: '8px' }}>
                Rejection Reason: "{receipt.rejectionReason}"
              </div>
            )}
          </div>
        </div>
      )}

      {(!receipt || receipt.status === 'REJECTED') && (
        <ReceiptUploader
          onSuccess={fetchApplication}
          suggestedAmount={hostelType.fee}
          hostelTypeName={hostelType.name}
        />
      )}
    </div>
  );
};
