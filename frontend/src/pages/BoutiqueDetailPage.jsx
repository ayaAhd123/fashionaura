import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star, MapPin, ArrowLeft, UserCheck, UserPlus, Truck, Search, MessageCircle,
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
import OfferPostCard from '../components/boutique/OfferPostCard';
import { splitBoutiquePosts } from '../utils/boutiqueOffers';
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
  const [contentTab, setContentTab] = useState('creations');

  useEffect(() => {
    setArticleType(null);
    setArticleSearch('');
    setFilteredProducts([]);
    setContentTab('creations');
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

  const { publicOffers, exclusiveOffers, news: newsPosts } = splitBoutiquePosts(posts);

  const handleFollowForOffers = () => {
    if (!isAuthenticated) {
      setAuthModalMessage('Connectez-vous puis suivez la boutique pour voir les offres exclusives');
      setAuthModalOpen(true);
      return;
    }
    if (!following) handleFollow();
  };

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

      if (isAuthenticated) {
        try {
          const followStatus = await boutiqueService.isFollowing(data.id);
          setFollowing(followStatus.is_following);
        } catch {
          setFollowing(false);
        }
      } else {
        setFollowing(false);
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
          <p className="text-5xl mb-4"></p>
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
          <img src={resolveMediaUrl(boutique.banner)} alt="" className="boutique-detail__hero-img" />
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
                <img src={resolveMediaUrl(boutique.logo)} alt={boutique.name} />
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

        {/* Produits + offres (onglets) */}
        <section className="boutique-detail__section">
          {contentTab === 'creations' && (
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
          )}

          <div className="boutique-detail__section-head boutique-detail__tabs-head">
            <div className="boutique-detail__tabs" role="tablist" aria-label="Contenu de la boutique">
              <button
                type="button"
                role="tab"
                id="boutique-tab-creations"
                aria-selected={contentTab === 'creations'}
                aria-controls="boutique-panel-creations"
                className={`boutique-detail__tab ${contentTab === 'creations' ? 'boutique-detail__tab--active' : ''}`}
                onClick={() => setContentTab('creations')}
              >
                {isArticleMode ? 'Résultats' : 'Dernières créations'}
              </button>
              <button
                type="button"
                role="tab"
                id="boutique-tab-offers"
                aria-selected={contentTab === 'offers'}
                aria-controls="boutique-panel-offers"
                className={`boutique-detail__tab ${contentTab === 'offers' ? 'boutique-detail__tab--active' : ''}`}
                onClick={() => setContentTab('offers')}
              >
                Offres spéciales
              </button>
            </div>
            {contentTab === 'creations' && displayProducts.length > 0 && (
              <span className="boutique-detail__section-sub">
                {displayProducts.length} pièce{displayProducts.length > 1 ? 's' : ''}
                {isArticleMode && articleType ? ` · ${articleType.label}` : ''}
              </span>
            )}
            {contentTab === 'offers' && !postsLoading && (
              <span className="boutique-detail__section-sub">
                {publicOffers.length + exclusiveOffers.length} offre{(publicOffers.length + exclusiveOffers.length) > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {contentTab === 'creations' && (
            <div
              id="boutique-panel-creations"
              role="tabpanel"
              aria-labelledby="boutique-tab-creations"
            >
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
            </div>
          )}

          {contentTab === 'offers' && boutique && (
            <div
              id="boutique-panel-offers"
              role="tabpanel"
              aria-labelledby="boutique-tab-offers"
              className="boutique-offers"
            >
              {postsLoading ? (
                <div className="boutique-detail__empty">
                  <div className="boutique-detail__spinner" />
                  <p className="boutique-detail__empty-text">Chargement des offres…</p>
                </div>
              ) : (
                <>
                  <div className="boutique-offers__lane">
                    <div className="boutique-offers__lane-head">
                      <h3 className="boutique-offers__lane-title">Offres pour tous</h3>
                      <p className="boutique-offers__lane-desc">Promotions accessibles à tous les visiteurs.</p>
                    </div>
                    {publicOffers.length > 0 ? (
                      <div className="boutique-feed__grid">
                        {publicOffers.map((post) => (
                          <OfferPostCard
                            key={post.id}
                            post={post}
                            boutiqueId={boutique.id}
                            onFollow={handleFollowForOffers}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="boutique-offers__empty-lane">Aucune offre publique pour le moment.</p>
                    )}
                  </div>

                  <div className="boutique-offers__lane boutique-offers__lane--exclusive">
                    <div className="boutique-offers__lane-head">
                      <h3 className="boutique-offers__lane-title">Offres exclusives abonnés</h3>
                      <p className="boutique-offers__lane-desc">
                        {following
                          ? 'Promotions réservées à ceux qui suivent la boutique.'
                          : 'Suivez la boutique pour débloquer ces offres.'}
                      </p>
                    </div>

                    {!following && exclusiveOffers.length > 0 && (
                      <div className="boutique-offers__follow-cta">
                        <p>Abonnez-vous à {boutique.name} pour accéder aux promotions exclusives.</p>
                        <button
                          type="button"
                          className="boutique-offers__follow-btn"
                          onClick={handleFollowForOffers}
                          disabled={followLoading}
                        >
                          {followLoading ? '…' : (
                            <>
                              <UserPlus size={16} />
                              Suivre pour voir les offres
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {exclusiveOffers.length > 0 ? (
                      <div className="boutique-feed__grid">
                        {exclusiveOffers.map((post) => (
                          <OfferPostCard
                            key={post.id}
                            post={post}
                            boutiqueId={boutique.id}
                            onFollow={handleFollowForOffers}
                            showLockButton={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="boutique-offers__empty-lane">Aucune offre exclusive pour le moment.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Actualités (hors offres) */}
        {!postsLoading && newsPosts.length > 0 && (
          <section className="boutique-feed">
            <div className="boutique-detail__section-head">
              <h2 className="boutique-detail__section-title">Actualités</h2>
              <span className="boutique-detail__section-sub">{newsPosts.length} publication{newsPosts.length > 1 ? 's' : ''}</span>
            </div>
            <div className="boutique-feed__grid">
              {newsPosts.map((post) => (
                <OfferPostCard
                  key={post.id}
                  post={post}
                  boutiqueId={boutique.id}
                  onFollow={handleFollowForOffers}
                />
              ))}
            </div>
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
                        <span key={i} className={i < review.rating ? 'text-secondary text-sm' : 'text-accent/30 text-sm'}></span>
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
