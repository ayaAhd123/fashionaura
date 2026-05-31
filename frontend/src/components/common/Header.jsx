import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Heart, Menu, X, User, LogIn, HelpCircle } from 'lucide-react';
import { CartContext } from '../../contexts/CartContext';
import { FavoritesContext } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import FashionAuraLogo from './FashionAuraLogo';
import LanguageSwitcher from '../LanguageSwitcher';
import { SHOP_NAV } from '../../config/navLinks';
import '../../styles/header.css';

export const Header = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const { favorites } = useContext(FavoritesContext);
  const { isAuthenticated } = useAuth();

  const cartCount = cart?.items?.length || 0;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <FashionAuraLogo to="/" size="md" className="hover:opacity-90 transition-opacity shrink-0" />

        <nav className="site-header__nav" aria-label={t('nav.main')}>
          {SHOP_NAV.map(({ to, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `site-header__link${isActive ? ' site-header__link--active' : ''}`
              }
            >
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <LanguageSwitcher variant="header" />

          <button
            type="button"
            className="site-header__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('nav.close_menu') : t('nav.open_menu')}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <NavLink to="/favoris" className="site-header__icon-btn" aria-label={t('nav.favorites')}>
            <Heart size={21} />
            {favorites.length > 0 && (
              <span className="site-header__badge">{favorites.length}</span>
            )}
          </NavLink>

          <NavLink to="/panier" className="site-header__icon-btn" aria-label={t('nav.cart')}>
            <ShoppingCart size={21} />
            {cartCount > 0 && (
              <span className="site-header__badge">{cartCount}</span>
            )}
          </NavLink>

          <NavLink to="/aide" className="site-header__icon-btn" aria-label="Besoin d'aide ?" title="Besoin d'aide ?">
            <HelpCircle size={21} />
          </NavLink>

          {isAuthenticated ? (
            <NavLink to="/compte" className="site-header__icon-btn" aria-label="Mon compte" title="Mon compte">
              <User size={21} />
            </NavLink>
          ) : (
            <NavLink to="/login" className="site-header__icon-btn" aria-label="Se connecter" title="Se connecter">
              <LogIn size={21} />
            </NavLink>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="site-header__mobile md:hidden" aria-label={t('nav.main')}>
          {SHOP_NAV.map(({ to, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `site-header__mobile-link${isActive ? ' site-header__mobile-link--active' : ''}`
              }
            >
              {t(labelKey)}
            </NavLink>
          ))}
          <NavLink
            to="/aide"
            onClick={closeMenu}
            className={({ isActive }) =>
              `site-header__mobile-link${isActive ? ' site-header__mobile-link--active' : ''}`
            }
          >
            Besoin d'aide ?
          </NavLink>
          <div className="site-header__mobile-lang">
            <LanguageSwitcher variant="header" />
          </div>
        </nav>
      )}
    </header>
  );
};
