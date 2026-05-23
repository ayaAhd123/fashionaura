import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/language-switcher.css';

const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'ar', label: 'AR', dir: 'rtl' },
];

const LanguageSwitcher = ({ variant = 'header' }) => {
    const { i18n } = useTranslation();
    const activeLang = i18n.language?.split('-')[0] || 'fr';

    useEffect(() => {
        const currentLang = languages.find((l) => l.code === activeLang) || languages[0];
        document.documentElement.dir = currentLang.dir || 'ltr';
        document.documentElement.lang = currentLang.code;
    }, [activeLang]);

    const changeLang = (code) => {
        i18n.changeLanguage(code);
    };

    return (
        <div
            className={`language-switcher language-switcher--${variant}`}
            role="group"
            aria-label="Choisir la langue"
        >
            {languages.map((lng, index) => (
                <React.Fragment key={lng.code}>
                    <button
                        type="button"
                        onClick={() => changeLang(lng.code)}
                        className={`language-switcher__btn ${activeLang === lng.code ? 'language-switcher__btn--active' : ''}`}
                    >
                        {lng.label}
                    </button>
                    {index < languages.length - 1 && (
                        <span className="language-switcher__sep" aria-hidden="true">|</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default LanguageSwitcher;
