import { formatPriceValue, getCurrentSuite, loadStore, store } from './store.js';

const { createApp, computed, ref } = Vue;

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

const PRICE_WEEKDAY_OPTIONS = [
    { value: 0, label: 'dom', title: 'DOM' },
    { value: 1, label: 'lun', title: 'LUN' },
    { value: 2, label: 'mar', title: 'MAR' },
    { value: 3, label: 'mié', title: 'MIÉ' },
    { value: 4, label: 'jue', title: 'JUE' },
    { value: 5, label: 'vie', title: 'VIE' },
    { value: 6, label: 'sáb', title: 'SÁB' },
];

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
        const todayWeekday = new Date().getDay();
        const activePriceWeekday = ref(todayWeekday);
        const suitePrices = computed(() => (Array.isArray(currentSuite?.prices) ? currentSuite.prices.filter(Boolean) : []));
        const groupedSuitePrices = computed(() => groupPricesByWeekday(suitePrices.value));
        const activeSuitePrices = computed(() => groupedSuitePrices.value.get(Number(activePriceWeekday.value)) || []);
        const activePriceDayLabel = computed(() => {
            const activeWeekday = Number(activePriceWeekday.value);
            if (activeWeekday === todayWeekday) {
                return 'HOY';
            }

            return PRICE_WEEKDAY_OPTIONS.find(day => day.value === activeWeekday)?.title || '';
        });
        const periodLabel = period => {
            const value = Number(period);
            return value === 1 ? 'Hora' : 'Horas';
        };
        return {
            activePriceDayLabel,
            activePriceWeekday,
            activeSuitePrices,
            priceWeekdayOptions: PRICE_WEEKDAY_OPTIONS,
            periodLabel,
            formatPriceValue,
        };
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
        return { store: Vue.inject('store'), formatPriceValue };
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
    const grouped = new Map(PRICE_WEEKDAY_OPTIONS.map(day => [day.value, []]));

    for (const price of prices || []) {
        const weekdays = extractPriceWeekdays(price?.weekday);
        const periods = extractPricePeriods(price?.period);
        const weekdayTargets = weekdays.length ? weekdays : PRICE_WEEKDAY_OPTIONS.map(day => day.value);
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

    return grouped;
}

function extractPriceWeekdays(weekday) {
    const values = Array.isArray(weekday) ? weekday : parsePriceWeekdays(String(weekday ?? ''));
    const seen = new Set();
    const result = [];

    for (const value of values) {
        const day = normalizeWeekdayIndex(value);
        if (day === null || seen.has(day)) continue;
        seen.add(day);
        result.push(day);
    }

    return result;
}

function normalizeWeekdayIndex(value) {
    const numericValue = Number(value);
    if (String(value ?? '').trim() !== '' && Number.isInteger(numericValue) && numericValue >= 0 && numericValue <= 6) {
        return numericValue;
    }

    const text = normalizeWeekdayText(value);
    const weekdayMap = {
        domingo: 0,
        dom: 0,
        segunda: 1,
        segundafeira: 1,
        lunes: 1,
        lun: 1,
        segundaferia: 1,
        terca: 2,
        tercafeira: 2,
        martes: 2,
        mar: 2,
        quarta: 3,
        quartafeira: 3,
        miercoles: 3,
        mie: 3,
        quinta: 4,
        quintafeira: 4,
        jueves: 4,
        jue: 4,
        sexta: 5,
        sextafeira: 5,
        viernes: 5,
        vie: 5,
        sabado: 6,
        sab: 6,
    };

    return Object.prototype.hasOwnProperty.call(weekdayMap, text) ? weekdayMap[text] : null;
}

function normalizeWeekdayText(value) {
    return String(value ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');
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


