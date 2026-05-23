import React, { useEffect, useState, useRef } from 'react';

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getCity, getCities } from '../api/cityService';

import { boutiqueService } from '../services/boutiqueService';

import { BoutiqueCard } from '../components/BoutiqueCard';

import '../styles/city.css';

import CustomCursor from '../components/CustomCursor';
import FashionAuraLogo from '../components/common/FashionAuraLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';

import zelligeImage from '../images/zellige-marocain.jpg';
import { getCitySlug, cityName, cityRegion, cityHeroTitle, cityNickname, getCityTheme } from '../utils/cityI18n';

const FILTER_OPTIONS = [
    { id: 'Tout', labelKey: 'city.filter_all' },
    { id: 'Femme', labelKey: 'city.filter_women' },
    { id: 'Homme', labelKey: 'city.filter_men' },
    { id: 'Accessoires', labelKey: 'city.filter_accessories' },
    { id: 'Luxe', labelKey: 'city.filter_luxury' },
];



const CITY_THEMES = {
    tanger: {
        bg: '#273462', bgRgb: '39, 52, 98', main: '#045490', mid: '#84B7CE', light: '#FFFFFF', accent: '#FFF08C',
        effect: 'waves',
    },
    casablanca: {
        bg: '#0D0D0B', bgRgb: '13, 13, 11', main: '#C4A882', mid: '#D4D0C8', light: '#F0EEE8', accent: '#FFFFFF',
        effect: 'artdeco',
    },
    rabat: {
        bg: '#061A0E', bgRgb: '6, 26, 14', main: '#1A7A44', mid: '#7AC49A', light: '#E8F5EC', accent: '#D4AF6A',
        effect: 'garden',
    },
    fes: {
        bg: '#1A0E00', bgRgb: '26, 14, 0', main: '#C4821B', mid: '#D4AF6A', light: '#FBF0CC', accent: '#3A2800',
        effect: 'zellige',
    },
    marrakech: {
        bg: '#0F0200', bgRgb: '15, 2, 0', main: '#C04820', mid: '#E07840', light: '#F5D5C0', accent: '#F0C898',
        effect: 'heat',
    },
};

const THEME_CLASS_NAMES = Object.keys(CITY_THEMES).map((slug) => `theme-${slug}`);

function OtherCityCard({ city }) {
    const { t } = useTranslation();
    const theme = getCityTheme(city, CITY_THEMES);
    const boutiqueCount = city.boutiques?.length ?? 0;

    return (
        <Link
            to={`/cities/${city.slug || getCitySlug(city)}`}
            className="other-city-card"
            style={{
                background: `linear-gradient(160deg, ${theme.bg} 0%, rgba(${theme.bgRgb}, 0.85) 100%)`,
                borderColor: `rgba(${theme.bgRgb}, 0.4)`,
                '--card-accent': theme.main,
                '--card-mid': theme.mid,
            }}
        >
            <span className="other-city-card__glow" aria-hidden="true" />
            <div className="other-city-card__header">
                <span className="other-city-card__count">
                    {t('city.boutiques_count_plural', { count: boutiqueCount })}
                </span>
            </div>
            <div className="other-city-card__body">
                <p className="other-city-card__region">{cityRegion(t, city)}</p>
                <h4 className="other-city-card__name">{cityName(t, city)}</h4>
                <p className="other-city-card__nickname">{cityNickname(t, city)}</p>
            </div>
            <div className="other-city-card__footer">
                <span className="other-city-card__cta">{t('city.explore_city')}</span>
                <span className="other-city-card__arrow" aria-hidden="true">→</span>
            </div>
        </Link>
    );
}



const CityPage = () => {

    const { t } = useTranslation();
    const { slug } = useParams();

    const navigate = useNavigate();

    const [city, setCity] = useState(null);

    const [boutiques, setBoutiques] = useState([]);

    const [otherCities, setOtherCities] = useState([]);

    const [loading, setLoading] = useState(true);

    const [filtering, setFiltering] = useState(false);

    const [filter, setFilter] = useState('Tout');

    const [error, setError] = useState(false);

    const [navHidden, setNavHidden] = useState(false);

    const [following, setFollowing] = useState({});



    const lastScrollY = useRef(0);

    const observerRef = useRef(null);



    useEffect(() => {

        if (!city) return;

        const theme = getCityTheme(city, CITY_THEMES);

        const root = document.documentElement;

        root.style.setProperty('--city-bg', theme.bg);

        root.style.setProperty('--city-bg-rgb', theme.bgRgb);

        root.style.setProperty('--city-main', theme.main);

        root.style.setProperty('--city-mid', theme.mid);

        root.style.setProperty('--city-light', theme.light);

        root.style.setProperty('--city-accent', theme.accent);

        root.style.setProperty('--cursor-color', theme.main);



        document.body.classList.remove(...THEME_CLASS_NAMES);

        document.body.classList.add(`theme-${getCitySlug(city)}`);

        if (getCitySlug(city) === 'marrakech') document.body.classList.add('body-breathing');

        else document.body.classList.remove('body-breathing');



        return () => {

            document.body.classList.remove(...THEME_CLASS_NAMES, 'body-breathing');

        };

    }, [city]);



    useEffect(() => {

        if (!slug) {

            navigate('/');

            return;

        }



        const loadPageData = async () => {

            setLoading(true);

            setError(false);

            try {

                const cityData = await getCity(slug);

                if (!cityData) throw new Error('City not found');



                const [boutiquesResponse, allCities] = await Promise.all([

                    boutiqueService.getBoutiques({ city: slug }),

                    getCities(),

                ]);



                const boutiquesData = boutiquesResponse.data || boutiquesResponse;



                setCity(cityData);

                setBoutiques(Array.isArray(boutiquesData) ? boutiquesData : []);

                setOtherCities(allCities.filter(c => c.slug !== slug).slice(0, 4));

                setLoading(false);

                window.scrollTo(0, 0);

            } catch (err) {

                console.error('Failed to load city experience:', err);

                setError(true);

                setLoading(false);

            }

        };

        loadPageData();

    }, [slug, navigate]);



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



        const targets = document.querySelectorAll('.other-city-card, .city-boutique-item, .explore-heading');

        targets.forEach(t => observerRef.current.observe(t));



        return () => observerRef.current?.disconnect();

    }, [loading, boutiques, filter]);



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



    const onMouseMove = (e) => {

        if (city?.name !== 'Fès') return;

        const x = (e.clientX - window.innerWidth / 2) / 50;

        const y = (e.clientY - window.innerHeight / 2) / 50;

        const motif = document.querySelector('.zellige-motif-img');

        if (motif) {

            motif.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;

        }

    };



    const handleFilterChange = (cat) => {

        if (cat === filter) return;

        setFiltering(true);

        setTimeout(() => {

            setFilter(cat);

            setFiltering(false);

        }, 300);

    };



    const handleFollow = async (boutiqueId) => {

        const isNowFollowing = !following[boutiqueId];

        try {

            if (following[boutiqueId]) {

                await boutiqueService.unfollowBoutique(boutiqueId);

            } else {

                await boutiqueService.followBoutique(boutiqueId);

            }

            setFollowing({ ...following, [boutiqueId]: isNowFollowing });

        } catch {

            setFollowing({ ...following, [boutiqueId]: isNowFollowing });

        }

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



    const theme = getCityTheme(city, CITY_THEMES);

    const filteredBoutiques = filter === 'Tout'

        ? boutiques

        : boutiques.filter(b => b.category?.toLowerCase() === filter.toLowerCase());



    const citySlug = getCitySlug(city);
    const displayTitle = cityHeroTitle(t, city);

    const charCount = displayTitle.length;



    return (

        <>

            <CustomCursor />

            <div className={`city-page-container theme-${citySlug}`} onMouseMove={onMouseMove}>



            <header className="city-hero">

                <div className="city-hero-topbar">
                    <FashionAuraLogo to="/" size="sm" variant="onDark" className="city-nav-link" />
                    <LanguageSwitcher variant="dark" />
                </div>

                <div className="city-hero-content">

                    <span className="city-region-label">{cityRegion(t, city)}</span>

                    <h1 className="city-main-title" style={{ '--char-count': charCount }}>

                        {displayTitle}

                    </h1>

                    <div className="gold-hr" />

                    <span className="city-nickname">{cityNickname(t, city)}</span>

                    <div className="city-editorial-stat">

                        {boutiques.length} boutiques d'exception

                    </div>

                </div>



                <div className="atmospheric-layer">

                    {citySlug === 'tanger' && (

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



                    {citySlug === 'casablanca' && (

                        <>

                            <div className="artdeco-blueprint" />

                            <div className="noise-overlay" />

                            <div className="casa-ticker">

                                <div className="ticker-gold">

                                    HASSAN II · CORNICHE · ART DÉCO · MODERNITÉ · HASSAN II · CORNICHE · ART DÉCO · MODERNITÉ · HASSAN II · CORNICHE · ART DÉCO · MODERNITÉ

                                </div>

                            </div>

                        </>

                    )}



                    {citySlug === 'rabat' && (

                        <>

                            <div className="botanical-layer">

                                <svg className="leaf-path" style={{ width: '400px', top: '-50px', left: '-100px' }} viewBox="0 0 100 100">

                                    <path d="M10,100 Q40,40 100,10" style={{ animation: 'sway-1 5s ease-in-out infinite alternate' }} fill="none" strokeWidth="0.5" stroke="currentColor" />

                                </svg>

                                <svg className="leaf-path" style={{ width: '300px', bottom: '-50px', right: '-80px' }} viewBox="0 0 100 100">

                                    <path d="M90,100 Q60,40 0,10" style={{ animation: 'sway-2 7s ease-in-out infinite alternate' }} fill="none" strokeWidth="0.5" stroke="currentColor" />

                                </svg>

                            </div>

                            <div className="particle-emitter">

                                {[...Array(15)].map((_, i) => (

                                    <div key={i} className="dust" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 7}s` }} />

                                ))}

                            </div>

                        </>

                    )}



                    {citySlug === 'fes' && (

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



                    {citySlug === 'marrakech' && (

                        <>

                            <div className="heat-shimmer" />

                            {[...Array(8)].map((_, i) => (

                                <svg key={i} className="zellige-star" style={{ width: '40px', top: `${Math.random() * 80}%`, left: `${Math.random() * 90}%`, animation: `starRotate ${20 + Math.random() * 25}s linear infinite` }} viewBox="0 0 40 40">

                                    <path d="M20 0l5.5 14.5L40 20l-14.5 5.5L20 40l-5.5-14.5L0 20l14.5-5.5z" />

                                </svg>

                            ))}

                        </>

                    )}

                </div>



                <div className="scroll-progress-line">

                    <div className="scroll-dot" />

                </div>

            </header>



            <div className={`sticky-nav-wrapper ${navHidden ? 'hidden' : ''}`}>

                <nav className="filter-bar">

                    {FILTER_OPTIONS.map(({ id, labelKey }) => (

                        <button

                            key={id}

                            className={`filter-pill ${filter === id ? 'active' : ''}`}

                            onClick={() => handleFilterChange(id)}

                        >

                            {t(labelKey)}

                        </button>

                    ))}

                </nav>

            </div>



            <main className="boutiques-view">

                {citySlug === 'fes' && (

                    <div className="zellige-motif-container">

                        <img src={zelligeImage} alt="Zellige Motif" className="zellige-motif-img" />

                        <div className="zellige-motif-overlay" />

                    </div>

                )}

                <div className={`city-boutiques-grid ${filtering ? 'filtering' : ''}`}>

                    {filteredBoutiques.length > 0 ? (

                        filteredBoutiques.map((boutique) => (

                            <div key={boutique.id} className="city-boutique-item">

                                <BoutiqueCard

                                    boutique={{

                                        ...boutique,

                                        city: boutique.city || { ...city, slug: citySlug },

                                        products_count: boutique.products_count ?? 0,

                                    }}

                                    onFollow={handleFollow}

                                    isFollowing={following[boutique.id] || false}

                                />

                            </div>

                        ))

                    ) : (

                        <div className="city-boutiques-empty">

                            <div className="city-boutiques-empty-line" />

                            <p className="city-boutiques-empty-text">{t('city.coming_soon')}</p>

                            <Link to="/boutiques" className="city-boutiques-empty-link">Voir toutes les boutiques</Link>

                        </div>

                    )}

                </div>

            </main>



            <section className="explore-others-section" style={{ background: theme.bg }}>

                <div className="explore-heading">

                    <h2 className="explore-large-title" style={{ color: '#FFFFFF' }}>{t('city.explore_title')}</h2>

                    <div className="gold-hr" style={{ margin: '0 auto 2rem', background: theme.main }} />

                    <span className="explore-small-tag" style={{ color: theme.mid }}>{t('city.explore_sub')}</span>

                </div>



                                <div className="others-grid-container">
                    <div className="others-grid">
                        {otherCities.map((other) => (
                            <OtherCityCard key={other.id} city={other} />
                        ))}
                    </div>
                </div>
<footer className="city-footer-brand">

                    <div className="footer-line" style={{ background: `linear-gradient(90deg, transparent, ${theme.main}, transparent)` }} />

                    <FashionAuraLogo to="/" size="md" variant="onDark" className="footer-logo" />

                    <p className="footer-copyright">© 2026 L'excellence de la mode marocaine</p>

                </footer>

            </section>



            <Link to="/#explore" className="fixed-map-link">← {t('city.back_map')}</Link>



        </div>

        </>

    );

};



export default CityPage;


