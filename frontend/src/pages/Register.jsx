import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Nom requis';
    if (!formData.email) errors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalide';
    if (!formData.password) errors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) errors.password = 'Minimum 6 caractères';
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }
      
      // Connexion automatique après inscription
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirection vers le dashboard
      navigate('/');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3F2F5',
      fontFamily: 'Raleway, sans-serif',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px',
      }}>
        <h1 style={{
          fontSize: '32px',
          color: '#69807E',
          textAlign: 'center',
          marginBottom: '8px',
          fontFamily: 'Cormorant Garamond, serif',
        }}>
          Créer un compte
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#939790',
          marginBottom: '32px',
          fontSize: '14px',
        }}>
          Rejoignez FashionAura
        </p>

        {error && (
          <div style={{
            backgroundColor: '#fdf2f2',
            border: '1px solid #e8c5c5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#c0392b',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              name="name"
              placeholder="Nom complet"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${fieldErrors.name ? '#c0392b' : '#D4E0E2'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {fieldErrors.name && <p style={{ color: '#c0392b', fontSize: '11px', marginTop: '4px' }}>{fieldErrors.name}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${fieldErrors.email ? '#c0392b' : '#D4E0E2'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {fieldErrors.email && <p style={{ color: '#c0392b', fontSize: '11px', marginTop: '4px' }}>{fieldErrors.email}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="tel"
              name="phone"
              placeholder="Téléphone (optionnel)"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D4E0E2',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${fieldErrors.password ? '#c0392b' : '#D4E0E2'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {fieldErrors.password && <p style={{ color: '#c0392b', fontSize: '11px', marginTop: '4px' }}>{fieldErrors.password}</p>}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirmer le mot de passe"
              value={formData.password_confirmation}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${fieldErrors.password_confirmation ? '#c0392b' : '#D4E0E2'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {fieldErrors.password_confirmation && <p style={{ color: '#c0392b', fontSize: '11px', marginTop: '4px' }}>{fieldErrors.password_confirmation}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#69807E',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#556968'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#69807E'}
          >
            {isLoading ? 'Création...' : 'CRÉER UN COMPTE'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          borderTop: '1px solid #E8E5E0',
          paddingTop: '24px',
        }}>
          <p style={{ color: '#939790', fontSize: '13px' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#69807E', textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>

        <p style={{
          textAlign: 'center',
          color: '#C0C0BC',
          fontSize: '11px',
          marginTop: '24px',
        }}>
          © 2025 FashionAura
        </p>
      </div>
    </div>
  );
}

export default Register;