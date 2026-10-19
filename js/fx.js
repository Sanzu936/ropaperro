/* Maison Canis · movimiento: scroll suave, revelados, cinta de sastre, cursor, paralaje */
(function () {
  'use strict';
  var root = document.documentElement;
  /* Decisión de marca: las animaciones se muestran siempre, aunque el sistema pida reducir el movimiento. */
  var reduce = { matches: false, addEventListener: function () {} };
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  MC.fx = {};
  root.classList.add('js-fx');

  /* Scroll suave (Lenis, versión local fija). Se mantiene siempre activo. */
  var lenis = null;
  function startLenis() {
    if (lenis || reduce.matches || typeof window.Lenis !== 'function') return;
    lenis = new window.Lenis({ duration: 1.35, wheelMultiplier: 0.9, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, anchors: { offset: -(parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 76) - 16 } });
    root.classList.add('lenis');
    (function raf(t) { if (lenis) { lenis.raf(t); requestAnimationFrame(raf); } })(performance.now());
    lenis.on('scroll', onScroll);
  }
  function stopLenis() {
    if (!lenis) return;
    lenis.destroy(); lenis = null; root.classList.remove('lenis');
  }
  function syncLenis() { if (reduce.matches) stopLenis(); else startLenis(); }
  reduce.addEventListener('change', function () { syncLenis(); if (reduce.matches) revealAll(); });
  MC.fx.lenis = function () { return lenis; };
  /* Pausa el scroll suave mientras el menú móvil está abierto */
  new MutationObserver(function () { if (!lenis) return; if (root.classList.contains('menu-open')) lenis.stop(); else lenis.start(); })
    .observe(root, { attributes: true, attributeFilter: ['class'] });

  /* Revelados al entrar en pantalla */
  var io = null;
  function revealAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.reveal, .stitch, .shead, .cota'), function (el) { el.classList.add('in'); });
  }
  function scan() {
    if (reduce.matches) return revealAll();
    if (!('IntersectionObserver' in window)) return revealAll();
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.reveal:not(.in):not([data-seen]), .stitch:not(.in):not([data-seen]), .shead:not(.in):not([data-seen])'), function (el, i) {
      el.setAttribute('data-seen', '');
      var sibs = el.parentNode && el.parentNode.classList.contains('reveal-group');
      if (sibs) el.style.transitionDelay = (Array.prototype.indexOf.call(el.parentNode.children, el) * 0.12) + 's';
      io.observe(el);
    });
  }
  MC.fx.scan = scan;

  /* Titulares: cada palabra en su máscara */
  function splitHeads() {
    Array.prototype.forEach.call(document.querySelectorAll('main h1:not([data-split]), main h2:not([data-split])'), function (h) {
      h.setAttribute('data-split', '');
      if (h.classList.contains('visually-hidden') || reduce.matches) return;
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
    if (tape || document.querySelector('.page-404')) return;
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
  var parallax = [];
  var stageEls = [], scenes = [];
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
    var max = Math.max(1, root.scrollHeight - window.innerHeight);
    var f = Math.min(1, Math.max(0, y / max));
    if (tapeNeedle) {
      tapeNeedle.style.transform = 'translateY(' + (f * (tape.clientHeight - 2)) + 'px)';
      tapeLabel.textContent = Math.round(f * 100) + ' cm';
    }
    root.classList.toggle('scrolled', y > 8);
    var dy = y - lastY;
    if (lastY >= 0 && Math.abs(dy) > 4) {
      var hd = document.getElementById('site-header');
      var hide = dy > 0 && y > 320 && !root.classList.contains('menu-open') && !(hd && hd.contains(document.activeElement));
      root.classList.toggle('header-hidden', hide && !reduce.matches);
    }
    lastY = y;
    if (!reduce.matches) {
      parallax.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;   // -1..1
        var img = el.firstElementChild;
        if (img && img.tagName === 'IMG') el.style.setProperty('--py', (p * -22).toFixed(1) + 'px');
        else if (el.firstElementChild) el.style.setProperty('--py', (p * -22).toFixed(1) + 'px');
      });
          }
    /* Tinte de sala: el fondo de la colección toma el tono de la prenda en pantalla */
    var stage = document.getElementById('coleccion');
    if (stage && scenes.length) {
      var best = null, bd = 1e9, mid = vh * 0.5;
      scenes.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (r.bottom > 0 && r.top < vh && d < bd) { bd = d; best = s; }
      });
      var sr = stage.getBoundingClientRect();
      var inside = sr.top < vh * 0.5 && sr.bottom > vh * 0.5;
      stage.setAttribute('data-tint', best && inside ? best.getAttribute('data-tint') : (best ? best.getAttribute('data-tint') : ''));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; onScroll(); });

  function init() {
    syncLenis();
    buildTape();
    collect();
    splitHeads();
    scan();
    update();
  }
  MC.ready(function () {
    init();
    /* Páginas que se montan con JS (producto, carrito…): volver a escanear */
    var t = null;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () { collect(); splitHeads(); scan(); update(); }, 60);
    }).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
    window.addEventListener('load', function () { collect(); update(); });
  });
})();
