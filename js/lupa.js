/* Maison Canis · lupa sobre la fotografía real de detalle de cada prenda */
(function () {
  'use strict';

  var DETAIL = {
    vendome: { photo: 'vendome-zoom.jpg', alt: 'Lana gris jaspeada del abrigo Vendôme' },
    montaigne: { photo: 'montaigne-zoom.jpg', alt: 'Acolchado en canales y acabado lacado del plumífero Montaigne' },
    rivoli: { photo: 'rivoli-zoom.jpg', alt: 'Cachemir doble faz camel de la capa Rivoli' }
  };
  var ZOOM = 2.6;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  function Lupa(el) {
    this.el = el;
    this.stage = el.querySelector('.lupa-stage');
    this.img = el.querySelector('.lupa-img');
    this.lens = el.querySelector('.lupa-lens');
    this.hint = el.querySelector('.lupa-hint');
    this.tabs = el.querySelector('.lupa-tabs');
    this.id = el.getAttribute('data-detail');
    this.x = 0.5; this.y = 0.5; this.tx = 0.5; this.ty = 0.5; this.on = false; this.raf = 0;
    var self = this;
    this.setHint();
    this.set(this.id);
    var s = this.stage;
    s.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { self.move(e); self.show(true); } });
    s.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || self.on) self.move(e); });
    function endTouch(e) { if (e.pointerType !== 'mouse') setTimeout(function () { self.show(false); }, 900); }
    s.addEventListener('pointerup', endTouch);
    s.addEventListener('pointercancel', endTouch);
    s.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') self.show(false); });
    s.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      self.move(e); self.show(true);
    });
    var byPointer = false;
    s.addEventListener('pointerdown', function () { byPointer = true; });
    s.addEventListener('focus', function () {
      if (byPointer) { byPointer = false; return; }      // si el foco viene de un clic o toque, la lupa se queda donde se tocó
      self.tx = self.x = 0.5; self.ty = self.y = 0.5; self.show(true); self.paint();
    });
    s.addEventListener('blur', function () { self.show(false); });
    s.addEventListener('keydown', function (e) {
      var k = e.key, st = 0.06;
      if (k === 'ArrowLeft') self.tx = Math.max(0, self.tx - st);
      else if (k === 'ArrowRight') self.tx = Math.min(1, self.tx + st);
      else if (k === 'ArrowUp') self.ty = Math.max(0, self.ty - st);
      else if (k === 'ArrowDown') self.ty = Math.min(1, self.ty + st);
      else if (k === 'Escape') { self.show(false); return; }
      else return;
      e.preventDefault(); self.show(true); self.loop();
    });
    if (this.tabs) {
      this.tabs.innerHTML = Object.keys(DETAIL).map(function (k) {
        var p = MC.product(k);
        return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === self.id) + '"><span>' + p.num.replace('Nº ', '') + '</span>' + p.name.split(' ')[0] + '</button>';
      }).join('');
      this.tabs.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]');
        if (b) self.set(b.getAttribute('data-k'));
      });
    }
    window.addEventListener('resize', function () { self.paint(); });
  }
  Lupa.prototype.setHint = function () {
    if (this.hint) this.hint.textContent = fine.matches ? 'Pase el cursor sobre la foto para ampliar' : 'Toque la foto y arrastre para ampliar';
  };
  Lupa.prototype.set = function (id) {
    var d = DETAIL[id], p = MC.product(id);
    this.id = id;
    this.img.src = 'images/' + d.photo;
    this.img.alt = d.alt;
    this.lens.style.backgroundImage = 'url("images/' + d.photo + '")';
    var q = function (s) { return this.el.querySelector(s); }.bind(this);
    if (q('.lupa-name')) q('.lupa-name').textContent = p.name;
    if (q('.lupa-link')) { q('.lupa-link').setAttribute('href', p.page); q('.lupa-link').textContent = 'Ver ' + p.name; }
    if (this.tabs) Array.prototype.forEach.call(this.tabs.children, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-k') === id ? 'true' : 'false'); });
    this.paint();
  };
  Lupa.prototype.show = function (v) { this.on = v; this.el.classList.toggle('is-on', v); if (v) this.paint(); };
  Lupa.prototype.move = function (e) {
    var r = this.stage.getBoundingClientRect();
    this.tx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    this.ty = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    this.loop();
  };
  Lupa.prototype.loop = function () {
    var self = this;
    if (this.raf) return;
    (function step() {
      self.x += (self.tx - self.x) * 0.28; self.y += (self.ty - self.y) * 0.28;
      self.paint();
      if (Math.abs(self.tx - self.x) > 0.0008 || Math.abs(self.ty - self.y) > 0.0008) self.raf = requestAnimationFrame(step); else self.raf = 0;
    })();
  };
  Lupa.prototype.paint = function () {
    var w = this.stage.clientWidth, h = this.stage.clientHeight;
    if (!w) return;
    var d = this.lens.offsetWidth || 200, px = this.x * w, py = this.y * h;
    this.lens.style.transform = 'translate3d(' + (px - d / 2) + 'px,' + (py - d / 2) + 'px,0)';
    this.lens.style.backgroundSize = (w * ZOOM) + 'px ' + (h * ZOOM) + 'px';
    this.lens.style.backgroundPosition = (d / 2 - px * ZOOM) + 'px ' + (d / 2 - py * ZOOM) + 'px';
  };

  function mountAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.lupa-viewer:not([data-mounted])'), function (el) {
      el.setAttribute('data-mounted', '');
      new Lupa(el);
    });
  }
  MC.lupa = { DETAIL: DETAIL, mountAll: mountAll };
  MC.ready(mountAll);
})();
