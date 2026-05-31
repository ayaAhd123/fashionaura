import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import '../../styles/onboarding.css';

/**
 * Modal d'onboarding "swipe" réutilisable.
 * props:
 *  - open: boolean
 *  - steps: [{ icon, title, text }]
 *  - onClose: () => void   (appelé sur fermeture / fin du guide)
 *  - accent: 'rose' | 'gold'  (palette : site client vs dashboard boutique)
 */
export default function OnboardingModal({ open, steps = [], onClose, accent = 'rose' }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  const last = steps.length - 1;
  const isLast = index >= last;

  const next = useCallback(() => {
    setIndex((i) => (i >= last ? i : i + 1));
  }, [last]);

  const prev = useCallback(() => {
    setIndex((i) => (i <= 0 ? 0 : i - 1));
  }, []);

  const finish = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, next, prev, finish]);

  if (!open || steps.length === 0) return null;

  const step = steps[index];
  const Icon = step.icon;

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -50) next();
    else if (delta > 50) prev();
    touchStartX.current = null;
  };

  return (
    <div className="ob-overlay" role="dialog" aria-modal="true" aria-label="Guide de bienvenue">
      <div className={`ob-modal ob-modal--${accent}`}>
        <button className="ob-close" onClick={finish} aria-label="Fermer le guide">
          <X size={18} />
        </button>

        <div
          className="ob-body"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="ob-icon" aria-hidden="true">
            {Icon ? <Icon size={30} strokeWidth={1.6} /> : null}
          </div>
          <p className="ob-step-count">Étape {index + 1} / {steps.length}</p>
          <h2 className="ob-title">{step.title}</h2>
          <p className="ob-text">{step.text}</p>
        </div>

        <div className="ob-dots" role="tablist" aria-label="Progression">
          {steps.map((_, i) => (
            <button
              key={i}
              className={`ob-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Aller à l'étape ${i + 1}`}
              aria-selected={i === index}
            />
          ))}
        </div>

        <div className="ob-actions">
          {index > 0 ? (
            <button className="ob-btn ob-btn--ghost" onClick={prev}>
              <ArrowLeft size={16} /> Précédent
            </button>
          ) : (
            <button className="ob-btn ob-btn--ghost" onClick={finish}>
              Passer
            </button>
          )}

          {isLast ? (
            <button className="ob-btn ob-btn--primary" onClick={finish}>
              <Check size={16} /> C'est parti
            </button>
          ) : (
            <button className="ob-btn ob-btn--primary" onClick={next}>
              Suivant <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
