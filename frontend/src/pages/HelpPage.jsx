import { useState } from 'react';
import { LifeBuoy, PlayCircle, Mail, Send, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sendContactMessage } from '../services/api';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import { getSteps } from '../components/onboarding/onboardingSteps';
import '../styles/onboarding.css';

const CUSTOMER_FAQ = [
  { q: 'Comment trouver une boutique dans ma ville ?', a: "Cliquez sur « Boutiques » dans le menu : la carte du Maroc s'ouvre. Choisissez votre ville pour voir toutes ses boutiques et ses meilleures adresses." },
  { q: 'Comment rechercher un article précis ?', a: "Dans la page d'une ville, utilisez la barre de recherche et les filtres Type de pièce / Occasion. Les produits de toutes les boutiques correspondantes s'affichent." },
  { q: 'Dois-je créer un compte pour commander ?', a: "Oui, un compte (gratuit) est nécessaire pour finaliser un achat, suivre vos commandes et enregistrer vos favoris." },
  { q: 'Où voir mes commandes et favoris ?', a: "Dans « Mon compte » : vous y retrouvez votre profil, vos commandes, vos favoris, les boutiques suivies et votre panier." },
];

const OWNER_FAQ = [
  { q: 'Comment ajouter un produit ?', a: "Rendez-vous dans « Produits » puis « Ajouter ». Renseignez photos, prix et stock : l'article apparaît automatiquement dans la page de votre ville." },
  { q: 'Comment gérer mes commandes ?', a: "L'onglet « Commandes » liste toutes vos ventes. Vous pouvez changer leur statut (en préparation, expédiée, livrée…)." },
  { q: 'Comment améliorer mon classement ?', a: "Votre note moyenne (avis clients) alimente le classement « Top boutiques » de votre ville. Répondez aux avis et soignez votre service." },
  { q: 'À quoi sert l’AI Advisor ?', a: "L'assistant IA analyse votre boutique et propose des recommandations personnalisées (stock, tendances, mise en avant produit)." },
];

export default function HelpPage({ variant }) {
  const { user } = useAuth();
  const effectiveVariant = variant || (user?.role === 'boutique_owner' ? 'owner' : 'customer');
  const faq = effectiveVariant === 'owner' ? OWNER_FAQ : CUSTOMER_FAQ;

  const [guideOpen, setGuideOpen] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState(null); // 'ok' | 'err' | null
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      await sendContactMessage(form);
      setStatus('ok');
      setForm((f) => ({ ...f, subject: '', message: '' }));
    } catch {
      setStatus('err');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="help-page">
      <header className="help-hero">
        <h1>Besoin d'aide ?</h1>
        <p>
          Retrouvez ici le guide de prise en main et toutes les réponses à vos questions.
          Une demande particulière ? Écrivez-nous, nous vous répondons rapidement.
        </p>
      </header>

      <div className="help-grid">
        <div className="help-card">
          <h3><PlayCircle size={20} /> Revoir le guide</h3>
          <p>
            Rejouez le tutoriel de bienvenue pour (re)découvrir toutes les fonctionnalités
            {effectiveVariant === 'owner' ? ' de votre tableau de bord.' : ' du site.'}
          </p>
          <button className="help-replay-btn" onClick={() => setGuideOpen(true)}>
            <PlayCircle size={18} /> Lancer le guide
          </button>
        </div>

        <div className="help-card">
          <h3><HelpCircle size={20} /> Questions fréquentes</h3>
          {faq.map((item, i) => (
            <details className="help-faq" key={i}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <h2><Mail size={22} style={{ verticalAlign: '-4px', marginRight: 6 }} /> Nous contacter</h2>
        <p>Votre message est envoyé directement à notre équipe. Pensez à indiquer une adresse email valide pour la réponse.</p>

        {status === 'ok' && (
          <div className="contact-alert contact-alert--ok">
            Merci ! Votre message a bien été envoyé. Nous reviendrons vers vous au plus vite.
          </div>
        )}
        {status === 'err' && (
          <div className="contact-alert contact-alert--err">
            Une erreur est survenue. Vérifiez les champs et réessayez.
          </div>
        )}

        <div className="contact-row">
          <div className="contact-field">
            <label htmlFor="c-name">Nom</label>
            <input id="c-name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Votre nom" />
          </div>
          <div className="contact-field">
            <label htmlFor="c-email">Email</label>
            <input id="c-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="vous@email.com" />
          </div>
        </div>

        <div className="contact-field">
          <label htmlFor="c-subject">Sujet</label>
          <input id="c-subject" name="subject" type="text" value={form.subject} onChange={handleChange} placeholder="Objet de votre message" />
        </div>

        <div className="contact-field">
          <label htmlFor="c-message">Message</label>
          <textarea id="c-message" name="message" value={form.message} onChange={handleChange} required placeholder="Comment pouvons-nous vous aider ?" />
        </div>

        <button className="contact-submit" type="submit" disabled={sending}>
          {sending ? 'Envoi…' : (<><Send size={17} /> Envoyer le message</>)}
        </button>
      </form>

      <OnboardingModal
        open={guideOpen}
        steps={getSteps(effectiveVariant)}
        onClose={() => setGuideOpen(false)}
        accent={effectiveVariant === 'owner' ? 'gold' : 'rose'}
      />
    </div>
  );
}
