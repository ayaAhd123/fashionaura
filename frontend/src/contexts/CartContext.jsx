import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

const CART_KEY_PREFIX = 'fashionaura_cart';

// Chaque compte possède son propre panier. Les visiteurs non connectés
// partagent un panier « invité » distinct.
const cartKeyForUser = (user) =>
  user?.id ? `${CART_KEY_PREFIX}_user_${user.id}` : `${CART_KEY_PREFIX}_guest`;

const getStoredCart = (key) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = cartKeyForUser(user);

  const [cart, setCart] = useState(() => getStoredCart(storageKey));
  const [loading, setLoading] = useState(false);

  // Migration : supprime l'ancien panier global partagé entre tous les comptes.
  useEffect(() => {
    localStorage.removeItem(CART_KEY_PREFIX);
  }, []);

  // Clé réellement active pour la persistance (suit le compte courant)
  const activeKeyRef = useRef(storageKey);
  // Ignore la prochaine écriture lorsqu'on vient de charger un autre panier
  const skipPersistRef = useRef(false);

  // Changement de compte (connexion / déconnexion / nouveau compte) :
  // on charge le panier propre à ce compte.
  useEffect(() => {
    if (activeKeyRef.current === storageKey) return;
    activeKeyRef.current = storageKey;
    skipPersistRef.current = true;
    setCart(getStoredCart(storageKey));
  }, [storageKey]);

  // Persiste le panier dans la clé du compte courant uniquement.
  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    const key = activeKeyRef.current;
    if (cart) {
      localStorage.setItem(key, JSON.stringify(cart));
    } else {
      localStorage.removeItem(key);
    }
  }, [cart]);

  const addItem = useCallback((item) => {
    setCart(prevCart => {
      const items = prevCart?.items || [];
      const existingIndex = items.findIndex(
        i => i.product_id === item.product_id &&
             (i.product_variant_id === item.product_variant_id || (!i.product_variant_id && !item.product_variant_id))
      );
      if (existingIndex >= 0) {
        const updated = [...items];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + item.quantity };
        return { ...prevCart, items: updated };
      }
      // Ajouter un identifiant local unique
      const newItem = { ...item, localId: `${item.product_id}_${item.product_variant_id || 'default'}_${Date.now()}` };
      return { items: [...items, newItem] };
    });
  }, []);

  const removeItem = useCallback((localId) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(i => i.localId !== localId),
    }));
  }, []);

  const updateItem = useCallback((localId, quantity) => {
    if (quantity <= 0) {
      removeItem(localId);
      return;
    }
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(i =>
        i.localId === localId ? { ...i, quantity } : i
      ),
    }));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart, addItem, removeItem, updateItem, clearCart, loading, setLoading }}>
      {children}
    </CartContext.Provider>
  );
};
