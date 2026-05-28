/* ── StatsCard — redesigned with unique gradients ──────────── */

function abbrev(n) {
  if (n == null || n === '') return '0';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return String(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return Math.round(num / 1_000) + 'K';
  return num.toLocaleString('fr-FR');
}

export { abbrev };

/**
 * Props:
 *   label     : string
 *   value     : string | number
 *   icon      : ReactNode
 *   gradient  : string (CSS linear-gradient)
 *   iconColor : string (background for icon circle)
 *   change    : number (+12.5 or -3.2)
 *   suffix    : string (" MAD")
 *   loading   : boolean
 *   abbreviate: boolean (default true)
 */
export default function StatsCard({
  label, value, icon, gradient, iconColor = '#1B3A35',
  change, suffix = '', loading = false, abbreviate = true,
}) {
  const isPositive = change >= 0;

  if (loading) {
    return (
      <div style={{ ...card, background: gradient || '#fff', height: 180 }}>
        <div style={skRow} />
        <div style={{ ...skRow, width: '55%', height: 40, marginTop: 14, borderRadius: 6 }} />
        <div style={{ ...skRow, width: '40%', marginTop: 14 }} />
      </div>
    );
  }

  const displayValue = abbreviate
    ? abbrev(value)
    : (typeof value === 'number' ? value.toLocaleString('fr-FR') : (value ?? '0'));

  return (
    <div
      className="fa-stats-card"
      style={{
        background: gradient || '#fff',
        borderRadius: 20,
        padding: '22px 24px',
        height: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.05)',
        cursor: 'default',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top row: label + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#6B7280',
        }}>
          {label}
        </span>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          backgroundColor: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {icon}
        </div>
      </div>

      {/* Middle: number */}
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 38,
        fontWeight: 700,
        color: '#111827',
        margin: 0,
        lineHeight: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {displayValue}{suffix}
      </p>

      {/* Bottom: trend badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {change !== undefined ? (
          <>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 700,
              color: isPositive ? '#15803d' : '#dc2626',
              backgroundColor: isPositive ? 'rgba(21,128,61,0.12)' : 'rgba(220,38,38,0.10)',
              padding: '3px 9px', borderRadius: 20,
              fontFamily: 'Inter, sans-serif',
            }}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#9CA3AF' }}>vs mois dernier</span>
          </>
        ) : (
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#9CA3AF' }}>Données en temps réel</span>
        )}
      </div>
    </div>
  );
}

const skRow = {
  height: 16, borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.06)',
  animation: 'fa-pulse 1.5s ease-in-out infinite',
};

const card = {
  borderRadius: 20,
  padding: '22px 24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.05)',
};
