import { useState, useRef, useEffect } from 'react';

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function NotificationBell({ notifications = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'relative', background: '#F3F2F5', border: 'none',
        borderRadius: 10, width: 40, height: 40, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#69807E', transition: 'background 0.2s',
      }}>
        <BellIcon />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#c0392b', border: '1.5px solid #fff',
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 320, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(44,58,57,0.14)',
          border: '1px solid rgba(147,151,144,0.15)',
          zIndex: 100, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, fontSize: 14, color: '#2C2C2C' }}>Notifications</p>
            {unread > 0 && <span style={{ fontSize: 11, color: '#69807E', fontFamily: 'Raleway, sans-serif', cursor: 'pointer' }}>Tout marquer lu</span>}
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#939790', fontFamily: 'Raleway, sans-serif', fontSize: 13 }}>
                Aucune notification
              </div>
            ) : notifications.map((n, i) => (
              <div key={i} style={{
                padding: '14px 20px', borderBottom: '1px solid #F3F2F5',
                backgroundColor: n.read ? '#fff' : '#F8FAFB',
                cursor: 'pointer', transition: 'background 0.15s',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50', marginTop: 5, flexShrink: 0,
                    backgroundColor: n.read ? 'transparent' : '#69807E',
                  }} />
                  <div>
                    <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#2C2C2C', marginBottom: 2 }}>{n.message}</p>
                    <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#939790' }}>{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}