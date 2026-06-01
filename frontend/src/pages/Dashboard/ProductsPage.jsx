import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { resolveMediaUrl } from '../../utils/imageUtils';

/* ── helpers ───────────────────────────────────────────────── */
function StockBadge({ stock, threshold = 5 }) {
  if (stock === 0)            return <span style={badge('#fef2f2','#dc2626')}>Rupture</span>;
  if (stock <= threshold)     return <span style={badge('#fff7ed','#c2410c')}>Stock faible</span>;
  return <span style={badge('#f0fdf4','#15803d')}>En stock</span>;
}
function StatusBadge({ active }) {
  return <span style={badge(active?'#f0fdf4':'#f3f4f6',active?'#15803d':'#6B7280')}>{active?'Actif':'Inactif'}</span>;
}
const badge = (bg,color) => ({ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,fontFamily:'Inter, sans-serif',backgroundColor:bg,color });

const MOCK_CATS = [{ id:1,name:'Robes' },{ id:2,name:'Chemises' },{ id:3,name:'Accessoires' },{ id:4,name:'Chaussures' },{ id:5,name:'Manteaux' }];
const MOCK_PRODS = [
  { id:1, name:'Robe Émeraude',   price:1250, stock_quantity:3,  category_id:1, is_active:true,  image:null, description:'Robe élégante en soie verte.',  style:'luxury',  threshold:5 },
  { id:2, name:'Caftan Or',       price:3400, stock_quantity:8,  category_id:1, is_active:true,  image:null, description:'Caftan traditionnel brodé.',      style:'luxury',  threshold:5 },
  { id:3, name:'Veste Bordeaux',  price:890,  stock_quantity:12, category_id:2, is_active:true,  image:null, description:'Veste coupe moderne bordeaux.',   style:'formal',  threshold:5 },
  { id:4, name:'Sac Cuir Brun',   price:680,  stock_quantity:0,  category_id:3, is_active:false, image:null, description:'Sac artisanal en cuir naturel.',  style:'casual',  threshold:5 },
  { id:5, name:'Sandales Tan',    price:420,  stock_quantity:7,  category_id:4, is_active:true,  image:null, description:'Sandales légères pour l\'été.',    style:'casual',  threshold:5 },
  { id:6, name:'Manteau Camel',   price:2200, stock_quantity:4,  category_id:5, is_active:true,  image:null, description:'Manteau en laine premium camel.', style:'formal',  threshold:5 },
];

const EMPTY_FORM = { name:'', description:'', price:'', stock_quantity:'', category_id:'', style:'casual', is_active:true, threshold:5 };
const CUSTOM_CATEGORY = '__custom__';

/* ── Product Modal ────────────────────────────────────────── */
function ProductModal({ product, categories, onClose, onSave }) {
  const initialCategoryId = product?.category_id ? String(product.category_id) : '';
  const categoryInList = product?.category_id && categories.some((c) => c.id === Number(product.category_id));

  const [form, setForm] = useState(product ? {
    id: product.id, name: product.name, description: product.description||'',
    price: product.price, stock_quantity: product.stock_quantity,
    category_id: categoryInList ? initialCategoryId : CUSTOM_CATEGORY,
    style: product.style||'casual',
    is_active: product.is_active!==false, threshold: product.threshold||5,
  } : { ...EMPTY_FORM });
  const [customCategory, setCustomCategory] = useState(
    product && !categoryInList ? (product.category || product.category_name || '') : ''
  );
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image_url ? resolveMediaUrl(product.image_url) : null);
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const isEdit = !!product;

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nom requis'); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Prix invalide'); return; }
    const useCustomCategory = form.category_id === CUSTOM_CATEGORY;
    if (useCustomCategory) {
      if (!customCategory.trim()) { toast.error('Saisissez le nom de la catégorie'); return; }
    } else if (!form.category_id) {
      toast.error('Catégorie requise');
      return;
    }
    if (!isEdit && !imageFile) { toast.error('Photo du produit requise'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description || '');
      fd.append('price', form.price);
      fd.append('stock_quantity', form.stock_quantity || 0);
      if (useCustomCategory) {
        fd.append('category_name', customCategory.trim());
      } else {
        fd.append('category_id', form.category_id);
      }
      fd.append('style', form.style || 'casual');
      fd.append('is_active', form.is_active ? '1' : '0');
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) {
        fd.append('_method', 'PUT');
        await api.post(`/boutique/products/${form.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produit mis à jour');
      } else {
        await api.post('/boutique/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produit créé');
      }
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.image?.[0];
      toast.error(msg || 'Erreur lors de l\'enregistrement');
    }
    finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',zIndex:90 }}/>
      <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:520,maxHeight:'90vh',backgroundColor:'#fff',borderRadius:20,zIndex:100,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',display:'flex',flexDirection:'column',overflow:'hidden' }}>
        <div style={{ padding:'20px 28px',borderBottom:'1px solid #F3F4F6',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
          <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:700,color:'#111827',margin:0 }}>{isEdit?'Modifier':'Ajouter'} un produit</p>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'20px 28px',display:'flex',flexDirection:'column',gap:14 }}>
          <div>
            <label style={lbl}>Photo du produit {!isEdit && '*'}</label>
            <div style={{ display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ width:88, height:88, borderRadius:12, background:'#F3F4F6', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {preview ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span style={{ fontSize:11, color:'#9CA3AF' }}>Aperçu</span>}
              </div>
              <input type="file" accept="image/*" onChange={onImageChange} style={{ fontFamily:'Inter, sans-serif', fontSize:12.5 }}/>
            </div>
          </div>
          <div>
            <label style={lbl}>Nom du produit *</label>
            <input value={form.name} onChange={e=>set('name',e.target.value)} style={inp} placeholder="Ex: Robe Émeraude"/>
          </div>
          <div>
            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={3} style={{ ...inp,resize:'none',height:72 }}/>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div>
              <label style={lbl}>Prix (MAD) *</label>
              <input type="number" min="0" value={form.price} onChange={e=>set('price',e.target.value)} style={inp} placeholder="0"/>
            </div>
            <div>
              <label style={lbl}>Stock</label>
              <input type="number" min="0" value={form.stock_quantity} onChange={e=>set('stock_quantity',e.target.value)} style={inp} placeholder="0"/>
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div>
              <label style={lbl}>Catégorie *</label>
              <select
                value={form.category_id}
                onChange={(e) => {
                  set('category_id', e.target.value);
                  if (e.target.value !== CUSTOM_CATEGORY) setCustomCategory('');
                }}
                style={inp}
              >
                <option value="">Sélectionner…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value={CUSTOM_CATEGORY}>Autre — saisir une catégorie</option>
              </select>
              {form.category_id === CUSTOM_CATEGORY && (
                <input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{ ...inp, marginTop: 8 }}
                  placeholder="Ex: Bijoux, Paréos, Ensemble mariée…"
                  maxLength={255}
                />
              )}
            </div>
            <div>
              <label style={lbl}>Seuil alerte stock</label>
              <input type="number" min="0" value={form.threshold} onChange={e=>set('threshold',Number(e.target.value))} style={inp}/>
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div onClick={()=>set('is_active',!form.is_active)} style={{ width:44,height:24,borderRadius:12,backgroundColor:form.is_active?'#1B3A35':'#D1D5DB',cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0 }}>
              <div style={{ width:18,height:18,borderRadius:'50%',backgroundColor:'#fff',position:'absolute',top:3,left:form.is_active?23:3,transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
            </div>
            <span style={{ fontFamily:'Inter, sans-serif',fontSize:13,color:'#374151' }}>Produit actif</span>
          </div>
        </div>
        <div style={{ padding:'16px 28px',borderTop:'1px solid #F3F4F6',display:'flex',gap:10,justifyContent:'flex-end',flexShrink:0 }}>
          <button onClick={onClose} style={cancelBtn}>Annuler</button>
          <button onClick={handleSave} disabled={saving} style={saveBtn}>{saving?'Enregistrement…':isEdit?'Mettre à jour':'Créer le produit'}</button>
        </div>
      </div>
    </>
  );
}

/* ── BoutiqueProductsPage (Dashboard/ProductsPage) ────────── */
export default function ProductsPage() {
  const [products,   setProducts]   = useState(MOCK_PRODS);
  const [categories, setCategories] = useState(MOCK_CATS);
  const [loading,    setLoading]    = useState(false);
  const [view,       setView]       = useState(() => localStorage.getItem('products-view')||'grid');
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [statusFilter,setStatusFilter] = useState('');
  const [page,       setPage]       = useState(1);
  const [modal,      setModal]      = useState(null);
  const [delProd,    setDelProd]    = useState(null);
  const [selected,   setSelected]   = useState([]);
  const PER_PAGE_GRID = 12, PER_PAGE_LIST = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/boutique/products'),
          api.get('/boutique/products/categories'),
        ]);
        if (prodRes.data?.data?.length) setProducts(prodRes.data.data);
        if (catRes.data?.data?.length)  setCategories(catRes.data.data);
      } catch {/* use mock */}
      finally { setLoading(false); }
    })();
  }, []);

  const setViewMode = (v) => { setView(v); localStorage.setItem('products-view', v); };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name?.toLowerCase().includes(q);
    const matchC = !catFilter || String(p.category_id) === catFilter;
    const matchS = !statusFilter || (statusFilter==='active'?p.is_active!==false:p.is_active===false);
    return matchQ && matchC && matchS;
  });

  const perPage = view === 'grid' ? PER_PAGE_GRID : PER_PAGE_LIST;
  const pages  = Math.ceil(filtered.length / perPage);
  const paged  = filtered.slice((page-1)*perPage, page*perPage);

  const toggleSelect = (id) => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/boutique/products/${id}`);
      setProducts(p=>p.filter(x=>x.id!==id));
      toast.success('Produit supprimé');
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/boutique/products'),
        api.get('/boutique/products/categories'),
      ]);
      if (Array.isArray(prodRes.data?.data)) setProducts(prodRes.data.data);
      if (Array.isArray(catRes.data?.data)) setCategories(catRes.data.data);
    } catch {/* keep current */}
    finally { setLoading(false); }
  };

  const getCatName = (id) => categories.find(c=>c.id===Number(id))?.name||'—';

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h2 style={pageTitle}>Produits</h2>
          <p style={pageSub}>{filtered.length} produit(s) · {products.filter(p=>p.stock_quantity===0).length} en rupture</p>
        </div>
        <button onClick={()=>setModal({})} style={primaryBtn}>+ Ajouter un produit</button>
      </div>

      {/* Controls */}
      <div style={{ display:'flex',gap:10,flexWrap:'wrap',alignItems:'center' }}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Rechercher…" style={{ ...inp,width:240 }}/>
        <select value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1);}} style={{ ...inp,width:160 }}>
          <option value="">Toutes catégories</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}} style={{ ...inp,width:140 }}>
          <option value="">Tous statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
        {/* View toggle */}
        <div style={{ display:'flex',gap:0,backgroundColor:'#F3F4F6',borderRadius:10,padding:3,marginLeft:'auto' }}>
          {[['grid','⊞'],['list','']].map(([v,icon])=>(
            <button key={v} onClick={()=>setViewMode(v)} style={{ width:36,height:30,borderRadius:8,border:'none',cursor:'pointer',backgroundColor:view===v?'#fff':'transparent',color:view===v?'#111827':'#9CA3AF',fontSize:16 }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16 }}>
          {loading ? [1,2,3,4,5,6].map(i=><div key={i} style={{ height:260,borderRadius:16,backgroundColor:'#F3F4F6',animation:'fa-pulse 1.5s ease-in-out infinite' }}/>) :
            paged.map(p=>(
              <div key={p.id} className="fa-stats-card" style={{ backgroundColor:'#fff',borderRadius:16,border:'1px solid rgba(0,0,0,0.06)',boxShadow:'0 2px 10px rgba(0,0,0,0.06)',overflow:'hidden' }}>
                <div style={{ height:140,backgroundColor:'#F9FAFB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,overflow:'hidden' }}>
                  {p.image_url ? <img src={resolveMediaUrl(p.image_url)} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : ''}
                </div>
                <div style={{ padding:'14px 16px' }}>
                  <p style={{ fontFamily:'Inter, sans-serif',fontSize:13.5,fontWeight:600,color:'#111827',margin:'0 0 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.name}</p>
                  <p style={{ fontFamily:"'Playfair Display', serif",fontSize:16,fontWeight:700,color:'#111827',margin:'0 0 8px' }}>{Number(p.price).toLocaleString('fr-FR')} MAD</p>
                  <div style={{ display:'flex',gap:6,marginBottom:10,flexWrap:'wrap' }}>
                    <StockBadge stock={p.stock_quantity} threshold={p.threshold}/>
                    <StatusBadge active={p.is_active!==false}/>
                  </div>
                  <div style={{ display:'flex',gap:6 }}>
                    <button onClick={()=>setModal(p)} style={{ ...editBtn,flex:1 }}>Modifier</button>
                    <button onClick={()=>setDelProd(p)} style={{ ...editBtn,color:'#dc2626',borderColor:'#fecaca',flex:1 }}>Suppr.</button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div style={card}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr style={{ backgroundColor:'#F9FAFB' }}>{['Produit','Catégorie','Prix','Stock','Statut','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {loading ? [1,2,3].map(i=><tr key={i}><td colSpan={6} style={{padding:16}}><div style={skLine}/></td></tr>)
                  : paged.map(p=>(
                    <tr key={p.id} className="fa-table-row" style={{ borderTop:'1px solid #F3F4F6' }}>
                      <td style={td}>
                        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                          <div style={{ width:38,height:38,borderRadius:8,backgroundColor:'#F9FAFB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,overflow:'hidden' }}>
                            {p.image_url ? <img src={resolveMediaUrl(p.image_url)} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : ''}
                          </div>
                          <span style={{ fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,color:'#111827' }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={td}><span style={tdText}>{getCatName(p.category_id)}</span></td>
                      <td style={td}><span style={{ fontFamily:"'Playfair Display', serif",fontSize:15,fontWeight:600,color:'#111827' }}>{Number(p.price).toLocaleString('fr-FR')} MAD</span></td>
                      <td style={td}><StockBadge stock={p.stock_quantity} threshold={p.threshold}/></td>
                      <td style={td}><StatusBadge active={p.is_active!==false}/></td>
                      <td style={td}>
                        <div style={{ display:'flex',gap:6 }}>
                          <button onClick={()=>setModal(p)} style={editBtn}>Modifier</button>
                          <button onClick={()=>setDelProd(p)} style={{...editBtn,color:'#dc2626',borderColor:'#fecaca'}}>Suppr.</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div style={{ padding:'14px 24px',borderTop:'1px solid #F3F4F6',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontFamily:'Inter, sans-serif',fontSize:13,color:'#6B7280' }}>{(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} sur {filtered.length}</span>
              <div style={{ display:'flex',gap:6 }}>
                {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)} style={{ width:32,height:32,borderRadius:8,border:'none',cursor:'pointer',backgroundColor:p===page?'#1B3A35':'#F3F4F6',color:p===page?'#fff':'#374151',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:p===page?600:400 }}>{p}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid pagination */}
      {view === 'grid' && pages > 1 && (
        <div style={{ display:'flex',justifyContent:'center',gap:6 }}>
          {Array.from({length:pages},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)} style={{ width:32,height:32,borderRadius:8,border:'none',cursor:'pointer',backgroundColor:p===page?'#1B3A35':'#F3F4F6',color:p===page?'#fff':'#374151',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:p===page?600:400 }}>{p}</button>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {delProd && (
        <>
          <div onClick={()=>setDelProd(null)} style={{ position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',zIndex:90 }}/>
          <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:360,backgroundColor:'#fff',borderRadius:20,zIndex:100,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',padding:28,textAlign:'center' }}>
            <div style={{ fontSize:36,marginBottom:12 }}></div>
            <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:700,color:'#111827',marginBottom:8 }}>Supprimer «{delProd.name}» ?</p>
            <p style={{ fontFamily:'Inter, sans-serif',fontSize:13,color:'#6B7280',marginBottom:20 }}>Cette action est irréversible.</p>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>setDelProd(null)} style={{...cancelBtn,flex:1}}>Annuler</button>
              <button onClick={()=>{handleDelete(delProd.id);setDelProd(null);}} style={{ flex:1,padding:'9px 20px',borderRadius:10,border:'none',backgroundColor:'#dc2626',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' }}>Supprimer</button>
            </div>
          </div>
        </>
      )}

      {modal && <ProductModal product={modal.id?modal:null} categories={categories} onClose={()=>setModal(null)} onSave={handleSave}/>}
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
const lbl       = { fontFamily:'Inter, sans-serif',fontSize:11.5,fontWeight:600,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em' };
const primaryBtn= { padding:'10px 22px',borderRadius:20,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' };
const cancelBtn = { padding:'9px 20px',borderRadius:10,border:'1.5px solid #E5E7EB',backgroundColor:'transparent',color:'#374151',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,cursor:'pointer' };
const saveBtn   = { padding:'9px 20px',borderRadius:10,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' };
const editBtn   = { padding:'5px 10px',borderRadius:8,border:'1px solid #E5E7EB',backgroundColor:'transparent',color:'#374151',cursor:'pointer',fontFamily:'Inter, sans-serif',fontSize:11.5,fontWeight:500 };
const closeBtn  = { background:'none',border:'none',cursor:'pointer',color:'#6B7280',fontSize:22,lineHeight:1 };
const skLine    = { height:14,borderRadius:7,background:'#F3F4F6',animation:'fa-pulse 1.5s ease-in-out infinite' };
