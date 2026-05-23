import React, { createContext, useState, useCallback, useEffect } from 'react';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'fashionaura_cart';

const getStoredCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => getStoredCart());
  const [loading, setLoading] = useState(false);

  // Persister dans localStorage à chaque changement
  useEffect(() => {
    if (cart) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
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
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart, addItem, removeItem, updateItem, clearCart, loading, setLoading }}>
      {children}
    </CartContext.Provider>
  );
};

