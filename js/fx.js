/* Maison Canis · movimiento: scroll suave, revelados, cinta de sastre y paralaje */
(function () {
  'use strict';
  var root = document.documentElement;
  /* Decisión de marca: las animaciones se muestran siempre, aunque el sistema pida reducir el movimiento. */
  root.classList.add('js-fx');

  /* Scroll suave (Lenis, versión local fija) */
  var lenis = null;
  function startLenis() {
    if (typeof window.Lenis !== 'function') return;
    lenis = new window.Lenis({ duration: 1.35, wheelMultiplier: 0.9, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, anchors: { offset: -(parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 76) - 16 } });
    root.classList.add('lenis');
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    lenis.on('scroll', onScroll);
    /* Pausa el scroll suave mientras el menú móvil está abierto */
    new MutationObserver(function () { if (root.classList.contains('menu-open')) lenis.stop(); else lenis.start(); })
      .observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  /* Revelados al entrar en pantalla */
  var io = null;
  function scan() {
    var sel = '.reveal:not(.in):not([data-seen]), .shead:not(.in):not([data-seen])';
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal, .shead, .cota'), function (el) { el.classList.add('in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      el.setAttribute('data-seen', '');
      io.observe(el);
    });
  }

  /* Titulares: cada palabra en su máscara */
  function splitHeads() {
    Array.prototype.forEach.call(document.querySelectorAll('main h1:not([data-split]), main h2:not([data-split])'), function (h) {
      h.setAttribute('data-split', '');
      if (h.classList.contains('visually-hidden')) return;
      h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
      var i = 0;
      (function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
              var o = document.createElement('span'), n = document.createElement('span');
              o.className = 'sw'; o.setAttribute('aria-hidden', 'true');
              n.className = 'si'; n.style.setProperty('--i', i++); n.textContent = w;
              o.appendChild(n); frag.appendChild(o);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1) wrap(c);
        });
      })(h);
      h.classList.add('shead');
    });
  }

  /* Cinta de sastre: indicador de scroll y navegación */
  var tape = null, tapeNeedle = null, tapeLabel = null;
  function buildTape() {
    if (tape) return;
    tape = document.createElement('div');
    tape.className = 'tape';
    tape.setAttribute('aria-hidden', 'true');
    tape.innerHTML = '<div class="tape-rule"></div><div class="tape-needle"><span class="tape-label">0 cm</span></div>';
    document.body.appendChild(tape);
    tapeNeedle = tape.querySelector('.tape-needle');
    tapeLabel = tape.querySelector('.tape-label');
    tape.addEventListener('click', function (e) {
      var r = tape.getBoundingClientRect();
      var f = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      var max = root.scrollHeight - window.innerHeight;
      if (lenis) lenis.scrollTo(f * max); else window.scrollTo({ top: f * max });
    });
  }

  var ticking = false, vh = window.innerHeight, lastY = -1;
  var parallax = [], scenes = [];
  function collect() {
    parallax = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    scenes = Array.prototype.slice.call(document.querySelectorAll('.scene[data-tint]'));
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  function update() {
    ticking = false;
    var y = window.pageYOffset;
    var f = Math.min(1, Math.max(0, y / Math.max(1, root.scrollHeight - window.innerHeight)));
    if (tapeNeedle) {
      tapeNeedle.style.transform = 'translateY(' + (f * (tape.clientHeight - 2)) + 'px)';
      tapeLabel.textContent = Math.round(f * 100) + ' cm';
    }
    /* La cabecera se retira al bajar y vuelve al subir */
    if (lastY >= 0 && Math.abs(y - lastY) > 4) {
      var hd = document.getElementById('site-header');
      var hide = y > lastY && y > 320 && !root.classList.contains('menu-open') && !(hd && hd.contains(document.activeElement));
      root.classList.toggle('header-hidden', hide);
    }
    lastY = y;
    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      el.style.setProperty('--py', (((r.top + r.height / 2 - vh / 2) / vh) * -22).toFixed(1) + 'px');
    });
    /* Tinte de sala: el fondo de la colección toma el tono de la prenda en pantalla */
    var stage = document.getElementById('coleccion');
    if (stage && scenes.length) {
      var best = null, bd = 1e9, mid = vh * 0.5;
      scenes.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (r.bottom > 0 && r.top < vh && d < bd) { bd = d; best = s; }
      });
      stage.setAttribute('data-tint', best ? best.getAttribute('data-tint') : '');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; onScroll(); });

  MC.ready(function () {
    startLenis();
    buildTape();
    collect();
    splitHeads();
    scan();
    update();
    /* Páginas que se montan con JS (producto, carrito…): volver a escanear */
    var t = null;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () { collect(); splitHeads(); scan(); update(); }, 60);
    }).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
    window.addEventListener('load', function () { collect(); update(); });
  });
})();
