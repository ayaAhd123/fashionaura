import StatsCard from '../../components/common/StatsCard';
import RevenueChart from '../../components/charts/RevenueChart';
import ConversionChart from '../../components/charts/ConversionChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useBoutiqueStats, useBoutiqueCharts } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContext';

// ─── Icônes ───────────────────────────────────────────────────────────────────
const StatIcons = {
  products: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  orders: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  revenue: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  rating: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

// ─── Statut Badge ─────────────────────────────────────────────────────────────
const orderStatusConfig = {
  pending:    { label: 'En attente',  bg: '#FFF8F0', color: '#B85C00', border: '#F5C07A' },
  processing: { label: 'En cours',    bg: '#EEF6FF', color: '#1A5BA6', border: '#93C5FD' },
  shipped:    { label: 'Expédiée',    bg: '#F0F4FF', color: '#4338CA', border: '#A5B4FC' },
  delivered:  { label: 'Livrée',      bg: '#F0FFF4', color: '#1A6B3C', border: '#6FCF97' },
  cancelled:  { label: 'Annulée',     bg: '#FFF0F0', color: '#c0392b', border: '#F5A0A0' },
};

function OrderBadge({ status }) {
  const cfg = orderStatusConfig[status] || orderStatusConfig.pending;
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'Raleway, sans-serif', letterSpacing: '0.06em', backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

// ─── Étoiles rating ───────────────────────────────────────────────────────────
function StarRating({ value = 0 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= value ? '#E3C8B5' : 'none'} stroke="#E3C8B5" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ─── Tableau commandes récentes ───────────────────────────────────────────────
function RecentOrdersTable() {
  const MOCK_ORDERS = [
    { id: '#1042', customer: 'Leila A.', product: 'Robe soirée noire', amount: 890, status: 'delivered', date: '2026-04-03' },
    { id: '#1041', customer: 'Nadia M.', product: 'Sac cuir camel', amount: 1450, status: 'shipped', date: '2026-04-02' },
    { id: '#1040', customer: 'Sara K.', product: 'Blazer lin beige', amount: 680, status: 'processing', date: '2026-04-01' },
    { id: '#1039', customer: 'Houda B.', product: 'Sandales dorées', amount: 420, status: 'pending', date: '2026-03-31' },
    { id: '#1038', customer: 'Rim Z.', product: 'Foulard soie', amount: 290, status: 'delivered', date: '2026-03-30' },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(44,58,57,0.07)', border: '1px solid rgba(147,151,144,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #F3F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#2C2C2C' }}>Commandes récentes</p>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.05em' }}>5 dernières commandes</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #D4E0E2', backgroundColor: 'transparent', color: '#69807E', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600 }}>
          Voir tout
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9F8FA' }}>
              {['Commande', 'Client', 'Produit', 'Montant', 'Statut', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#939790', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_ORDERS.map((order) => (
              <tr key={order.id} style={{ borderTop: '1px solid #F3F2F5', transition: 'background 0.15s' }} className="fa-table-row">
                <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600, color: '#69807E' }}>{order.id}</td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#D4E0E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#69807E', flexShrink: 0 }}>
                      {order.customer[0]}
                    </div>
                    <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#2C2C2C' }}>{order.customer}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#555', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product}</td>
                <td style={{ padding: '14px 20px', fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#2C2C2C', fontWeight: 500 }}>
                  {order.amount.toLocaleString('fr-FR')} MAD
                </td>
                <td style={{ padding: '14px 20px' }}><OrderBadge status={order.status} /></td>
                <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790' }}>
                  {new Date(order.date).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Mini AI Teaser ───────────────────────────────────────────────────────────
function AIAdvisorTeaser() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #2C3A39 0%, #3D5452 50%, #69807E 100%)', borderRadius: 16, padding: '24px 28px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(227,200,181,0.15)' }} />
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(227,200,181,0.08)' }} />
      <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, letterSpacing: '0.2em', color: '#E3C8B5', textTransform: 'uppercase', marginBottom: 10 }}>
        ✦ AI Advisor
      </p>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 400, marginBottom: 8, lineHeight: 1.3 }}>
        Vos recommandations<br />sont prêtes
      </p>
      <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20, lineHeight: 1.6 }}>
        Basées sur vos ventes et tendances actuelles du marché.
      </p>
      <button style={{ backgroundColor: '#E3C8B5', color: '#2C3A39', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s' }}>
        Voir les recommandations →
      </button>
    </div>
  );
}

// ─── BoutiqueDashboard ────────────────────────────────────────────────────────
export default function BoutiqueDashboard() {
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useBoutiqueStats();
  const { data: charts, loading: chartsLoading } = useBoutiqueCharts();

  const s = stats || {
    total_products: 48,
    total_orders: 312,
    total_revenue: 187600,
    total_reviews: 94,
    average_rating: 4.6,
    today_stats: { orders: 7, revenue: 4200 },
    recent_stats: { orders_change: 11.4, revenue_change: 8.7 },
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Construction des données pour les graphiques
  const chartLabels = charts?.labels || ['1','5','10','15','20','25','30'];
  const revenueData = chartLabels.map((label, i) => ({
    label, revenue: charts?.revenue?.[i] ?? Math.floor(3000 + Math.random() * 8000),
  }));
  const conversionData = chartLabels.map((label, i) => ({
    label,
    views:  charts?.views?.[i]  ?? Math.floor(200 + Math.random() * 500),
    orders: charts?.orders?.[i] ?? Math.floor(5 + Math.random() * 30),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Salutation ── */}
      <div style={{ animation: 'fa-fade-in 0.4s ease forwards' }}>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'capitalize' }}>{today}</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 400, color: '#2C2C2C' }}>
          Bonjour, {user?.name?.split(' ')[0] || 'là'} 👋
        </h2>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', marginTop: 2 }}>
          {s.today_stats?.orders} commandes aujourd'hui · {s.today_stats?.revenue?.toLocaleString('fr-FR')} MAD
        </p>
      </div>

      {/* ── Cartes stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20 }}>
        {[
          { label: 'Produits', value: s.total_products, icon: StatIcons.products, change: 4.2 },
          { label: 'Commandes', value: s.total_orders, icon: StatIcons.orders, change: s.recent_stats?.orders_change },
          { label: 'Revenus', value: s.total_revenue, icon: StatIcons.revenue, change: s.recent_stats?.revenue_change, suffix: ' MAD' },
          { label: 'Note moyenne', value: s.average_rating?.toFixed(1), icon: StatIcons.rating },
        ].map((card, i) => (
          <div key={i} style={{ animation: `fa-fade-in 0.4s ease ${i * 0.08}s forwards`, opacity: 0 }}>
            <StatsCard {...card} loading={statsLoading} />
          </div>
        ))}
      </div>

      {/* ── Graphiques + AI Teaser ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ animation: 'fa-fade-in 0.5s ease 0.3s forwards', opacity: 0 }}>
          <RevenueChart data={revenueData} loading={chartsLoading} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fa-fade-in 0.5s ease 0.4s forwards', opacity: 0 }}>
          <AIAdvisorTeaser />
          {/* Mini stats today */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(44,58,57,0.06)', border: '1px solid rgba(147,151,144,0.1)' }}>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#939790', marginBottom: 6 }}>Avis clients</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 500, color: '#2C2C2C', lineHeight: 1 }}>{s.total_reviews}</p>
              <StarRating value={Math.round(s.average_rating)} />
            </div>
            <div style={{ background: '#D4E0E2', borderRadius: 14, padding: '18px 20px' }}>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#69807E', marginBottom: 6 }}>Aujourd'hui</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 500, color: '#2C3A39', lineHeight: 1 }}>
                {s.today_stats?.orders}
              </p>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#69807E' }}>commandes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conversion chart ── */}
      <div style={{ animation: 'fa-fade-in 0.5s ease 0.5s forwards', opacity: 0 }}>
        <ConversionChart data={conversionData} loading={chartsLoading} />
      </div>

      {/* ── Tableau commandes ── */}
      <div style={{ animation: 'fa-fade-in 0.5s ease 0.6s forwards', opacity: 0 }}>
        <RecentOrdersTable />
      </div>

      <style>{`
        .fa-table-row:hover { background-color: #FAFAF9 !important; }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}