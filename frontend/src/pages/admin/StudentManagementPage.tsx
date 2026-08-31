import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentProfile } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [search, department, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/students?search=${search}&department=${department}&page=${page}&limit=10`);
      setStudents(res.data);
      setTotalPages(res.meta.totalPages || 1);
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
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        </div>
      </div>

      {/* Student Directory Data Table */}
      <div className="swiss-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }} className="card-title">
          Institutional Student Directory
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
                <th>Hostel Plan</th>
                <th>Admission Quota</th>
                <th>Gender</th>
                <th>Fee Status</th>
                <th>Application Lifecycle</th>
                <th>Allotted Room</th>
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

                return (
                  <tr key={student.id}>
                    <td><strong>{student.rollNumber}</strong></td>
                    <td>{student.user?.name}</td>
                    <td>{student.department}</td>
                    <td><span className="status-badge badge-AVAILABLE">{student.hostelType ? student.hostelType.replace(/_/g, ' ') : 'STANDARD NON AC'}</span></td>
                    <td><span className="status-badge badge-PENDING">{student.quota || 'TNEA'}</span></td>
                    <td>{student.gender}</td>
                    <td><StatusBadge status={feeStatus} /></td>
                    <td><StatusBadge status={app?.status || 'REGISTERED'} /></td>
                    <td>
                      <span className={`status-badge ${alloc ? 'badge-AVAILABLE' : 'badge-OCCUPIED'}`}>
                        {roomInfo}
                      </span>
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
