import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Star, Package, Truck, MapPin, MessageCircle } from 'lucide-react';
import Image, { Avatar } from './Image';
import { cityName } from '../utils/cityI18n';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AuthModal from './AuthModal';
import '../styles/boutique-card.css';
import '../styles/messaging.css';

const deliveryLabel = (boutique) => {
  if (!boutique.offers_delivery) return 'Retrait en boutique';
  const scope = boutique.delivery_scope || 'national';
  if (scope === 'national') return 'Livraison nationale';
  if (scope === 'regional') return 'Livraison régionale';
  return 'Livraison disponible';
};

export const BoutiqueCard = ({ boutique, onFollow, isFollowing, showDelivery = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isBoutiqueOwner } = useAuth();
  const toast = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState('Connectez-vous pour suivre cette boutique');
  const canContact = boutique.messages_enabled !== false;

  const handleFollow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isAdmin?.() || isBoutiqueOwner?.()) {
      toast.error("Les comptes administrateur et vendeur ne peuvent pas suivre de boutique.");
      return;
    }

    onFollow?.(boutique.id);
  };

  const handleContact = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canContact) {
      toast.error('Cette boutique n\'accepte pas les messages pour le moment.');
      return;
    }

    if (!isAuthenticated) {
      setAuthMessage('Connectez-vous pour contacter cette boutique');
      setShowAuthModal(true);
      return;
    }

    if (isAdmin?.() || isBoutiqueOwner?.()) {
      toast.error('Utilisez un compte client pour contacter une boutique.');
      return;
    }

    navigate(`/compte/messagerie?boutique=${boutique.id}`);
  };

  return (
    <>
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
              <div className="boutique-card__rating" title={`${Number(boutique.rating || 0).toFixed(1)} / 5`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < Math.round(Number(boutique.rating) || 0)
                      ? 'fill-secondary text-secondary'
                      : 'text-accent/30'}
                  />
                ))}
                <span>{Number(boutique.rating || 0).toFixed(1)}</span>
              </div>
            </div>

            <div className="boutique-card__stats">
              <span><Users size={14} /> {boutique.followers_count || 0}</span>
              <span><Package size={14} /> {boutique.products_count || 0}</span>
            </div>

            <div className="boutique-card__actions">
              {canContact && (
                <button type="button" onClick={handleContact} className="boutique-card__contact">
                  <MessageCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Contacter
                </button>
              )}
              <button
                type="button"
                onClick={handleFollow}
                className={`boutique-card__follow ${isFollowing ? 'boutique-card__follow--active' : ''}`}
              >
                {isFollowing ? '✓ Suivi' : '+ Suivre'}
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Auth Modal for follow */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authMessage}
      />
    </>
  );
};
