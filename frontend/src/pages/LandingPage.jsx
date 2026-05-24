import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCities, getTopBoutiquesByCity, getSiteStats } from '../api/cityService';
import mapImage from '../images/map-of-morocco-morocco-map-on-white-background-free-vector.jpg';
import heroImage from '../images/7cc005b2eb503737952150e1655566bb.jpg';
import '../styles/landing.css';
import '../styles/top-partners.css';
import CustomCursor from '../components/CustomCursor';
import FashionAuraLogo from '../components/common/FashionAuraLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getCitySlug, cityName, cityRegion, marqueeCityText } from '../utils/cityI18n';
import { openFashionBot } from '../utils/openFashionBot';
import LandingAuthNav from '../components/Landing/LandingAuthNav';

// ── Image Map Coordinates (by city slug) ─────────────────────────────────────
const CITY_COORDS = {
    tanger: { top: 16, left: 64 },
    rabat: { top: 25, left: 62 },
    casablanca: { top: 31, left: 55 },
    meknes: { top: 27, left: 62 },
    fes: { top: 30, left: 67 },
    oujda: { top: 17, left: 83 },
    marrakech: { top: 42, left: 55 },
    agadir: { top: 63, left: 44 },
};

const DEFAULT_CITIES = [
    { id: 1, slug: 'casablanca', name: 'Casablanca', region: 'Casablanca-Settat', boutiques_count: 45 },
    { id: 2, slug: 'marrakech', name: 'Marrakech', region: 'Marrakech-Safi', boutiques_count: 32 },
    { id: 3, slug: 'rabat', name: 'Rabat', region: 'Rabat-Salé-Kénitra', boutiques_count: 28 },
    { id: 4, slug: 'tanger', name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', boutiques_count: 22 },
    { id: 5, slug: 'fes', name: 'Fès', region: 'Fès-Meknès', boutiques_count: 18 },
];

// ── Decorative divider ────────────────────────────────────────────────────────
function Divider() {
    return (
        <div className="divider" aria-hidden="true">
            <span className="divider-line" />
            <span className="divider-diamond">◆</span>
            <span className="divider-line" />
        </div>
    );
}


// ── Magnetic Button ───────────────────────────────────────────────────────────
function MagneticButton({ className, children, onClick, ...props }) {
    const btnRef = useRef(null);

    const onMouseMove = (e) => {
        const rect = btnRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        btnRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onMouseLeave = () => { btnRef.current.style.transform = ''; };

    return (
        <button
            ref={btnRef}
            className={className}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}

// ── Stat counter (count-up on scroll) ────────────────────────────────────────
function StatItem({ number, label, suffix = '' }) {
    const ref = useRef(null);
    const [val, setVal] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        const target = parseInt(number, 10);
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const duration = 1600;
                    const start = performance.now();
                    const tick = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        setVal(Math.round(ease * target));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [number]);

    return (
        <div className="stat-item" ref={ref}>
            <span className="stat-number">{val}{suffix}</span>
            <span className="stat-label">{label}</span>
        </div>
    );
}

// ── Morocco Map via Image ─────────────────────────────────────────────────────
function MoroccoMapImage({ cities, onCityClick }) {
    const { t } = useTranslation();
    const [hovered, setHovered] = useState(null);

    const cityList = cities.filter((c) => CITY_COORDS[getCitySlug(c)]);

    return (
        <div className="image-map-wrapper">
            <img src={mapImage} alt={t('landing.map_title')} className="image-map-bg" />

            {cityList.map((city) => {
                const slug = getCitySlug(city);
                const pos = CITY_COORDS[slug] || { top: 0, left: 0 };
                const isHovered = hovered === city.id;

                return (
                    <div
                        key={city.id}
                        className="map-image-city-container"
                        style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                    >
                        {/* the dot itself */}
                        <div className="map-dot-pulse-html"></div>
                        <div className="map-dot-html"></div>

                        {/* large invisible area for hovering accurately over small dots */}
                        <div
                            className="map-dot-hitbox"
                            onClick={() => onCityClick(city.slug || slug)}
                            onMouseEnter={() => setHovered(city.id)}
                            onMouseLeave={() => setHovered(null)}
                        ></div>

                        {/* Tooltip */}
                        {isHovered && (
                            <div className="map-tooltip-html">
                                <p className="map-tooltip-name">{cityName(t, city)}</p>
                                <p className="map-tooltip-region">{cityRegion(t, city)}</p>
                                <span className="map-tooltip-link">{t('city.explore_city')} →</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Top partners teaser (landing → gold page) ────────────────────────────────
function TopPartnersTeaser({ navigate }) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTopBoutiquesByCity()
            .then((data) => {
                const items = (data.cities || [])
                    .map(({ city, boutiques }) =>
                        boutiques?.[0] ? { city, boutique: boutiques[0] } : null
                    )
                    .filter(Boolean)
                    .slice(0, 4);
                setPreview(items);
            })
            .catch(() => setPreview([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="landing-top-partners" id="top-partners">
            <div className="landing-top-partners__inner">
                <p className="landing-top-partners__tag">{t('landing.top_partners_tag')}</p>
                <h2 className="landing-top-partners__title">{t('landing.top_partners_title')}</h2>
                <p className="landing-top-partners__sub">{t('landing.top_partners_sub')}</p>

                <div className="landing-top-partners__preview">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="landing-top-partners__skeleton" />
                        ))
                    ) : preview.length > 0 ? (
                        preview.map(({ city, boutique }) => (
                            <div key={city.id} className="landing-top-partners__preview-item landing-top-partners__preview-item--first">
                                <span className="landing-top-partners__preview-rank">1</span>
                                <p className="landing-top-partners__preview-city">{cityName(t, city)}</p>
                                <p className="landing-top-partners__preview-name">{boutique.name}</p>
                            </div>
                        ))
                    ) : (
                        DEFAULT_CITIES.slice(0, 4).map((city) => (
                            <div key={city.id} className="landing-top-partners__preview-item landing-top-partners__preview-item--first">
                                <span className="landing-top-partners__preview-rank">1</span>
                                <p className="landing-top-partners__preview-city">{cityName(t, city)}</p>
                                <p className="landing-top-partners__preview-name">{t('landing.top_partners_placeholder')}</p>
                            </div>
                        ))
                    )}
                </div>

                <MagneticButton
                    className="landing-top-partners__cta"
                    onClick={() => navigate('/meilleures-boutiques')}
                >
                    {t('landing.top_partners_cta')} →
                </MagneticButton>

                <button
                    type="button"
                    className="landing-top-partners__ai-link"
                    onClick={() => openFashionBot({ prefill: t('chatbot.prefill_top') })}
                >
                    ✦ {t('chatbot.ask_top')}
                </button>
            </div>
        </section>
    );
}

// ── Main LandingPage ──────────────────────────────────────────────────────────
const LandingPage = () => {
    const { t, i18n } = useTranslation();
    const [cities, setCities] = useState([]);
    const [stats, setStats] = useState({ cities: 0, boutiques: 0, products: 0 });
    const [navShrunk, setNavShrunk] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch cities + stats
    useEffect(() => {
        Promise.all([
            getCities().catch(() => null),
            getSiteStats().catch(() => null),
        ]).then(([citiesData, statsData]) => {
            if (citiesData && citiesData.length > 0) {
                setCities(citiesData);
            } else {
                setCities(DEFAULT_CITIES);
            }
            if (statsData) {
                setStats({
                    cities: statsData.cities ?? 0,
                    boutiques: statsData.boutiques ?? 0,
                    products: statsData.products ?? 0,
                });
            }
        });
    }, []);

    // Navbar shrink on scroll
    useEffect(() => {
        const onScroll = () => setNavShrunk(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Staggered hero reveal
    useEffect(() => {
        const items = document.querySelectorAll('.hero-reveal');
        items.forEach((el, i) => {
            el.style.animationDelay = `${0.3 + i * 0.18}s`;
            el.classList.add('hero-reveal--active');
        });
    }, []);

    const scrollToExplore = useCallback(() => {
        document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const scrollToSection = useCallback((id) => {
        if (id === 'stylist') {
            openFashionBot();
            return;
        }
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const openChatbot = useCallback(() => {
        openFashionBot();
    }, []);

    useEffect(() => {
        const code = i18n.language?.split('-')[0] || 'fr';
        document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = code;
    }, [i18n.language]);

    return (
        <>
            <CustomCursor />

            {/* ── NAVBAR ── */}
            <nav className={`navbar ${navShrunk ? 'navbar--shrunk' : ''}`}>
                <FashionAuraLogo to="/" size="md" className="navbar-logo hero-reveal" />

                <ul className={`navbar-links hero-reveal ${mobileMenuOpen ? 'active' : ''}`}>
                    <li><a href="/" onClick={() => setMobileMenuOpen(false)}>{t('landing.nav_home')}</a></li>
                    <li><a href="#explore" onClick={() => setMobileMenuOpen(false)}>{t('landing.nav_explore')}</a></li>
                    <li className="navbar-links__lang">
                        <LanguageSwitcher variant="header" />
                    </li>
                    <li className="navbar-links__auth">
                        <LandingAuthNav onNavigate={() => setMobileMenuOpen(false)} className="navbar-auth--mobile" />
                    </li>
                </ul>

                <div className="navbar__actions hero-reveal">
                    <LandingAuthNav className="navbar-auth--desktop" />
                    <LanguageSwitcher variant={navShrunk ? 'header' : 'landing'} />
                    <button
                        type="button"
                        className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-expanded={mobileMenuOpen}
                        aria-label={mobileMenuOpen ? t('nav.close_menu') : t('nav.open_menu')}
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </nav>

            <div className="landing-page">

                {/* ── HERO ── */}
                <header className="landing-hero" style={{ backgroundImage: `url(${heroImage})` }}>
                    <div className="hero-overlay" aria-hidden="true" />

                    <div className="hero-content">
                        <span className="hero-tag hero-reveal">{t('landing.hero_tag')}</span>

                        <h1 className="hero-headline">
                            {t('landing.hero_head_1').split(' ').map((word, i) => (
                                <span key={i} className="hero-word hero-reveal" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>{word}</span>
                            ))}
                            <br />
                            {t('landing.hero_head_2').split(' ').map((word, i) => (
                                <span key={i} className={`hero-word hero-word--italic hero-reveal`} style={{ animationDelay: `${0.95 + i * 0.15}s` }}>{word}</span>
                            ))}
                        </h1>

                        <p className="hero-sub hero-reveal">
                            {t('landing.hero_sub')}
                        </p>

                        <div className="hero-buttons">
                            <MagneticButton className="btn-primary ai-button" onClick={() => scrollToSection('explore')}>
                                {t('landing.explore_btn')}
                            </MagneticButton>
                            <MagneticButton className="btn-primary ai-button" onClick={() => scrollToSection('stylist')}>
                                {t('landing.ai_btn')}
                            </MagneticButton>
                        </div>
                    </div>

                    <div className="hero-scroll" aria-hidden="true">
                        <span className="hero-scroll-line" />
                        {t('landing.scroll')}
                    </div>
                </header>

                {/* ── MARQUEE TICKER ── */}
                <div className="marquee-strip" aria-hidden="true">
                    <div className="marquee-track">
                        <span className="marquee-text">{marqueeCityText(t).repeat(4)}</span>
                    </div>
                </div>

                {/* ── STATS BANNER ── */}
                <div className="stats-banner">
                    <StatItem number={stats.cities || cities.length || 5} label={t('landing.stats_cities')} suffix="+" />
                    <StatItem number={stats.boutiques || 0} label={t('landing.stats_boutiques')} suffix="+" />
                    <StatItem number={stats.products || 0} label={t('landing.stats_products')} suffix="+" />
                    <StatItem number={100} label={t('landing.stats_moroccan')} suffix="%" />
                </div>

                <Divider />

                {/* ── MAP ── */}
                <section className="explore-center" id="explore">
                    <div className="explore-center-map">
                        <div className="map-heading-local">
                            <p className="section-tag">{t('landing.map_tag')}</p>
                            <h2 className="section-title">{t('landing.map_title')}</h2>
                            <p className="map-subtitle">{t('landing.map_subtitle')}</p>
                        </div>
                        <MoroccoMapImage cities={cities} onCityClick={(slug) => navigate(`/cities/${slug}`)} />
                    </div>
                </section>

                {/* ── TOP PARTNERS TEASER (under map) ── */}
                <TopPartnersTeaser navigate={navigate} />

                <Divider />

                <section className="ai-stylist-section" id="stylist">
                    <div className="section-container">
                        <div className="ai-stylist-content">
                            <div className="ai-badge">
                                <span className="ai-icon">✦</span> {t('landing.ai_badge')}
                            </div>
                            <h2 className="ai-title">{t('landing.ai_title_1')} <span>{t('landing.ai_title_2')}</span></h2>
                            <p className="ai-description">
                                {t('landing.ai_desc')}
                            </p>
                            <MagneticButton className="btn-primary ai-button" onClick={openChatbot}>
                                {t('landing.ai_try_btn')} <span className="arrow">→</span>
                            </MagneticButton>
                        </div>

                        <div className="ai-chat-mockup">
                            <div className="chat-bubble ai-bubble">
                                <div className="bubble-icon">✦</div>
                                <div className="bubble-text">{t('landing.chat_ai_1')}</div>
                            </div>
                            <div className="chat-bubble user-bubble">
                                <div className="bubble-text">{t('landing.chat_user')}</div>
                            </div>
                            <div className="chat-bubble ai-bubble">
                                <div className="bubble-icon">✦</div>
                                <div className="bubble-text" dangerouslySetInnerHTML={{ __html: t('landing.chat_ai_2') }} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="landing-footer">
                    <FashionAuraLogo size="md" variant="light" asLink={false} className="footer-logo" />
                    <p className="footer-copy">{t('landing.footer_copy')}</p>
                </footer>

            </div>
        </>
    );
};

export default LandingPage;