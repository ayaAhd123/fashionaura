// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import api from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/forgot-password', { email });
      setMessage('Un lien de réinitialisation a été envoyé à votre email');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Email non trouvé');
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
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{ color: '#69807E', textAlign: 'center' }}>Mot de passe oublié</h2>
        
        {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid #D4E0E2',
              borderRadius: '8px',
            }}
            required
          />
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#69807E',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {isLoading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
        
        <a href="/login" style={{ display: 'block', textAlign: 'center', marginTop: '16px', color: '#69807E' }}>
          Retour à la connexion
        </a>
      </div>
    </div>
  );
}

export default ForgotPassword;