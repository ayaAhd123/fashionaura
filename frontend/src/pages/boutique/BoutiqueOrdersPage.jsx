import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MessageCircle } from 'lucide-react';
import { ORDER_STATUS_CFG } from '../../config/orderStatus';
import OrderStatusSelect from '../../components/orders/OrderStatusSelect';
import OrderChatModal from '../../components/orders/OrderChatModal';
import { updateBoutiqueOrderStatus } from '../../services/api';

function mapApiOrder(o) {
  const name = o.customer || 'Client';
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';
  return {
    id: o.id,
    client: name,
    email: o.customer_email || '',
    avatar: initials,
    products: (o.items || []).map((i) => ({ name: i.name, qty: i.quantity, price: i.price })),
    total: o.amount,
    status: o.status || 'pending',
    date: o.date ? new Date(o.date).toLocaleDateString('fr-FR') : '',
    address: o.address || '',
    phone: o.phone || '',
  };
}

const MOCK = [
  { id:1047, client:'Nadia Chraibi',    email:'nadia@email.com', avatar:'NC', products:[{name:'Robe Élégante',qty:1,price:890},{name:'Ceinture dorée',qty:1,price:120}], total:1010, status:'delivered',  date:'2026-05-26', address:'12 Rue Hassan II, Casablanca' },
  { id:1046, client:'Sara Farouk',      email:'sara@email.com',  avatar:'SF', products:[{name:'Chemisier Soie',qty:2,price:450}],                                         total:900,  status:'shipped',   date:'2026-05-25', address:'8 Av. Med V, Rabat' },
  { id:1045, client:'Amina Benali',     email:'amina@email.com', avatar:'AB', products:[{name:'Kaftan Brodé',qty:1,price:2200}],                                          total:2200, status:'processing', date:'2026-05-24', address:'3 Bd Zerktouni, Marrakech' },
  { id:1044, client:'Karima Idrissi',   email:'karima@email.com',avatar:'KI', products:[{name:'Djellaba Luxe',qty:1,price:1800},{name:'Babouches',qty:1,price:350}],      total:2150, status:'confirmed',  date:'2026-05-23', address:'45 Rue Zaid, Fès' },
  { id:1043, client:'Fatima Zahra',     email:'fatima@email.com',avatar:'FZ', products:[{name:'Robe Caftan',qty:1,price:3100}],                                           total:3100, status:'pending',   date:'2026-05-22', address:'7 Av. Bir Anzarane, Agadir' },
  { id:1042, client:'Laila Bennani',    email:'laila@email.com', avatar:'LB', products:[{name:'Abaya Noire',qty:1,price:1400}],                                           total:1400, status:'cancelled',  date:'2026-05-21', address:'22 Rue Atlas, Tanger' },
  { id:1041, client:'Houda Mrani',      email:'houda@email.com', avatar:'HM', products:[{name:'Jupe Longue',qty:2,price:380},{name:'Top Brodé',qty:1,price:290}],         total:1050, status:'delivered',  date:'2026-05-20', address:'9 Bd Pasteur, Tanger' },
  { id:1040, client:'Zineb Alaoui',     email:'zineb@email.com', avatar:'ZA', products:[{name:'Robe Maxi',qty:1,price:760}],                                              total:760,  status:'delivered',  date:'2026-05-19', address:'15 Rue Ibn Batouta, Rabat' },
];

const STATUS_CFG = ORDER_STATUS_CFG;

const TIMELINE_STEPS = ['pending','confirmed','processing','shipped','delivered'];

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {};
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, fontFamily:'Inter, sans-serif',
      backgroundColor:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

function StatusTimeline({ current }) {
  const idx = TIMELINE_STEPS.indexOf(current);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, padding:'12px 0' }}>
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= idx;
        const cfg = STATUS_CFG[step];
        return (
          <div key={step} style={{ display:'flex', alignItems:'center', flex: i < TIMELINE_STEPS.length-1 ? '1' : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, minWidth:60 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', backgroundColor:done?'#1B3A35':'#E5E7EB',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                border:`2px solid ${done?'#1B3A35':'#D1D5DB'}`, transition:'all 0.3s' }}>
                {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{ fontFamily:'Inter, sans-serif', fontSize:10, color:done?'#1B3A35':'#9CA3AF', fontWeight:done?600:400, textAlign:'center', whiteSpace:'nowrap' }}>
                {cfg.label}
              </span>
            </div>
            {i < TIMELINE_STEPS.length-1 && (
              <div style={{ flex:1, height:2, backgroundColor:i < idx?'#1B3A35':'#E5E7EB', margin:'0 4px', marginBottom:20, transition:'background 0.3s' }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateBoutiqueOrderStatus(order.id, status);
      onUpdate(order.id, status);
      toast.success('Statut mis à jour');
      onClose();
    } catch {
      toast.error('Impossible de mettre à jour le statut');
    } finally { setSaving(false); }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Facture #${order.id}</title>
      <style>body{font-family:Inter,sans-serif;padding:40px;color:#111827}h1{color:#1B3A35}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;border:1px solid #E5E7EB;text-align:left}th{background:#F9FAFB}tfoot td{font-weight:700}</style>
      </head><body>
      <h1>FashionAura — Facture #${order.id}</h1>
      <p><strong>Client:</strong> ${order.client} (${order.email})</p>
      <p><strong>Adresse:</strong> ${order.address}</p>
      <p><strong>Date:</strong> ${order.date}</p>
      <table><thead><tr><th>Produit</th><th>Qté</th><th>Prix unit.</th><th>Total</th></tr></thead>
      <tbody>${order.products.map(p=>`<tr><td>${p.name}</td><td>${p.qty}</td><td>${p.price.toLocaleString('fr-FR')} MAD</td><td>${(p.qty*p.price).toLocaleString('fr-FR')} MAD</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3">Total</td><td>${order.total.toLocaleString('fr-FR')} MAD</td></tr></tfoot>
      </table></body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:90 }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:580, maxWidth:'95vw', backgroundColor:'#fff', borderRadius:20, zIndex:100, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ padding:'20px 28px', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
          <div>
            <p style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:'#111827', margin:0 }}>Commande #{order.id}</p>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#6B7280', margin:'2px 0 0' }}>{order.date}</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handlePrint} style={{ padding:'7px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', background:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, cursor:'pointer' }}>🖨 Imprimer</button>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#6B7280', fontSize:22 }}>✕</button>
          </div>
        </div>

        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>
          {/* Client info */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[['Client', order.client], ['Email', order.email], ['Date', order.date], ['Adresse', order.address]].map(([k,v])=>(
              <div key={k} style={{ backgroundColor:'#F9FAFB', borderRadius:10, padding:'12px 16px' }}>
                <p style={{ fontFamily:'Inter, sans-serif', fontSize:10.5, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 4px' }}>{k}</p>
                <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#111827', margin:0 }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Products */}
          <div>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Produits</p>
            <div style={{ border:'1px solid #F3F4F6', borderRadius:10, overflow:'hidden' }}>
              {order.products.map((p,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderTop: i>0?'1px solid #F3F4F6':'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:8, backgroundColor:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👗</div>
                    <div>
                      <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, color:'#111827', margin:0 }}>{p.name}</p>
                      <p style={{ fontFamily:'Inter, sans-serif', fontSize:11.5, color:'#9CA3AF', margin:0 }}>Qté: {p.qty}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, color:'#111827', margin:0 }}>{(p.qty*p.price).toLocaleString('fr-FR')} MAD</p>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', borderTop:'2px solid #F3F4F6', backgroundColor:'#F9FAFB' }}>
                <span style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:700, color:'#111827' }}>Total</span>
                <span style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:700, color:'#1B3A35' }}>{order.total.toLocaleString('fr-FR')} MAD</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Suivi</p>
              <StatusTimeline current={order.status}/>
            </div>
          )}

          {/* Update status */}
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <select value={status} onChange={e=>setStatus(e.target.value)}
              style={{ flex:1, padding:'9px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:'Inter, sans-serif', fontSize:13, color:'#111827', outline:'none' }}>
              {Object.entries(STATUS_CFG).map(([k,v])=>(
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button onClick={handleUpdate} disabled={saving || status===order.status}
              style={{ padding:'9px 20px', borderRadius:10, border:'none', backgroundColor:'#1B3A35', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, cursor:'pointer', opacity: saving||status===order.status?0.5:1 }}>
              {saving ? '...' : 'Mettre à jour'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function BoutiqueOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    setLoading(true);
    api.get('/boutique/orders').then((r) => {
      const rows = r.data?.data || [];
      if (rows.length) setOrders(rows.map(mapApiOrder));
    }).catch(() => {
      setOrders(MOCK);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || String(o.id).includes(q) || o.client.toLowerCase().includes(q);
    const matchS = !statusFilter || o.status === statusFilter;
    return matchQ && matchS;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const handleUpdate = (id, status) => setOrders(prev => prev.map(o => o.id===id ? {...o, status} : o));

  const exportCSV = () => {
    const rows = [['ID','Client','Total','Statut','Date'], ...filtered.map(o=>[`#${o.id}`,o.client,`${o.total} MAD`,STATUS_CFG[o.status]?.label,o.date])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='commandes.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={pageTitle}>Commandes</h2>
          <p style={pageSub}>{filtered.length} commande(s) · {orders.filter(o=>o.status==='pending').length} en attente</p>
        </div>
        <button onClick={exportCSV} style={outlineBtn}>⬇ Exporter CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="🔍 Rechercher #ID ou client…"
          style={{ ...inp, width:260 }}/>
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}} style={{ ...inp, width:180 }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ backgroundColor:'#F9FAFB' }}>
                {['#ID','Client','Produits','Total','Statut','Date','Actions'].map(h=>(
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i=>(
                <tr key={i}><td colSpan={7} style={{ padding:16 }}><div style={skLine}/></td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'60px 0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
                  <p style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:600, color:'#111827', margin:0 }}>Aucune commande</p>
                  <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280' }}>Essayez de modifier vos filtres</p>
                </td></tr>
              ) : paginated.map(o=>(
                <tr key={o.id} className="fa-table-row" style={{ borderTop:'1px solid #F3F4F6', cursor:'pointer' }} onClick={()=>setSelected(o)}>
                  <td style={td}><span style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:700, color:'#1B3A35' }}>#{o.id}</span></td>
                  <td style={td}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', backgroundColor:'#1B3A35', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:700, flexShrink:0 }}>{o.avatar}</div>
                      <div>
                        <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, color:'#111827', margin:0 }}>{o.client}</p>
                        <p style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#9CA3AF', margin:0 }}>{o.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {o.products.slice(0,2).map((p,i)=>(
                        <span key={i} style={{ fontSize:11, backgroundColor:'#F3F4F6', color:'#374151', padding:'2px 8px', borderRadius:6, fontFamily:'Inter, sans-serif' }}>{p.name}</span>
                      ))}
                      {o.products.length > 2 && <span style={{ fontSize:11, color:'#9CA3AF', fontFamily:'Inter, sans-serif' }}>+{o.products.length-2}</span>}
                    </div>
                  </td>
                  <td style={td}><span style={{ fontFamily:"'Playfair Display', serif", fontSize:14, fontWeight:700, color:'#111827' }}>{o.total.toLocaleString('fr-FR')} MAD</span></td>
                  <td style={td} onClick={(e) => e.stopPropagation()}>
                    <OrderStatusSelect
                      orderId={o.id}
                      status={o.status}
                      updateFn={updateBoutiqueOrderStatus}
                      onChange={handleUpdate}
                      compact
                    />
                  </td>
                  <td style={td}><span style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#6B7280' }}>{o.date}</span></td>
                  <td style={td} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" onClick={() => setChatOrder(o)} style={actionBtn}>
                        <MessageCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Message
                      </button>
                      <button type="button" onClick={() => setSelected(o)} style={actionBtn}>Détails</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding:'16px 24px', borderTop:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#6B7280' }}>Page {page} / {totalPages}</span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ ...pageBtn, opacity:page===1?0.4:1 }}>← Précédent</button>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ ...pageBtn, opacity:page===totalPages?0.4:1 }}>Suivant →</button>
            </div>
          </div>
        )}
      </div>

      {selected && <OrderModal order={selected} onClose={()=>setSelected(null)} onUpdate={handleUpdate}/>}

      <OrderChatModal
        open={!!chatOrder}
        onClose={() => setChatOrder(null)}
        orderId={chatOrder?.id}
        orderLabel={chatOrder ? `Commande #${chatOrder.id}` : ''}
        counterpartName={chatOrder?.client}
      />

      <style>{`.fa-table-row:hover{background:#FAFAFA}`}</style>
    </div>
  );
}

const card      = { background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)', overflow:'hidden' };
const pageTitle = { fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:'#111827', margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280', margin:'4px 0 0' };
const th        = { padding:'11px 18px', textAlign:'left', fontFamily:'Inter, sans-serif', fontSize:10.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9CA3AF', whiteSpace:'nowrap' };
const td        = { padding:'12px 18px' };
const inp       = { padding:'9px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:'Inter, sans-serif', fontSize:13, color:'#111827', outline:'none', backgroundColor:'#fff', boxSizing:'border-box' };
const outlineBtn= { padding:'9px 18px', borderRadius:20, border:'1.5px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, cursor:'pointer' };
const actionBtn = { padding:'5px 12px', borderRadius:8, border:'1px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, cursor:'pointer' };
const pageBtn   = { padding:'7px 14px', borderRadius:8, border:'1.5px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, cursor:'pointer' };
const skLine    = { height:14, borderRadius:7, background:'#F3F4F6', animation:'fa-pulse 1.5s ease-in-out infinite' };
