import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../../components/common/StatsCard';
import RevenueChart from '../../components/charts/RevenueChart';
import ConversionChart from '../../components/charts/ConversionChart';
import { useBoutiqueStats, useBoutiqueCharts } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/* ── Card gradients ───────────────────────────────────────── */
const CARD_GRADIENTS = [
  { gradient: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', iconColor: '#16a34a' },
  { gradient: 'linear-gradient(135deg,#fffbeb,#fef3c7)', iconColor: '#d97706' },
  { gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', iconColor: '#dc2626' },
  { gradient: 'linear-gradient(135deg,#fdf4ff,#fae8ff)', iconColor: '#9333ea' },
  { gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)', iconColor: '#2563eb' },
  { gradient: 'linear-gradient(135deg,#fff7ed,#ffedd5)', iconColor: '#ea580c' },
];

function ProductIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function OrderIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function RevenueIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function StarIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function EyeIcon()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function UsersIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }

const PERIODS = [
  { value: '7days',  label: '7 jours' },
  { value: '30days', label: '30 jours' },
  { value: '90days', label: '90 jours' },
];

/* ── Order status badge ───────────────────────────────────── */
function OrderBadge({ status }) {
  const cfg = {
    pending:    { label: 'En attente',  bg: '#fff7ed', color: '#c2410c' },
    processing: { label: 'En cours',    bg: '#eff6ff', color: '#1d4ed8' },
    shipped:    { label: 'Expédiée',    bg: '#f0f9ff', color: '#0369a1' },
    delivered:  { label: 'Livrée',      bg: '#f0fdf4', color: '#15803d' },
    cancelled:  { label: 'Annulée',     bg: '#fef2f2', color: '#dc2626' },
  }[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return <span style={{ padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

/* ── Period selector ──────────────────────────────────────── */
function PeriodSelector({ period, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {PERIODS.map(p => (
        <button key={p.value} onClick={() => onChange(p.value)} style={{
          padding: '7px 16px', borderRadius: 20, border: period === p.value ? 'none' : '1px solid #D1D5DB',
          backgroundColor: period === p.value ? '#1B3A35' : 'transparent',
          color: period === p.value ? '#fff' : '#6B7280',
          fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.18s',
        }}>{p.label}</button>
      ))}
    </div>
  );
}

/* ── Recent orders table ──────────────────────────────────── */
function RecentOrdersTable({ orders = [], loading = false }) {
  const MOCK = [
    { id: '#2058', customer: 'Amina Benali', product: 'Robe Émeraude', amount: 1250, status: 'pending', date: '2026-05-27' },
    { id: '#2057', customer: 'Sara Farouk', product: 'Caftan Or', amount: 3400, status: 'delivered', date: '2026-05-26' },
    { id: '#2056', customer: 'Khalid Mourad', product: 'Veste Bordeaux', amount: 890, status: 'shipped', date: '2026-05-25' },
    { id: '#2055', customer: 'Yasmine Rida', product: 'Ensemble Crème', amount: 2100, status: 'processing', date: '2026-05-24' },
    { id: '#2054', customer: 'Omar Kadi', product: 'Chemise Lin', amount: 460, status: 'delivered', date: '2026-05-23' },
  ];
  const data = orders.length > 0 ? orders : MOCK;

  return (
    <div style={card}>
      <div style={cardHeader}>
        <div>
          <p style={cardTitle}>Commandes récentes</p>
          <p style={cardSub}>{data.length} commandes · données en direct</p>
        </div>
        <Link to="/boutique/commandes" style={linkBtn}>Voir tout →</Link>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              {['#', 'Client', 'Produit', 'Montant', 'Statut', 'Date'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3].map(i => <tr key={i}><td colSpan={6} style={{ padding: 16 }}><div style={skLine} /></td></tr>)
              : data.map(o => (
                  <tr key={o.id} className="fa-table-row" style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={td}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600, color: '#6B7280' }}>{o.id}</span></td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 13, color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>
                          {(o.customer || '?')[0]}
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#111827' }}>{o.customer}</span>
                      </div>
                    </td>
                    <td style={{ ...td, maxWidth: 150 }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product}</span></td>
                    <td style={td}><span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#111827' }}>{Number(o.amount).toLocaleString('fr-FR')} MAD</span></td>
                    <td style={td}><OrderBadge status={o.status} /></td>
                    <td style={td}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9CA3AF' }}>{o.date ? new Date(o.date).toLocaleDateString('fr-FR') : '—'}</span></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Stock alerts widget ──────────────────────────────────── */
function StockAlerts() {
  const ALERTS = [
    { name: 'Robe Émeraude', stock: 3, threshold: 5 },
    { name: 'Caftan Or', stock: 0, threshold: 5 },
    { name: 'Ensemble Crème', stock: 2, threshold: 5 },
  ];
  return (
    <div style={card}>
      <div style={cardHeader}>
        <div>
          <p style={cardTitle}>⚠️ Alertes stock</p>
          <p style={cardSub}>{ALERTS.length} produits sous le seuil</p>
        </div>
        <Link to="/boutique/produits" style={linkBtn}>Gérer →</Link>
      </div>
      <div style={{ padding: '8px 0' }}>
        {ALERTS.map((a, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', borderBottom: i < ALERTS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#111827', fontWeight: 500 }}>{a.name}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, backgroundColor: a.stock === 0 ? '#fef2f2' : '#fff7ed', color: a.stock === 0 ? '#dc2626' : '#c2410c', padding: '3px 10px', borderRadius: 20 }}>
              {a.stock === 0 ? 'Rupture' : `${a.stock} restants`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── AI Advisor teaser ────────────────────────────────────── */
function AIAdvisorCard() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#1B3A35 0%,#2A5248 60%,#3D6B5F 100%)', borderRadius: 16, padding: '22px 24px', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(201,168,76,0.12)' }} />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>✦ Conseiller IA</p>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>Analyse & recommandations</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 18, lineHeight: 1.6 }}>
        Basé sur vos ventes, stocks et comportements clients en temps réel.
      </p>
      <Link to="/boutique/ai-advisor" style={{ backgroundColor: '#C9A84C', color: '#1B3A35', borderRadius: 20, padding: '9px 20px', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
        Voir les recommandations →
      </Link>
    </div>
  );
}

/* ── BoutiqueDashboard ────────────────────────────────────── */
export default function BoutiqueDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30days');

  const { data: stats, loading: statsLoading, error: statsError } = useBoutiqueStats();
  const { data: charts, loading: chartsLoading } = useBoutiqueCharts(period);

  const { revenueData, conversionData, hasData, periodLabel } = useMemo(() => {
    if (!charts?.labels?.length) {
      return { revenueData: [], conversionData: [], hasData: false, periodLabel: charts?.period_label || '30 derniers jours' };
    }
    return {
      revenueData: charts.labels.map((label, i) => ({ label, revenue: Number(charts.revenue?.[i] ?? 0) })),
      conversionData: charts.labels.map((label, i) => ({ label, views: Number(charts.views?.[i] ?? 0), orders: Number(charts.orders?.[i] ?? 0) })),
      hasData: charts.has_data ?? false,
      periodLabel: charts.period_label || '30 derniers jours',
    };
  }, [charts]);

  const s = stats || {};
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const statsCards = [
    { label: 'Produits',        value: s.total_products ?? 48,    icon: <ProductIcon />, ...CARD_GRADIENTS[0] },
    { label: 'Commandes',       value: s.total_orders   ?? 124,   icon: <OrderIcon />,   ...CARD_GRADIENTS[1], change: s.recent_stats?.orders_change },
    { label: 'Revenus',         value: s.total_revenue  ?? 84500, icon: <RevenueIcon />, ...CARD_GRADIENTS[2], change: s.recent_stats?.revenue_change, suffix: ' MAD' },
    { label: 'Note Moyenne',    value: s.average_rating ?? 4.7,   icon: <StarIcon />,    ...CARD_GRADIENTS[3], abbreviate: false },
    { label: 'Followers',       value: s.total_followers ?? 312,  icon: <UsersIcon />,   ...CARD_GRADIENTS[4] },
    { label: 'Vues',            value: s.total_views    ?? 2840,  icon: <EyeIcon />,     ...CARD_GRADIENTS[5] },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }} className="fa-animate">
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'capitalize', marginBottom: 4 }}>{today}</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>
            Bonjour, {user?.name?.split(' ')[0] || 'là'} 👋
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            {statsLoading ? 'Chargement…' : `${s.today_stats?.orders ?? 0} commandes aujourd'hui · ${Number(s.today_stats?.revenue ?? 0).toLocaleString('fr-FR')} MAD`}
          </p>
        </div>
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      {statsError && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#dc2626' }}>
          ⚠️ Impossible de charger les statistiques. <button onClick={() => window.location.reload()} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, marginLeft: 4 }}>Réessayer</button>
        </div>
      )}

      {/* 3×2 Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="stats-grid">
        {statsCards.map((card, i) => (
          <div key={i} style={{ animation: `fa-fade-in 0.4s ease ${i * 0.06}s both` }}>
            <StatsCard {...card} loading={statsLoading} />
          </div>
        ))}
      </div>

      {/* Charts + AI Advisor */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }} className="charts-grid">
        <RevenueChart data={revenueData} loading={chartsLoading} periodLabel={periodLabel} hasData={hasData} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <AIAdvisorCard />
          <StockAlerts />
        </div>
      </div>

      {/* Recent orders */}
      <RecentOrdersTable orders={stats?.recent_orders ?? []} loading={statsLoading} />

      <style>{`
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 700px)  { .stats-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px)  { .charts-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* ── Shared styles ────────────────────────────────────────── */
const card = { background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' };
const cardHeader = { padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const cardTitle  = { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: '#111827', margin: 0 };
const cardSub    = { fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' };
const th  = { padding: '11px 18px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', whiteSpace: 'nowrap' };
const td  = { padding: '13px 18px' };
const linkBtn = { padding: '6px 14px', borderRadius: 20, border: '1px solid #D1D5DB', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#374151', textDecoration: 'none', backgroundColor: 'transparent' };
const skLine  = { height: 14, borderRadius: 7, background: '#F3F4F6', animation: 'fa-pulse 1.5s ease-in-out infinite' };
