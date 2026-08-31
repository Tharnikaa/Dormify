import React from 'react';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const displayLabel = label || status.replace('_', ' ');

  return (
    <span className={`status-badge badge-${status}`}>
      ● {displayLabel}
    </span>
  );
};
