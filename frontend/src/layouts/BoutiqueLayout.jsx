import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/common/NotificationBell';
// Notifications fetched per-page, not in layout

const icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  products: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  ai: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z"/><path d="M12 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>,
  notifications: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const NAV_ITEMS = [
  { to: '/boutique/dashboard', label: 'Dashboard', icon: icons.dashboard },
  { to: '/boutique/products', label: 'Produits', icon: icons.products },
  { to: '/boutique/orders', label: 'Commandes', icon: icons.orders },
  { to: '/boutique/ai-advisor', label: 'AI Advisor', icon: icons.ai },
  { to: '/boutique/notifications', label: 'Notifications', icon: icons.notifications, badge: true },
  { to: '/boutique/settings', label: 'Paramètres', icon: icons.settings },
];

function Sidebar({ open, onClose, unreadCount = 0 }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ display: 'none' }} className="fa-sidebar-overlay" />
      )}
      <aside style={{
        width: 240, minHeight: '100vh', backgroundColor: '#2C3A39',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, transition: 'transform 0.3s ease',
      }} className={`fa-sidebar${open ? '' : ' fa-sidebar-hidden'}`}>

        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, color: '#E3C8B5', letterSpacing: '0.05em' }}>
                FashionAura
              </p>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginTop: 3 }}>
                Ma Boutique
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'none' }} className="fa-sidebar-close">
              {icons.close}
            </button>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ to, label, icon, badge }) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10, marginBottom: 2,
                textDecoration: 'none', transition: 'all 0.2s',
                backgroundColor: isActive ? '#69807E' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              })}>
              {icon}
              <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, fontWeight: 500 }}>{label}</span>
              {badge && unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', backgroundColor: '#E3C8B5', color: '#2C3A39', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 7px', fontFamily: 'Raleway, sans-serif' }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Encart AI Advisor */}
        <div style={{ margin: '0 12px', marginBottom: 12, background: 'rgba(105,128,126,0.2)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(105,128,126,0.3)' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#E3C8B5', fontWeight: 500, marginBottom: 4 }}>✦ AI Advisor</p>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
            Consultez vos recommandations personnalisées
          </p>
        </div>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#E3C8B5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#2C3A39', fontWeight: 500 }}>
              {user?.name?.[0]?.toUpperCase() || 'B'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Boutique owner</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontFamily: 'Raleway, sans-serif', fontSize: 13, transition: 'all 0.2s' }}>
            {icons.logout}
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function Header({ title, subtitle, onMenuToggle, notifications }) {
  const { user } = useAuth();
  return (
    <header style={{ backgroundColor: '#fff', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid rgba(147,151,144,0.12)', boxShadow: '0 1px 8px rgba(44,58,57,0.05)', position: 'sticky', top: 0, zIndex: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onMenuToggle} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#69807E', padding: 4 }} className="fa-menu-btn">
          {icons.menu}
        </button>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, color: '#2C2C2C', lineHeight: 1 }}>{title}</h1>
          {subtitle && <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.05em', marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <NotificationBell notifications={notifications || []} />
        <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#E3C8B5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#2C3A39', fontWeight: 500, cursor: 'pointer' }}>
          {user?.name?.[0]?.toUpperCase() || 'B'}
        </div>
      </div>
    </header>
  );
}

export default function BoutiqueLayout({ title = 'Dashboard', subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // NOTE: notifications are NOT fetched here to avoid any risk of 401 redirect
  // crashing the layout. NotificationsList page handles its own data fetching.
  const notifications = [];
  const unreadCount = 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Raleway:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background-color: #F3F2F5; }
        .fa-layout { display: flex; min-height: 100vh; }
        .fa-sidebar nav a:hover { color: rgba(255,255,255,0.85) !important; background-color: rgba(105,128,126,0.25) !important; }
        .fa-sidebar button:last-child:hover { color: rgba(255,255,255,0.7) !important; background: rgba(255,255,255,0.06) !important; }
        .fa-stats-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(44,58,57,0.12) !important; }
        @keyframes fa-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fa-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fa-animate { animation: fa-fade-in 0.4s ease forwards; }
        @media (max-width: 768px) {
          .fa-sidebar { position: fixed !important; left: 0; top: 0; height: 100vh; z-index: 50; transform: translateX(-100%); }
          .fa-sidebar:not(.fa-sidebar-hidden) { transform: translateX(0) !important; }
          .fa-sidebar-overlay { display: block !important; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
          .fa-sidebar-close { display: block !important; }
          .fa-menu-btn { display: flex !important; }
          header { padding: 0 16px !important; }
          .fa-content { padding: 20px 16px !important; }
        }
      `}</style>
      <div className="fa-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unreadCount} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header title={title} subtitle={subtitle} onMenuToggle={() => setSidebarOpen(o => !o)} notifications={notifications} />
          <main className="fa-content" style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}