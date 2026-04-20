import { getCurrentSuite, loadStore, store } from './store.js';

const { createApp, computed } = Vue;

await loadStore();
window.motelStore = store;
updateFavicon(store.favicon);
const currentSuite = getCurrentSuite();

const app = createApp({
    setup() {
        const currentSuiteName = computed(() => currentSuite?.name || '');
        const topoStyle = computed(() => {
            if (!store.facade_image) {
                return null;
            }

            return {
                backgroundImage: `url("${store.facade_image}")`,
            };
        });

        return { currentSuiteName, store, topoStyle };
    },
});

app.provide('store', store);

app.component('gm-header', {
    setup() {
        const store = Vue.inject('store');
        const menuBgStyle = computed(() => {
            if (!store?.menu_background_image) {
                return null;
            }

            return {
                backgroundImage: `url("${store.menu_background_image}")`,
            };
        });

        return { store, menuBgStyle };
    },
    template: await loadTemplate('gm-header'),
});

app.component('gm-fotos-suite', {
    setup() {
        return { currentSuite: getCurrentSuite() };
    },
    template: await loadTemplate('gm-fotos-suite'),
});

app.component('gm-tabela-periodos-precos', {
    setup() {
        const currentSuite = getCurrentSuite();
        const suitePrices = computed(() => (Array.isArray(currentSuite?.prices) ? currentSuite.prices.filter(Boolean) : []));
        const groupedSuitePrices = computed(() => groupPricesByWeekday(suitePrices.value));
        const periodLabel = period => {
            const value = Number(period);
            return value === 1 ? 'Hora' : 'Horas';
        };
        return { groupedSuitePrices, periodLabel };
    },
    template: await loadTemplate('gm-tabela-periodos-precos'),
});

app.component('gm-itens-suite', {
    setup() {
        const currentSuite = getCurrentSuite();
        const suiteItems = computed(() => (Array.isArray(currentSuite?.items) ? currentSuite.items.filter(Boolean) : []));
        return { suiteItems };
    },
    template: await loadTemplate('gm-itens-suite'),
});

app.component('gm-informacoes-importantes', {
    setup() {
        const currentSuite = getCurrentSuite();
        const suiteImportantInfos = computed(() => (Array.isArray(currentSuite?.important_infos) ? currentSuite.important_infos.filter(Boolean) : []));
        return { suiteImportantInfos };
    },
    template: await loadTemplate('gm-informacoes-importantes'),
});

app.component('gm-redes', {
    setup() {
        return { store: Vue.inject('store') };
    },
    template: await loadTemplate('gm-redes'),
});

app.component('gm-suites', {
    setup() {
        return { store: Vue.inject('store') };
    },
    template: await loadTemplate('gm-suites'),
});

app.component('gm-motel', {
    setup() {
        return { store: Vue.inject('store') };
    },
    template: await loadTemplate('gm-motel'),
});

app.component('gm-endereco', {
    setup() {
        return { store: Vue.inject('store') };
    },
    template: await loadTemplate('gm-endereco'),
});

app.component('gm-contatos', {
    setup() {
        return { store: Vue.inject('store') };
    },
    template: await loadTemplate('gm-contatos'),
});

app.component('gm-lista-suites', {
    setup() {
        return { store: Vue.inject('store') };
    },
    template: await loadTemplate('gm-lista-suites'),
});

app.component('gm-footer', {
    setup() {
        return { store: Vue.inject('store') };
    },
    template: await loadTemplate('gm-footer'),
});

app.mount('#app');

Vue.nextTick(_ => loadDeferredScripts());

export async function loadTemplate(template) {
    const response = await fetch(`./templates/${template}.html`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Não foi possível carregar o template: ${template}`);
    }
    return await response.text();
}

function updateFavicon(href) {
    const selector = 'link[rel="icon"]';
    let link = document.head.querySelector(selector);

    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.append(link);
    }

    if (href) {
        link.href = href;
        return;
    }

    link.removeAttribute('href');
}

function groupPricesByWeekday(prices) {
    const grouped = new Map();

    for (const price of prices || []) {
        const weekdays = extractPriceWeekdays(price?.weekday);
        const periods = extractPricePeriods(price?.period);
        const weekdayTargets = weekdays.length ? weekdays : ['Sem dia'];
        const periodTargets = periods.length ? periods : [''];

        for (const weekday of weekdayTargets) {
            const items = grouped.get(weekday) || [];

            for (const period of periodTargets) {
                items.push({
                    period: String(period ?? '').trim(),
                    description: String(price?.description ?? '').trim(),
                    value: String(price?.value ?? '').trim(),
                });
            }

            grouped.set(weekday, items);
        }
    }

    return Array.from(grouped.entries()).map(([weekday, items]) => ({
        weekday,
        items,
    }));
}

function extractPriceWeekdays(weekday) {
    const values = Array.isArray(weekday) ? weekday : parsePriceWeekdays(String(weekday ?? ''));
    const seen = new Set();
    const result = [];

    for (const value of values) {
        const day = String(value ?? '').trim();
        if (!day || seen.has(day)) continue;
        seen.add(day);
        result.push(day);
    }

    return result;
}

function parsePriceWeekdays(value) {
    const text = String(value ?? '').trim();
    if (!text) return [];

    try {
        const decoded = JSON.parse(text);
        if (Array.isArray(decoded)) {
            return decoded;
        }
    } catch {
        // Fallback to legacy single-day strings.
    }

    return text.split(',').map(item => item.trim()).filter(Boolean);
}

function extractPricePeriods(period) {
    const values = Array.isArray(period) ? period : parsePricePeriods(String(period ?? ''));
    const seen = new Set();
    const result = [];

    for (const value of values) {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 1 || number > 24 || seen.has(number)) continue;
        seen.add(number);
        result.push(number);
    }

    return result;
}

function parsePricePeriods(value) {
    const text = String(value ?? '').trim();
    if (!text) return [];

    try {
        const decoded = JSON.parse(text);
        if (Array.isArray(decoded)) {
            return decoded;
        }
    } catch {
        // Fallback to legacy single-period values.
    }

    return text.split(',').map(item => item.trim()).filter(Boolean);
}

