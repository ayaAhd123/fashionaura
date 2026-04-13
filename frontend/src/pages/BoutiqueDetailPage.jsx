import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Star, Package, MapPin, Phone, Mail, Globe, ArrowLeft, UserCheck, UserPlus } from 'lucide-react';
import { boutiqueService } from '../services/boutiqueService';
import { ProductCard } from '../components/ProductCard';

export const BoutiqueDetailPage = () => {
  const { slug } = useParams();
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchBoutiqueDetails();
  }, [slug]);

  const fetchBoutiqueDetails = async () => {
    try {
      setLoading(true);
      const data = await boutiqueService.getBoutiqueBySlug(slug);
      setBoutique(data);
      setFollowersCount(data.followers_count || 0);

      // Check if following
      try {
        const followStatus = await boutiqueService.isFollowing(data.id);
        setFollowing(followStatus.is_following);
      } catch (e) {
        // Auth not required yet
      }

      // Get reviews
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
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await boutiqueService.followBoutique(boutique.id);
        setFollowersCount(prev => prev + 1);
      }
      setFollowing(!following);
    } catch (error) {
      // Si erreur API (ex: non connecté), toggle quand même visuellement
      setFollowing(!following);
      setFollowersCount(prev => following ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement de la boutique...</p>
      </div>
    </div>
  );
  if (!boutique) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🏪</p>
        <h2 className="text-2xl font-bold text-primary mb-2">Boutique non trouvée</h2>
        <a href="/boutiques" className="text-primary underline">Retour aux boutiques</a>
      </div>
    </div>
  );

  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : boutique.rating;

  return (
    <main className="bg-background min-h-screen pb-24">
      {/* Large Banner (Hero Section) */}
      <div className="h-80 md:h-96 relative overflow-hidden bg-white">
        {boutique.banner ? (
          <img src={boutique.banner} alt={boutique.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center opacity-50">
            <span className="text-white/20 text-[250px] font-serif font-black select-none pointer-events-none">
              {boutique.name[0]}
            </span>
          </div>
        )}
        {/* Soft Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Breadcrumb */}
        <div className="absolute top-6 left-6 z-20">
          <Link to="/boutiques" className="flex items-center gap-2 text-text/80 hover:text-text transition-colors text-sm bg-white/40 backdrop-blur-md px-4 py-2 rounded-full font-medium shadow-sm">
            <ArrowLeft size={16} /> Retour
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 md:-mt-40 relative z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 p-8 md:p-12 mb-16 border border-accent/10">
          <div className="flex flex-col items-center">
            {/* Logo */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-background rounded-full flex items-center justify-center flex-shrink-0 border-8 border-white shadow-lg overflow-hidden -mt-24 md:-mt-32 mb-6">
              {boutique.logo ? (
                <img src={boutique.logo} alt={boutique.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl font-serif font-black text-primary/30">{boutique.name[0]}</span>
              )}
            </div>

            {/* Info */}
            <div className="text-center max-w-3xl w-full">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-text mb-3 tracking-tight">{boutique.name}</h1>
              {boutique.city?.name && (
                <p className="text-neutral font-medium tracking-wide flex items-center justify-center gap-1.5 mb-6">
                  <MapPin size={16} className="text-secondary" /> {boutique.city.name}
                </p>
              )}
              <p className="text-neutral/90 text-lg md:text-xl font-light leading-relaxed mb-10">
                {boutique.description || "Découvrez l'élégance et le raffinement de notre collection exclusive."}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-10 py-6 border-y border-background">
                {/* Rating */}
                <div className="text-center group">
                  <div className="flex gap-1 justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(avgRating) ? 'fill-secondary text-secondary' : 'text-background fill-accent/20'}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral uppercase tracking-widest font-medium group-hover:text-text transition-colors">
                    {avgRating} ({reviews.length} avis)
                  </p>
                </div>

                {/* Followers */}
                <div className="text-center group">
                  <div className="flex items-center justify-center gap-2 text-3xl font-serif font-bold text-text mb-1">
                    <span>{followersCount}</span>
                  </div>
                  <p className="text-sm text-neutral uppercase tracking-widest font-medium group-hover:text-text transition-colors">
                    Abonnés
                  </p>
                </div>

                {/* Produits */}
                <div className="text-center group">
                  <div className="flex items-center justify-center gap-2 text-3xl font-serif font-bold text-text mb-1">
                    <span>{boutique.products?.length || 0}</span>
                  </div>
                  <p className="text-sm text-neutral uppercase tracking-widest font-medium group-hover:text-text transition-colors">
                    Créations
                  </p>
                </div>
              </div>

              {/* Actions & Contact */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
                
                <div className="flex flex-wrap justify-center gap-6 text-sm text-neutral font-medium">
                  {boutique.address && <span className="flex items-center gap-2 hover:text-text cursor-pointer transition-colors"><MapPin size={16} /> {boutique.address}</span>}
                  {boutique.phone && <span className="flex items-center gap-2 hover:text-text cursor-pointer transition-colors"><Phone size={16} /> {boutique.phone}</span>}
                  {boutique.email && <span className="flex items-center gap-2 hover:text-text cursor-pointer transition-colors"><Mail size={16} /> {boutique.email}</span>}
                  {boutique.website && (
                    <a href={boutique.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-text transition-colors">
                      <Globe size={16} /> Site officiel
                    </a>
                  )}
                </div>

                {/* Follow Button */}
                <div className="flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 w-full md:w-auto ${
                      following
                        ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        : 'bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-primary/30'
                    }`}
                  >
                    {followLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : following ? (
                      <UserCheck size={20} />
                    ) : (
                      <UserPlus size={20} />
                    )}
                    <span>{following ? 'Suivi' : 'Suivre'}</span>
                    {!followLoading && (
                      <span className={`text-sm font-normal px-2 py-0.5 rounded-lg ${
                        following ? 'bg-green-100 text-green-600' : 'bg-white/20 text-white'
                      }`}>
                        {followersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Products Section */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-4xl font-serif font-bold text-text">Dernières Créations</h2>
            <span className="text-neutral font-medium hidden sm:block">Explorez la collection</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {boutique.products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-accent/10 p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-serif font-bold text-text mb-10 text-center">Ce que nos clients disent</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl opacity-40 mb-4 block">✨</span>
              <p className="text-neutral text-lg">Soyez le premier à partager votre expérience client avec {boutique.name}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map(review => (
                <div key={review.id} className="bg-background/40 p-6 rounded-2xl border border-background hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center font-serif text-text font-bold">
                        {(review.user?.name || 'A')[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{review.user?.name || 'Client Anonyme'}</p>
                        <p className="text-xs text-neutral">{new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-secondary text-sm' : 'text-accent/30 text-sm'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-text font-light leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
