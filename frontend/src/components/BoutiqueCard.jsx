import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, Package } from 'lucide-react';
import Image, { ImagePlaceholder, Avatar } from './Image';

export const BoutiqueCard = ({ boutique, onFollow, isFollowing }) => {
  const handleFollow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFollow?.(boutique.id);
  };

  return (
    <Link to={`/boutiques/${boutique.slug}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-accent/10 hover:-translate-y-2">
        {/* Banner / Logo area */}
        <div className="h-48 bg-gradient-to-br from-primary/5 to-accent/10 overflow-hidden flex items-center justify-center relative">
          {boutique.logo ? (
            <Image
              src={boutique.logo}
              alt={boutique.name}
              className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
              objectFit="cover"
            />
          ) : (
            <Avatar
              name={boutique.name}
              size="xl"
              className="rounded-xl shadow-lg"
            />
          )}
          {/* Soft Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-text/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="font-serif font-bold text-xl text-text mb-2 group-hover:text-primary transition-colors line-clamp-1">{boutique.name}</h3>
          
          <div className="flex items-center justify-between mb-4">
            {boutique.city?.name && (
              <p className="text-sm text-neutral font-medium tracking-wide">
                📍 {boutique.city.name}
              </p>
            )}
            
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <Star size={14} className="fill-secondary text-secondary" />
              <span className="text-sm text-text font-medium">{boutique.rating || '5.0'}</span>
            </div>
          </div>

          <div className="h-px w-full bg-accent/20 mb-4" />

          {/* Stats row */}
          <div className="flex items-center justify-between mb-6 text-sm">
            <div className="flex items-center gap-2 text-neutral">
              <Users size={16} className="text-secondary" />
              <span>{boutique.followers_count || 0} abonnés</span>
            </div>
            <div className="flex items-center gap-2 text-neutral">
              <Package size={16} className="text-secondary" />
              <span>{boutique.products_count || 0} créations</span>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 ${
              isFollowing
                ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                : 'bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-primary/30'
            }`}
          >
            {isFollowing ? '✓ Suivi' : '+ Suivre'}
          </button>
        </div>
      </div>
    </Link>
  );
};
