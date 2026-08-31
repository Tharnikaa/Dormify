import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloorMap } from '../../components/floorplan/FloorMap';
import { api } from '../../services/api';
import { Application } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AlertCircle } from 'lucide-react';

export const RoomSelectionPage: React.FC = () => {
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

  const isFeeApproved = application?.feeReceipt?.status === 'APPROVED';

  if (!isFeeApproved) {
    return (
      <div className="swiss-card" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#991B1B" style={{ marginBottom: '12px' }} />
        <div style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
          Fee Receipt Verification Required
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 20px auto' }}>
          You must submit an official hostel fee receipt and receive administrative approval before unlocking interactive room selection.
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/student/fee-upload')}>
          Go to Fee Verification Page
        </button>
      </div>
    );
  }

  return (
    <div>
      <FloorMap onBedAllocated={() => navigate('/student/allocation-letter')} />
    </div>
  );
};
