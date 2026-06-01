import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MOCK = [
  { id:1, name:'Casablanca', region:'Grand Casablanca', boutiques:38, status:'active' },
  { id:2, name:'Rabat',      region:'Rabat-Salé-Kénitra', boutiques:22, status:'active' },
  { id:3, name:'Marrakech',  region:'Marrakech-Safi', boutiques:31, status:'active' },
  { id:4, name:'Fès',        region:'Fès-Meknès', boutiques:17, status:'active' },
  { id:5, name:'Agadir',     region:'Souss-Massa', boutiques:14, status:'active' },
  { id:6, name:'Tanger',     region:'Tanger-Tétouan-Al Hoceïma', boutiques:19, status:'active' },
  { id:7, name:'Oujda',      region:'Oriental', boutiques:8, status:'inactive' },
  { id:8, name:'Meknès',     region:'Fès-Meknès', boutiques:11, status:'active' },
];

function VilleModal({ ville, onClose, onSave }) {
  const [form, setForm] = useState(ville || { name:'', region:'', status:'active' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const isEdit = !!ville?.id;

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nom requis'); return; }
    try {
      if (isEdit) {
        await api.put(`/admin/cities/${form.id}`, form);
        toast.success('Ville mise à jour');
      } else {
        await api.post('/admin/cities', form);
        toast.success('Ville créée');
      }
      onSave(form);
      onClose();
    } catch { toast.error('Erreur'); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',zIndex:90 }}/>
      <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:440,backgroundColor:'#fff',borderRadius:20,zIndex:100,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',overflow:'hidden' }}>
        <div style={{ padding:'20px 28px',borderBottom:'1px solid #F3F4F6',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:700,color:'#111827',margin:0 }}>{isEdit?'Modifier':'Ajouter'} une ville</p>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding:'24px 28px',display:'flex',flexDirection:'column',gap:14 }}>
          {[['Nom de la ville','name'],['Région','region']].map(([lbl,key])=>(
            <div key={key}>
              <label style={lblStyle}>{lbl}</label>
              <input value={form[key]} onChange={e=>set(key,e.target.value)} style={inp} />
            </div>
          ))}
          <div>
            <label style={lblStyle}>Statut</label>
            <select value={form.status} onChange={e=>set('status',e.target.value)} style={inp}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div style={{ padding:'16px 28px',borderTop:'1px solid #F3F4F6',display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button onClick={onClose} style={cancelBtn}>Annuler</button>
          <button onClick={handleSave} style={saveBtn}>{isEdit?'Mettre à jour':'Créer'}</button>
        </div>
      </div>
    </>
  );
}

export default function AdminVillesPage() {
  const [data,    setData]   = useState(MOCK);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch] = useState('');
  const [modal,   setModal]  = useState(null);
  const [delVille, setDelVille] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/cities');
        if (res?.data?.length) setData(res.data);
      } catch {/* use mock */}
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = data.filter(v => !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.region?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (form) => {
    setData(d => {
      const existing = d.find(x=>x.id===form.id);
      if (existing) return d.map(x=>x.id===form.id?{...x,...form}:x);
      return [...d, {...form, id:Date.now(), boutiques:0}];
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/cities/${id}`);
      setData(d=>d.filter(x=>x.id!==id));
      toast.success('Ville supprimée');
    } catch { toast.error('Erreur'); }
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h2 style={pageTitle}>Villes</h2>
          <p style={pageSub}>{filtered.length} ville(s) couvertes · {data.reduce((a,v)=>a+v.boutiques,0)} boutiques</p>
        </div>
        <button onClick={()=>setModal({})} style={primaryBtn}>+ Ajouter une ville</button>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une ville ou région…" style={{ ...inp, width:320 }} />

      <div style={card}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr style={{ backgroundColor:'#F9FAFB' }}>{['Ville','Région','Boutiques','Statut','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {loading ? [1,2,3,4].map(i=><tr key={i}><td colSpan={5} style={{padding:16}}><div style={skLine}/></td></tr>)
                : filtered.map(v=>(
                  <tr key={v.id} className="fa-table-row" style={{ borderTop:'1px solid #F3F4F6' }}>
                    <td style={td}>
                      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div style={{ width:34,height:34,borderRadius:10,backgroundColor:'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}></div>
                        <span style={{ fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,color:'#111827' }}>{v.name}</span>
                      </div>
                    </td>
                    <td style={td}><span style={tdText}>{v.region}</span></td>
                    <td style={td}>
                      <span style={{ fontFamily:"'Playfair Display', serif",fontSize:18,fontWeight:700,color:'#111827' }}>{v.boutiques}</span>
                      <span style={{ fontFamily:'Inter, sans-serif',fontSize:11,color:'#9CA3AF',marginLeft:4 }}>boutiques</span>
                    </td>
                    <td style={td}>
                      <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,fontFamily:'Inter, sans-serif',backgroundColor:v.status==='active'?'#f0fdf4':'#f3f4f6',color:v.status==='active'?'#15803d':'#6B7280' }}>
                        {v.status==='active'?'Active':'Inactive'}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display:'flex',gap:6 }}>
                        <button onClick={()=>setModal(v)} style={editBtn}>Modifier</button>
                        <button onClick={()=>setDelVille(v)} style={{...editBtn,color:'#dc2626',borderColor:'#fecaca'}}>Suppr.</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <VilleModal ville={modal.id?modal:null} onClose={()=>setModal(null)} onSave={handleSave}/>}
      {delVille && (
        <>
          <div onClick={()=>setDelVille(null)} style={{ position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',zIndex:90 }}/>
          <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:360,backgroundColor:'#fff',borderRadius:20,zIndex:100,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',padding:28,textAlign:'center' }}>
            <div style={{ fontSize:36,marginBottom:12 }}></div>
            <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:700,color:'#111827',marginBottom:8 }}>Supprimer {delVille.name} ?</p>
            <p style={{ fontFamily:'Inter, sans-serif',fontSize:13,color:'#6B7280',marginBottom:20 }}>{delVille.boutiques} boutiques seront dissociées.</p>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>setDelVille(null)} style={{...cancelBtn,flex:1}}>Annuler</button>
              <button onClick={()=>{handleDelete(delVille.id);setDelVille(null);}} style={{ flex:1,padding:'9px 20px',borderRadius:10,border:'none',backgroundColor:'#dc2626',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' }}>Supprimer</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const card      = { background:'#fff',borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid rgba(0,0,0,0.06)',overflow:'hidden' };
const pageTitle = { fontFamily:"'Playfair Display', serif",fontSize:24,fontWeight:700,color:'#111827',margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif',fontSize:13,color:'#6B7280',margin:'4px 0 0' };
const th        = { padding:'11px 18px',textAlign:'left',fontFamily:'Inter, sans-serif',fontSize:10.5,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'#9CA3AF',whiteSpace:'nowrap' };
const td        = { padding:'12px 18px' };
const tdText    = { fontFamily:'Inter, sans-serif',fontSize:13,color:'#374151' };
const inp       = { width:'100%',padding:'9px 14px',borderRadius:10,border:'1.5px solid #E5E7EB',fontFamily:'Inter, sans-serif',fontSize:13,color:'#111827',outline:'none',backgroundColor:'#fff',boxSizing:'border-box' };
const lblStyle  = { fontFamily:'Inter, sans-serif',fontSize:11.5,fontWeight:600,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em' };
const primaryBtn= { padding:'10px 22px',borderRadius:20,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' };
const cancelBtn = { padding:'9px 20px',borderRadius:10,border:'1.5px solid #E5E7EB',backgroundColor:'transparent',color:'#374151',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,cursor:'pointer' };
const saveBtn   = { padding:'9px 20px',borderRadius:10,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' };
const editBtn   = { padding:'5px 10px',borderRadius:8,border:'1px solid #E5E7EB',backgroundColor:'transparent',color:'#374151',cursor:'pointer',fontFamily:'Inter, sans-serif',fontSize:11.5,fontWeight:500 };
const closeBtn  = { background:'none',border:'none',cursor:'pointer',color:'#6B7280',fontSize:22,lineHeight:1 };
const skLine    = { height:14,borderRadius:7,background:'#F3F4F6',animation:'fa-pulse 1.5s ease-in-out infinite' };
