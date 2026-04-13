import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#69807E', '#7A9896', '#8BAEAD', '#9DC4C2', '#E3C8B5'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#2C3A39', borderRadius: 10, padding: '10px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#E3C8B5', marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: '#fff', fontWeight: 500 }}>
          {payload[0]?.value} ventes
        </p>
      </div>
    );
  }
  return null;
};

export default function TopProductsChart({ data = [], loading = false }) {
  const chartData = data.length > 0 ? data : MOCK_DATA;

  if (loading) {
    return <div style={{ height: 280, background: '#F3F2F5', borderRadius: 12, animation: 'fa-pulse 1.5s ease-in-out infinite' }} />;
  }

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: 24 }}>
        <p style={titleStyle}>Top Produits</p>
        <p style={subtitleStyle}>Par nombre de ventes</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F2F5" horizontal={true} vertical={false} />
          <XAxis
            dataKey="name" tick={{ fontFamily: 'Raleway, sans-serif', fontSize: 10, fill: '#939790' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fill: '#939790' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,224,226,0.3)' }} />
          <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const MOCK_DATA = [
  { name: 'Robe soirée', sales: 142 },
  { name: 'Sac cuir', sales: 98 },
  { name: 'Blazer lin', sales: 87 },
  { name: 'Sandales', sales: 65 },
  { name: 'Foulard', sales: 54 },
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