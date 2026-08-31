import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { BOYS_HOSTELS, GIRLS_HOSTELS, getHostelFee, isSpecialHostel } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { ArrowLeft, Users, Building, AlertCircle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export const BatchHostelShiftingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [yearOfStudy, setYearOfStudy] = useState<string>('1');
  const [gender, setGender] = useState<string>('MALE');
  const [fromHostel, setFromHostel] = useState<string>('');
  const [toHostel, setToHostel] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [fetchingCount, setFetchingCount] = useState(false);

  const availableDestHostels = gender === 'FEMALE' ? GIRLS_HOSTELS : BOYS_HOSTELS;

  useEffect(() => {
    if (availableDestHostels.length > 0) {
      const defaultTo = availableDestHostels.find((h) => h.id !== fromHostel)?.id || availableDestHostels[0].id;
      setToHostel(defaultTo);
    }
  }, [gender, fromHostel]);

  useEffect(() => {
    fetchMatchingStudentCount();
  }, [yearOfStudy, gender, fromHostel, department]);

  const fetchMatchingStudentCount = async () => {
    setFetchingCount(true);
    try {
      const res: any = await api.get(
        `/students?limit=1000${yearOfStudy ? `&yearOfStudy=${yearOfStudy}` : ''}${gender ? `&gender=${gender}` : ''}${fromHostel ? `&hostel=${fromHostel}` : ''}${department ? `&department=${department}` : ''}`
      );
      setStudentCount(res.data?.length || 0);
    } catch (err) {
      setStudentCount(0);
    } finally {
      setFetchingCount(false);
    }
  };

  const handleExecuteBatchShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toHostel) {
      showToast('Please select a destination hostel', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to shift all matching students (${studentCount || 0} students) to ${toHostel}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res: any = await api.post('/students/batch-shift', {
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy, 10) : undefined,
        gender,
        fromHostel: fromHostel || undefined,
        toHostel,
        department: department || undefined,
        reason,
      });

      const shifted = res.data?.shiftedCount || 0;
      showToast(`Batch Shifting Complete: Successfully shifted ${shifted} students to ${toHostel}!`, 'success');
      navigate('/admin/students');
    } catch (err: any) {
      showToast(err.message || 'Batch shifting failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedYearNum = parseInt(yearOfStudy, 10) || 1;
  const yearText = selectedYearNum === 1 ? '1st Year (Odd Sem)' : `${selectedYearNum}nd/3rd/Final Year`;
  const destHostelObj = availableDestHostels.find((h) => h.id === toHostel) || availableDestHostels[0];
  const destFee = getHostelFee(selectedYearNum, toHostel);

  const isShiftToSpecial = isSpecialHostel(toHostel) !== 'GENERAL';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header & Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/admin/students')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Back to Institutional Directory
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={24} color="var(--primary-color)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Institutional Batch Hostel Shifting
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Relocate entire academic year batches or specific cohorts between MIT hostel residences with automatic fee adjustment.
        </p>
      </div>

      <form onSubmit={handleExecuteBatchShift}>
        {/* Source Cohort Selection */}
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} /> Step 1: Define Target Student Cohort
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">Academic Year Group</label>
              <select
                className="form-select"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                style={{ fontWeight: 700 }}
              >
                <option value="1">1st Year (Odd Semester)</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">Final Year (4th Year)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Student Gender Wing</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ fontWeight: 700 }}
              >
                <option value="MALE">👨 Male (Boys Hostels)</option>
                <option value="FEMALE">👩 Female (Girls Hostels)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Current / Source Hostel (Optional)</label>
              <select
                className="form-select"
                value={fromHostel}
                onChange={(e) => setFromHostel(e.target.value)}
              >
                <option value="">All Current Hostels</option>
                {availableDestHostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Department Filter (Optional)</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                <option value="Automobile Engineering">Automobile Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Production Technology">Production Technology</option>
              </select>
            </div>
          </div>

          {/* Cohort Count Badge */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600 }}>
              Cohort Size Matching Criteria:{' '}
              <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '15px' }}>
                {fetchingCount ? 'Scanning records...' : `${studentCount ?? 0} Students`}
              </span>
            </div>
            <span className="status-badge badge-AVAILABLE" style={{ fontSize: '11px' }}>
              {yearText}
            </span>
          </div>
        </div>

        {/* Destination Hostel Selection & Fee Breakdown */}
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} /> Step 2: Select Target Destination Residence
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Destination Hostel Complex</label>
            <select
              className="form-select"
              value={toHostel}
              onChange={(e) => setToHostel(e.target.value)}
              style={{ fontSize: '15px', fontWeight: 800, padding: '12px 16px' }}
              required
            >
              {availableDestHostels.map((h) => {
                const feeVal = getHostelFee(selectedYearNum, h.id);
                return (
                  <option key={h.id} value={h.id}>
                    {h.name} — Institutional Rate: ₹{feeVal.toLocaleString('en-IN')} ({yearText})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Institutional Fee Policy Preview */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-medium)',
              padding: '16px 20px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              🏛️ MIT Institutional Fee Settlement Rules
            </div>

            {isShiftToSpecial ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#B06000' }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <strong>Differential Fee Upgrade:</strong> Shifting to <strong>{destHostelObj?.name}</strong> incurs a differential fee upgrade. Each student will receive a notification and a remaining balance invoice on their portal. Their room selection in {destHostelObj?.name} will unlock once the fee receipt is verified.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#137333' }}>
                <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <strong>Zero-Differential General Transfer:</strong> Shifting to standard General Hostels carries identical tariffs (₹{destFee.toLocaleString('en-IN')}). No additional fees will be charged; students will be able to select rooms immediately.
                </div>
              </div>
            )}
          </div>

          {/* Reason / Remarks */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Batch Shifting Authority Order / Remarks</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Annual academic year promotion, hostel maintenance consolidation, batch relocation directive..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

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
            <strong>Important Notice:</strong> Executing this batch shift will update all {studentCount ?? 0} students' preferred hostels, release any previous room bookings, and send instant notifications to their student dashboards.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/students')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !studentCount || studentCount === 0}
              style={{ minWidth: '240px' }}
            >
              {loading ? 'Executing Batch Shift...' : `Shift ${studentCount ?? 0} Students to ${toHostel}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
