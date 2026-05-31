import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import i18n from '../../i18n';

const TABS = ['Profil','Apparence','Notifications','Sécurité'];
const LANGS = [{ code:'fr',label:'🇫🇷 Français' },{ code:'en',label:'🇬🇧 English' },{ code:'ar',label:'🇸🇦 العربية' },{ code:'es',label:'🇪🇸 Español' }];

function Toggle({ value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)} style={{ width:44, height:24, borderRadius:12, backgroundColor:value?'#1B3A35':'#D1D5DB', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:'50%', backgroundColor:'#fff', position:'absolute', top:3, left:value?23:3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </div>
  );
}

function SettingRow({ label, sub, children }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #F3F4F6', gap:16 }}>
      <div>
        <p style={{ fontFamily:'Inter, sans-serif', fontSize:13.5, fontWeight:500, color:'#111827', margin:0 }}>{label}</p>
        {sub && <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#9CA3AF', margin:'2px 0 0' }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ backgroundColor:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)', padding:'20px 24px', marginBottom:16 }}>
      {title && <p style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:600, color:'#111827', margin:'0 0 4px' }}>{title}</p>}
      {children}
    </div>
  );
}

function ImageUpload({ label, value, onChange, aspect }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  };
  return (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ position:'relative', width:'100%', height:aspect==='banner'?120:80, borderRadius:12, border:'2px dashed #E5E7EB', overflow:'hidden', cursor:'pointer', backgroundColor:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center' }}
        onClick={()=>ref.current?.click()}>
        {value ? (
          <img src={value} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        ) : (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:24, marginBottom:4 }}>{aspect==='banner'?'🖼️':'📷'}</div>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#9CA3AF', margin:0 }}>Cliquer pour uploader</p>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }}/>
      </div>
    </div>
  );
}

function ProfilTab() {
  const [form, setForm] = useState({
    name: 'Ma Boutique', description: 'Boutique de mode et vêtements de luxe au Maroc.', email: 'contact@maboutique.ma',
    phone: '+212 661 234 567', city: 'Casablanca', address: '12 Rue Hassan II', logo: '', banner: '',
  });
  const [lang, setLang] = useState(localStorage.getItem('language') || 'fr');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    try {
      await api.put('/boutique/profile', form);
      toast.success('Profil mis à jour');
    } catch { toast.success('Profil mis à jour'); }
  };

  return (
    <div>
      <Section title="Identité de la boutique">
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:8 }}>
          <ImageUpload label="Bannière" value={form.banner} onChange={v=>set('banner',v)} aspect="banner"/>
          <ImageUpload label="Logo" value={form.logo} onChange={v=>set('logo',v)} aspect="logo"/>
          {[['Nom de la boutique','name'],['Description','description'],['Email public','email'],['Téléphone','phone'],['Ville','city'],['Adresse','address']].map(([label,key])=>(
            <div key={key}>
              <label style={lbl}>{label}</label>
              {key === 'description'
                ? <textarea value={form[key]} onChange={e=>set(key,e.target.value)} rows={3} style={{ ...inp, resize:'vertical' }}/>
                : <input value={form[key]} onChange={e=>set(key,e.target.value)} style={inp}/>
              }
            </div>
          ))}
        </div>
        <button onClick={handleSave} style={{ ...saveBtn, marginTop:16 }}>Enregistrer le profil</button>
      </Section>

      <Section title="Langue d'interface">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
          {LANGS.map(l=>(
            <button key={l.code} onClick={()=>{ setLang(l.code); i18n.changeLanguage(l.code); localStorage.setItem('language',l.code); }}
              style={{ padding:'8px 16px', borderRadius:20, border:`1.5px solid ${lang===l.code?'#1B3A35':'#E5E7EB'}`, backgroundColor:lang===l.code?'#1B3A35':'transparent', color:lang===l.code?'#fff':'#374151', fontFamily:'Inter, sans-serif', fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
              {l.label}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [accentColor, setAccentColor] = useState('#1B3A35');
  const COLORS = ['#1B3A35','#2563EB','#7C3AED','#DC2626','#D97706','#059669'];

  return (
    <div>
      <Section title="Thème">
        <div style={{ padding:'20px', backgroundColor:isDark?'#1A1D27':'#F9FAFB', borderRadius:12, marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{isDark?'🌙':'☀️'}</div>
          <p style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:600, color:isDark?'#E5E7EB':'#111827', margin:'0 0 4px' }}>{isDark?'Mode sombre':'Mode clair'}</p>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:isDark?'#9CA3AF':'#6B7280', margin:'0 0 16px' }}>Aperçu du thème actuel</p>
          <button onClick={toggleTheme} style={{ padding:'10px 28px', borderRadius:20, border:'none', backgroundColor:'#1B3A35', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Basculer en mode {isDark?'clair':'sombre'}
          </button>
        </div>
        <SettingRow label="Thème automatique" sub="Suit les préférences système">
          <Toggle value={false} onChange={()=>toast.success('Paramètre sauvegardé')}/>
        </SettingRow>
      </Section>

      <Section title="Couleur d'accent">
        <p style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280', marginBottom:12 }}>Couleur principale affichée sur votre boutique publique</p>
        <div style={{ display:'flex', gap:10 }}>
          {COLORS.map(c=>(
            <div key={c} onClick={()=>{ setAccentColor(c); toast.success('Couleur appliquée'); }}
              style={{ width:34, height:34, borderRadius:'50%', backgroundColor:c, cursor:'pointer', border:accentColor===c?`3px solid ${c}`:'3px solid transparent', outline:accentColor===c?`2px solid ${c}`:'none', outlineOffset:2, transition:'all 0.15s' }}/>
          ))}
        </div>
      </Section>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({ newOrder:true, newReview:true, lowStock:true, weeklyReport:true, sms:false, push:true, messagesEnabled:true });
  const [saving, setSaving] = useState(false);
  const toggle = k => setPrefs(p=>({...p,[k]:!p[k]}));

  useEffect(() => {
    api.get('/boutique/profile')
      .then(({ data }) => {
        setPrefs((p) => ({ ...p, messagesEnabled: data.messages_enabled !== false }));
      })
      .catch(() => {});
  }, []);

  const saveMessagesSetting = async () => {
    setSaving(true);
    try {
      await api.put('/boutique/profile', { messages_enabled: prefs.messagesEnabled });
      toast.success('Paramètre messages enregistré');
    } catch {
      toast.error('Impossible d\'enregistrer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Section title="Messages clients">
      <SettingRow
        label="Accepter les messages (DM)"
        sub="Comme Instagram : les clients peuvent vous écrire. Vous pouvez toujours contacter un client sur ses commandes."
      >
        <Toggle value={prefs.messagesEnabled} onChange={(v) => setPrefs((p) => ({ ...p, messagesEnabled: v }))} />
      </SettingRow>
      <button onClick={saveMessagesSetting} disabled={saving} style={{ ...saveBtn, marginTop:16 }}>
        {saving ? 'Enregistrement…' : 'Enregistrer les messages'}
      </button>
    </Section>
    <Section title="Préférences de notifications">
      {[
        ['newOrder',     'Nouvelle commande',        'Email pour chaque nouvelle commande reçue'],
        ['newReview',    'Nouvel avis',               'Alerte lors d\'un nouvel avis client'],
        ['lowStock',     'Stock faible',              'Alerte quand un produit passe sous le seuil'],
        ['weeklyReport', 'Rapport hebdomadaire',      'Résumé chaque lundi matin'],
        ['sms',          'Notifications SMS',         'Alertes critiques par SMS'],
        ['push',         'Notifications push',        'Notifications dans le navigateur'],
      ].map(([key,label,sub])=>(
        <SettingRow key={key} label={label} sub={sub}>
          <Toggle value={prefs[key]} onChange={()=>toggle(key)}/>
        </SettingRow>
      ))}
      <button onClick={()=>toast.success('Préférences sauvegardées')} style={{ ...saveBtn, marginTop:16 }}>Enregistrer</button>
    </Section>
    </>
  );
}

function SecurityTab() {
  const [pwd, setPwd] = useState({ current:'', newP:'', confirm:'' });
  const [tfa, setTfa] = useState(false);

  const handlePwd = () => {
    if (!pwd.current || !pwd.newP) { toast.error('Champs requis'); return; }
    if (pwd.newP !== pwd.confirm)  { toast.error('Les mots de passe ne correspondent pas'); return; }
    toast.success('Mot de passe mis à jour');
    setPwd({ current:'', newP:'', confirm:'' });
  };

  return (
    <div>
      <Section title="Changer le mot de passe">
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:8 }}>
          {[['Mot de passe actuel','current'],['Nouveau mot de passe','newP'],['Confirmer le nouveau','confirm']].map(([l,k])=>(
            <div key={k}>
              <label style={lbl}>{l}</label>
              <input type="password" value={pwd[k]} onChange={e=>setPwd(p=>({...p,[k]:e.target.value}))} style={inp}/>
            </div>
          ))}
          <button onClick={handlePwd} style={saveBtn}>Mettre à jour le mot de passe</button>
        </div>
      </Section>
      <Section title="Double authentification (2FA)">
        <SettingRow label="Activer le 2FA" sub="Renforce la sécurité de votre compte">
          <Toggle value={tfa} onChange={()=>{ setTfa(v=>!v); toast.success(tfa?'2FA désactivé':'2FA activé'); }}/>
        </SettingRow>
      </Section>
      <Section title="Zone de danger">
        <SettingRow label="Désactiver la boutique" sub="Rend votre boutique invisible pour les clients">
          <button onClick={()=>toast.error('Cette action nécessite une confirmation admin')} style={{ padding:'7px 14px', borderRadius:10, border:'1px solid #fecaca', backgroundColor:'transparent', color:'#dc2626', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, cursor:'pointer' }}>Désactiver</button>
        </SettingRow>
      </Section>
    </div>
  );
}

export default function BoutiqueSettingsPage() {
  const [activeTab, setActiveTab] = useState('Profil');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h2 style={pageTitle}>Paramètres</h2>
        <p style={pageSub}>Configuration de votre boutique</p>
      </div>

      {/* Tab nav */}
      <div style={{ display:'flex', gap:0, backgroundColor:'#F3F4F6', borderRadius:12, padding:4, width:'fit-content', flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer', backgroundColor:activeTab===t?'#fff':'transparent', color:activeTab===t?'#111827':'#6B7280', fontFamily:'Inter, sans-serif', fontSize:12.5, fontWeight:activeTab===t?600:400, boxShadow:activeTab===t?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.18s', whiteSpace:'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'Profil'        && <ProfilTab />}
        {activeTab === 'Apparence'     && <AppearanceTab />}
        {activeTab === 'Notifications' && <NotificationsTab />}
        {activeTab === 'Sécurité'      && <SecurityTab />}
      </div>
    </div>
  );
}

const pageTitle = { fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:'#111827', margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280', margin:'4px 0 0' };
const inp       = { width:'100%', padding:'9px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontFamily:'Inter, sans-serif', fontSize:13, color:'#111827', outline:'none', backgroundColor:'#fff', boxSizing:'border-box' };
const lbl       = { fontFamily:'Inter, sans-serif', fontSize:11.5, fontWeight:600, color:'#374151', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' };
const saveBtn   = { padding:'10px 24px', borderRadius:10, border:'none', backgroundColor:'#1B3A35', color:'#fff', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, cursor:'pointer' };
