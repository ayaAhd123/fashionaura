import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { getMyPosts, createPost, updatePost, deletePost } from '../../services/api';
import { resolveMediaUrl } from '../../utils/imageUtils';

const GOLD = '#C9A84C';
const DARK = '#1B3A35';

const lbl = { display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontFamily: 'Inter, sans-serif', fontSize: 13.5, boxSizing: 'border-box' };
const badge = (bg, color) => ({ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', backgroundColor: bg, color });

const EMPTY = { caption: '', product_id: '', promo_code: '', promo_text: '', is_exclusive: false, is_published: true };

function PostModal({ post, products, onClose, onSaved }) {
  const [form, setForm] = useState(post ? {
    caption: post.caption || '',
    product_id: post.product_id || '',
    promo_code: post.promo_code || '',
    promo_text: post.promo_text || '',
    is_exclusive: !!post.is_exclusive,
    is_published: post.is_published !== false,
  } : { ...EMPTY });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(post?.image_url ? resolveMediaUrl(post.image_url) : null);
  const [saving, setSaving] = useState(false);
  const isEdit = !!post;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!isEdit && !file) { toast.error('Une image est requise'); return; }
    if (!form.caption.trim() && !form.promo_text.trim()) { toast.error('Ajoutez une légende ou une offre'); return; }
    if (!form.is_exclusive && !form.promo_text.trim() && !form.promo_code.trim()) {
      toast.error('Pour une offre publique, renseignez le détail ou le code promo');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      fd.append('caption', form.caption || '');
      if (form.product_id) fd.append('product_id', form.product_id);
      fd.append('promo_code', form.promo_code || '');
      fd.append('promo_text', form.promo_text || '');
      fd.append('is_exclusive', form.is_exclusive ? '1' : '0');
      fd.append('is_published', form.is_published ? '1' : '0');

      if (isEdit) {
        await updatePost(post.id, fd);
        toast.success('Publication mise à jour');
      } else {
        await createPost(fd);
        toast.success('Publication créée — vos abonnés sont notifiés');
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 540, maxHeight: '92vh', backgroundColor: '#fff', borderRadius: 20, zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>{isEdit ? 'Modifier' : 'Nouvelle'} offre</p>
          <button onClick={onClose} style={{ border: 'none', background: '#F3F4F6', borderRadius: 8, width: 30, height: 30, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Image *</label>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: 12, background: '#F3F4F6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 11, color: '#9CA3AF' }}>Aperçu</span>}
              </div>
              <input type="file" accept="image/*" onChange={onFile} style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5 }} />
            </div>
          </div>
          <div>
            <label style={lbl}>Légende</label>
            <textarea value={form.caption} onChange={(e) => set('caption', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} placeholder="Racontez votre actualité, votre nouvelle collection…" />
          </div>
          <div>
            <label style={lbl}>Produit lié (optionnel)</label>
            <select value={form.product_id} onChange={(e) => set('product_id', e.target.value)} style={inp}>
              <option value="">Aucun</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Code promo (optionnel)</label>
              <input value={form.promo_code} onChange={(e) => set('promo_code', e.target.value)} style={inp} placeholder="Ex: AURA20" />
            </div>
            <div>
              <label style={lbl}>Détail de l'offre</label>
              <input value={form.promo_text} onChange={(e) => set('promo_text', e.target.value)} style={inp} placeholder="-20% sur les caftans" />
            </div>
          </div>
          <div>
            <label style={lbl}>Type d&apos;offre</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#374151' }}>
                <input
                  type="radio"
                  name="offer_type"
                  checked={!form.is_exclusive}
                  onChange={() => set('is_exclusive', false)}
                  style={{ marginTop: 3 }}
                />
                <span><strong>Offre pour tous</strong> — visible par tous les visiteurs (rayon « Offres pour tous »).</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#374151' }}>
                <input
                  type="radio"
                  name="offer_type"
                  checked={form.is_exclusive}
                  onChange={() => set('is_exclusive', true)}
                  style={{ marginTop: 3 }}
                />
                <span><strong>Offre exclusive abonnés</strong> — floutée avec bouton « Suivre » pour les non-abonnés.</span>
              </label>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#374151' }}>
            <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
            Publier immédiatement (notifie vos abonnés)
          </label>
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13.5 }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: DARK, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </div>
    </>
  );
}

export default function BoutiquePostsPage() {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { post } | { post: null } | null

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, prodRes] = await Promise.all([
        getMyPosts(),
        api.get('/boutique/products'),
      ]);
      setPosts(postsRes.data?.data || []);
      setProducts(prodRes.data?.data || []);
    } catch {
      toast.error('Impossible de charger les publications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    try {
      await deletePost(id);
      toast.success('Publication supprimée');
      setPosts((p) => p.filter((x) => x.id !== id));
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="fa-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: DARK, margin: 0 }}>Offres spéciales</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#6B7280', margin: '4px 0 0' }}>Publiez des offres pour tous ou des offres exclusives réservées à vos abonnés.</p>
        </div>
        <button onClick={() => setModal({ post: null })} style={{ padding: '11px 22px', borderRadius: 12, border: 'none', background: DARK, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 600 }}>+ Nouvelle offre</button>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Chargement…</p>
      ) : posts.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px dashed #E5E7EB' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: DARK, margin: 0 }}>Aucune publication pour l'instant</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#6B7280', margin: '8px 0 18px' }}>Créez votre première publication pour engager vos abonnés.</p>
          <button onClick={() => setModal({ post: null })} style={{ padding: '10px 22px', borderRadius: 12, border: 'none', background: GOLD, color: DARK, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 700 }}>Créer une publication</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {posts.map((post) => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #F3F4F6', boxShadow: '0 4px 18px rgba(0,0,0,0.05)' }}>
              <div style={{ height: 170, background: '#F3F4F6', position: 'relative' }}>
                {post.image_url && <img src={resolveMediaUrl(post.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                  {post.is_exclusive
                    ? <span style={badge('rgba(201,168,76,0.92)', '#1B3A35')}>Exclusive abonnés</span>
                    : (post.promo_text || post.promo_code)
                      ? <span style={badge('rgba(27,58,53,0.12)', DARK)}>Pour tous</span>
                      : null}
                  {!post.is_published && <span style={badge('rgba(107,114,128,0.9)', '#fff')}>Brouillon</span>}
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#374151', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.caption || <em style={{ color: '#9CA3AF' }}>Sans légende</em>}</p>
                {post.promo_text && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: DARK, fontWeight: 600, margin: '8px 0 0' }}> {post.promo_text}{post.promo_code ? ` · ${post.promo_code}` : ''}</p>}
                {post.product && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B7280', margin: '8px 0 0' }}>Produit : {post.product.name}</p>}
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#9CA3AF', margin: '10px 0 0' }}>{post.created_at}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => setModal({ post })} style={{ flex: 1, padding: '7px 0', borderRadius: 9, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600 }}>Modifier</button>
                  <button onClick={() => handleDelete(post.id)} style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600 }}>Suppr.</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <PostModal post={modal.post} products={products} onClose={() => setModal(null)} onSaved={load} />}
    </div>
  );
}
