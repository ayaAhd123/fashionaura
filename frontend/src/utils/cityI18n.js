const NAME_TO_SLUG = {
    Tanger: 'tanger',
    Casablanca: 'casablanca',
    Marrakech: 'marrakech',
    Rabat: 'rabat',
    Fès: 'fes',
    Meknès: 'meknes',
    Agadir: 'agadir',
    Oujda: 'oujda',
};

export function getCitySlug(city) {
    if (!city) return '';
    if (city.slug) return city.slug;
    return NAME_TO_SLUG[city.name] || String(city.name || '').toLowerCase();
}

export function cityField(t, city, field) {
    if (!city) return '';
    const slug = getCitySlug(city);
    const key = `cities.${slug}.${field}`;
    const fallbacks = {
        name: city.name,
        region: city.region,
        nickname: '',
        poetic: '',
        hero_title: city.name,
    };
    return t(key, { defaultValue: fallbacks[field] ?? city.name ?? '' });
}

export function cityName(t, city) {
    return cityField(t, city, 'name');
}

export function cityRegion(t, city) {
    return cityField(t, city, 'region');
}

export function cityHeroTitle(t, city) {
    return cityField(t, city, 'hero_title');
}

export function cityNickname(t, city) {
    return cityField(t, city, 'nickname');
}

export function cityPoetic(t, city) {
    return cityField(t, city, 'poetic');
}

export const MARQUEE_SLUGS = [
    'casablanca', 'marrakech', 'tanger', 'fes', 'rabat', 'agadir', 'meknes', 'oujda',
];

export function marqueeCityText(t) {
    const names = MARQUEE_SLUGS.map((slug) =>
        t(`cities.${slug}.name`, { defaultValue: slug }).toUpperCase()
    );
    return `${names.join(' · ')} · `;
}

export function getCityTheme(city, themes, fallbackSlug = 'casablanca') {
    const slug = getCitySlug(city);
    return themes[slug] || themes[fallbackSlug];
}
