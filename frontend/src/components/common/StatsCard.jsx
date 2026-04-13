/**
 * StatsCard — carte statistique réutilisable
 * Props:
 *   label     : string
 *   value     : string | number
 *   icon      : ReactNode
 *   change    : number (ex: 12.5 ou -3.2)
 *   prefix    : string (ex: "MAD ", "$")
 *   suffix    : string (ex: " unités")
 *   loading   : boolean
 */
export default function StatsCard({ label, value, icon, change, prefix = '', suffix = '', loading = false }) {
  const isPositive = change >= 0;

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={skeletonRow} />
        <div style={{ ...skeletonRow, width: '60%', height: 36, marginTop: 12 }} />
        <div style={{ ...skeletonRow, width: '40%', marginTop: 12 }} />
      </div>
    );
  }

  return (
    <div style={cardStyle} className="fa-stats-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={labelStyle}>{label}</p>
          <p style={valueStyle}>
            {prefix}{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}{suffix}
          </p>
          {change !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: isPositive ? '#2D6A4F' : '#c0392b',
                backgroundColor: isPositive ? '#d8f3dc' : '#fdf2f2',
                padding: '2px 8px',
                borderRadius: 20,
                fontFamily: 'Raleway, sans-serif',
                letterSpacing: '0.04em',
              }}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span style={{ fontSize: 11, color: '#939790', fontFamily: 'Raleway, sans-serif' }}>vs mois dernier</span>
            </div>
          )}
        </div>
        <div style={iconWrapper}>{icon}</div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  padding: '24px 28px',
  boxShadow: '0 2px 12px rgba(44,58,57,0.07)',
  border: '1px solid rgba(147,151,144,0.12)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'default',
};

const labelStyle = {
  fontFamily: 'Raleway, sans-serif',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#939790',
  marginBottom: 4,
};

const valueStyle = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: 36,
  fontWeight: 500,
  color: '#2C2C2C',
  lineHeight: 1.1,
  letterSpacing: '-0.01em',
};

const iconWrapper = {
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: '#D4E0E2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const skeletonRow = {
  height: 16,
  borderRadius: 8,
  backgroundColor: '#F3F2F5',
  animation: 'fa-pulse 1.5s ease-in-out infinite',
};