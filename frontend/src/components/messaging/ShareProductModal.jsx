import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, User, Store, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { searchUsers, getMyFollowing } from '../../services/api';
import AuthModal from '../AuthModal';

export default function ShareProductModal({ open, onClose, product }) {
 const navigate = useNavigate();
 const { isAuthenticated } = useAuth();
 const [tab, setTab] = useState('user');
 const [query, setQuery] = useState('');
 const [users, setUsers] = useState([]);
 const [boutiques, setBoutiques] = useState([]);
 const [loading, setLoading] = useState(false);
 const [authOpen, setAuthOpen] = useState(false);

 if (!open ||product) return null;

 const ensureAuth = () => {
 if (!isAuthenticated) {
 setAuthOpen(true);
 return false;
 }
 return true;
 };

 const goShare = (params) => {
 const qs = new URLSearchParams({..params, product: String(product.id) });
 navigate(`/compte/messagerie?${qs.toString()}`);
 onClose();
 toast.success('Ouvrez la conversation pour envoyer le produit.');
 };

 const searchFriends = async () => {
 if (!ensureAuth()) return;
 if (query.trim().length < 2) {
 toast.error('Saisissez au moins 2 caractères.');
 return;
 }
 setLoading(true);
 try {
 const { data } = await searchUsers(query.trim());
 setUsers(data?.data || []);
 } catch {
 toast.error('Recherche impossible');
 setUsers([]);
 } finally {
 setLoading(false);
 }
 };

 const loadBoutiques = async () => {
 if (!ensureAuth()) return;
 setLoading(true);
 try {
 const { data } = await getMyFollowing();
 setBoutiques(Array.isArray(data) data data?.data || []);
 } catch {
 setBoutiques([]);
 } finally {
 setLoading(false);
 }
 };

 const switchTab = (next) => {
 setTab(next);
 setQuery('');
 setUsers([]);
 if (next === 'boutique' && boutiques.length === 0) loadBoutiques();
 };

 return (
 <>
 <div className="share-modal__backdrop" onClick={onClose} />
 <div className="share-modal">
 <div className="share-modal__head">
 <h3>Partager cette pièce</h3>
 <button type="button" onClick={onClose}><X size={20} /></button>
 </div>

 <p className="share-modal__product">{product.name}</p>

 <div className="share-modal__tabs">
 <button type="button" className={tab === 'user' 'is-active' ''} onClick={() => switchTab('user')}>
 <User size={15} /> Un ami
 </button>
 <button type="button" className={tab === 'boutique' 'is-active' ''} onClick={() => switchTab('boutique')}>
 <Store size={15} /> Une boutique
 </button>
 </div>

 {tab === 'user' && (
 <div className="share-modal__body">
 <div className="share-modal__search">
 <Search size={16} />
 <input
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Nom ou email…"
 onKeyDown={(e) => e.key === 'Enter' && searchFriends()}
 />
 <button type="button" onClick={searchFriends} disabled={loading}>Chercher</button>
 </div>
 <ul className="share-modal__list">
 {users.map((u) => (
 <li key={u.id}>
 <button type="button" onClick={() => goShare({ user: String(u.id) })}>
 {u.name}
 <span>{u.email}</span>
 </button>
 </li>
 ))}
 </ul>
 </div>
 )}

 {tab === 'boutique' && (
 <div className="share-modal__body">
 <p className="share-modal__hint">Boutiques que vous suivez</p>
 <ul className="share-modal__list">
 {loading (
 <li className="share-modal__empty">Chargement…</li>
 ) boutiques.length === 0 (
 <li className="share-modal__empty">Suivez une boutique pour la contacter.</li>
 ) (
 boutiques.map((b) => (
 <li key={b.id}>
 <button
 type="button"
 onClick={() => goShare({ boutique: String(b.id) })}
 disabled={b.messages_enabled === false}
 >
 {b.name}
 {b.messages_enabled === false && <span>Messages désactivés</span>}
 </button>
 </li>
 ))
 )}
 </ul>
 </div>
 )}
 </div>

 <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} message="Connectez-vous pour partager" />
 </>
 );
}
