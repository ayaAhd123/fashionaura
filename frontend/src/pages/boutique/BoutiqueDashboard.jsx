import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import RevenueChart from '../../components/charts/RevenueChart';
import ConversionChart from '../../components/charts/ConversionChart';
import OrderStatusSelect from '../../components/orders/OrderStatusSelect';
import OrderChatModal from '../../components/orders/OrderChatModal';
import { useBoutiqueStats, useBoutiqueCharts } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContext';
import { getMyPosts, updateBoutiqueOrderStatus } from '../../services/api';
import { resolveMediaUrl } from '../../utils/imageUtils';

const PERIODS = [
  { value: '7days', label: '7 jours' },
  { value: '30days', label: '30 jours' },
  { value: '90days', label: '90 jours' },
];

const StatIcons = {
  products: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  orders: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  revenue: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  rating: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

function StarRating({ value = 0 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= value ? '#E3C8B5' : 'none'} stroke="#E3C8B5" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function PeriodSelector({ period, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: period === p.value ? 'none' : '1px solid #D4E0E2',
            backgroundColor: period === p.value ? '#69807E' : '#fff',
            color: period === p.value ? '#fff' : '#69807E',
            fontFamily: 'Raleway, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function RecentPostsSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPosts()
      .then((res) => setPosts((res.data?.data || []).slice(0, 3)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(44,58,57,0.07)', border: '1px solid rgba(147,151,144,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(147,151,144,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#2C2C2C', margin: 0 }}>Vos offres spéciales</h3>
        <Link to="/boutique/publications" style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, color: '#69807E', textDecoration: 'none' }}>Gérer →</Link>
      </div>
      {loading ? (
        <p style={{ padding: 24, fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790' }}>Chargement…</p>
      ) : posts.length === 0 ? (
        <div style={{ padding: '28px 22px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', marginBottom: 12 }}>Aucune publication. Partagez vos offres et actualités avec vos abonnés.</p>
          <Link to="/boutique/publications" style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 999, background: '#69807E', color: '#fff', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>+ Créer une offre</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, padding: 18 }}>
          {posts.map((post) => (
            <div key={post.id} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(147,151,144,0.15)' }}>
              <div style={{ height: 100, background: '#F3F4F6', overflow: 'hidden' }}>
                {post.image_url ? <img src={resolveMediaUrl(post.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.caption || post.promo_text || 'Publication'}</p>
                {post.is_exclusive && <span style={{ fontSize: 10, color: '#69807E', fontWeight: 600 }}>Exclusif abonnés</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentOrdersTable({ orders = [], loading = false, onStatusChange, onMessage }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(44,58,57,0.07)', border: '1px solid rgba(147,151,144,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #F3F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#2C2C2C' }}>Commandes récentes</p>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.05em' }}>
            {orders.length} commande(s) · données en direct
          </p>
        </div>
        <Link
          to="/boutique/commandes"
          style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #D4E0E2', backgroundColor: 'transparent', color: '#69807E', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
        >
          Voir tout
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#939790', fontFamily: 'Raleway, sans-serif', fontSize: 13 }}>Chargement…</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#939790', fontFamily: 'Raleway, sans-serif', fontSize: 13 }}>
          Aucune commande pour le moment.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9F8FA' }}>
                {['Commande', 'Client', 'Produit', 'Montant', 'Statut', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#939790', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderTop: '1px solid #F3F2F5' }} className="fa-table-row">
                  <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600, color: '#69807E' }}>#{order.id}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#D4E0E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#69807E', flexShrink: 0 }}>
                        {(order.customer || '?')[0]}
                      </div>
                      <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#2C2C2C' }}>{order.customer}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#555', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#2C2C2C', fontWeight: 500 }}>
                    {Number(order.amount).toLocaleString('fr-FR')} MAD
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <OrderStatusSelect
                      orderId={order.id}
                      status={order.status}
                      compact
                      updateFn={updateBoutiqueOrderStatus}
                      onChange={onStatusChange}
                    />
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790' }}>
                    {order.date ? new Date(order.date).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      type="button"
                      onClick={() => onMessage?.(order)}
                      title="Contacter le client"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: '1px solid #D4E0E2',
                        background: '#fff',
                        color: '#69807E',
                        fontFamily: 'Raleway, sans-serif',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <MessageCircle size={15} />
                      Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AIAdvisorTeaser() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #2C3A39 0%, #3D5452 50%, #69807E 100%)', borderRadius: 16, padding: '24px 28px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, letterSpacing: '0.2em', color: '#E3C8B5', textTransform: 'uppercase', marginBottom: 10 }}>Conseiller IA</p>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 400, marginBottom: 8, lineHeight: 1.3 }}>Analyse et recommandations</p>
      <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20, lineHeight: 1.6 }}>
        Basé sur vos ventes et stocks réels.
      </p>
      <Link
        to="/boutique/ai-advisor"
        style={{ backgroundColor: '#E3C8B5', color: '#2C3A39', borderRadius: 10, padding: '10px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', display: 'inline-block' }}
      >
        Voir les recommandations →
      </Link>
    </div>
  );
}

function buildChartSeries(charts) {
  if (!charts?.labels?.length) {
    return { revenueData: [], conversionData: [], hasData: false, periodLabel: charts?.period_label || '30 derniers jours' };
  }

  const revenueData = charts.labels.map((label, i) => ({
    label,
    revenue: Number(charts.revenue?.[i] ?? 0),
  }));

  const conversionData = charts.labels.map((label, i) => ({
    label,
    views: Number(charts.views?.[i] ?? 0),
    orders: Number(charts.orders?.[i] ?? 0),
  }));

  return {
    revenueData,
    conversionData,
    hasData: charts.has_data ?? false,
    periodLabel: charts.period_label || '30 derniers jours',
  };
}

export default function BoutiqueDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30days');
  const [recentOrders, setRecentOrders] = useState([]);
  const [chatOrder, setChatOrder] = useState(null);

  const { data: stats, loading: statsLoading, error: statsError } = useBoutiqueStats();
  const { data: charts, loading: chartsLoading } = useBoutiqueCharts(period);

  useEffect(() => {
    if (stats?.recent_orders) {
      setRecentOrders(stats.recent_orders);
    }
  }, [stats?.recent_orders]);

  const handleStatusChange = (orderId, status) => {
    setRecentOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const { revenueData, conversionData, hasData, periodLabel } = useMemo(
    () => buildChartSeries(charts),
    [charts]
  );

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const todayOrders = stats?.today_stats?.orders ?? 0;
  const todayRevenue = stats?.today_stats?.revenue ?? 0;
  const ordersChange = stats?.recent_stats?.orders_change;
  const revenueChange = stats?.recent_stats?.revenue_change;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'capitalize' }}>{today}</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 400, color: '#2C2C2C' }}>
            Bonjour, {user?.name?.split(' ')[0] || 'là'} 
          </h2>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', marginTop: 2 }}>
            {statsLoading ? 'Chargement…' : `${todayOrders} commande(s) aujourd'hui · ${Number(todayRevenue).toLocaleString('fr-FR')} MAD`}
          </p>
        </div>
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      {statsError && (
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#c0392b', padding: 12, background: '#FFF0F0', borderRadius: 10 }}>
          Impossible de charger les statistiques. Vérifiez votre connexion.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20 }}>
        <StatsCard label="Produits" value={stats?.total_products ?? 0} icon={StatIcons.products} loading={statsLoading} />
        <StatsCard label="Commandes" value={stats?.total_orders ?? 0} icon={StatIcons.orders} change={ordersChange} loading={statsLoading} />
        <StatsCard label="Revenus" value={stats?.total_revenue ?? 0} icon={StatIcons.revenue} change={revenueChange} suffix=" MAD" loading={statsLoading} />
        <StatsCard label="Note moyenne" value={stats?.average_rating != null ? String(stats.average_rating) : '—'} icon={StatIcons.rating} loading={statsLoading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dashboard-charts-grid">
        <RevenueChart data={revenueData} loading={chartsLoading} periodLabel={periodLabel} hasData={hasData} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <AIAdvisorTeaser />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(44,58,57,0.06)', border: '1px solid rgba(147,151,144,0.1)' }}>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#939790', marginBottom: 6 }}>Avis clients</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 500, color: '#2C2C2C', lineHeight: 1 }}>
                {statsLoading ? '—' : (stats?.total_reviews ?? 0)}
              </p>
              {!statsLoading && <StarRating value={Math.round(stats?.average_rating ?? 0)} />}
            </div>
            <div style={{ background: '#D4E0E2', borderRadius: 14, padding: '18px 20px' }}>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#69807E', marginBottom: 6 }}>Aujourd'hui</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 500, color: '#2C3A39', lineHeight: 1 }}>{todayOrders}</p>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#69807E' }}>commandes</p>
            </div>
          </div>
        </div>
      </div>

      <ConversionChart data={conversionData} loading={chartsLoading} periodLabel={periodLabel} hasData={hasData} />

      <RecentPostsSection />

      <RecentOrdersTable
        orders={recentOrders}
        loading={statsLoading}
        onStatusChange={handleStatusChange}
        onMessage={setChatOrder}
      />

      <OrderChatModal
        open={!!chatOrder}
        onClose={() => setChatOrder(null)}
        orderId={chatOrder?.id}
        orderLabel={chatOrder ? `Commande #${chatOrder.id}` : ''}
        counterpartName={chatOrder?.customer}
      />

      <style>{`
        .fa-table-row:hover { background-color: #FAFAF9 !important; }
        @media (max-width: 900px) {
          .dashboard-charts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
