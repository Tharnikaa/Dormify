import React, { useState, useEffect } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { user } = useAuth();
  const { notifications, fetchNotifications, markAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          <Menu size={20} />
        </button>
        <h1 className="page-title-heading">{title}</h1>
      </div>

      <div className="nav-actions">
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#991B1B',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 800,
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '36px',
                right: '0',
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-dark)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 100,
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Notifications</span>
                <span>{unreadCount} Unread</span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px 0', textAlign: 'center' }}>
                  No recent notifications
                </div>
              ) : (
                <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid var(--border-light)',
                        backgroundColor: n.isRead ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{n.message}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          <User size={16} />
          <span>{user?.name}</span>
        </div>
      </div>
    </header>
  );
};
