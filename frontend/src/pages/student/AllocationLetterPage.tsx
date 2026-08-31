import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Allocation } from '../../types';
import { Printer, Download, AlertCircle, CheckCircle } from 'lucide-react';

export const AllocationLetterPage: React.FC = () => {
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocation();
  }, []);

  const fetchAllocation = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/allocations/my-allocation');
      setAllocation(res.data);
    } catch (err) {
      console.error('Failed to load allocation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById('letter-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  if (loading) {
    return <div className="swiss-card">Loading official allocation letter...</div>;
  }

  if (!allocation) {
    return (
      <div className="swiss-card" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
        <div style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
          No Active Room Allocation Found
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          You have not completed room selection for the current academic session yet. Once your room is allocated, your official permit will be generated here.
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  const letterUrl = `/api/allocations/${allocation.id}/letter-html?token=${token || ''}`;

  return (
    <div>
      <div className="swiss-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CheckCircle size={16} color="#0F6826" />
            <div className="card-title">Official Hostel Allocation Permit</div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Reference Code: <strong>{allocation.letterRefCode}</strong> | Academic Session: {allocation.academicYear?.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={14} /> Print Letter
          </button>
          <a
            href={letterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <Download size={14} /> Open Full View / Save
          </a>
        </div>
      </div>

      <div className="swiss-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-dark)' }}>
        <iframe
          id="letter-frame"
          src={letterUrl}
          style={{ width: '100%', height: '880px', border: 'none', background: '#FFFFFF' }}
          title="Official Hostel Allocation Letter"
        />
      </div>
    </div>
  );
};
