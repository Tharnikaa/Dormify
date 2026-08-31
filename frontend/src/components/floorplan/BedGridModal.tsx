import React, { useState } from 'react';
import { Room, Bed } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { BedDouble, CheckCircle2 } from 'lucide-react';

interface BedGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onConfirmAllocation: (bedId: string) => Promise<void>;
}

export const BedGridModal: React.FC<BedGridModalProps> = ({
  isOpen,
  onClose,
  room,
  onConfirmAllocation,
}) => {
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!room) return null;

  const handleConfirm = async () => {
    if (!selectedBedId) return;
    setSubmitting(true);
    try {
      await onConfirmAllocation(selectedBedId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Room ${room.roomNumber} - Bed Selection`}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Room Type</span>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{room.roomType} Room (Capacity {room.capacity})</div>
          </div>
          <StatusBadge status={room.status} />
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Select an available bed slot below to confirm your hostel allotment. Bed availability is verified atomically upon confirmation.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {room.beds?.map((bed) => {
            const isAvailable = bed.status === 'AVAILABLE';
            const isSelected = selectedBedId === bed.id;
            const activeAlloc = bed.allocations?.[0];
            const occupantName = activeAlloc?.application?.student?.user?.name;

            return (
              <div
                key={bed.id}
                onClick={() => isAvailable && setSelectedBedId(bed.id)}
                style={{
                  border: isSelected
                    ? '2px solid var(--text-primary)'
                    : isAvailable
                    ? '1px solid var(--border-medium)'
                    : '1px solid var(--border-light)',
                  backgroundColor: isSelected
                    ? 'var(--bg-subtle)'
                    : isAvailable
                    ? 'var(--bg-surface)'
                    : 'var(--bg-hover)',
                  padding: '16px',
                  borderRadius: '2px',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  opacity: isAvailable ? 1 : 0.65,
                }}
              >
                <BedDouble size={24} color={isSelected ? '#111111' : isAvailable ? '#137333' : '#777777'} />
                <div style={{ fontWeight: 800, fontSize: '14px' }}>Bed {bed.bedNumber}</div>
                <StatusBadge status={bed.status} />

                {!isAvailable && occupantName && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
                    Occupant: {occupantName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={!selectedBedId || submitting}
        >
          {submitting ? 'Confirming Allocation...' : 'Confirm Bed Allocation'}
        </button>
      </div>
    </Modal>
  );
};
