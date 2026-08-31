import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/audit-logs?action=${actionFilter}&page=${page}&limit=15`);
      setLogs(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="swiss-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="form-label" style={{ marginBottom: 0 }}>Filter Action:</span>
          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="FEE_SUBMITTED">FEE_SUBMITTED</option>
            <option value="FEE_APPROVED">FEE_APPROVED</option>
            <option value="FEE_REJECTED">FEE_REJECTED</option>
            <option value="ALLOCATION_CREATED">ALLOCATION_CREATED</option>
            <option value="ROOM_STATUS_CHANGED">ROOM_STATUS_CHANGED</option>
            <option value="ROOM_CREATED">ROOM_CREATED</option>
          </select>
        </div>
      </div>

      <div className="swiss-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }} className="card-title">
          Immutable System Audit Trail
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs recorded.</div>
        ) : (
          <table className="swiss-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Target Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td><strong>{log.actor?.name || 'System'}</strong> ({log.actor?.email})</td>
                  <td><span className="brand-badge">{log.actor?.role}</span></td>
                  <td><strong>{log.action}</strong></td>
                  <td>{log.targetType}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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
