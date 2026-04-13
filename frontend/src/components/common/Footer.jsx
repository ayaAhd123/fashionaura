import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-text text-white py-16 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 font-light md:grid-cols-4 gap-12 lg:gap-8">
          {/* About */}
          <div className="md:col-span-1">
            <h3 className="flex items-baseline mb-4 text-white">
              <span className="text-3xl font-serif font-bold tracking-tight">Fashion</span>
              <span className="text-4xl font-script text-sage font-normal -ml-1">Aura</span>
            </h3>
            <p className="text-sm opacity-80 leading-relaxed font-light">
              L'essence du luxe marocain.<br/> 
              Découvrez la plus prestigieuse marketplace dédiée à la mode et à la création artisanale authentique.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold tracking-widest text-xs uppercase mb-6 text-secondary">Navigation</h4>
            <ul className="space-y-4 text-sm opacity-80">
              <li><a href="/boutiques" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Nos Boutiques</a></li>
              <li><a href="/products" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Les Créations</a></li>
              <li><a href="/favoris" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Coups de Coeur</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold tracking-widest text-xs uppercase mb-6 text-secondary">Service Client</h4>
            <ul className="space-y-4 text-sm opacity-80">
              <li><a href="#" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Nous contacter</a></li>
              <li><a href="#" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Questions fréquentes</a></li>
              <li><a href="#" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Retours & Livraisons</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold tracking-widest text-xs uppercase mb-6 text-secondary">La Maison</h4>
            <div className="flex flex-col gap-4 text-sm opacity-80">
              <a href="#" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Instagram</a>
              <a href="#" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Pinterest</a>
              <a href="#" className="hover:text-secondary hover:translate-x-1 inline-block transition-transform">Journal Officiel</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-60 font-light tracking-wide gap-4">
          <p>&copy; {new Date().getFullYear()} FashionAura. Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
