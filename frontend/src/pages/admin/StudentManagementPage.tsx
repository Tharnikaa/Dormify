import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { StudentProfile, BOYS_HOSTELS, GIRLS_HOSTELS } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Search, Filter, ChevronLeft, ChevronRight, Building, Edit3, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const StudentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [hostel, setHostel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [search, department, hostel, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/students?search=${search}&department=${department}&hostel=${hostel}&page=${page}&limit=10`);
      setStudents(res.data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search & Filter Toolbar */}
      <div className="swiss-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Roll Number, Name or Email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-select"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: '180px' }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Aeronautical Engineering">Aeronautical Engineering</option>
            <option value="Automobile Engineering">Automobile Engineering</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
            <option value="Production Technology">Production Technology</option>
          </select>

          {/* Filter by Hostel Dropdown */}
          <select
            className="form-select"
            value={hostel}
            onChange={(e) => {
              setHostel(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: '180px', fontWeight: 600 }}
          >
            <option value="">All Hostels</option>
            <optgroup label="👦 Boys Hostels">
              {BOYS_HOSTELS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="👧 Girls Hostels">
              {GIRLS_HOSTELS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Student Directory Data Table */}
      <div className="swiss-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="card-title">Institutional Student Directory</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Manage student registrations, hostel allocations, and administrative reassignments.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/admin/batch-shifting')}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
            >
              <Sparkles size={14} /> Batch Hostel Shifting
            </button>
            <span className="status-badge badge-AVAILABLE" style={{ fontSize: '11px' }}>
              <ShieldCheck size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Hostel Reassignment: Admin Authority Only
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Fetching student records...
          </div>
        ) : (
          <table className="swiss-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Assigned Hostel</th>
                <th>Admission Quota</th>
                <th>Gender</th>
                <th>Fee Status</th>
                <th>Application Lifecycle</th>
                <th>Allotted Room</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const app = student.applications?.[0];
                const feeStatus = app?.feeReceipt?.status || 'PENDING';
                const alloc = app?.allocation;
                const roomInfo = alloc?.bed?.room?.roomNumber
                  ? `Room ${alloc.bed.room.roomNumber} (${alloc.bed.bedNumber})`
                  : 'Unallocated';

                const hostelDisplay = student.preferredHostel || (student.gender === 'FEMALE' ? 'RAJAM_NRI' : 'ORCHID');

                return (
                  <tr key={student.id}>
                    <td><strong>{student.rollNumber}</strong></td>
                    <td>{student.user?.name}</td>
                    <td>{student.department}</td>
                    <td>
                      <span className="status-badge badge-AVAILABLE" style={{ fontWeight: 700 }}>
                        <Building size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                        {hostelDisplay}
                      </span>
                    </td>
                    <td><span className="status-badge badge-PENDING">{student.quota || 'TNEA'}</span></td>
                    <td>{student.gender}</td>
                    <td><StatusBadge status={feeStatus} /></td>
                    <td><StatusBadge status={app?.status || 'REGISTERED'} /></td>
                    <td>
                      <span className={`status-badge ${alloc ? 'badge-AVAILABLE' : 'badge-OCCUPIED'}`}>
                        {roomInfo}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px' }}
                        onClick={() => navigate(`/admin/students/${student.id}/change-hostel`)}
                      >
                        <Edit3 size={12} /> Change Hostel
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
