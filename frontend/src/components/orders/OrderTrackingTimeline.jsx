import {
  ORDER_TRACKING_STEPS,
  ORDER_STATUS_CFG,
  getTrackingStepIndex,
} from '../../config/orderStatus';
import '../../styles/order-tracking.css';

/**
 * Barre de suivi visuelle pour le client (En attente → Confirmée → … → Livrée).
 */
export default function OrderTrackingTimeline({ status, compact = false }) {
  if (status === 'cancelled') {
    return (
      <div className="order-tracking order-tracking--cancelled" role="status">
        <p className="order-tracking__cancelled-msg">Cette commande a été annulée.</p>
      </div>
    );
  }

  const currentIdx = getTrackingStepIndex(status);

  return (
    <div
      className={`order-tracking${compact ? ' order-tracking--compact' : ''}`}
      role="list"
      aria-label="Suivi de commande"
    >
      {ORDER_TRACKING_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const cfg = ORDER_STATUS_CFG[step];
        const isLast = i === ORDER_TRACKING_STEPS.length - 1;

        return (
          <div
            key={step}
            className={`order-tracking__step${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}
            role="listitem"
            aria-current={active ? 'step' : undefined}
          >
            <div className="order-tracking__node-wrap">
              <span className="order-tracking__node" aria-hidden="true">
                {done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className="order-tracking__label">{cfg.label}</span>
            </div>
            {!isLast && <span className={`order-tracking__line${i < currentIdx ? ' is-done' : ''}`} aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
