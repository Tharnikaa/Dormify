import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { UploadCloud, FileText, CheckCircle2, IndianRupee } from 'lucide-react';

interface ReceiptUploaderProps {
  onSuccess: () => void;
  suggestedAmount?: number;
  hostelTypeName?: string;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  onSuccess,
  suggestedAmount,
  hostelTypeName,
}) => {
  const { showToast } = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [amount, setAmount] = useState(suggestedAmount ? String(suggestedAmount) : '');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (suggestedAmount && !amount) {
      setAmount(String(suggestedAmount));
    }
  }, [suggestedAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !receiptNumber || !amount) {
      showToast('Please fill all fields and select a valid receipt document.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('receiptNumber', receiptNumber);
      formData.append('amount', amount);

      await api.post('/fees/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Fee receipt uploaded successfully!', 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload receipt document.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="swiss-card">
      <div className="card-title" style={{ marginBottom: '16px' }}>Hostel Fee Receipt Submission (INR)</div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Receipt / Transaction Reference Number *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. REC-2026-8892 or UTR/IMPS No."
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Paid Amount in INR (₹) * {hostelTypeName ? `[Assigned: ${hostelTypeName}]` : ''}
            </label>
            <input
              type="number"
              step="1"
              className="form-input"
              placeholder="e.g. 45000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Upload Official Fee Document / Bank Challan (PDF, PNG, JPEG - Max 5MB) *</label>
          <div
            style={{
              border: '2px dashed var(--border-medium)',
              padding: '30px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <UploadCloud size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, fontSize: '13px' }}>
              {file ? file.name : 'Click to select or drag and drop your receipt file here'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Supported formats: .pdf, .jpg, .png (Limit: 5MB)
            </div>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'Uploading Document...' : 'Submit Fee Receipt for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
};
