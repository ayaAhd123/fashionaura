import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ChartEmptyState from './ChartEmptyState';

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
            {Number(p.value ?? 0).toLocaleString('fr-FR')} MAD
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = [], loading = false, periodLabel = '30 derniers jours', hasData = true }) {
  const chartData = Array.isArray(data) ? data : [];
  const showChart = hasData && chartData.length > 0 && chartData.some((d) => Number(d.revenue) > 0);

  if (loading) {
    return <div style={{ ...cardStyle, minHeight: 300 }}><div style={{ height: 260, background: '#F3F2F5', borderRadius: 12, animation: 'fa-pulse 1.5s ease-in-out infinite' }} /></div>;
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={titleStyle}>Revenus</p>
          <p style={subtitleStyle}>Évolution · {periodLabel}</p>
        </div>
      </div>
      {!showChart ? (
        <ChartEmptyState message={`Aucun revenu enregistré sur ${periodLabel.toLowerCase()}.`} />
      ) : (
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
              dataKey="label"
              tick={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fill: '#939790' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fill: '#939790' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#69807E', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#69807E"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={{ r: 3, fill: '#69807E', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#69807E', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  padding: '24px 28px',
  boxShadow: '0 2px 12px rgba(44,58,57,0.07)',
  border: '1px solid rgba(147,151,144,0.12)',
};

const titleStyle = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: 20,
  fontWeight: 500,
  color: '#2C2C2C',
};

const subtitleStyle = {
  fontFamily: 'Raleway, sans-serif',
  fontSize: 12,
  color: '#939790',
  letterSpacing: '0.05em',
};
