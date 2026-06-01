import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import OnboardingTour from '../components/onboarding/OnboardingTour';
import i18n from '../i18n';

/* ── helpers ───────────────────────────────────────────────── */
const ROUTE_LABELS = {
  '/boutique/dashboard':     'Dashboard',
  '/boutique/produits':      'Produits',
  '/boutique/products':      'Produits',
  '/boutique/commandes':     'Commandes',
  '/boutique/orders':        'Commandes',
  '/boutique/messagerie':    'Messagerie',
  '/boutique/clients':       'Clients',
  '/boutique/avis':          'Avis',
  '/boutique/analytics':     'Analytics',
  '/boutique/notifications': 'Notifications',
  '/boutique/parametres':    'Paramètres',
  '/boutique/settings':      'Paramètres',
  '/boutique/ai-advisor':    'AI Advisor',
};

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
  { code: 'es', label: 'ES' },
];

/* ── Icons ─────────────────────────────────────────────────── */
const Ico = {
  dashboard:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  products:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  orders:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  clients:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  star:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  analytics:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  bell:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  settings:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  help:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  messages:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  posts:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  menu:        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  logout:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  home:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  chevLeft:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  sun:         <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

const NAV_ITEMS = [
  { to: '/boutique/dashboard',     label: 'Dashboard',     icon: 'dashboard' },
  { to: '/boutique/produits',      label: 'Produits',      icon: 'products'  },
  { to: '/boutique/publications',  label: 'Offres spéciales',  icon: 'posts'     },
  { to: '/boutique/commandes',     label: 'Commandes',     icon: 'orders'    },
  { to: '/boutique/messagerie',    label: 'Messagerie',    icon: 'messages'  },
  { to: '/boutique/clients',       label: 'Clients',       icon: 'clients'   },
  { to: '/boutique/avis',          label: 'Avis',          icon: 'star'      },
  { to: '/boutique/analytics',     label: 'Analytics',     icon: 'analytics' },
  { to: '/boutique/notifications', label: 'Notifications', icon: 'bell', badge: true },
  { to: '/boutique/parametres',    label: 'Paramètres',    icon: 'settings'  },
  { to: '/boutique/aide',          label: 'Aide',          icon: 'help'      },
];

/* ── useClickOutside ─────────────────────────────────────── */
function useClickOutside(ref, handler) {
  useEffect(() => {
    const fn = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [ref, handler]);
}

/* ── Sidebar ───────────────────────────────────────────────── */
function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <aside className="fa-boutique-sidebar" style={{
      width: collapsed ? 64 : 240,
      minHeight: '100vh',
      alignSelf: 'stretch',
      backgroundColor: '#1B3A35',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      zIndex: 20,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 68, flexShrink: 0,
      }}>
        {!collapsed ? (
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#C9A84C', margin: 0 }}>FashionAura</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0, marginTop: 2 }}>Ma Boutique</p>
          </div>
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: '#1B3A35' }}>FA</span>
          </div>
        )}
        <button onClick={onToggle} title={collapsed ? 'Développer' : 'Réduire'} style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
          {collapsed ? Ico.chevRight : Ico.chevLeft}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6, marginTop: 2 }}>Menu</p>
        )}
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '9px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 9, marginBottom: 1, textDecoration: 'none', transition: 'all 0.18s',
              backgroundColor: isActive ? '#2A5248' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.52)',
              borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
            })}>
            {Ico[icon]}
            {!collapsed && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>}
          </NavLink>
        ))}

      </nav>

      {/* Retour au site + User + Logout */}
      <div style={{ flexShrink: 0, marginTop: 'auto', backgroundColor: '#1B3A35' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: collapsed ? '8px 0' : '8px 8px' }}>
          <Link
            to="/"
            title="Retour au site"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '9px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 9, textDecoration: 'none', transition: 'all 0.18s',
              color: 'rgba(255,255,255,0.52)',
              borderLeft: '3px solid transparent',
            }}
          >
            {Ico.home}
            {!collapsed && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>Retour au site</span>}
          </Link>
        </div>

      {/* User + Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: collapsed ? '10px 0' : '10px 8px' }}>
        {!collapsed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, marginBottom: 2 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#2A5248', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 13, color: '#C9A84C', fontWeight: 700, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() || 'B'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#fff', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Boutique'}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.38)', margin: 0 }}>Propriétaire</p>
              </div>
            </div>
            <button onClick={handleLogout} className="fa-logout-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.42)', fontFamily: 'Inter, sans-serif', fontSize: 12.5, transition: 'all 0.18s' }}>
              {Ico.logout}
              <span>Déconnexion</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div title={user?.name || 'Boutique'} style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#2A5248', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 13, color: '#C9A84C', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || 'B'}
            </div>
            <button onClick={handleLogout} title="Déconnexion" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.42)', padding: 5, borderRadius: 7 }}>
              {Ico.logout}
            </button>
          </div>
        )}
      </div>
      </div>
    </aside>
  );
}

/* ── Header ────────────────────────────────────────────────── */
function Header({ onMenuToggle, isDark }) {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [lang, setLang] = useState(() => localStorage.getItem('language') || i18n.language || 'fr');
  const [showLang,  setShowLang]  = useState(false);
  const [showBell,  setShowBell]  = useState(false);
  const [showUser,  setShowUser]  = useState(false);

  const langRef = useRef(null);
  const bellRef = useRef(null);
  const userRef = useRef(null);

  useClickOutside(langRef, () => setShowLang(false));
  useClickOutside(bellRef, () => setShowBell(false));
  useClickOutside(userRef, () => setShowUser(false));

  const breadcrumb = ROUTE_LABELS[location.pathname] || 'Dashboard';
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setLang(code);
    localStorage.setItem('language', code);
    document.documentElement.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', code);
    setShowLang(false);
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const mockNotifs = [
    { id: 1, text: 'Nouvelle commande reçue #2058', time: 'Il y a 30min', read: false },
    { id: 2, text: 'Nouveau avis 5 de Amina B.', time: 'Il y a 2h', read: false },
    { id: 3, text: 'Stock faible : Robe Émeraude (3 restants)', time: 'Il y a 5h', read: true },
    { id: 4, text: 'Votre rapport hebdomadaire est prêt', time: 'Hier', read: true },
  ];
  const unreadCount = mockNotifs.filter(n => !n.read).length;

  const bg    = isDark ? '#1A1D27' : '#fff';
  const txt   = isDark ? '#E5E7EB' : '#1F2937';
  const muted = isDark ? '#9CA3AF' : '#6B7280';
  const bdr   = isDark ? '#374151' : 'rgba(0,0,0,0.08)';
  const dropBg = isDark ? '#1F2235' : '#fff';

  const dropStyle = {
    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
    backgroundColor: dropBg, border: `1px solid ${bdr}`,
    borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.14)', zIndex: 200,
  };
  const iconBtn = {
    width: 36, height: 36, borderRadius: '50%',
    border: `1px solid ${bdr}`, backgroundColor: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: txt, transition: 'all 0.18s',
  };

  return (
    <header style={{
      backgroundColor: bg, borderBottom: `1px solid ${bdr}`,
      height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onMenuToggle} style={{ ...iconBtn, display: 'none' }} className="fa-menu-btn">{Ico.menu}</button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: muted }}>Boutique</span>
            <span style={{ color: muted, fontSize: 11 }}>›</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#C9A84C', fontWeight: 600 }}>{breadcrumb}</span>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: muted, margin: 0, textTransform: 'capitalize' }}>{today}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link
          to="/"
          style={{
            ...iconBtn,
            width: 'auto',
            padding: '0 14px',
            borderRadius: 20,
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            gap: 6,
          }}
        >
          {Ico.chevLeft}
          <span className="fa-back-site-label">Retour au site</span>
        </Link>

        {/* Language */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowLang(v => !v); setShowBell(false); setShowUser(false); }} style={{ ...iconBtn, width: 'auto', padding: '0 12px', borderRadius: 20, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, gap: 4 }}>
            {LANGS.find(l => l.code === lang)?.label || 'FR'}
          </button>
          {showLang && (
            <div style={{ ...dropStyle, minWidth: 130, padding: 6 }}>
              {LANGS.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 11px', border: 'none', borderRadius: 8, cursor: 'pointer', backgroundColor: lang === l.code ? (isDark ? 'rgba(201,168,76,0.15)' : '#fef9ed') : 'transparent', fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: lang === l.code ? '#C9A84C' : txt, fontWeight: lang === l.code ? 600 : 400 }}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark/Light */}
        <button onClick={toggleTheme} title={isDark ? 'Mode clair' : 'Mode sombre'} style={iconBtn}>
          {isDark ? Ico.sun : Ico.moon}
        </button>

        {/* Bell */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowBell(v => !v); setShowLang(false); setShowUser(false); }} style={{ ...iconBtn, position: 'relative' }}>
            {Ico.bell}
            {unreadCount > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444', border: `2px solid ${bg}` }} />}
          </button>
          {showBell && (
            <div style={{ ...dropStyle, width: 300 }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 600, color: txt }}>
                  Notifications {unreadCount > 0 && <span style={{ backgroundColor: '#EF4444', color: '#fff', borderRadius: 20, fontSize: 10, padding: '1px 6px', marginLeft: 4 }}>{unreadCount}</span>}
                </span>
                <button style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#1B3A35', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Tout lire</button>
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {mockNotifs.map(n => (
                  <div key={n.id} style={{ padding: '11px 18px', display: 'flex', gap: 10, alignItems: 'flex-start', borderBottom: `1px solid ${bdr}`, backgroundColor: n.read ? 'transparent' : (isDark ? 'rgba(201,168,76,0.06)' : 'rgba(201,168,76,0.05)') }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: n.read ? 'transparent' : '#C9A84C', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: txt, fontWeight: n.read ? 400 : 500, margin: 0 }}>{n.text}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: muted, margin: '2px 0 0' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 18px', textAlign: 'center' }}>
                <a href="/boutique/notifications" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#1B3A35', textDecoration: 'none', fontWeight: 600 }}>Voir toutes →</a>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowUser(v => !v); setShowBell(false); setShowLang(false); }} style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1B3A35', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#C9A84C', fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase() || 'B'}
          </button>
          {showUser && (
            <div style={{ ...dropStyle, width: 200 }}>
              <div style={{ padding: '13px 16px', borderBottom: `1px solid ${bdr}` }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: txt, margin: 0 }}>{user?.name || 'Boutique'}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted, margin: '2px 0 0' }}>Propriétaire</p>
              </div>
              {[{ label: 'Mon Profil', href: '/boutique/parametres' }, { label: 'Paramètres', href: '/boutique/parametres' }].map(item => (
                <a key={item.label} href={item.href} onClick={() => setShowUser(false)} style={{ display: 'block', padding: '10px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: txt, textDecoration: 'none', borderBottom: `1px solid ${bdr}` }}>{item.label}</a>
              ))}
              <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#EF4444', textAlign: 'left' }}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── BoutiqueLayout ────────────────────────────────────────── */
export default function BoutiqueLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('boutique-sidebar-collapsed') === 'true');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const toggle = () => {
    setCollapsed(v => {
      const next = !v;
      localStorage.setItem('boutique-sidebar-collapsed', String(next));
      return next;
    });
  };

  const bg = isDark ? '#0F1117' : '#F5F7FA';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        .fa-logout-btn:hover { color: rgba(255,255,255,0.8) !important; background: rgba(255,255,255,0.07) !important; }
        .fa-stats-card { transition: transform 0.3s ease, box-shadow 0.3s ease !important; }
        .fa-stats-card:hover { transform: translateY(-4px) !important; box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; }
        @keyframes fa-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes fa-fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fa-animate { animation: fa-fade-in 0.38s ease forwards; }
        .fa-table-row:hover { background-color: ${isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB'} !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.14); border-radius: 3px; }
        @media (max-width: 768px) {
          .fa-menu-btn { display: flex !important; }
          .fa-main-content { padding: 20px 16px !important; }
          .fa-boutique-sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            height: 100vh !important;
            min-height: 100vh !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch', backgroundColor: bg }}>
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <Header onMenuToggle={toggle} isDark={isDark} />
          <main className="fa-main-content" style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>
      <OnboardingTour variant="owner" />
    </>
  );
}
