import React from 'react';
import { ApplicationStatus } from '../../types';

interface TimelineProps {
  currentStatus: ApplicationStatus;
}

const STEPS: { status: ApplicationStatus; label: string }[] = [
  { status: 'PROFILE_COMPLETED', label: '1. Profile Setup' },
  { status: 'FEE_SUBMITTED', label: '2. Fee Upload' },
  { status: 'FEE_VERIFIED', label: '3. Admin Verified' },
  { status: 'ROOM_SELECTION', label: '4. Room Selection' },
  { status: 'ALLOCATED', label: '5. Bed Allocated' },
];

export const Timeline: React.FC<TimelineProps> = ({ currentStatus }) => {
  const getStepIndex = (status: ApplicationStatus) => {
    switch (status) {
      case 'REGISTERED': return 0;
      case 'PROFILE_COMPLETED': return 1;
      case 'FEE_SUBMITTED': return 2;
      case 'FEE_VERIFIED': return 3;
      case 'ROOM_SELECTION': return 4;
      case 'ALLOCATED': return 5;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="swiss-card" style={{ marginBottom: '32px' }}>
      <div className="card-title" style={{ marginBottom: '16px' }}>Hostel Admission Lifecycle Tracker</div>
      <div className="timeline-container">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentIndex > stepNum;
          const isActive = currentIndex === stepNum;

          return (
            <div
              key={step.status}
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-circle">{isCompleted ? '✓' : stepNum}</div>
              <div className="step-label" style={{ fontWeight: isActive ? 800 : 500 }}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
