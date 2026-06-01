import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, Search } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { FavoritesContext } from '../contexts/FavoritesContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items } = useContext(CartContext);
  const { favorites } = useContext(FavoritesContext);
  const navigate = useNavigate();

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = favorites.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-dusty-blue/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sage-green to-dusty-blue flex items-center justify-center text-white font-bold text-sm">
              FA
            </div>
            <span className="font-bold text-xl text-dark-brown group-hover:text-sage-green transition-colors">
              FashionAura
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 mx-8 gap-2"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher produits, boutiques..."
                className="w-full px-4 py-2.5 rounded-lg bg-light-ash border border-dusty-blue/30 text-dark-brown placeholder-olive-gray/50 focus:outline-none focus:border-sage-green focus:ring-1 focus:ring-sage-green"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-gray/50" size={18} />
            </div>
          </form>

          {/* Right Navigation */}
          <div className="flex items-center gap-3">
            {/* Favorites */}
            <Link
              to="/favoris"
              className="relative p-2 hover:bg-light-ash rounded-lg transition-colors group"
            >
              <Heart size={20} className="text-olive-gray group-hover:text-coral-heart transition-colors" />
              {favoritesCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-coral-heart text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/panier"
              className="relative p-2 hover:bg-light-ash rounded-lg transition-colors group"
            >
              <ShoppingCart size={20} className="text-olive-gray group-hover:text-sage-green transition-colors" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-sage-green text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-light-ash rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X size={20} className="text-olive-gray" />
              ) : (
                <Menu size={20} className="text-olive-gray" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row gap-1 md:gap-6">
            <Link
              to="/boutiques"
              className="px-4 py-2 text-dark-brown hover:text-sage-green hover:bg-light-ash rounded-lg transition-colors font-medium"
            >
              Boutiques
            </Link>
            <Link
              to="/categories"
              className="px-4 py-2 text-dark-brown hover:text-sage-green hover:bg-light-ash rounded-lg transition-colors font-medium"
            >
              Catégories
            </Link>
            <Link
              to="/promo"
              className="px-4 py-2 text-dark-brown hover:text-sage-green hover:bg-light-ash rounded-lg transition-colors font-medium"
            >
              Promotions
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 text-dark-brown hover:text-sage-green hover:bg-light-ash rounded-lg transition-colors font-medium"
            >
              À Propos
            </Link>
          </div>
        </nav>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 px-4 py-2 rounded-lg bg-light-ash border border-dusty-blue/30 text-dark-brown placeholder-olive-gray/50 focus:outline-none focus:border-sage-green"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sage-green text-white rounded-lg hover:bg-sage-green/90 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
