import React, { useContext } from 'react';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

export const FavoritesPage = () => {
  const { favorites, removeFavorite } = useContext(FavoritesContext);

  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (favorites.length === 0) {
      setLoading(false);
      return;
    }
    const fetchFavoriteProducts = async () => {
      try {
        setLoading(true);
        // Using getProducts to get all and filtering locally, since no direct endpoint exists in demo
        const filterData = await productService.getProducts({});
        const allProds = filterData.data || filterData;
        const favProds = allProds.filter(p => favorites.includes(p.id));
        setProducts(favProds);
      } catch (error) {
        console.error("Erreur chargement favoris:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavoriteProducts();
  }, [favorites]);

  if (favorites.length === 0) {
    return (
      <main className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <span className="text-4xl opacity-30 text-heart">♡</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-text mb-4">Mes Coups de Cœur</h1>
          <p className="text-neutral text-lg font-light mb-10">Votre liste d'envies est vide pour le moment. Explorez nos collections et enregistrez vos pièces préférées.</p>
          <a href="/boutiques" className="inline-block bg-primary text-white font-medium px-8 py-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all uppercase tracking-wider text-sm">
            Explorer les collections
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-end mb-12 border-b border-accent/20 pb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-text mb-2 tracking-tight">Mes Coups de Cœur</h1>
            <p className="text-neutral font-medium text-lg">Vos articles enregistrés</p>
          </div>
          <span className="bg-white px-4 py-2 rounded-full font-medium text-text text-sm shadow-sm border border-accent/10">
            {favorites.length} {favorites.length > 1 ? 'articles' : 'article'}
          </span>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
