import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * useDashboardData — hook générique pour charger les données dashboard
 *
 * Ne jette JAMAIS d'exception non gérée : toute erreur API (401, 404, réseau)
 * est capturée et stockée dans `error`. Le composant reste affiché avec
 * ses données mock — il ne disparaît pas.
 */
export function useDashboardData(endpoint, params = {}, defaultValue = null) {
  const [data,    setData]    = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoint, { params });
      setData(response.data);
    } catch (err) {
      // On log mais on NE propage pas — le composant reste visible avec ses mocks
      console.warn(`[useDashboardData] ${endpoint} →`, err?.response?.status, err?.message);
      setError(err?.response?.data?.message || 'Endpoint non disponible');
      // On garde les données par défaut (mock) déjà dans le state
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(params)]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ─── Hooks spécialisés ────────────────────────────────────────────────────────
export const useAdminStats         = ()          => useDashboardData('/admin/dashboard/stats');
export const useAdminAnalytics     = (period='30days') => useDashboardData('/admin/dashboard/analytics', { period });
export const usePendingBoutiques   = ()          => useDashboardData('/admin/boutiques/pending', {}, []);
export const useBoutiqueStats      = ()          => useDashboardData('/boutique/dashboard/stats');
export const useBoutiqueCharts     = (period='30days') => useDashboardData('/boutique/dashboard/charts', { period });
export const useBoutiqueNotifications = ()       => useDashboardData('/boutique/notifications', {}, []);
export const useAIRecommendations  = ()          => useDashboardData('/boutique/ai-advisor/recommendations');