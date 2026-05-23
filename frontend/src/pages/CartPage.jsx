import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, ShoppingBag, Plus, Minus } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';

export const CartPage = () => {
  const { cart, removeItem, updateItem, clearCart } = useContext(CartContext);

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-32 h-32 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart size={56} className="text-primary/40" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-3">Votre panier est vide</h1>
            <p className="text-gray-500 mb-8">Découvrez nos boutiques et ajoutez vos articles préférés au panier.</p>
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          
          {/* Main Cart Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-10 flex items-center justify-between pb-6 border-b border-accent/20">
              <h1 className="text-4xl font-serif font-bold text-text flex items-center gap-4">
                Panier
                <span className="text-sm font-sans font-medium text-text bg-white px-3 py-1 rounded-full border border-accent/20">
                  {itemCount} {itemCount === 1 ? 'article' : 'articles'}
                </span>
              </h1>
              <button
                onClick={clearCart}
                className="text-sm text-neutral hover:text-heart transition-colors font-medium tracking-wide uppercase flex items-center gap-2"
              >
                <Trash2 size={16} /> Vider
              </button>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-6">
              {items.map(item => (
                <div
                  key={item.localId}
                  className="bg-white rounded-2xl p-4 flex gap-6 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-accent/10"
                >
                  {/* Product Image */}
                  <div className="w-32 h-40 bg-background/50 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-20"></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col py-1 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif font-bold text-text text-xl leading-snug pr-4">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.localId)}
                        className="text-neutral/40 hover:text-heart hover:bg-heart/5 p-2 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex gap-4 text-sm text-neutral font-medium mb-auto">
                      {item.size && <span className="">Taille: <span className="text-text">{item.size}</span></span>}
                      {item.color && <span className="">Couleur: <span className="text-text">{item.color}</span></span>}
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Controls */}
                      <div className="flex items-center border border-accent/40 rounded-xl overflow-hidden h-10 w-28 bg-white">
                        <button onClick={() => updateItem(item.localId, item.quantity - 1)} className="flex-1 h-full flex items-center justify-center hover:bg-background transition-colors text-neutral font-medium">−</button>
                        <span className="flex-1 text-center font-bold text-text text-sm">{item.quantity}</span>
                        <button onClick={() => updateItem(item.localId, item.quantity + 1)} className="flex-1 h-full flex items-center justify-center hover:bg-background transition-colors text-neutral font-medium">+</button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-serif font-bold text-xl text-text leading-none">
                          {(item.price * item.quantity).toFixed(2)} DH
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-neutral mt-1">{item.price} DH /u</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/boutiques" className="inline-flex items-center gap-2 text-text font-medium text-sm tracking-wide hover:underline mt-10">
              <ArrowLeft size={16} /> Poursuivre mes achats
            </Link>
          </div>

          {/* Checkout Box */}
          <div className="w-full md:w-96 flex-shrink-0">
            <div className="bg-white rounded-[2rem] shadow-sm border border-accent/10 p-8 sticky top-24">
              <h2 className="text-2xl font-serif font-bold text-text mb-8">Votre Commande</h2>

              <div className="space-y-4 mb-8">
                {items.map(item => (
                  <div key={item.localId} className="flex justify-between text-sm">
                    <span className="text-neutral font-medium truncate flex-1 pr-4">{item.name} <span className="text-text/50">x{item.quantity}</span></span>
                    <span className="font-semibold text-text">{(item.price * item.quantity).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-accent/20 mb-6" />

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral font-medium">Sous-total</span>
                  <span className="font-semibold text-text">{total.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral font-medium">Frais de livraison</span>
                  <span className="text-secondary font-bold uppercase tracking-wider text-xs bg-secondary/10 px-2 py-0.5 rounded-md">Offerts</span>
                </div>
              </div>

              <div className="h-px w-full bg-accent/20 mb-6" />

              <div className="flex justify-between items-end mb-10">
                <span className="font-serif font-bold text-xl text-text">Total</span>
                <div className="text-right">
                  <span className="font-serif font-bold text-3xl text-text">{total.toFixed(2)} DH</span>
                  <p className="text-xs text-neutral tracking-wider uppercase mt-1">TVA incluse</p>
                </div>
              </div>

              <button className="w-full bg-text text-white py-4 rounded-xl font-medium tracking-widest uppercase hover:bg-text/90 hover:shadow-lg shadow-md transition-all duration-300">
                Finaliser l'achat
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};
