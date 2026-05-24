import { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MOCK_CITIES = [
  { id: 1, name: 'Casablanca', boutiques_count: 42, region: 'Grand Casablanca-Settat', active: true },
  { id: 2, name: 'Rabat', boutiques_count: 28, region: 'Rabat-Salé-Kénitra', active: true },
  { id: 3, name: 'Marrakech', boutiques_count: 35, region: 'Marrakech-Safi', active: true },
  { id: 4, name: 'Fès', boutiques_count: 19, region: 'Fès-Meknès', active: true },
  { id: 5, name: 'Tanger', boutiques_count: 22, region: 'Tanger-Tétouan-Al Hoceïma', active: false },
  { id: 6, name: 'Agadir', boutiques_count: 15, region: 'Souss-Massa', active: true },
];

function CityModal({ city, onClose, onSave }) {
  const [name, setName] = useState(city?.name || '');
  const [region, setRegion] = useState(city?.region || '');
  const [active, setActive] = useState(city?.active ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (city?.id) {
        await api.put(`/admin/cities/${city.id}`, { name, region, active });
      } else {
        await api.post('/admin/cities', { name, region, active });
      }
      onSave();
    } catch {
      // fallback: just close
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fa-fade-in 0.2s ease forwards' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 500, color: '#2C2C2C', marginBottom: 24 }}>
          {city ? 'Modifier la ville' : 'Ajouter une ville'}
        </h3>

        {[{ label: 'Nom de la ville', value: name, set: setName }, { label: 'Région', value: region, set: setRegion }].map(({ label, value, set }) => (
          <div key={label} style={{ marginBottom: 18 }}>
            <label style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#939790', display: 'block', marginBottom: 8 }}>
              {label}
            </label>
            <input
              value={value} onChange={e => set(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #D4E0E2', fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#2C2C2C', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#69807E'}
              onBlur={e => e.target.style.borderColor = '#D4E0E2'}
            />
          </div>
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 28 }}>
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#69807E' }} />
          <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#2C2C2C' }}>Ville active</span>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #D4E0E2', backgroundColor: 'transparent', color: '#939790', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 14, fontWeight: 500 }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving || !name} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', backgroundColor: '#69807E', color: '#fff', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 14, fontWeight: 600, opacity: saving || !name ? 0.6 : 1 }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CitiesManager() {
  const { data, loading, refetch } = useDashboardData('/admin/cities', {}, []);
  const cities = (data?.length ? data : MOCK_CITIES);
  const [modal, setModal] = useState(null); // null | 'new' | city object
  const [search, setSearch] = useState('');

  const filtered = cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette ville ?')) return;
    try { await api.delete(`/admin/cities/${id}`); refetch(); } catch { refetch(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fa-fade-in 0.4s ease forwards' }}>
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 400, color: '#2C2C2C' }}>Gestion des villes</h2>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', marginTop: 2 }}>{cities.length} villes configurées</p>
        </div>
        <button onClick={() => setModal('new')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', backgroundColor: '#69807E', color: '#fff', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Ajouter une ville
        </button>
      </div>

      {/* ── Recherche ── */}
      <div style={{ position: 'relative', maxWidth: 360, animation: 'fa-fade-in 0.4s ease 0.1s forwards', opacity: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#939790" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une ville…"
          style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1.5px solid #D4E0E2', fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#2C2C2C', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
        />
      </div>

      {/* ── Grid villes ── */}
      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, animation: 'fa-fade-in 0.4s ease 0.2s forwards', opacity: 0 }}>
          {filtered.map((city, i) => (
            <div key={city.id} style={{
              background: '#fff', borderRadius: 16, padding: '22px 24px',
              boxShadow: '0 2px 10px rgba(44,58,57,0.07)',
              border: `1px solid ${city.active ? 'rgba(147,151,144,0.12)' : '#F5A0A0'}`,
              transition: 'all 0.2s',
              animation: `fa-fade-in 0.3s ease ${i*0.06}s both`,
            }} className="fa-city-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#D4E0E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#69807E', fontWeight: 500 }}>
                    {city.name[0]}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 15, fontWeight: 600, color: '#2C2C2C' }}>{city.name}</p>
                    <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#939790', marginTop: 1 }}>{city.region}</p>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                  fontFamily: 'Raleway, sans-serif', letterSpacing: '0.06em',
                  backgroundColor: city.active ? '#D4E0E2' : '#FFF0F0',
                  color: city.active ? '#69807E' : '#c0392b',
                }}>
                  {city.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, color: '#2C2C2C' }}>
                  {city.boutiques_count}
                  <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#939790', marginLeft: 6, fontWeight: 400 }}>boutiques</span>
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setModal(city)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #D4E0E2', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#69807E', transition: 'all 0.2s' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(city.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #F5A0A0', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b', transition: 'all 0.2s' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CityModal city={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); refetch(); }} />
      )}

      <style>{`
        .fa-city-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(44,58,57,0.1) !important; }
      `}</style>
    </div>
  );
}