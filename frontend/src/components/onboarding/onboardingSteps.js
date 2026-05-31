import {
  Sparkles,
  MapPin,
  Search,
  Heart,
  ShoppingBag,
  UserCircle,
  LayoutDashboard,
  Package,
  ClipboardList,
  Star,
  TrendingUp,
  Bot,
} from 'lucide-react';

// Étapes du guide pour un client (site public)
export const customerSteps = [
  {
    icon: Sparkles,
    title: 'Bienvenue sur FashionAura',
    text: "Découvrez la mode marocaine, ville par ville. Ce petit guide vous montre comment profiter au mieux du site. Vous pouvez le revoir à tout moment depuis « Besoin d'aide ? ».",
  },
  {
    icon: MapPin,
    title: 'Choisissez votre ville',
    text: "Cliquez sur « Boutiques » dans le menu pour ouvrir la carte du Maroc, puis sélectionnez une ville. Vous accédez alors à toutes ses boutiques et à ses meilleures adresses.",
  },
  {
    icon: Search,
    title: 'Recherchez un article',
    text: "Dans la page d'une ville, utilisez la barre de recherche et les filtres (Type de pièce, Occasion) pour trouver robes, caftans, tenues de soirée… dans toutes les boutiques de la ville d'un seul coup.",
  },
  {
    icon: Heart,
    title: 'Favoris & boutiques suivies',
    text: "Aimez un produit pour l'enregistrer dans vos favoris, et suivez vos boutiques préférées pour ne rien manquer de leurs nouveautés.",
  },
  {
    icon: ShoppingBag,
    title: 'Panier & commande',
    text: "Ajoutez vos pièces au panier, puis finalisez votre commande en toute sécurité. Vous suivez ensuite l'état de chaque commande depuis votre espace.",
  },
  {
    icon: UserCircle,
    title: 'Mon compte & aide',
    text: "Dans « Mon compte » : profil, commandes, favoris, boutiques suivies et panier. Un doute ? La page « Besoin d'aide ? » répond à vos questions et permet de nous contacter.",
  },
];

// Étapes du guide pour un propriétaire de boutique (dashboard)
export const ownerSteps = [
  {
    icon: LayoutDashboard,
    title: 'Bienvenue dans votre tableau de bord',
    text: "Voici le centre de pilotage de votre boutique. Ce guide présente les outils à votre disposition. Vous pourrez le revoir depuis la page « Aide ».",
  },
  {
    icon: Package,
    title: 'Gérez vos produits',
    text: "Dans « Produits », ajoutez et modifiez vos créations (photos, prix, stock). Vos articles apparaissent automatiquement sur le site, dans la page de votre ville.",
  },
  {
    icon: ClipboardList,
    title: 'Commandes & clients',
    text: "Suivez vos commandes en temps réel, changez leur statut et consultez la fiche de vos clients pour mieux les fidéliser.",
  },
  {
    icon: Star,
    title: 'Avis & réputation',
    text: "Répondez aux avis de vos clients. Votre note moyenne alimente le classement « Top boutiques » de votre ville : une bonne réputation vous met en avant.",
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    text: "Visualisez votre trafic, vos revenus et vos produits les plus populaires sur des graphiques clairs pour prendre les bonnes décisions.",
  },
  {
    icon: Bot,
    title: 'AI Advisor & aide',
    text: "L'assistant IA vous propose des recommandations personnalisées. Besoin d'un coup de main ? La page « Aide » contient ce guide et un formulaire de contact.",
  },
];

export const getSteps = (variant) => (variant === 'owner' ? ownerSteps : customerSteps);
