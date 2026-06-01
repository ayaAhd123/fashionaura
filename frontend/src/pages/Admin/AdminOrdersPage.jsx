import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ── helpers ───────────────────────────────────────────────── */
const STATUS_CFG = {
  pending:    { label: 'En attente',  bg: '#fff7ed', color: '#c2410c' },
  confirmed:  { label: 'Confirmée',   bg: '#eff6ff', color: '#1d4ed8' },
  processing: { label: 'En cours',    bg: '#f0f9ff', color: '#0369a1' },
  shipped:    { label: 'Expédiée',    bg: '#fdf4ff', color: '#7e22ce' },
  delivered:  { label: 'Livrée',      bg: '#f0fdf4', color: '#15803d' },
  cancelled:  { label: 'Annulée',     bg: '#fef2f2', color: '#dc2626' },
};

function Badge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return <span style={{ padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

const STATUSES = Object.keys(STATUS_CFG);
const MOCK = [
  { id: '#1042', client: 'Amina Benali', boutique: 'Élégance Paris', items: 3, total: 2350, status: 'delivered', date: '2026-05-20', address: '12 Rue Hassan II, Casablanca' },
  { id: '#1043', client: 'Khalid Mourad', boutique: 'Luxe Maroc', items: 1, total: 890, status: 'pending', date: '2026-05-25', address: '4 Ave Mohammed V, Rabat' },
  { id: '#1044', client: 'Sara Farouk', boutique: 'Mode & Style', items: 2, total: 1680, status: 'shipped', date: '2026-05-24', address: '7 Rue Youssef, Marrakech' },
  { id: '#1045', client: 'Yasmine Rida', boutique: 'Tailor Rabat', items: 1, total: 560, status: 'confirmed', date: '2026-05-26', address: '15 Blvd Zerktouni, Casablanca' },
  { id: '#1046', client: 'Omar Kadi', boutique: 'Atlas Fashion', items: 4, total: 3200, status: 'processing', date: '2026-05-27', address: '3 Rue Agadir', },
  { id: '#1047', client: 'Nadia Chraibi', boutique: 'Maroc Luxe', items: 1, total: 1150, status: 'cancelled', date: '2026-05-22', address: '8 Ave Tanger' },
];

const STATUS_TIMELINE = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

/* ── Status timeline component ────────────────────────────── */
function StatusTimeline({ current }) {
  const idx = STATUS_TIMELINE.indexOf(current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '20px 0' }}>
      {STATUS_TIMELINE.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        const cfg = STATUS_CFG[s];
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_TIMELINE.length - 1 ? 1 : 'initial' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: done ? '#1B3A35' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', border: active ? '2px solid #C9A84C' : 'none', transition: 'all 0.2s', flexShrink: 0 }}>
                {done && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: done ? '#1B3A35' : '#9CA3AF', fontWeight: done ? 600 : 400, whiteSpace: 'nowrap' }}>{cfg.label}</span>
            </div>
            {i < STATUS_TIMELINE.length - 1 && (
              <div style={{ flex: 1, height: 2, backgroundColor: i < idx ? '#1B3A35' : '#E5E7EB', margin: '0 4px', marginBottom: 18, transition: 'all 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Order modal ──────────────────────────────────────────── */
function OrderModal({ order, onClose, onStatusChange }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (newStatus === order.status) { onClose(); return; }
    setSaving(true);
    try {
      await api.put(`/admin/orders/${order.id.replace('#', '')}/status`, { status: newStatus });
      onStatusChange(order.id, newStatus);
      toast.success('Statut mis à jour');
      onClose();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 580, maxHeight: '90vh', backgroundColor: '#fff', borderRadius: 20, zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Commande {order.id}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{order.client} · {order.boutique}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 22 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {order.status !== 'cancelled' && <StatusTimeline current={order.status} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[{ label: 'Client', value: order.client }, { label: 'Boutique', value: order.boutique }, { label: 'Articles', value: `${order.items} article(s)` }, { label: 'Adresse', value: order.address || '—' }].map((r, i) => (
              <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#111827', fontWeight: 500, margin: '4px 0 0' }}>{r.value}</p>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#9CA3AF', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>{order.total.toLocaleString('fr-FR')} MAD</p>
          </div>
          <div>
            <label style={lbl_style}>Changer le statut</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={inp}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtn}>Fermer</button>
          <button onClick={handleSave} disabled={saving} style={saveBtn}>{saving ? 'Sauvegarde…' : 'Mettre à jour'}</button>
        </div>
      </div>
    </>
  );
}

/* ── AdminOrdersPage ──────────────────────────────────────── */
export default function AdminOrdersPage() {
  const [data,    setData]   = useState(MOCK);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch] = useState('');
  const [status,  setStatus] = useState('Tous');
  const [page,    setPage]   = useState(1);
  const [modal,   setModal]  = useState(null);
  const PER_PAGE = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/orders');
        if (res?.data?.length) setData(res.data);
      } catch {/* use mock */}
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = data.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || o.id?.toLowerCase().includes(q) || o.client?.toLowerCase().includes(q) || o.boutique?.toLowerCase().includes(q);
    const matchS = status === 'Tous' || o.status === status;
    return matchQ && matchS;
  });

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleStatusChange = (id, newStatus) => {
    setData(d => d.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const exportCSV = () => {
    const rows = [['ID','Client','Boutique','Articles','Total','Statut','Date'], ...filtered.map(o => [o.id, o.client, o.boutique, o.items, `${o.total} MAD`, o.status, o.date])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'commandes.csv'; a.click();
    toast.success('Export CSV téléchargé');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={pageTitle}>Commandes</h2>
          <p style={pageSub}>{filtered.length} commande(s) · {data.filter(o => o.status === 'pending').length} en attente</p>
        </div>
        <button onClick={exportCSV} style={outlineBtn}>Exporter CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher commande, client…" style={{ ...inp, width: 280 }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ ...inp, width: 160 }}>
          <option value="Tous">Tous statuts</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s]?.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                {['#', 'Client', 'Boutique', 'Articles', 'Total', 'Statut', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => <tr key={i}><td colSpan={7} style={{ padding: 16 }}><div style={skLine} /></td></tr>)
                : paged.map(o => (
                    <tr key={o.id} onClick={() => setModal(o)} className="fa-table-row" style={{ borderTop: '1px solid #F3F4F6', cursor: 'pointer' }}>
                      <td style={td}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 700, color: '#6B7280' }}>{o.id}</span></td>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 12, color: '#2563eb', fontWeight: 700, flexShrink: 0 }}>{o.client?.[0]}</div>
                          <span style={tdText}>{o.client}</span>
                        </div>
                      </td>
                      <td style={td}><span style={tdText}>{o.boutique}</span></td>
                      <td style={td}><span style={{ ...tdText, textAlign: 'center' }}>{o.items}</span></td>
                      <td style={td}><span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#111827' }}>{(o.total ?? 0).toLocaleString('fr-FR')} MAD</span></td>
                      <td style={td}><Badge status={o.status} /></td>
                      <td style={td}><span style={{ ...tdText, color: '#9CA3AF' }}>{o.date ? new Date(o.date).toLocaleDateString('fr-FR') : '—'}</span></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtered.length)} sur {filtered.length}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: p === page ? '#1B3A35' : '#F3F4F6', color: p === page ? '#fff' : '#374151', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: p === page ? 600 : 400 }}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && <OrderModal order={modal} onClose={() => setModal(null)} onStatusChange={handleStatusChange} />}
    </div>
  );
}

/* ── Shared styles ────────────────────────────────────────── */
const card      = { background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 };
const pageSub   = { fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', margin: '4px 0 0' };
const th        = { padding: '11px 18px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', whiteSpace: 'nowrap' };
const td        = { padding: '12px 18px' };
const tdText    = { fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151' };
const inp       = { width: '100%', padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#111827', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' };
const lbl_style = { fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' };
const outlineBtn= { padding: '9px 18px', borderRadius: 20, border: '1.5px solid #E5E7EB', backgroundColor: 'transparent', color: '#374151', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const cancelBtn = { padding: '9px 20px', borderRadius: 10, border: '1.5px solid #E5E7EB', backgroundColor: 'transparent', color: '#374151', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const saveBtn   = { padding: '9px 20px', borderRadius: 10, border: 'none', backgroundColor: '#1B3A35', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const skLine    = { height: 14, borderRadius: 7, background: '#F3F4F6', animation: 'fa-pulse 1.5s ease-in-out infinite' };
