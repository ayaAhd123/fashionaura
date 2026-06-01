import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const INITIALS = ['R', 'C', 'S', 'A', 'M', 'C'];
const COLORS = ['#f0fdf4','#eff6ff','#fdf4ff','#fff7ed','#fef2f2','#f0f9ff','#fefce8','#f5f3ff'];

const catLetter = (cat) => cat.emoji || cat.name?.charAt(0)?.toUpperCase() || '?';

const MOCK_CATS = [
  { id:1, name:'Robes',        emoji:'R', color:'#f0fdf4', count:124 },
  { id:2, name:'Chemises',     emoji:'C', color:'#eff6ff', count:87  },
  { id:3, name:'Chaussures',   emoji:'S', color:'#fdf4ff', count:56  },
  { id:4, name:'Accessoires',  emoji:'A', color:'#fff7ed', count:203 },
  { id:5, name:'Manteaux',     emoji:'M', color:'#fef2f2', count:41  },
  { id:6, name:'Casual',       emoji:'C', color:'#f0f9ff', count:98  },
];

function CatModal({ cat, onClose, onSave }) {
  const [form, setForm] = useState(cat || { name:'', emoji:'', color:'#f0fdf4', description:'' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const isEdit = !!cat?.id;

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nom requis'); return; }
    const payload = {
      ...form,
      emoji: form.emoji || form.name.charAt(0).toUpperCase(),
    };
    try {
      if (isEdit) {
        await api.put(`/admin/categories/${form.id}`, payload);
        toast.success('Catégorie mise à jour');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Catégorie créée');
      }
      onSave(payload);
      onClose();
    } catch { toast.error('Erreur'); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',zIndex:90 }}/>
      <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:480,backgroundColor:'#fff',borderRadius:20,zIndex:100,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',overflow:'hidden' }}>
        <div style={{ padding:'20px 28px',borderBottom:'1px solid #F3F4F6',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <p style={modalTitle}>{isEdit ? 'Modifier' : 'Ajouter'} une catégorie</p>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding:'24px 28px',display:'flex',flexDirection:'column',gap:16 }}>
          <div>
            <label style={lbl}>Nom</label>
            <input value={form.name} onChange={e=>set('name',e.target.value)} style={inp} placeholder="Ex: Robes d'été" />
          </div>
          <div>
            <label style={lbl}>Initiale</label>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginTop:4 }}>
              {INITIALS.map((letter, idx)=>(
                <button key={`${letter}-${idx}`} onClick={()=>set('emoji',letter)} style={{ width:38,height:38,borderRadius:8,border:`2px solid ${form.emoji===letter?'#1B3A35':'#E5E7EB'}`,backgroundColor:form.emoji===letter?'#f0fdf4':'transparent',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'Inter, sans-serif',color:'#374151' }}>{letter}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Couleur</label>
            <div style={{ display:'flex',gap:8,marginTop:4 }}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>set('color',c)} style={{ width:32,height:32,borderRadius:'50%',backgroundColor:c,border:`2px solid ${form.color===c?'#1B3A35':'#E5E7EB'}`,cursor:'pointer' }}/>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={2} style={{ ...inp,resize:'none',height:64 }} placeholder="Description optionnelle" />
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

function DeleteConfirm({ cat, onClose, onDelete }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',zIndex:90 }}/>
      <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:360,backgroundColor:'#fff',borderRadius:20,zIndex:100,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',padding:28,textAlign:'center' }}>
        <div style={{ width:56,height:56,borderRadius:'50%',backgroundColor:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontFamily:"'Playfair Display', serif",fontSize:24,fontWeight:700,color:'#1B3A35' }}>{catLetter(cat)}</div>
        <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:700,color:'#111827',marginBottom:8 }}>Supprimer «{cat.name}» ?</p>
        <p style={{ fontFamily:'Inter, sans-serif',fontSize:13,color:'#6B7280',marginBottom:20 }}>Cette catégorie sera définitivement supprimée.</p>
        <div style={{ display:'flex',gap:10 }}>
          <button onClick={onClose} style={{ ...cancelBtn,flex:1 }}>Annuler</button>
          <button onClick={()=>{onDelete(cat.id);onClose();}} style={{ flex:1,padding:'9px 20px',borderRadius:10,border:'none',backgroundColor:'#dc2626',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' }}>Supprimer</button>
        </div>
      </div>
    </>
  );
}

export default function AdminCategoriesPage() {
  const [cats,    setCats]    = useState(MOCK_CATS);
  const [loading, setLoading] = useState(false);
  const [modal,   setModal]   = useState(null);
  const [delCat,  setDelCat]  = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/categories');
        if (data?.data?.length) setCats(data.data);
      } catch {/* use mock */}
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = (form) => {
    setCats(c => {
      const existing = c.find(x => x.id === form.id);
      if (existing) return c.map(x => x.id===form.id ? { ...x,...form } : x);
      return [...c, { ...form, id: Date.now(), count: 0 }];
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      setCats(c => c.filter(x => x.id!==id));
      toast.success('Catégorie supprimée');
    } catch { toast.error('Erreur'); }
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h2 style={pageTitle}>Catégories</h2>
          <p style={pageSub}>{cats.length} catégorie(s) · {cats.reduce((a,c)=>a+c.count,0)} produits total</p>
        </div>
        <button onClick={()=>setModal({})} style={primaryBtn}>+ Ajouter une catégorie</button>
      </div>

      {loading
        ? <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>{[1,2,3,4,5,6].map(i=><div key={i} style={{ height:140,borderRadius:16,backgroundColor:'#F3F4F6',animation:'fa-pulse 1.5s ease-in-out infinite' }}/>)}</div>
        : <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16 }}>
            {cats.map(cat=>(
              <div key={cat.id} className="fa-stats-card" style={{ backgroundColor:cat.color||'#f9fafb',borderRadius:16,padding:'22px 20px',boxShadow:'0 2px 10px rgba(0,0,0,0.06)',border:'1px solid rgba(0,0,0,0.05)',position:'relative' }}>
                <div style={{ width:48,height:48,borderRadius:12,backgroundColor:'rgba(27,58,53,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10,fontFamily:"'Playfair Display', serif",fontSize:22,fontWeight:700,color:'#1B3A35' }}>{catLetter(cat)}</div>
                <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:700,color:'#111827',margin:0 }}>{cat.name}</p>
                <p style={{ fontFamily:'Inter, sans-serif',fontSize:12,color:'#6B7280',margin:'4px 0 14px' }}>{cat.count} produits</p>
                <div style={{ display:'flex',gap:8 }}>
                  <button onClick={()=>setModal(cat)} style={editBtn}>Modifier</button>
                  <button onClick={()=>setDelCat(cat)} style={{ ...editBtn,color:'#dc2626',borderColor:'#fecaca' }}>Suppr.</button>
                </div>
              </div>
            ))}
          </div>
      }

      {modal  && <CatModal cat={modal.id?modal:null} onClose={()=>setModal(null)} onSave={handleSave}/>}
      {delCat && <DeleteConfirm cat={delCat} onClose={()=>setDelCat(null)} onDelete={handleDelete}/>}
    </div>
  );
}

const pageTitle = { fontFamily:"'Playfair Display', serif",fontSize:24,fontWeight:700,color:'#111827',margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif',fontSize:13,color:'#6B7280',margin:'4px 0 0' };
const inp       = { width:'100%',padding:'9px 14px',borderRadius:10,border:'1.5px solid #E5E7EB',fontFamily:'Inter, sans-serif',fontSize:13,color:'#111827',outline:'none',backgroundColor:'#fff',boxSizing:'border-box' };
const lbl       = { fontFamily:'Inter, sans-serif',fontSize:11.5,fontWeight:600,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em' };
const modalTitle= { fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:700,color:'#111827',margin:0 };
const primaryBtn= { padding:'10px 22px',borderRadius:20,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' };
const cancelBtn = { padding:'9px 20px',borderRadius:10,border:'1.5px solid #E5E7EB',backgroundColor:'transparent',color:'#374151',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,cursor:'pointer' };
const saveBtn   = { padding:'9px 20px',borderRadius:10,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' };
const editBtn   = { padding:'5px 10px',borderRadius:8,border:'1px solid #E5E7EB',backgroundColor:'transparent',color:'#374151',cursor:'pointer',fontFamily:'Inter, sans-serif',fontSize:11.5,fontWeight:500 };
const closeBtn  = { background:'none',border:'none',cursor:'pointer',color:'#6B7280',fontSize:22,lineHeight:1 };
