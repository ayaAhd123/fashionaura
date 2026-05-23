import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Star, Package, Truck, MapPin } from 'lucide-react';
import Image, { Avatar } from './Image';
import { cityName } from '../utils/cityI18n';
import '../styles/boutique-card.css';
const deliveryLabel = (boutique) => {
  if (!boutique.offers_delivery) return 'Retrait en boutique';
  const scope = boutique.delivery_scope || 'national';
  if (scope === 'national') return 'Livraison nationale';
  if (scope === 'regional') return 'Livraison régionale';
  return 'Livraison disponible';
};

export const BoutiqueCard = ({ boutique, onFollow, isFollowing, showDelivery = false }) => {
  const { t } = useTranslation();
  const handleFollow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFollow?.(boutique.id);
  };

  return (
    <Link to={`/boutiques/${boutique.slug}`} className="boutique-card group block">
      <div className="boutique-card__inner">
        {/* Banner / Logo area */}
        <div className="boutique-card__media">
          {boutique.logo ? (
            <Image
              src={boutique.logo}
              alt={boutique.name}
              className="boutique-card__img"
              objectFit="cover"
            />
          ) : (
            <Avatar
              name={boutique.name}
              size="xl"
              className="boutique-card__avatar"
            />
          )}
        </div>

        <div className="boutique-card__body">
          <h3 className="boutique-card__name">{boutique.name}</h3>

          {showDelivery && (
            <p
              className={`text-xs font-medium mb-3 flex items-center gap-1.5 ${
                boutique.offers_delivery ? 'text-green-700' : 'text-neutral'
              }`}
              title={boutique.delivery_note || ''}
            >
              <Truck size={14} className="shrink-0" />
              {deliveryLabel(boutique)}
            </p>
          )}

          <div className="boutique-card__meta">
            {boutique.city && (
              <p className="boutique-card__city">
                <MapPin size={13} className="shrink-0" />
                {cityName(t, boutique.city)}
              </p>
            )}
            <div className="boutique-card__rating">
              <Star size={13} className="fill-secondary text-secondary" />
              <span>{boutique.rating || '5.0'}</span>
            </div>
          </div>

          <div className="boutique-card__stats">
            <span><Users size={14} /> {boutique.followers_count || 0}</span>
            <span><Package size={14} /> {boutique.products_count || 0}</span>
          </div>

          <button
            type="button"
            onClick={handleFollow}
            className={`boutique-card__follow ${isFollowing ? 'boutique-card__follow--active' : ''}`}
          >
            {isFollowing ? '✓ Suivi' : '+ Suivre'}
          </button>
        </div>
      </div>
    </Link>
  );
};
