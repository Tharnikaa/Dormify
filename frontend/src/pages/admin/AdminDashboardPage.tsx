import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminDashboardStats } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, FileCheck, Bed, Percent, AlertCircle } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="swiss-card">Calculating live database statistics...</div>;
  }

  return (
    <div>
      {/* Top Banner */}
      <div className="swiss-card" style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ADMINISTRATIVE CONTROL DASHBOARD
        </div>
        <div style={{ fontSize: '12px', color: '#AAAAAA', marginTop: '4px' }}>
          Active Academic Session: <strong>{stats?.activeAcademicYear}</strong> | Real-time Database Metrics
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Registered Students</div>
          <div className="stat-value">{stats?.totalStudents || 0}</div>
          <div className="stat-sub">{stats?.verifiedStudents} Fee Verified</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Verification</div>
          <div className="stat-value" style={{ color: stats?.pendingVerification ? '#B06000' : 'var(--text-primary)' }}>
            {stats?.pendingVerification || 0}
          </div>
          <div className="stat-sub">Receipts awaiting review</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Hostel Occupancy Rate</div>
          <div className="stat-value">{stats?.occupancyPercentage}%</div>
          <div className="stat-sub">
            {stats?.occupiedBeds} / {stats?.totalBeds} Beds Occupied
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Available Beds</div>
          <div className="stat-value" style={{ color: '#137333' }}>
            {stats?.availableBeds || 0}
          </div>
          <div className="stat-sub">Ready for allotment</div>
        </div>
      </div>

      {/* Block Breakdown Table & Recent Allocations Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="swiss-card">
          <div className="card-title" style={{ marginBottom: '16px' }}>Block-wise Occupancy Breakdown</div>
          <table className="swiss-table">
            <thead>
              <tr>
                <th>Block Name</th>
                <th>Total Beds</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Occupancy %</th>
              </tr>
            </thead>
            <tbody>
              {stats?.blockMetrics.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.name}</strong></td>
                  <td>{b.totalBeds}</td>
                  <td>{b.occupiedBeds}</td>
                  <td>{b.availableBeds}</td>
                  <td>
                    <span className="status-badge badge-PARTIALLY_OCCUPIED">
                      {b.occupancyRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="swiss-card">
          <div className="card-title" style={{ marginBottom: '16px' }}>Recent Room Allocations</div>
          {stats?.recentAllocations.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No recent room allocations recorded.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats?.recentAllocations.map((alloc) => (
                <div key={alloc.id} style={{ padding: '12px', border: '1px solid var(--border-light)', fontSize: '12px' }}>
                  <div style={{ fontWeight: 700 }}>
                    {alloc.application?.student?.user?.name} ({alloc.application?.student?.rollNumber})
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Room {alloc.bed?.room?.roomNumber} - Bed {alloc.bed?.bedNumber} ({alloc.bed?.room?.floor?.block?.name})
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Mode: {alloc.allocatedBy} | Date: {new Date(alloc.allocationDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
