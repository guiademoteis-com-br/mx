import { computed, inject, ref } from 'vue'
import { placeholderImage } from '../data.js'

export const AppHeader = {
  template: `
    <header id="menu" class="bd-navbar">
      <nav class="menu__navigation">
        <div class="menu__logo">
          <a href="./">
            <img :src="logoSrc" alt="Logo Hotel" class="img-fluid d-sm-block d-md-block d-lg-none" width="76" height="76">
            <img :src="logoSrc" alt="Logo Hotel" class="img-fluid d-none d-lg-block" width="186" height="80">
          </a>
        </div>
        <div class="menu__navigation-list">
          <div class="navbar-toggler" id="toggle-menu" @click="menuOpen = true">
            <p>Menú</p>
            <div class="nav-hamb">
              <span class="menu__nav--icon"></span>
              <span class="menu__nav--icon"></span>
              <span class="menu__nav--icon"></span>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <div class="overlay" id="overlay" v-show="menuOpen">
      <div class="closes-menu" id="toggle-ativo" @click="menuOpen = false">
        <span class="menu__nav--icon"></span>
        <span class="menu__nav--icon"></span>
        <span class="menu__nav--icon"></span>
      </div>
      <div class="overlay__nav">
        <div class="overlay__nav--list col-md-6">
          <div class="menu__logo">
            <a href="./">
              <img :src="logoSrc" alt="Logo Hotel" class="img-fluid">
            </a>
            <div class="menu__logo--redes">
              <ul class="gm-socials">
                <li v-if="hasInstagram">
                  <a :href="motel.instagram_link" target="_blank" rel="noreferrer"><i class="fa-brands fa-instagram"></i></a>
                </li>
                <li v-if="hasFacebook">
                  <a :href="motel.facebook_link" target="_blank" rel="noreferrer"><i class="fa-brands fa-facebook"></i></a>
                </li>
              </ul>
            </div>
          </div>
          <ul>
            <li class="nav-item"><a href="./" class="nav-link" @click="menuOpen = false">Início</a></li>
            <li class="nav-item"><a href="suites.html" class="nav-link" @click="menuOpen = false">Suites</a></li>
            <li class="nav-item"><a href="hotel.html" class="nav-link" @click="menuOpen = false">Sobre el Hotel</a></li>
            <li class="nav-item"><a href="direccion.html" class="nav-link" @click="menuOpen = false">Dirección</a></li>
          </ul>
        </div>
        <div id="overlay__nav--bg" class="overlay__nav--bg col-md-6" :style="backgroundStyle"></div>
      </div>
    </div>
  `,
  setup() {
    const motel = inject('motel')
    const menuOpen = ref(false)
    const logoSrc = computed(() => (motel.value && motel.value.logo) || placeholderImage(186, 80, 'Logo'))
    const backgroundStyle = computed(() => ({
      backgroundImage: `url(${(motel.value && motel.value.banner_desktop) || placeholderImage(1200, 700, 'Menu')})`,
    }))
    const hasInstagram = computed(() => !!(motel.value && motel.value.instagram_link))
    const hasFacebook = computed(() => !!(motel.value && motel.value.facebook_link))

    return { motel, menuOpen, logoSrc, backgroundStyle, hasInstagram, hasFacebook }
  },
}
