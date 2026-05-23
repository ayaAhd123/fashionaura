import React from 'react';
import FashionAuraLogo from './FashionAuraLogo';
import { useTranslation } from 'react-i18next';
import '../../styles/footer.css';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="site-footer__glow" aria-hidden="true" />

      <div className="site-footer__inner">
        <div className="site-footer__content">
          <FashionAuraLogo to="/" size="md" variant="light" />
          <p className="site-footer__tagline">{t('footer.tagline')}</p>
          <p className="site-footer__synthesis">{t('footer.synthesis')}</p>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copy">
            &copy; {new Date().getFullYear()} FashionAura. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
