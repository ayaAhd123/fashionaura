import { getCitySlug } from './cityI18n';

// Thèmes visuels par ville (partagés entre la page ville et la page magasin).
export const CITY_THEMES = {
  tanger: {
    bg: '#273462', bgRgb: '39, 52, 98', main: '#045490', mid: '#84B7CE', light: '#FFFFFF', accent: '#FFF08C',
    effect: 'waves',
  },
  casablanca: {
    bg: '#0D0D0B', bgRgb: '13, 13, 11', main: '#C4A882', mid: '#D4D0C8', light: '#F0EEE8', accent: '#FFFFFF',
    effect: 'artdeco',
  },
  rabat: {
    bg: '#061A0E', bgRgb: '6, 26, 14', main: '#1A7A44', mid: '#7AC49A', light: '#E8F5EC', accent: '#D4AF6A',
    effect: 'garden',
  },
  fes: {
    bg: '#1A0E00', bgRgb: '26, 14, 0', main: '#C4821B', mid: '#D4AF6A', light: '#FBF0CC', accent: '#3A2800',
    effect: 'zellige',
  },
  marrakech: {
    bg: '#0F0200', bgRgb: '15, 2, 0', main: '#C04820', mid: '#E07840', light: '#F5D5C0', accent: '#F0C898',
    effect: 'heat',
  },
  agadir: {
    bg: '#0A1628', bgRgb: '10, 22, 40', main: '#3B82C4', mid: '#7CB9E8', light: '#E8F4FC', accent: '#F5D0A0',
    effect: 'coast',
  },
  meknes: {
    bg: '#1A1208', bgRgb: '26, 18, 8', main: '#8B6914', mid: '#C4A035', light: '#F5E6C8', accent: '#D4AF6A',
    effect: 'imperial',
  },
  oujda: {
    bg: '#120818', bgRgb: '18, 8, 24', main: '#7B3FA0', mid: '#B87FD4', light: '#F0E0F8', accent: '#E8C872',
    effect: 'dawn',
  },
};

export const THEME_CLASS_NAMES = Object.keys(CITY_THEMES).map((slug) => `theme-${slug}`);

export function getCityTheme(city, fallbackSlug = 'casablanca') {
  const slug = getCitySlug(city);
  return CITY_THEMES[slug] || CITY_THEMES[fallbackSlug];
}

// Applique les variables CSS + la classe de thème sur <body>. Retourne un cleanup.
export function applyCityTheme(city) {
  const slug = getCitySlug(city);
  const theme = CITY_THEMES[slug] || CITY_THEMES.casablanca;
  const root = document.documentElement;

  root.style.setProperty('--city-bg', theme.bg);
  root.style.setProperty('--city-bg-rgb', theme.bgRgb);
  root.style.setProperty('--city-main', theme.main);
  root.style.setProperty('--city-mid', theme.mid);
  root.style.setProperty('--city-light', theme.light);
  root.style.setProperty('--city-accent', theme.accent);
  root.style.setProperty('--cursor-color', theme.main);

  document.body.classList.remove(...THEME_CLASS_NAMES);
  document.body.classList.add(`theme-${slug}`);

  return () => {
    document.body.classList.remove(...THEME_CLASS_NAMES);
  };
}
