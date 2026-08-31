import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Hostel, Block, Floor, Room } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Building, Plus, Wrench, ShieldAlert } from 'lucide-react';

export const HostelManagementPage: React.FC = () => {
  const { showToast } = useNotification();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // Form for new room
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('2');
  const [newRoomType, setNewRoomType] = useState('DOUBLE');

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/hostels');
      setHostels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRoomStatus = async (roomId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    try {
      await api.patch(`/hostels/rooms/${roomId}/status`, { status: nextStatus });
      showToast(`Room status updated to ${nextStatus}`, 'success');
      fetchHostels();
    } catch (err: any) {
      showToast(err.message || 'Failed to update room status', 'error');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFloorId || !newRoomNumber) return;

    try {
      await api.post('/hostels/rooms', {
        floorId: selectedFloorId,
        roomNumber: newRoomNumber,
        capacity: parseInt(newCapacity, 10),
        roomType: newRoomType,
      });
      showToast('Room created successfully!', 'success');
      setShowAddRoomModal(false);
      fetchHostels();
    } catch (err: any) {
      showToast(err.message || 'Failed to create room', 'error');
    }
  };

  return (
    <div>
      <div className="swiss-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="card-title">Hostel Infrastructure & Room Manager</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Manage hostel blocks, floors, rooms, and bed statuses.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddRoomModal(true)}>
          <Plus size={14} /> Add New Room
        </button>
      </div>

      {loading ? (
        <div className="swiss-card">Loading hostel structure...</div>
      ) : (
        hostels.map((h) => (
          <div key={h.id} className="swiss-card" style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>
              {h.name} ({h.code}) — {h.gender} Complex
            </div>

            {h.blocks?.map((b) => (
              <div key={b.id} style={{ marginBottom: '20px', borderLeft: '3px solid var(--border-dark)', paddingLeft: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>{b.name}</div>

                {b.floors?.map((f) => (
                  <div key={f.id} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {f.name} ({f.rooms?.length} Rooms)
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {f.rooms?.map((r) => (
                        <div key={r.id} style={{ border: '1px solid var(--border-medium)', padding: '12px', background: 'var(--bg-surface)', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <strong>Room {r.roomNumber}</strong>
                            <StatusBadge status={r.status} />
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Type: {r.roomType} (Cap: {r.capacity})</div>
                          <div style={{ marginTop: '10px' }}>
                            <button
                              className={`btn btn-sm ${r.status === 'MAINTENANCE' ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => handleToggleRoomStatus(r.id, r.status)}
                              style={{ width: '100%' }}
                            >
                              <Wrench size={12} /> {r.status === 'MAINTENANCE' ? 'Set Available' : 'Set Maintenance'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))
      )}

      {/* Add Room Modal */}
      <Modal isOpen={showAddRoomModal} onClose={() => setShowAddRoomModal(false)} title="Create New Hostel Room">
        <form onSubmit={handleCreateRoom}>
          <div className="form-group">
            <label className="form-label">Target Floor *</label>
            <select className="form-select" value={selectedFloorId} onChange={(e) => setSelectedFloorId(e.target.value)} required>
              <option value="">Select Floor...</option>
              {hostels.flatMap((h) =>
                h.blocks?.flatMap((b) =>
                  b.floors?.map((f) => (
                    <option key={f.id} value={f.id}>
                      {h.code} - {b.name} - {f.name}
                    </option>
                  ))
                )
              )}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input type="text" className="form-input" placeholder="A-108" value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Room Capacity *</label>
              <select className="form-select" value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)}>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4 Beds</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Room Type</label>
            <select className="form-select" value={newRoomType} onChange={(e) => setNewRoomType(e.target.value)}>
              <option value="SINGLE">Single Room</option>
              <option value="DOUBLE">Double Shared</option>
              <option value="TRIPLE">Triple Shared</option>
              <option value="QUAD">Quad Shared</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddRoomModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Room & Beds</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
