import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Truck } from 'lucide-react';
import { cityName } from '../utils/cityI18n';

import '../styles/top-partners.css';

export function TopGoldCard({ boutique, city, rank }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/boutiques/${boutique.slug}`}
      className={`top-gold-card${rank === 1 ? ' top-gold-card--first' : ''}`}
    >
      <div className="top-gold-card__head">
        <span className="top-gold-card__rank">{rank}</span>
        <span className="top-gold-card__city">{cityName(t, city)}</span>
      </div>

      <div className="top-gold-card__media">
        {boutique.logo ? (
          <img src={boutique.logo} alt={boutique.name} />
        ) : (
          <span className="top-gold-card__initial">{boutique.name[0]}</span>
        )}
      </div>

      <div className="top-gold-card__body">
        <h3 className="top-gold-card__name">{boutique.name}</h3>
        <div className="top-gold-card__meta">
          <span>{boutique.products_count ?? 0} {t('top_boutiques.creations')}</span>
          <span className="top-gold-card__rating" title={`${Number(boutique.rating || 0).toFixed(1)} / 5`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.round(Number(boutique.rating) || 0) ? 'fill-current' : 'opacity-30'}
              />
            ))}
            <span className="top-gold-card__rating-num">{Number(boutique.rating || 0).toFixed(1)}</span>
          </span>
        </div>
        {boutique.offers_delivery && (
          <p className="top-gold-card__delivery">
            <Truck size={12} />
            {t('top_boutiques.delivery_short')}
          </p>
        )}
      </div>
    </Link>
  );
}
