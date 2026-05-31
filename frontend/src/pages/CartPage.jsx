import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Shirt, X, RotateCcw } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/api';
import CheckoutModal from '../components/CheckoutModal';
import AuthModal from '../components/AuthModal';

export const CartPage = () => {
  const { cart, removeItem, updateItem, clearCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promo.trim()) return;
    setPromoMsg(`Code « ${promo.trim().toUpperCase()} » enregistré — il sera validé au paiement.`);
  };

  const handleCheckoutSuccess = async (form) => {
    await createOrder({
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        size: i.size || null,
        color: i.color || null,
      })),
      address: form.address,
      phone: form.phone,
    });
    clearCart();
  };

  const handleFinalize = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    setCheckoutOpen(true);
  };

  const buildMeta = (item) =>
    [item.size, item.color, `× ${item.quantity}`].filter(Boolean).join(' / ');

  if (items.length === 0 && !checkoutOpen) {
    return (
      <main className="cart-page">
        <div className="cart-wrap">
          <Link to="/boutiques" className="cart-back">
            <ArrowLeft size={15} /> Retour
          </Link>
          <h1 className="cart-heading">Votre panier</h1>
          <div className="cart-empty">
            <div className="cart-empty__icon" aria-hidden="true">
              <ShoppingBag size={42} strokeWidth={1.4} />
            </div>
            <p className="cart-empty__text">Votre panier est vide pour le moment.</p>
            <Link to="/boutiques" className="cart-empty__cta">
              <ShoppingBag size={18} /> Découvrir les boutiques
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-wrap">
        <Link to="/boutiques" className="cart-back">
          <ArrowLeft size={15} /> Retour
        </Link>
        <h1 className="cart-heading">Votre panier</h1>

        <div className="cart-grid">
          {/* ── Articles ─────────────────────────────────────────── */}
          <section className="cart-items">
            <ul className="cart-lines">
              {items.map((item) => (
                <li key={item.localId} className="cart-line">
                  <button
                    type="button"
                    className="cart-line__remove"
                    onClick={() => removeItem(item.localId)}
                    aria-label="Retirer l'article"
                  >
                    <X size={16} />
                  </button>

                  <div className="cart-line__thumb">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span className="cart-line__thumb-ph" aria-hidden="true">
                        <Shirt size={22} strokeWidth={1.5} />
                      </span>
                    )}
                  </div>

                  <div className="cart-line__info">
                    <h3 className="cart-line__name">{item.name}</h3>
                    <p className="cart-line__meta">{buildMeta(item)}</p>
                  </div>

                  <div className="cart-line__qty">
                    <button
                      type="button"
                      onClick={() => updateItem(item.localId, item.quantity - 1)}
                      aria-label="Diminuer la quantité"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItem(item.localId, item.quantity + 1)}
                      aria-label="Augmenter la quantité"
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-line__price">
                    <span className="cart-line__price-now">
                      {(item.price * item.quantity).toFixed(2)} DH
                    </span>
                    {item.quantity > 1 && (
                      <span className="cart-line__price-unit">{item.price} DH /u</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <p className="cart-coupon__label">Vous avez un code promo ? Entrez-le ci-dessous.</p>
            <form className="cart-coupon" onSubmit={handleApplyPromo}>
              <input
                type="text"
                className="cart-coupon__input"
                placeholder="Code promo"
                value={promo}
                onChange={(e) => { setPromo(e.target.value); setPromoMsg(''); }}
                aria-label="Code promo"
              />
              <button type="submit" className="cart-coupon__apply">Appliquer</button>
              <button type="button" className="cart-coupon__update" onClick={clearCart}>
                <RotateCcw size={14} /> Vider le panier
              </button>
            </form>
            {promoMsg && <p className="cart-coupon__msg">{promoMsg}</p>}
          </section>

          {/* ── Totaux ───────────────────────────────────────────── */}
          <aside className="cart-totals">
            <h2 className="cart-totals__title">Totaux du panier</h2>

            <div className="cart-totals__rows">
              <div className="cart-totals__row">
                <span className="cart-totals__lbl">Livraison (3-5 jours)</span>
                <span className="cart-totals__val cart-totals__free">Offerte</span>
              </div>
              <div className="cart-totals__row">
                <span className="cart-totals__lbl">TVA (incluse)</span>
                <span className="cart-totals__val">0 DH</span>
              </div>
              <div className="cart-totals__row">
                <span className="cart-totals__lbl">Sous-total ({itemCount})</span>
                <span className="cart-totals__val">{total.toFixed(2)} DH</span>
              </div>
            </div>

            <div className="cart-totals__rule" />

            <div className="cart-totals__grand">
              <span>Total</span>
              <strong>{total.toFixed(2)} DH</strong>
            </div>

            <button type="button" className="cart-checkout-btn" onClick={handleFinalize}>
              Passer la commande
            </button>
            {!isAuthenticated && (
              <p className="cart-checkout-note">
                Connexion requise pour finaliser et suivre votre commande.
              </p>
            )}

            <Link to="/boutiques" className="cart-continue">
              <ArrowLeft size={14} /> Continuer mes achats
            </Link>
          </aside>
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        message="Connectez-vous pour finaliser votre achat et suivre votre commande."
      />
    </main>
  );
};
