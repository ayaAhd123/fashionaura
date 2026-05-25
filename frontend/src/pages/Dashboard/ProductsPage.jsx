import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const alertStyles = {
  out: { label: 'Rupture', bg: '#FFF0F0', color: '#c0392b' },
  low: { label: 'Stock faible', bg: '#FFF8F0', color: '#B85C00' },
  ok: { label: 'OK', bg: '#F0FFF4', color: '#1A6B3C' },
};

const STYLES = [
  { value: 'casual', label: 'Casual' },
  { value: 'luxury', label: 'Luxe' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'formal', label: 'Formel' },
  { value: 'sport', label: 'Sport' },
];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock_quantity: '0',
  category_id: '',
  style: 'casual',
  is_active: true,
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1.5px solid #D4E0E2',
  fontFamily: 'Raleway, sans-serif',
  fontSize: 14,
  color: '#2C2C2C',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: 'Raleway, sans-serif',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#939790',
  display: 'block',
  marginBottom: 8,
};

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

function resolveImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

function ProductModal({ product, categories, onClose, onSave }) {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price ?? ''),
        stock_quantity: String(product.stock_quantity ?? 0),
        category_id: String(product.category_id ?? ''),
        style: product.style || 'casual',
        is_active: product.is_active ?? true,
      });
      setImagePreview(product.image_url || null);
      setImageFile(null);
    } else {
      setForm({
        ...emptyForm,
        category_id: categories[0] ? String(categories[0].id) : '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [product, categories]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.category_id) {
      toast.error('Nom, prix et catégorie sont obligatoires.');
      return;
    }

    if (!product?.id && !imageFile) {
      toast.error('Ajoutez une photo du produit.');
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('price', String(parseFloat(form.price)));
    formData.append('stock_quantity', String(parseInt(form.stock_quantity, 10) || 0));
    formData.append('category_id', String(parseInt(form.category_id, 10)));
    formData.append('style', form.style);
    formData.append('is_active', form.is_active ? '1' : '0');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (product?.id) {
        await api.put(`/boutique/products/${product.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produit mis à jour.');
      } else {
        await api.post('/boutique/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produit ajouté.');
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Erreur lors de l\'enregistrement.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 500, color: '#2C2C2C', marginBottom: 24 }}>
          {product ? 'Modifier le produit' : 'Ajouter un produit'}
        </h3>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Photo du produit {!product?.id && '*'}</label>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {imagePreview && (
              <img
                src={resolveImageSrc(imagePreview)}
                alt="Aperçu"
                style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 10, border: '1px solid #D4E0E2' }}
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageChange}
              style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13 }}
            />
          </div>
          {product?.id && !imageFile && (
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#939790', marginTop: 6 }}>
              Laissez vide pour conserver la photo actuelle.
            </p>
          )}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Nom</label>
          <input value={form.name} onChange={(e) => setField('name', e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>Prix (MAD)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField('price', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Stock</label>
            <input type="number" min="0" value={form.stock_quantity} onChange={(e) => setField('stock_quantity', e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select value={form.category_id} onChange={(e) => setField('category_id', e.target.value)} style={inputStyle}>
              <option value="">— Choisir —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Style</label>
            <select value={form.style} onChange={(e) => setField('style', e.target.value)} style={inputStyle}>
              {STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 28 }}>
          <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#69807E' }} />
          <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#2C2C2C' }}>Produit actif (visible en boutique)</span>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #D4E0E2', backgroundColor: 'transparent', color: '#939790', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 14 }}>
            Annuler
          </button>
          <button type="button" onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', backgroundColor: '#69807E', color: '#fff', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/boutique/products', {
        params: {
          search: search || undefined,
          low_stock_only: lowStockOnly ? 1 : undefined,
        },
      });
      setProducts(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.warn('[ProductsPage]', err?.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [lowStockOnly]);

  useEffect(() => {
    api.get('/boutique/products/categories')
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Supprimer « ${product.name} » ?`)) {
      return;
    }

    setDeletingId(product.id);
    try {
      await api.delete(`/boutique/products/${product.id}`);
      toast.success('Produit supprimé.');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de supprimer ce produit.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 400, color: '#2C2C2C', marginBottom: 4 }}>
            Gestion des produits
          </h2>
          {meta && (
            <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790' }}>
              {meta.boutique} — {meta.total} produit(s) — seuil alerte : {meta.threshold} unités
              {meta.low_stock_count > 0 && (
                <span style={{ color: '#c0392b', marginLeft: 8 }}>
                  ({meta.low_stock_count} en alerte)
                </span>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setModal('new')}
          style={{
            padding: '12px 24px', borderRadius: 12, border: 'none',
            backgroundColor: '#69807E', color: '#fff', cursor: 'pointer',
            fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600,
          }}
        >
          + Ajouter un produit
        </button>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10,
            border: '1px solid #D4E0E2', fontFamily: 'Raleway, sans-serif', fontSize: 14,
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            backgroundColor: '#69807E', color: '#fff', cursor: 'pointer',
            fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600,
          }}
        >
          Rechercher
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#555', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          Stock en alerte seulement
        </label>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 16, padding: 48, textAlign: 'center',
          boxShadow: '0 2px 8px rgba(44,58,57,0.05)',
        }}>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: '#939790' }}>Aucun produit trouvé.</p>
          <button
            type="button"
            onClick={() => setModal('new')}
            style={{ marginTop: 16, padding: '10px 20px', borderRadius: 10, border: 'none', backgroundColor: '#69807E', color: '#fff', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 13 }}
          >
            Ajouter votre premier produit
          </button>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(44,58,57,0.05)', border: '1px solid rgba(147,151,144,0.1)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Raleway, sans-serif', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#FAFCFD', borderBottom: '1px solid #E8E5E0' }}>
                {['Photo', 'Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actif', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#69807E', fontSize: 12, letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const st = alertStyles[p.stock_alert] || alertStyles.ok;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F3F2F5' }}>
                    <td style={{ padding: '14px 16px' }}>
                      {p.image_url ? (
                        <img
                          src={resolveImageSrc(p.image_url)}
                          alt={p.name}
                          style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #E8E5E0' }}
                        />
                      ) : (
                        <span style={{ fontSize: 11, color: '#C0C0BC' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#2C2C2C' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#939790' }}>{p.category || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#2C2C2C' }}>{p.price} MAD</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: p.stock_alert !== 'ok' ? '#c0392b' : '#2C2C2C' }}>
                      {p.stock_quantity}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: p.is_active ? '#1A6B3C' : '#939790' }}>
                      {p.is_active ? 'Oui' : 'Non'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setModal(p)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #D4E0E2', background: 'transparent', color: '#69807E', cursor: 'pointer', fontSize: 12, fontFamily: 'Raleway, sans-serif' }}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #FFD4D4', background: '#FFF0F0', color: '#c0392b', cursor: 'pointer', fontSize: 12, fontFamily: 'Raleway, sans-serif', opacity: deletingId === p.id ? 0.5 : 1 }}
                        >
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchProducts(); }}
        />
      )}
    </div>
  );
}
