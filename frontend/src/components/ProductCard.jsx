import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Eye } from 'lucide-react';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { CartContext } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import Image, { ImagePlaceholder } from './Image';

export const ProductCard = ({ product, onFavoriteToggle }) => {
  const { isFavorited, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const { addItem } = useContext(CartContext);
  const toast = useToast();
  const [added, setAdded] = useState(false);

  const liked = isFavorited(product.id);
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;
  const isOutOfStock = product.stock_quantity === 0;

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
    onFavoriteToggle?.(product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('Ce produit est en rupture de stock');
      return;
    }

    addItem({
      product_id: product.id,
      product_variant_id: null,
      quantity: 1,
      name: product.name,
      price: product.discount_price || product.price,
      image: product.images?.[0]?.image_url,
    });

    setAdded(true);
    toast.success(`"${product.name}" ajouté au panier ! 🛍️`);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-transparent hover:border-accent/20 hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-2">

      {/* Image Zone */}
      <Link to={`/products/${product.slug}`} className="block relative">
        <div className="relative h-56 bg-gradient-to-br from-background to-accent/10 overflow-hidden">
          {product.images?.[0]?.image_url ? (
            <Image
              src={product.images[0].image_url}
              alt={product.name}
              className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              objectFit="cover"
            />
          ) : (
            <ImagePlaceholder type="product" className="w-full h-full" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-text/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-heart text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md">
              -{discount}%
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-background text-text font-semibold px-4 py-2 rounded-lg text-sm shadow">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:scale-110 transition-all duration-200 z-10 hover:bg-background"
          >
            <Heart
              size={16}
              className={liked ? 'fill-heart text-heart' : 'text-neutral'}
            />
          </button>

          {/* See detail link — apparaît au hover */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="flex items-center gap-1 bg-primary/90 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <Eye size={12} /> Voir le détail
            </span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-5">
        <Link to={`/products/${product.slug}`} className="block flex-1">
          <h3 className="font-serif font-medium text-text text-base md:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-lg font-medium text-text">
              {product.discount_price
                ? `${product.discount_price} DH`
                : `${product.price} DH`}
            </span>
            {product.discount_price && (
              <span className="text-sm text-neutral/60 line-through font-light">{product.price} DH</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < Math.floor(product.rating || 0) ? 'text-secondary' : 'text-background'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-neutral/60 text-xs">({product.reviews_count || 0})</span>
          </div>
        </Link>

        {/* ✅ BOUTON AJOUTER AU PANIER */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium tracking-wide uppercase text-xs sm:text-sm transition-all duration-300 active:scale-95 border ${
            added
              ? 'bg-background text-text border-primary/20 shadow-sm'
              : isOutOfStock
              ? 'bg-background text-neutral/40 cursor-not-allowed border-transparent'
              : 'bg-primary border-primary text-white hover:bg-text hover:border-text shadow-md hover:shadow-xl shadow-primary/20'
          }`}
        >
          {added ? (
            <>
              <Check size={16} strokeWidth={3} />
              <span>Ajouté !</span>
            </>
          ) : isOutOfStock ? (
            <span>Rupture de stock</span>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>Ajouter au panier</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
