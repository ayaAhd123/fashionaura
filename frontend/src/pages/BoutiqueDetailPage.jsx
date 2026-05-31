import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star, MapPin, ArrowLeft, UserCheck, UserPlus, Truck, Search, Lock, Tag, MessageCircle,
} from 'lucide-react';
import { boutiqueService } from '../services/boutiqueService';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { getBoutiqueFeed } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { cityName, getCitySlug } from '../utils/cityI18n';
import { applyCityTheme } from '../utils/cityThemes';
import { resolveMediaUrl } from '../utils/imageUtils';
import { PRODUCT_TYPES, OCCASION_TYPES, buildArticleFilters } from '../config/articleTypes';
import AuthModal from '../components/AuthModal';
import PostComments from '../components/posts/PostComments';
import '../styles/boutique.css';
import '../styles/messaging.css';

const deliveryLabel = (boutique) => {
  if (!boutique.offers_delivery) return 'Retrait en boutique uniquement';
  if (boutique.delivery_scope === 'national') return 'Livraison dans tout le Maroc';
  if (boutique.delivery_scope === 'regional') return 'Livraison régionale';
  return 'Livraison disponible';
};

export const BoutiqueDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, isAdmin, isBoutiqueOwner } = useAuth();
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Recherche / filtres d'articles dans ce magasin
  const [articleType, setArticleType] = useState(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Fil de publications (réseau social boutique)
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  useEffect(() => {
    setArticleType(null);
    setArticleSearch('');
    setFilteredProducts([]);
    fetchBoutiqueDetails();
  }, [slug]);

  // Applique le thème de la ville de la boutique
  useEffect(() => {
    if (!boutique?.city) return;
    return applyCityTheme(boutique.city);
  }, [boutique]);

  // Charge le fil de publications (re-fetch quand on suit/ne suit plus → déverrouille l'exclusif)
  useEffect(() => {
    if (!boutique?.id) return;
    let active = true;
    setPostsLoading(true);
    getBoutiqueFeed(boutique.id)
      .then((res) => { if (active) setPosts(res.data?.data || []); })
      .catch(() => { if (active) setPosts([]); })
      .finally(() => { if (active) setPostsLoading(false); });
    return () => { active = false; };
  }, [boutique, following]);

  const isArticleMode = Boolean(articleType) || articleSearch.trim().length > 0;

  // Filtre les produits de CE magasin (recherche par produit / occasion)
  useEffect(() => {
    if (!boutique || !(Boolean(articleType) || articleSearch.trim().length > 0)) {
      setFilteredProducts([]);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setProductsLoading(true);
        const data = await productService.getProducts(
          buildArticleFilters({ boutique: slug }, articleType, articleSearch)
        );
        if (active) setFilteredProducts(data?.data ?? data ?? []);
      } catch (err) {
        console.error('Erreur produits boutique:', err);
        if (active) setFilteredProducts([]);
      } finally {
        if (active) setProductsLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [slug, articleType, articleSearch, boutique]);

  const resetArticleFilters = () => {
    setArticleType(null);
    setArticleSearch('');
  };

  const handleTypeSelect = (list, event) => {
    const value = event.target.value;
    if (value) setArticleType(list.find((x) => x.id === value) || null);
    else if (list.some((x) => x.id === articleType?.id)) setArticleType(null);
  };

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
    if (!isAuthenticated) {
      setAuthModalMessage('Connectez-vous pour suivre cette boutique');
      setAuthModalOpen(true);
      return;
    }

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

  const handleContact = () => {
    if (boutique?.messages_enabled === false) {
      toast.error('Cette boutique n\'accepte pas les messages pour le moment.');
      return;
    }

    if (!isAuthenticated) {
      setAuthModalMessage('Connectez-vous pour contacter cette boutique');
      setAuthModalOpen(true);
      return;
    }

    if (isAdmin?.() || isBoutiqueOwner?.()) {
      toast.error('Utilisez un compte client pour contacter une boutique.');
      return;
    }

    navigate(`/compte/messagerie?boutique=${boutique.id}`);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setAuthModalMessage('Connectez-vous pour laisser un avis');
      setAuthModalOpen(true);
      return;
    }

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
  const citySlug = getCitySlug(boutique.city);
  const displayProducts = isArticleMode ? filteredProducts : (boutique.products || []);

  return (
    <article className={`boutique-detail boutique-detail--themed theme-${citySlug}`}>
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
            {boutique.messages_enabled !== false && (
              <button type="button" onClick={handleContact} className="boutique-detail__contact">
                <MessageCircle size={18} />
                <span>Contacter</span>
              </button>
            )}
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

        {/* Products + recherche/filtres (mêmes que la page ville) */}
        <section className="boutique-detail__section">
          {/* Barre de recherche d'article */}
          <div className="boutique-filter">
            <div className="boutique-filter__search">
              <Search size={17} className="boutique-filter__search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Rechercher dans cette boutique (robe, caftan, soirée…)"
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="boutique-filter__input"
              />
            </div>

            <div className="boutique-filter__chips">
              <button
                type="button"
                className={`boutique-chip ${!isArticleMode ? 'boutique-chip--active' : ''}`}
                onClick={resetArticleFilters}
              >
                Tout
              </button>

              <select
                className="boutique-filter__select"
                aria-label="Type de pièce"
                value={PRODUCT_TYPES.some((x) => x.id === articleType?.id) ? articleType.id : ''}
                onChange={(e) => handleTypeSelect(PRODUCT_TYPES, e)}
              >
                <option value="">Type de pièce</option>
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>

              <select
                className="boutique-filter__select"
                aria-label="Occasion"
                value={OCCASION_TYPES.some((x) => x.id === articleType?.id) ? articleType.id : ''}
                onChange={(e) => handleTypeSelect(OCCASION_TYPES, e)}
              >
                <option value="">Occasion</option>
                {OCCASION_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="boutique-detail__section-head">
            <h2 className="boutique-detail__section-title">
              {isArticleMode ? 'Résultats' : 'Dernières créations'}
            </h2>
            {displayProducts.length > 0 && (
              <span className="boutique-detail__section-sub">
                {displayProducts.length} pièce{displayProducts.length > 1 ? 's' : ''}
                {isArticleMode && articleType ? ` · ${articleType.label}` : ''}
              </span>
            )}
          </div>

          {productsLoading ? (
            <div className="boutique-detail__empty">
              <div className="boutique-detail__spinner" />
              <p className="boutique-detail__empty-text">Recherche en cours…</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="boutique-detail__products-grid">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="boutique-detail__empty">
              <div className="boutique-detail__empty-icon">{isArticleMode ? '🔍' : '✨'}</div>
              <p className="boutique-detail__empty-text">
                {isArticleMode
                  ? `Aucune pièce ne correspond à ce filtre dans ${boutique.name}.`
                  : 'Aucune création publiée pour le moment. Revenez bientôt !'}
              </p>
              {isArticleMode && (
                <button type="button" className="boutique-chip boutique-chip--active" onClick={resetArticleFilters}>
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </section>

        {/* Fil de publications (actualités & offres) */}
        {(postsLoading || posts.length > 0) && (
          <section className="boutique-feed">
            <div className="boutique-detail__section-head">
              <h2 className="boutique-detail__section-title">Actualités &amp; offres</h2>
              {posts.length > 0 && (
                <span className="boutique-detail__section-sub">{posts.length} publication{posts.length > 1 ? 's' : ''}</span>
              )}
            </div>

            {postsLoading ? (
              <div className="boutique-detail__empty">
                <div className="boutique-detail__spinner" />
                <p className="boutique-detail__empty-text">Chargement des publications…</p>
              </div>
            ) : (
              <div className="boutique-feed__grid">
                {posts.map((post) => (
                  <article key={post.id} className={`feed-post ${post.is_locked ? 'feed-post--locked' : ''}`}>
                    <div className="feed-post__media">
                      {post.image_url && (
                        <img src={resolveMediaUrl(post.image_url)} alt="" className="feed-post__img" />
                      )}
                      {post.is_exclusive && (
                        <span className="feed-post__exclusive"><Tag size={12} /> Exclusif abonnés</span>
                      )}
                      {post.is_locked && (
                        <div className="feed-post__lock">
                          <Lock size={22} />
                          <p>Offre réservée aux abonnés</p>
                          <button type="button" className="feed-post__lock-btn" onClick={handleFollow}>
                            {isAuthenticated ? 'Suivre pour débloquer' : 'Connectez-vous & suivez'}
                          </button>
                        </div>
                      )}
                    </div>
                    {!post.is_locked && (
                      <div className="feed-post__body">
                        {post.caption && <p className="feed-post__caption">{post.caption}</p>}
                        {post.promo_text && (
                          <p className="feed-post__promo">
                            <Tag size={13} /> {post.promo_text}
                            {post.promo_code && <code className="feed-post__code">{post.promo_code}</code>}
                          </p>
                        )}
                        {post.product && (
                          <Link to={`/products/${post.product.slug}`} className="feed-post__product">
                            Voir « {post.product.name} » →
                          </Link>
                        )}
                        <PostComments
                          boutiqueId={boutique.id}
                          postId={post.id}
                          initialCount={post.comments_count || 0}
                        />
                        <span className="feed-post__time">{post.created_at}</span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

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

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        message={authModalMessage}
      />
    </article>
  );
};
