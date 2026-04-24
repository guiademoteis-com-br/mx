function loadDeferredScripts() {
    $('.banner__slider').flickity({
        cellAlign: 'left',
        contain: true,
        prevNextButtons: false,
        wrapAround: true,
        fade: true,
        pageDots: false,
        imagesLoaded: true,
    });

    jQuery('.destaque__flickity').flickity({
        cellAlign: 'left',
        contain: true,
        prevNextButtons: false,
        selectedAttraction: 0.01,
        friction: 0.15,
        autoPlay: true,
        autoPlay: 4000,
        pageDots: false,
        imagesLoaded: true,
        fade: false,
    });

    jQuery('.motel__slide').flickity({
        cellAlign: 'left',
        contain: true,
        prevNextButtons: false,
        wrapAround: true,
        fade: false,
        pageDots: true,
        imagesLoaded: true,
    });

    jQuery('.promo__slide').flickity({
        cellAlign: 'left',
        contain: true,
        prevNextButtons: true,
        fade: false,
        pageDots: true,
        imagesLoaded: true,
        autoPlay: 4000,
    });

    $('.suites__slide--flickity').flickity({
        cellAlign: 'center',
        contain: true,
        prevNextButtons: true,
        wrapAround: true,
        autoPlay: true,
        autoPlay: 5500,
        selectedAttraction: 0.01,
        friction: 0.15,
        imagesLoaded: true,
        pageDots: false,
        adaptiveHeight: true,
    });

    jQuery('.suites__slide').flickity({
        cellAlign: 'left',
        contain: true,
        wrapAround: true,
        prevNextButtons: false,
        selectedAttraction: 0.01,
        friction: 0.15,
        autoPlay: true,
        autoPlay: 4000,
        pageDots: false,
        imagesLoaded: true,
        fade: false,
        watchCSS: true,
    });

    const nav = document.querySelector('.bd-navbar');
    window.addEventListener('scroll', function () {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            nav.classList.add('gm-headroom-bottom');
        } else {
            nav.classList.remove('gm-headroom-bottom');
        }
    });

    const toggleMenu = document.getElementById('toggle-menu');
    const overlay = document.getElementById('overlay');
    const toggleAtivo = document.getElementById('toggle-ativo');
    const body = document.body;

    if (toggleMenu && overlay) {
        toggleMenu.addEventListener('click', function () {
            overlay.classList.toggle('active');
        });
    }

    if (toggleAtivo && overlay) {
        toggleAtivo.addEventListener('click', function () {
            overlay.classList.remove('active');
        });
    }

    const links = document.querySelectorAll('#overlay a');
    links.forEach(link => {
        link.addEventListener('click', function () {
            overlay.classList.remove('active');
            body.classList.remove('no-scroll');
        });
    });

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => {
            event.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                });
            }
        });
    });

    const menu = document.getElementById('menu');
    const threshold = 80;
    let lastScrollTop = 0;

    if (menu) {
        const onScroll = () => {
            const scrollTop = window.pageYOffset;

            if (scrollTop > threshold && lastScrollTop <= scrollTop) {
                menu.classList.add('menu-active');
            } else if (scrollTop < threshold && lastScrollTop > scrollTop) {
                menu.classList.remove('menu-active');
            }

            lastScrollTop = scrollTop;
        };

        window.addEventListener('scroll', onScroll);
    }

    const navbarToggler = $('.navbar-toggler');
    if (navbarToggler.length) {
        navbarToggler.click(function () {
            $(this).toggleClass('active');
            $('.navbar-mobi').toggleClass('active');
        });
    }

    const currentPage = location.href.substring(location.href.lastIndexOf('/') + 1);
    $('.nav-item').each(function () {
        const href = $(this).find('a').attr('href');
        if (href == currentPage) {
            $(this).addClass('active');
        }
    });

    if (currentPage == 'index' || currentPage == 'index.html') {
        jQuery('.nav-inicio').addClass('active');
    }

    let indexPage = window.location.pathname;
    indexPage = indexPage.split('/').pop();
    if (indexPage == 'index' || indexPage == '') {
        jQuery('.nav-inicio').addClass('active');
    }

    const spans = document.querySelectorAll('.suite-nome');
    spans.forEach(function (span) {
        const content = span.textContent;
        span.textContent = content.replace('Suíte', '');
    });

    if (currentPage == 'localizacao' || currentPage == 'localizacao.php') {
        jQuery('.local').remove();
    }

    const whatsappLink = window.motelStore && window.motelStore.whatsapp_link;
    if (whatsappLink) {
        fetch('btn-flutuante-wpp.html')
            .then(buttonResponse => buttonResponse.text())
            .then(buttonHtml => {
                const html = buttonHtml.replaceAll('__WHATSAPP_LINK__', whatsappLink);
                $(document.body).append($(html));
            })
            .catch(() => {});
    }
}
