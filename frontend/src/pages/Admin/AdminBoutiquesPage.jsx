import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ── helpers ───────────────────────────────────────────────── */
function Badge({ status }) {
  const cfg = {
    active:   { label: 'Actif',       bg: '#f0fdf4', color: '#15803d' },
    pending:  { label: 'En attente',  bg: '#fff7ed', color: '#c2410c' },
    suspended:{ label: 'Suspendu',    bg: '#fef2f2', color: '#dc2626' },
    approved: { label: 'Actif',       bg: '#f0fdf4', color: '#15803d' },
    rejected: { label: 'Refusé',      bg: '#fef2f2', color: '#dc2626' },
  }[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return <span style={{ padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

const MOCK = [
  { id: 1, name: 'Élégance Paris',   owner: 'Amina Benali',   city: 'Casablanca', status: 'active',   created_at: '2026-01-15', orders: 84, revenue: 124500, products: 32 },
  { id: 2, name: 'Luxe Maroc',       owner: 'Khalid Mourad',  city: 'Rabat',      status: 'pending',  created_at: '2026-02-03', orders: 0,  revenue: 0,      products: 0  },
  { id: 3, name: 'Mode & Style',     owner: 'Sara Farouk',    city: 'Marrakech',  status: 'active',   created_at: '2026-01-28', orders: 51, revenue: 78200,  products: 21 },
  { id: 4, name: 'Chic Fès',         owner: 'Yasmine Rida',   city: 'Fès',        status: 'suspended',created_at: '2025-12-10', orders: 12, revenue: 18400,  products: 8  },
  { id: 5, name: 'Tailor Rabat',     owner: 'Omar Kadi',      city: 'Rabat',      status: 'active',   created_at: '2026-03-01', orders: 38, revenue: 54000,  products: 17 },
  { id: 6, name: 'Souk Couture',     owner: 'Fatima Lahlou',  city: 'Casablanca', status: 'pending',  created_at: '2026-04-20', orders: 0,  revenue: 0,      products: 0  },
  { id: 7, name: 'Atlas Fashion',    owner: 'Mehdi Saidi',    city: 'Agadir',     status: 'active',   created_at: '2026-02-14', orders: 29, revenue: 41800,  products: 14 },
  { id: 8, name: 'Maroc Luxe',       owner: 'Nadia Chraibi',  city: 'Tanger',     status: 'active',   created_at: '2026-01-07', orders: 65, revenue: 98600,  products: 28 },
];

const CITIES  = ['Toutes', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Agadir', 'Tanger'];
const STATUTS = ['Tous', 'active', 'pending', 'suspended'];

/* ── Drawer detail ────────────────────────────────────────── */
function BoutiqueDrawer({ b, onClose, onToggleStatus }) {
  if (!b) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 90 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', backgroundColor: '#fff', zIndex: 100, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', animation: 'fa-slide-in 0.28s ease' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={title}>Détail boutique</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 22, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#16a34a', fontWeight: 700 }}>{b.name?.[0]}</div>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{b?.name || "—"}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', margin: '2px 0 0' }}>{typeof b?.owner === 'object' ? b?.owner?.name || '—' : b?.owner || '—'}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
            {[{ label: 'Commandes', value: b.orders }, { label: 'Revenus', value: `${(b.revenue || 0).toLocaleString('fr-FR')} MAD` }, { label: 'Produits', value: b.products }].map((s, i) => (
              <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#9CA3AF', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
              </div>
            ))}
          </div>
          {[{ label: 'Ville', value: b.city }, { label: 'Statut', value: <Badge status={b.status} /> }, { label: 'Inscription', value: b.created_at ? new Date(b.created_at).toLocaleDateString('fr-FR') : '—' }].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>{r.label}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#111827', fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '18px 28px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10 }}>
          {b.status !== 'active' && b.status !== 'approved' && (
            <button onClick={() => { onToggleStatus(b.id, 'approved'); onClose(); }} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', backgroundColor: '#1B3A35', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Approuver</button>
          )}
          {b.status !== 'suspended' && (
            <button onClick={() => { onToggleStatus(b.id, 'suspended'); onClose(); }} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #fecaca', backgroundColor: 'transparent', color: '#dc2626', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Suspendre</button>
          )}
        </div>
      </aside>
    </>
  );
}

/* ── Add Modal ────────────────────────────────────────────── */
function AddModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', owner: '', city: '', description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    try {
      await api.post('/admin/boutiques', form);
      toast.success('Boutique créée');
      onSave();
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, backgroundColor: '#fff', borderRadius: 20, zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={title}>Ajouter une boutique</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 22 }}>✕</button>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[['Nom de la boutique', 'name', 'text'], ['Propriétaire', 'owner', 'text'], ['Description', 'description', 'text']].map(([lbl, key, type]) => (
            <div key={key}>
              <label style={lbl_style}>{lbl}</label>
              {key === 'description'
                ? <textarea value={form[key]} onChange={e => set(key, e.target.value)} rows={3} style={{ ...inp, resize: 'none', height: 80 }} />
                : <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} style={inp} />
              }
            </div>
          ))}
          <div>
            <label style={lbl_style}>Ville</label>
            <select value={form.city} onChange={e => set('city', e.target.value)} style={inp}>
              <option value="">Sélectionner…</option>
              {CITIES.filter(c => c !== 'Toutes').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtn}>Annuler</button>
          <button onClick={handleSave} style={saveBtn}>Créer la boutique</button>
        </div>
      </div>
    </>
  );
}

/* ── AdminBoutiquesPage ───────────────────────────────────── */
export default function AdminBoutiquesPage() {
  const [data,     setData]    = useState(MOCK);
  const [loading,  setLoading] = useState(false);
  const [search,   setSearch]  = useState('');
  const [statut,   setStatut]  = useState('Tous');
  const [ville,    setVille]   = useState('Toutes');
  const [page,     setPage]    = useState(1);
  const [selected, setSelected] = useState([]);
  const [drawer,   setDrawer]  = useState(null);
  const [showAdd,  setShowAdd] = useState(false);
  const PER_PAGE = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/boutiques');
        if (res?.data?.length) setData(res.data);
      } catch {/* use mock */}
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = data.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || b.name?.toLowerCase().includes(q) || b.owner?.toLowerCase().includes(q);
    const matchS = statut === 'Tous' || b.status === statut;
    const matchV = ville === 'Toutes' || b.city === ville;
    return matchQ && matchS && matchV;
  });

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll   = () => setSelected(s => s.length === paged.length ? [] : paged.map(b => b.id));

  const handleStatus = async (id, action) => {
    try {
      await api.put(`/admin/boutiques/${id}/${action}`);
      setData(d => d.map(b => b.id === id ? { ...b, status: action === 'approved' ? 'active' : action } : b));
      toast.success(action === 'approved' ? 'Boutique approuvée' : 'Boutique suspendue');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Supprimer ${selected.length} boutique(s) ?`)) return;
    setData(d => d.filter(b => !selected.includes(b.id)));
    setSelected([]);
    toast.success('Boutiques supprimées');
  };

  const exportCSV = () => {
    const rows = [['ID','Nom','Propriétaire','Ville','Statut','Date'], ...filtered.map(b => [b.id, b.name, b.owner, b.city, b.status, b.created_at])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'boutiques.csv'; a.click();
    toast.success('Export CSV téléchargé');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={pageTitle}>Boutiques</h2>
          <p style={pageSub}>{filtered.length} boutique(s) · {data.filter(b => b.status === 'pending').length} en attente</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={primaryBtn}>+ Ajouter une boutique</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher…" style={{ ...inp, width: 240 }} />
        <select value={statut} onChange={e => { setStatut(e.target.value); setPage(1); }} style={{ ...inp, width: 150 }}>
          {STATUTS.map(s => <option key={s} value={s}>{s === 'Tous' ? 'Tous statuts' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={ville} onChange={e => { setVille(e.target.value); setPage(1); }} style={{ ...inp, width: 160 }}>
          {CITIES.map(c => <option key={c} value={c}>{c === 'Toutes' ? 'Toutes villes' : c}</option>)}
        </select>
        <button onClick={exportCSV} style={outlineBtn}>Exporter CSV</button>
        {selected.length > 0 && (
          <button onClick={handleBulkDelete} style={{ ...outlineBtn, color: '#dc2626', borderColor: '#fecaca' }}>
            Supprimer ({selected.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th style={{ ...th, width: 40 }}><input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={toggleAll} /></th>
                {['Boutique', 'Propriétaire', 'Ville', 'Statut', 'Date', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => <tr key={i}><td colSpan={7} style={{ padding: 16 }}><div style={skLine} /></td></tr>)
                : paged.map(b => (
                    <tr key={b.id} onClick={() => setDrawer(b)} className="fa-table-row" style={{ borderTop: '1px solid #F3F4F6', cursor: 'pointer' }}>
                      <td style={td} onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleSelect(b.id)} />
                      </td>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 15, color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>{b.name?.[0]}</div>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#111827' }}>{b?.name || "—"}</span>
                        </div>
                      </td>
                      <td style={td}><span style={tdText}>{typeof b?.owner === 'object' ? b?.owner?.name || '—' : b?.owner || '—'}</span></td>
                      <td style={td}><span style={tdText}>{typeof b?.city === 'object' ? b?.city?.name || '—' : b?.city || '—'}</span></td>
                      <td style={td}><Badge status={b.status} /></td>
                      <td style={td}><span style={{ ...tdText, color: '#9CA3AF' }}>{b.created_at ? new Date(b.created_at).toLocaleDateString('fr-FR') : '—'}</span></td>
                      <td style={td} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {b.status === 'pending' && <button onClick={() => handleStatus(b.id, 'approved')} style={approveBtn}>Valider</button>}
                          {b.status !== 'suspended' && <button onClick={() => handleStatus(b.id, 'suspended')} style={rejectBtn}>Suspendre</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: p === page ? '#1B3A35' : '#F3F4F6', color: p === page ? '#fff' : '#374151', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: p === page ? 600 : 400 }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {drawer  && <BoutiqueDrawer b={drawer} onClose={() => setDrawer(null)} onToggleStatus={handleStatus} />}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); }} />}

      <style>{`@keyframes fa-slide-in{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ── Shared styles ────────────────────────────────────────── */
const card     = { background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' };
const title    = { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 };
const pageTitle= { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 };
const pageSub  = { fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', margin: '4px 0 0' };
const th       = { padding: '11px 18px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', whiteSpace: 'nowrap' };
const td       = { padding: '12px 18px' };
const tdText   = { fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151' };
const inp      = { width: '100%', padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#111827', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' };
const lbl_style= { fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' };
const primaryBtn  = { padding: '10px 22px', borderRadius: 20, border: 'none', backgroundColor: '#1B3A35', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const outlineBtn  = { padding: '9px 18px', borderRadius: 20, border: '1.5px solid #E5E7EB', backgroundColor: 'transparent', color: '#374151', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const cancelBtn   = { padding: '9px 20px', borderRadius: 10, border: '1.5px solid #E5E7EB', backgroundColor: 'transparent', color: '#374151', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const saveBtn     = { padding: '9px 20px', borderRadius: 10, border: 'none', backgroundColor: '#1B3A35', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const approveBtn  = { padding: '5px 12px', borderRadius: 8, border: 'none', backgroundColor: '#dcfce7', color: '#15803d', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600 };
const rejectBtn   = { padding: '5px 12px', borderRadius: 8, border: '1px solid #fecaca', backgroundColor: 'transparent', color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600 };
const skLine      = { height: 14, borderRadius: 7, background: '#F3F4F6', animation: 'fa-pulse 1.5s ease-in-out infinite' };
