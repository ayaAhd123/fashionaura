import { useState } from 'react';
import toast from 'react-hot-toast';

const MOCK = [
  { id:1, type:'order',   icon:'', title:'Nouvelle commande #1047',        message:'Nadia Chraibi vient de passer une commande de 1 010 MAD.',       time:'Il y a 15 min', read:false },
  { id:2, type:'review',  icon:'', title:'Nouvel avis 5 étoiles',          message:'Sara Farouk a laissé un avis sur « Chemisier Soie ».',            time:'Il y a 1h',    read:false },
  { id:3, type:'stock',   icon:'', title:'Stock faible — Robe Élégante',   message:'Il reste seulement 3 unités. Pensez à réapprovisionner.',         time:'Il y a 2h',    read:false },
  { id:4, type:'order',   icon:'', title:'Commande #1046 expédiée',        message:'La commande de Sara Farouk a été marquée comme expédiée.',        time:'Il y a 4h',    read:true  },
  { id:5, type:'follower',icon:'', title:'Nouveau follower',               message:'Amina Benali suit maintenant votre boutique.',                    time:'Hier',         read:true  },
  { id:6, type:'payment', icon:'', title:'Paiement reçu',                  message:'Virement de 4 200 MAD reçu pour la semaine du 19-25 mai.',        time:'Il y a 2j',    read:true  },
  { id:7, type:'report',  icon:'', title:'Rapport hebdomadaire disponible','message':'Votre rapport de la semaine 21 est prêt à consulter.',          time:'Il y a 3j',    read:true  },
  { id:8, type:'review',  icon:'', title:'Avis négatif — Robe Caftan',    message:'Fatima Zahra a laissé un avis 2 étoiles. Pensez à répondre.',    time:'Il y a 4j',    read:true  },
];

const TABS = ['Toutes','Non lues','Lues'];

export default function BoutiqueNotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK);
  const [tab, setTab] = useState('Toutes');

  const filtered = notifs.filter(n => {
    if (tab === 'Non lues') return !n.read;
    if (tab === 'Lues')     return n.read;
    return true;
  });

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(x => ({ ...x, read:true })));
    toast.success('Toutes les notifications marquées comme lues');
  };

  const markRead = (id) => setNotifs(prev => prev.map(x => x.id===id ? { ...x, read:true } : x));
  const deleteN  = (id) => { setNotifs(prev => prev.filter(x => x.id!==id)); toast.success('Notification supprimée'); };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={pageTitle}>Notifications</h2>
          <p style={pageSub}>{unread} non lue(s) · {notifs.length} au total</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={outlineBtn}>✓ Tout marquer comme lu</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, backgroundColor:'#F3F4F6', borderRadius:12, padding:4, width:'fit-content' }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px', borderRadius:9, border:'none', cursor:'pointer', backgroundColor:tab===t?'#fff':'transparent', color:tab===t?'#111827':'#6B7280', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:tab===t?600:400, boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.18s' }}>
            {t} {t==='Non lues' && unread>0 && <span style={{ backgroundColor:'#EF4444', color:'#fff', borderRadius:10, fontSize:10, padding:'1px 5px', marginLeft:4 }}>{unread}</span>}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <p style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:600, color:'#111827', marginBottom:4 }}>Aucune notification</p>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280' }}>Vous êtes à jour !</p>
          </div>
        ) : filtered.map(n=>(
          <div key={n.id} style={{ backgroundColor:n.read?'#fff':'rgba(201,168,76,0.05)', borderRadius:14, padding:'16px 20px', border:`1px solid ${n.read?'rgba(0,0,0,0.06)':'rgba(201,168,76,0.2)'}`, display:'flex', gap:14, alignItems:'flex-start', transition:'all 0.18s' }}>
            <div style={{ width:40, height:40, borderRadius:10, backgroundColor:n.read?'#F3F4F6':'rgba(201,168,76,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#374151', flexShrink:0 }}>{n.icon || (n.type?.charAt(0)?.toUpperCase() || 'N')}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:2 }}>
                <p style={{ fontFamily:'Inter, sans-serif', fontSize:13.5, fontWeight:n.read?500:700, color:'#111827', margin:0 }}>{n.title}</p>
                {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:'#C9A84C', flexShrink:0, marginTop:5 }}/>}
              </div>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:12.5, color:'#6B7280', margin:0, marginBottom:8 }}>{n.message}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#9CA3AF' }}>{n.time}</span>
                <div style={{ display:'flex', gap:8 }}>
                  {!n.read && <button onClick={()=>markRead(n.id)} style={actionBtn}>Marquer lu</button>}
                  <button onClick={()=>deleteN(n.id)} style={{ ...actionBtn, color:'#dc2626', borderColor:'#fecaca' }}>Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const pageTitle  = { fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:'#111827', margin:0 };
const pageSub    = { fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280', margin:'4px 0 0' };
const outlineBtn = { padding:'9px 18px', borderRadius:20, border:'1.5px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, cursor:'pointer' };
const actionBtn  = { padding:'4px 10px', borderRadius:8, border:'1px solid #E5E7EB', backgroundColor:'transparent', color:'#374151', fontFamily:'Inter, sans-serif', fontSize:11.5, fontWeight:500, cursor:'pointer' };
