import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities } from '../api/cityService';
import mapImage from '../images/map-of-morocco-morocco-map-on-white-background-free-vector.jpg';
import heroImage from '../images/7cc005b2eb503737952150e1655566bb.jpg';
import aboutImage from '../images/Gemini_Generated_Image_cccb5vcccb5vcccb-removebg-preview.png';
import '../styles/landing.css';
import CustomCursor from '../components/CustomCursor';
import { useTranslation } from 'react-i18next';

const CITY_COORDS = {
    'Tanger': { top: 16, left: 64 },
    'Rabat': { top: 25, left: 62 },
    'Casablanca': { top: 31, left: 55 },
    'Meknes': { top: 27, left: 62 },
    'Fès': { top: 30, left: 67 },
    'Oujda': { top: 17, left: 83 },
    'Marrakech': { top: 42, left: 55 },
    'Agadir': { top: 63, left: 44 },
};

const MARQUEE_TEXT = 'CASABLANCA · MARRAKECH · TANGER · FES · RABAT · AGADIR · MEKNES · OUJDA · ';

const DEFAULT_CITIES = [
    { id: 1, name: 'Casablanca', region: 'Casablanca-Settat', boutiques_count: 45 },
    { id: 2, name: 'Marrakech', region: 'Marrakech-Safi', boutiques_count: 32 },
    { id: 3, name: 'Rabat', region: 'Rabat-Sale-Kenitra', boutiques_count: 28 },
    { id: 4, name: 'Tanger', region: 'Tanger-Tetouan-Al Hoceima', boutiques_count: 22 },
    { id: 5, name: 'Fes', region: 'Fes-Meknes', boutiques_count: 18 },
];

function Divider() {
    return (
        <div className="divider" aria-hidden="true">
            <span className="divider-line" />
            <span className="divider-diamond">◆</span>
            <span className="divider-line" />
        </div>
    );
}

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

function CityCard({ city, index, onClick }) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVis(true); observer.disconnect(); } },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const CITY_EMOJIS = {
        'Casablanca': '🌆', 'Marrakech': '🏯', 'Tanger': '⚓',
        'Rabat': '🏛️', 'Fes': '🕌', 'Agadir': '🏖️',
        'Meknes': '🌿', 'Oujda': '🌄',
    };

    return (
        <div
            ref={ref}
            className={`city-card ${vis ? 'city-card--visible' : ''}`}
            style={{ transitionDelay: `${(index % 4) * 0.08}s` }}
            onClick={onClick}
            data-cursor-grow
        >
            <div className="city-card-img">
                <span className="city-card-emoji">{CITY_EMOJIS[city.name] || ''}</span>
            </div>
            <div className="city-card-body">
                <h3 className="city-card-name">{city.name}</h3>
                <p className="city-card-region">{city.region}</p>
                <div className="city-card-footer">
                    <span className="city-card-boutiques">{city.boutiques_count ?? '—'} boutiques</span>
                    <span className="city-card-arrow">→</span>
                </div>
            </div>
        </div>
    );
}

function MoroccoMapImage({ cities, onCityClick }) {
    const [hovered, setHovered] = useState(null);
    const cityList = cities.filter(c => CITY_COORDS[c.name]);

    return (
        <div className="image-map-wrapper">
            <img src={mapImage} alt="Carte du Maroc" className="image-map-bg" />

            {cityList.map((city) => {
                const pos = CITY_COORDS[city.name] || { top: 0, left: 0 };
                const isHovered = hovered === city.id;

                return (
                    <div
                        key={city.id}
                        className="map-image-city-container"
                        style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                    >
                        <div className="map-dot-pulse-html"></div>
                        <div className="map-dot-html"></div>

                        <div
                            className="map-dot-hitbox"
                            onClick={() => onCityClick(city.id)}
                            onMouseEnter={() => setHovered(city.id)}
                            onMouseLeave={() => setHovered(null)}
                        ></div>

                        {isHovered && (
                            <div className="map-tooltip-html">
                                <p className="map-tooltip-name">{city.name}</p>
                                <p className="map-tooltip-region">{city.region}</p>
                                <span className="map-tooltip-link">Decouvrir →</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

const LandingPage = () => {
    const { t, i18n } = useTranslation();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [navShrunk, setNavShrunk] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const changeLang = (code) => {
        i18n.changeLanguage(code);
        const isRtl = code === 'ar';
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
        document.documentElement.lang = code;
    };

    const activeLang = i18n.language?.split('-')[0] || 'fr';

    useEffect(() => {
        getCities()
            .then(data => {
                if (data && data.length > 0) {
                    setCities(data);
                } else {
                    setCities(DEFAULT_CITIES);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur SQL (Fallback active):', err);
                setCities(DEFAULT_CITIES);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const onScroll = () => setNavShrunk(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const items = document.querySelectorAll('.hero-reveal');
        items.forEach((el, i) => {
            el.style.animationDelay = `${0.3 + i * 0.18}s`;
            el.classList.add('hero-reveal--active');
        });
    }, []);

    const scrollToSection = useCallback((id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Ouvrir le chatbot depuis n'importe quel bouton
    const openChatbot = useCallback(() => {
        window.dispatchEvent(new Event('openFashionBot'));
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    }, []);

    return (
        <>
            <CustomCursor />

            {/* NAVBAR */}
            <nav className={`navbar ${navShrunk ? 'navbar--shrunk' : ''}`}>
                <a href="/" className="navbar-logo hero-reveal">
                    Fashion<span>Aura</span>
                </a>

                <div
                    className={`hamburger ${mobileMenuOpen ? 'open' : ''} hero-reveal`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span /><span /><span />
                </div>

                <ul className={`navbar-links hero-reveal ${mobileMenuOpen ? 'active' : ''}`}>
                    <li><a href="/" onClick={() => setMobileMenuOpen(false)}>{t('landing.nav_home')}</a></li>
                    <li><a href="#explore" onClick={() => setMobileMenuOpen(false)}>{t('landing.nav_explore')}</a></li>
                    <li><a href="#about" onClick={() => setMobileMenuOpen(false)}>{t('landing.nav_about')}</a></li>
                    
                    <li className="lang-switcher">
                        {['fr', 'en', 'es', 'ar'].map((lang, idx, arr) => (
                            <React.Fragment key={lang}>
                                <span 
                                    onClick={() => changeLang(lang)}
                                    style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: activeLang === lang ? '600' : '400',
                                        color: activeLang === lang ? '#D4AF6A' : 'inherit',
                                        transition: 'color 0.3s'
                                    }}
                                >
                                    {lang.toUpperCase()}
                                </span>
                                {idx < arr.length - 1 && <span style={{ margin: '0 5px', opacity: 0.5 }}>|</span>}
                            </React.Fragment>
                        ))}
                    </li>
                </ul>
            </nav>

            <div className="landing-page">

                {/* HERO */}
                <header className="landing-hero" style={{ backgroundImage: `url(${heroImage})` }}>
                    <div className="hero-overlay" aria-hidden="true" />

                    <div className="hero-content">
                        <span className="hero-tag hero-reveal">{t('landing.hero_tag')}</span>

                        <h1 className="hero-headline">
                            {t('landing.hero_head_1').split(' ').map((word, i) => (
                                <span key={`h1-${i}`} className="hero-word hero-reveal" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>{word}</span>
                            ))}
                            <br />
                            {t('landing.hero_head_2').split(' ').map((word, i) => (
                                <span key={`h2-${i}`} className="hero-word hero-word--italic hero-reveal" style={{ animationDelay: `${0.95 + i * 0.15}s` }}>{word}</span>
                            ))}
                        </h1>

                        <p className="hero-sub hero-reveal">
                            {t('landing.hero_sub')}
                        </p>

                        <div className="hero-buttons">
                            <MagneticButton className="btn-primary" onClick={() => scrollToSection('explore')}>
                                {t('landing.explore_btn')}
                            </MagneticButton>
                            {/* BOUTON HERO LIE AU CHATBOT */}
                            <MagneticButton className="btn-primary" onClick={openChatbot}>
                                {t('landing.ai_btn')}
                            </MagneticButton>
                        </div>
                    </div>

                    <div className="hero-scroll" aria-hidden="true">
                        <span className="hero-scroll-line" />
                        {t('landing.scroll')}
                    </div>
                </header>

                {/* MARQUEE TICKER */}
                <div className="marquee-strip" aria-hidden="true">
                    <div className="marquee-track">
                        <span className="marquee-text">{MARQUEE_TEXT.repeat(4)}</span>
                    </div>
                </div>

                {/* STATS BANNER */}
                <div className="stats-banner">
                    <StatItem number={cities.length || 8} label={t('landing.stats_cities')} suffix="+" />
                    <StatItem number={120} label={t('landing.stats_boutiques')} suffix="+" />
                    <StatItem number={500} label={t('landing.stats_products')} suffix="+" />
                    <StatItem number={100} label={t('landing.stats_moroccan')} suffix="%" />
                </div>

                <Divider />

                {/* EXPLORE SECTION */}
                <section className="explore-center" id="explore">
                    <div className="explore-center-map">
                        <div className="map-heading-local">
                            <p className="section-tag">{t('landing.map_tag')}</p>
                            <h2 className="section-title">{t('landing.map_title')}</h2>
                            <p className="map-subtitle">{t('landing.map_subtitle')}</p>
                        </div>
                        <MoroccoMapImage
                            cities={cities}
                            onCityClick={(id) => navigate(`/cities/${id}`)}
                        />
                    </div>
                </section>

                <Divider />

                {/* SECTION AI STYLISTE */}
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
                            {/* BOUTON SECTION AI LIE AU CHATBOT */}
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
                                <div className="bubble-text">{t('landing.chat_ai_2')}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="landing-footer">
                    <div className="footer-logo">FashionAura</div>
                    <p className="footer-copy">{t('landing.footer_copy')}</p>
                </footer>

            </div>
        </>
    );
};

export default LandingPage;