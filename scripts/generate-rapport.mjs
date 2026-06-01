import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'Rapport_Projet_Synthese_FashionAura_v2.docx');
const DIAGRAMS = path.join(ROOT, 'docs', 'diagrams');

function diagram(name, height = 340) {
  const file = path.join(DIAGRAMS, `${name}.png`);
  if (!fs.existsSync(file)) {
    return placeholder(`[Diagramme manquant : ${name}.png — exécutez node scripts/generate-diagrams.mjs]`);
  }
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200 },
    children: [
      new ImageRun({
        data: fs.readFileSync(file),
        transformation: { width: 580, height },
      }),
    ],
  });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text, italics: true, size: 18, color: '555555' })],
  });
}

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 } });
}
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 } });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, size: 22, ...opts.run })],
  });
}
function bullet(text) {
  return new Paragraph({
    spacing: { after: 80 },
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 22 })],
  });
}
function placeholder(text) {
  return p(text, { run: { italics: true, color: '666666' } });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function table(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map((h) =>
      new TableCell({
        width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
        shading: { fill: 'E8F0EE' },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
      })
    ),
  });
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell) =>
          new TableCell({
            width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
          })
        ),
      })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// Générer les PNG si absents
if (!fs.existsSync(path.join(DIAGRAMS, '01-cas-utilisation.png'))) {
  execSync('node scripts/generate-diagrams.mjs', { cwd: ROOT, stdio: 'inherit' });
}

const children = [
  new Paragraph({ spacing: { before: 2400 } }),
  p('OFPM / OFPPT', { center: true, run: { size: 24 } }),
  p('.... (Nom de votre établissement)', { center: true, run: { italics: true, color: '666666', size: 24 } }),
  new Paragraph({ spacing: { before: 600 } }),
  p('PROJET DE SYNTHÈSE', { center: true, run: { bold: true, size: 36 } }),
  new Paragraph({ spacing: { before: 200 } }),
  p('FashionAura', { center: true, run: { bold: true, size: 32, color: '1B3A35' } }),
  p('Plateforme e-commerce de mode marocaine', { center: true, run: { size: 26 } }),
  new Paragraph({ spacing: { before: 400 } }),
  p('Filière : Développement Digital', { center: true, run: { size: 24 } }),
  p('Option : Web Full Stack', { center: true, run: { size: 24 } }),
  new Paragraph({ spacing: { before: 600 } }),
  p('Réalisé par : .... (Prénom NOM)', { center: true, run: { size: 24 } }),
  p('Encadré par : .... (Nom de l\'encadrant)', { center: true, run: { size: 24 } }),
  p('Année universitaire : 2025 – 2026', { center: true, run: { size: 24 } }),
  pageBreak(),

  h1('Remerciements'),
  p('Je tiens à exprimer ma profonde gratitude à .... (directeur/directrice de l\'établissement) pour la qualité de la formation reçue au sein de l\'OFPPT.'),
  p('Mes remerciements vont également à .... (encadrant pédagogique) pour son accompagnement, ses conseils et sa disponibilité tout au long de la réalisation de ce projet de synthèse.'),
  p('Je remercie également .... (professeurs, collègues, famille) pour leur soutien moral et technique.'),
  p('Enfin, je remercie l\'ensemble des personnes qui ont contribué, de près ou de loin, à la réussite de ce projet.'),
  pageBreak(),

  h1('Résumé / Abstract'),
  h2('Résumé (français)'),
  p('FashionAura est une plateforme web full stack dédiée à la mode marocaine. Elle met en relation des clients, des boutiques locales et un administrateur plateforme. L\'application permet la découverte des boutiques par ville, la consultation et l\'achat de produits, le suivi de commandes, la messagerie en temps réel, le système d\'abonnement aux boutiques, les offres promotionnelles exclusives, ainsi que des assistants intelligents basés sur l\'IA (Gemini).'),
  p('Le frontend est développé avec React et Vite ; le backend repose sur Laravel 12 avec une API REST sécurisée par Laravel Sanctum. La base de données MySQL centralise l\'ensemble des données métier. La communication temps réel est assurée par Laravel Reverb et Laravel Echo.'),
  p('Mots-clés : e-commerce, mode marocaine, React, Laravel, API REST, MySQL, Scrum, UML, MERISE, intelligence artificielle.'),
  h2('Abstract (English)'),
  p('FashionAura is a full-stack web platform dedicated to Moroccan fashion. It connects customers, local boutiques, and a platform administrator. The application supports city-based boutique discovery, product browsing and ordering, order tracking, real-time messaging, boutique follow/subscription, exclusive promotional offers, and AI-powered assistants (Gemini).'),
  p('The frontend is built with React and Vite; the backend uses Laravel 12 with a REST API secured by Laravel Sanctum. MySQL stores all business data. Real-time features rely on Laravel Reverb and Laravel Echo.'),
  p('Keywords: e-commerce, Moroccan fashion, React, Laravel, REST API, MySQL, Scrum, UML, MERISE, artificial intelligence.'),
  pageBreak(),

  h1('Introduction générale'),
  p('Le secteur du commerce digital connaît une croissance importante au Maroc, notamment dans le domaine de la mode et de l\'artisanat. Les créateurs locaux ont besoin de visibilité numérique, tandis que les consommateurs recherchent des expériences d\'achat fiables, personnalisées et ancrées dans leur identité culturelle.'),
  p('Dans ce contexte, le présent projet de synthèse consiste à concevoir et développer FashionAura, une marketplace mode marocaine permettant de découvrir des boutiques par ville, d\'acheter des créations, de suivre ses commandes et d\'interagir avec les vendeurs.'),
  p('Ce rapport présente la démarche complète du projet : analyse du besoin, conception, développement, tests et perspectives de déploiement. Il vise à démontrer la maîtrise des compétences du développeur web full stack dans un cadre professionnel.'),
  pageBreak(),

  h1('Contexte et problématique'),
  h2('Contexte général'),
  p('La digitalisation du commerce de détail au Maroc s\'accélère. Cependant, de nombreuses boutiques de mode restent peu visibles en ligne ou ne disposent pas d\'outils adaptés pour gérer leurs ventes, stocks, clients et promotions.'),
  h2('Problématique'),
  p('Comment concevoir une plateforme web full stack permettant aux clients de découvrir et acheter des produits de mode marocaine par ville, tout en offrant aux propriétaires de boutiques un espace de gestion complet (produits, commandes, offres, messagerie, analytics) et à l\'administrateur un contrôle centralisé de la plateforme ?'),
  h2('Objectifs du projet'),
  bullet('Développer une application web responsive et multilingue (FR, EN, ES, AR).'),
  bullet('Mettre en place une architecture client/serveur basée sur une API REST.'),
  bullet('Gérer trois profils utilisateurs : client, propriétaire de boutique et administrateur.'),
  bullet('Intégrer des fonctionnalités avancées : messagerie temps réel, suivi de commandes, offres exclusives, IA.'),
  bullet('Appliquer une méthodologie agile (Scrum) et des modèles de conception (UML, MERISE).'),
  pageBreak(),

  h1('Étude de l\'existant'),
  h2('Solutions existantes'),
  p('Plusieurs plateformes e-commerce généralistes existent (Jumia, H&M, Zara, etc.), mais elles ne ciblent pas spécifiquement la mode marocaine artisanale ni la découverte par ville. Les réseaux sociaux (Instagram, Facebook) sont souvent utilisés par les boutiques, sans outil intégré de gestion commerciale.'),
  h2('Critique de l\'existant'),
  table(
    ['Solution', 'Points forts', 'Limites'],
    [
      ['Marketplaces généralistes', 'Large audience, paiement intégré', 'Peu de personnalisation locale, pas de focus mode marocaine'],
      ['Réseaux sociaux', 'Visibilité rapide, interaction directe', 'Pas de gestion commandes/stocks, pas de suivi structuré'],
      ['Sites vitrine classiques', 'Présence en ligne', 'Fonctionnalités limitées, pas de marketplace multi-boutiques'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Solution proposée : FashionAura'),
  p('FashionAura combine une marketplace multi-boutiques, une navigation par ville marocaine, un tableau de bord boutique complet, une validation admin des nouvelles boutiques, un suivi de commande client, une messagerie temps réel et des assistants IA pour clients et commerçants.'),
  pageBreak(),

  h1('Analyse des besoins'),
  h2('Acteurs du système'),
  bullet('Client (customer) : parcourt, achète, suit, commente, discute.'),
  bullet('Propriétaire de boutique (boutique_owner) : gère produits, commandes, offres, clients, avis.'),
  bullet('Administrateur (admin) : valide les boutiques, gère villes, catégories, utilisateurs, commandes.'),
  h2('Besoins fonctionnels principaux'),
  table(
    ['ID', 'Besoin', 'Acteur'],
    [
      ['BF01', 'S\'inscrire / se connecter', 'Tous'],
      ['BF02', 'Parcourir boutiques par ville', 'Client'],
      ['BF03', 'Ajouter au panier et commander', 'Client'],
      ['BF04', 'Suivre le statut d\'une commande', 'Client'],
      ['BF05', 'Suivre une boutique et recevoir des offres', 'Client'],
      ['BF06', 'Gérer produits et catégories', 'Boutique'],
      ['BF07', 'Publier offres spéciales (publiques/exclusives)', 'Boutique'],
      ['BF08', 'Mettre à jour statut commande', 'Boutique / Admin'],
      ['BF09', 'Messagerie temps réel (texte, audio, produit)', 'Client / Boutique'],
      ['BF10', 'Valider / rejeter une boutique', 'Admin'],
      ['BF11', 'Assistant IA styliste et copilot marchand', 'Client / Boutique'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Besoins non fonctionnels'),
  bullet('Sécurité : authentification par token (Sanctum), contrôle d\'accès par rôle.'),
  bullet('Performance : chargement optimisé, pagination, lazy loading.'),
  bullet('Responsive : adaptation mobile, tablette et desktop.'),
  bullet('Multilingue : français, anglais, espagnol, arabe.'),
  bullet('Maintenabilité : séparation frontend/backend, code modulaire.'),
  bullet('Disponibilité : architecture prête pour déploiement avec WebSocket (Reverb).'),
  pageBreak(),

  h1('Gestion Agile / Scrum'),
  h2('Méthodologie'),
  p('Le projet a été mené selon la méthode Scrum, avec des sprints de .... (2 semaines recommandé). Les outils utilisés : .... (Jira / Trello) pour le backlog, GitHub pour le versioning et le suivi des commits.'),
  h2('Diagramme de planification des sprints'),
  diagram('09-scrum-sprints', 280),
  caption('Figure 1 — Planification Scrum (diagramme de Gantt)'),
  h2('Équipe Scrum'),
  table(
    ['Rôle', 'Responsabilités', 'Nom'],
    [
      ['Product Owner', 'Prioriser le backlog, valider les livrables', '....'],
      ['Scrum Master', 'Faciliter les cérémonies, lever les blocages', '....'],
      ['Développeur Full Stack', 'Conception, développement, tests', '.... (vous)'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Product Backlog (extrait)'),
  table(
    ['Priorité', 'User Story', 'Sprint'],
    [
      ['Haute', 'En tant que client, je veux parcourir les boutiques par ville', 'Sprint 1'],
      ['Haute', 'En tant que client, je veux créer un compte et me connecter', 'Sprint 1'],
      ['Haute', 'En tant que boutique, je veux ajouter et gérer mes produits', 'Sprint 2'],
      ['Haute', 'En tant que client, je veux passer commande et suivre son statut', 'Sprint 3'],
      ['Moyenne', 'En tant que boutique, je veux publier des offres spéciales', 'Sprint 4'],
      ['Moyenne', 'En tant que client, je veux discuter avec une boutique en temps réel', 'Sprint 4'],
      ['Moyenne', 'En tant qu\'admin, je veux valider les nouvelles boutiques', 'Sprint 2'],
      ['Basse', 'En tant que client, je veux un assistant IA pour mes conseils mode', 'Sprint 5'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Planification des sprints'),
  table(
    ['Sprint', 'Durée', 'Objectif', 'Livrables'],
    [
      ['Sprint 1', '.... sem.', 'Fondations & catalogue', 'Auth, villes, boutiques, produits publics'],
      ['Sprint 2', '.... sem.', 'Espace boutique', 'Dashboard, CRUD produits, validation admin'],
      ['Sprint 3', '.... sem.', 'Parcours d\'achat', 'Panier, commandes, suivi client'],
      ['Sprint 4', '.... sem.', 'Engagement', 'Offres, abonnés, messagerie Reverb'],
      ['Sprint 5', '.... sem.', 'IA & finition', 'Chatbot, copilot, tests, documentation'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Daily Scrum'),
  p('Des réunions quotidiennes de .... (15 min) ont permis de suivre : ce qui a été fait hier, ce qui sera fait aujourd\'hui, et les éventuels blocages. Les notes sont disponibles dans .... (Trello/Jira/Notion).'),
  h2('Outils utilisés'),
  bullet('GitHub : dépôt du code, branches, commits, historique des versions.'),
  bullet('.... (Jira ou Trello) : gestion du backlog et des tâches.'),
  bullet('Figma / .... : maquettes UI (si applicable).'),
  bullet('Postman / Insomnia : tests des endpoints API.'),
  pageBreak(),

  h1('Conception UML / MERISE'),
  h2('Diagramme de cas d\'utilisation'),
  p('Les cas d\'utilisation principaux sont organisés autour de trois acteurs : Client, Propriétaire boutique et Administrateur.'),
  diagram('01-cas-utilisation', 420),
  caption('Figure 2 — Diagramme de cas d\'utilisation UML'),
  h2('Diagramme de classes'),
  p('Les classes métier principales et leurs relations : User, City, Boutique, Product, Category, Order, OrderItem, BoutiquePost, Conversation, Message, Review.'),
  diagram('02-classes', 480),
  caption('Figure 3 — Diagramme de classes UML'),
  h2('Diagramme de séquence — Passage de commande'),
  p('Ce diagramme illustre le parcours complet : création de commande côté client, puis mise à jour du statut par la boutique avec notification temps réel via Reverb.'),
  diagram('03-sequence-commande', 400),
  caption('Figure 4 — Diagramme de séquence : passage et suivi de commande'),
  h2('Modélisation MERISE'),
  h3('MCD (Modèle Conceptuel de Données)'),
  p('Le MCD représente les entités métier et leurs associations indépendamment de l\'implémentation technique.'),
  diagram('04-mcd-merise', 520),
  caption('Figure 5 — MCD MERISE (Modèle Conceptuel de Données)'),
  h3('MLD (Modèle Logique de Données)'),
  p('Le MLD traduit le MCD en tables relationnelles avec clés primaires et étrangères.'),
  diagram('05-mld-merise', 480),
  caption('Figure 6 — MLD MERISE (Modèle Logique de Données)'),
  table(
    ['Table', 'Clé primaire', 'Clés étrangères principales'],
    [
      ['users', 'id', 'boutique_id → boutiques.id'],
      ['cities', 'id', '—'],
      ['boutiques', 'id', 'city_id → cities.id'],
      ['products', 'id', 'boutique_id, category_id'],
      ['orders', 'id', 'user_id → users.id'],
      ['order_items', 'id', 'order_id, product_id'],
      ['conversations', 'id', 'boutique_id, customer_id, order_id'],
      ['messages', 'id', 'conversation_id, sender_id'],
      ['boutique_posts', 'id', 'boutique_id, product_id'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h3('MPD (Modèle Physique de Données)'),
  p('SGBD : MySQL 8 (base fashionaura_db, charset utf8mb4_unicode_ci). 38 migrations Laravel. Types SQL, index et contraintes d\'intégrité référentielle.'),
  diagram('06-mpd-mysql', 480),
  caption('Figure 7 — MPD MySQL (Modèle Physique de Données)'),
  h2('Architecture technique'),
  p('Architecture 3 tiers avec couche temps réel et service IA externe :'),
  diagram('07-architecture-3-tiers', 400),
  caption('Figure 8 — Architecture technique 3 tiers de FashionAura'),
  bullet('Couche présentation : React 18 + Vite (port 5173).'),
  bullet('Couche métier : Laravel 12 API REST (port 8000).'),
  bullet('Couche données : MySQL.'),
  bullet('Couche temps réel : Laravel Reverb (WebSocket, port 8080).'),
  bullet('Couche IA : Google Gemini API via GeminiService.'),
  pageBreak(),

  h1('Réalisation et développement'),
  h2('Environnement de développement'),
  table(
    ['Composant', 'Technologie / Version'],
    [
      ['IDE', '.... (VS Code / Cursor)'],
      ['Frontend', 'React 18, Vite 5, React Router 6, Tailwind CSS 4, Axios'],
      ['Backend', 'PHP 8.2+, Laravel 12, Laravel Sanctum'],
      ['Base de données', 'MySQL (fashionaura_db)'],
      ['Temps réel', 'Laravel Reverb, Laravel Echo, Pusher-js'],
      ['IA', 'Google Gemini API'],
      ['Versioning', 'Git / GitHub'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Frontend (React)'),
  p('Structure du projet frontend/src/ : pages/, components/, contexts/, services/api.js, router/AppRouter.jsx.'),
  p('Fonctionnalités UI : thème par ville, onglets Dernières créations / Offres spéciales, suivi commande avec timeline, onboarding, multilingue i18next.'),
  placeholder('[Captures d\'écran à ajouter : page d\'accueil, fiche boutique, panier, suivi commande]'),
  h2('Backend (Laravel — API REST)'),
  p('Routes principales (backend/routes/api.php) : catalogue public, auth Sanctum, espace client, espace boutique, espace admin.'),
  h2('Base de données'),
  p('30 modèles Eloquent. Seeders : villes marocaines, boutiques de démo, comptes test.'),
  h2('Authentification et sécurité'),
  bullet('Laravel Sanctum : tokens Bearer stockés côté client.'),
  bullet('Middleware admin et boutique.owner sur routes sensibles.'),
  bullet('ProtectedRoute.jsx côté React : redirection /login ou /unauthorized.'),
  bullet('Prix calculés côté serveur à la création de commande.'),
  bullet('Canaux broadcast privés (order.{id}, conversation.{id}).'),
  pageBreak(),

  h1('Tests et validation'),
  h2('Stratégie de tests'),
  table(
    ['Type de test', 'Objectif', 'Résultat'],
    [
      ['Tests fonctionnels', 'Vérifier parcours inscription, achat, suivi', '.... (OK / à compléter)'],
      ['Tests API (Postman)', 'Valider endpoints CRUD et auth', '....'],
      ['Tests responsive', 'Mobile, tablette, desktop', '....'],
      ['Tests sécurité', 'Accès non autorisé, rôles, tokens', '....'],
      ['Tests temps réel', 'Mise à jour statut commande via Reverb', '....'],
      ['Tests IA', 'Réponses chatbot et copilot', '....'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Scénarios de test fonctionnels'),
  table(
    ['N°', 'Scénario', 'Résultat attendu', 'Statut'],
    [
      ['T01', 'Client passe une commande depuis le panier', 'Commande créée, page suivi accessible', '....'],
      ['T02', 'Boutique change statut en Expédiée', 'Timeline client mise à jour en temps réel', '....'],
      ['T03', 'Client non connecté accède à /compte', 'Redirection vers /login', '....'],
      ['T04', 'Boutique publie offre exclusive', 'Contenu flouté pour non-abonnés', '....'],
      ['T05', 'Admin approuve une boutique', 'Boutique visible publiquement', '....'],
    ]
  ),
  pageBreak(),

  h1('Déploiement'),
  h2('Environnement local (actuel)'),
  bullet('MySQL : CREATE DATABASE fashionaura_db ;'),
  bullet('Backend : php artisan serve (:8000).'),
  bullet('Frontend : npm run dev (:5173).'),
  bullet('Reverb : php artisan reverb:start (:8080).'),
  h2('Environnement de production (perspectives)'),
  table(
    ['Composant', 'Solution proposée'],
    [
      ['Frontend', 'Build Vite → Nginx statique'],
      ['Backend', 'VPS PHP-FPM + Nginx + Laravel'],
      ['Base de données', 'MySQL managé'],
      ['WebSocket', 'Laravel Reverb en service systemd'],
      ['IA', 'GEMINI_API_KEY sécurisée'],
      ['SSL', 'Let\'s Encrypt HTTPS'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Schéma de déploiement'),
  diagram('08-deploiement', 380),
  caption('Figure 9 — Architecture de déploiement en production'),
  pageBreak(),

  h1('Conclusion'),
  p('Le projet FashionAura a permis de concevoir et développer une plateforme e-commerce complète dédiée à la mode marocaine. Les objectifs fixés ont été atteints : architecture full stack, gestion multi-rôles, parcours d\'achat, suivi de commandes, messagerie temps réel et assistants IA.'),
  p('Ce projet a consolidé les compétences en React, Laravel, MySQL, Sanctum, Scrum, UML et MERISE.'),
  h2('Difficultés rencontrées'),
  bullet('.... (ex. : synchronisation temps réel Reverb, gestion des rôles)'),
  bullet('....'),
  h2('Perspectives d\'évolution'),
  bullet('Paiement en ligne (CMI, Stripe).'),
  bullet('Application mobile (React Native).'),
  bullet('Notifications push et e-mail automatiques.'),
  bullet('Module de livraison avec suivi colis.'),
  pageBreak(),

  h1('Annexes'),
  h2('Annexe A — Comptes de test'),
  table(
    ['Rôle', 'Email', 'Mot de passe'],
    [
      ['Administrateur', 'admin@fashionaura.com', 'password123'],
      ['Boutique (Sarah)', 'sarah@luxuryfashion.com', 'password123'],
      ['Client', 'client@fashionaura.com', 'password123'],
    ]
  ),
  new Paragraph({ spacing: { after: 200 } }),
  h2('Annexe B — Fichiers diagrammes'),
  p('Tous les diagrammes source (Mermaid) et images PNG sont disponibles dans le dossier docs/diagrams/ du projet.'),
  bullet('01-cas-utilisation.mmd / .png'),
  bullet('02-classes.mmd / .png'),
  bullet('03-sequence-commande.mmd / .png'),
  bullet('04-mcd-merise.mmd / .png'),
  bullet('05-mld-merise.mmd / .png'),
  bullet('06-mpd-mysql.mmd / .png'),
  bullet('07-architecture-3-tiers.mmd / .png'),
  bullet('08-deploiement.mmd / .png'),
  bullet('09-scrum-sprints.mmd / .png'),
  h2('Annexe C — Regénération des diagrammes'),
  p('Commandes : node scripts/generate-diagrams.mjs puis node scripts/generate-rapport.mjs'),
  pageBreak(),

  h1('Bibliographie et webographie'),
  bullet('Documentation React — https://react.dev'),
  bullet('Documentation Laravel — https://laravel.com/docs'),
  bullet('Laravel Sanctum — https://laravel.com/docs/sanctum'),
  bullet('Laravel Reverb — https://laravel.com/docs/reverb'),
  bullet('Documentation MySQL — https://dev.mysql.com/doc/'),
  bullet('Guide Scrum — https://scrumguides.org'),
  bullet('Google Gemini API — https://ai.google.dev'),
  bullet('.... (autres sources utilisées)'),
];

const doc = new Document({
  creator: 'FashionAura',
  title: 'Rapport Projet de Synthèse - FashionAura',
  description: 'Projet de synthèse Web Full Stack - OFPPT',
  sections: [{ properties: {}, children }],
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUT, buffer);
console.log('Rapport généré avec diagrammes :', OUT);
