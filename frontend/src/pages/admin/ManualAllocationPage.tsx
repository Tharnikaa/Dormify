import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentProfile, Block, Room, Bed } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { BookmarkCheck, ShieldCheck } from 'lucide-react';

export const ManualAllocationPage: React.FC = () => {
  const { showToast } = useNotification();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Selection states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [selectedFloorNum, setSelectedFloorNum] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const studentRes: any = await api.get('/students?limit=100');
      setStudents(studentRes.data);

      const blockRes: any = await api.get('/hostels/blocks');
      setBlocks(blockRes.data);
      if (blockRes.data.length > 0) setSelectedBlockId(blockRes.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedBlockId) {
      fetchFloorPlan(selectedBlockId, selectedFloorNum);
    }
  }, [selectedBlockId, selectedFloorNum]);

  const fetchFloorPlan = async (blockId: string, floorNum: number) => {
    try {
      const res: any = await api.get(`/hostels/floor-plan?blockId=${blockId}&floorNumber=${floorNum}`);
      setRooms(res.data.rooms || []);
    } catch (err) {
      setRooms([]);
    }
  };

  const activeRoom = rooms.find((r) => r.id === selectedRoomId);
  const availableBeds = activeRoom?.beds?.filter((b) => b.status === 'AVAILABLE') || [];

  const handleManualAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBedId || !reason.trim()) {
      showToast('Please select a student, bed, and enter administrative reason.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/allocations/manual', {
        studentId: selectedStudentId,
        bedId: selectedBedId,
        reason,
      });
      showToast('Student manually allocated successfully!', 'success');
      setSelectedStudentId('');
      setSelectedBedId('');
      setReason('');
      fetchInitialData();
    } catch (err: any) {
      showToast(err.message || 'Manual allocation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="swiss-card">
        <div className="card-title" style={{ marginBottom: '20px' }}>Administrative Manual Allocation Override</div>

        <form onSubmit={handleManualAllocate}>
          <div className="form-group">
            <label className="form-label">1. Select Target Student *</label>
            <select
              className="form-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
            >
              <option value="">Select Student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNumber} — {s.user?.name} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">2. Select Hostel Block *</label>
              <select
                className="form-select"
                value={selectedBlockId}
                onChange={(e) => {
                  setSelectedBlockId(e.target.value);
                  setSelectedRoomId('');
                  setSelectedBedId('');
                }}
                required
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Floor Number *</label>
              <select
                className="form-select"
                value={selectedFloorNum}
                onChange={(e) => {
                  setSelectedFloorNum(parseInt(e.target.value, 10));
                  setSelectedRoomId('');
                  setSelectedBedId('');
                }}
              >
                <option value={1}>Floor 1</option>
                <option value={2}>Floor 2</option>
                <option value={3}>Floor 3</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">3. Select Room *</label>
              <select
                className="form-select"
                value={selectedRoomId}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value);
                  setSelectedBedId('');
                }}
                required
              >
                <option value="">Select Room...</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} ({r.availableBeds} beds available)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">4. Select Bed *</label>
              <select
                className="form-select"
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                required
                disabled={!selectedRoomId}
              >
                <option value="">Select Bed...</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bedNumber} ({b.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Administrative Allocation Reason *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Special medical accommodation or warden override"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting || !selectedBedId}>
              <BookmarkCheck size={14} /> {submitting ? 'Allocating...' : 'Confirm Manual Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
