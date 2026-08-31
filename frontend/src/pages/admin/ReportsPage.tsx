import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Download, FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [occupancyReport, setOccupancyReport] = useState<any[]>([]);
  const [deptReport, setDeptReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [occRes, deptRes]: any[] = await Promise.all([
        api.get('/reports/occupancy'),
        api.get('/reports/departments'),
      ]);
      setOccupancyReport(occRes.data);
      setDeptReport(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Block Code,Block Name,Hostel,Total Rooms,Total Beds,Occupied Beds,Available Beds,Occupancy %\n';
    occupancyReport.forEach((row) => {
      csvContent += `${row.blockCode},"${row.blockName}","${row.hostelName}",${row.totalRooms},${row.totalBeds},${row.occupiedBeds},${row.availableBeds},${row.occupancyPercentage}%\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dormify_Occupancy_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="swiss-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="card-title">Institutional Reports & Analytics</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Generated live from PostgreSQL database metrics.</div>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={14} /> Export Occupancy CSV
        </button>
      </div>

      <div className="swiss-card" style={{ marginBottom: '24px', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }} className="card-title">
          1. Block & Hostel Occupancy Statistics
        </div>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Generating report...</div>
        ) : (
          <table className="swiss-table">
            <thead>
              <tr>
                <th>Block Code</th>
                <th>Block Name</th>
                <th>Hostel Complex</th>
                <th>Total Rooms</th>
                <th>Total Beds</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Occupancy %</th>
              </tr>
            </thead>
            <tbody>
              {occupancyReport.map((row) => (
                <tr key={row.blockId}>
                  <td><strong>{row.blockCode}</strong></td>
                  <td>{row.blockName}</td>
                  <td>{row.hostelName}</td>
                  <td>{row.totalRooms}</td>
                  <td>{row.totalBeds}</td>
                  <td>{row.occupiedBeds}</td>
                  <td>{row.availableBeds}</td>
                  <td>
                    <span className="status-badge badge-PARTIALLY_OCCUPIED">
                      {row.occupancyPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="swiss-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }} className="card-title">
          2. Department-wise Student Allotment Distribution
        </div>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Generating report...</div>
        ) : (
          <table className="swiss-table">
            <thead>
              <tr>
                <th>Academic Department</th>
                <th>Total Registered Students</th>
                <th>Allocated Students</th>
                <th>Unallocated Students</th>
              </tr>
            </thead>
            <tbody>
              {deptReport.map((row) => (
                <tr key={row.department}>
                  <td><strong>{row.department}</strong></td>
                  <td>{row.totalStudents}</td>
                  <td>{row.allocatedStudents}</td>
                  <td>{row.unallocatedStudents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
