import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../AuthModal';
import { getPostComments, addPostComment } from '../../services/api';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function PostComments({ boutiqueId, postId, initialCount = 0 }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data } = await getPostComments(boutiqueId, postId);
      setComments(data?.data || []);
      setCount((data?.data || []).length);
    } catch {
      toast.error('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && comments.length === 0) loadComments();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    setSending(true);
    try {
      const { data } = await addPostComment(boutiqueId, postId, text);
      setComments((prev) => [...prev, data]);
      setCount((c) => c + 1);
      setInput('');
    } catch {
      toast.error('Commentaire non publié');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="feed-post__comments">
      <button type="button" className="feed-post__comments-toggle" onClick={toggle}>
        <MessageCircle size={15} />
        <span>{count} commentaire{count !== 1 ? 's' : ''}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="feed-post__comments-panel">
          {loading ? (
            <p className="feed-post__comments-empty">Chargement…</p>
          ) : comments.length === 0 ? (
            <p className="feed-post__comments-empty">Soyez le premier à commenter.</p>
          ) : (
            <ul className="feed-post__comments-list">
              {comments.map((c) => (
                <li key={c.id} className="feed-post__comment">
                  <strong>{c.user_name}</strong>
                  <span>{c.body}</span>
                  <time>{formatTime(c.created_at)}</time>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="feed-post__comments-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrire un commentaire…"
              maxLength={1000}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        message="Connectez-vous pour commenter"
      />
    </div>
  );
}
