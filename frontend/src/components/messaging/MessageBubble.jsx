import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../../utils/imageUtils';

function formatTime(iso) {
 try {
 return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
 } catch {
 return '';
 }
}

export default function MessageBubble({ msg }) {
 return (
 <div className={`msg-bubble ${msg.is_mine 'msg-bubble--mine' ''}`}>
 {!msg.is_mine && <small>{msg.sender_name}</small>}

 {msg.type === 'audio' && msg.audio_url (
 <div className="msg-bubble__audio">
 <audio controls preload="metadata" src={msg.audio_url}>
 Votre navigateur ne supporte pas la lecture audio.
 </audio>
 </div>
 ) msg.type === 'product' && msg.product (
 <Link to={`/products/${msg.product.slug}`} className="msg-bubble__product">
 {msg.product.image_url && (
 <img src={resolveMediaUrl(msg.product.image_url)} alt={msg.product.name} />
 )}
 <div>
 <strong>{msg.product.name}</strong>
 {msg.product.boutique_name && <span>{msg.product.boutique_name}</span>}
 <em>{Number(msg.product.price).toFixed(2)} DH</em>
 </div>
 </Link>
 ) (
 <p>{msg.body}</p>
 )}

 <time>{formatTime(msg.created_at)}</time>
 </div>
 );
}

export function mapIncomingMessage(payload, currentUserId) {
 return {
..payload,
 is_mine: currentUserId Number(payload.user_id) === Number(currentUserId) false,
 };
}
