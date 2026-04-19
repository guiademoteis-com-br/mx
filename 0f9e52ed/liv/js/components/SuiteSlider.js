import { onMounted, ref } from 'vue';
import { placeholderImage, slugify } from '../data.js';

export const SuiteSlider = {
    props: ['suites'],
    template: `
    <div ref="sliderEl" class="destaque__flickity">
      <div class="destaque__slide" v-for="suite in suites" :key="suite.slug || suite.name">
        <a :href="suiteLink(suite)">
          <div class="destaque__slide--image" :style="imageStyle(suite)">
            <div class="destaque__slide--text">
              <h3><span class="serif">{{ suite.name }}</span></h3>
            </div>
          </div>
          <div class="destaque__slide--bottom">
            <div>
              <p>desde $ <span>{{ firstPrice(suite) }}</span></p>
            </div>
            <div class="btn-habitacione">
              <i class="fa-solid fa-bed"></i>
            </div>
          </div>
        </a>
      </div>
    </div>
  `,
    setup(props) {
        const sliderEl = ref(null);

        onMounted(() => {
            if (window.Flickity && sliderEl.value) {
                new window.Flickity(sliderEl.value, {
                    cellAlign: 'left',
                    contain: true,
                    prevNextButtons: false,
                    pageDots: false,
                    wrapAround: true,
                    imagesLoaded: true,
                    selectedAttraction: 0.02,
                    friction: 0.28,
                });
            }
        });

        const suiteLink = suite => `suite-detalhe.html?slug=${encodeURIComponent(suite.slug || slugify(suite.name))}`;
        const imageStyle = suite => ({
            backgroundImage: `url('${suite.cover_image || (suite.images && suite.images[0]) || placeholderImage(800, 520, 'Suite')}')`,
        });
        const firstPrice = suite => suite.first_price || '0';

        return { sliderEl, suiteLink, imageStyle, firstPrice };
    },
};
