import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star, MapPin, ArrowLeft, UserCheck, UserPlus, Truck,
} from 'lucide-react';
import { boutiqueService } from '../services/boutiqueService';
import { reviewService } from '../services/reviewService';
import { useToast } from '../contexts/ToastContext';
import { ProductCard } from '../components/ProductCard';
import { cityName } from '../utils/cityI18n';
import '../styles/boutique.css';

const deliveryLabel = (boutique) => {
  if (!boutique.offers_delivery) return 'Retrait en boutique uniquement';
  if (boutique.delivery_scope === 'national') return 'Livraison dans tout le Maroc';
  if (boutique.delivery_scope === 'regional') return 'Livraison régionale';
  return 'Livraison disponible';
};

export const BoutiqueDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const toast = useToast();
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchBoutiqueDetails();
  }, [slug]);

  const fetchBoutiqueDetails = async () => {
    try {
      setLoading(true);
      const data = await boutiqueService.getBoutiqueBySlug(slug);
      setBoutique(data);
      setFollowersCount(data.followers_count || 0);

      try {
        const followStatus = await boutiqueService.isFollowing(data.id);
        setFollowing(followStatus.is_following);
      } catch {
        /* auth optional */
      }

      const reviewsData = await boutiqueService.getBoutiqueReviews(data.id);
      setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (following) {
        await boutiqueService.unfollowBoutique(boutique.id);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await boutiqueService.followBoutique(boutique.id);
        setFollowersCount((prev) => prev + 1);
      }
      setFollowing(!following);
    } catch {
      setFollowing(!following);
      setFollowersCount((prev) => (following ? Math.max(0, prev - 1) : prev + 1));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    const comment = newComment.trim();
    if (!comment || !boutique?.id || reviewSubmitting) return;

    try {
      setReviewSubmitting(true);
      await reviewService.createReview({
        boutique_id: boutique.id,
        rating: Number(newRating),
        comment,
      });
      const reviewsData = await boutiqueService.getBoutiqueReviews(boutique.id);
      setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.data || []);
      setNewComment('');
      setNewRating(5);
      toast.success('Commentaire ajouté avec succès.');
    } catch {
      toast.error("Impossible d'ajouter le commentaire. Connectez-vous puis réessayez.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="boutique-detail__state">
        <div>
          <div className="boutique-detail__spinner" />
          <p className="text-neutral">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="boutique-detail__state">
        <div>
          <p className="text-5xl mb-4">🏪</p>
          <h2 className="text-2xl font-serif font-bold text-text mb-2">Boutique non trouvée</h2>
          <Link to="/boutiques" className="text-primary underline">Retour aux boutiques</Link>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : boutique.rating || '5.0';
  const productCount = boutique.products?.length || 0;

  return (
    <article className="boutique-detail">
      {/* Hero */}
      <section className="boutique-detail__hero">
        {boutique.banner ? (
          <img src={boutique.banner} alt="" className="boutique-detail__hero-img" />
        ) : (
          <span className="boutique-detail__hero-fallback" aria-hidden="true">
            {boutique.name[0]}
          </span>
        )}
        <div className="boutique-detail__hero-overlay" aria-hidden="true" />
        <Link to="/boutiques" className="boutique-detail__back">
          <ArrowLeft size={16} /> Retour
        </Link>
      </section>

      <div className="boutique-detail__body">
        {/* Profile card */}
        <section className="boutique-detail__card">
          <div className="boutique-detail__logo-wrap">
            <div className="boutique-detail__logo">
              {boutique.logo ? (
                <img src={boutique.logo} alt={boutique.name} />
              ) : (
                <span className="boutique-detail__logo-fallback">{boutique.name[0]}</span>
              )}
            </div>
          </div>

          <header className="boutique-detail__header">
            <h1 className="boutique-detail__title">{boutique.name}</h1>

            {boutique.city && (
              <p className="boutique-detail__location">
                <MapPin size={15} className="text-secondary shrink-0" />
                {cityName(t, boutique.city)}
              </p>
            )}

            <div className="boutique-detail__badges">
              <span
                className={`boutique-detail__badge ${
                  boutique.offers_delivery
                    ? 'boutique-detail__badge--delivery'
                    : 'boutique-detail__badge--pickup'
                }`}
              >
                <Truck size={14} />
                {deliveryLabel(boutique)}
              </span>
            </div>

            {boutique.delivery_note && (
              <p className="boutique-detail__delivery-note">{boutique.delivery_note}</p>
            )}

            <p className="boutique-detail__desc">
              {boutique.description || "Découvrez l'élégance et le raffinement de notre collection exclusive."}
            </p>
          </header>

          {/* Stats */}
          <div className="boutique-detail__stats">
            <div className="boutique-detail__stat">
              <div className="boutique-detail__stat-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(Number(avgRating)) ? 'fill-secondary text-secondary' : 'text-accent/40'}
                  />
                ))}
              </div>
              <div className="boutique-detail__stat-value">{avgRating}</div>
              <p className="boutique-detail__stat-label">
                {reviews.length} avis
              </p>
            </div>

            <div className="boutique-detail__stat">
              <div className="boutique-detail__stat-value">{followersCount}</div>
              <p className="boutique-detail__stat-label">Abonnés</p>
            </div>

            <div className="boutique-detail__stat">
              <div className="boutique-detail__stat-value">{productCount}</div>
              <p className="boutique-detail__stat-label">Créations</p>
            </div>
          </div>

          {/* Follow */}
          <div className="boutique-detail__actions">
            <button
              type="button"
              onClick={handleFollow}
              disabled={followLoading}
              className={`boutique-detail__follow ${
                following ? 'boutique-detail__follow--active' : 'boutique-detail__follow--default'
              }`}
            >
              {followLoading ? (
                <span className="boutique-detail__spinner" style={{ width: '1.25rem', height: '1.25rem', margin: 0 }} />
              ) : following ? (
                <UserCheck size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              <span>{following ? 'Suivi' : 'Suivre'}</span>
              {!followLoading && (
                <span className="boutique-detail__follow-count">{followersCount}</span>
              )}
            </button>
          </div>
        </section>

        {/* Products */}
        <section className="boutique-detail__section">
          <div className="boutique-detail__section-head">
            <h2 className="boutique-detail__section-title">Dernières créations</h2>
            {productCount > 0 && (
              <span className="boutique-detail__section-sub">
                {productCount} pièce{productCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {productCount > 0 ? (
            <div className="boutique-detail__products-grid">
              {boutique.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="boutique-detail__empty">
              <div className="boutique-detail__empty-icon">✨</div>
              <p className="boutique-detail__empty-text">
                Aucune création publiée pour le moment. Revenez bientôt !
              </p>
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="boutique-detail__reviews">
          <h2 className="boutique-detail__reviews-title">Ce que nos clients disent</h2>

          <form onSubmit={handleSubmitReview} className="boutique-detail__review-form">
            <h3>Laisser votre avis</h3>
            <div>
              <label htmlFor="boutique-review-rating">Note</label>
              <select
                id="boutique-review-rating"
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} / 5</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="boutique-review-comment">Commentaire</label>
              <textarea
                id="boutique-review-comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                placeholder="Partagez votre expérience..."
                required
              />
            </div>
            <button type="submit" disabled={reviewSubmitting} className="boutique-detail__review-submit">
              {reviewSubmitting ? 'Publication...' : 'Publier'}
            </button>
          </form>

          {reviews.length === 0 ? (
            <div className="boutique-detail__review-empty">
              <span className="boutique-detail__empty-icon">💬</span>
              <p>Soyez le premier à partager votre expérience avec {boutique.name}.</p>
            </div>
          ) : (
            <div className="boutique-detail__reviews-grid">
              {reviews.map((review) => (
                <article key={review.id} className="boutique-detail__review-card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-accent/30 rounded-full flex items-center justify-center font-serif text-text font-bold text-sm">
                        {(review.user?.name || 'A')[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-text text-sm">{review.user?.name || 'Client'}</p>
                        <p className="text-xs text-neutral">
                          {new Date(review.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-secondary text-sm' : 'text-accent/30 text-sm'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-text text-sm font-light leading-relaxed m-0">&ldquo;{review.comment}&rdquo;</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </article>
  );
};
