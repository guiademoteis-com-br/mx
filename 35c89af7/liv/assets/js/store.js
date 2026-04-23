const { reactive } = Vue;

export const store = reactive({
    ready: false,
    loading: false,
    error: null,
    name: null,
    slug: null,
    asset_version: null,
    review: null,
    primary_color: null,
    secondary_color: null,
    phone: null,
    whatsapp: null,
    whatsapp_link: null,
    email: null,
    zip_code: null,
    state: null,
    city: null,
    neighborhood: null,
    street: null,
    ext_number: null,
    int_number: null,
    facebook_link: null,
    instagram_link: null,
    google_maps_link: null,
    google_maps_embed_src: null,
    facade_image: null,
    menu_background_image: null,
    banner_mobile: null,
    banner_desktop: null,
    logo: null,
    favicon: null,
    suites: [],
});

export async function loadStore() {
    store.loading = true;
    store.error = null;

    try {
        const response = await fetch('dados/motel.json', { cache: 'no-store' });
        if (!response.ok) {
            return store;
        }

        const motel = await response.json();
        Object.assign(store, motel);
        store.asset_version ??= null;
        store.banner_mobile ??= null;
        store.banner_desktop ??= null;
        store.logo ??= null;
        store.facade_image = versionAssetUrl(store.facade_image);
        store.banner_mobile = versionAssetUrl(store.banner_mobile);
        store.banner_desktop = versionAssetUrl(store.banner_desktop);
        store.logo = versionAssetUrl(store.logo);
        store.favicon = versionAssetUrl(store.favicon);
        store.whatsapp_link = buildWhatsAppLink(store.whatsapp);
        store.google_maps_embed_src = buildGoogleMapsEmbedSrc(store.google_maps_link);
        store.suites = normalizeSuites(Array.isArray(motel.suites) ? motel.suites : []);
        store.menu_background_image = resolveSiteAssetUrl(getMostExpensiveSuiteImage(store.suites));
        store.ready = true;
        return store;
    } catch (error) {
        store.error = error instanceof Error ? error.message : 'Erro ao carregar o motel.';
        return store;
    } finally {
        store.loading = false;
    }
}

export function formatPriceValue(value) {
    const parsed = parsePriceValue(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return '';
    }

    return parsed.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function getSuiteBySlug(slug) {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) {
        return null;
    }

    return store.suites.find(suite => normalizeSlug(suite?.slug ?? suite?.name) === normalizedSlug) ?? null;
}

export function getCurrentSuite() {
    const slug = new URLSearchParams(window.location.search).get('slug');
    return getSuiteBySlug(slug) ?? store.suites[0] ?? null;
}

function normalizeSlug(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function buildGoogleMapsEmbedSrc(link) {
    const value = String(link ?? '').trim();
    if (!value) {
        return null;
    }

    if (/^https?:\/\/(?:www\.)?google\.[^/]+\/maps\/embed/i.test(value)) {
        return value;
    }

    try {
        const url = new URL(value);
        if (!/google\.[^/]+$/i.test(url.hostname) || !url.pathname.includes('/maps')) {
            return null;
        }

        if (url.pathname.includes('/maps/embed')) {
            return url.toString();
        }

        const destination = extractGoogleMapsDestination(url);
        if (destination) {
            return `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`;
        }

        const coordinates = extractGoogleMapsCoordinates(value);
        if (coordinates) {
            return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=${coordinates.zoom}&output=embed`;
        }

        if (!url.searchParams.has('output')) {
            url.searchParams.set('output', 'embed');
        }

        return url.toString();
    } catch {
        return null;
    }
}

function buildWhatsAppLink(value) {
    const link = String(value ?? '').trim();
    if (!link) {
        return null;
    }

    if (/^https?:\/\/(?:api\.)?whatsapp\.com\//i.test(link) || /^https?:\/\/(?:wa\.me|tintim\.link)\//i.test(link)) {
        return link;
    }

    const digits = link.replace(/\D+/g, '');
    return digits ? `https://api.whatsapp.com/send?phone=${digits}` : null;
}

function getMostExpensiveSuiteImage(suites) {
    if (!Array.isArray(suites) || !suites.length) {
        return null;
    }

    const suite = suites.reduce((winner, current) => {
        if (!winner) {
            return current;
        }

        return getSuiteMaxPriceValue(current) > getSuiteMaxPriceValue(winner) ? current : winner;
    }, null);

    return getSuiteFirstImage(suite);
}

function getSuiteMaxPriceValue(suite) {
    if (!suite) {
        return 0;
    }

    const prices = Array.isArray(suite.prices) ? suite.prices : [];
    const maxPrice = prices.reduce((max, price) => Math.max(max, parsePriceValue(price?.value)), 0);
    return maxPrice > 0 ? maxPrice : parsePriceValue(suite.first_price);
}

function getSuiteFirstImage(suite) {
    if (!suite) {
        return null;
    }

    return (Array.isArray(suite.images) && suite.images.length ? suite.images[0] : null) || suite.cover_image || null;
}

function normalizeSuites(suites) {
    return (Array.isArray(suites) ? suites : []).map(suite => ({
        ...suite,
        cover_image: versionAssetUrl(suite?.cover_image),
        images: Array.isArray(suite?.images) ? suite.images.map(versionAssetUrl) : [],
    }));
}

function parsePriceValue(value) {
    const normalized = String(value ?? '')
        .trim()
        .replace(/[^\d,.-]/g, '');

    if (!normalized) {
        return 0;
    }

    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');
    const decimalSeparatorIndex = Math.max(lastComma, lastDot);

    const decimalString =
        decimalSeparatorIndex > -1
            ? `${normalized.slice(0, decimalSeparatorIndex).replace(/[.,]/g, '')}.${normalized.slice(decimalSeparatorIndex + 1).replace(/[^\d]/g, '') || '0'}`
            : normalized.replace(/[^\d.-]/g, '');

    const parsed = Number.parseFloat(decimalString);
    return Number.isFinite(parsed) ? parsed : 0;
}

function resolveSiteAssetUrl(path) {
    const value = String(path ?? '').trim();
    if (!value) {
        return null;
    }

    return appendAssetVersion(new URL(value, window.location.href));
}

function versionAssetUrl(path) {
    const value = String(path ?? '').trim();
    if (!value) {
        return null;
    }

    return appendAssetVersion(new URL(value, window.location.href));
}

function appendAssetVersion(url) {
    if (!(url instanceof URL)) {
        return null;
    }

    if (url.origin !== window.location.origin) {
        return url.href;
    }

    const assetVersion = String(store.asset_version ?? '').trim();
    if (!assetVersion) {
        return url.href;
    }

    url.searchParams.set('v', assetVersion);
    return url.href;
}

function extractGoogleMapsDestination(url) {
    const decodedPath = decodeURIComponent(url.pathname).replace(/\+/g, ' ');
    const prefix = '/maps/dir//';
    const destinationStart = decodedPath.indexOf(prefix);
    const destinationEnd = decodedPath.indexOf('/@');

    if (destinationStart === 0 && destinationEnd > prefix.length) {
        return decodedPath.slice(prefix.length, destinationEnd).trim();
    }

    const queryValue = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('destination');
    return queryValue ? decodeURIComponent(queryValue).replace(/\+/g, ' ').trim() : null;
}

function extractGoogleMapsCoordinates(value) {
    const match = String(value).match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)z/i);
    if (!match) {
        return null;
    }

    return {
        lat: match[1],
        lng: match[2],
        zoom: match[3],
    };
}
