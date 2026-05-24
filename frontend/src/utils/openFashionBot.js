/**
 * Extrait le slug ville depuis l'URL (/cities/fes → fes).
 */
export function getCityFromPathname(pathname = window.location.pathname) {
    const match = pathname.match(/^\/cities\/([^/]+)/);
    return match ? match[1].toLowerCase() : null;
}

/**
 * Ouvre FashionBot avec un contexte optionnel (ville, message pré-rempli).
 * Si on est sur une page ville, le slug est détecté automatiquement depuis l'URL.
 * @param {{ city?: string, cityName?: string, prefill?: string }} options
 */
export function openFashionBot(options = {}) {
    const slug = getCityFromPathname();
    const fromRoute = slug ? { city: slug } : {};
    window.dispatchEvent(new CustomEvent('openFashionBot', {
        detail: { ...fromRoute, ...options },
    }));
}
