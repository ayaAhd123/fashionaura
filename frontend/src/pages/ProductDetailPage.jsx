import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart, Share2, ShoppingCart, ArrowLeft, Star,
  Truck, RotateCcw, ShieldCheck, Minus, Plus, Check, ImageIcon,
} from 'lucide-react';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { CartContext } from '../contexts/CartContext';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { resolveMediaUrl } from '../utils/imageUtils';
import AuthModal from '../components/AuthModal';
import '../styles/product-detail-lux.css';

const COLOR_MAP = {
  noir: '#1C1C1C', blanc: '#FFFFFF', rouge: '#9b2c2c', bleu: '#3b5a6b',
  vert: '#5b6e58', beige: '#D2B8A3', gris: '#8a847c', marron: '#5C4033',
  rose: '#d99', jaune: '#cda64f', orange: '#c47a44', violet: '#6f5e76',
  bordeaux: '#3D0C0C', doré: '#C9A96E', or: '#C9A96E', creme: '#F5EFE6',
};

const LIGHT_SWATCHES = ['#FFFFFF', '#D2B8A3', '#F5EFE6', '#C9A96E', '#cda64f'];

/* Étoiles réutilisables */
const Stars = ({ value = 0, size = 17, animated = false }) => (
  <span className={`pdp__stars${animated ? ' pdp__stars--anim' : ''}`}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} className={i < Math.round(value) ? 'pdp__star-on' : 'pdp__star-off'} />
    ))}
  </span>
);

const Placeholder = () => (
  <div className="pdp__ph"><ImageIcon strokeWidth={1.2} /></div>
);

const GalleryImg = ({ src }) => {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(src);
  if (!resolved || failed) return <Placeholder />;
  return <img src={resolved} alt="" onError={() => setFailed(true)} />;
};

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useContext(CartContext);
  const { addFavorite, removeFavorite, isFavorited } = useContext(FavoritesContext);
  const { isAuthenticated, isAdmin, isBoutiqueOwner } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  const rootRef = useRef(null);
  const liked = isFavorited(product?.id);

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  /* Staggered fade-in au scroll */
  useEffect(() => {
    if (!rootRef.current) return;
    const els = rootRef.current.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading, product, reviews, similar]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
      setSelectedImage(0);

      if (data.variants && data.variants.length > 0) {
        const firstVariant = data.variants[0];
        setSelectedSize(firstVariant.size);
        setSelectedColor(firstVariant.color);
      }

      try {
        const similarData = await productService.getSimilarProducts(data.id);
        setSimilar(Array.isArray(similarData) ? similarData : similarData.data || []);
      } catch (e) { /* pas de similaires */ }

      try {
        const reviewsData = await productService.getProductReviews(data.id);
        setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.data || []);
      } catch (e) { /* pas de reviews */ }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const variant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
    addItem({
      product_id: product.id,
      product_variant_id: variant?.id,
      quantity,
      name: product.name,
      price: product.discount_price || product.price,
      image: product.images?.[0]?.image_url,
      size: selectedSize,
      color: selectedColor,
    });
    toast.success(`"${product.name}" ajouté au panier ! `);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      setAuthModalMessage('Connectez-vous pour ajouter aux favoris');
      setAuthModalOpen(true);
      return;
    }
    if (isAdmin?.() || isBoutiqueOwner?.()) {
      toast.error("Les comptes administrateur et vendeur ne peuvent pas ajouter de favoris.");
      return;
    }
    if (liked) removeFavorite(product.id);
    else addFavorite(product.id);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setAuthModalMessage('Connectez-vous pour laisser un avis');
      setAuthModalOpen(true);
      return;
    }
    if (isAdmin?.() || isBoutiqueOwner?.()) {
      toast.error("Les comptes administrateur et vendeur ne peuvent pas laisser d'avis.");
      return;
    }
    const comment = newComment.trim();
    if (!comment || !product?.id || reviewSubmitting) return;

    try {
      setReviewSubmitting(true);
      await reviewService.createReview({
        product_id: product.id,
        rating: Number(newRating),
        comment,
      });
      const reviewsData = await productService.getProductReviews(product.id);
      setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.data || []);
      setNewComment('');
      setNewRating(5);
      toast.success('Commentaire ajouté avec succès.');
    } catch (error) {
      toast.error("Impossible d'ajouter le commentaire. Connectez-vous puis réessayez.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return (
    <main className="pdp">
      <div className="pdp__center">
        <div>
          <div className="pdp__spinner" />
          <p style={{ color: 'var(--muted)' }}>Chargement du produit…</p>
        </div>
      </div>
    </main>
  );

  if (!product) return (
    <main className="pdp">
      <div className="pdp__center">
        <div>
          <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}></p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--bordeaux)', marginBottom: '0.5rem' }}>Produit non trouvé</h2>
          <Link to="/boutiques" style={{ color: 'var(--gold)' }}>Retour aux boutiques</Link>
        </div>
      </div>
    </main>
  );

  const images = (product.images && product.images.length > 0) ? product.images : [{ id: 'ph', image_url: null }];
  const uniqueSizes = [...new Set(product.variants?.map(v => v.size))].filter(Boolean);
  const uniqueColors = [...new Set(product.variants?.map(v => v.color))].filter(Boolean);
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : Number(product.rating || 0).toFixed(1);
  const hasDiscount = !!product.discount_price && Number(product.discount_price) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)
    : 0;
  const inStock = product.stock_quantity !== 0;
  const lowStock = inStock && product.stock_quantity != null && product.stock_quantity <= 5;
  const current = images[selectedImage] || images[0];

  return (
    <main className="pdp" ref={rootRef}>
      {/* Breadcrumb */}
      <div className="pdp__crumbbar">
        <div className="pdp__container">
          <div className="pdp__crumb">
            <Link to="/boutiques"><ArrowLeft size={15} /> Boutiques</Link>
            {product.boutique && (
              <>
                <span className="sep">/</span>
                <Link to={`/boutiques/${product.boutique.slug}`}>{product.boutique.name}</Link>
              </>
            )}
            <span className="sep">/</span>
            <span className="current">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="pdp__container">
        {/* Hero */}
        <section className="pdp__hero">
          {/* Gallery */}
          <div className="pdp__gallery reveal">
            <div className="pdp__thumbs">
              {images.map((img, idx) => (
                <button
                  key={img.id ?? idx}
                  type="button"
                  className={`pdp__thumb${idx === selectedImage ? ' is-active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`Image ${idx + 1}`}
                >
                  <GalleryImg src={img.image_url} />
                </button>
              ))}
            </div>
            <div className="pdp__main">
              <GalleryImg src={current?.image_url} />
              {product.boutique && <span className="pdp__main-tag">{product.boutique.name}</span>}
              {!inStock && <div className="pdp__soldout"><span>Rupture de stock</span></div>}
            </div>
          </div>

          {/* Info */}
          <div className="pdp__info reveal" style={{ '--delay': '0.1s' }}>
            {product.boutique && (
              <Link to={`/boutiques/${product.boutique.slug}`} className="pdp__eyebrow">
                {product.boutique.name}
              </Link>
            )}

            <h1 className="pdp__title">{product.name}</h1>

            <div className="pdp__rating">
              <Stars value={avgRating} animated />
              <span className="score">{avgRating}</span>
              <span>·</span>
              <a href="#avis">{reviews.length} avis</a>
            </div>

            <div className="pdp__price-row">
              <span className="pdp__price">{hasDiscount ? product.discount_price : product.price} DH</span>
              {hasDiscount && (
                <>
                  <span className="pdp__price-old">{product.price} DH</span>
                  <span className="pdp__price-off">−{discountPct}%</span>
                </>
              )}
            </div>

            <div className={`pdp__stock${inStock ? '' : ' is-out'}`}>
              <span className="dot" />
              {inStock ? (lowStock ? `Plus que ${product.stock_quantity} en stock` : 'En stock') : 'Rupture de stock'}
            </div>

            {product.description && <p className="pdp__desc">{product.description}</p>}

            <div className="pdp__divider" />

            {/* Colors */}
            {uniqueColors.length > 0 && (
              <div className="pdp__field">
                <div className="pdp__label">
                  <span className="k">Couleur</span>
                  <span className="v">{selectedColor || 'Sélectionner'}</span>
                </div>
                <div className="pdp__colors">
                  {uniqueColors.map(color => {
                    const hex = COLOR_MAP[String(color).toLowerCase()] || '#cabfae';
                    const active = selectedColor === color;
                    const tick = LIGHT_SWATCHES.includes(hex) ? 'var(--bordeaux)' : '#fff';
                    return (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => setSelectedColor(color)}
                        className={`pdp__color${active ? ' is-active' : ''}`}
                        style={{ backgroundColor: hex }}
                      >
                        {active && <Check style={{ color: tick }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {uniqueSizes.length > 0 && (
              <div className="pdp__field">
                <div className="pdp__label">
                  <span className="k">Taille — <span className="v" style={{ textTransform: 'none' }}>{selectedSize || 'Sélectionner'}</span></span>
                  <button type="button" className="pdp__guide">Guide des tailles</button>
                </div>
                <div className="pdp__sizes">
                  {uniqueSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`pdp__size${selectedSize === size ? ' is-active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pdp__actions">
              <div className="pdp__qty">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Diminuer"><Minus size={16} /></button>
                <span className="val">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} aria-label="Augmenter"><Plus size={16} /></button>
              </div>
              <button className="pdp__cart" onClick={handleAddToCart} disabled={!inStock}>
                <ShoppingCart size={18} className="ic" />
                {inStock ? 'Ajouter au panier' : 'Indisponible'}
              </button>
              <button
                className={`pdp__fav${liked ? ' is-liked' : ''}`}
                onClick={handleToggleFavorite}
                aria-label="Favori"
              >
                <Heart size={22} />
              </button>
            </div>

            {/* Trust */}
            <div className="pdp__trust">
              {[
                { Icon: Truck, t: 'Livraison', s: '24–72h au Maroc' },
                { Icon: RotateCcw, t: 'Retours', s: 'Sous 14 jours' },
                { Icon: ShieldCheck, t: 'Paiement', s: '100% sécurisé' },
              ].map(({ Icon, t, s }, i) => (
                <div className="pdp__trust-card" key={i}>
                  <Icon />
                  <span className="t">{t}</span>
                  <span className="s">{s}</span>
                </div>
              ))}
            </div>

            <div className="pdp__share">
              <span className="k">Partager</span>
              <button aria-label="Partager"><Share2 size={18} /></button>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section id="avis" className="pdp__section reveal">
          <div className="pdp__reviews">
            <div className="pdp__reviews-head">
              <div>
                <h2 className="pdp__h2">Avis clients</h2>
                <p className="sub">{reviews.length} avis · note moyenne {avgRating}/5</p>
              </div>
              <Stars value={avgRating} size={22} animated />
            </div>

            <form className="pdp__review-form" onSubmit={handleSubmitReview}>
              <h3>Laisser votre avis</h3>
              <div className="pdp__form-grid">
                <div>
                  <label className="pdp__form-label" htmlFor="rev-rating">Note</label>
                  <select id="rev-rating" value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
                    <option value={5}>5 / 5</option>
                    <option value={4}>4 / 5</option>
                    <option value={3}>3 / 5</option>
                    <option value={2}>2 / 5</option>
                    <option value={1}>1 / 5</option>
                  </select>
                </div>
                <div>
                  <label className="pdp__form-label" htmlFor="rev-comment">Commentaire</label>
                  <textarea
                    id="rev-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Partagez votre expérience…"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="pdp__submit" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Publication…' : 'Publier mon avis'}
              </button>
            </form>

            {reviews.length === 0 ? (
              <div className="pdp__empty">
                Aucun avis pour le moment. Soyez le premier à partager votre expérience.
              </div>
            ) : (
              <div className="pdp__reviews-grid">
                {reviews.map(review => (
                  <div key={review.id} className="pdp__review">
                    <div className="pdp__review-top">
                      <div className="pdp__review-meta">
                        <div className="pdp__avatar">{(review.user?.name || 'C')[0].toUpperCase()}</div>
                        <div>
                          <p className="pdp__review-name">{review.user?.name || 'Client Anonyme'}</p>
                          <Stars value={review.rating} size={13} />
                        </div>
                      </div>
                      <span className="pdp__review-date">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="pdp__review-text">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="pdp__section reveal product-detail__similar">
            <div className="pdp__similar-head">
              <h2 className="pdp__h2">Vous aimerez aussi</h2>
              <Link to="/products">Voir tout →</Link>
            </div>
            <div className="pdp__similar-grid">
              {similar.slice(0, 3).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        message={authModalMessage}
      />
    </main>
  );
};
