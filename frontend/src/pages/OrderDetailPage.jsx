import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageCircle, Store } from 'lucide-react';
import { getOrder } from '../services/api';
import { getEcho } from '../lib/echo';
import OrderTrackingTimeline from '../components/orders/OrderTrackingTimeline';
import OrderChatModal from '../components/orders/OrderChatModal';
import { getOrderStatusCfg } from '../config/orderStatus';
import '../styles/account.css';
import '../styles/order-tracking.css';

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

function boutiqueFromItems(items = []) {
  const map = new Map();
  items.forEach((it) => {
    const b = it.product?.boutique;
    if (b?.id) map.set(b.id, b);
  });
  return [...map.values()];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getOrder(id)
      .then(({ data }) => { if (active) setOrder(data); })
      .catch(() => { if (active) setError('Commande introuvable ou accès refusé.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!order?.id) return undefined;
    const echo = getEcho();
    if (!echo) return undefined;

    const channelName = `order.${order.id}`;
    const channel = echo.private(channelName);
    channel.listen('.OrderStatusUpdated', (payload) => {
      if (!payload.status) return;
      setOrder((prev) => (prev ? { ...prev, status: payload.status } : prev));
    });

    return () => echo.leave(channelName);
  }, [order?.id]);

  if (loading) {
    return (
      <main className="account-page">
        <div className="account-page__container">
          <div className="account-card account-loading">Chargement du suivi…</div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="account-page">
        <div className="account-page__container">
          <Link to="/compte?tab=orders" className="order-detail__back">
            <ArrowLeft size={18} /> Mes commandes
          </Link>
          <div className="account-empty">
            <p className="account-empty__text">{error || 'Commande introuvable.'}</p>
            <Link to="/compte?tab=orders" className="account-btn">Retour aux commandes</Link>
          </div>
        </div>
      </main>
    );
  }

  const st = getOrderStatusCfg(order.status);
  const boutiques = boutiqueFromItems(order.items);

  return (
    <main className="account-page">
      <div className="account-page__container order-detail">
        <Link to="/compte?tab=orders" className="order-detail__back">
          <ArrowLeft size={18} /> Mes commandes
        </Link>

        <header className="order-detail__head">
          <div>
            <h1 className="order-detail__title">Commande #{order.id}</h1>
            <p className="order-detail__meta">Passée le {formatDate(order.created_at)}</p>
            {order.updated_at && order.updated_at !== order.created_at && (
              <p className="order-detail__meta">Dernière mise à jour : {formatDate(order.updated_at)}</p>
            )}
          </div>
          <span
            className="order-status"
            style={{ background: st.bg, color: st.color }}
          >
            {st.label}
          </span>
        </header>

        <section className="account-card order-detail__tracking">
          <h2 className="account-card__title">Suivi de livraison</h2>
          <OrderTrackingTimeline status={order.status} />
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <p className="order-detail__hint">
              Vous serez notifié à chaque changement de statut. Cette page se met à jour automatiquement.
            </p>
          )}
        </section>

        <div className="order-detail__grid">
          <section className="account-card">
            <h2 className="account-card__title">Livraison</h2>
            <div className="order-detail__info">
              <div className="order-detail__info-row">
                <MapPin size={16} aria-hidden="true" />
                <span>{order.address || '—'}</span>
              </div>
              <div className="order-detail__info-row">
                <Phone size={16} aria-hidden="true" />
                <span>{order.phone || '—'}</span>
              </div>
            </div>
          </section>

          {boutiques.length > 0 && (
            <section className="account-card">
              <h2 className="account-card__title">Boutique{boutiques.length > 1 ? 's' : ''}</h2>
              <ul className="order-detail__shops">
                {boutiques.map((b) => (
                  <li key={b.id}>
                    <Store size={15} aria-hidden="true" />
                    {b.slug ? (
                      <Link to={`/boutiques/${b.slug}`} className="account-link">{b.name}</Link>
                    ) : (
                      <span>{b.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section className="account-card">
          <h2 className="account-card__title">Articles commandés</h2>
          <ul className="order-card__items">
            {(order.items || []).map((it) => (
              <li key={it.id}>
                <span className="order-card__item-name">
                  {it.product?.slug ? (
                    <Link to={`/products/${it.product.slug}`} className="account-link">
                      {it.product.name}
                    </Link>
                  ) : (
                    it.product?.name || 'Article'
                  )}
                  <span className="order-card__qty"> × {it.quantity}</span>
                  {(it.size || it.color) && (
                    <span className="order-card__variant">
                      {[it.size, it.color].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </span>
                <span className="order-card__item-price">{Number(it.price).toFixed(2)} DH</span>
              </li>
            ))}
          </ul>
          <div className="order-card__foot">
            <span>Total</span>
            <strong>{Number(order.total).toFixed(2)} DH</strong>
          </div>
        </section>

        <div className="order-detail__actions">
          <button type="button" className="account-btn" onClick={() => setChatOpen(true)}>
            <MessageCircle size={16} style={{ marginRight: 6 }} />
            Contacter la boutique
          </button>
          <Link to="/compte/messagerie" className="account-btn account-btn--ghost">
            Ouvrir la messagerie
          </Link>
        </div>

        <OrderChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          orderId={order.id}
          orderLabel={`Commande #${order.id}`}
          counterpartName={boutiques[0]?.name || 'la boutique'}
        />
      </div>
    </main>
  );
}
