import { Link } from 'react-router-dom';
import { Lock, Tag } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/imageUtils';
import PostComments from '../posts/PostComments';

export default function OfferPostCard({
  post,
  boutiqueId,
  onFollow,
  showLockButton = true,
}) {
  return (
    <article className={`feed-post ${post.is_locked ? 'feed-post--locked' : ''}`}>
      <div className="feed-post__media">
        {post.image_url && (
          <img src={resolveMediaUrl(post.image_url)} alt="" className="feed-post__img" />
        )}
        {post.is_exclusive && (
          <span className="feed-post__exclusive"><Tag size={12} /> Exclusif abonnés</span>
        )}
        {post.is_locked && (
          <div className="feed-post__lock">
            <Lock size={22} />
            <p>Offre réservée aux abonnés</p>
            {showLockButton && (
              <button type="button" className="feed-post__lock-btn" onClick={onFollow}>
                Suivre pour débloquer
              </button>
            )}
          </div>
        )}
      </div>
      {!post.is_locked && (
        <div className="feed-post__body">
          {post.caption && <p className="feed-post__caption">{post.caption}</p>}
          {post.promo_text && (
            <p className="feed-post__promo">
              <Tag size={13} /> {post.promo_text}
              {post.promo_code && <code className="feed-post__code">{post.promo_code}</code>}
            </p>
          )}
          {post.product && (
            <Link to={`/products/${post.product.slug}`} className="feed-post__product">
              Voir « {post.product.name} » →
            </Link>
          )}
          <PostComments
            boutiqueId={boutiqueId}
            postId={post.id}
            initialCount={post.comments_count || 0}
          />
          <span className="feed-post__time">{post.created_at}</span>
        </div>
      )}
    </article>
  );
}
