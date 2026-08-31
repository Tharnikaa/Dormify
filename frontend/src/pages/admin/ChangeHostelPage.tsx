import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { StudentProfile, BOYS_HOSTELS, GIRLS_HOSTELS, calculateFeeDifference, getHostelFee } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { ArrowLeft, Building, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, User, DollarSign, Calendar } from 'lucide-react';

export const ChangeHostelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetHostel, setTargetHostel] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/students/${id}/details`);
      const data: StudentProfile = res.data;
      setStudent(data);

      const available = data.gender === 'FEMALE' ? GIRLS_HOSTELS : BOYS_HOSTELS;
      const initial = available.find((h) => h.id !== data.preferredHostel)?.id || available[0].id;
      setTargetHostel(initial);
    } catch (err: any) {
      showToast(err.message || 'Failed to load student details', 'error');
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !targetHostel) return;

    setSaving(true);
    try {
      const res: any = await api.put(`/students/${student.id}/change-hostel`, {
        preferredHostel: targetHostel,
        reason,
      });

      const diff = res.data?.feeDifference;
      if (diff && diff.remainingDue > 0) {
        showToast(
          `Hostel shifted to ${targetHostel}! Remaining balance due of ₹${diff.remainingDue.toLocaleString('en-IN')} assigned to student.`,
          'info'
        );
      } else {
        showToast(`Hostel successfully reassigned to ${targetHostel} with no fee difference!`, 'success');
      }

      navigate('/admin/students');
    } catch (err: any) {
      showToast(err.message || 'Failed to reassign hostel', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading student administrative profile...
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const isFemale = student.gender === 'FEMALE';
  const availableHostels = isFemale ? GIRLS_HOSTELS : BOYS_HOSTELS;
  const currentHostelId = student.preferredHostel || availableHostels[0].id;
  const currentHostelObj = availableHostels.find((h) => h.id === currentHostelId) || availableHostels[0];
  const targetHostelObj = availableHostels.find((h) => h.id === targetHostel) || availableHostels[0];

  const yearOfStudy = student.yearOfStudy || 1;
  const yearLabels = ['1st Year (Odd Sem)', '2nd Year', '3rd Year', 'Final Year'];
  const yearText = yearLabels[yearOfStudy - 1] || `${yearOfStudy}th Year`;

  const feeDiff = calculateFeeDifference(
    yearOfStudy,
    currentHostelId,
    targetHostel,
    student.totalFeePaid || 0
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Back Navigation & Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/admin/students')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Back to Institutional Directory
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Administrative Hostel Reassignment
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Official institutional re-allocation workflow with automatic MIT fee recalculation and room reset.
        </p>
      </div>

      <form onSubmit={handleApplyReassignment}>
        {/* Student Profile Overview Card */}
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div className="card-header-row" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} color="var(--primary-color)" />
              <div style={{ fontWeight: 800, fontSize: '15px' }}>
                {student.user?.name} ({student.rollNumber})
              </div>
            </div>
            <span className="status-badge badge-COED" style={{ fontWeight: 700 }}>
              {student.gender} • {yearText}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{student.department}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admission Quota</div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{student.quota || 'TNEA'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Assigned Hostel</div>
              <div style={{ fontWeight: 800, fontSize: '13px', marginTop: '2px', color: '#1A73E8' }}>
                🏛️ {currentHostelObj.name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fee Paid Baseline</div>
              <div style={{ fontWeight: 800, fontSize: '13px', marginTop: '2px', color: '#137333' }}>
                ₹{(student.totalFeePaid || feeDiff.currentFee).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Reassignment Configuration Card */}
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} /> Select Target Destination Hostel
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              New Assigned Hostel Complex ({isFemale ? 'Girls Hostels' : 'Boys Hostels'})
            </label>
            <select
              className="form-select"
              value={targetHostel}
              onChange={(e) => setTargetHostel(e.target.value)}
              style={{ fontSize: '14px', fontWeight: 700, padding: '12px 16px' }}
              required
            >
              {availableHostels.map((h) => {
                const feeVal = getHostelFee(yearOfStudy, h.id);
                return (
                  <option key={h.id} value={h.id}>
                    {h.name} — Institutional Rate: ₹{feeVal.toLocaleString('en-IN')} ({yearText})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Comparative Fee Calculation Panel */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-medium)',
              padding: '20px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              📊 Official MIT Fee Difference Calculation ({yearText})
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '160px', background: '#fff', padding: '12px 16px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PREVIOUS HOSTEL</div>
                <div style={{ fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>{currentHostelObj.name}</div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                  Fee: ₹{feeDiff.currentFee.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={22} color="var(--text-muted)" />
              </div>

              <div style={{ flex: 1, minWidth: '160px', background: '#fff', padding: '12px 16px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NEW TARGET HOSTEL</div>
                <div style={{ fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>{targetHostelObj.name}</div>
                <div style={{ fontSize: '12px', color: '#1A73E8', fontWeight: 700, marginTop: '4px' }}>
                  Fee: ₹{feeDiff.newFee.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Fee Settlement Outcome */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              {feeDiff.remainingDue > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#FEF7E0',
                    border: '1px solid #F9AB00',
                    borderRadius: '4px',
                  }}
                >
                  <AlertCircle size={24} color="#B06000" />
                  <div>
                    <div style={{ fontWeight: 800, color: '#B06000', fontSize: '14px' }}>
                      Fee Difference Applicable: ₹{feeDiff.remainingDue.toLocaleString('en-IN')} Balance Due
                    </div>
                    <div style={{ fontSize: '12px', color: '#7A4100', marginTop: '2px' }}>
                      The student will be prompted on their dashboard to pay and upload a receipt for the remaining balance. Room selection in {targetHostelObj.name} will unlock upon receipt verification.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#E6F4EA',
                    border: '1px solid #34A853',
                    borderRadius: '4px',
                  }}
                >
                  <CheckCircle2 size={24} color="#137333" />
                  <div>
                    <div style={{ fontWeight: 800, color: '#137333', fontSize: '14px' }}>
                      No Additional Fee Due (₹0 Difference)
                    </div>
                    <div style={{ fontSize: '12px', color: '#0D5223', marginTop: '2px' }}>
                      Shifting between standard General Hostels carries identical institutional tariffs. The student can proceed directly to select their room in {targetHostelObj.name}.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reason / Remarks */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Administrative Reason / Office Remarks</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Special academic accommodation, department quota transfer, administrative consolidation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Notice of Room De-allocation */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg-subtle)',
              borderLeft: '3px solid var(--accent-red)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
            }}
          >
            <ShieldAlert size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            <strong>Institutional Safety Guarantee:</strong> Changing the assigned hostel will automatically release any currently occupied room in the previous hostel ({currentHostelObj.name}) so the student can select a room in {targetHostelObj.name}.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/students')}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || currentHostelId === targetHostel}
              style={{ minWidth: '220px' }}
            >
              {saving ? 'Processing Reassignment...' : 'Confirm Hostel Reassignment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
