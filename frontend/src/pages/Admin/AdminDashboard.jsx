import { useState } from 'react';
import StatsCard from '../../components/common/StatsCard';
import RevenueChart from '../../components/charts/RevenueChart';
import TopProductsChart from '../../components/charts/TopProductsChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAdminStats, useAdminAnalytics, usePendingBoutiques } from '../../hooks/useDashboardData';
import api from '../../services/api';

// ─── Icônes stats ─────────────────────────────────────────────────────────────
const StatIcons = {
  boutiques: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  cities: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  revenue: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  orders: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#69807E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" x2="21" y1="6" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  pending: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E3C8B5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig = {
  pending:  { label: 'En attente', bg: '#FFF8F0', color: '#B85C00', border: '#F5C07A' },
  approved: { label: 'Validée',    bg: '#F0FFF4', color: '#1A6B3C', border: '#6FCF97' },
  rejected: { label: 'Refusée',    bg: '#FFF0F0', color: '#c0392b', border: '#F5A0A0' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      fontFamily: 'Raleway, sans-serif', letterSpacing: '0.06em',
      backgroundColor: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Tableau boutiques en attente ─────────────────────────────────────────────
function PendingBoutiquesTable({ boutiques = [], loading, onValidate }) {
  const MOCK = [
    { id: 1, name: 'Élégance Paris', owner: 'Amina B.', city: 'Casablanca', created_at: '2026-03-28', status: 'pending' },
    { id: 2, name: 'Luxe Maroc', owner: 'Khalid M.', city: 'Rabat', created_at: '2026-03-27', status: 'pending' },
    { id: 3, name: 'Mode & Style', owner: 'Sara F.', city: 'Marrakech', created_at: '2026-03-25', status: 'pending' },
    { id: 4, name: 'Chic Fès', owner: 'Yasmine R.', city: 'Fès', created_at: '2026-03-22', status: 'approved' },
  ];
  
  const data = boutiques && boutiques.length > 0 ? boutiques : MOCK;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(44,58,57,0.07)', border: '1px solid rgba(147,151,144,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #F3F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#2C2C2C' }}>Boutiques en attente</p>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.05em' }}>Demandes de validation récentes</p>
        </div>
        <span style={{ backgroundColor: '#FFF8F0', color: '#B85C00', border: '1px solid #F5C07A', borderRadius: 20, padding: '4px 14px', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600 }}>
          {data.filter(b => b.status === 'pending').length} en attente
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9F8FA' }}>
              {['Boutique', 'Propriétaire', 'Ville', 'Date', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#939790', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((boutique, i) => (
              <tr key={boutique.id} style={{ borderTop: '1px solid #F3F2F5', transition: 'background 0.15s' }} className="fa-table-row">
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#D4E0E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#69807E', fontWeight: 500, flexShrink: 0 }}>
                      {boutique.name ? boutique.name[0] : '?'}
                    </div>
                    <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2C2C' }}>{boutique.name || 'Nom inconnu'}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#555' }}>{boutique.owner || '-'}</td>
                <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#555' }}>{boutique.city || '-'}</td>
                <td style={{ padding: '14px 20px', fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790' }}>
                  {boutique.created_at ? new Date(boutique.created_at).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td style={{ padding: '14px 20px' }}><StatusBadge status={boutique.status} /></td>
                <td style={{ padding: '14px 20px' }}>
                  {boutique.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => onValidate(boutique.id, 'approved')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', backgroundColor: '#D4E0E2', color: '#69807E', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
                        Valider
                      </button>
                      <button onClick={() => onValidate(boutique.id, 'rejected')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #F5A0A0', backgroundColor: 'transparent', color: '#c0392b', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
                        Refuser
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: stats, loading: statsLoading } = useAdminStats();
  const { data: analytics, loading: analyticsLoading } = useAdminAnalytics();
  const { data: boutiques, loading: boutiquesLoading, refetch } = usePendingBoutiques();

  // Fallback stats pour le dev
  const s = stats || {
    total_boutiques: 142,
    total_cities: 28,
    total_users: 3847,
    total_orders: 1204,
    total_revenue: 894500,
    pending_boutiques: 3,
  };

  const handleValidate = async (id, action) => {
    try {
      await api.post(`/admin/boutiques/${id}/${action}`);
      refetch();
    } catch (err) {
      console.error('Validation error:', err);
    }
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Salutation ── */}
      <div style={{ animation: 'fa-fade-in 0.4s ease forwards' }}>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.1em', textTransform: 'capitalize', marginBottom: 4 }}>{today}</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 400, color: '#2C2C2C' }}>
          Vue d'ensemble de la plateforme
        </h2>
      </div>

      {/* ── Cartes stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {[
          { label: 'Boutiques', value: s.total_boutiques, icon: StatIcons.boutiques, change: 8.2 },
          { label: 'Villes couvertes', value: s.total_cities, icon: StatIcons.cities, change: 4.5 },
          { label: 'Utilisateurs', value: s.total_users, icon: StatIcons.users, change: 12.7 },
          { label: 'Commandes', value: s.total_orders, icon: StatIcons.orders, change: -2.1 },
          { label: 'Revenus', value: s.total_revenue, icon: StatIcons.revenue, change: 15.3, prefix: '', suffix: ' MAD' },
          {
            label: 'En attente',
            value: s.pending_boutiques,
            icon: <div style={{ ...iconWrapper, backgroundColor: '#FFF8F0' }}>{StatIcons.pending}</div>,
            change: undefined,
          },
        ].map((card, i) => (
          <div key={i} style={{ animation: `fa-fade-in 0.4s ease ${i * 0.08}s forwards`, opacity: 0 }}>
            <StatsCard {...card} loading={statsLoading} />
          </div>
        ))}
      </div>

      {/* ── Graphiques ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ animation: 'fa-fade-in 0.5s ease 0.3s forwards', opacity: 0 }}>
          <RevenueChart data={analytics?.daily_stats} loading={analyticsLoading} />
        </div>
        <div style={{ animation: 'fa-fade-in 0.5s ease 0.4s forwards', opacity: 0 }}>
          <TopProductsChart data={analytics?.category_stats} loading={analyticsLoading} />
        </div>
      </div>

      {/* ── Tableau boutiques en attente ── */}
      <div style={{ animation: 'fa-fade-in 0.5s ease 0.5s forwards', opacity: 0 }}>
        <PendingBoutiquesTable boutiques={boutiques || []} loading={boutiquesLoading} onValidate={handleValidate} />
      </div>

      {/* CSS hover table rows */}
      <style>{`
        .fa-table-row:hover { background-color: #FAFAF9 !important; }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const iconWrapper = {
  width: 48, height: 48, borderRadius: 12, backgroundColor: '#D4E0E2',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};