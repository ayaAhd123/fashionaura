import { useState } from 'react';
import { useBoutiqueNotifications } from '../../hooks/useDashboardData';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'order', message: 'Nouvelle commande #1042 de Leila A. — 890 MAD', time: 'Il y a 2h', read: false },
  { id: 2, type: 'review', message: 'Avis 5 étoiles reçu pour "Robe soirée noire"', time: 'Il y a 4h', read: false },
  { id: 3, type: 'stock', message: '"Robe soirée noire" en rupture de stock (taille S)', time: 'Il y a 6h', read: false },
  { id: 4, type: 'order', message: 'Commande #1041 expédiée avec succès', time: 'Hier 14:30', read: true },
  { id: 5, type: 'promo', message: 'Votre promotion "Été 2026" expire dans 2 jours', time: 'Hier 10:00', read: true },
  { id: 6, type: 'system', message: 'Rapport mensuel mars 2026 disponible', time: '01 Avr', read: true },
  { id: 7, type: 'review', message: 'Nouvel avis 4 étoiles pour "Sac cuir camel"', time: '31 Mar', read: true },
];

const typeConfig = {
  order:  { label: 'Commande', bg: '#EEF6FF', color: '#1A5BA6', icon: '🛍️' },
  review: { label: 'Avis',     bg: '#FFF8F0', color: '#B85C00', icon: '⭐' },
  stock:  { label: 'Stock',    bg: '#FFF0F0', color: '#c0392b', icon: '📦' },
  promo:  { label: 'Promo',    bg: '#F0FFF4', color: '#1A6B3C', icon: '🏷️' },
  system: { label: 'Système',  bg: '#F5F5F5', color: '#555',    icon: '⚙️' },
};

const FILTERS = ['Toutes', 'Non lues', 'Commandes', 'Avis', 'Stock'];

export default function NotificationsList() {
  const { data, loading } = useBoutiqueNotifications();
  const [filter, setFilter] = useState('Toutes');
  const [notifications, setNotifications] = useState(data || MOCK_NOTIFICATIONS);

  const filtered = notifications.filter(n => {
    if (filter === 'Non lues') return !n.read;
    if (filter === 'Commandes') return n.type === 'order';
    if (filter === 'Avis') return n.type === 'review';
    if (filter === 'Stock') return n.type === 'stock';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fa-fade-in 0.4s ease forwards' }}>
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 400, color: '#2C2C2C' }}>
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', marginTop: 2 }}>
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #D4E0E2', backgroundColor: 'transparent', color: '#69807E', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* ── Filtres ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', animation: 'fa-fade-in 0.4s ease 0.1s forwards', opacity: 0 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 500,
            transition: 'all 0.2s',
            backgroundColor: filter === f ? '#69807E' : '#fff',
            color: filter === f ? '#fff' : '#939790',
            boxShadow: filter === f ? '0 2px 8px rgba(105,128,126,0.25)' : 'none',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* ── Liste ── */}
      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'fa-fade-in 0.4s ease 0.2s forwards', opacity: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: '48px', textAlign: 'center', boxShadow: '0 2px 8px rgba(44,58,57,0.05)' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#939790', marginBottom: 8 }}>Aucune notification</p>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#C0C0BC' }}>Vous êtes à jour !</p>
            </div>
          ) : filtered.map((notif, i) => {
            const cfg = typeConfig[notif.type] || typeConfig.system;
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '16px 22px', borderRadius: 14,
                  background: notif.read ? '#fff' : '#FAFCFD',
                  boxShadow: '0 2px 8px rgba(44,58,57,0.05)',
                  border: `1px solid ${notif.read ? 'rgba(147,151,144,0.1)' : '#D4E0E2'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                  animation: `fa-fade-in 0.3s ease ${i * 0.05}s both`,
                }}
              >
                {/* Icône type */}
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {cfg.icon}
                </div>

                {/* Contenu */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#2C2C2C', fontWeight: notif.read ? 400 : 600, lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                    {!notif.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#69807E', flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'Raleway, sans-serif', backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#C0C0BC' }}>{notif.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}