import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-brown text-white mt-12">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sage-green to-dusty-blue flex items-center justify-center text-white font-bold text-sm">
                FA
              </div>
              <span className="font-bold text-xl">FashionAura</span>
            </div>
            <p className="text-light-ash/70 text-sm leading-relaxed">
              Découvrez la mode marocaine authentique et élégante. Connectez-vous avec les meilleures boutiques de mode du Maroc.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-sand-beige">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/boutiques" className="text-light-ash/70 hover:text-sage-green transition-colors">
                  Boutiques
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-light-ash/70 hover:text-sage-green transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link to="/promo" className="text-light-ash/70 hover:text-sage-green transition-colors">
                  Promotions
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-light-ash/70 hover:text-sage-green transition-colors">
                  À Propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold mb-4 text-sand-beige">Assistance</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-light-ash/70 hover:text-sage-green transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-light-ash/70 hover:text-sage-green transition-colors">
                  Nous Contacter
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-light-ash/70 hover:text-sage-green transition-colors">
                  Retours & Échanges
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-light-ash/70 hover:text-sage-green transition-colors">
                  Livraison
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold mb-4 text-sand-beige">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-sage-green mt-1 flex-shrink-0" />
                <div className="text-light-ash/70">+212 5 XX XX XX XX</div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-sage-green mt-1 flex-shrink-0" />
                <div className="text-light-ash/70">contact@fashionaura.ma</div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-sage-green mt-1 flex-shrink-0" />
                <div className="text-light-ash/70">Casablanca, Maroc</div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-light-ash/50 text-sm">
            &copy; {currentYear} FashionAura. Tous droits réservés.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-sage-green rounded-lg transition-colors text-light-ash/70 hover:text-white"
              title="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-sage-green rounded-lg transition-colors text-light-ash/70 hover:text-white"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-sage-green rounded-lg transition-colors text-light-ash/70 hover:text-white"
              title="Twitter"
            >
              <Twitter size={18} />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link to="/privacy" className="text-light-ash/50 hover:text-sage-green transition-colors">
              Confidentialité
            </Link>
            <span className="text-light-ash/30">•</span>
            <Link to="/terms" className="text-light-ash/50 hover:text-sage-green transition-colors">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
