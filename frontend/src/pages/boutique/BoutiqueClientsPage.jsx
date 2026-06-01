import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MOCK = [
  { id:1, name:'Nadia Chraibi',  email:'nadia@email.com',  phone:'+212 661 234 567', city:'Casablanca', orders:8,  total:12400, lastOrder:'2026-05-26', since:'2025-01-15', status:'vip' },
  { id:2, name:'Sara Farouk',    email:'sara@email.com',   phone:'+212 622 345 678', city:'Rabat',      orders:5,  total:7200,  lastOrder:'2026-05-25', since:'2025-03-10', status:'regular' },
  { id:3, name:'Amina Benali',   email:'amina@email.com',  phone:'+212 655 456 789', city:'Marrakech',  orders:12, total:28600, lastOrder:'2026-05-24', since:'2024-11-20', status:'vip' },
  { id:4, name:'Karima Idrissi', email:'karima@email.com', phone:'+212 671 567 890', city:'Fès',        orders:3,  total:4800,  lastOrder:'2026-05-23', since:'2025-08-05', status:'regular' },
  { id:5, name:'Fatima Zahra',   email:'fatima@email.com', phone:'+212 688 678 901', city:'Agadir',     orders:1,  total:3100,  lastOrder:'2026-05-22', since:'2026-04-02', status:'new' },
  { id:6, name:'Laila Bennani',  email:'laila@email.com',  phone:'+212 644 789 012', city:'Tanger',     orders:7,  total:9800,  lastOrder:'2026-05-21', since:'2025-02-18', status:'regular' },
  { id:7, name:'Houda Mrani',    email:'houda@email.com',  phone:'+212 633 890 123', city:'Tanger',     orders:15, total:41200, lastOrder:'2026-05-20', since:'2024-09-10', status:'vip' },
  { id:8, name:'Zineb Alaoui',   email:'zineb@email.com',  phone:'+212 677 901 234', city:'Rabat',      orders:2,  total:2300,  lastOrder:'2026-05-19', since:'2026-03-22', status:'new' },
];

const MOCK_ORDERS = [
  { id:1047, total:1010, status:'delivered',  date:'2026-05-26', products:'Robe Élégante, Ceinture dorée' },
  { id:1046, total:2200, status:'shipped',    date:'2026-05-10', products:'Kaftan Brodé' },
  { id:1040, total:890,  status:'delivered',  date:'2026-04-18', products:'Robe Maxi' },
];

const STATUS_CFG = {
  vip:     { label:'VIP',     bg:'#fffbeb', color:'#d97706', border:'#fde68a' },
  regular: { label:'Régulier', bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  new:     { label:'Nouveau',  bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
};

const ORDER_STATUS = {
  pending:   { label:'En attente', color:'#d97706' },
  confirmed: { label:'Confirmée',  color:'#2563eb' },
  shipped:   { label:'Expédiée',   color:'#059669' },
  delivered: { label:'Livrée',     color:'#16a34a' },
  cancelled: { label:'Annulée',    color:'#dc2626' },
};

function ClientModal({ client, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:90 }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:560, maxWidth:'95vw', backgroundColor:'#fff', borderRadius:20, zIndex:100, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' }}>
        {/* Header */}
        <div style={{ padding:'24px 28px', background:'linear-gradient(135deg, #1B3A35 0%, #2A5248 100%)', borderRadius:'20px 20px 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:700 }}>
              {client.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <p style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:'#fff', margin:0 }}>{client.name}</p>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'rgba(255,255,255,0.7)', margin:'2px 0 0' }}>{client.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', cursor:'pointer', color:'#fff', fontSize:18, width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[['Commandes', client.orders, 'C'], ['Total dépensé', `${client.total.toLocaleString('fr-FR')} MAD`, 'M'], ['Membre depuis', client.since.split('-')[0], 'D']].map(([label,value,icon])=>(
              <div key={label} style={{ backgroundColor:'#F9FAFB', borderRadius:10, padding:'14px', textAlign:'center' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#1B3A35', marginBottom:6, fontFamily:'Inter, sans-serif' }}>{icon}</div>
                <p style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 2px' }}>{value}</p>
                <p style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#9CA3AF', margin:0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <div style={{ backgroundColor:'#F9FAFB', borderRadius:10, padding:'16px' }}>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Coordonnées</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['Téléphone', client.phone], ['Ville', client.city], ['Statut', STATUS_CFG[client.status]?.label], ['Dernière commande', client.lastOrder]].map(([k,v])=>(
                <div key={k}>
                  <p style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#9CA3AF', margin:'0 0 2px' }}>{k}</p>
                  <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, color:'#111827', margin:0 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order history */}
          <div>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Historique des commandes</p>
            <div style={{ border:'1px solid #F3F4F6', borderRadius:10, overflow:'hidden' }}>
              {MOCK_ORDERS.map((o,i)=>(
                <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderTop:i>0?'1px solid #F3F4F6':'none' }}>
                  <div>
                    <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, color:'#1B3A35', margin:0 }}>#{o.id}</p>
                    <p style={{ fontFamily:'Inter, sans-serif', fontSize:11.5, color:'#9CA3AF', margin:'2px 0 0' }}>{o.products}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontFamily:"'Playfair Display', serif", fontSize:13, fontWeight:700, color:'#111827', margin:0 }}>{o.total.toLocaleString('fr-FR')} MAD</p>
                    <span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:ORDER_STATUS[o.status]?.color, fontWeight:600 }}>{ORDER_STATUS[o.status]?.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function BoutiqueClientsPage() {
  const [clients, setClients] = useState(MOCK);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('lastOrder');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    setLoading(true);
    api.get('/boutique/clients').then(r => {
      if (r.data?.data?.length) setClients(r.data.data);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    const matchS = !statusFilter || c.status === statusFilter;
    return matchQ && matchS;
  }).sort((a,b) => {
    if (sortBy === 'total') return b.total - a.total;
    if (sortBy === 'orders') return b.orders - a.orders;
    return b.lastOrder.localeCompare(a.lastOrder);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const exportCSV = () => {
    const rows = [['Nom','Email','Ville','Commandes','Total','Statut'], ...filtered.map(c=>[c.name,c.email,c.city,c.orders,`${c.total} MAD`,STATUS_CFG[c.status]?.label])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='clients.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={pageTitle}>Clients</h2>
          <p style={pageSub}>{filtered.length} client(s) · {clients.filter(c=>c.status==='vip').length} VIP</p>
        </div>
        <button onClick={exportCSV} style={outlineBtn}> Exporter CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Nom, email ou ville…"
          style={{ ...inp, width:260 }}/>
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}} style={{ ...inp, width:160 }}>
          <option value="">Tous les clients</option>
          <option value="vip">VIP</option>
          <option value="regular">Régulier</option>
          <option value="new">Nouveau</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ ...inp, width:180 }}>
          <option value="lastOrder">Dernière commande</option>
          <option value="total">Total dépensé</option>
          <option value="orders">Nb commandes</option>
        </select>
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ backgroundColor:'#F9FAFB' }}>
                {['Client','Ville','Commandes','Total dépensé','Statut','Dernière commande','Actions'].map(h=>(
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i=>(
                <tr key={i}><td colSpan={7} style={{ padding:16 }}><div style={skLine}/></td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'60px 0' }}>
                  <p style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:600, color:'#111827', margin:0 }}>Aucun client trouvé</p>
                </td></tr>
              ) : paginated.map(c => {
                const initials = c.name.split(' ').map(n=>n[0]).join('').slice(0,2);
                const cfg = STATUS_CFG[c.status];
                return (
                  <tr key={c.id} className="fa-table-row" style={{ borderTop:'1px solid #F3F4F6', cursor:'pointer' }} onClick={()=>setSelected(c)}>
                    <td style={td}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', backgroundColor:'#1B3A35', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:700, flexShrink:0 }}>{initials}</div>
                        <div>
                          <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, color:'#111827', margin:0 }}>{c.name}</p>
                          <p style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#9CA3AF', margin:0 }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={td}><span style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#374151' }}>{c.city}</span></td>
                    <td style={td}><span style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:700, color:'#111827' }}>{c.orders}</span></td>
                    <td style={td}><span style={{ fontFamily:"'Playfair Display', serif", fontSize:14, fontWeight:700, color:'#1B3A35' }}>{c.total.toLocaleString('fr-FR')} MAD</span></td>
                    <td style={td}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, fontFamily:'Inter, sans-serif',
                        backgroundColor:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={td}><span style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#6B7280' }}>{c.lastOrder}</span></td>
                    <td style={td} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>setSelected(c)} style={actionBtn}>Voir</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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

      {selected && <ClientModal client={selected} onClose={()=>setSelected(null)}/>}

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
