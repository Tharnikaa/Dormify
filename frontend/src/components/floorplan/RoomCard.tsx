import React from 'react';
import { Room } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Users } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect }) => {
  const isSelectable = room.status === 'AVAILABLE' || room.status === 'PARTIALLY_OCCUPIED';

  return (
    <div
      className="room-card"
      onClick={() => isSelectable && onSelect(room)}
      style={{
        opacity: room.status === 'MAINTENANCE' ? 0.6 : 1,
        borderStyle: room.status === 'MAINTENANCE' ? 'dashed' : 'solid',
      }}
    >
      <div className="room-card-header">
        <div className="room-number">Room {room.roomNumber}</div>
        <StatusBadge status={room.status} />
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        Type: <strong>{room.roomType}</strong> (Capacity: {room.capacity})
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
        <Users size={14} />
        <span>
          {room.occupiedBeds || 0} / {room.capacity} Beds Occupied
        </span>
      </div>

      <div className="bed-count-bar">
        {room.beds?.map((bed) => {
          const isAvail = bed.status === 'AVAILABLE';
          return (
            <div key={bed.id} className={`bed-pill ${isAvail ? 'available' : 'occupied'}`}>
              Bed {bed.bedNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};
