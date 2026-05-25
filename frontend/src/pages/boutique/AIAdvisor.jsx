import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAIRecommendations } from '../../hooks/useDashboardData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const priorityConfig = {
  high:   { label: 'Priorité haute',   bg: '#FFF0F0', color: '#c0392b', border: '#F5A0A0', dot: '#c0392b' },
  medium: { label: 'Priorité moyenne', bg: '#FFF8F0', color: '#B85C00', border: '#F5C07A', dot: '#E3C8B5' },
  low:    { label: 'Priorité basse',   bg: '#F0FFF4', color: '#1A6B3C', border: '#6FCF97', dot: '#69807E' },
};

const typeIcons = {
  restock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  stock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  price: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  promotion: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  conversion: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
    </svg>
  ),
  catalog: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  new: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
};

function normalizeRec(rec) {
  return {
    ...rec,
    description: rec.description || rec.message || '',
    action: rec.action || 'Voir',
    type: rec.type === 'low_stock' || rec.type === 'out_of_stock' ? 'restock' : (rec.type || 'catalog'),
  };
}

function RecommendationCard({ rec, index }) {
  const pCfg = priorityConfig[rec.priority] || priorityConfig.medium;
  const icon = typeIcons[rec.type] || typeIcons.catalog;

  return (
    <div
      key={`${rec.title}-${index}`}
      style={{
        background: '#fff', borderRadius: 14, padding: '18px 22px',
        boxShadow: '0 2px 8px rgba(44,58,57,0.06)',
        border: '1px solid rgba(147,151,144,0.1)',
        borderLeft: `3px solid ${pCfg.dot}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#D4E0E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#69807E', flexShrink: 0 }}>
            {icon}
          </div>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, fontWeight: 600, color: '#2C2C2C' }}>{rec.title}</p>
        </div>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'Raleway, sans-serif', letterSpacing: '0.05em', backgroundColor: pCfg.bg, color: pCfg.color, border: `1px solid ${pCfg.border}`, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
          {pCfg.label}
        </span>
      </div>
      <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>{rec.description}</p>
      {rec.product_id ? (
        <Link
          to="/boutique/products"
          style={{ padding: '7px 16px', borderRadius: 8, border: 'none', backgroundColor: '#D4E0E2', color: '#69807E', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
        >
          {rec.action} →
        </Link>
      ) : (
        <span style={{ padding: '7px 16px', borderRadius: 8, backgroundColor: '#F3F2F5', color: '#939790', fontFamily: 'Raleway, sans-serif', fontSize: 12 }}>
          {rec.action}
        </span>
      )}
    </div>
  );
}

export default function AIAdvisor() {
  const { i18n } = useTranslation();
  const { data, loading } = useAIRecommendations();
  const [period, setPeriod] = useState('30days');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const topProducts = data?.top_products || [];
  const ruleRecs = (data?.recommendations || []).map(normalizeRec);
  const maxSales = Math.max(...topProducts.map((p) => p.sales || p.total_purchases || 0), 1);

  const aiRecs = analysis?.available
    ? (analysis.recommendations || []).map(normalizeRec)
    : (analysis?.fallback?.recommendations || []).map(normalizeRec);

  const displayRecs = aiRecs.length > 0 ? aiRecs : ruleRecs;
  const recCount = displayRecs.length;

  const runAnalysis = async (refresh = false) => {
    setAnalyzing(true);
    setAnalysisError('');
    try {
      const res = await api.get('/boutique/ai-advisor/analysis', {
        params: {
          period,
          refresh: refresh ? 1 : 0,
          locale: i18n.language?.split('-')[0] || 'fr',
        },
      });
      setAnalysis(res.data);
    } catch (err) {
      setAnalysisError(err.response?.data?.message || 'Impossible de générer l\'analyse IA.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      <div style={{
        background: 'linear-gradient(135deg, #2C3A39 0%, #3D5452 40%, #69807E 100%)',
        borderRadius: 20, padding: '32px 36px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 260 }}>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, letterSpacing: '0.25em', color: '#E3C8B5', textTransform: 'uppercase', marginBottom: 12 }}>✦ Intelligence artificielle · Gemini</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 400, color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>
            Conseiller boutique
          </h2>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 520, lineHeight: 1.7 }}>
            Analyse vos ventes, stocks et conversions pour proposer des actions concrètes (réappro, prix, promos).
          </p>
          {!data?.gemini_configured && (
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#E3C8B5', marginTop: 12, opacity: 0.9 }}>
              ⚠ Ajoutez GEMINI_API_KEY dans backend/.env pour l&apos;analyse complète.
            </p>
          )}
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Raleway, sans-serif', fontSize: 12 }}
          >
            <option value="7days">7 jours</option>
            <option value="30days">30 jours</option>
            <option value="90days">90 jours</option>
          </select>
          <button
            type="button"
            onClick={() => runAnalysis(false)}
            disabled={analyzing}
            style={{
              padding: '12px 22px', borderRadius: 10, border: 'none',
              backgroundColor: '#E3C8B5', color: '#2C3A39', cursor: analyzing ? 'wait' : 'pointer',
              fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600,
              opacity: analyzing ? 0.7 : 1,
            }}
          >
            {analyzing ? 'Analyse en cours…' : '✦ Générer analyse IA'}
          </button>
          {analysis?.available && (
            <button
              type="button"
              onClick={() => runAnalysis(true)}
              disabled={analyzing}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.35)', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontFamily: 'Raleway, sans-serif', fontSize: 11, cursor: 'pointer' }}
            >
              Actualiser
            </button>
          )}
        </div>
      </div>

      {analysisError && (
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#c0392b', padding: '12px 16px', background: '#FFF0F0', borderRadius: 10 }}>
          {analysisError}
        </p>
      )}

      {analysis && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', boxShadow: '0 2px 12px rgba(44,58,57,0.07)', border: '1px solid rgba(147,151,144,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, color: '#2C2C2C' }}>
              Rapport IA — {analysis.period_label || period}
            </p>
            {analysis.available && analysis.generated_at && (
              <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#939790' }}>
                Généré le {new Date(analysis.generated_at).toLocaleString('fr-FR')}
              </span>
            )}
          </div>

          {!analysis.available && analysis.message && (
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#B85C00', marginBottom: 16 }}>{analysis.message}</p>
          )}

          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 20 }}>
            {analysis.summary || analysis.fallback?.summary}
          </p>

          {analysis.monthly_focus && (
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600, color: '#69807E', marginBottom: 20 }}>
              🎯 Priorité du mois : {analysis.monthly_focus}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
            <div>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, color: '#1A6B3C', letterSpacing: '0.08em', marginBottom: 10 }}>POINTS FORTS</p>
              <ul style={{ margin: 0, paddingLeft: 18, fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#555', lineHeight: 1.8 }}>
                {(analysis.strengths || analysis.fallback?.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, color: '#c0392b', letterSpacing: '0.08em', marginBottom: 10 }}>À AMÉLIORER</p>
              <ul style={{ margin: 0, paddingLeft: 18, fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#555', lineHeight: 1.8 }}>
                {(analysis.weaknesses || analysis.fallback?.weaknesses || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {(analysis.best_products_note || analysis.worst_products_note) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid #F3F2F5' }}>
              {analysis.best_products_note && (
                <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#555' }}>
                  <strong>Meilleures ventes :</strong> {analysis.best_products_note}
                </p>
              )}
              {analysis.worst_products_note && (
                <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#555' }}>
                  <strong>À optimiser :</strong> {analysis.worst_products_note}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: 20 }}>

          <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 2px 12px rgba(44,58,57,0.07)', border: '1px solid rgba(147,151,144,0.12)' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#2C2C2C', marginBottom: 4 }}>Top produits</p>
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', marginBottom: 20 }}>Ventes sur la période</p>
            {topProducts.length === 0 ? (
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790' }}>Pas encore de données de vente.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topProducts.map((p, i) => {
                  const sales = p.sales ?? p.total_purchases ?? 0;
                  return (
                    <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 500, color: '#D4E0E2', width: 24, textAlign: 'center' }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 500, color: '#2C2C2C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        <div style={{ height: 4, borderRadius: 4, backgroundColor: '#F3F2F5', marginTop: 6 }}>
                          <div style={{ height: '100%', borderRadius: 4, backgroundColor: '#69807E', width: `${(sales / maxSales) * 100}%` }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#2C2C2C' }}>{sales}</p>
                        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 10, color: p.trend === 'up' ? '#2D6A4F' : p.trend === 'down' ? '#c0392b' : '#939790' }}>
                          {p.trend === 'up' ? `↑ ${p.growth || 0}%` : p.trend === 'down' ? `↓ ${Math.abs(p.growth || 0)}%` : 'ventes'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', letterSpacing: '0.05em' }}>
              {recCount} action(s) suggérée(s)
              {analysis?.available ? ' · enrichies par Gemini' : ' · règles automatiques'}
            </p>
            {displayRecs.length === 0 ? (
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', padding: 24, background: '#fff', borderRadius: 14 }}>
                Aucune alerte pour l&apos;instant. Lancez une analyse IA ou vérifiez vos stocks.
              </p>
            ) : (
              displayRecs.map((rec, i) => <RecommendationCard key={i} rec={rec} index={i} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
