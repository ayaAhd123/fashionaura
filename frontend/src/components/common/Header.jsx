import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { CartContext } from '../../contexts/CartContext';
import { FavoritesContext } from '../../contexts/FavoritesContext';

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const { favorites } = useContext(FavoritesContext);

  const cartCount = cart?.items?.length || 0;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-accent/20 sticky top-0 z-50 transition-all duration-300">
      <nav className="container mx-auto px-4 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-baseline hover:opacity-80 transition-opacity">
          <span className="text-3xl font-serif font-bold text-text tracking-tight">Fashion</span>
          <span className="text-4xl font-script text-sage font-normal -ml-1">Aura</span>
        </Link>

        {/* Menu Desktop */}
        <ul className="hidden md:flex gap-10 items-center">
          <li><Link to="/boutiques" className="text-sm font-medium tracking-widest uppercase text-neutral hover:text-text transition-colors">Boutiques</Link></li>
          <li><Link to="/products" className="text-sm font-medium tracking-widest uppercase text-neutral hover:text-text transition-colors">Produits</Link></li>
          <li><Link to="/favoris" className="text-sm font-medium tracking-widest uppercase text-neutral hover:text-text transition-colors">Favoris</Link></li>
        </ul>

        {/* Actions */}
        <div className="flex gap-6 items-center">
          {/* Menu Mobile Toggle */}
          <button className="md:hidden text-text p-1 hover:bg-background rounded-full transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Favoris */}
          <Link to="/favoris" className="relative text-neutral hover:text-text transition-colors group p-1">
            <Heart size={22} className="group-hover:fill-heart/20" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-background border border-background text-text text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Panier */}
          <Link to="/panier" className="relative text-neutral hover:text-text transition-colors group p-1">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-text text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-accent/20 absolute w-full shadow-lg">
          <ul className="flex flex-col py-6 px-4 gap-6">
            <li><Link to="/boutiques" onClick={() => setMenuOpen(false)} className="block text-center text-lg font-serif tracking-widest text-text">BOUTIQUES</Link></li>
            <li><Link to="/products" onClick={() => setMenuOpen(false)} className="block text-center text-lg font-serif tracking-widest text-text">PRODUITS</Link></li>
            <li><Link to="/favoris" onClick={() => setMenuOpen(false)} className="block text-center text-lg font-serif tracking-widest text-text">FAVORIS</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
};
