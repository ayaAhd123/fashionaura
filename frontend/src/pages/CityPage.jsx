import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCity, getCities } from '../api/cityService';
import { getBoutiquesByCity } from '../api/boutiqueService';
import '../styles/city.css';
import CustomCursor from '../components/CustomCursor';
import zelligeImage from '../images/zellige-marocain.jpg';
import { useTranslation } from 'react-i18next';

const CITY_THEMES = {
    'Tanger': {
        bg: '#35457A', bgRgb: '53, 69, 122', main: '#045490', mid: '#84B7CE', light: '#FFFFFF', accent: '#FFF08C',
        nickname: 'La Perle Azuré & Limoncello',
        poetic: 'Un zeste de soleil sur le bleu de la Méditerranée',
        effect: 'waves'
    },
    'Casablanca': {
        bg: '#FDFCF9', bgRgb: '253, 252, 249', main: '#1E6B47', mid: '#C8A87A', light: '#091A11', accent: '#D4A843',
        nickname: 'Casa Branca',
        poetic: 'Majestueuse sous le ciel atlantique',
        effect: 'hassan'
    },
    'Rabat': {
        bg: '#0A1428', bgRgb: '10, 20, 40', main: '#DCA150', mid: '#8A9BB0', light: '#2C9E6A', accent: '#F0EFEA',
        nickname: 'La Ville Lumière',
        poetic: "Où l'histoire sculpte le futur",
        effect: 'modern-royal'
    },
    'Fès': {
        bg: '#301A00', bgRgb: '48, 26, 0', main: '#C4821B', mid: '#D4AF6A', light: '#FBF0CC', accent: '#3A2800',
        nickname: 'La Ville Impériale',
        poetic: "L'art du zellige t'immerge",
        effect: 'zellige'
    },
    'Marrakech': {
        bg: '#4A1C10', bgRgb: '74, 28, 16', main: '#C87A5A', mid: '#E8A88A', light: '#F5D5C0', accent: '#8B6914',
        nickname: 'La Ville Ocre',
        poetic: 'Le charme intemporel du riad',
        effect: 'riad'
    }
};

// Returns true if the hex color is perceptually light (luminance > 0.4)
const isLightBg = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Perceived luminance formula (ITU-R BT.709)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.4;
};

const CityPage = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [city, setCity] = useState(null);
    const [boutiques, setBoutiques] = useState([]);
    const [otherCities, setOtherCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [filter, setFilter] = useState('Tout');
    const [error, setError] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    
    const lastScrollY = useRef(0);
    const observerRef = useRef(null);

    // Apply Dynamic Theme
    useEffect(() => {
        if (!city) return;
        const theme = CITY_THEMES[city.name] || CITY_THEMES['Casablanca'];
        const root = document.documentElement;
        root.style.setProperty('--city-bg', theme.bg);
        root.style.setProperty('--city-bg-rgb', theme.bgRgb);
        root.style.setProperty('--city-main', theme.main);
        root.style.setProperty('--city-mid', theme.mid);
        root.style.setProperty('--city-light', theme.light);
        root.style.setProperty('--city-accent', theme.accent);
        root.style.setProperty('--cursor-color', theme.main);

        document.body.classList.remove(...Object.keys(CITY_THEMES).map(c => `theme-${c.toLowerCase()}`));
        document.body.classList.add(`theme-${city.name.toLowerCase().replace('ès', 'es')}`);
        if (city.name === 'Marrakech') document.body.classList.add('body-breathing');
        else document.body.classList.remove('body-breathing');

        return () => {
            document.body.classList.remove(...Object.keys(CITY_THEMES).map(c => `theme-${c.toLowerCase()}`), 'body-breathing');
        };
    }, [city]);

    // Data Fetching
    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            setError(false);
            try {
                const [cityData, boutiquesData, allCities] = await Promise.all([
                    getCity(id),
                    getBoutiquesByCity(id),
                    getCities()
                ]);

                if (!cityData) throw new Error('City not found');
                
                setCity(cityData);
                setBoutiques(boutiquesData);
                setOtherCities(allCities.filter(c => c.id !== parseInt(id)).slice(0, 4));
                setLoading(false);
                window.scrollTo(0, 0);
            } catch (err) {
                console.error('Failed to load city experience:', err);
                setError(true);
                setLoading(false);
            }
        };
        loadPageData();
    }, [id]);

    // Scroll Observer for Revelations
    useEffect(() => {
        if (loading) return;
        
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.15 });

        const targets = document.querySelectorAll('.boutique-card, .other-card, .explore-heading');
        targets.forEach(t => observerRef.current.observe(t));

        return () => observerRef.current?.disconnect();
    }, [loading, boutiques, filter]);

    // Sticky Nav Scroll Logic
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
                setNavHidden(true);
            } else {
                setNavHidden(false);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mouse Parallax for Zellige Motif
    const onMouseMove = (e) => {
        if (city?.name !== 'Fès') return;
        const x = (e.clientX - window.innerWidth / 2) / 50;
        const y = (e.clientY - window.innerHeight / 2) / 50;
        
        const motif = document.querySelector('.zellige-motif-img');
        if (motif) motif.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
    };

    const handleFilterChange = (cat) => {
        if (cat === filter) return;
        setFiltering(true);
        setTimeout(() => {
            setFilter(cat);
            setFiltering(false);
        }, 300);
    };

    if (loading) return (
        <div className="city-page-container theme-loading">
            <header className="city-hero skeleton" style={{ background: '#0D0D0B' }}>
                <div className="city-hero-content">
                    <div className="skeleton-title" style={{ height: '100px', width: '400px', background: 'rgba(255,255,255,0.05)' }} />
                </div>
            </header>
        </div>
    );

    if (error || !city) return (
        <div className="city-page-container theme-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div className="error-content">
                <div style={{ width: '40px', height: '1px', background: '#C4A882', margin: '0 auto 2rem' }} />
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', color: '#FFF' }}>Cette ville n'existe pas encore</h2>
                <Link to="/" style={{ color: '#C4A882', textDecoration: 'none', letterSpacing: '0.2rem', marginTop: '2rem', display: 'inline-block', borderBottom: '1px solid #C4A882' }}>Retour à la carte</Link>
            </div>
        </div>
    );

    const theme = CITY_THEMES[city.name] || CITY_THEMES['Casablanca'];
    const filteredBoutiques = filter === 'Tout' ? boutiques : boutiques.filter(b => b.category === filter);
    
    const displayTitle = city.name === 'Fès' ? 'FÈS-MEKNÈS' : city.name;
    const charCount = displayTitle.length;

    return (
        <>
            <CustomCursor />
            <div className={`city-page-container theme-${city.name.toLowerCase().replace('ès', 'es')}`} onMouseMove={onMouseMove}>
            
            {/* ─── SECTION 1: HERO ─── */}
            <header className="city-hero">
                <Link to="/" className="city-nav-link">FashionAura</Link>

                <div className="city-hero-content">
                    <span className="city-region-label">{city.region}</span>
                    <h1 className="city-main-title" style={{ '--char-count': charCount }}>
                        {displayTitle}
                    </h1>
                    <div className="gold-hr" />
                    <span className="city-nickname">{theme.nickname}</span>
                    <div className="city-editorial-stat">
                        {boutiques.length} boutiques d'exception
                    </div>
                </div>

                {/* ATMOSPHERIC LAYERS */}
                <div className="atmospheric-layer">
                    {city.name === 'Tanger' && (
                        <>
                            <div className="azulejos-grid" />
                            <div className="waves-container">
                                <svg className="wave-svg wave-1" viewBox="0 24 150 28" preserveAspectRatio="none">
                                    <path className="wave-path" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                                </svg>
                                <svg className="wave-svg wave-2" viewBox="0 24 150 28" preserveAspectRatio="none" style={{ bottom: '10px' }}>
                                    <path className="wave-path" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                                </svg>
                                <svg className="wave-svg wave-3" viewBox="0 24 150 28" preserveAspectRatio="none" style={{ bottom: '20px' }}>
                                    <path className="wave-path" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                                </svg>
                            </div>
                        </>
                    )}

                    {city.name === 'Casablanca' && (
                        <>
                            {/* Ocean atmosphere */}
                            <div className="hassan-ocean-glow" />
                            <div className="hassan-ocean-waves">
                                <svg className="hassan-wave hassan-wave-1" viewBox="0 24 150 28" preserveAspectRatio="none">
                                    <path d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                                </svg>
                                <svg className="hassan-wave hassan-wave-2" viewBox="0 24 150 28" preserveAspectRatio="none">
                                    <path d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                                </svg>
                            </div>

                            {/* Moorish arches in perspective */}
                            <div className="hassan-arches-layer">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className="hassan-arch-frame" style={{
                                        left: `${i * 14.28}%`,
                                        '--arch-delay': `${i * 0.3}s`,
                                        '--arch-opacity': 0.12 - i * 0.012
                                    }} />
                                ))}
                            </div>

                            {/* 8-pointed star mosaic pattern */}
                            <div className="hassan-mosaic-stars">
                                {[...Array(12)].map((_, i) => (
                                    <svg key={i} className="hassan-star" style={{
                                        top: `${10 + Math.random() * 70}%`,
                                        left: `${Math.random() * 90}%`,
                                        animationDelay: `${Math.random() * 6}s`,
                                        '--star-size': `${20 + Math.random() * 25}px`
                                    }} viewBox="0 0 40 40">
                                        <path d="M20 0l5.5 14.5L40 20l-14.5 5.5L20 40l-5.5-14.5L0 20l14.5-5.5z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Zellige emerald band */}
                            <div className="hassan-zellige-band" />
                            {/* Marble floor pattern */}
                            <div className="hassan-marble-floor" />
                            {/* Minaret silhouette */}
                            <div className="hassan-minaret-silhouette" />

                            {/* Ticker */}
                            <div className="casa-ticker">
                                <div className="ticker-gold">
                                    MOSQUÉE HASSAN II · CORNICHE · ATLANTIQUE · ZELLIGE · MODERNITÉ · MOSQUÉE HASSAN II · CORNICHE · ATLANTIQUE · ZELLIGE · MODERNITÉ · MOSQUÉE HASSAN II
                                </div>
                            </div>
                        </>
                    )}

                    {city.name === 'Rabat' && (
                        <>
                            {/* Grand Theatre Sweeping Ribs & River */}
                            <div className="rabat-zaha-curves">
                                <svg className="zaha-rib" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M-10,80 Q30,100 60,60 T120,40" />
                                </svg>
                                <svg className="zaha-rib" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M-10,95 Q40,110 70,70 T120,50" />
                                </svg>
                                <svg className="zaha-rib" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M-10,110 Q50,120 80,80 T120,60" />
                                </svg>
                            </div>

                            {/* Mohammed VI Tower Glowing Beam */}
                            <div className="rabat-m6-beam" />

                            {/* Hassan Tower Moroccan Lattice overlay */}
                            <div className="rabat-hassan-lattice" />

                            {/* Luxury City Lights / Stars */}
                            <div className="particle-emitter">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="dust city-light" style={{ 
                                        left: `${Math.random() * 100}%`, 
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 5}s`,
                                        width: `${2 + Math.random() * 3}px`,
                                        height: `${2 + Math.random() * 3}px`,
                                        backgroundColor: i % 2 === 0 ? '#DCA150' : '#8A9BB0'
                                    }} />
                                ))}
                            </div>

                            {/* Ticker */}
                            <div className="rabat-ticker">
                                <div className="ticker-silver">
                                    GRAND THÉÂTRE · TOUR MOHAMMED VI · TOUR HASSAN · MAUSOLÉE · VALLÉE DU BOUREGREG · LUMIÈRE · MODERNITÉ · HÉRITAGE · GRAND THÉÂTRE
                                </div>
                            </div>
                        </>
                    )}

                    {city.name === 'Fès' && (
                        <>
                            <div className="zellige-grid" />
                            <div className="mosaic-rain-layer">
                                {[...Array(20)].map((_, i) => (
                                    <svg key={i} className="mosaic-star-drop" 
                                        style={{ 
                                            left: `${Math.random() * 100}%`, 
                                            animationDelay: `${Math.random() * 8}s`,
                                            width: `${15 + Math.random() * 20}px`,
                                            fill: i % 3 === 0 ? 'var(--city-mid)' : i % 3 === 1 ? 'var(--city-main)' : 'var(--city-accent)'
                                        }} 
                                        viewBox="0 0 40 40"
                                    >
                                        <path d="M20 0l5.5 14.5L40 20l-14.5 5.5L20 40l-5.5-14.5L0 20l14.5-5.5z" />
                                    </svg>
                                ))}
                            </div>
                        </>
                    )}

                    {city.name === 'Marrakech' && (
                        <>
                            <div className="riad-warm-glow" />
                            <div className="riad-arches-layer">
                                <svg className="riad-arch riad-arch-1" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path d="M0,300 L0,120 Q0,0 100,0 Q200,0 200,120 L200,300" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M30,300 L30,140 Q30,30 100,30 Q170,30 170,140 L170,300" fill="none" stroke="currentColor" strokeWidth="0.8" />
                                </svg>
                                <svg className="riad-arch riad-arch-2" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path d="M0,300 L0,120 Q0,0 100,0 Q200,0 200,120 L200,300" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M30,300 L30,140 Q30,30 100,30 Q170,30 170,140 L170,300" fill="none" stroke="currentColor" strokeWidth="0.8" />
                                </svg>
                                <svg className="riad-arch riad-arch-3" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path d="M0,300 L0,120 Q0,0 100,0 Q200,0 200,120 L200,300" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div className="riad-lantern-glow" />
                            <div className="riad-petals-layer">
                                {[...Array(18)].map((_, i) => (
                                    <div key={i} className="riad-petal" style={{
                                        left: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 10}s`,
                                        animationDuration: `${8 + Math.random() * 6}s`,
                                        '--petal-size': `${6 + Math.random() * 8}px`,
                                        '--petal-hue': i % 3 === 0 ? '#E8943A' : i % 3 === 1 ? '#F0C060' : '#C87A5A'
                                    }} />
                                ))}
                            </div>
                            <div className="riad-mosaic-floor" />
                        </>
                    )}
                </div>

                <div className="scroll-progress-line">
                    <div className="scroll-dot" />
                </div>
            </header>

            {/* ─── SECTION 2: STICKY FILTER BAR ─── */}
            <div className={`sticky-nav-wrapper ${navHidden ? 'hidden' : ''}`}>
                <nav className="filter-bar">
                    {[
                        { key: 'Tout', label: t('city.filter_all') },
                        { key: 'Femme', label: t('city.filter_women') },
                        { key: 'Homme', label: t('city.filter_men') },
                        { key: 'Accessoires', label: t('city.filter_accessories') },
                        { key: 'Luxe', label: t('city.filter_luxury') }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`filter-pill ${filter === key ? 'active' : ''}`}
                            onClick={() => handleFilterChange(key)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ─── SECTION 3: BOUTIQUES GRID ─── */}
            <main className="boutiques-view">
                {city.name === 'Fès' && (
                    <div className="zellige-motif-container">
                        <img src={zelligeImage} alt="Zellige Motif" className="zellige-motif-img" />
                        <div className="zellige-motif-overlay" />
                    </div>
                )}
                <div className={`boutiques-grid ${filtering ? 'filtering' : ''}`}>
                    {filteredBoutiques.length > 0 ? (
                        filteredBoutiques.map((boutique) => (
                            <article key={boutique.id} className="boutique-card">
                                <div className="boutique-card-top">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <path d="M0,0 L100,0 L100,1 L0,1 Z" fill="rgba(0,0,0,0.08)" />
                                    </svg>
                                </div>
                                <div className="boutique-card-body">
                                    <span className="boutique-card-category">{boutique.category || 'Collection'}</span>
                                    <h3 className="boutique-card-title">{boutique.name}</h3>
                                    <p className="boutique-card-desc">{boutique.description}</p>
                                    <Link to={`/boutiques/${boutique.id}`} className="boutique-card-link">{t('city.discover')}</Link>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '10rem 0' }}>
                            <div style={{ width: '30px', height: '1px', background: 'var(--city-main)', margin: '0 auto 2rem' }} />
                            <p style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: '#1A1A18', letterSpacing: '0.05em' }}>{t('city.coming_soon')}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* ─── SECTION 4: EXPLORE OTHER CITIES ─── */}
            <section className="explore-others-section" style={{ background: theme.bg }}>
                <div className="explore-heading">
                    <h2 className="explore-large-title" style={{ color: '#FFFFFF' }}>{t('city.explore_title')}</h2>
                    <div className="gold-hr" style={{ margin: '0 auto 2rem', background: theme.main }} />
                    <span className="explore-small-tag" style={{ color: theme.mid }}>{t('city.explore_sub')}</span>
                </div>

                <div className="others-grid-container">
                    <div className="others-grid">
                        {otherCities.map((other) => {
                            const otherTheme = CITY_THEMES[other.name] || CITY_THEMES['Casablanca'];
                            return (
                                <Link 
                                    key={other.id} 
                                    to={`/cities/${other.id}`} 
                                    className="other-card"
                                    style={{ 
                                        backgroundColor: otherTheme.bg,
                                        border: `1px solid rgba(255, 255, 255, 0.05)`
                                    }}
                                >
                                    <div className="other-card-bg-glow" style={{ background: `radial-gradient(circle at center, rgba(${otherTheme.bgRgb}, 0.1) 0%, transparent 70%)` }} />
                                    <h4 className="other-card-name" style={{ color: '#FFFFFF' }}>{other.name}</h4>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <footer className="city-footer-brand">
                    <div className="footer-line" style={{ background: `linear-gradient(90deg, transparent, ${theme.main}, transparent)` }} />
                    <Link to="/" className="footer-logo">FashionAura</Link>
                    <p className="footer-copyright">© 2026 L'excellence de la mode marocaine</p>
                </footer>
            </section>

            {/* ─── SECTION 5: FIXED BACK LINK ─── */}
            <Link to="/#explore" className="fixed-map-link">← Carte</Link>

        </div>
        </>
    );
};

export default CityPage;
