import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartEmptyState from './ChartEmptyState';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#2C3A39', borderRadius: 10, padding: '10px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)', minWidth: 140,
      }}>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#E3C8B5', marginBottom: 8 }}>{label}</p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color }} />
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#fff' }}>
              {p.name}: <strong>{p.value}</strong>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', marginBottom: 8 }}>
    {payload?.map((p, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 12, height: 2, backgroundColor: p.color, borderRadius: 1 }} />
        <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#939790' }}>{p.value}</span>
      </div>
    ))}
  </div>
);

export default function ConversionChart({ data = [], loading = false, periodLabel = '30 derniers jours', hasData = true }) {
  const chartData = Array.isArray(data) ? data : [];
  const showChart = hasData && chartData.length > 0
    && chartData.some((d) => Number(d.views) > 0 || Number(d.orders) > 0);

  if (loading) {
    return <div style={{ ...cardStyle, minHeight: 300 }}><div style={{ height: 260, background: '#F3F2F5', borderRadius: 12, animation: 'fa-pulse 1.5s ease-in-out infinite' }} /></div>;
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={titleStyle}>Trafic et commandes</p>
          <p style={subtitleStyle}>Vues vs conversions · {periodLabel}</p>
        </div>
      </div>
      {!showChart ? (
        <ChartEmptyState message={`Aucune vue ou commande sur ${periodLabel.toLowerCase()}.`} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F2F5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fill: '#939790' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fill: '#939790' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D4E0E2', strokeWidth: 1 }} />
            <Legend content={<CustomLegend />} />
            <Line
              type="monotone"
              dataKey="views"
              name="Vues"
              stroke="#D4E0E2"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#D4E0E2', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Commandes"
              stroke="#69807E"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#69807E', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
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
