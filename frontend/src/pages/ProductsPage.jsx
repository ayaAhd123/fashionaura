import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts({ search: search || undefined });
        setProducts(data.data || data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search]);

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="bg-white border-b border-accent/20 mb-12">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text mb-4">Nos Créations</h1>
          <p className="text-neutral max-w-xl mx-auto">
            Découvrez une sélection de pièces uniques des meilleures boutiques marocaines.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-neutral">Aucun produit trouvé.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
