import { createApp, computed, onMounted, provide, ref } from 'vue';
import { loadMotelData, resolveSuiteBySlug, placeholderImage, hexToHsl } from './data.js';
import { AppHeader } from './components/AppHeader.js';
import { AppFooter } from './components/AppFooter.js';
import { SuiteSlider } from './components/SuiteSlider.js';
import { PriceTable } from './components/PriceTable.js';

const page = document.body.dataset.page || 'home';
const suiteSlug = new URLSearchParams(window.location.search).get('slug') || '';

function applyPrimaryColor(hex) {
    const hsl = hexToHsl(hex);
    if (!hsl) return;
    const root = document.documentElement;
    root.style.setProperty('--clr-primary-h', hsl.h);
    root.style.setProperty('--clr-primary-s', hsl.s);
    root.style.setProperty('--clr-primary-l', hsl.l);
}

const app = createApp({
    template: `
    <div>
      <template v-if="ready && motel">
        <template v-if="page === 'home'">
          <app-header></app-header>
          <section class="banner">
            <div class="banner__slider">
              <div class="banner__content">
                <div class="banner__content--image">
                  <img :src="bannerDesktopSrc" class="img-fluid d-none d-lg-block" :alt="motel.name || 'Motel'">
                  <img :src="bannerMobileSrc" class="img-fluid d-sm-block d-md-block d-lg-none" :alt="motel.name || 'Motel'">
                </div>
              </div>
            </div>
            <div class="banner__explore">
              <svg width="12" height="19" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.251051 13.5652C-0.0836844 13.228 -0.0836843 12.6811 0.251051 12.3439C0.585786 12.0066 1.1285 12.0066 1.46323 12.3439L5.14286 16.0514L5.14286 0.863637C5.14286 0.386663 5.52661 2.41576e-07 6 2.62268e-07C6.47339 2.82961e-07 6.85714 0.386663 6.85714 0.863637L6.85714 16.0514L10.5368 12.3439C10.8715 12.0066 11.4142 12.0066 11.7489 12.3439C12.0837 12.6811 12.0837 13.228 11.7489 13.5652L6.60609 18.747C6.27136 19.0843 5.72864 19.0843 5.39391 18.747L0.251051 13.5652Z" fill="white"></path>
              </svg>
            </div>
          </section>

          <section class="destaque">
            <div class="destaque__content">
              <div class="Hotel__header title-header">
                <h2 class="title"><span><strong>S</strong> </span>uites</h2>
              </div>
              <div class="container-fluid">
                <suite-slider :suites="featuredSuites"></suite-slider>
              </div>
              <div class="destaque__btn d-sm-block d-md-block d-lg-none">
                <a href="suites.html" class="btn btn-dark">Ver todas las suites</a>
              </div>
            </div>
          </section>

          <section class="Hotel">
            <div class="Hotel__header title-header">
              <h2 class="title"><span><strong>S</strong> </span>obre el Hotel</h2>
            </div>
            <div class="container">
              <div class="Hotel__content">
                <div class="Hotel__content--text col-md-6">
                  <h3 class="serif">{{ motel.name }}</h3>
                  <p>Un espacio donde la pasión cobra vida</p>
                  <div class="Hotel__content--subtext">
                    <p v-html="motel.review || aboutText"></p>
                  </div>
                </div>
                <div class="Hotel__content--image col-md-6">
                  <div>
                    <img :src="motel.facade_image || defaultFacadeImage" class="img-fluid" alt="imagen de la habitación">
                    <p class="mt-3">{{ fullAddress }}</p>
                  </div>
                  <div class="Hotel__content--btn">
                    <a href="hotel.html">
                      <span>
                        <svg width="44" height="31" viewBox="0 0 44 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="15.6279" cy="15.7441" r="14.8744" stroke="white" stroke-width="0.762791" stroke-dasharray="2.86 2.86" />
                          <g clip-path="url(#clip0_8035_738)">
                            <path d="M42.4399 13.7514L38.7499 10.0233C38.6612 9.93388 38.5558 9.86295 38.4396 9.81454C38.3234 9.76613 38.1988 9.74121 38.0729 9.74121C37.947 9.74121 37.8224 9.76613 37.7062 9.81454C37.59 9.86295 37.4846 9.93388 37.3959 10.0233C37.2183 10.2019 37.1187 10.4436 37.1187 10.6955C37.1187 10.9474 37.2183 11.189 37.3959 11.3677L40.7904 14.7907H11.8138C11.561 14.7907 11.3184 14.8911 11.1396 15.07C10.9608 15.2488 10.8604 15.4913 10.8604 15.7442C10.8604 15.9971 10.9608 16.2396 11.1396 16.4184C11.3184 16.5972 11.561 16.6977 11.8138 16.6977H40.8476L37.3959 20.1398C37.3066 20.2284 37.2356 20.3339 37.1872 20.45C37.1388 20.5662 37.1139 20.6909 37.1139 20.8167C37.1139 20.9426 37.1388 21.0672 37.1872 21.1834C37.2356 21.2996 37.3066 21.4051 37.3959 21.4937C37.4846 21.5831 37.59 21.654 37.7062 21.7024C37.8224 21.7508 37.947 21.7758 38.0729 21.7758C38.1988 21.7758 38.3234 21.7508 38.4396 21.7024C38.5558 21.654 38.6612 21.5831 38.7499 21.4937L42.4399 17.7942C42.9756 17.2578 43.2764 16.5308 43.2764 15.7728C43.2764 15.0148 42.9756 14.2877 42.4399 13.7514Z" fill="white" />
                          </g>
                          <defs><clipPath id="clip0_8035_738"><rect width="32.4186" height="22.8837" fill="white" transform="translate(10.8604 4.30225)" /></clipPath></defs>
                        </svg>
                      </span>
                      <p>Leer más sobre el Hotel</p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="local">
            <div class="local__header title-header">
              <h2 class="title"><span><strong>D</strong> </span>irección</h2>
            </div>
            <div class="container">
              <div class="local__content">
                <div class="local__content--image col-md-12">
                  <a href="direccion.html">
                    <img :src="motel.logo || defaultLogoImage" class="img-fluid" loading="lazy" alt="logotipo del Hotel">
                  </a>
                </div>
              </div>
              <div class="local__content--text">
                <div class="local__content--adress col-md-7">
                  <h3>{{ fullAddress }}</h3>
                </div>
                <div class="local__content--btn col-md-5">
                    <a :href="googleMapsLink" target="_blank" rel="noreferrer">
                    Trazar ruta
                    <span><i class="fa-solid fa-arrow-right"></i></span>
                  </a>
                </div>
              </div>
            </div>
          </section>
          <app-footer></app-footer>
        </template>

        <template v-else-if="page === 'suites'">
          <app-header></app-header>
          <section class="topo">
            <div class="topo__content">
              <div class="topo__content--text">
                <h2>{{ motel.name }} Suites</h2>
              </div>
            </div>
          </section>
          <section class="habitaciones internas">
            <div class="container">
              <div class="habitaciones__internas">
                <suite-slider :suites="motel.suites || []"></suite-slider>
              </div>
            </div>
          </section>
          <app-footer></app-footer>
        </template>

        <template v-else-if="page === 'suite'">
          <app-header></app-header>
          <section class="topo">
            <div class="topo__content">
              <div class="topo__content--text">
                <h2>{{ currentSuiteName }}</h2>
              </div>
            </div>
          </section>
          <section class="suit-int internas">
            <div class="container">
              <div class="habitaciones__content--itens">
                <div class="habitaciones__slide--itens">
                  <div v-if="hasSuiteImages" class="habitaciones-int--slide" ref="suiteImageSlider">
                    <div v-for="image in suiteImages" :key="image">
                      <img :src="image" :alt="currentSuiteName">
                    </div>
                  </div>
                  <img v-else :src="suitePlaceholderImage" alt="suíte" class="img-fluid">
                </div>
                <div class="habitacione-prices">
                  <price-table :suite="currentSuite"></price-table>
                </div>
                <div class="habitaciones__important">
                  <h4>Importante</h4>
                  <p v-for="(item, index) in importantInfos" :key="index">{{ item }}</p>
                </div>
              </div>
            </div>
          </section>
          <app-footer></app-footer>
        </template>

        <template v-else>
          <app-header></app-header>
          <section class="topo">
            <div class="topo__content">
              <div class="topo__content--text">
                <h2>Contato</h2>
              </div>
            </div>
          </section>
          <section class="internas localizacao">
            <div class="container">
              <div class="localizacao__content">
                <div class="localizacao__content--text">
                  <h3>{{ fullAddress }}</h3>
                  <a :href="googleMapsLink" target="_blank" rel="noreferrer" class="btn btn-dark">Abrir mapa</a>
                </div>
                <div class="localizacao__content--mapa">
                  <img :src="motel.facade_image || defaultFacadeImage" class="img-fluid" alt="mapa">
                </div>
              </div>
            </div>
          </section>
          <app-footer></app-footer>
        </template>
      </template>

      <div v-else class="p-5 text-center">
        Carregando...
      </div>
    </div>
  `,
    setup() {
        const motel = ref(null);
        const ready = ref(false);
        const suites = computed(() => (motel.value && Array.isArray(motel.value.suites) ? motel.value.suites : []));
        const currentSuite = computed(() => resolveSuiteBySlug(motel.value, suiteSlug) || suites.value[0] || null);
        const currentSuiteName = computed(() => (currentSuite.value && currentSuite.value.name) || 'Suíte');
        const suiteImages = computed(() =>
            currentSuite.value && Array.isArray(currentSuite.value.images) ? currentSuite.value.images : [],
        );
        const hasSuiteImages = computed(() => suiteImages.value.length > 0);
        const importantInfos = computed(() =>
            currentSuite.value && Array.isArray(currentSuite.value.important_infos) ? currentSuite.value.important_infos : [],
        );
        const featuredSuites = computed(() => suites.value.slice(0, 3));
        const fullAddress = computed(() => (motel.value && motel.value.full_address) || '');
        const bannerDesktopSrc = computed(() => (motel.value && motel.value.banner_desktop) || placeholderImage(1600, 700, 'Banner'));
        const bannerMobileSrc = computed(() => (motel.value && motel.value.banner_mobile) || placeholderImage(900, 700, 'Banner'));
        const suitePlaceholderImage = computed(() => {
            if (motel.value && motel.value.facade_image) return motel.value.facade_image;
            return placeholderImage(1200, 800, 'Suíte');
        });
        const googleMapsLink = computed(() => (motel.value && motel.value.google_maps_link) || '#');
        const defaultLogoImage = placeholderImage(186, 80, 'Logo');
        const defaultFacadeImage = placeholderImage(1200, 700, 'Fachada');
        const aboutText =
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet aliquet viverra, massa justo convallis lorem, at varius nisl lorem in risus.';

        const defaultFavicon = placeholderImage(32, 32, '');

        function syncBranding(data) {
            const name = data && data.name ? String(data.name).trim() : '';
            if (name) document.title = name;

            let icon = document.querySelector('link[rel~="icon"]');
            if (!icon) {
                icon = document.createElement('link');
                icon.rel = 'shortcut icon';
                icon.type = 'image/x-icon';
                document.head.appendChild(icon);
            }
            icon.href = (data && data.favicon) || defaultFavicon;
        }

        provide('motel', motel);

        onMounted(async () => {
            motel.value = await loadMotelData();
            applyPrimaryColor(motel.value && motel.value.primary_color);
            syncBranding(motel.value);
            ready.value = true;
        });

        return {
            motel,
            ready,
            page,
            currentSuite,
            currentSuiteName,
            suiteImages,
            hasSuiteImages,
            importantInfos,
            featuredSuites,
            fullAddress,
            bannerDesktopSrc,
            bannerMobileSrc,
            suitePlaceholderImage,
            googleMapsLink,
            defaultLogoImage,
            defaultFacadeImage,
            aboutText,
        };
    },
});

app.component('app-header', AppHeader);
app.component('app-footer', AppFooter);
app.component('suite-slider', SuiteSlider);
app.component('price-table', PriceTable);

app.mount('#app');
