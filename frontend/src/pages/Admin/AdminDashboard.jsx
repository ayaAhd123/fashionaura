import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../../components/common/StatsCard';
import RevenueChart from '../../components/charts/RevenueChart';
import TopProductsChart from '../../components/charts/TopProductsChart';
import { useAdminStats, useAdminAnalytics, usePendingBoutiques } from '../../hooks/useDashboardData';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ── Card configs ─────────────────────────────────────────── */
const CARD_GRADIENTS = [
  { gradient: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', iconColor: '#16a34a', icon: <BoutiqueIcon /> },
  { gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)', iconColor: '#2563eb', icon: <CityIcon /> },
  { gradient: 'linear-gradient(135deg,#fdf4ff,#fae8ff)', iconColor: '#9333ea', icon: <UserIcon /> },
  { gradient: 'linear-gradient(135deg,#fffbeb,#fef3c7)', iconColor: '#d97706', icon: <OrderIcon /> },
  { gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', iconColor: '#dc2626', icon: <RevenueIcon /> },
  { gradient: 'linear-gradient(135deg,#fff7ed,#ffedd5)', iconColor: '#ea580c', icon: <ClockIcon /> },
];

function BoutiqueIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function CityIcon()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function UserIcon()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function OrderIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function RevenueIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function ClockIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

/* ── Status badge ─────────────────────────────────────────── */
function Badge({ status }) {
  const cfg = {
    pending:  { label: 'En attente', bg: '#fff7ed', color: '#c2410c' },
    approved: { label: 'Actif',      bg: '#f0fdf4', color: '#15803d' },
    rejected: { label: 'Refusé',     bg: '#fef2f2', color: '#dc2626' },
    active:   { label: 'Actif',      bg: '#f0fdf4', color: '#15803d' },
  }[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

/* ── Recent Boutiques table ───────────────────────────────── */
function RecentBoutiquesTable({ boutiques = [], loading, onValidate }) {
  const MOCK = [
    { id: 1, name: 'Élégance Paris', owner: 'Amina B.', city: 'Casablanca', created_at: '2026-03-28', status: 'pending' },
    { id: 2, name: 'Luxe Maroc', owner: 'Khalid M.', city: 'Rabat', created_at: '2026-03-27', status: 'pending' },
    { id: 3, name: 'Mode & Style', owner: 'Sara F.', city: 'Marrakech', created_at: '2026-03-25', status: 'pending' },
    { id: 4, name: 'Chic Fès', owner: 'Yasmine R.', city: 'Fès', created_at: '2026-03-22', status: 'approved' },
    { id: 5, name: 'Tailor Rabat', owner: 'Omar K.', city: 'Rabat', created_at: '2026-03-20', status: 'approved' },
  ];
  const data = boutiques?.length > 0 ? boutiques : MOCK;

  return (
    <div style={card}>
      <div style={cardHeader}>
        <div>
          <p style={cardTitle}>Boutiques récentes</p>
          <p style={cardSub}>Demandes en attente de validation</p>
        </div>
        <Link to="/admin/boutiques" style={linkBtn}>Voir tout →</Link>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              {['Boutique', 'Propriétaire', 'Ville', 'Date', 'Statut', 'Actions'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3].map(i => (
                  <tr key={i}><td colSpan={6} style={{ padding: 16 }}>
                    <div style={{ height: 14, borderRadius: 7, background: '#F3F4F6', animation: 'fa-pulse 1.5s ease-in-out infinite' }} />
                  </td></tr>
                ))
              : data.slice(0, 5).map(b => (
                  <tr key={b.id} className="fa-table-row" style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 15, color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>
                          {b.name?.[0] || '?'}
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#111827' }}>{b.name}</span>
                      </div>
                    </td>
                    <td style={td}><span style={tdText}>{b.owner}</span></td>
                    <td style={td}><span style={tdText}>{b.city}</span></td>
                    <td style={td}><span style={{ ...tdText, color: '#9CA3AF' }}>{b.created_at ? new Date(b.created_at).toLocaleDateString('fr-FR') : '—'}</span></td>
                    <td style={td}><Badge status={b.status} /></td>
                    <td style={td}>
                      {b.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => onValidate(b.id, 'approved')} style={approveBtn}>Valider</button>
                          <button onClick={() => onValidate(b.id, 'rejected')} style={rejectBtn}>Refuser</button>
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

/* ── Quick actions bar ────────────────────────────────────── */
function QuickActions() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Link to="/admin/boutiques" style={qBtn('#1B3A35', '#fff')}>+ Boutique</Link>
      <Link to="/admin/categories" style={qBtn('#2A5248', '#fff')}>+ Catégorie</Link>
      <button onClick={() => toast.success('Export en cours…')} style={{ ...qBtn('#C9A84C', '#1B3A35'), border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
        Exporter rapport
      </button>
    </div>
  );
}

/* ── AdminDashboard ───────────────────────────────────────── */
export default function AdminDashboard() {
  const { data: stats, loading: statsLoading } = useAdminStats();
  const { data: analytics, loading: analyticsLoading } = useAdminAnalytics();
  const { data: boutiques, loading: boutiquesLoading, refetch } = usePendingBoutiques();

  const s = stats || {
    total_boutiques:  142,
    total_cities:      28,
    total_users:     3847,
    total_orders:    1204,
    total_revenue:  894500,
    pending_boutiques: 3,
  };

  const handleValidate = async (id, action) => {
    try {
      await api.post(`/admin/boutiques/${id}/${action}`);
      toast.success(action === 'approved' ? 'Boutique validée' : 'Boutique refusée');
      refetch();
    } catch (err) {
      toast.error('Erreur lors de la validation');
    }
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const statsCards = [
    { label: 'Boutiques',    value: s.total_boutiques,   change: 8.2,  suffix: '',      ...CARD_GRADIENTS[0] },
    { label: 'Villes',       value: s.total_cities,      change: 4.5,  suffix: '',      ...CARD_GRADIENTS[1] },
    { label: 'Utilisateurs', value: s.total_users,        change: 12.7, suffix: '',      ...CARD_GRADIENTS[2] },
    { label: 'Commandes',    value: s.total_orders,       change: -2.1, suffix: '',      ...CARD_GRADIENTS[3] },
    { label: 'Revenus',      value: s.total_revenue,      change: 15.3, suffix: ' MAD',  ...CARD_GRADIENTS[4] },
    { label: 'En Attente',   value: s.pending_boutiques,  change: undefined, suffix: '', ...CARD_GRADIENTS[5] },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="fa-animate">
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'capitalize', marginBottom: 4 }}>{today}</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>
          Vue d'ensemble de la plateforme
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          Tableau de bord administrateur · données en temps réel
        </p>
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* 3×2 Stat cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="stats-grid">
        {statsCards.map((card, i) => (
          <div key={i} style={{ animation: `fa-fade-in 0.4s ease ${i * 0.06}s both` }}>
            <StatsCard {...card} loading={statsLoading} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="charts-grid">
        <div style={{ animation: 'fa-fade-in 0.5s ease 0.35s both' }}>
          <RevenueChart data={analytics?.daily_stats} loading={analyticsLoading} />
        </div>
        <div style={{ animation: 'fa-fade-in 0.5s ease 0.45s both' }}>
          <TopProductsChart data={analytics?.category_stats} loading={analyticsLoading} />
        </div>
      </div>

      {/* Recent boutiques */}
      <div style={{ animation: 'fa-fade-in 0.5s ease 0.55s both' }}>
        <RecentBoutiquesTable boutiques={boutiques || []} loading={boutiquesLoading} onValidate={handleValidate} />
      </div>

      <style>{`
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 700px)  { .stats-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px)  { .charts-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* ── Shared styles ────────────────────────────────────────── */
const card = {
  background: '#fff', borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
};
const cardHeader = {
  padding: '18px 24px', borderBottom: '1px solid #F3F4F6',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const cardTitle = { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: '#111827', margin: 0 };
const cardSub   = { fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' };
const th = { padding: '11px 18px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', whiteSpace: 'nowrap' };
const td = { padding: '13px 18px' };
const tdText = { fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151' };
const linkBtn = { padding: '6px 14px', borderRadius: 20, border: '1px solid #D1D5DB', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#374151', textDecoration: 'none', backgroundColor: 'transparent', whiteSpace: 'nowrap' };
const approveBtn = { padding: '5px 12px', borderRadius: 8, border: 'none', backgroundColor: '#dcfce7', color: '#15803d', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600 };
const rejectBtn  = { padding: '5px 12px', borderRadius: 8, border: '1px solid #fecaca', backgroundColor: 'transparent', color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600 };
const qBtn = (bg, color) => ({ display: 'inline-block', padding: '9px 20px', borderRadius: 20, backgroundColor: bg, color, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.18s' });
