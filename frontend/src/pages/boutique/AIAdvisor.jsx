import { useAIRecommendations } from '../../hooks/useDashboardData';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MOCK_RECOMMENDATIONS = {
  top_products: [
    { name: 'Robe soirée noire', sales: 142, trend: 'up', growth: 23 },
    { name: 'Sac cuir camel', sales: 98, trend: 'up', growth: 11 },
    { name: 'Blazer lin beige', sales: 87, trend: 'stable', growth: 0 },
    { name: 'Sandales dorées', sales: 65, trend: 'down', growth: -8 },
  ],
  recommendations: [
    {
      type: 'restock',
      priority: 'high',
      title: 'Réapprovisionnement urgent',
      description: 'La "Robe soirée noire" est en rupture de stock dans les tailles S et M. Vous perdez environ 12 ventes/semaine.',
      action: 'Réapprovisionner',
    },
    {
      type: 'price',
      priority: 'medium',
      title: 'Optimisation des prix',
      description: 'Le "Sac cuir camel" se vend 18% en dessous du prix moyen du marché. Une augmentation de 150 MAD serait cohérente.',
      action: 'Ajuster le prix',
    },
    {
      type: 'promotion',
      priority: 'medium',
      title: 'Promotion recommandée',
      description: 'Le "Blazer lin beige" stagne. Une promotion flash de 10% pendant le weekend pourrait relancer les ventes.',
      action: 'Créer une promo',
    },
    {
      type: 'new',
      priority: 'low',
      title: 'Nouveau segment de marché',
      description: 'Les accessoires bohème sont en forte hausse (+34%) dans votre ville. Envisagez d\'élargir votre catalogue.',
      action: 'Explorer',
    },
  ],
};

const priorityConfig = {
  high:   { label: 'Priorité haute',   bg: '#FFF0F0', color: '#c0392b', border: '#F5A0A0', dot: '#c0392b' },
  medium: { label: 'Priorité moyenne', bg: '#FFF8F0', color: '#B85C00', border: '#F5C07A', dot: '#E3C8B5' },
  low:    { label: 'Priorité basse',   bg: '#F0FFF4', color: '#1A6B3C', border: '#6FCF97', dot: '#69807E' },
};

const typeIcons = {
  restock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  price:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  promotion: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  new:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
};

export default function AIAdvisor() {
  const { data, loading } = useAIRecommendations();
  const d = data || MOCK_RECOMMENDATIONS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Hero banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2C3A39 0%, #3D5452 40%, #69807E 100%)',
        borderRadius: 20, padding: '32px 36px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        animation: 'fa-fade-in 0.4s ease forwards',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(227,200,181,0.12)' }} />
        <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(227,200,181,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, letterSpacing: '0.25em', color: '#E3C8B5', textTransform: 'uppercase', marginBottom: 12 }}>✦ Intelligence artificielle</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 400, color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>
            Vos recommandations<br />personnalisées
          </h2>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 480, lineHeight: 1.7 }}>
            Analysées à partir de vos données de vente, des tendances du marché et du comportement de vos clients.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '1.5px solid rgba(227,200,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E3C8B5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 500, color: '#fff', lineHeight: 1 }}>
            {d.recommendations?.length}
          </p>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            ACTIONS SUGGÉRÉES
          </p>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* ── Top produits ── */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 2px 12px rgba(44,58,57,0.07)', border: '1px solid rgba(147,151,144,0.12)', animation: 'fa-fade-in 0.5s ease 0.2s forwards', opacity: 0 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#2C2C2C', marginBottom: 4 }}>Top Produits</p>
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', marginBottom: 20, letterSpacing: '0.05em' }}>Performance du mois</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {d.top_products?.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#D4E0E2', width: 24, textAlign: 'center' }}>{i+1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 500, color: '#2C2C2C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <div style={{ height: 4, borderRadius: 4, backgroundColor: '#F3F2F5', marginTop: 6 }}>
                      <div style={{ height: '100%', borderRadius: 4, backgroundColor: '#69807E', width: `${(p.sales / d.top_products[0].sales) * 100}%`, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#2C2C2C' }}>{p.sales}</p>
                    <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 10, color: p.trend === 'up' ? '#2D6A4F' : p.trend === 'down' ? '#c0392b' : '#939790' }}>
                      {p.trend === 'up' ? `↑ ${p.growth}%` : p.trend === 'down' ? `↓ ${Math.abs(p.growth)}%` : '→ stable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recommandations ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fa-fade-in 0.5s ease 0.3s forwards', opacity: 0 }}>
            {d.recommendations?.map((rec, i) => {
              const pCfg = priorityConfig[rec.priority];
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: 14, padding: '18px 22px',
                  boxShadow: '0 2px 8px rgba(44,58,57,0.06)',
                  border: '1px solid rgba(147,151,144,0.1)',
                  borderLeft: `3px solid ${pCfg.dot}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#D4E0E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#69807E', flexShrink: 0 }}>
                        {typeIcons[rec.type]}
                      </div>
                      <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, fontWeight: 600, color: '#2C2C2C' }}>{rec.title}</p>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'Raleway, sans-serif', letterSpacing: '0.05em', backgroundColor: pCfg.bg, color: pCfg.color, border: `1px solid ${pCfg.border}`, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
                      {pCfg.label}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>{rec.description}</p>
                  <button style={{ padding: '7px 16px', borderRadius: 8, border: 'none', backgroundColor: '#D4E0E2', color: '#69807E', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
                    {rec.action} →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}