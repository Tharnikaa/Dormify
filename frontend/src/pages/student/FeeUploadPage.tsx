import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptUploader } from '../../components/fee/ReceiptUploader';
import { api } from '../../services/api';
import { Application } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const FeeUploadPage: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <div>
      {receipt && (
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div className="card-header-row">
            <div className="card-title">Submitted Receipt Status</div>
            <StatusBadge status={receipt.status} />
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>Receipt Number: <strong>{receipt.receiptNumber}</strong></div>
            <div>Amount Paid: <strong>${receipt.amount}</strong></div>
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
        <ReceiptUploader onSuccess={fetchApplication} />
      )}
    </div>
  );
};
