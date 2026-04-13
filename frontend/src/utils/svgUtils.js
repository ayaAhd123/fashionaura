/**
 * SVG Default Images
 * Images par défaut en SVG pour les placeholders
 */

export const DEFAULT_SVG_IMAGES = {
  // Image produit par défaut
  PRODUCT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#D9DDDF"/>
    <g opacity="0.5">
      <rect x="80" y="60" width="240" height="280" fill="none" stroke="#8A908C" stroke-width="2"/>
      <path d="M140 200L200 120L260 200" fill="none" stroke="#8A908C" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="160" cy="140" r="12" fill="#8A908C"/>
    </g>
  </svg>`,

  // Boutique par défaut
  BOUTIQUE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#D9DDDF"/>
    <g opacity="0.5">
      <rect x="60" y="100" width="280" height="240" fill="none" stroke="#8A908C" stroke-width="2"/>
      <polygon points="60,100 200,40 340,100" fill="none" stroke="#8A908C" stroke-width="2"/>
      <rect x="100" y="160" width="50" height="60" fill="none" stroke="#8A908C" stroke-width="2"/>
      <rect x="170" y="160" width="50" height="60" fill="none" stroke="#8A908C" stroke-width="2"/>
      <rect x="240" y="160" width="50" height="60" fill="none" stroke="#8A908C" stroke-width="2"/>
      <rect x="80" y="240" width="240" height="20" fill="#8A908C" opacity="0.3"/>
    </g>
  </svg>`,

  // Avatar par défaut
  USER: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#D9DDDF"/>
    <circle cx="200" cy="120" r="60" fill="#8A908C" opacity="0.5"/>
    <path d="M120 240 Q120 200 200 200 Q280 200 280 240 L280 340 L120 340 Z" fill="#8A908C" opacity="0.5"/>
  </svg>`,

  // Catégorie par défaut
  CATEGORY: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#D9DDDF"/>
    <rect x="60" y="80" width="140" height="140" fill="none" stroke="#8A908C" stroke-width="2" rx="8"/>
    <rect x="200" y="80" width="140" height="140" fill="none" stroke="#8A908C" stroke-width="2" rx="8"/>
    <rect x="60" y="240" width="140" height="140" fill="none" stroke="#8A908C" stroke-width="2" rx="8"/>
    <rect x="200" y="240" width="140" height="140" fill="none" stroke="#8A908C" stroke-width="2" rx="8"/>
  </svg>`,
};

/**
 * Convertit un SVG string en data URL
 * @param {string} svgString - String du SVG
 * @returns {string} - Data URL
 */
export const svgToDataUrl = (svgString) => {
  const encoded = btoa(svgString);
  return `data:image/svg+xml;base64,${encoded}`;
};

/**
 * Obtient une URL d'image par défaut
 * @param {string} type - Type d'image
 * @returns {string} - Data URL du SVG
 */
export const getDefaultImageUrl = (type = 'PRODUCT') => {
  const svg = DEFAULT_SVG_IMAGES[type] || DEFAULT_SVG_IMAGES.PRODUCT;
  return svgToDataUrl(svg);
};

/**
 * Crée un SVG avatar avec initiales
 * @param {string} initials - Initiales (max 2 caractères)
 * @param {string} bgColor - Couleur de fond (hex)
 * @param {string} textColor - Couleur du texte (hex)
 * @returns {string} - SVG string
 */
export const createInitialAvatar = (initials = '?', bgColor = '#6E7F78', textColor = '#FFFFFF') => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="100" fill="${bgColor}"/>
    <text x="100" y="110" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle" font-family="Arial">
      ${initials}
    </text>
  </svg>`;
};

/**
 * Crée un SVG avatar avec initiales en data URL
 * @param {string} initials - Initiales
 * @param {string} bgColor - Couleur de fond
 * @param {string} textColor - Couleur du texte
 * @returns {string} - Data URL
 */
export const createInitialAvatarUrl = (initials = '?', bgColor = '#6E7F78', textColor = '#FFFFFF') => {
  const svg = createInitialAvatar(initials, bgColor, textColor);
  return svgToDataUrl(svg);
};

/**
 * Crée un SVG de gradient coloré
 * @param {string} color1 - Première couleur
 * @param {string} color2 - Deuxième couleur
 * @returns {string} - SVG string
 */
export const createGradientBg = (color1 = '#6E7F78', color2 = '#D2B8A3') => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#grad1)"/>
  </svg>`;
};

/**
 * Crée un SVG pattern
 * @param {string} pattern - Type: 'dots', 'lines', 'grid'
 * @param {string} fgColor - Couleur de premier plan
 * @param {string} bgColor - Couleur de fond
 * @returns {string} - SVG string
 */
export const createPattern = (pattern = 'dots', fgColor = '#8A908C', bgColor = '#D9DDDF') => {
  const patterns = {
    dots: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${bgColor}"/>
      <circle cx="10" cy="10" r="3" fill="${fgColor}"/>
      <circle cx="30" cy="10" r="3" fill="${fgColor}"/>
      <circle cx="10" cy="30" r="3" fill="${fgColor}"/>
      <circle cx="30" cy="30" r="3" fill="${fgColor}"/>
    </svg>`,
    lines: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${bgColor}"/>
      <line x1="0" y1="0" x2="40" y2="40" stroke="${fgColor}" stroke-width="1"/>
      <line x1="40" y1="0" x2="0" y2="40" stroke="${fgColor}" stroke-width="1"/>
    </svg>`,
    grid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${bgColor}"/>
      <line x1="20" y1="0" x2="20" y2="40" stroke="${fgColor}" stroke-width="1"/>
      <line x1="0" y1="20" x2="40" y2="20" stroke="${fgColor}" stroke-width="1"/>
    </svg>`,
  };

  return patterns[pattern] || patterns.dots;
};

export default {
  DEFAULT_SVG_IMAGES,
  svgToDataUrl,
  getDefaultImageUrl,
  createInitialAvatar,
  createInitialAvatarUrl,
  createGradientBg,
  createPattern,
};
