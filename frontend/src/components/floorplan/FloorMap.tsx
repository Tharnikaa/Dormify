import React, { useState, useEffect } from 'react';
import { Hostel, Block, Floor, Room } from '../../types';
import { api } from '../../services/api';
import { RoomCard } from './RoomCard';
import { BedGridModal } from './BedGridModal';
import { Building, Layers, ShieldCheck, User } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface FloorMapProps {
  onBedAllocated?: () => void;
}

export const FloorMap: React.FC<FloorMapProps> = ({ onBedAllocated }) => {
  const { showToast } = useNotification();
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedFloorNum, setSelectedFloorNum] = useState<number>(1);
  const [currentFloor, setCurrentFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const studentGender = user?.studentProfile?.gender?.toUpperCase();
  const assignedHostel = user?.studentProfile?.preferredHostel;

  useEffect(() => {
    fetchBlocks();
  }, [studentGender, assignedHostel]);

  const fetchBlocks = async () => {
    try {
      const res: any = await api.get('/hostels/blocks');
      let filtered = res.data;

      // Strictly restrict visible hostel blocks to the student's assigned hostel
      if (user?.role === 'STUDENT') {
        if (assignedHostel) {
          const matchCode = assignedHostel.toUpperCase();
          filtered = res.data.filter((b: Block) => {
            const hCode = (b.hostel?.code || '').toUpperCase();
            const bCode = (b.code || '').toUpperCase();
            const hName = (b.hostel?.name || '').toUpperCase();
            const bName = (b.name || '').toUpperCase();
            return (
              hCode === matchCode ||
              bCode === `BLK-${matchCode}` ||
              hName.includes(matchCode) ||
              bName.includes(matchCode)
            );
          });
        } else if (studentGender) {
          filtered = res.data.filter((b: Block) => {
            const bGender = (b.gender || '').toUpperCase();
            const bName = (b.name || '').toUpperCase();

            if (studentGender === 'FEMALE') {
              return bGender === 'FEMALE' || bGender === 'GIRLS' || bName.includes('WOMEN') || bName.includes('GIRLS');
            } else if (studentGender === 'MALE') {
              return bGender === 'MALE' || bGender === 'BOYS' || bName.includes('MEN') || bName.includes('BOYS');
            }
            return true;
          });
        }
      }

      setBlocks(filtered);
      if (filtered.length > 0) {
        setSelectedBlockId(filtered[0].id);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load hostel blocks', 'error');
    }
  };

  useEffect(() => {
    if (selectedBlockId) {
      fetchFloorPlan(selectedBlockId, selectedFloorNum);
    }
  }, [selectedBlockId, selectedFloorNum]);

  const fetchFloorPlan = async (blockId: string, floorNum: number) => {
    setLoading(true);
    try {
      const res: any = await api.get(`/hostels/floor-plan?blockId=${blockId}&floorNumber=${floorNum}`);
      setCurrentFloor(res.data);
    } catch (err: any) {
      setCurrentFloor(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAllocation = async (bedId: string) => {
    try {
      await api.post('/allocations/select-bed', { bedId });
      showToast('Bed allocated successfully!', 'success');
      if (onBedAllocated) onBedAllocated();
      if (selectedBlockId) fetchFloorPlan(selectedBlockId, selectedFloorNum);
    } catch (err: any) {
      showToast(err.message || 'Bed allocation failed', 'error');
    }
  };

  const activeBlock = blocks.find((b) => b.id === selectedBlockId);

  return (
    <div>
      {/* Block & Floor Selector Toolbar */}
      <div className="floor-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* If student has only 1 assigned block, show clean badge, else dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} />
            <span className="form-label" style={{ marginBottom: 0 }}>
              {user?.role === 'STUDENT' ? 'Assigned Hostel:' : 'Select Block:'}
            </span>
            {blocks.length <= 1 ? (
              <span className="status-badge badge-AVAILABLE" style={{ fontWeight: 800, padding: '6px 12px', fontSize: '12px' }}>
                {activeBlock?.name || 'Assigned Hostel'}
              </span>
            ) : (
              <select
                className="form-select"
                value={selectedBlockId}
                onChange={(e) => {
                  setSelectedBlockId(e.target.value);
                  setSelectedFloorNum(1);
                }}
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} />
            <span className="form-label" style={{ marginBottom: 0 }}>Select Floor:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(activeBlock?.floors?.map((f) => f.floorNumber) || [1, 2]).map((fNum) => (
                <button
                  key={fNum}
                  className={`btn btn-sm ${selectedFloorNum === fNum ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedFloorNum(fNum)}
                >
                  Floor {fNum}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gender Residence Badge */}
        {user?.role === 'STUDENT' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-badge badge-AVAILABLE" style={{ padding: '6px 12px', fontSize: '11px' }}>
              {studentGender === 'FEMALE' ? '👩 Girls Hostel Wing Active' : '👨 Boys Hostel Wing Active'}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Floor Plan Architectural Visualizer */}
      <div className="swiss-card">
        <div className="card-header-row">
          <div>
            <div className="card-title">
              {activeBlock?.name || 'Hostel Block'} — Floor {selectedFloorNum} Architectural Map
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Real-time room availability grid. Click on an available room to inspect bed layouts and confirm allocation.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#137333', borderRadius: '50%' }}></span> Available
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#1A73E8', borderRadius: '50%' }}></span> Partial
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#555555', borderRadius: '50%' }}></span> Full
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading floor plan architecture...
          </div>
        ) : !currentFloor || !currentFloor.rooms || currentFloor.rooms.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No rooms configured on Floor {selectedFloorNum} of this block.
          </div>
        ) : (() => {
          const rooms = currentFloor.rooms || [];
          const doubleRooms = rooms.filter((r) => r.roomType === 'DOUBLE');
          const singleRooms = rooms.filter((r) => r.roomType === 'SINGLE');

          return (
            <div>
              {/* Wing 1: Double Occupancy Wing */}
              {doubleRooms.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🏢 Double Occupancy Wing (2 Beds Each)
                    </div>
                    <span className="status-badge badge-AVAILABLE" style={{ fontSize: '10px' }}>
                      {doubleRooms.length} Rooms Available
                    </span>
                  </div>
                  <div className="room-grid">
                    {doubleRooms.map((room) => (
                      <RoomCard key={room.id} room={room} onSelect={(r) => setActiveRoom(r)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Central Corridor Passageway Divider */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  textAlign: 'center',
                  padding: '8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  margin: '24px 0',
                  color: 'var(--text-muted)',
                }}
              >
                ══ CENTRAL CORRIDOR & PASSAGEWAY ══
              </div>

              {/* Wing 2: Single Occupancy Wing */}
              {singleRooms.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🏢 Single Occupancy Wing (1 Bed Each)
                    </div>
                    <span className="status-badge badge-AVAILABLE" style={{ fontSize: '10px' }}>
                      {singleRooms.length} Rooms Available
                    </span>
                  </div>
                  <div className="room-grid">
                    {singleRooms.map((room) => (
                      <RoomCard key={room.id} room={room} onSelect={(r) => setActiveRoom(r)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback standard view if all rooms have other/uniform type */}
              {doubleRooms.length === 0 && singleRooms.length === 0 && (
                <div className="room-grid">
                  {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} onSelect={(r) => setActiveRoom(r)} />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Bed Grid Picker Modal */}
      <BedGridModal
        isOpen={!!activeRoom}
        onClose={() => setActiveRoom(null)}
        room={activeRoom}
        onConfirmAllocation={handleConfirmAllocation}
      />
    </div>
  );
};
