import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, ShoppingCart, ArrowLeft, Star } from 'lucide-react';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { CartContext } from '../contexts/CartContext';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailGallery } from '../components/ProductDetailGallery';
import AuthModal from '../components/AuthModal';

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

  // State pour les variantes
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  const liked = isFavorited(product?.id);

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
      setSelectedImage(0);

      // Set default size and color
      if (data.variants && data.variants.length > 0) {
        const firstVariant = data.variants[0];
        setSelectedSize(firstVariant.size);
        setSelectedColor(firstVariant.color);
      }

      // Get similar products
      try {
        const similarData = await productService.getSimilarProducts(data.id);
        setSimilar(Array.isArray(similarData) ? similarData : similarData.data || []);
      } catch (e) {
        // Pas d'erreur si pas de similaires
      }

      // Get reviews
      try {
        const reviewsData = await productService.getProductReviews(data.id);
        setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.data || []);
      } catch (e) {
        // Pas d'erreur si pas de reviews
      }
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
    toast.success(`"${product.name}" ajouté au panier ! 🛍️`);
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

    if (liked) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
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
    if (!comment || !product?.id || reviewSubmitting) {
      return;
    }

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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement du produit...</p>
      </div>
    </div>
  );
  if (!product) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold text-primary mb-2">Produit non trouvé</h2>
        <Link to="/boutiques" className="text-primary underline">Retour aux boutiques</Link>
      </div>
    </div>
  );

  const images = product.images || [];
  const uniqueSizes = [...new Set(product.variants?.map(v => v.size))];
  const uniqueColors = [...new Set(product.variants?.map(v => v.color))];
  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : product.rating;

  return (
    <main className="bg-background min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral mb-10 font-medium tracking-wide">
          <Link to="/boutiques" className="hover:text-text transition-colors flex items-center gap-1.5">
            <ArrowLeft size={16} /> Boutiques
          </Link>
          {product.boutique && (
            <>
              <span className="text-accent">/</span>
              <Link to={`/boutiques/${product.boutique.slug}`} className="hover:text-text transition-colors">
                {product.boutique.name}
              </Link>
            </>
          )}
          <span className="text-accent">/</span>
          <span className="text-text font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-accent/10 p-6 md:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <ProductDetailGallery
              images={images}
              productName={product.name}
              selectedIndex={selectedImage}
              onSelect={setSelectedImage}
              isOutOfStock={product.stock_quantity === 0}
            />

            {/* Product Info (Right Column) */}
            <div className="flex flex-col py-2">

              {/* Boutique */}
              {product.boutique && (
                <Link to={`/boutiques/${product.boutique.slug}`} className="text-neutral text-sm tracking-widest uppercase font-semibold hover:text-text transition-colors mb-4 block">
                  {product.boutique.name}
                </Link>
              )}

              <h1 className="text-4xl md:text-5xl font-serif font-bold text-text mb-4 leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < Math.floor(avgRating) ? 'fill-secondary text-secondary' : 'text-accent/30'} />
                  ))}
                </div>
                <p className="text-neutral text-sm">({reviews.length} avis clients)</p>
              </div>

              {/* Price */}
              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-serif font-bold text-text">
                  {product.discount_price ? `${product.discount_price}` : `${product.price}`} DH
                </span>
                {product.discount_price && (
                  <span className="text-xl text-neutral/60 line-through font-light mb-1">{product.price} DH</span>
                )}
              </div>

              {/* Description */}
              <div className="h-px w-full bg-accent/20 mb-8" />
              <p className="text-text font-light leading-relaxed mb-8 text-lg">
                {product.description}
              </p>
              <div className="h-px w-full bg-accent/20 mb-8" />

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-10 flex flex-col gap-8">
                  {/* Colors */}
                  {uniqueColors.length > 0 && (
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <label className="block text-sm font-semibold tracking-widest uppercase text-text">Couleur</label>
                        <span className="text-neutral text-sm">{selectedColor || 'Sélectionner'}</span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {uniqueColors.map(color => {
                          // Simple color mapping logic for demo/UI
                          const colorMap = {
                            'noir': '#000000', 'blanc': '#FFFFFF', 'rouge': '#E2725B', 'bleu': '#B7C6C9', 'vert': '#6E7F78', 'beige': '#D2B8A3', 'gris': '#8A908C'
                          };
                          const hexColor = colorMap[color.toLowerCase()] || '#D9DDDF';

                          return (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`w-12 h-12 rounded-full border border-background shadow-sm transition-all duration-300 relative ${selectedColor === color ? 'ring-2 ring-offset-4 ring-text scale-110' : 'hover:scale-110 hover:shadow-md'
                                }`}
                              style={{ backgroundColor: hexColor }}
                              title={color}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {uniqueSizes.length > 0 && (
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <label className="block text-sm font-semibold tracking-widest uppercase text-text">Taille</label>
                        <span className="text-neutral text-sm hover:underline cursor-pointer">Guide des tailles</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {uniqueSizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[4rem] px-4 py-3 rounded-xl border transition-all duration-300 text-sm font-medium ${selectedSize === size
                              ? 'border-text bg-text text-white shadow-md'
                              : 'border-accent/40 bg-white text-text hover:border-text hover:bg-background'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="flex flex-col gap-6 mt-auto">
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-accent/40 rounded-xl bg-background/30 h-14 w-32">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 h-full flex items-center justify-center hover:bg-accent/20 rounded-l-xl text-xl text-neutral transition-colors">−</button>
                    <span className="flex-1 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="flex-1 h-full flex items-center justify-center hover:bg-accent/20 rounded-r-xl text-xl text-neutral transition-colors">+</button>
                  </div>

                  {/* Favorite */}
                  <button
                    onClick={handleToggleFavorite}
                    className={`h-14 w-14 border rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${liked ? 'border-heart bg-heart/5' : 'border-accent/40 bg-white hover:border-heart hover:bg-heart/5'
                      }`}
                  >
                    <Heart size={24} className={liked ? 'fill-heart text-heart' : 'text-text'} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="w-full bg-primary text-white py-4 rounded-xl font-medium tracking-widest uppercase shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-text hover:shadow-text/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={20} />
                  {product.stock_quantity === 0 ? 'Indisponible' : 'Ajouter au Panier'}
                </button>
              </div>

              {/* Social & Help */}
              <div className="mt-10 pt-6 border-t border-accent/20 flex flex-col sm:flex-row gap-6 justify-between items-center text-sm">
                <div className="flex items-center gap-4 text-neutral font-medium">
                  <span className="uppercase tracking-wider text-xs">Partager :</span>
                  <button className="hover:text-text transition-colors"><Share2 size={18} /></button>
                </div>
                <div className="text-neutral font-medium text-xs tracking-wider uppercase">
                  Service Client VIP : 24/7
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-accent/10 p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-serif font-bold text-text mb-10 text-center">Avis sur ce produit ({reviews.length})</h2>
          <form onSubmit={handleSubmitReview} className="mb-10 border border-accent/20 rounded-2xl p-5 md:p-6 bg-background/20">
            <h3 className="text-lg font-semibold text-text mb-4">Laisser votre avis</h3>
            <div className="mb-4">
              <label htmlFor="product-review-rating" className="block text-sm text-neutral mb-2">Note</label>
              <select
                id="product-review-rating"
                value={newRating}
                onChange={(event) => setNewRating(Number(event.target.value))}
                className="w-full md:w-48 border border-accent/40 rounded-xl px-3 py-2 bg-white text-text"
              >
                <option value={5}>5 / 5</option>
                <option value={4}>4 / 5</option>
                <option value={3}>3 / 5</option>
                <option value={2}>2 / 5</option>
                <option value={1}>1 / 5</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="product-review-comment" className="block text-sm text-neutral mb-2">Commentaire</label>
              <textarea
                id="product-review-comment"
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                rows={4}
                placeholder="Partagez votre experience..."
                className="w-full border border-accent/40 rounded-xl px-3 py-2 bg-white text-text"
                required
              />
            </div>
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-60"
            >
              {reviewSubmitting ? 'Publication...' : 'Publier'}
            </button>
          </form>
          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl opacity-30 mb-4 block">✧</span>
              <p className="text-neutral italic">Aucun avis pour le moment. Soyez le premier à partager votre expérience.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map(review => (
                <div key={review.id} className="p-6 rounded-2xl bg-background/30 border border-transparent hover:border-accent/20 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-text uppercase tracking-wide text-sm mb-1">{review.user?.name || 'Client Anonyme'}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-secondary' : 'text-accent/30'}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral tracking-wider">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <p className="text-text font-light leading-relaxed italic">"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Similar Products */}
        {similar.length > 0 && (
          <section className="mb-20 product-detail__similar">
            <div className="flex justify-between items-end mb-10 pb-4 border-b border-accent/20">
              <h2 className="text-3xl font-serif font-bold text-text">Vous aimerez aussi</h2>
              <Link to="/products" className="text-neutral text-sm tracking-widest uppercase font-medium hover:text-text transition-colors hidden sm:block">Voir tout →</Link>
            </div>
            <div className="product-detail__similar-grid">
              {similar.slice(0, 3).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        message={authModalMessage}
      />
    </main>
  );
};
