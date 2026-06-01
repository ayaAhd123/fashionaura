export const ORDER_STATUS_CFG = {
  pending:    { label: 'En attente',  bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  confirmed:  { label: 'Confirmée',   bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  processing: { label: 'En cours',    bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  shipped:    { label: 'Expédiée',    bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  delivered:  { label: 'Livrée',      bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  cancelled:  { label: 'Annulée',     bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

/** Étapes affichées dans le suivi client (hors annulation). */
export const ORDER_TRACKING_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function getOrderStatusCfg(status) {
  return ORDER_STATUS_CFG[status] || ORDER_STATUS_CFG.pending;
}

export function getTrackingStepIndex(status) {
  if (status === 'cancelled') return -1;
  const idx = ORDER_TRACKING_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_CFG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));
