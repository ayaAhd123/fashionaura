import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../services/api';
import { getCities } from '../api/cityService';

const PLANS = {
  mensuel: { label: 'Mensuel', price: 199, period: '/ mois', note: 'Sans engagement' },
  annuel: { label: 'Annuel', price: 1990, period: '/ an', note: '2 mois offerts' },
};

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '12px',
  border: `1px solid ${hasError ? '#c0392b' : '#D4E0E2'}`,
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
});

const errStyle = { color: '#c0392b', fontSize: '11px', marginTop: '4px' };

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBoutique = searchParams.get('type') === 'boutique';
  const { setSession } = useAuth();

  const [cities, setCities] = useState([]);
  const [step, setStep] = useState(1); // 1 = infos, 2 = paiement (boutique uniquement)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    boutique_name: '',
    city_id: '',
    plan: 'mensuel',
    card_name: '',
    card_number: '',
    card_expiry: '',
    card_cvc: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setStep(1);
  }, [isBoutique]);

  useEffect(() => {
    if (!isBoutique) return;
    getCities()
      .then((data) => {
        setCities(data);
        if (data[0]?.id) {
          setFormData((prev) => ({ ...prev, city_id: String(data[0].id) }));
        }
      })
      .catch(() => setCities([]));
  }, [isBoutique]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validateInfo = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Nom requis';
    if (!formData.email) errors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalide';
    if (!formData.password) errors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) errors.password = 'Minimum 6 caractères';
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    if (isBoutique) {
      if (!formData.boutique_name) errors.boutique_name = 'Nom de la boutique requis';
      if (!formData.city_id) errors.city_id = 'Ville requise';
    }
    return errors;
  };

  const validatePayment = () => {
    const errors = {};
    const number = formData.card_number.replace(/\s/g, '');
    if (!formData.card_name) errors.card_name = 'Nom sur la carte requis';
    if (!number) errors.card_number = 'Numéro de carte requis';
    else if (!/^\d{16}$/.test(number)) errors.card_number = '16 chiffres requis';
    if (!formData.card_expiry) errors.card_expiry = 'Date requise';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.card_expiry)) errors.card_expiry = 'Format MM/AA';
    if (!formData.card_cvc) errors.card_cvc = 'CVC requis';
    else if (!/^\d{3,4}$/.test(formData.card_cvc)) errors.card_cvc = '3 chiffres';
    return errors;
  };

  const doRegister = async (extra = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: isBoutique ? 'boutique_owner' : 'customer',
        ...extra,
      };
      if (isBoutique) {
        payload.boutique_name = formData.boutique_name;
        payload.city_id = Number(formData.city_id);
      }

      const response = await registerUser(payload);
      const data = response.data;
      setSession(data.user, data.token);
      navigate(isBoutique ? '/boutique/dashboard' : '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  /* Compte client : un seul écran, sans paiement */
  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    const errors = validateInfo();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    doRegister();
  };

  /* Boutique étape 1 → paiement */
  const handleContinue = (e) => {
    e.preventDefault();
    const errors = validateInfo();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setError('');
    setStep(2);
  };

  /* Boutique étape 2 : paiement simulé puis création */
  const handlePayAndCreate = (e) => {
    e.preventDefault();
    const errors = validatePayment();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    // Paiement simulé : génère une référence (à remplacer par Stripe/PayPal plus tard)
    const paymentReference = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    doRegister({ plan: formData.plan, payment_reference: paymentReference });
  };

  const selectedPlan = PLANS[formData.plan];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3F2F5',
      fontFamily: 'Raleway, sans-serif',
      padding: '32px 16px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px',
      }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#69807E',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '20px',
          }}
        >
          ← Retour au site
        </Link>

        <h1 style={{
          fontSize: '32px',
          color: '#69807E',
          textAlign: 'center',
          marginBottom: '8px',
          fontFamily: 'Cormorant Garamond, serif',
        }}>
          {isBoutique ? 'Créer un magasin' : 'Créer un compte'}
        </h1>
        <p style={{ textAlign: 'center', color: '#939790', marginBottom: '28px', fontSize: '14px' }}>
          {isBoutique
            ? (step === 1 ? 'Étape 1/2 — Informations' : 'Étape 2/2 — Paiement de l’abonnement')
            : 'Rejoignez FashionAura'}
        </p>

        {/* Stepper boutique */}
        {isBoutique && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                flex: 1, height: '4px', borderRadius: '2px',
                backgroundColor: step >= s ? '#69807E' : '#E1DED9',
                transition: 'background-color 0.3s',
              }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fdf2f2', border: '1px solid #e8c5c5', borderRadius: '8px',
            padding: '12px', marginBottom: '20px', color: '#c0392b', fontSize: '13px', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* ───────── INFORMATIONS (client + boutique étape 1) ───────── */}
        {(!isBoutique || step === 1) && (
          <form onSubmit={isBoutique ? handleContinue : handleCustomerSubmit}>
            {isBoutique && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="text" name="boutique_name" placeholder="Nom de la boutique"
                    value={formData.boutique_name} onChange={handleChange}
                    style={inputStyle(fieldErrors.boutique_name)}
                  />
                  {fieldErrors.boutique_name && <p style={errStyle}>{fieldErrors.boutique_name}</p>}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <select
                    name="city_id" value={formData.city_id} onChange={handleChange}
                    style={{ ...inputStyle(fieldErrors.city_id), background: '#fff' }}
                  >
                    <option value="">Choisir une ville</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                  {fieldErrors.city_id && <p style={errStyle}>{fieldErrors.city_id}</p>}
                </div>
              </>
            )}

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text" name="name" placeholder={isBoutique ? 'Nom du responsable' : 'Nom complet'}
                value={formData.name} onChange={handleChange} style={inputStyle(fieldErrors.name)}
              />
              {fieldErrors.name && <p style={errStyle}>{fieldErrors.name}</p>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="email" name="email" placeholder="Email"
                value={formData.email} onChange={handleChange} style={inputStyle(fieldErrors.email)}
              />
              {fieldErrors.email && <p style={errStyle}>{fieldErrors.email}</p>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="tel" name="phone" placeholder="Téléphone (optionnel)"
                value={formData.phone} onChange={handleChange} style={inputStyle(false)}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="password" name="password" placeholder="Mot de passe"
                value={formData.password} onChange={handleChange} style={inputStyle(fieldErrors.password)}
              />
              {fieldErrors.password && <p style={errStyle}>{fieldErrors.password}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <input
                type="password" name="password_confirmation" placeholder="Confirmer le mot de passe"
                value={formData.password_confirmation} onChange={handleChange}
                style={inputStyle(fieldErrors.password_confirmation)}
              />
              {fieldErrors.password_confirmation && <p style={errStyle}>{fieldErrors.password_confirmation}</p>}
            </div>

            <button
              type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#69807E', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#556968'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#69807E'; }}
            >
              {isBoutique
                ? 'CONTINUER VERS LE PAIEMENT'
                : (isLoading ? 'Création...' : 'CRÉER UN COMPTE')}
            </button>
          </form>
        )}

        {/* ───────── PAIEMENT (boutique étape 2) ───────── */}
        {isBoutique && step === 2 && (
          <form onSubmit={handlePayAndCreate}>
            {/* Choix du plan */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {Object.entries(PLANS).map(([key, p]) => {
                const active = formData.plan === key;
                return (
                  <button
                    key={key} type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, plan: key }))}
                    style={{
                      flex: 1, textAlign: 'left', padding: '14px',
                      border: `2px solid ${active ? '#69807E' : '#E1DED9'}`,
                      borderRadius: '12px', background: active ? '#F2F5F4' : '#fff',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ display: 'block', fontWeight: 700, color: '#3D3A36', fontSize: '14px' }}>{p.label}</span>
                    <span style={{ display: 'block', color: '#69807E', fontWeight: 700, fontSize: '18px', margin: '4px 0' }}>
                      {p.price} DH
                    </span>
                    <span style={{ display: 'block', color: '#939790', fontSize: '11px' }}>{p.note}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text" name="card_name" placeholder="Nom sur la carte"
                value={formData.card_name} onChange={handleChange} style={inputStyle(fieldErrors.card_name)}
              />
              {fieldErrors.card_name && <p style={errStyle}>{fieldErrors.card_name}</p>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text" name="card_number" placeholder="Numéro de carte (16 chiffres)"
                inputMode="numeric" maxLength={19}
                value={formData.card_number} onChange={handleChange} style={inputStyle(fieldErrors.card_number)}
              />
              {fieldErrors.card_number && <p style={errStyle}>{fieldErrors.card_number}</p>}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text" name="card_expiry" placeholder="MM/AA" maxLength={5}
                  value={formData.card_expiry} onChange={handleChange} style={inputStyle(fieldErrors.card_expiry)}
                />
                {fieldErrors.card_expiry && <p style={errStyle}>{fieldErrors.card_expiry}</p>}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text" name="card_cvc" placeholder="CVC" inputMode="numeric" maxLength={4}
                  value={formData.card_cvc} onChange={handleChange} style={inputStyle(fieldErrors.card_cvc)}
                />
                {fieldErrors.card_cvc && <p style={errStyle}>{fieldErrors.card_cvc}</p>}
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px', background: '#F2F5F4', borderRadius: '10px', marginBottom: '20px',
            }}>
              <span style={{ color: '#69807E', fontSize: '13px', fontWeight: 600 }}>Total à payer</span>
              <span style={{ color: '#3D3A36', fontSize: '18px', fontWeight: 700 }}>
                {selectedPlan.price} DH <span style={{ fontSize: '12px', color: '#939790', fontWeight: 400 }}>{selectedPlan.period}</span>
              </span>
            </div>

            <button
              type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#69807E', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#556968'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#69807E'; }}
            >
              {isLoading ? 'Paiement en cours...' : `PAYER ${selectedPlan.price} DH & CRÉER MON MAGASIN`}
            </button>

            <button
              type="button" onClick={() => { setStep(1); setError(''); }}
              style={{
                width: '100%', padding: '12px', marginTop: '10px', backgroundColor: 'transparent',
                color: '#69807E', border: 'none', fontSize: '13px', cursor: 'pointer',
              }}
            >
              ← Revenir aux informations
            </button>

            <p style={{ textAlign: 'center', color: '#C0C0BC', fontSize: '11px', marginTop: '12px' }}>
              Paiement sécurisé · démonstration (aucun débit réel)
            </p>
          </form>
        )}

        {/* CTA "Créer un magasin" sur la page client */}
        {!isBoutique && (
          <div style={{
            marginTop: '24px', padding: '16px', borderRadius: '12px',
            background: '#F2F5F4', textAlign: 'center',
          }}>
            <p style={{ color: '#69807E', fontSize: '13px', marginBottom: '10px' }}>
              Vous souhaitez vendre sur FashionAura ?
            </p>
            <button
              type="button"
              onClick={() => { setStep(1); navigate('/register?type=boutique'); }}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#fff', color: '#69807E',
                border: '1px solid #69807E', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Créer un magasin
            </button>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #E8E5E0', paddingTop: '24px' }}>
          <p style={{ color: '#939790', fontSize: '13px' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#69807E', textDecoration: 'none' }}>Se connecter</Link>
          </p>
          {isBoutique && (
            <p style={{ color: '#939790', fontSize: '13px', marginTop: '8px' }}>
              <Link to="/register" style={{ color: '#69807E', textDecoration: 'none' }}>← Créer un compte client</Link>
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#C0C0BC', fontSize: '11px', marginTop: '24px' }}>
          © 2025 FashionAura
        </p>
      </div>
    </div>
  );
}

export default Register;
