import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import '../styles/checkout-modal.css';

const DELIVERY_SLOTS = [
  { value: 'matin', label: 'Matin — 8h à 12h' },
  { value: 'apres-midi', label: 'Après-midi — 12h à 18h' },
  { value: 'soir', label: 'Soir — 18h à 22h' },
];

/**
 * Validates Moroccan phone number.
 * Accepts: +212XXXXXXXXX, 06XXXXXXXX, 07XXXXXXXX
 */
const isValidPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-\.]/g, '');
  return /^(\+212[5-7]\d{8}|0[5-7]\d{8})$/.test(cleaned);
};

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const CheckoutModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    email: '',
    deliverySlot: 'matin',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est requis';
    if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Format invalide. Utilisez +212XXXXXXXXX ou 06/07XXXXXXXX';
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // onSuccess crée la commande côté serveur (peut être asynchrone)
      await onSuccess?.(formData);
      setSubmitted(true);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.response?.data?.message || 'Erreur lors de la création de la commande.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (submitted) {
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setFormData({ fullName: '', address: '', phone: '', email: '', deliverySlot: 'matin' });
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="checkout-overlay" onClick={handleOverlayClick}>
      <div className="checkout-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="checkout-modal__close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        {submitted ? (
          /* ── Success state ──────────────────────────────────────────── */
          <div className="checkout-success">
            <div className="checkout-success__icon">
              <CheckCircle size={40} />
            </div>
            <h2 className="checkout-success__title">Commande confirmée</h2>
            <p className="checkout-success__message">
              Votre commande a été confirmée ! Nous vous contacterons bientôt.
            </p>
            <button
              type="button"
              className="checkout-success__close-btn"
              onClick={handleClose}
            >
              Fermer
            </button>
          </div>
        ) : (
          /* ── Form state ─────────────────────────────────────────────── */
          <>
            <h2 className="checkout-modal__title">Finaliser votre commande</h2>
            <p className="checkout-modal__subtitle">
              Remplissez vos informations de livraison
            </p>

            <form className="checkout-form" onSubmit={handleSubmit} noValidate>
              {/* Nom complet */}
              <div className="checkout-form__group">
                <label className="checkout-form__label" htmlFor="checkout-name">
                  Nom complet <span className="required">*</span>
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  className="checkout-form__input"
                  placeholder="Votre nom et prénom"
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  autoComplete="name"
                />
                {errors.fullName && <span className="checkout-form__error">{errors.fullName}</span>}
              </div>

              {/* Adresse */}
              <div className="checkout-form__group">
                <label className="checkout-form__label" htmlFor="checkout-address">
                  Adresse complète <span className="required">*</span>
                </label>
                <textarea
                  id="checkout-address"
                  className="checkout-form__textarea"
                  placeholder="Numéro, rue, ville, code postal"
                  value={formData.address}
                  onChange={handleChange('address')}
                  rows={3}
                  autoComplete="street-address"
                />
                {errors.address && <span className="checkout-form__error">{errors.address}</span>}
              </div>

              {/* Téléphone */}
              <div className="checkout-form__group">
                <label className="checkout-form__label" htmlFor="checkout-phone">
                  Numéro de téléphone <span className="required">*</span>
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  className="checkout-form__input"
                  placeholder="+212 6XX XXX XXX"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  autoComplete="tel"
                />
                {errors.phone && <span className="checkout-form__error">{errors.phone}</span>}
              </div>

              {/* Email */}
              <div className="checkout-form__group">
                <label className="checkout-form__label" htmlFor="checkout-email">
                  Adresse email <span className="required">*</span>
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  className="checkout-form__input"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  autoComplete="email"
                />
                {errors.email && <span className="checkout-form__error">{errors.email}</span>}
              </div>

              {/* Heure de livraison */}
              <div className="checkout-form__group">
                <label className="checkout-form__label" htmlFor="checkout-delivery">
                  Heure de livraison souhaitée
                </label>
                <select
                  id="checkout-delivery"
                  className="checkout-form__select"
                  value={formData.deliverySlot}
                  onChange={handleChange('deliverySlot')}
                >
                  {DELIVERY_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              {errors.submit && (
                <span className="checkout-form__error" style={{ display: 'block', marginBottom: 8 }}>
                  {errors.submit}
                </span>
              )}

              <button
                type="submit"
                className="checkout-form__submit"
                disabled={submitting}
              >
                {submitting ? 'Traitement...' : 'Confirmer la commande'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
