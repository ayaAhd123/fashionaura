import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

/* ── Mock data ─────────────────────────────────────────────── */
const genRevData = (days) => Array.from({ length: days }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (days - i - 1));
  return {
    date: d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' }),
    revenue: Math.floor(8000 + Math.random() * 12000),
    orders:  Math.floor(20 + Math.random() * 60),
  };
});

const CITY_DATA = [
  { city: 'Casablanca', orders: 4820 },
  { city: 'Marrakech',  orders: 3210 },
  { city: 'Rabat',      orders: 2870 },
  { city: 'Fès',        orders: 1950 },
  { city: 'Agadir',     orders: 1430 },
  { city: 'Tanger',     orders: 1220 },
];

const TOP_BOUTIQUES = [
  { name: 'Élégance Paris', revenue: 124500, pct: 100 },
  { name: 'Maroc Luxe',     revenue: 98600,  pct: 79  },
  { name: 'Mode & Style',   revenue: 78200,  pct: 63  },
  { name: 'Tailor Rabat',   revenue: 54000,  pct: 43  },
  { name: 'Atlas Fashion',  revenue: 41800,  pct: 34  },
];

const CAT_DATA = [
  { name: 'Robes',       value: 38, color: '#1B3A35' },
  { name: 'Chaussures',  value: 22, color: '#C9A84C' },
  { name: 'Accessoires', value: 18, color: '#2A5248' },
  { name: 'Chemises',    value: 14, color: '#4B7B6C' },
  { name: 'Autres',      value: 8,  color: '#D4E0E2' },
];

const PERIODS = [{ v:30,l:'30 jours' },{ v:60,l:'60 jours' },{ v:90,l:'90 jours' }];

const tipStyle = { fontFamily:'Inter, sans-serif', fontSize:12 };

function ChartCard({ title, sub, children }) {
  return (
    <div style={{ background:'#fff',borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid rgba(0,0,0,0.06)',padding:'20px 24px' }}>
      <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:600,color:'#111827',margin:0 }}>{title}</p>
      {sub && <p style={{ fontFamily:'Inter, sans-serif',fontSize:12,color:'#9CA3AF',margin:'2px 0 16px' }}>{sub}</p>}
      {!sub && <div style={{ marginBottom:16 }}/>}
      {children}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const data = genRevData(period);

  const totalRevenue = data.reduce((a,d)=>a+d.revenue,0);
  const totalOrders  = data.reduce((a,d)=>a+d.orders,0);
  const avgOrder     = Math.round(totalRevenue / totalOrders);

  const kpis = [
    { label:'Revenu total', value:`${(totalRevenue/1000).toFixed(0)}K MAD`, icon:'', bg:'#f0fdf4', color:'#15803d' },
    { label:'Commandes',    value:totalOrders,                                icon:'', bg:'#eff6ff', color:'#1d4ed8' },
    { label:'Panier moyen', value:`${avgOrder.toLocaleString('fr-FR')} MAD`, icon:'', bg:'#fdf4ff', color:'#7e22ce' },
    { label:'Nouveaux users',value:'+284',                                   icon:'', bg:'#fff7ed', color:'#c2410c' },
  ];

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h2 style={pageTitle}>Analytics</h2>
          <p style={pageSub}>Tableau de bord analytique · données agrégées</p>
        </div>
        <div style={{ display:'flex',gap:6 }}>
          {PERIODS.map(p=>(
            <button key={p.v} onClick={()=>setPeriod(p.v)} style={{ padding:'7px 16px',borderRadius:20,border:'none',cursor:'pointer',backgroundColor:period===p.v?'#1B3A35':'#F3F4F6',color:period===p.v?'#fff':'#374151',fontFamily:'Inter, sans-serif',fontSize:12,fontWeight:600 }}>{p.l}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14 }} className="kpi-grid">
        {kpis.map((k,i)=>(
          <div key={i} className="fa-stats-card" style={{ backgroundColor:k.bg,borderRadius:14,padding:'18px 20px',boxShadow:'0 2px 10px rgba(0,0,0,0.06)',border:'1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:18,fontWeight:700,marginBottom:8,color:k.color }}>{k.icon || k.label.charAt(0)}</div>
            <p style={{ fontFamily:"'Playfair Display', serif",fontSize:24,fontWeight:700,color:'#111827',margin:0 }}>{k.value}</p>
            <p style={{ fontFamily:'Inter, sans-serif',fontSize:11,color:k.color,fontWeight:600,margin:'4px 0 0',textTransform:'uppercase',letterSpacing:'0.08em' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue area chart */}
      <ChartCard title="Revenus" sub={`Évolution sur les ${period} derniers jours`}>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top:5,right:5,left:0,bottom:5 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B3A35" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1B3A35" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
            <XAxis dataKey="date" tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false} interval={Math.floor(period/6)}/>
            <YAxis tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
            <Tooltip contentStyle={tipStyle} formatter={v=>[`${v.toLocaleString('fr-FR')} MAD`,'Revenus']}/>
            <Area type="monotone" dataKey="revenue" stroke="#1B3A35" strokeWidth={2} fill="url(#revGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Side by side */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }} className="analytics-grid">
        {/* Orders by city */}
        <ChartCard title="Commandes par ville" sub="Top 6 villes">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CITY_DATA} layout="vertical" margin={{ left:10,right:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false}/>
              <XAxis type="number" tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false}/>
              <YAxis type="category" dataKey="city" tick={{ fontFamily:'Inter, sans-serif', fontSize:11, fill:'#374151' }} tickLine={false} axisLine={false} width={80}/>
              <Tooltip contentStyle={tipStyle} formatter={v=>[v,'Commandes']}/>
              <Bar dataKey="orders" fill="#1B3A35" radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category pie */}
        <ChartCard title="Répartition par catégorie" sub="% des ventes">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={CAT_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {CAT_DATA.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={tipStyle} formatter={v=>[`${v}%`,'']}/>
              <Legend iconType="circle" iconSize={8} formatter={v=><span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#374151' }}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top boutiques */}
      <div style={{ background:'#fff',borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid rgba(0,0,0,0.06)',padding:'20px 24px' }}>
        <p style={{ fontFamily:"'Playfair Display', serif",fontSize:17,fontWeight:600,color:'#111827',marginBottom:16 }}>Top 5 boutiques</p>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {TOP_BOUTIQUES.map((b,i)=>(
            <div key={i} style={{ display:'flex',alignItems:'center',gap:14 }}>
              <span style={{ fontFamily:"'Playfair Display', serif",fontSize:15,fontWeight:700,color:'#C9A84C',width:20 }}>#{i+1}</span>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                  <span style={{ fontFamily:'Inter, sans-serif',fontSize:13,fontWeight:500,color:'#111827' }}>{b.name}</span>
                  <span style={{ fontFamily:'Inter, sans-serif',fontSize:12,color:'#6B7280' }}>{b.revenue.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div style={{ height:6,backgroundColor:'#F3F4F6',borderRadius:3,overflow:'hidden' }}>
                  <div style={{ height:'100%',width:`${b.pct}%`,backgroundColor:'#1B3A35',borderRadius:3,transition:'width 0.5s ease' }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width:900px) { .kpi-grid{grid-template-columns:repeat(2,1fr)!important} .analytics-grid{grid-template-columns:1fr!important} }
        @media (max-width:500px) { .kpi-grid{grid-template-columns:1fr!important} }
      `}</style>
    </div>
  );
}

const pageTitle = { fontFamily:"'Playfair Display', serif",fontSize:24,fontWeight:700,color:'#111827',margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif',fontSize:13,color:'#6B7280',margin:'4px 0 0' };
