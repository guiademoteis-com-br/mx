import { inject, computed } from 'vue'
import { placeholderImage } from '../data.js'

export const AppFooter = {
  template: `
    <footer class="footer">
      <div class="container">
        <div class="d-none d-lg-block">
          <div class="footer__content">
            <div class="footer__content--logo col-md-3 text-center">
              <a href="./" aria-label="início">
                <img :src="logoSrc" class="img-fluid" alt="logo" loading="lazy">
              </a>
              <div class="redes-footer">
                <ul class="d-flex">
                  <li v-if="hasInstagram"><a :href="motel.instagram_link" target="_blank" rel="noreferrer"><i class="fa-brands fa-instagram"></i></a></li>
                  <li v-if="hasFacebook"><a :href="motel.facebook_link" target="_blank" rel="noreferrer"><i class="fa-brands fa-facebook"></i></a></li>
                </ul>
              </div>
            </div>

            <div class="col-md-9 d-flex justify-content-evenly">
              <div class="footer__content--menu">
                <ul>
                  <li><a href="suite-detalhe.html">Suite</a></li>
                  <li><a href="suite-detalhe.html?slug=master">Master</a></li>
                  <li><a href="suite-detalhe.html?slug=jacuzzi">Jacuzzi</a></li>
                </ul>
              </div>

              <div class="footer-border"></div>

              <div class="footer__content--menu footer__itens">
                <ul>
                  <li><a href="./">Inicio</a></li>
                  <li><a href="suites.html">Suites</a></li>
                  <li><a href="hotel.html">Sobre el Hotel</a></li>
                  <li><a href="direccion.html">Dirección</a></li>
                </ul>
              </div>

              <div class="footer-border"></div>

              <div class="footer__content--menu footer-contact">
                <div class="footer-contact-list">
                  <div v-if="hasPhone" class="footer-contact-item">
                    <h3><i class="fa-solid fa-phone"></i> Telefone</h3>
                    <p><a :href="phoneLink">{{ phoneLabel }}</a></p>
                  </div>
                  <div v-if="hasWhatsApp" class="footer-contact-item">
                    <h3><i class="fa-brands fa-whatsapp"></i> WhatsApp</h3>
                    <p><a :href="whatsappLink" target="_blank" rel="noreferrer">{{ whatsappLabel }}</a></p>
                  </div>
                  <div v-if="hasEmail" class="footer-contact-item">
                    <h3><i class="fa-solid fa-envelope"></i> E-mail</h3>
                    <p><a :href="emailLink">{{ emailLabel }}</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-sm-block d-md-block d-lg-none">
          <div class="footer__content--mobile">
            <ul>
              <li>
                <a :href="routeLink" target="_blank" class="btn btn-dark">Trazar ruta</a>
              </li>
              <li>
                <a href="suites.html" class="btn btn-dark">Ver las suites</a>
              </li>
            </ul>
            <div class="footer-redes">
              <div class="footer-redes-icons">
                <a v-if="hasInstagram" :href="motel.instagram_link" target="_blank" rel="noreferrer">
                  <i class="fa-brands fa-instagram"></i>
                </a>
                <a v-if="hasFacebook" :href="motel.facebook_link" target="_blank" rel="noreferrer">
                  <i class="fa-brands fa-facebook"></i>
                </a>
              </div>
              <div><p>Siga nuestras redes sociales</p></div>
            </div>
            <div class="footer-contact-list">
              <div v-if="hasPhone" class="footer-contact-item">
                <h3><i class="fa-solid fa-phone"></i> Telefone</h3>
                <p><a :href="phoneLink">{{ phoneLabel }}</a></p>
              </div>
              <div v-if="hasWhatsApp" class="footer-contact-item">
                <h3><i class="fa-brands fa-whatsapp"></i> WhatsApp</h3>
                <p><a :href="whatsappLink" target="_blank" rel="noreferrer">{{ whatsappLabel }}</a></p>
              </div>
              <div v-if="hasEmail" class="footer-contact-item">
                <h3><i class="fa-solid fa-envelope"></i> E-mail</h3>
                <p><a :href="emailLink">{{ emailLabel }}</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer__assinatura col-md-12">
        <div class="footer__assinatura--text text-center">
          <a href="http://sites.guiademoteis.com.br" target="_blank" rel="noreferrer">GUIA DE MOTEIS SITIOS WEB</a> | GUIA DE MOTEIS ©
        </div>
      </div>

      <div id="gm-wa">
        <label for="gm-wa-x" title="Fechar">
          &times;
          <input type="checkbox" id="gm-wa-x">
        </label>
        <a :href="whatsappLink" class="gm-wa-link" target="_blank" rel="noreferrer">
          <p class="gm-wa-txt">Escríbenos por WhatsApp</p>
          <img src="assets/wpp/wpp-logo.svg" class="gm-wa-logo" alt="Whatsapp" title="Escríbenos por WhatsApp">
        </a>
      </div>
    </footer>
  `,
  setup() {
    const motel = inject('motel')
    const logoSrc = computed(() => (motel.value && motel.value.logo) || placeholderImage(186, 80, 'Logo'))
    const routeLink = computed(() => (motel.value && motel.value.google_maps_link) || 'https://www.google.com/maps')
    const phoneLabel = computed(() => (motel.value && motel.value.phone) || '')
    const phoneLink = computed(() => {
      const phone = String((motel.value && motel.value.phone) || '').replace(/\D/g, '')
      return phone ? `tel:+${phone}` : '#'
    })
    const whatsappLabel = computed(() => (motel.value && motel.value.whatsapp) || '')
    const emailLabel = computed(() => (motel.value && motel.value.email) || '')
    const emailLink = computed(() => (emailLabel.value ? `mailto:${emailLabel.value}` : '#'))
    const hasInstagram = computed(() => !!(motel.value && motel.value.instagram_link))
    const hasFacebook = computed(() => !!(motel.value && motel.value.facebook_link))
    const hasPhone = computed(() => !!(motel.value && motel.value.phone))
    const hasWhatsApp = computed(() => !!(motel.value && motel.value.whatsapp))
    const hasEmail = computed(() => !!(motel.value && motel.value.email))
    const whatsappLink = computed(() => {
      const phone = String((motel.value && motel.value.whatsapp) || '').replace(/\D/g, '')
      return phone ? `https://api.whatsapp.com/send?phone=${phone}` : 'https://api.whatsapp.com/'
    })

    return {
      motel,
      logoSrc,
      routeLink,
      phoneLabel,
      phoneLink,
      whatsappLabel,
      emailLabel,
      emailLink,
      hasPhone,
      hasWhatsApp,
      hasEmail,
      hasInstagram,
      hasFacebook,
      whatsappLink,
    }
  },
}
