import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { ORDER_STATUS_CFG } from '../../config/orderStatus';
import { getEcho } from '../../lib/echo';

export default function OrderStatusSelect({ orderId, status, onChange, updateFn, compact = false, listenRealtime = true }) {
  const cfg = ORDER_STATUS_CFG[status] || ORDER_STATUS_CFG.pending;

  useEffect(() => {
    if (!listenRealtime || !orderId) return undefined;

    const echo = getEcho();
    if (!echo) return undefined;

    const channel = echo.private(`order.${orderId}`);
    channel.listen('.OrderStatusUpdated', (payload) => {
      if (payload.status && payload.status !== status) {
        onChange?.(orderId, payload.status);
      }
    });

    return () => {
      echo.leave(`order.${orderId}`);
    };
  }, [orderId, status, onChange, listenRealtime]);

  const handleChange = async (e) => {
    e.stopPropagation?.();
    const next = e.target.value;
    if (next === status) return;

    try {
      if (updateFn) {
        await updateFn(orderId, next);
      }
      onChange?.(orderId, next);
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      style={{
        padding: compact ? '4px 8px' : '5px 10px',
        borderRadius: 20,
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
        fontFamily: 'Inter, Raleway, sans-serif',
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        cursor: 'pointer',
        outline: 'none',
        maxWidth: compact ? 130 : 150,
      }}
    >
      {Object.entries(ORDER_STATUS_CFG).map(([value, c]) => (
        <option key={value} value={value}>{c.label}</option>
      ))}
    </select>
  );
}
