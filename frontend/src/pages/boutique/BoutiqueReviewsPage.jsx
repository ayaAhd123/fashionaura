import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MOCK = [
  { id:1, client:'Nadia Chraibi',  avatar:'NC', product:'Robe Élégante',   rating:5, comment:'Magnifique robe, qualité exceptionnelle ! La couture est parfaite et le tissu est doux.', date:'2026-05-26', reply:null,    reported:false },
  { id:2, client:'Sara Farouk',    avatar:'SF', product:'Chemisier Soie',   rating:4, comment:'Très beau chemisier, conforme à la description. La livraison était rapide.', date:'2026-05-25', reply:'Merci Sara ! Nous sommes ravis que vous soyez satisfaite.',    reported:false },
  { id:3, client:'Amina Benali',   avatar:'AB', product:'Kaftan Brodé',    rating:5, comment:'Wouah ! Ce kaftan est une merveille. Je l\'ai porté à un mariage et j\'ai eu tellement de compliments.',  date:'2026-05-24', reply:null,    reported:false },
  { id:4, client:'Karima Idrissi', avatar:'KI', product:'Djellaba Luxe',   rating:3, comment:'Bonne qualité mais la taille est un peu grande par rapport au guide. Il faudrait revoir les tailles.',   date:'2026-05-23', reply:'Bonjour Karima, merci pour votre retour. Nous allons améliorer notre guide des tailles.', reported:false },
  { id:5, client:'Fatima Zahra',   avatar:'FZ', product:'Robe Caftan',     rating:2, comment:'Déçue. La couleur reçue ne correspond pas à la photo. Je m\'attendais à un rouge foncé.', date:'2026-05-22', reply:null,    reported:true  },
  { id:6, client:'Laila Bennani',  avatar:'LB', product:'Abaya Noire',     rating:5, comment:'Parfait ! Exactement comme sur les photos, très belle finition et tissu de grande qualité.',  date:'2026-05-21', reply:null,    reported:false },
  { id:7, client:'Houda Mrani',    avatar:'HM', product:'Jupe Longue',     rating:4, comment:'Belle jupe, tissu fluide et agréable à porter. Je recommande cette boutique.',                 date:'2026-05-20', reply:'Merci Houda, votre satisfaction est notre priorité !', reported:false },
  { id:8, client:'Zineb Alaoui',   avatar:'ZA', product:'Robe Maxi',      rating:1, comment:'Très mauvaise expérience. La commande a mis 3 semaines. Qualité décevante pour le prix.',      date:'2026-05-19', reply:null,    reported:true  },
];

const TABS = ['Tous','Non répondus','Répondus','Signalés'];

function Stars({ rating, size=14 }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(i=>(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i<=rating?'#C9A84C':'#E5E7EB'} stroke={i<=rating?'#C9A84C':'#D1D5DB'} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ value, count, total }) {
  const pct = total > 0 ? (count/total)*100 : 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#374151', width:6 }}>{value}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      <div style={{ flex:1, height:6, backgroundColor:'#F3F4F6', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, backgroundColor:'#C9A84C', borderRadius:3, transition:'width 0.5s ease' }}/>
      </div>
      <span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#9CA3AF', width:14, textAlign:'right' }}>{count}</span>
    </div>
  );
}

export default function BoutiqueReviewsPage() {
  const [reviews, setReviews] = useState(MOCK);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('Tous');
  const [search, setSearch] = useState('');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/boutique/reviews').then(r => {
      if (r.data?.data?.length) setReviews(r.data.data);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.client.toLowerCase().includes(q) || r.product.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
    if (tab === 'Non répondus') return matchQ && !r.reply && !r.reported;
    if (tab === 'Répondus')     return matchQ && !!r.reply;
    if (tab === 'Signalés')     return matchQ && r.reported;
    return matchQ;
  });

  const avgRating = reviews.length ? (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1) : 0;
  const unread = reviews.filter(r=>!r.reply && !r.reported).length;

  const handleReply = async (id) => {
    if (!replyText.trim()) { toast.error('Réponse vide'); return; }
    try {
      await api.post(`/boutique/reviews/${id}/reply`, { reply: replyText });
    } catch {}
    setReviews(prev => prev.map(r => r.id===id ? {...r, reply:replyText} : r));
    toast.success('Réponse envoyée');
    setReplyingId(null);
    setReplyText('');
  };

  const handleReport = (id) => {
    setReviews(prev => prev.map(r => r.id===id ? {...r, reported:true} : r));
    toast.success('Avis signalé');
  };

  const ratingCounts = [5,4,3,2,1].map(v=>({ value:v, count:reviews.filter(r=>r.rating===v).length }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={pageTitle}>Avis clients</h2>
          <p style={pageSub}>{reviews.length} avis · {unread} en attente de réponse</p>
        </div>
      </div>

      {/* Rating summary */}
      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:24, backgroundColor:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)', padding:'20px 24px', alignItems:'center' }}>
        <div style={{ textAlign:'center', padding:'0 20px', borderRight:'1px solid #F3F4F6' }}>
          <p style={{ fontFamily:"'Playfair Display', serif", fontSize:52, fontWeight:700, color:'#111827', margin:'0 0 4px' }}>{avgRating}</p>
          <Stars rating={Math.round(avgRating)} size={18}/>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#9CA3AF', margin:'6px 0 0' }}>{reviews.length} avis</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, paddingLeft:8 }}>
          {ratingCounts.map(({value,count})=>(
            <RatingBar key={value} value={value} count={count} total={reviews.length}/>
          ))}
        </div>
      </div>

      {/* Tabs + search */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:0, backgroundColor:'#F3F4F6', borderRadius:12, padding:4 }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'7px 16px', borderRadius:9, border:'none', cursor:'pointer', backgroundColor:tab===t?'#fff':'transparent', color:tab===t?'#111827':'#6B7280', fontFamily:'Inter, sans-serif', fontSize:12.5, fontWeight:tab===t?600:400, boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.18s', whiteSpace:'nowrap' }}>
              {t} {t==='Signalés' && reviews.filter(r=>r.reported).length > 0 && <span style={{ backgroundColor:'#EF4444', color:'#fff', borderRadius:10, fontSize:10, padding:'1px 5px', marginLeft:4 }}>{reviews.filter(r=>r.reported).length}</span>}
            </button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Client, produit ou mot-clé…"
          style={{ ...inp, width:260 }}/>
      </div>

      {/* Reviews list */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {loading ? [1,2,3].map(i=>(
          <div key={i} style={{ backgroundColor:'#fff', borderRadius:14, padding:20 }}><div style={skLine}/></div>
        )) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', backgroundColor:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⭐</div>
            <p style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:600, color:'#111827', margin:0 }}>Aucun avis trouvé</p>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280' }}>Essayez de modifier vos filtres</p>
          </div>
        ) : filtered.map(r=>(
          <div key={r.id} style={{ backgroundColor:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:`1px solid ${r.reported?'rgba(239,68,68,0.2)':'rgba(0,0,0,0.06)'}`, padding:'20px 24px' }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', backgroundColor:'#1B3A35', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:700, flexShrink:0 }}>{r.avatar}</div>
                <div>
                  <p style={{ fontFamily:'Inter, sans-serif', fontSize:13.5, fontWeight:600, color:'#111827', margin:0 }}>{r.client}</p>
                  <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#9CA3AF', margin:'2px 0 0' }}>Sur : <span style={{ color:'#374151', fontWeight:500 }}>{r.product}</span> · {r.date}</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {r.reported && <span style={{ backgroundColor:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700, fontFamily:'Inter, sans-serif' }}>Signalé</span>}
                <Stars rating={r.rating}/>
              </div>
            </div>

            {/* Comment */}
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:13.5, color:'#374151', lineHeight:1.6, margin:'0 0 12px', paddingLeft:52 }}>{r.comment}</p>

            {/* Existing reply */}
            {r.reply && (
              <div style={{ marginLeft:52, backgroundColor:'#F0FDF4', borderRadius:10, padding:'12px 16px', borderLeft:'3px solid #1B3A35' }}>
                <p style={{ fontFamily:'Inter, sans-serif', fontSize:11.5, fontWeight:700, color:'#1B3A35', margin:'0 0 4px' }}>Votre réponse</p>
                <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#374151', margin:0, lineHeight:1.5 }}>{r.reply}</p>
              </div>
            )}

            {/* Reply form */}
            {replyingId === r.id && (
              <div style={{ marginLeft:52, marginTop:10 }}>
                <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} rows={3} placeholder="Écrivez votre réponse…"
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #1B3A35', fontFamily:'Inter, sans-serif', fontSize:13, color:'#111827', outline:'none', resize:'vertical', boxSizing:'border-box' }}/>
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <button onClick={()=>handleReply(r.id)} style={{ padding:'7px 16px', borderRadius:10, border:'none', backgroundColor:'#1B3A35', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:12.5, fontWeight:600, cursor:'pointer' }}>Envoyer</button>
                  <button onClick={()=>{setReplyingId(null);setReplyText('');}} style={{ padding:'7px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:12.5, cursor:'pointer' }}>Annuler</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:'flex', gap:8, marginLeft:52, marginTop:r.reply||replyingId===r.id?12:0 }}>
              {!r.reply && replyingId !== r.id && (
                <button onClick={()=>{setReplyingId(r.id);setReplyText('');}} style={actionBtn}>💬 Répondre</button>
              )}
              {!r.reported && (
                <button onClick={()=>handleReport(r.id)} style={{ ...actionBtn, color:'#dc2626', borderColor:'#fecaca' }}>🚩 Signaler</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const pageTitle = { fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:'#111827', margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280', margin:'4px 0 0' };
const inp       = { padding:'9px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:'Inter, sans-serif', fontSize:13, color:'#111827', outline:'none', backgroundColor:'#fff', boxSizing:'border-box' };
const actionBtn = { padding:'5px 12px', borderRadius:8, border:'1px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, cursor:'pointer' };
const skLine    = { height:14, borderRadius:7, background:'#F3F4F6', animation:'fa-pulse 1.5s ease-in-out infinite' };
