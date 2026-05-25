import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

export const FavoritesPage = () => {
  const { favorites } = useContext(FavoritesContext);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchFavoriteProducts = async () => {
      try {
        setLoading(true);
        const filterData = await productService.getProducts({});
        const allProds = filterData.data || filterData;
        setProducts(allProds.filter((p) => favorites.includes(p.id)));
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, [favorites]);

  return (
    <main className="favorites-page min-h-screen bg-background">
      <div className="favorites-page__container">
        <header className="favorites-page__header">
          <div className="favorites-page__header-text">
            <h1 className="favorites-page__title">Mes Coups de Cœur</h1>
            <p className="favorites-page__subtitle">
              {favorites.length === 0
                ? "Votre liste d'envies est vide pour le moment."
                : 'Vos articles enregistrés'}
            </p>
          </div>
          {favorites.length > 0 && (
            <span className="favorites-page__count">
              {favorites.length} {favorites.length > 1 ? 'articles' : 'article'}
            </span>
          )}
        </header>

        {loading ? (
          <div className="favorites-page__loading">
            <div className="favorites-page__spinner" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="favorites-page__empty">
            <div className="favorites-page__empty-icon" aria-hidden>
              <Heart size={32} strokeWidth={1.5} />
            </div>
            <p className="favorites-page__empty-text">
              Explorez nos collections et enregistrez vos pièces préférées.
            </p>
            <Link to="/boutiques" className="favorites-page__empty-cta">
              Explorer les collections
            </Link>
          </div>
        ) : products.length === 0 ? (
          <p className="favorites-page__message">Aucun produit trouvé pour vos favoris.</p>
        ) : (
          <div className="favorites-page__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
