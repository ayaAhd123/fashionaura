import { useState, useEffect } from 'react';
import { useBoutiqueNotifications } from '../../hooks/useDashboardData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const typeConfig = {
  order:  { label: 'Commande', bg: '#EEF6FF', color: '#1A5BA6', icon: '🛍️' },
  review: { label: 'Avis',     bg: '#FFF8F0', color: '#B85C00', icon: '⭐' },
  stock:  { label: 'Stock',    bg: '#FFF0F0', color: '#c0392b', icon: '📦' },
  product:{ label: 'Stock',    bg: '#FFF0F0', color: '#c0392b', icon: '📦' },
  promo:  { label: 'Promo',    bg: '#F0FFF4', color: '#1A6B3C', icon: '🏷️' },
  system: { label: 'Système',  bg: '#F5F5F5', color: '#555',    icon: '⚙️' },
};

const FILTERS = ['Toutes', 'Non lues', 'Stock'];

function normalizeList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export default function NotificationsList() {
  const { data, loading, refetch } = useBoutiqueNotifications();
  const [filter, setFilter] = useState('Toutes');
  const [notifications, setNotifications] = useState([]);
  const [checkingStock, setCheckingStock] = useState(false);
  const [stockMessage, setStockMessage] = useState('');
  const [settings, setSettings] = useState({ stock_alert_threshold: 10, presets: [5, 10, 20] });
  const [customThreshold, setCustomThreshold] = useState('10');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    api.get('/boutique/notifications/stock-settings')
      .then((res) => {
        setSettings(res.data);
        setCustomThreshold(String(res.data.stock_alert_threshold ?? 10));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setNotifications(normalizeList(data));
  }, [data]);

  const filtered = notifications.filter((n) => {
    if (filter === 'Non lues') return !n.read;
    if (filter === 'Stock') return n.type === 'stock' || n.type === 'product';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await api.put('/boutique/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/boutique/notifications/${id}/read`);
    } catch {
      /* ignore */
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const runStockCheck = async (force = false) => {
    setCheckingStock(true);
    setStockMessage('');
    try {
      const res = await api.post('/boutique/notifications/check-stock', force ? { force: true } : {});
      setStockMessage(res.data?.message || 'Vérification terminée.');
      await refetch();
    } catch (err) {
      setStockMessage(err.response?.data?.message || 'Erreur lors de la vérification stock.');
    } finally {
      setCheckingStock(false);
    }
  };

  const saveThreshold = async (value) => {
    const threshold = Math.max(1, Math.min(100, Number(value)));
    setSavingSettings(true);
    setStockMessage('');
    try {
      const res = await api.put('/boutique/notifications/stock-settings', {
        stock_alert_threshold: threshold,
      });
      setSettings(res.data);
      setCustomThreshold(String(res.data.stock_alert_threshold));
      setStockMessage(res.data.message || `Seuil enregistré : ${threshold} unités.`);
    } catch (err) {
      setStockMessage(err.response?.data?.message || 'Impossible d\'enregistrer le seuil.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, animation: 'fa-fade-in 0.4s ease forwards' }}>
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => runStockCheck(false)}
            disabled={checkingStock}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              backgroundColor: '#69807E', color: '#fff', cursor: 'pointer',
              fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600,
              opacity: checkingStock ? 0.7 : 1,
            }}
          >
            {checkingStock ? 'Vérification…' : 'Vérifier les stocks'}
          </button>
          <button
            type="button"
            onClick={() => runStockCheck(true)}
            disabled={checkingStock}
            title="Recréer les alertes même si déjà envoyées (démo)"
            style={{
              padding: '10px 16px', borderRadius: 10, border: '1px solid #69807E',
              backgroundColor: 'transparent', color: '#69807E', cursor: 'pointer',
              fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600,
              opacity: checkingStock ? 0.7 : 1,
            }}
          >
            Forcer (démo)
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              style={{
                padding: '10px 20px', borderRadius: 10, border: '1px solid #D4E0E2',
                backgroundColor: 'transparent', color: '#69807E', cursor: 'pointer',
                fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600,
              }}
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {stockMessage && (
        <p style={{
          fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#69807E',
          padding: '12px 16px', background: '#F0FFF4', borderRadius: 10,
          border: '1px solid #b8dfc4',
        }}>
          {stockMessage}
        </p>
      )}

      <div style={{
        background: '#fff', borderRadius: 16, padding: '20px 22px',
        boxShadow: '0 2px 8px rgba(44,58,57,0.05)', border: '1px solid rgba(147,151,144,0.12)',
      }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#2C2C2C', marginBottom: 6 }}>
          Seuil d&apos;alerte stock
        </h3>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', marginBottom: 16, lineHeight: 1.5 }}>
          Choisissez quand recevoir une alerte : dès qu&apos;il reste ≤ ce nombre de pièces.
          Actuellement : <strong>{settings.stock_alert_threshold}</strong> unité(s).
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {(settings.presets || [5, 10, 20]).map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={savingSettings}
              onClick={() => saveThreshold(preset)}
              style={{
                padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600,
                border: settings.stock_alert_threshold === preset ? 'none' : '1px solid #D4E0E2',
                backgroundColor: settings.stock_alert_threshold === preset ? '#69807E' : '#fff',
                color: settings.stock_alert_threshold === preset ? '#fff' : '#69807E',
              }}
            >
              {preset} pièces
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#555' }}>
            Autre :
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={customThreshold}
            onChange={(e) => setCustomThreshold(e.target.value)}
            style={{
              width: 80, padding: '8px 12px', borderRadius: 8,
              border: '1px solid #D4E0E2', fontFamily: 'Raleway, sans-serif', fontSize: 14,
            }}
          />
          <button
            type="button"
            disabled={savingSettings}
            onClick={() => saveThreshold(customThreshold)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #69807E',
              background: 'transparent', color: '#69807E', cursor: 'pointer',
              fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600,
            }}
          >
            {savingSettings ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', animation: 'fa-fade-in 0.4s ease 0.1s forwards', opacity: 0 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 500,
              backgroundColor: filter === f ? '#69807E' : '#fff',
              color: filter === f ? '#fff' : '#939790',
              boxShadow: filter === f ? '0 2px 8px rgba(105,128,126,0.25)' : 'none',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'fa-fade-in 0.4s ease 0.2s forwards', opacity: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: '48px', textAlign: 'center', boxShadow: '0 2px 8px rgba(44,58,57,0.05)' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#939790', marginBottom: 8 }}>Aucune notification</p>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#C0C0BC' }}>
                Cliquez sur « Vérifier les stocks » pour analyser votre inventaire.
              </p>
            </div>
          ) : filtered.map((notif, i) => {
            const cfg = typeConfig[notif.type] || typeConfig.system;
            return (
              <div
                key={notif.id}
                role="button"
                tabIndex={0}
                onClick={() => markRead(notif.id)}
                onKeyDown={(e) => e.key === 'Enter' && markRead(notif.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '16px 22px', borderRadius: 14,
                  background: notif.read ? '#fff' : '#FAFCFD',
                  boxShadow: '0 2px 8px rgba(44,58,57,0.05)',
                  border: `1px solid ${notif.read ? 'rgba(147,151,144,0.1)' : '#D4E0E2'}`,
                  cursor: 'pointer',
                  animation: `fa-fade-in 0.3s ease ${i * 0.05}s both`,
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {cfg.icon}
                </div>
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
