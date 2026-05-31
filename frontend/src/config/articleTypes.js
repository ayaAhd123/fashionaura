// Taxonomie partagée entre la page ville et la page magasin.
// `category` => filtre par catégorie produit (slug en base).
// `keyword`  => recherche par nom (styles / occasions sans catégorie dédiée).

export const PRODUCT_TYPES = [
  { id: 'robes', label: 'Robes', category: 'robes' },
  { id: 'caftans', label: 'Caftans', keyword: 'caftan' },
  { id: 'chemises', label: 'Chemises', category: 'chemises' },
  { id: 'tshirts', label: 'T-shirts', keyword: 't-shirt' },
  { id: 'pantalons', label: 'Pantalons', category: 'pantalons' },
  { id: 'vestes', label: 'Vestes', keyword: 'veste' },
  { id: 'manteaux', label: 'Manteaux', keyword: 'manteau' },
  { id: 'chaussures', label: 'Chaussures', category: 'chaussures' },
  { id: 'sacs', label: 'Sacs', category: 'sacs' },
  { id: 'accessoires', label: 'Accessoires', category: 'accessoires' },
  { id: 'bijoux', label: 'Bijoux', category: 'bijoux' },
];

export const OCCASION_TYPES = [
  { id: 'soiree', label: 'Soirée', keyword: 'soirée' },
  { id: 'mariage', label: 'Mariage', keyword: 'mariage' },
  { id: 'formel', label: 'Formel', keyword: 'formel' },
  { id: 'casual', label: 'Casual', keyword: 'casual' },
  { id: 'ete', label: 'Été', keyword: 'été' },
  { id: 'hiver', label: 'Hiver', keyword: 'hiver' },
];

export const ALL_ARTICLE_TYPES = [...PRODUCT_TYPES, ...OCCASION_TYPES];

// base = { city: slug } pour une ville, ou { boutique: slug } pour un magasin
export const buildArticleFilters = (base, type, search = '') => {
  const filters = { ...base };
  if (type?.category) filters.category = type.category;
  const terms = [type?.keyword, search.trim()].filter(Boolean);
  if (terms.length) filters.search = terms.join(' ');
  return filters;
};
