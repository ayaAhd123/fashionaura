import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import '../styles/auth-modal.css';

/**
 * Reusable modal that blocks actions requiring authentication.
 * Shows a branded overlay with login / cancel buttons.
 *
 * @param {{ isOpen: boolean, onClose: () => void, message: string }} props
 */
const AuthModal = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  // Close when clicking backdrop
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" role="dialog" aria-modal="true">
        <div className="auth-modal__icon">
          <LogIn size={28} />
        </div>

        <h2 className="auth-modal__title">Connexion requise</h2>
        <p className="auth-modal__message">{message}</p>

        <div className="auth-modal__actions">
          <button
            type="button"
            className="auth-modal__login-btn"
            onClick={handleLogin}
          >
            Se connecter
          </button>
          <button
            type="button"
            className="auth-modal__cancel-btn"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
