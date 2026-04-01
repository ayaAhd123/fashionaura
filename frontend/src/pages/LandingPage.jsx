import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities } from '../api/cityService';
import mapImage from '../images/map-of-morocco-morocco-map-on-white-background-free-vector.jpg';
import heroImage from '../images/7cc005b2eb503737952150e1655566bb.jpg';
import aboutImage from '../images/Gemini_Generated_Image_cccb5vcccb5vcccb-removebg-preview.png';
import '../styles/landing.css';
import CustomCursor from '../components/CustomCursor';

// ── Image Map Coordinates (Percentages top/left) ─────────────────────────────
// (These are estimated and may need adjustments based on the exact image proportions)
// APRÈS — coller le code copié
const CITY_COORDS = {
    'Tanger': { top: 16, left: 64 },
    'Rabat': { top: 25, left: 62 },
    'Casablanca': { top: 31, left: 55 },
    'Meknès': { top: 27, left: 62 },
    'Fès': { top: 30, left: 67 },
    'Oujda': { top: 17, left: 83 },
    'Marrakech': { top: 42, left: 55 },
    'Agadir': { top: 63, left: 44 },
};

const MARQUEE_TEXT = 'CASABLANCA · MARRAKECH · TANGER · FÈS · RABAT · AGADIR · MEKNÈS · OUJDA · ';

const DEFAULT_CITIES = [
    { id: 1, name: 'Casablanca', region: 'Casablanca-Settat', boutiques_count: 45 },
    { id: 2, name: 'Marrakech', region: 'Marrakech-Safi', boutiques_count: 32 },
    { id: 3, name: 'Rabat', region: 'Rabat-Salé-Kénitra', boutiques_count: 28 },
    { id: 4, name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', boutiques_count: 22 },
    { id: 5, name: 'Fès', region: 'Fès-Meknès', boutiques_count: 18 },
]

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

// ── City card (scroll-reveal) ─────────────────────────────────────────────────
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
        'Rabat': '🏛️', 'Fès': '🕌', 'Agadir': '🏖️',
        'Meknès': '🌿', 'Oujda': '🌄',
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
                <span className="city-card-emoji">{CITY_EMOJIS[city.name] || '🏙️'}</span>
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

// ── Morocco Map via Image ─────────────────────────────────────────────────────
function MoroccoMapImage({ cities, onCityClick }) {
    const [hovered, setHovered] = useState(null);

    console.log('MoroccoMapImage cities:', cities);
    const cityList = cities.filter(c => CITY_COORDS[c.name]);
    console.log('cityList filtered:', cityList);

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
                        {/* the dot itself */}
                        <div className="map-dot-pulse-html"></div>
                        <div className="map-dot-html"></div>

                        {/* large invisible area for hovering accurately over small dots */}
                        <div
                            className="map-dot-hitbox"
                            onClick={() => onCityClick(city.id)}
                            onMouseEnter={() => setHovered(city.id)}
                            onMouseLeave={() => setHovered(null)}
                        ></div>

                        {/* Tooltip */}
                        {isHovered && (
                            <div className="map-tooltip-html">
                                <p className="map-tooltip-name">{city.name}</p>
                                <p className="map-tooltip-region">{city.region}</p>
                                <span className="map-tooltip-link">Découvrir →</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Main LandingPage ──────────────────────────────────────────────────────────
const LandingPage = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [navShrunk, setNavShrunk] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch cities
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
                console.error('Erreur SQL (Fallback activé):', err);
                setCities(DEFAULT_CITIES);
                setLoading(false);
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

    return (
        <>
            <CustomCursor />

            {/* ── NAVBAR ── */}
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
                    <li><a href="/" onClick={() => setMobileMenuOpen(false)}>Accueil</a></li>
                    <li><a href="#explore" onClick={() => setMobileMenuOpen(false)}>Explorer</a></li>
                    <li><a href="#about" onClick={() => setMobileMenuOpen(false)}>À propos</a></li>
                </ul>
            </nav>

            <div className="landing-page">

                {/* ── HERO ── */}
                <header className="landing-hero" style={{ backgroundImage: `url(${heroImage})` }}>
                    <div className="hero-overlay" aria-hidden="true" />

                    <div className="hero-content">
                        <span className="hero-tag hero-reveal">Mode · Maroc · Authenticité</span>

                        <h1 className="hero-headline">
                            {['La', 'mode', 'marocaine'].map((word, i) => (
                                <span key={i} className="hero-word hero-reveal" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>{word}</span>
                            ))}
                            <br />
                            {['à', 'portée', 'de', 'main'].map((word, i) => (
                                <span key={i} className={`hero-word hero-word--italic hero-reveal`} style={{ animationDelay: `${0.95 + i * 0.15}s` }}>{word}</span>
                            ))}
                        </h1>

                        <p className="hero-sub hero-reveal">
                            Explorez les boutiques tendance de vos villes préférées —
                            Tanger, Casablanca, Marrakech et bien plus encore.
                        </p>

                        <div className="hero-buttons">
                            <MagneticButton className="btn-primary" onClick={() => scrollToSection('explore')}>
                                Explorer les villes
                            </MagneticButton>
                            <MagneticButton className="btn-primary" onClick={() => scrollToSection('stylist')}>
                                Styliste AI
                            </MagneticButton>
                        </div>
                    </div>

                    <div className="hero-scroll" aria-hidden="true">
                        <span className="hero-scroll-line" />
                        Défiler
                    </div>
                </header>

                {/* ── MARQUEE TICKER ── */}
                <div className="marquee-strip" aria-hidden="true">
                    <div className="marquee-track">
                        <span className="marquee-text">{MARQUEE_TEXT.repeat(4)}</span>
                    </div>
                </div>

                {/* ── STATS BANNER ── */}
                <div className="stats-banner">
                    <StatItem number={cities.length || 8} label="Villes" suffix="+" />
                    <StatItem number={120} label="Boutiques" suffix="+" />
                    <StatItem number={500} label="Produits" suffix="+" />
                    <StatItem number={100} label="Marocain" suffix="%" />
                </div>

                <Divider />

                {/* ── ALONE EXPLORE SECTION ── */}
                <section className="explore-center" id="explore">
                    <div className="explore-center-map">
                        <div className="map-heading-local">
                            <p className="section-tag">Carte interactive</p>
                            <h2 className="section-title">Explorez le Maroc</h2>
                            <p className="map-subtitle">Cliquez sur une ville de la carte</p>
                        </div>
                        <MoroccoMapImage cities={cities} onCityClick={(id) => navigate(`/cities/${id}`)} />
                    </div>
                </section>

                <Divider />

                <section className="ai-stylist-section" id="stylist">
                    <div className="section-container">
                        <div className="ai-stylist-content">
                            <div className="ai-badge">
                                <span className="ai-icon">✦</span> Propulsé par l'IA
                            </div>
                            <h2 className="ai-title">Votre Styliste <span>Personnel</span></h2>
                            <p className="ai-description">
                                Décrivez le look que vous recherchez et notre IA vous proposera des tenues, des boutiques et des conseils mode adaptés à vos goûts.
                            </p>
                            <MagneticButton className="btn-primary ai-button">
                                Essayer maintenant <span className="arrow">→</span>
                            </MagneticButton>
                        </div>

                        <div className="ai-chat-mockup">
                            <div className="chat-bubble ai-bubble">
                                <div className="bubble-icon">✦</div>
                                <div className="bubble-text">Bonjour ! Je suis votre styliste IA. Que cherchez-vous aujourd'hui ?</div>
                            </div>
                            <div className="chat-bubble user-bubble">
                                <div className="bubble-text">Je cherche une tenue pour un mariage marocain traditionnel</div>
                            </div>
                            <div className="chat-bubble ai-bubble">
                                <div className="bubble-icon">✦</div>
                                <div className="bubble-text">Excellent choix ! Je vous recommande un caftan de chez <strong>Maison Amira</strong> à Marrakech...</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="landing-footer">
                    <div className="footer-logo">FashionAura</div>
                    <p className="footer-copy">© 2025 FashionAura — Tous droits réservés</p>
                </footer>

            </div>
        </>
    );
};

export default LandingPage;