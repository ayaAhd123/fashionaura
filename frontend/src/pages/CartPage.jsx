import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import CheckoutModal from '../components/CheckoutModal';

export const CartPage = () => {
  const { cart, removeItem, updateItem, clearCart } = useContext(CartContext);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSuccess = () => {
    clearCart();
  };

  if (items.length === 0 && !checkoutOpen) {
    return (
      <main className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-32 h-32 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart size={56} className="text-primary/40" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-3">Votre panier est vide</h1>
            <p className="text-gray-500 mb-8">
              Découvrez nos boutiques et ajoutez vos articles préférés au panier.
            </p>
            <Link
              to="/boutiques"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition shadow-lg"
            >
              <ShoppingBag size={20} />
              Découvrir les boutiques
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="cart-page__layout">
          <div className="cart-page__main">
            <div className="mb-10 flex items-center justify-between pb-6 border-b border-accent/20">
              <h1 className="text-4xl font-serif font-bold text-text flex items-center gap-4 flex-wrap">
                Panier
                <span className="text-sm font-sans font-medium text-text bg-white px-3 py-1 rounded-full border border-accent/20">
                  {itemCount} {itemCount === 1 ? 'article' : 'articles'}
                </span>
              </h1>
              <button
                type="button"
                onClick={clearCart}
                className="text-sm text-neutral hover:text-heart transition-colors font-medium tracking-wide uppercase flex items-center gap-2"
              >
                <Trash2 size={16} /> Vider
              </button>
            </div>

            <ul className="cart-page__list">
              {items.map((item) => (
                <li key={item.localId} className="cart-item-row">
                  <div className="cart-item-row__thumb">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-25" />
                    )}
                  </div>

                  <div className="cart-item-row__info">
                    <h3 className="cart-item-row__title">{item.name}</h3>
                    <div className="cart-item-row__meta">
                      {item.size && (
                        <span>
                          Taille: <span className="cart-item-row__meta-value">{item.size}</span>
                        </span>
                      )}
                      {item.color && (
                        <span>
                          Couleur: <span className="cart-item-row__meta-value">{item.color}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="cart-item-row__qty">
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

                  <div className="cart-item-row__price">
                    <p className="cart-item-row__price-total">
                      {(item.price * item.quantity).toFixed(2)} DH
                    </p>
                    {item.quantity > 1 && (
                      <p className="cart-item-row__price-unit">{item.price} DH /u</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.localId)}
                    className="cart-item-row__remove"
                    title="Retirer"
                    aria-label="Retirer du panier"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>

            <Link
              to="/boutiques"
              className="inline-flex items-center gap-2 text-text font-medium text-sm tracking-wide hover:underline mt-10"
            >
              <ArrowLeft size={16} /> Poursuivre mes achats
            </Link>
          </div>

          <aside className="cart-page__summary">
            <div className="cart-page__summary-panel">
              <h2 className="cart-summary__title">Votre Commande</h2>

              <div className="cart-summary__items">
                {items.map((item) => (
                  <div key={item.localId} className="cart-summary__item">
                    <p className="cart-summary__item-name">
                      <strong>{item.name}</strong>
                      <span className="cart-summary__item-qty"> × {item.quantity}</span>
                    </p>
                    <span className="cart-summary__item-price">
                      {(item.price * item.quantity).toFixed(2)} DH
                    </span>
                  </div>
                ))}
              </div>

              <div className="cart-summary__divider" />

              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span className="cart-summary__row-label">Sous-total</span>
                  <span className="cart-summary__row-value">{total.toFixed(2)} DH</span>
                </div>
                <div className="cart-summary__row">
                  <span className="cart-summary__row-label">Frais de livraison</span>
                  <span className="cart-summary__badge">Offerts</span>
                </div>
              </div>

              <div className="cart-summary__divider" />

              <div className="cart-summary__total-block">
                <span className="cart-summary__total-label">Total</span>
                <div className="cart-summary__total-right">
                  <span className="cart-summary__total-amount">{total.toFixed(2)} DH</span>
                  <p className="cart-summary__total-note">TVA incluse</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutOpen(true)}
                className="cart-checkout-btn"
              >
                Finaliser l&apos;achat
              </button>
            </div>
          </aside>
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </main>
  );
};
