import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingModal from './OnboardingModal';
import { getSteps } from './onboardingSteps';

const storageKey = (variant, userId) => `fa_onboarding_${variant}_${userId || 'guest'}`;

/**
 * Affiche automatiquement le guide à la 1ère visite d'un utilisateur connecté.
 *  - variant="customer" : à monter dans le layout du site public
 *  - variant="owner"    : à monter dans le layout du dashboard boutique
 */
export default function OnboardingTour({ variant = 'customer' }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const expectedRole = variant === 'owner' ? 'boutique_owner' : 'customer';

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role !== expectedRole) return;

    const key = storageKey(variant, user.id);
    if (localStorage.getItem(key) === '1') return;

    // Petit délai pour laisser l'interface se poser avant d'ouvrir le guide
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [isAuthenticated, user, variant, expectedRole]);

  const handleClose = () => {
    if (user) localStorage.setItem(storageKey(variant, user.id), '1');
    setOpen(false);
  };

  return (
    <OnboardingModal
      open={open}
      steps={getSteps(variant)}
      onClose={handleClose}
      accent={variant === 'owner' ? 'gold' : 'rose'}
    />
  );
}
