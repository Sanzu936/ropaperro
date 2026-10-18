/* Maison Canis · cabecera, pie, aviso de carrito y utilidades comunes */
(function () {
  'use strict';

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page === '') page = 'index.html';

  function link(href, label, extra) {
    var current = page === href ? ' aria-current="page"' : '';
    return '<li><a href="' + href + '"' + current + (extra || '') + '>' + label + '</a></li>';
  }

  function headerHTML() {
    var left = MC.PRODUCTS.map(function (p) { return link(p.page, p.name.split(' ')[0]); }).join('');
    var right = link('la-maison.html', 'La Maison') + link('guia-de-tallas.html', 'Guía de tallas');
    var mobile = MC.PRODUCTS.map(function (p) { return link(p.page, p.name); }).join('') +
      link('la-maison.html', 'La Maison') +
      link('guia-de-tallas.html', 'Guía de tallas') +
      link('envios-y-cuidados.html', 'Envíos y cuidados');
    headerHTML.mobile = '<nav class="mobile-nav" id="mobile-nav" aria-label="Menú principal" hidden><ul>' + mobile + '</ul></nav>';
    return '' +
      '<div class="header-inner container">' +
        '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav">' +
          '<span class="menu-toggle-bars" aria-hidden="true"></span><span class="menu-toggle-label">Menú</span>' +
        '</button>' +
        '<nav class="nav nav-left" aria-label="Colección"><ul>' + left + '</ul></nav>' +
        '<a class="logo" href="index.html" aria-label="Maison Canis, ir al inicio"><span>Maison</span> <span>Canis</span></a>' +
        '<div class="header-right">' +
          '<nav class="nav nav-right" aria-label="La casa"><ul>' + right + '</ul></nav>' +
          '<a class="cart-link" href="carrito.html"' + (page === 'carrito.html' ? ' aria-current="page"' : '') + '>' +
            '<span>Carrito</span> <span class="cart-count" aria-hidden="true">0</span>' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  function footerHTML() {
    var prendas = MC.PRODUCTS.map(function (p) {
      return '<li><a href="' + p.page + '">' + p.name + '</a></li>';
    }).join('');
    return '' +
      '<div class="container footer-inner">' +
        '<div class="footer-brand">' +
          '<a class="logo logo-footer" href="index.html" aria-label="Maison Canis, ir al inicio"><span>Maison</span> <span>Canis</span></a>' +
          '<p>Tres prendas para perro, cortadas a medida y hechas para durar muchos inviernos.</p>' +
        '</div>' +
        '<div class="footer-col"><h2>Colección</h2><ul>' + prendas + '</ul></div>' +
        '<div class="footer-col"><h2>La Maison</h2><ul>' +
          '<li><a href="la-maison.html">Nuestra historia</a></li>' +
          '<li><a href="la-maison.html#materiales">Materiales</a></li>' +
          '<li><a href="la-maison.html#artesania">Artesanía</a></li>' +
          '<li><a href="guia-de-tallas.html">Guía de tallas</a></li>' +
        '</ul></div>' +
        '<div class="footer-col"><h2>Atención</h2><ul>' +
          '<li><a href="envios-y-cuidados.html#envios">Envíos</a></li>' +
          '<li><a href="envios-y-cuidados.html#cambios">Cambios y devoluciones</a></li>' +
          '<li><a href="envios-y-cuidados.html#cuidado">Cuidado de las prendas</a></li>' +
          '<li><a href="mailto:atelier@maisoncanis.com">atelier@maisoncanis.com</a></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="container footer-base"><p>© 2026 Maison Canis. Todos los precios incluyen IVA.</p><p>Madrid · Guimarães</p></div>';
  }

  function mount() {
    var header = document.getElementById('site-header');
    var footer = document.getElementById('site-footer');
    if (header) {
      header.innerHTML = headerHTML();
      header.insertAdjacentHTML('afterend', headerHTML.mobile);
    }
    if (footer) footer.innerHTML = footerHTML();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    var toggle = document.querySelector('.menu-toggle');
    var panel = document.getElementById('mobile-nav');
    function setMenu(open) {
      if (!toggle || !panel) return;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.querySelector('.menu-toggle-label').textContent = open ? 'Cerrar' : 'Menú';
      panel.hidden = !open;
      document.documentElement.classList.toggle('menu-open', open);
    }
    if (toggle) {
      toggle.addEventListener('click', function () {
        setMenu(toggle.getAttribute('aria-expanded') !== 'true');
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          setMenu(false);
          toggle.focus();
        }
      });
      panel.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
      });
      window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) {
        if (e.matches) setMenu(false);
      });
    }

    if (window.MC_ROOT) {
      Array.prototype.forEach.call(document.querySelectorAll('#site-header a[href], #mobile-nav a[href], #site-footer a[href], .lost a[href]'), function (a) {
        var h = a.getAttribute('href');
        if (!/^(\/|#|mailto:|https?:)/.test(h)) a.setAttribute('href', window.MC_ROOT + h);
      });
    }

    updateCount();
    MC.cart.onChange(updateCount);
  }

  function updateCount() {
    var n = MC.cart.count();
    var el = document.querySelector('.cart-count');
    var a = document.querySelector('.cart-link');
    if (el) el.textContent = n;
    if (a) {
      a.setAttribute('aria-label', 'Carrito, ' + n + (n === 1 ? ' prenda' : ' prendas'));
      a.classList.toggle('has-items', n > 0);
    }
  }

  var toastTimer = null;
  MC.toast = function (html) {
    var t = document.querySelector('.toast');
    if (!t) return;
    t.innerHTML = html;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 7000);
  };

  MC.card = function (p) {
    var a = p.images[0], b = p.images[1];
    return '' +
      '<a class="card" href="' + p.page + '">' +
        '<span class="card-media frame">' +
          '<img class="card-img" src="images/' + a.file + '" alt="' + MC.esc(a.alt) + '" width="' + a.w + '" height="' + a.h + '" loading="lazy" decoding="async">' +
          '<img class="card-img card-img-alt" src="images/' + b.file + '" alt="" width="' + b.w + '" height="' + b.h + '" loading="lazy" decoding="async">' +
        '</span>' +
        '<span class="card-body">' +
          '<span class="eyebrow">' + p.num + '</span>' +
          '<span class="card-title">' + p.name + '</span>' +
          '<span class="card-line">' + p.cardLine + '</span>' +
          '<span class="card-foot"><span class="card-price">' + MC.money(p.price) + '</span><span class="card-cta">Descubrir</span></span>' +
        '</span>' +
      '</a>';
  };

  MC.ready = function (fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };

  MC.ready(mount);
})();
