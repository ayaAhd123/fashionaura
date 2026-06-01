import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, Lock, Heart, Store, Package, ShoppingBag,
  Trash2, ChevronRight, MapPin, Bell, MessageCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import {
  updateProfile, updatePassword,
  getMyOrders, getFavorites, removeFavorite,
  getMyFollowing, unfollowBoutique,
  getMyNotifications, markNotificationRead, deleteNotification,
} from '../services/api';
import OrderChatModal from '../components/orders/OrderChatModal';
import OrderTrackingTimeline from '../components/orders/OrderTrackingTimeline';
import { getEcho } from '../lib/echo';
import '../styles/account.css';

const ORDER_STATUS = {
  pending: { label: 'En attente', cls: 'is-pending' },
  confirmed: { label: 'Confirmée', cls: 'is-confirmed' },
  processing: { label: 'En préparation', cls: 'is-confirmed' },
  shipped: { label: 'Expédiée', cls: 'is-shipped' },
  delivered: { label: 'Livrée', cls: 'is-delivered' },
  cancelled: { label: 'Annulée', cls: 'is-cancelled' },
};

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'password', label: 'Mot de passe', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'orders', label: 'Mes commandes', icon: Package },
  { id: 'messages', label: 'Messagerie', icon: MessageCircle, href: '/compte/messagerie' },
  { id: 'favorites', label: 'Favoris', icon: Heart },
  { id: 'following', label: 'Magasins suivis', icon: Store },
  { id: 'cart', label: 'Mon panier', icon: ShoppingBag },
];

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return ''; }
};

export const AccountPage = () => {
  const { user, token, setSession, logout } = useAuth();
  const { cart } = useContext(CartContext);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('cart');
  const navigate = useNavigate();

  useEffect(() => {
    const requested = searchParams.get('tab');
    if (requested && TABS.some((t) => t.id === requested && !t.href)) {
      setTab(requested);
    }
  }, [searchParams]);

  return (
    <main className="account-page">
      <div className="account-page__container">
        <header className="account-page__header">
          <div>
            <h1 className="account-page__title">Mon compte</h1>
            <p className="account-page__subtitle">Bonjour {user?.name?.split(' ')[0] || ''}, gérez vos informations et votre activité.</p>
          </div>
          <button type="button" className="account-page__logout" onClick={logout}>
            Se déconnecter
          </button>
        </header>

        <div className="account-layout">
          <nav className="account-nav">
            {TABS.map(({ id, label, icon: Icon, href }) => (
              <button
                key={id}
                type="button"
                className={`account-nav__item${tab === id ? ' is-active' : ''}`}
                onClick={() => (href ? navigate(href) : setTab(id))}
              >
                <Icon size={18} />
                <span>{label}</span>
                <ChevronRight size={16} className="account-nav__chev" />
              </button>
            ))}
          </nav>

          <section className="account-content">
            {tab === 'profile' && <ProfileTab user={user} token={token} setSession={setSession} />}
            {tab === 'password' && <PasswordTab />}
            {tab === 'notifications' && <NotificationsTab />}
            {tab === 'orders' && <OrdersTab />}
            {tab === 'favorites' && <FavoritesTab />}
            {tab === 'following' && <FollowingTab />}
            {tab === 'cart' && <CartTab cart={cart} />}
          </section>
        </div>
      </div>
    </main>
  );
};

/* ───────────────────────── Profil ───────────────────────── */
function ProfileTab({ user, token, setSession }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const { data } = await updateProfile(form);
      setSession(data.user, token);
      toast.success('Profil mis à jour');
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="account-card" onSubmit={submit}>
      <h2 className="account-card__title">Informations personnelles</h2>
      <div className="account-field">
        <label>Nom complet</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <span className="account-field__error">{errors.name[0]}</span>}
      </div>
      <div className="account-field">
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <span className="account-field__error">{errors.email[0]}</span>}
      </div>
      <div className="account-field">
        <label>Téléphone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 6XX XXX XXX" />
        {errors.phone && <span className="account-field__error">{errors.phone[0]}</span>}
      </div>
      <button type="submit" className="account-btn" disabled={saving}>
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}

/* ───────────────────────── Mot de passe ───────────────────────── */
function PasswordTab() {
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await updatePassword(form);
      setForm({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Mot de passe modifié');
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="account-card" onSubmit={submit}>
      <h2 className="account-card__title">Changer le mot de passe</h2>
      <div className="account-field">
        <label>Mot de passe actuel</label>
        <input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} />
        {errors.current_password && <span className="account-field__error">{errors.current_password[0]}</span>}
      </div>
      <div className="account-field">
        <label>Nouveau mot de passe</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {errors.password && <span className="account-field__error">{errors.password[0]}</span>}
      </div>
      <div className="account-field">
        <label>Confirmer le nouveau mot de passe</label>
        <input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
      </div>
      <button type="submit" className="account-btn" disabled={saving}>
        {saving ? 'Modification...' : 'Modifier le mot de passe'}
      </button>
    </form>
  );
}

/* ───────────────────────── Commandes ───────────────────────── */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOrder, setChatOrder] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const echo = getEcho();
    if (!echo || orders.length === 0) return undefined;

    const channels = orders.map((order) => {
      const channel = echo.private(`order.${order.id}`);
      channel.listen('.OrderStatusUpdated', (payload) => {
        if (!payload.status) return;
        setOrders((prev) =>
          prev.map((o) => (o.id === payload.order_id ? { ...o, status: payload.status } : o))
        );
      });
      return `order.${order.id}`;
    });

    return () => {
      channels.forEach((name) => echo.leave(name));
    };
  }, [orders.length]);

  if (loading) return <div className="account-card account-loading">Chargement…</div>;

  if (orders.length === 0) {
    return (
      <EmptyState icon={Package} text="Vous n'avez pas encore passé de commande.">
        <Link to="/boutiques" className="account-btn">Découvrir les boutiques</Link>
      </EmptyState>
    );
  }

  return (
    <div className="account-orders">
      <p className="account-orders__intro">
        Suivez l&apos;avancement de vos commandes en temps réel.
      </p>
      {orders.map((order) => {
        const st = ORDER_STATUS[order.status] || { label: order.status, cls: 'is-pending' };
        return (
          <div key={order.id} className="order-card">
            <div className="order-card__head">
              <div>
                <span className="order-card__id">Commande #{order.id}</span>
                <span className="order-card__date">{formatDate(order.created_at)}</span>
              </div>
              <span className={`order-status ${st.cls}`}>{st.label}</span>
            </div>

            {order.status !== 'cancelled' && (
              <div className="order-card__tracking">
                <OrderTrackingTimeline status={order.status} compact />
              </div>
            )}

            <ul className="order-card__items">
              {(order.items || []).map((it) => (
                <li key={it.id}>
                  <span className="order-card__item-name">
                    {it.product?.name || 'Article'} <span className="order-card__qty">× {it.quantity}</span>
                  </span>
                  <span className="order-card__item-price">{Number(it.price).toFixed(2)} DH</span>
                </li>
              ))}
            </ul>
            <div className="order-card__foot">
              <span>Total</span>
              <strong>{Number(order.total).toFixed(2)} DH</strong>
            </div>
            <div className="order-card__actions">
              <Link to={`/compte/commandes/${order.id}`} className="account-btn">
                Voir le suivi détaillé
              </Link>
              <button
                type="button"
                className="account-btn account-btn--ghost"
                onClick={() => setChatOrder(order)}
              >
                Contacter la boutique
              </button>
            </div>
          </div>
        );
      })}
      <OrderChatModal
        open={!!chatOrder}
        onClose={() => setChatOrder(null)}
        orderId={chatOrder?.id}
        orderLabel={chatOrder ? `Commande #${chatOrder.id}` : ''}
        counterpartName="la boutique"
      />
    </div>
  );
}

/* ───────────────────────── Favoris ───────────────────────── */
function FavoritesTab() {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then(({ data }) => setFavs(data))
      .catch(() => setFavs([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId) => {
    try {
      await removeFavorite(productId);
      setFavs((prev) => prev.filter((f) => (f.product?.id || f.product_id) !== productId));
      toast.success('Retiré des favoris');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <div className="account-card account-loading">Chargement…</div>;

  if (favs.length === 0) {
    return (
      <EmptyState icon={Heart} text="Votre liste de favoris est vide.">
        <Link to="/products" className="account-btn">Explorer les créations</Link>
      </EmptyState>
    );
  }

  return (
    <div className="account-list">
      {favs.map((f) => {
        const p = f.product || f;
        const price = p.discount_price ?? p.price;
        return (
          <div key={f.id || p.id} className="account-list__row">
            <div className="account-list__main">
              <span className="account-list__name">{p.name}</span>
              {price != null && <span className="account-list__sub">{Number(price).toFixed(2)} DH</span>}
            </div>
            <div className="account-list__actions">
              {p.slug && <Link to={`/products/${p.slug}`} className="account-link">Voir</Link>}
              <button type="button" className="account-icon-btn" onClick={() => remove(p.id)} title="Retirer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Boutiques suivies ───────────────────────── */
function FollowingTab() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyFollowing()
      .then(({ data }) => setShops(data))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, []);

  const unfollow = async (id) => {
    try {
      await unfollowBoutique(id);
      setShops((prev) => prev.filter((s) => s.id !== id));
      toast.success('Vous ne suivez plus cette boutique');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <div className="account-card account-loading">Chargement…</div>;

  if (shops.length === 0) {
    return (
      <EmptyState icon={Store} text="Vous ne suivez aucune boutique pour le moment.">
        <Link to="/boutiques" className="account-btn">Parcourir les boutiques</Link>
      </EmptyState>
    );
  }

  return (
    <div className="account-list">
      {shops.map((s) => (
        <div key={s.id} className="account-list__row">
          <div className="account-list__shop">
            {s.logo
              ? <img src={s.logo} alt={s.name} className="account-list__logo" />
              : <span className="account-list__logo account-list__logo--ph"><Store size={18} /></span>}
            <div className="account-list__main">
              <span className="account-list__name">{s.name}</span>
              <span className="account-list__sub">{s.products_count ?? 0} produits · {s.followers_count ?? 0} abonnés</span>
            </div>
          </div>
          <div className="account-list__actions">
            {s.slug && <Link to={`/boutiques/${s.slug}`} className="account-link">Visiter</Link>}
            <button type="button" className="account-btn account-btn--ghost" onClick={() => unfollow(s.id)}>
              Ne plus suivre
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Notifications ───────────────────────── */
const NOTIF_ICON = {
  new_product: 'N',
  new_post: 'S',
  back_in_stock: '!',
  default: 'N',
};

function NotificationsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyNotifications()
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await markNotificationRead(id); } catch { /* silencieux */ }
  };

  const remove = async (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    try { await deleteNotification(id); } catch { /* silencieux */ }
  };

  if (loading) return <div className="account-card account-loading">Chargement…</div>;

  if (items.length === 0) {
    return (
      <EmptyState icon={Bell} text="Aucune notification pour l'instant. Suivez des boutiques pour être alerté de leurs nouveautés et offres.">
        <Link to="/boutiques" className="account-btn">Découvrir les boutiques</Link>
      </EmptyState>
    );
  }

  return (
    <div className="account-list">
      {items.map((n) => (
        <div key={n.id} className={`account-list__row${n.read ? '' : ' account-notif--unread'}`}>
          <div className="account-list__shop">
            <span className="account-list__logo account-list__logo--ph" aria-hidden="true">
              {NOTIF_ICON[n.type] || NOTIF_ICON.default}
            </span>
            <div className="account-list__main">
              <span className="account-list__name">
                {!n.read && <span className="account-notif__dot" aria-hidden="true" />}
                {n.title}
              </span>
              <span className="account-list__sub">{n.message}</span>
              <span className="account-list__sub" style={{ opacity: 0.7 }}>{n.time}</span>
            </div>
          </div>
          <div className="account-list__actions">
            {n.action_url && (
              <Link to={n.action_url} className="account-link" onClick={() => markRead(n.id)}>Voir</Link>
            )}
            {!n.read && (
              <button type="button" className="account-btn account-btn--ghost" onClick={() => markRead(n.id)}>
                Marquer lu
              </button>
            )}
            <button type="button" className="account-icon-btn" onClick={() => remove(n.id)} title="Supprimer">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Panier ───────────────────────── */
function CartTab({ cart }) {
  const items = cart?.items || [];
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <EmptyState icon={ShoppingBag} text="Votre panier est vide.">
        <Link to="/boutiques" className="account-btn">Faire des achats</Link>
      </EmptyState>
    );
  }

  return (
    <div className="account-card">
      <h2 className="account-card__title">Mon panier ({items.length})</h2>
      <ul className="order-card__items">
        {items.map((i) => (
          <li key={i.localId}>
            <span className="order-card__item-name">
              {i.name} <span className="order-card__qty">× {i.quantity}</span>
            </span>
            <span className="order-card__item-price">{(i.price * i.quantity).toFixed(2)} DH</span>
          </li>
        ))}
      </ul>
      <div className="order-card__foot">
        <span>Total</span>
        <strong>{total.toFixed(2)} DH</strong>
      </div>
      <Link to="/panier" className="account-btn" style={{ marginTop: 16 }}>
        <MapPin size={16} style={{ marginRight: 6 }} /> Finaliser ma commande
      </Link>
    </div>
  );
}

function EmptyState({ icon: Icon, text, children }) {
  return (
    <div className="account-empty">
      <span className="account-empty__icon"><Icon size={30} strokeWidth={1.5} /></span>
      <p className="account-empty__text">{text}</p>
      {children}
    </div>
  );
}

export default AccountPage;
