import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
      }}
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: isError ? '#991B1B' : isSuccess ? '#111111' : '#1F2937',
              color: '#FFFFFF',
              border: '1px solid #000000',
              borderRadius: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {isError ? <AlertCircle size={16} /> : isSuccess ? <CheckCircle2 size={16} /> : <Info size={16} />}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
