import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#2C3A39', borderRadius: 10, padding: '10px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#E3C8B5', marginBottom: 4, letterSpacing: '0.08em' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#fff', fontWeight: 500 }}>
            {p.value?.toLocaleString('fr-FR')} MAD
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = [], loading = false }) {
  const chartData = data.length > 0 ? data : MOCK_DATA;

  if (loading) {
    return <div style={{ height: 260, background: '#F3F2F5', borderRadius: 12, animation: 'fa-pulse 1.5s ease-in-out infinite' }} />;
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={titleStyle}>Revenus</p>
          <p style={subtitleStyle}>Évolution sur 30 jours</p>
        </div>
        <div style={periodBadge}>30j</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#69807E" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#69807E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F2F5" vertical={false} />
          <XAxis
            dataKey="label" tick={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fill: '#939790' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fill: '#939790' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `${(v/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#69807E', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone" dataKey="revenue"
            stroke="#69807E" strokeWidth={2.5}
            fill="url(#revenueGrad)"
            dot={{ r: 3, fill: '#69807E', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#69807E', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const MOCK_DATA = [
  { label: '1 Jan', revenue: 12000 }, { label: '5 Jan', revenue: 18000 },
  { label: '10 Jan', revenue: 14500 }, { label: '15 Jan', revenue: 22000 },
  { label: '20 Jan', revenue: 19000 }, { label: '25 Jan', revenue: 28000 },
  { label: '30 Jan', revenue: 24000 },
];

const cardStyle = {
  background: '#fff', borderRadius: 16, padding: '24px 28px',
  boxShadow: '0 2px 12px rgba(44,58,57,0.07)',
  border: '1px solid rgba(147,151,144,0.12)',
};

const titleStyle = {
  fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#2C2C2C',
};

const subtitleStyle = {
  fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.05em',
};

const periodBadge = {
  background: '#D4E0E2', borderRadius: 8, padding: '4px 12px',
  fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600,
  color: '#69807E', letterSpacing: '0.08em',
};