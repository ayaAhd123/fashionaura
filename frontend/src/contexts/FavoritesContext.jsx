import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getFavorites, favoriteProduct, removeFavorite } from '../services/api';
import { getAuthToken } from '../lib/authStorage';

export const FavoritesContext = createContext();

const hasToken = () => !!getAuthToken();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Charger les favoris persistés à la connexion
  useEffect(() => {
    if (!hasToken()) return;
    getFavorites()
      .then(({ data }) => {
        const ids = (data || [])
          .map((f) => f.product_id ?? f.product?.id)
          .filter(Boolean);
        setFavorites(ids);
      })
      .catch(() => { /* utilisateur non connecté ou erreur : on garde l'état local */ });
  }, []);

  const addFavorite = useCallback((productId) => {
    setFavorites((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
    if (hasToken()) {
      favoriteProduct(productId).catch(() => {});
    }
  }, []);

  const removeFavoriteFn = useCallback((productId) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
    if (hasToken()) {
      removeFavorite(productId).catch(() => {});
    }
  }, []);

  const isFavorited = useCallback((productId) => favorites.includes(productId), [favorites]);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite: removeFavoriteFn, isFavorited }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
