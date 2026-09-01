import React, { useState, useEffect } from 'react';
import { Hostel, Block, Floor, Room } from '../../types';
import { api } from '../../services/api';
import { RoomCard } from './RoomCard';
import { BedGridModal } from './BedGridModal';
import { Building, Layers, Compass, Grid, LayoutList, BedDouble, Users, CheckCircle2 } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'corridor' | 'grid'>('corridor');

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
  const isVaigai = (activeBlock?.name || '').toUpperCase().includes('VAIGAI') || (activeBlock?.code || '').toUpperCase().includes('VAIGAI');
  const isPonni = (activeBlock?.name || '').toUpperCase().includes('PONNI') || (activeBlock?.code || '').toUpperCase().includes('PONNI');
  const isCauvery = (activeBlock?.name || '').toUpperCase().includes('CAUVERY') || (activeBlock?.code || '').toUpperCase().includes('CAUVERY') || (activeBlock?.name || '').toUpperCase().includes('KAVERI');

  // Calculate live occupancy stats
  const rooms = currentFloor?.rooms || [];
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, r) => acc + (r.capacity || r.beds?.length || 0), 0);
  const availableBeds = rooms.reduce((acc, r) => acc + (r.availableBeds || 0), 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupiedBeds || 0), 0);
  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Opposite facing room distribution (for Vaigai / corridor)
  const midpoint = Math.ceil(totalRooms / 2);
  const wingARooms = rooms.slice(0, midpoint);
  const wingBRooms = rooms.slice(midpoint);

  // Rectangular Quadrangle 4-wing distribution (for Ponni 29 rooms)
  // North (1-8 = 8 rooms), East (9-15 = 7 rooms), South (16-23 = 8 rooms), West (24-29 = 6 rooms)
  const northWing = rooms.slice(0, 8);
  const eastWing = rooms.slice(8, 15);
  const southWing = rooms.slice(15, 23);
  const westWing = rooms.slice(23, 29);

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
                  const targetId = e.target.value;
                  setSelectedBlockId(targetId);
                  const blk = blocks.find((b) => b.id === targetId);
                  const firstFloor = blk?.floors?.[0]?.floorNumber ?? 1;
                  setSelectedFloorNum(firstFloor);
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
              {(activeBlock?.floors || [{ floorNumber: 1, name: 'Floor 1' }]).map((flr) => {
                const fNum = flr.floorNumber;
                const fLabel = flr.name || (fNum === 0 ? 'Ground Floor' : `Floor ${fNum}`);
                return (
                  <button
                    key={fNum}
                    className={`btn btn-sm ${selectedFloorNum === fNum ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedFloorNum(fNum)}
                  >
                    {fLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* View Mode & Gender Residence Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
            {isPonni ? (
              <button
                className={`btn btn-sm ${viewMode === 'corridor' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none', padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setViewMode('corridor')}
              >
                <Compass size={13} style={{ marginRight: '4px' }} /> Rectangular Quad View
              </button>
            ) : (
              <button
                className={`btn btn-sm ${viewMode === 'corridor' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none', padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setViewMode('corridor')}
              >
                <Compass size={13} style={{ marginRight: '4px' }} /> Opposite Corridor View
              </button>
            )}
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '4px 10px', fontSize: '11px' }}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={13} style={{ marginRight: '4px' }} /> Grid View
            </button>
          </div>

          {user?.role === 'STUDENT' && (
            <span className="status-badge badge-AVAILABLE" style={{ padding: '6px 12px', fontSize: '11px' }}>
              {studentGender === 'FEMALE' ? '👩 Girls Wing' : '👨 Boys Wing'}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Floor Plan Architectural Visualizer */}
      <div className="swiss-card">
        <div className="card-header-row">
          <div>
            <div className="card-title">
              {activeBlock?.name || 'Hostel Block'} — {currentFloor?.name || `Floor ${selectedFloorNum}`} Architectural Floor Plan
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isPonni
                ? `Ponni Residence ${currentFloor?.name || `Floor ${selectedFloorNum}`} has 29 rectangular quad rooms (4 girls/room: Beds A, B, C, D — Capacity: 116 beds/floor) surrounding the central courtyard.`
                : isCauvery
                ? `Cauvery Residence ${currentFloor?.name || `Floor ${selectedFloorNum}`} has 29 four-sharing rooms (4 occupants/room: Beds A, B, C, D — 4 Floors Total: Ground to 3rd, Capacity: 116 beds/floor, 464 beds total).`
                : isVaigai
                ? `Vaigai Residence Floor ${selectedFloorNum} has 27 five-sharing rooms (5 beds each: A, B, C, D, E — Capacity: 135 beds/floor) facing opposite each other across the central hallway.`
                : 'Real-time room availability grid. Click on an available room to inspect bed layouts and confirm allocation.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', alignItems: 'center' }}>
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

        {/* Real-Time Floor Metrics Ribbon */}
        {rooms.length > 0 && (
          <div className="corridor-stats-bar">
            <div className="corridor-stat-item">
              <Building size={14} color="var(--text-secondary)" />
              <span>Rooms on Floor: <strong>{totalRooms}</strong></span>
            </div>
            <div className="corridor-stat-item">
              <BedDouble size={14} color="var(--text-secondary)" />
              <span>Total Capacity: <strong>{totalBeds} Beds (4 Girls / Room)</strong></span>
            </div>
            <div className="corridor-stat-item">
              <CheckCircle2 size={14} color="#137333" />
              <span>Available: <strong style={{ color: '#137333' }}>{availableBeds} Beds</strong></span>
            </div>
            <div className="corridor-stat-item">
              <Users size={14} color="var(--text-secondary)" />
              <span>Occupied: <strong>{occupiedBeds} Beds ({occupancyPercent}%)</strong></span>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading floor plan architecture...
          </div>
        ) : !currentFloor || !currentFloor.rooms || currentFloor.rooms.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No rooms configured on {currentFloor?.name || `Floor ${selectedFloorNum}`} of this block.
          </div>
        ) : isPonni && viewMode === 'corridor' ? (
          /* Ponni Rectangular Quadrangle Courtyard Layout */
          <div className="quad-container">
            {/* 1. North Wing (Top Edge: Rooms 1 - 8) */}
            <div className="quad-wing-block">
              <div className="quad-wing-title">
                <span>🏢 North Wing (Rooms 1 – 8) • Facing Central Courtyard</span>
                <span className="status-badge badge-AVAILABLE" style={{ fontSize: '10px' }}>
                  {northWing.filter((r) => r.status === 'AVAILABLE' || r.status === 'PARTIALLY_OCCUPIED').length} Available
                </span>
              </div>
              <div className="corridor-wing-grid">
                {northWing.map((room) => (
                  <div key={room.id}>
                    <RoomCard room={room} onSelect={(r) => setActiveRoom(r)} />
                    <div className="door-facing-indicator door-down">
                      🚪 Courtyard Entry ↓
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Middle Row: West Wing + Central Open Courtyard Garden + East Wing */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr minmax(200px, 1fr)', gap: '16px', margin: '20px 0', alignItems: 'center' }}>
              {/* West Wing (Left: Rooms 24 - 29) */}
              <div>
                <div className="quad-wing-title">
                  <span>🏢 West Wing (24–29)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {westWing.map((room) => (
                    <div key={room.id}>
                      <RoomCard room={room} onSelect={(r) => setActiveRoom(r)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Central Landscaped Quadrangle Courtyard */}
              <div className="quad-courtyard-card">
                <div className="quad-courtyard-title">
                  🌿 CENTRAL OPEN COURTYARD & GARDEN QUAD
                </div>
                <div className="quad-courtyard-subtitle">
                  Rectangular 4-wing perimeter enclosure with landscaped central lawn, paved circulation veranda, and 4 corner stairwell towers.
                </div>
                <div className="quad-courtyard-features">
                  <span className="quad-feature-chip">🚶 Walkway Veranda</span>
                  <span className="quad-feature-chip">🌳 Garden & Lawn</span>
                  <span className="quad-feature-chip">🛗 Corner Lift Lobby</span>
                  <span className="quad-feature-chip">🚪 North / South Main Entrances</span>
                </div>
              </div>

              {/* East Wing (Right: Rooms 9 - 15) */}
              <div>
                <div className="quad-wing-title">
                  <span>🏢 East Wing (9–15)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {eastWing.map((room) => (
                    <div key={room.id}>
                      <RoomCard room={room} onSelect={(r) => setActiveRoom(r)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. South Wing (Bottom Edge: Rooms 16 - 23) */}
            <div className="quad-wing-block">
              <div className="quad-wing-title">
                <span>🏢 South Wing (Rooms 16 – 23) • Facing Central Courtyard</span>
                <span className="status-badge badge-AVAILABLE" style={{ fontSize: '10px' }}>
                  {southWing.filter((r) => r.status === 'AVAILABLE' || r.status === 'PARTIALLY_OCCUPIED').length} Available
                </span>
              </div>
              <div className="corridor-wing-grid">
                {southWing.map((room) => (
                  <div key={room.id}>
                    <div className="door-facing-indicator door-up">
                      🚪 Courtyard Entry ↑
                    </div>
                    <RoomCard room={room} onSelect={(r) => setActiveRoom(r)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'corridor' ? (
          /* Opposite Facing Dual-Wing Corridor Architectural Layout */
          <div className="corridor-container">
            {/* Wing A: North Facing Wing */}
            <div>
              <div className="corridor-wing-header">
                <span>🏢 Wing A / North Row (Rooms 1 – {midpoint}) • Facing Central Hallway</span>
                <span className="status-badge badge-AVAILABLE" style={{ fontSize: '10px' }}>
                  {wingARooms.filter((r) => r.status === 'AVAILABLE' || r.status === 'PARTIALLY_OCCUPIED').length} Available
                </span>
              </div>
              <div className="corridor-wing-grid">
                {wingARooms.map((room) => (
                  <div key={room.id}>
                    <RoomCard room={room} onSelect={(r) => setActiveRoom(r)} />
                    <div className="door-facing-indicator door-down">
                      🚪 Entry Door ↓ (Facing Hallway)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Central Circulation Spine / Corridor */}
            <div className="corridor-spine">
              <div className="corridor-spine-badge">
                ⬅ West Staircase & Lift Lobby
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={14} />
                <span>══ 3.0M CENTRAL VENTILATED CORRIDOR (CIRCULATION SPINE) ══</span>
              </div>
              <div className="corridor-spine-badge">
                Restroom Block & Emergency Exit ➡
              </div>
            </div>

            {/* Wing B: South Facing Wing */}
            <div>
              <div className="corridor-wing-header">
                <span>🏢 Wing B / South Row (Rooms {midpoint + 1} – {totalRooms}) • Facing Central Hallway</span>
                <span className="status-badge badge-AVAILABLE" style={{ fontSize: '10px' }}>
                  {wingBRooms.filter((r) => r.status === 'AVAILABLE' || r.status === 'PARTIALLY_OCCUPIED').length} Available
                </span>
              </div>
              <div className="corridor-wing-grid">
                {wingBRooms.map((room) => (
                  <div key={room.id}>
                    <div className="door-facing-indicator door-up">
                      🚪 Entry Door ↑ (Facing Hallway)
                    </div>
                    <RoomCard room={room} onSelect={(r) => setActiveRoom(r)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Room Grid View */
          <div className="room-grid" style={{ marginTop: '16px' }}>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onSelect={(r) => setActiveRoom(r)} />
            ))}
          </div>
        )}
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
