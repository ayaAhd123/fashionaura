import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ── helpers ───────────────────────────────────────────────── */
function RoleBadge({ role }) {
  const cfg = {
    admin:         { label: 'Admin',     bg: '#f0fdf4', color: '#15803d' },
    boutique_owner:{ label: 'Boutique',  bg: '#eff6ff', color: '#1d4ed8' },
    client:        { label: 'Client',    bg: '#fdf4ff', color: '#7e22ce' },
  }[role] || { label: role, bg: '#f3f4f6', color: '#374151' };
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function StatusDot({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: active ? '#22C55E' : '#EF4444' }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: active ? '#15803d' : '#dc2626' }}>{active ? 'Actif' : 'Suspendu'}</span>
    </div>
  );
}

const MOCK = [
  { id: 1, name: 'Admin Principal', email: 'admin@fashionaura.ma', role: 'admin', active: true, created_at: '2025-01-01' },
  { id: 2, name: 'Amina Benali', email: 'amina@boutique.ma', role: 'boutique_owner', active: true, created_at: '2025-06-15' },
  { id: 3, name: 'Khalid Mourad', email: 'khalid@luxemaroc.ma', role: 'boutique_owner', active: true, created_at: '2025-07-20' },
  { id: 4, name: 'Sara Farouk', email: 'sara@gmail.com', role: 'client', active: true, created_at: '2026-01-05' },
  { id: 5, name: 'Yasmine Rida', email: 'yasmine@gmail.com', role: 'client', active: false, created_at: '2026-02-14' },
  { id: 6, name: 'Omar Kadi', email: 'omar@atlas.ma', role: 'boutique_owner', active: true, created_at: '2025-09-01' },
  { id: 7, name: 'Nadia Chraibi', email: 'nadia@gmail.com', role: 'client', active: true, created_at: '2026-03-10' },
  { id: 8, name: 'Mehdi Saidi', email: 'mehdi@couture.ma', role: 'boutique_owner', active: true, created_at: '2025-11-22' },
];

const ROLES = ['Tous', 'admin', 'boutique_owner', 'client'];

function RoleModal({ user, onClose, onSave }) {
  const [role, setRole] = useState(user.role);
  const handleSave = async () => {
    try {
      await api.put(`/admin/users/${user.id}`, { role });
      onSave(user.id, role);
      toast.success('Rôle mis à jour');
      onClose();
    } catch { toast.error('Erreur'); }
  };
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, backgroundColor: '#fff', borderRadius: 20, zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>Modifier le rôle</p>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: 10 }}>
            <div style={avatar}>{user.name?.[0]}</div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{user.name}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>{user.email}</p>
            </div>
          </div>
          <label style={lbl_style}>Nouveau rôle</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['admin','Admin'],['boutique_owner','Propriétaire boutique'],['client','Client']].map(([val,lbl]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${role===val?'#1B3A35':'#E5E7EB'}`, cursor: 'pointer', backgroundColor: role===val?'#f0fdf4':'#fff' }}>
                <input type="radio" name="role" value={val} checked={role===val} onChange={() => setRole(val)} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: role===val?600:400, color: role===val?'#1B3A35':'#374151' }}>{lbl}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtn}>Annuler</button>
          <button onClick={handleSave} style={saveBtn}>Enregistrer</button>
        </div>
      </div>
    </>
  );
}

function DeleteConfirm({ user, onClose, onDelete }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 380, backgroundColor: '#fff', borderRadius: 20, zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}></div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Supprimer {user.name} ?</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Cette action est irréversible. L'utilisateur sera définitivement supprimé.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ ...cancelBtn, flex: 1 }}>Annuler</button>
          <button onClick={() => { onDelete(user.id); onClose(); }} style={{ flex: 1, padding: '9px 20px', borderRadius: 10, border: 'none', backgroundColor: '#dc2626', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Supprimer</button>
        </div>
      </div>
    </>
  );
}

export default function AdminUsersPage() {
  const [data,      setData]     = useState(MOCK);
  const [loading,   setLoading]  = useState(false);
  const [search,    setSearch]   = useState('');
  const [role,      setRole]     = useState('Tous');
  const [page,      setPage]     = useState(1);
  const [roleModal, setRoleModal] = useState(null);
  const [delModal,  setDelModal]  = useState(null);
  const PER_PAGE = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/users');
        if (res?.data?.length) setData(res.data);
      } catch {/* use mock */}
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = data.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchR = role === 'Tous' || u.role === role;
    return matchQ && matchR;
  });
  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const toggleActive = async (id) => {
    const u = data.find(x => x.id===id);
    try {
      await api.put(`/admin/users/${id}`, { active: !u.active });
      setData(d => d.map(x => x.id===id ? { ...x, active: !x.active } : x));
      toast.success(!u.active ? 'Compte réactivé' : 'Compte suspendu');
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setData(d => d.filter(x => x.id!==id));
      toast.success('Utilisateur supprimé');
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const updateRole = (id, newRole) => setData(d => d.map(u => u.id===id ? { ...u, role: newRole } : u));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={pageTitle}>Utilisateurs</h2>
          <p style={pageSub}>{filtered.length} utilisateur(s) · {data.filter(u=>u.role==='boutique_owner').length} boutiques</p>
        </div>
        <button onClick={() => toast.success('Invitation envoyée (démo)')} style={primaryBtn}>+ Inviter un utilisateur</button>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher nom, email…" style={{ ...inp, width: 280 }} />
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} style={{ ...inp, width: 170 }}>
          {ROLES.map(r => <option key={r} value={r}>{r==='Tous'?'Tous les rôles':r==='boutique_owner'?'Boutique':r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
        </select>
      </div>
      <div style={card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ backgroundColor: '#F9FAFB' }}>{['Utilisateur','Email','Rôle','Statut','Inscription','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {loading ? [1,2,3,4,5].map(i=><tr key={i}><td colSpan={6} style={{padding:16}}><div style={skLine}/></td></tr>)
                : paged.map(u=>(
                  <tr key={u.id} className="fa-table-row" style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={td}>
                      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div style={avatar}>{u.name?.[0]}</div>
                        <span style={{ fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,color:'#111827' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={td}><span style={tdText}>{u.email}</span></td>
                    <td style={td}><RoleBadge role={u.role}/></td>
                    <td style={td}><StatusDot active={u.active!==false}/></td>
                    <td style={td}><span style={{...tdText,color:'#9CA3AF'}}>{u.created_at?new Date(u.created_at).toLocaleDateString('fr-FR'):'—'}</span></td>
                    <td style={td}>
                      <div style={{ display:'flex',gap:6 }}>
                        <button onClick={()=>setRoleModal(u)} style={editBtn}>Rôle</button>
                        <button onClick={()=>toggleActive(u.id)} style={{...editBtn,color:u.active!==false?'#c2410c':'#15803d',borderColor:u.active!==false?'#fed7aa':'#bbf7d0'}}>
                          {u.active!==false?'Suspendre':'Réactiver'}
                        </button>
                        {u.role!=='admin'&&<button onClick={()=>setDelModal(u)} style={{...editBtn,color:'#dc2626',borderColor:'#fecaca'}}>Suppr.</button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ padding:'14px 24px', borderTop:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280' }}>{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtered.length)} sur {filtered.length}</span>
            <div style={{ display:'flex', gap:6 }}>
              {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} style={{ width:32, height:32, borderRadius:8, border:'none', cursor:'pointer', backgroundColor:p===page?'#1B3A35':'#F3F4F6', color:p===page?'#fff':'#374151', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:p===page?600:400 }}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      {roleModal && <RoleModal user={roleModal} onClose={()=>setRoleModal(null)} onSave={updateRole}/>}
      {delModal  && <DeleteConfirm user={delModal} onClose={()=>setDelModal(null)} onDelete={handleDelete}/>}
    </div>
  );
}

const card      = { background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)', overflow:'hidden' };
const pageTitle = { fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:'#111827', margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280', margin:'4px 0 0' };
const th        = { padding:'11px 18px', textAlign:'left', fontFamily:'Inter, sans-serif', fontSize:10.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9CA3AF', whiteSpace:'nowrap' };
const td        = { padding:'12px 18px' };
const tdText    = { fontFamily:'Inter, sans-serif', fontSize:13, color:'#374151' };
const inp       = { width:'100%', padding:'9px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:'Inter, sans-serif', fontSize:13, color:'#111827', outline:'none', backgroundColor:'#fff', boxSizing:'border-box' };
const lbl_style = { fontFamily:'Inter, sans-serif', fontSize:11.5, fontWeight:600, color:'#374151', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' };
const primaryBtn= { padding:'10px 22px', borderRadius:20, border:'none', backgroundColor:'#1B3A35', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, cursor:'pointer' };
const cancelBtn = { padding:'9px 20px', borderRadius:10, border:'1.5px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, cursor:'pointer' };
const saveBtn   = { padding:'9px 20px', borderRadius:10, border:'none', backgroundColor:'#1B3A35', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, cursor:'pointer' };
const editBtn   = { padding:'5px 10px', borderRadius:8, border:'1px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:11.5, fontWeight:500 };
const closeBtn  = { background:'none', border:'none', cursor:'pointer', color:'#6B7280', fontSize:22, lineHeight:1 };
const avatar    = { width:34, height:34, borderRadius:'50%', backgroundColor:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Playfair Display', serif", fontSize:14, color:'#2563eb', fontWeight:700, flexShrink:0 };
const skLine    = { height:14, borderRadius:7, background:'#F3F4F6', animation:'fa-pulse 1.5s ease-in-out infinite' };
