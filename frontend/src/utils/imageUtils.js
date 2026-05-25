/**
 * Image Utility Functions
 * Gère les images par défaut, placeholders et optimisations
 */

// Images par défaut (placeholder)
export const DEFAULT_IMAGES = {
  PRODUCT: '/images/default-product.png',
  BOUTIQUE: '/images/default-boutique.png',
  USER: '/images/default-user.png',
  CATEGORY: '/images/default-category.png',
};

// Générateur de couleurs de gradient pour les placeholders
const GRADIENTS = [
  'from-sage-green to-sand-beige',
  'from-dusty-blue to-sage-green',
  'from-sand-beige to-dusty-blue',
  'from-olive-gray to-sage-green',
  'from-dusty-blue to-sand-beige',
];

/**
 * Génère un gradient CSS basé sur un ID
 * @param {string|number} id - ID pour le hash
 * @returns {string} - Classe Tailwind du gradient
 */
export const getGradientByHash = (id) => {
  if (!id) return GRADIENTS[0];
  const hash = String(id).charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[hash];
};

/**
 * Génère une couleur de fond basée sur un texte
 * @param {string} text - Texte pour générer la couleur
 * @returns {object} - {bg, text} hex colors
 */
export const getColorFromText = (text) => {
  if (!text) return { bg: '#6E7F78', text: '#FFFFFF' };
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    { bg: '#6E7F78', text: '#FFFFFF' },  // Sage Green
    { bg: '#D2B8A3', text: '#2C1810' },  // Sand Beige
    { bg: '#B7C6C9', text: '#2C1810' },  // Dusty Blue
    { bg: '#8A908C', text: '#FFFFFF' },  // Olive Gray
  ];
  
  return colors[Math.abs(hash % colors.length)];
};

/**
 * Génère une initiale avatar
 * @param {string} name - Nom pour générer l'initiale
 * @returns {string} - La première lettre
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Génère une URL d'avatar par placeholder service
 * @param {string} name - Nom
 * @param {number} size - Taille
 * @returns {string} - URL de l'avatar
 */
export const getAvatarUrl = (name, size = 64) => {
  const initials = getInitials(name);
  const colors = getColorFromText(name);
  // Utiliser un service de placeholder ou générer localement
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'%3E%3Crect fill='${encodeURIComponent(colors.bg)}' width='${size}' height='${size}'/%3E%3Ctext x='50%25' y='50%25' font-size='${size / 2}' font-family='Arial' font-weight='bold' fill='${encodeURIComponent(colors.text)}' text-anchor='middle' dy='.3em'%3E${initials}%3C/text%3E%3C/svg%3E`;
};

/**
 * Résout une URL média (relative storage, API, ou absolue).
 * @param {string} url
 * @returns {string|null}
 */
export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');

  if (trimmed.startsWith('/')) return `${origin}${trimmed}`;
  return `${origin}/${trimmed}`;
};

/**
 * Optimise une image URL pour le web
 * @param {string} url - URL originale
 * @param {number} width - Largeur cible
 * @param {number} quality - Qualité (0-100)
 * @returns {string} - URL optimisée
 */
export const optimizeImageUrl = (url, width = 400, quality = 80) => {
  if (!url) return DEFAULT_IMAGES.PRODUCT;

  const resolved = resolveMediaUrl(url) || url;

  // Si c'est une URL locale
  if (resolved.startsWith('/')) return resolved;
  
  // Si c'est une URL d'API
  if (resolved.includes('api')) {
    return `${resolved}?w=${width}&q=${quality}`;
  }

  return resolved;
};

/**
 * Obtient une image avec fallback
 * @param {string} url - URL principale
 * @param {string} fallback - URL de fallback
 * @returns {string} - URL à utiliser
 */
export const getImageUrl = (url, fallback = DEFAULT_IMAGES.PRODUCT) => {
  return url ? optimizeImageUrl(url) : fallback;
};

/**
 * Génère une miniature pour une image
 * @param {string} url - URL originale
 * @returns {string} - URL de la miniature
 */
export const getThumbnailUrl = (url) => {
  return optimizeImageUrl(url, 150, 70);
};

/**
 * Génère une URL pour la galerie
 * @param {string} url - URL originale
 * @returns {string} - URL optimisée pour galerie
 */
export const getGalleryImageUrl = (url) => {
  return optimizeImageUrl(url, 800, 90);
};

/**
 * Précharge une image
 * @param {string} url - URL de l'image
 * @returns {Promise} - Résout quand l'image est chargée
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

/**
 * Précharge plusieurs images
 * @param {array} urls - Array d'URLs
 * @returns {Promise} - Résout quand toutes les images sont chargées
 */
export const preloadImages = (urls) => {
  return Promise.all(urls.map(url => preloadImage(url).catch(() => null)));
};

/**
 * Classe pour gérer les images
 */
export class ImageManager {
  constructor() {
    this.cache = new Map();
    this.loadingStates = new Map();
  }

  /**
   * Obtient une image avec cache
   * @param {string} url - URL de l'image
   * @param {string} fallback - Fallback URL
   * @returns {string} - URL de l'image
   */
  getImage(url, fallback = DEFAULT_IMAGES.PRODUCT) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    const result = getImageUrl(url, fallback);
    this.cache.set(url, result);
    return result;
  }

  /**
   * Précharge et cache une image
   * @param {string} url - URL de l'image
   */
  async preload(url) {
    if (this.loadingStates.has(url)) {
      return this.loadingStates.get(url);
    }

    const promise = preloadImage(url)
      .then(() => {
        this.cache.set(url, url);
        return url;
      })
      .catch(() => {
        this.cache.set(url, DEFAULT_IMAGES.PRODUCT);
        return DEFAULT_IMAGES.PRODUCT;
      });

    this.loadingStates.set(url, promise);
    return promise;
  }

  /**
   * Efface le cache
   */
  clearCache() {
    this.cache.clear();
    this.loadingStates.clear();
  }
}

// Instance globale
export const imageManager = new ImageManager();
