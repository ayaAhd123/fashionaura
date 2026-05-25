import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, ImageIcon } from 'lucide-react';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { CartContext } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { resolveMediaUrl } from '../utils/imageUtils';
import AuthModal from './AuthModal';

const CardImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(src);

  if (!resolved || failed) {
    return (
      <div className="product-card__placeholder" aria-hidden>
        <ImageIcon size={40} strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt=""
      className="product-card__img"
      onError={() => setFailed(true)}
    />
  );
};

export const ProductCard = ({ product, onFavoriteToggle }) => {
  const { isFavorited, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const { addItem } = useContext(CartContext);
  const { isAuthenticated, isAdmin, isBoutiqueOwner } = useAuth();
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const liked = isFavorited(product.id);
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;
  const isOutOfStock = product.stock_quantity === 0;
  const imageUrl = product.images?.[0]?.image_url;

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isAdmin?.() || isBoutiqueOwner?.()) {
      toast.error("Les comptes administrateur et vendeur ne peuvent pas ajouter de favoris.");
      return;
    }

    if (liked) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
    onFavoriteToggle?.(product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('Ce produit est en rupture de stock');
      return;
    }

    addItem({
      product_id: product.id,
      product_variant_id: null,
      quantity: 1,
      name: product.name,
      price: product.discount_price || product.price,
      image: imageUrl,
    });

    setAdded(true);
    toast.success(`"${product.name}" ajouté au panier ! 🛍️`);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <>
      <article className="product-card">
        <div className="product-card__media">
          <Link
            to={`/products/${product.slug}`}
            className="product-card__image-wrap"
            aria-label={product.name}
          >
            <CardImage src={imageUrl} alt={product.name} />

            {discount > 0 && (
              <span className="product-card__badge">-{discount}%</span>
            )}

            {isOutOfStock && (
              <span className="product-card__stock-badge">Rupture de stock</span>
            )}
          </Link>

          <button
            type="button"
            onClick={handleFavorite}
            title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className={`product-card__favorite${liked ? ' is-active' : ''}`}
            aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart size={16} className={liked ? 'is-liked' : ''} />
          </button>
        </div>

        <div className="product-card__body">
          <div className="product-card__info">
            <Link to={`/products/${product.slug}`} className="product-card__title-link">
              <h3 className="product-card__title">{product.name}</h3>
            </Link>

            <div className="product-card__price-row">
              <span className="product-card__price">
                {product.discount_price
                  ? `${product.discount_price} DH`
                  : `${product.price} DH`}
              </span>
              {product.discount_price && (
                <span className="product-card__price-old">{product.price} DH</span>
              )}
            </div>

            <div className="product-card__rating">
              <div className="product-card__stars" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(product.rating || 0) ? 'is-filled' : ''}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="product-card__reviews">({product.reviews_count || 0})</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`product-card__cta${added ? ' is-added' : ''}${
              isOutOfStock ? ' is-disabled' : ''
            }`}
          >
            {added ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span>Ajouté !</span>
              </>
            ) : isOutOfStock ? (
              <span>Rupture de stock</span>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Ajouter au panier</span>
              </>
            )}
          </button>
        </div>
      </article>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Connectez-vous pour ajouter aux favoris"
      />
    </>
  );
};
