import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const PERIODS = [{ v:7, l:'7 jours' }, { v:30, l:'30 jours' }, { v:90, l:'90 jours' }];

const genRevenue = (days) => Array.from({ length: days }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (days - i - 1));
  return {
    date: d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' }),
    revenus: Math.floor(3000 + Math.random() * 8000),
    commandes: Math.floor(5 + Math.random() * 30),
  };
});

const TOP_PRODUCTS = [
  { name: 'Robe Élégante',  sales: 142, revenue: 126380 },
  { name: 'Kaftan Brodé',   sales: 98,  revenue: 215600 },
  { name: 'Djellaba Luxe',  sales: 87,  revenue: 156600 },
  { name: 'Chemisier Soie', sales: 76,  revenue: 34200  },
  { name: 'Abaya Noire',    sales: 64,  revenue: 89600  },
];

const FOLLOWERS = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'][i],
  followers: Math.floor(200 + i*80 + Math.random()*100),
}));

const RETENTION = [
  { name: 'Clients fidèles',   value: 62, color: '#1B3A35' },
  { name: 'Nouveaux clients',  value: 24, color: '#C9A84C' },
  { name: 'Inactifs',          value: 14, color: '#E5E7EB' },
];

const GEO = [
  { city:'Casablanca', orders:284, pct:100 },
  { city:'Marrakech',  orders:196, pct:69  },
  { city:'Rabat',      orders:148, pct:52  },
  { city:'Fès',        orders:87,  pct:31  },
  { city:'Agadir',     orders:61,  pct:21  },
];

const tip = { fontFamily:'Inter, sans-serif', fontSize:12 };

function ChartCard({ title, sub, children }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)', padding:'20px 24px' }}>
      <p style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:600, color:'#111827', margin:0 }}>{title}</p>
      {sub && <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:'#9CA3AF', margin:'2px 0 16px' }}>{sub}</p>}
      {!sub && <div style={{ marginBottom:16 }}/>}
      {children}
    </div>
  );
}

export default function BoutiqueAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const data = genRevenue(period);

  const totalRev   = data.reduce((a,d)=>a+d.revenus,0);
  const totalOrders = data.reduce((a,d)=>a+d.commandes,0);
  const avgBasket  = Math.round(totalRev / totalOrders);
  const maxRev     = Math.max(...TOP_PRODUCTS.map(p=>p.revenue));

  const kpis = [
    { label:'Revenus', value:`${(totalRev/1000).toFixed(0)}K MAD`, icon:'', bg:'#f0fdf4', color:'#15803d', change:'+12%' },
    { label:'Commandes', value:totalOrders, icon:'', bg:'#eff6ff', color:'#1d4ed8', change:'+8%' },
    { label:'Panier moyen', value:`${avgBasket.toLocaleString('fr-FR')} MAD`, icon:'', bg:'#fdf4ff', color:'#7e22ce', change:'+5%' },
    { label:'Taux conversion', value:'3.8%', icon:'', bg:'#fff7ed', color:'#c2410c', change:'+0.4pp' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={pageTitle}>Analytics</h2>
          <p style={pageSub}>Tableau de bord de votre boutique · données agrégées</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {PERIODS.map(p=>(
            <button key={p.v} onClick={()=>setPeriod(p.v)} style={{ padding:'7px 16px', borderRadius:20, border:'none', cursor:'pointer', backgroundColor:period===p.v?'#1B3A35':'#F3F4F6', color:period===p.v?'#fff':'#374151', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:600 }}>{p.l}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }} className="b-kpi-grid">
        {kpis.map((k,i)=>(
          <div key={i} style={{ backgroundColor:k.bg, borderRadius:14, padding:'18px 20px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:8, color:k.color }}>{k.icon || k.label.charAt(0)}</div>
            <p style={{ fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:'#111827', margin:0 }}>{k.value}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:k.color, fontWeight:600, margin:0, textTransform:'uppercase', letterSpacing:'0.08em' }}>{k.label}</p>
              <span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#16a34a', fontWeight:600 }}>{k.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue area chart */}
      <ChartCard title="Revenus" sub={`Évolution sur les ${period} derniers jours`}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top:5, right:5, left:0, bottom:5 }}>
            <defs>
              <linearGradient id="bRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B3A35" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1B3A35" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
            <XAxis dataKey="date" tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false} interval={Math.floor(period/6)}/>
            <YAxis tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
            <Tooltip contentStyle={tip} formatter={v=>[`${v.toLocaleString('fr-FR')} MAD`,'Revenus']}/>
            <Area type="monotone" dataKey="revenus" stroke="#1B3A35" strokeWidth={2} fill="url(#bRevGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Orders line + Followers */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="b-analytics-grid">
        <ChartCard title="Commandes" sub="Nombre de commandes par jour">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top:5, right:5, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
              <XAxis dataKey="date" tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false} interval={Math.floor(period/6)}/>
              <YAxis tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={tip} formatter={v=>[v,'Commandes']}/>
              <Line type="monotone" dataKey="commandes" stroke="#C9A84C" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Croissance des followers" sub="Abonnés à votre boutique">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={FOLLOWERS} margin={{ top:5, right:5, left:0, bottom:5 }}>
              <defs>
                <linearGradient id="bFollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
              <XAxis dataKey="month" tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false}/>
              <YAxis tick={{ fontFamily:'Inter, sans-serif', fontSize:10, fill:'#9CA3AF' }} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={tip} formatter={v=>[v,'Followers']}/>
              <Area type="monotone" dataKey="followers" stroke="#C9A84C" strokeWidth={2} fill="url(#bFollGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top products + Retention + Geo */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="b-analytics-grid">
        {/* Top products */}
        <ChartCard title="Top 5 produits" sub="Par chiffre d'affaires">
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {TOP_PRODUCTS.map((p,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontFamily:"'Playfair Display', serif", fontSize:14, fontWeight:700, color:'#C9A84C', width:20 }}>#{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontFamily:'Inter, sans-serif', fontSize:12.5, fontWeight:500, color:'#111827' }}>{p.name}</span>
                    <span style={{ fontFamily:'Inter, sans-serif', fontSize:11.5, color:'#6B7280' }}>{p.revenue.toLocaleString('fr-FR')} MAD</span>
                  </div>
                  <div style={{ height:5, backgroundColor:'#F3F4F6', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(p.revenue/maxRev)*100}%`, backgroundColor:'#1B3A35', borderRadius:3 }}/>
                  </div>
                </div>
                <span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#9CA3AF', width:28, textAlign:'right' }}>{p.sales} ventes</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Retention donut */}
        <ChartCard title="Fidélisation clients" sub="Répartition des types de clients">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={RETENTION} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {RETENTION.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={tip} formatter={v=>[`${v}%`,'']}/>
              <Legend iconType="circle" iconSize={8} formatter={v=><span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#374151' }}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Geographic distribution */}
      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)', padding:'20px 24px' }}>
        <p style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:600, color:'#111827', marginBottom:16 }}>Distribution géographique</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {GEO.map((g,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontFamily:'Inter, sans-serif', fontSize:12.5, color:'#374151', width:100, flexShrink:0 }}>{g.city}</span>
              <div style={{ flex:1, height:8, backgroundColor:'#F3F4F6', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${g.pct}%`, background:'linear-gradient(90deg, #1B3A35, #2A5248)', borderRadius:4, transition:'width 0.5s ease' }}/>
              </div>
              <span style={{ fontFamily:"'Playfair Display', serif", fontSize:13, fontWeight:700, color:'#111827', width:40, textAlign:'right' }}>{g.orders}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.b-kpi-grid{grid-template-columns:repeat(2,1fr)!important}.b-analytics-grid{grid-template-columns:1fr!important}}
        @media(max-width:500px){.b-kpi-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}

const pageTitle = { fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:'#111827', margin:0 };
const pageSub   = { fontFamily:'Inter, sans-serif', fontSize:13, color:'#6B7280', margin:'4px 0 0' };
