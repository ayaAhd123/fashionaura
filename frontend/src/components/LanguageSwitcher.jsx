import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'ar', label: 'AR', dir: 'rtl' }
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    useEffect(() => {
        // Default to fr if i18n.language has a locale suffix like en-US
        const langCode = i18n.language?.split('-')[0] || 'fr';
        const currentLang = languages.find(l => l.code === langCode) || languages[0];
        document.documentElement.dir = currentLang.dir || 'ltr';
        document.documentElement.lang = currentLang.code;
    }, [i18n.language]);

    const changeLang = (code) => {
        i18n.changeLanguage(code);
    };

    const activeLang = i18n.language?.split('-')[0] || 'fr';

    return (
        <div style={styles.container}>
            {languages.map((lng, index) => (
                <React.Fragment key={lng.code}>
                    <button
                        onClick={() => changeLang(lng.code)}
                        style={{
                            ...styles.button,
                            color: activeLang === lng.code ? '#D4AF6A' : '#F0F0F0',
                            fontWeight: activeLang === lng.code ? '600' : '400',
                            opacity: activeLang === lng.code ? 1 : 0.6
                        }}
                    >
                        {lng.label}
                    </button>
                    {index < languages.length - 1 && <span style={styles.separator}>|</span>}
                </React.Fragment>
            ))}
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        background: 'rgba(20, 20, 18, 0.85)', /* Deep dark slate */
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '10px 20px',
        borderRadius: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
    },
    button: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        letterSpacing: '0.15em',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.3s ease',
        padding: '0 4px'
    },
    separator: {
        color: 'rgba(255, 255, 255, 0.2)',
        fontSize: '0.8rem',
        margin: '0 2px'
    }
};

export default LanguageSwitcher;
