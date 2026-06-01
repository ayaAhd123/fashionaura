import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import i18n from '../../i18n';

const TABS = ['Général','Apparence','Notifications','Sécurité','Avancé'];
const LANGS = [{ code:'fr',label:'Français' },{ code:'en',label:'English' },{ code:'ar',label:'العربية' },{ code:'es',label:'Español' }];

function Toggle({ value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)} style={{ width:44,height:24,borderRadius:12,backgroundColor:value?'#1B3A35':'#D1D5DB',cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0 }}>
      <div style={{ width:18,height:18,borderRadius:'50%',backgroundColor:'#fff',position:'absolute',top:3,left:value?23:3,transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </div>
  );
}

function SettingRow({ label, sub, children }) {
  return (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:'1px solid #F3F4F6',gap:16 }}>
      <div>
        <p style={{ fontFamily:'Inter, sans-serif',fontSize:13.5,fontWeight:500,color:'#111827',margin:0 }}>{label}</p>
        {sub && <p style={{ fontFamily:'Inter, sans-serif',fontSize:12,color:'#9CA3AF',margin:'2px 0 0' }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ backgroundColor:'#fff',borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid rgba(0,0,0,0.06)',padding:'20px 24px',marginBottom:16 }}>
      {title && <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:600,color:'#111827',margin:'0 0 4px' }}>{title}</p>}
      {children}
    </div>
  );
}

/* ── Tab components ────────────────────────────────────────── */
function GeneralTab() {
  const [form, setForm] = useState({ platform:'FashionAura', currency:'MAD', lang:'fr', timezone:'Africa/Casablanca' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const save = () => toast.success('Paramètres généraux enregistrés');

  return (
    <Section title="Paramètres généraux">
      <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
        <div>
          <label style={lbl}>Nom de la plateforme</label>
          <input value={form.platform} onChange={e=>set('platform',e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Devise</label>
          <select value={form.currency} onChange={e=>set('currency',e.target.value)} style={inp}>
            <option value="MAD">MAD — Dirham marocain</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — Dollar américain</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Langue par défaut</label>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>{set('lang',l.code);i18n.changeLanguage(l.code);localStorage.setItem('language',l.code);}} style={{ padding:'8px 16px',borderRadius:20,border:`1.5px solid ${form.lang===l.code?'#1B3A35':'#E5E7EB'}`,backgroundColor:form.lang===l.code?'#1B3A35':'transparent',color:form.lang===l.code?'#fff':'#374151',fontFamily:'Inter, sans-serif',fontSize:12.5,fontWeight:600,cursor:'pointer' }}>{l.label}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={lbl}>Fuseau horaire</label>
          <select value={form.timezone} onChange={e=>set('timezone',e.target.value)} style={inp}>
            <option value="Africa/Casablanca">Africa/Casablanca (UTC+1)</option>
            <option value="Europe/Paris">Europe/Paris (UTC+2)</option>
          </select>
        </div>
        <button onClick={save} style={saveBtn}>Enregistrer les paramètres</button>
      </div>
    </Section>
  );
}

function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Section title="Apparence">
      <div style={{ padding:'20px',backgroundColor:isDark?'#1A1D27':'#F9FAFB',borderRadius:12,marginBottom:16,textAlign:'center' }}>
        <p style={{ fontFamily:"'Playfair Display', serif",fontSize:18,fontWeight:600,color:isDark?'#E5E7EB':'#111827',margin:'0 0 4px' }}>{isDark?'Mode sombre':'Mode clair'}</p>
        <p style={{ fontFamily:'Inter, sans-serif',fontSize:13,color:isDark?'#9CA3AF':'#6B7280',margin:'0 0 16px' }}>Aperçu du thème actuel</p>
        <button onClick={toggleTheme} style={{ padding:'10px 28px',borderRadius:20,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' }}>
          Basculer en mode {isDark?'clair':'sombre'}
        </button>
      </div>
      <SettingRow label="Thème automatique" sub="Suit les préférences système">
        <Toggle value={false} onChange={()=>toast.success('Paramètre sauvegardé')}/>
      </SettingRow>
    </Section>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({ newOrder:true, newBoutique:true, newReview:false, weeklyReport:true, sms:false, push:true });
  const set = (k) => setPrefs(p=>({...p,[k]:!p[k]}));
  return (
    <Section title="Préférences de notifications">
      {[
        ['newOrder',     'Nouvelle commande',            'Recevoir un email pour chaque commande'],
        ['newBoutique',  'Nouvelle boutique',            'Validation de boutique requise'],
        ['newReview',    'Nouvel avis',                  'Avis clients sur la plateforme'],
        ['weeklyReport', 'Rapport hebdomadaire',         'Résumé chaque lundi matin'],
        ['sms',          'Notifications SMS',            'Alertes critiques par SMS'],
        ['push',         'Notifications push',           'Dans le navigateur'],
      ].map(([key,label,sub])=>(
        <SettingRow key={key} label={label} sub={sub}>
          <Toggle value={prefs[key]} onChange={()=>set(key)}/>
        </SettingRow>
      ))}
      <button onClick={()=>toast.success('Préférences sauvegardées')} style={{ ...saveBtn,marginTop:16 }}>Enregistrer</button>
    </Section>
  );
}

function SecurityTab() {
  const [pwd, setPwd] = useState({ current:'',newP:'',confirm:'' });
  const [tfa, setTfa] = useState(false);
  const sessions = [
    { device:'Chrome · Windows 11', ip:'82.45.12.34', location:'Casablanca', last:'Maintenant', current:true },
    { device:'Safari · iPhone 14',  ip:'91.123.45.67', location:'Rabat',     last:'Il y a 2h',  current:false },
  ];

  const handlePwd = () => {
    if (!pwd.current || !pwd.newP) { toast.error('Champs requis'); return; }
    if (pwd.newP !== pwd.confirm)  { toast.error('Les mots de passe ne correspondent pas'); return; }
    toast.success('Mot de passe mis à jour');
    setPwd({ current:'',newP:'',confirm:'' });
  };

  return (
    <div>
      <Section title="Changer le mot de passe">
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
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
          <Toggle value={tfa} onChange={()=>{setTfa(v=>!v);toast.success(tfa?'2FA désactivé':'2FA activé');}}/>
        </SettingRow>
      </Section>
      <Section title="Sessions actives">
        {sessions.map((s,i)=>(
          <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:i<sessions.length-1?'1px solid #F3F4F6':'none' }}>
            <div>
              <p style={{ fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,color:'#111827',margin:0 }}>{s.device} {s.current&&<span style={{ backgroundColor:'#dcfce7',color:'#15803d',fontSize:10,padding:'2px 7px',borderRadius:10,marginLeft:6,fontWeight:600 }}>Actuelle</span>}</p>
              <p style={{ fontFamily:'Inter, sans-serif',fontSize:11.5,color:'#9CA3AF',margin:'2px 0 0' }}>{s.ip} · {s.location} · {s.last}</p>
            </div>
            {!s.current && <button onClick={()=>toast.success('Session déconnectée')} style={{ padding:'5px 12px',borderRadius:8,border:'1px solid #fecaca',backgroundColor:'transparent',color:'#dc2626',fontFamily:'Inter, sans-serif',fontSize:11.5,fontWeight:500,cursor:'pointer' }}>Déconnecter</button>}
          </div>
        ))}
      </Section>
    </div>
  );
}

function AdvancedTab() {
  const [maintenance, setMaintenance] = useState(false);
  const [logs] = useState(`[2026-05-27 10:30] INFO: Backup completed successfully\n[2026-05-27 09:15] INFO: Cache cleared by admin\n[2026-05-27 08:00] INFO: Cron jobs executed\n[2026-05-26 23:55] INFO: Daily report generated\n[2026-05-26 22:40] WARN: Failed login attempt from 91.0.0.1\n[2026-05-26 18:20] INFO: 3 boutiques approved\n[2026-05-26 14:10] INFO: User account deleted\n[2026-05-26 10:05] INFO: System update installed v2.4.1`);
  return (
    <div>
      <Section title="Mode maintenance">
        <SettingRow label="Maintenance" sub="Empêche les visiteurs d'accéder au site">
          <Toggle value={maintenance} onChange={()=>{setMaintenance(v=>!v);toast.success(maintenance?'Maintenance désactivée':'Mode maintenance activé');}}/>
        </SettingRow>
      </Section>
      <Section title="Gestion du cache">
        <SettingRow label="Vider le cache" sub="Supprime les données temporaires en cache">
          <button onClick={()=>toast.success('Cache vidé avec succès')} style={{ padding:'8px 18px',borderRadius:10,border:'1.5px solid #E5E7EB',backgroundColor:'transparent',color:'#374151',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,cursor:'pointer' }}>Vider</button>
        </SettingRow>
        <SettingRow label="Sauvegarder la base de données" sub="Crée un snapshot de la DB">
          <button onClick={()=>toast.success('Backup lancé — téléchargement dans 30s')} style={{ padding:'8px 18px',borderRadius:10,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,cursor:'pointer' }}>Backup</button>
        </SettingRow>
      </Section>
      <Section title="Logs système (dernières 50 lignes)">
        <pre style={{ fontFamily:'monospace',fontSize:11.5,backgroundColor:'#0F1117',color:'#E5E7EB',padding:'16px',borderRadius:10,overflow:'auto',maxHeight:200,margin:0,lineHeight:1.7 }}>
          {logs}
        </pre>
      </Section>
    </div>
  );
}

/* ── AdminSettingsPage ────────────────────────────────────── */
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('Général');

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div>
        <h2 style={pageTitle}>Paramètres</h2>
        <p style={pageSub}>Configuration de la plateforme FashionAura</p>
      </div>

      {/* Tab nav */}
      <div style={{ display:'flex',gap:0,backgroundColor:'#F3F4F6',borderRadius:12,padding:4,width:'fit-content',flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:'8px 16px',borderRadius:9,border:'none',cursor:'pointer',backgroundColor:activeTab===t?'#fff':'transparent',color:activeTab===t?'#111827':'#6B7280',fontFamily:'Inter, sans-serif',fontSize:12.5,fontWeight:activeTab===t?600:400,boxShadow:activeTab===t?'0 1px 4px rgba(0,0,0,0.08)':'none',transition:'all 0.18s',whiteSpace:'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'Général'        && <GeneralTab />}
        {activeTab === 'Apparence'      && <AppearanceTab />}
        {activeTab === 'Notifications'  && <NotificationsTab />}
        {activeTab === 'Sécurité'       && <SecurityTab />}
        {activeTab === 'Avancé'         && <AdvancedTab />}
      </div>
    </div>
  );
}

const pageTitle = { fontFamily:"'Playfair Display', serif",fontSize:24,fontWeight:700,color:'#111827',margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif',fontSize:13,color:'#6B7280',margin:'4px 0 0' };
const inp       = { width:'100%',padding:'9px 14px',borderRadius:10,border:'1.5px solid #E5E7EB',fontFamily:'Inter, sans-serif',fontSize:13,color:'#111827',outline:'none',backgroundColor:'#fff',boxSizing:'border-box' };
const lbl       = { fontFamily:'Inter, sans-serif',fontSize:11.5,fontWeight:600,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em' };
const saveBtn   = { padding:'10px 24px',borderRadius:10,border:'none',backgroundColor:'#1B3A35',color:'#fff',fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' };
