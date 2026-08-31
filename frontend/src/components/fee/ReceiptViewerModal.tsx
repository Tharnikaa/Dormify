import React, { useState } from 'react';
import { FeeReceipt, getHostelTypeDetails } from '../../types';
import { Modal } from '../common/Modal';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: FeeReceipt | null;
  onVerify: (receiptId: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => Promise<void>;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onVerify,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!receipt) return null;

  const student = receipt.application?.student;
  const user = student?.user;
  const hostelType = getHostelTypeDetails(student?.hostelType);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onVerify(receipt.id, 'APPROVED');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setSubmitting(true);
    try {
      await onVerify(receipt.id, 'REJECTED', rejectionReason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Fee Verification - ${receipt.receiptNumber}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Document Preview */}
        <div style={{ border: '1px solid var(--border-medium)', padding: '16px', background: 'var(--bg-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            Submitted File Document
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Filename: {receipt.originalFilename} ({Math.round(receipt.fileSize / 1024)} KB)
          </div>
          <a
            href={receipt.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            <FileText size={14} /> Open Document File
          </a>
        </div>

        {/* Student & Receipt Info */}
        <div style={{ fontSize: '12px' }}>
          <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Student Details</div>
          <div style={{ marginBottom: '4px' }}>Name: <strong>{user?.name}</strong></div>
          <div style={{ marginBottom: '4px' }}>Roll No: <strong>{student?.rollNumber}</strong></div>
          <div style={{ marginBottom: '4px' }}>Department: {student?.department}</div>
          <div style={{ marginBottom: '4px' }}>
            Hostel Plan: <strong style={{ color: 'var(--text-primary)' }}>{hostelType.name}</strong> ({hostelType.feeFormatted})
          </div>
          <div style={{ marginBottom: '16px' }}>Submitted: {new Date(receipt.submissionDate).toLocaleString()}</div>

          <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Claimed Payment</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px' }}>
            ₹{receipt.amount.toLocaleString('en-IN')}
          </div>

          {showRejectBox && (
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Mandatory Rejection Reason *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Receipt image blurry or amount mismatch"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '20px' }}>
        {!showRejectBox ? (
          <>
            <button className="btn btn-danger" onClick={() => setShowRejectBox(true)} disabled={submitting}>
              <XCircle size={14} /> Reject Receipt
            </button>
            <button className="btn btn-primary" onClick={handleApprove} disabled={submitting}>
              <CheckCircle2 size={14} /> Approve Receipt
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={() => setShowRejectBox(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleReject} disabled={!rejectionReason.trim() || submitting}>
              Confirm Rejection
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
