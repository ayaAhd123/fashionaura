import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { boutiqueService } from '../services/boutiqueService';
import { BoutiqueCard } from '../components/BoutiqueCard';

export const BoutiquesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    rating: searchParams.get('rating') || '',
  });
  const [following, setFollowing] = useState({});

  useEffect(() => {
    fetchBoutiques();
  }, [filters, page]);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const data = await boutiqueService.getBoutiques({
        ...filters,
        page,
      });
      setBoutiques(data.data || data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleFollow = async (boutiqueId) => {
    const isNowFollowing = !following[boutiqueId];
    try {
      if (following[boutiqueId]) {
        await boutiqueService.unfollowBoutique(boutiqueId);
      } else {
        await boutiqueService.followBoutique(boutiqueId);
      }
      setFollowing({ ...following, [boutiqueId]: isNowFollowing });
    } catch (error) {
      // Si erreur API (ex: non authentifié) forcer le toggle visuel pour la démo
      setFollowing({ ...following, [boutiqueId]: isNowFollowing });
    }
  };

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header Premium */}
      <div className="bg-white border-b border-accent/20 mb-12">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text mb-6">Nos Boutiques Partenaires</h1>
          <p className="text-neutral text-lg max-w-2xl mx-auto font-light">
            Découvrez une sélection minutieuse des créateurs et artisans de mode marocaine les plus talentueux et élégants.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-accent/10 p-6 mb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une boutique..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-5 py-3 bg-background/50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-text"
              />
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-5 py-3 bg-background/50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-text appearance-none"
              >
                <option value="">Tous les ratings</option>
                <option value="5">Excellent (5 étoiles)</option>
                <option value="4">Très bien (4+ étoiles)</option>
                <option value="3">Bien (3+ étoiles)</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="relative">
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-5 py-3 bg-background/50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-text appearance-none"
              >
                <option value="">Toutes les villes</option>
                <option value="casablanca">Casablanca</option>
                <option value="fes">Fès</option>
                <option value="marrakech">Marrakech</option>
                <option value="rabat">Rabat</option>
                <option value="tanger">Tanger</option>
              </select>
            </div>
          </div>
        </div>

        {/* Boutiques Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {boutiques?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {boutiques.map(boutique => (
                  <BoutiqueCard
                    key={boutique.id}
                    boutique={boutique}
                    onFollow={handleFollow}
                    isFollowing={following[boutique.id] || false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-neutral">
                Aucune boutique trouvée pour ces critères.
              </div>
            )}

            {/* Pagination */}
            {boutiques?.length > 0 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-6 py-3 bg-white text-text rounded-xl disabled:opacity-40 shadow-sm border border-accent/20 hover:bg-background transition-colors font-medium"
                >
                  ← Précédent
                </button>
                <span className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20">
                  {page}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-6 py-3 bg-white text-text rounded-xl shadow-sm border border-accent/20 hover:bg-background transition-colors font-medium"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};
