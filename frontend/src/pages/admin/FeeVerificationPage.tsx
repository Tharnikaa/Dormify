import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FeeReceipt } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReceiptViewerModal } from '../../components/fee/ReceiptViewerModal';
import { useNotification } from '../../context/NotificationContext';
import { Eye, FileCheck } from 'lucide-react';

export const FeeVerificationPage: React.FC = () => {
  const { showToast } = useNotification();
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<FeeReceipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingReceipts();
  }, []);

  const fetchPendingReceipts = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/fees/pending');
      setReceipts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (receiptId: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    try {
      await api.post(`/fees/${receiptId}/verify`, { status, rejectionReason });
      showToast(`Fee receipt ${status.toLowerCase()} successfully!`, 'success');
      fetchPendingReceipts();
    } catch (err: any) {
      showToast(err.message || 'Verification update failed', 'error');
    }
  };

  return (
    <div>
      <div className="swiss-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }} className="card-title">
          Pending Fee Receipts Queue ({receipts.length})
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading queue...</div>
        ) : receipts.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No pending fee receipts awaiting review.
          </div>
        ) : (
          <table className="swiss-table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Claimed Amount</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => {
                const student = r.application?.student;
                return (
                  <tr key={r.id}>
                    <td><strong>{r.receiptNumber}</strong></td>
                    <td>{student?.user?.name}</td>
                    <td>{student?.rollNumber}</td>
                    <td>${r.amount}</td>
                    <td>{new Date(r.submissionDate).toLocaleDateString()}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setActiveReceipt(r)}>
                        <Eye size={14} /> Review Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ReceiptViewerModal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        receipt={activeReceipt}
        onVerify={handleVerify}
      />
    </div>
  );
};
