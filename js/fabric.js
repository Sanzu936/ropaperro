/* Maison Canis · muestra de tejido en 3D (three.js, versión local fija, carga diferida).
   Sin WebGL, o si falla la carga, queda la fotografía de detalle. */
(function () {
  'use strict';

  var FABRICS = {
    gabardina: {
      name: 'Gabardina de algodón',
      text: 'Sarga de algodón de trama densa, tejida en Cataluña. El cruce diagonal del hilo es lo que hace resbalar la lluvia. Los botones, de corozo, se tallan y se pulen a mano.',
      photo: 'gabardina-02.jpg',
      alt: 'Detalle del cuello alto y de los botones de corozo de la gabardina Auteuil'
    },
    jersey: {
      name: 'Cachemir de fibra larga',
      text: 'Punto liso de galga fina en cachemir de 15,5 micras. Cada malla es una pequeña V: de ahí salen la suavidad y la caída de la prenda.',
      photo: 'jersey-02.jpg',
      alt: 'Detalle del punto liso de cachemir del jersey Passy'
    },
    abrigo: {
      name: 'Lana batida acolchada',
      text: 'Loden de lana acolchado en retícula de cinco centímetros sobre un relleno de merino. El relieve es real: cada celda es una pequeña almohada de aire.',
      photo: 'abrigo-02.jpg',
      alt: 'Detalle del acolchado en retícula del abrigo Marais'
    }
  };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var threePromise = null;

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  function loadThree() {
    if (!threePromise) threePromise = import('./vendor/three.module.min.js');
    return threePromise;
  }

  /* ---------- texturas procedurales (alturas → mapa de normales) ---------- */
  function heightCanvas(size, draw) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d', { willReadFrequently: true });
    draw(g, size);
    return c;
  }
  function toNormal(src, strength) {
    var n = src.width, g = src.getContext('2d');
    var d = g.getImageData(0, 0, n, n).data;
    var out = document.createElement('canvas');
    out.width = out.height = n;
    var og = out.getContext('2d');
    var img = og.createImageData(n, n);
    function h(x, y) { return d[(((y + n) % n) * n + ((x + n) % n)) * 4] / 255; }
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var dx = (h(x + 1, y) - h(x - 1, y)) * strength;
        var dy = (h(x, y + 1) - h(x, y - 1)) * strength;
        var l = Math.sqrt(dx * dx + dy * dy + 1);
        var i = (y * n + x) * 4;
        img.data[i] = (-dx / l * 0.5 + 0.5) * 255;
        img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255;
        img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    }
    og.putImageData(img, 0, 0);
    return out;
  }
  function noise(g, n, amp, base) {
    var im = g.getImageData(0, 0, n, n);
    for (var i = 0; i < im.data.length; i += 4) {
      var v = Math.max(0, Math.min(255, im.data[i] + (Math.random() - 0.5) * amp + (base || 0)));
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
    }
    g.putImageData(im, 0, 0);
  }
  var TEX = {
    twill: function () {
      return toNormal(heightCanvas(256, function (g, n) {
        var im = g.createImageData(n, n);
        for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
          var v = 0.5 + 0.5 * Math.sin((x + y) * Math.PI * 2 / 8);
          v = v * 0.78 + Math.random() * 0.22;
          var i = (y * n + x) * 4;
          im.data[i] = im.data[i + 1] = im.data[i + 2] = v * 255; im.data[i + 3] = 255;
        }
        g.putImageData(im, 0, 0);
      }), 1.3);
    },
    knit: function () {
      return toNormal(heightCanvas(256, function (g, n) {
        g.fillStyle = '#111'; g.fillRect(0, 0, n, n);
        g.lineCap = 'round'; g.lineWidth = 5.2; g.strokeStyle = '#eee';
        try { g.filter = 'blur(0.8px)'; } catch (e) {}
        for (var r = 0; r < 16; r++) for (var c = 0; c < 16; c++) {
          var x = c * 16, y = r * 16;
          g.beginPath(); g.moveTo(x + 3.2, y + 2); g.lineTo(x + 8, y + 14); g.stroke();
          g.beginPath(); g.moveTo(x + 12.8, y + 2); g.lineTo(x + 8, y + 14); g.stroke();
        }
        try { g.filter = 'none'; } catch (e) {}
        noise(g, n, 30, 0);
      }), 2.2);
    },
    felt: function () {
      return toNormal(heightCanvas(256, function (g, n) {
        g.fillStyle = '#808080'; g.fillRect(0, 0, n, n);
        noise(g, n, 140, 0);
        try { g.filter = 'blur(0.9px)'; g.drawImage(g.canvas, 0, 0); g.filter = 'none'; } catch (e) {}
      }), 1.6);
    }
  };

  /* ---------- una muestra ---------- */
  function Viewer(el) {
    this.el = el;
    this.stage = el.querySelector('[data-stage]');
    this.fallback = el.querySelector('.fabric-fallback');
    this.id = el.getAttribute('data-fabric');
    this.tabs = el.querySelector('.fabric-tabs');
    this.ready = false;
    this.active = false;
    this.dirty = true;
    this.rot = { x: -0.1, y: -0.2, tx: -0.1, ty: -0.2 };
    this.light = { x: -0.5, y: 0.45 };
    this.flip = null;
    this.initUI();
    var self = this;
    if (!hasWebGL()) { this.fail(); return; }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !self.started) { self.started = true; self.boot(); }
          if (self.ready) self.setActive(e.isIntersecting);
        });
      }, { rootMargin: '300px 0px' });
      io.observe(el);
    } else { this.started = true; this.boot(); }
  }

  Viewer.prototype.initUI = function () {
    var self = this;
    this.setCopy(this.id);
    if (this.tabs) {
      this.tabs.innerHTML = Object.keys(FABRICS).map(function (k) {
        var p = MC.product(k);
        return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === self.id) + '"><span>' + p.num.replace('Nº ', '') + '</span>' + p.name.split(' ')[0] + '</button>';
      }).join('');
      this.tabs.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]');
        if (b) self.select(b.getAttribute('data-k'));
      });
    }
  };
  Viewer.prototype.setCopy = function (id) {
    var f = FABRICS[id], p = MC.product(id);
    var q = function (s) { return this.el.querySelector(s); }.bind(this);
    if (q('.fabric-kicker')) q('.fabric-kicker').textContent = p.num + ' · ' + p.name + ' · ' + p.color;
    if (q('.fabric-name')) q('.fabric-name').textContent = f.name;
    if (q('.fabric-text')) q('.fabric-text').textContent = f.text;
    if (this.fallback) { this.fallback.src = 'images/' + f.photo; this.fallback.alt = f.alt; }
    if (this.tabs) Array.prototype.forEach.call(this.tabs.children, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-k') === id ? 'true' : 'false'); });
  };
  Viewer.prototype.fail = function () {
    this.el.classList.add('is-fallback');
    var h = this.el.querySelector('.fabric-hint');
    if (h) h.textContent = 'Fotografía de detalle del tejido.';
  };

  Viewer.prototype.boot = function () {
    var self = this;
    loadThree().then(function (THREE) {
      try { self.build(THREE); } catch (e) { self.fail(); if (window.console) console.warn('Muestra 3D no disponible', e); }
    }).catch(function () { self.fail(); });
  };

  Viewer.prototype.build = function (T) {
    var self = this;
    this.T = T;
    var r = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    r.toneMapping = T.NeutralToneMapping;
    r.toneMappingExposure = 1;
    this.renderer = r;
    var cv = r.domElement;
    cv.className = 'fabric-canvas';
    cv.setAttribute('aria-hidden', 'true');
    this.stage.appendChild(cv);
    this.stage.setAttribute('tabindex', '0');
    this.stage.setAttribute('role', 'group');
    this.stage.setAttribute('aria-label', 'Muestra de tejido en 3D. Use las flechas del teclado para girarla.');

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(0, 0, 7.4);
    this.group = new T.Group();
    this.scene.add(this.group);

    this.scene.add(new T.HemisphereLight(0xfbf6ec, 0x8c8068, 0.55));
    this.key = new T.DirectionalLight(0xfff0d8, 2.6);
    this.key.position.set(-3.6, 1.8, 3);
    this.scene.add(this.key);
    var rim = new T.DirectionalLight(0xdfe6ee, 0.9);
    rim.position.set(4, -1, -2);
    this.scene.add(rim);

    this.normals = {};
    this.mesh = null;
    this.extras = [];
    this.apply(this.id);

    var ro = new ResizeObserver(function () { self.resize(); });
    ro.observe(this.stage);
    this.resize();
    this.bindInput(cv);

    this.ready = true;
    this.el.classList.add('is-3d');
    this.setActive(true);
  };

  /* geometría y material de cada tejido */
  var W = 3.7, H = 2.7;
  Viewer.prototype.height = function (id, x, y) {
    var z = 0.3 * Math.sin(x * 0.95 + 0.5) * Math.cos(y * 0.5) - 0.05 * y * y + 0.04 * Math.sin(y * 2.2 + x);
    var edge = Math.min(W / 2 - Math.abs(x), H / 2 - Math.abs(y));
    if (id === 'abrigo') {
      var fade = Math.max(0, Math.min(1, (edge - 0.1) / 0.24)); fade = fade * fade * (3 - 2 * fade);
      var c = 0.62, a = (x + y) / c, b = (x - y) / c;
      var fa = a - Math.floor(a), fb = b - Math.floor(b);
      var d = Math.min(Math.min(fa, 1 - fa), Math.min(fb, 1 - fb));
      var t = Math.min(1, d / 0.24);
      z += (Math.sin(t * Math.PI / 2) * 0.8 + 0.2 * t) * 0.07 * fade;
      return { z: z, shade: 1 - (0.38 * fade) * (1 - Math.min(1, d / 0.09)) };
    }
    if (id === 'jersey') {
      z = 0.34 * Math.sin(x * 0.8 + 0.2) * Math.cos(y * 0.45) - 0.05 * y * y;
      if (y < -H / 2 + 0.5) {
        var k = Math.sin(x * 30);
        z += k * 0.016;
        return { z: z, shade: 0.88 + 0.12 * k };
      }
    }
    return { z: z, shade: 1 };
  };

  Viewer.prototype.apply = function (id) {
    var T = this.T, self = this;
    this.id = id;
    if (this.mesh) {
      this.group.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    this.extras.forEach(function (o) {
      self.group.remove(o);
      o.traverse(function (n) { if (n.geometry) n.geometry.dispose(); if (n.material) n.material.dispose(); });
    });
    this.extras = [];

    var segX = 190, segY = 140;
    var geo = new T.PlaneGeometry(W, H, segX, segY);
    var pos = geo.attributes.position;
    var cols = new Float32Array(pos.count * 3);
    for (var i = 0; i < pos.count; i++) {
      var px = pos.getX(i), py = pos.getY(i);
      var h = this.height(id, px, py);
      /* dobladillo cosido: borde ligeramente elevado y pespunte discontinuo a su lado */
      var ex = W / 2 - Math.abs(px), ey = H / 2 - Math.abs(py);
      var ed = Math.min(ex, ey), along = ex < ey ? py : px;
      var z = h.z + (ed < 0.075 ? 0.012 : 0), shade = h.shade;
      if (ed > 0.085 && ed < 0.105 && Math.floor(along * 16) % 2 === 0) shade *= id === 'gabardina' ? 0.74 : 0.5;
      if (ed < 0.075) shade *= 1.04;
      /* variación suave del hilo, para que no sea un color plano */
      shade *= 0.96 + 0.04 * Math.sin(px * 5.1 + py * 3.3) * Math.cos(py * 4.2 - px * 1.7);
      pos.setZ(i, z);
      cols[i * 3] = cols[i * 3 + 1] = cols[i * 3 + 2] = shade;
    }
    geo.setAttribute('color', new T.BufferAttribute(cols, 3));
    geo.computeVertexNormals();

    var kind = id === 'gabardina' ? 'twill' : (id === 'jersey' ? 'knit' : 'felt');
    if (!this.normals[kind]) {
      var tex = new T.CanvasTexture(TEX[kind]());
      tex.wrapS = tex.wrapT = T.RepeatWrapping;
      tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      tex.colorSpace = T.NoColorSpace;
      this.normals[kind] = tex;
    }
    var tex2 = this.normals[kind];
    var rep = kind === 'knit' ? 0.9 : (kind === 'twill' ? 1.05 : 0.45);
    tex2.repeat.set(W / rep, H / rep);
    var mat;
    if (id === 'gabardina') {
      mat = new T.MeshStandardMaterial({ color: 0xd2bf9b, roughness: 0.72, metalness: 0, normalMap: tex2, normalScale: new T.Vector2(0.7, 0.7), vertexColors: true, side: T.DoubleSide });
    } else if (id === 'jersey') {
      mat = new T.MeshPhysicalMaterial({ color: 0xece4d2, roughness: 0.96, metalness: 0, normalMap: tex2, normalScale: new T.Vector2(0.85, 0.85), sheen: 1, sheenRoughness: 0.55, sheenColor: new T.Color(0xfff2d9), vertexColors: true, side: T.DoubleSide });
    } else {
      mat = new T.MeshStandardMaterial({ color: 0x4d5840, roughness: 0.92, metalness: 0, normalMap: tex2, normalScale: new T.Vector2(0.7, 0.7), vertexColors: true, side: T.DoubleSide });
    }
    mat.alphaMap = this.cornerMap(T);
    mat.alphaTest = 0.5;
    this.mesh = new T.Mesh(geo, mat);
    this.group.add(this.mesh);
    if (!this.shadow) {
      var sc = document.createElement('canvas'); sc.width = sc.height = 128;
      var sg = sc.getContext('2d'), gr = sg.createRadialGradient(64, 64, 6, 64, 64, 62);
      gr.addColorStop(0, 'rgba(40,32,20,.34)'); gr.addColorStop(1, 'rgba(40,32,20,0)');
      sg.fillStyle = gr; sg.fillRect(0, 0, 128, 128);
      this.shadow = new T.Mesh(new T.PlaneGeometry(W * 1.35, H * 1.45), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false }));
      this.shadow.position.set(0.12, -0.3, -0.55);
      this.scene.add(this.shadow);
    }

    if (id === 'gabardina') {
      this.addButton(T, 0.9, 0.3, 0.17);
      this.addButton(T, 0.9, -0.28, 0.17);
    } else if (id === 'abrigo') {
      this.addSnap(T, 0.95, -0.5);
    }
    this.dirty = true;
  };

  /* coloca una pieza sobre la tela, siguiendo su inclinación */
  Viewer.prototype.place = function (T, obj, id, x, y, lift) {
    var e = 0.02, z = this.height(id, x, y).z;
    var dx = (this.height(id, x + e, y).z - this.height(id, x - e, y).z) / (2 * e);
    var dy = (this.height(id, x, y + e).z - this.height(id, x, y - e).z) / (2 * e);
    var n = new T.Vector3(-dx, -dy, 1).normalize();
    var holder = new T.Group();
    holder.position.set(x + n.x * lift, y + n.y * lift, z + n.z * lift);
    holder.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), n);
    holder.add(obj);
    this.group.add(holder);
    this.extras.push(holder);
  };
  Viewer.prototype.cornerMap = function (T) {
    if (this.corner) return this.corner;
    var c = document.createElement('canvas'), n = 256, g;
    c.width = c.height = n; g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, n, n);
    g.fillStyle = '#fff';
    var r = 22, m = 3;
    g.beginPath();
    g.moveTo(m + r, m); g.arcTo(n - m, m, n - m, n - m, r); g.arcTo(n - m, n - m, m, n - m, r);
    g.arcTo(m, n - m, m, m, r); g.arcTo(m, m, n - m, m, r); g.fill();
    this.corner = new T.CanvasTexture(c);
    return this.corner;
  };
  Viewer.prototype.addButton = function (T, x, y, rad) {
    var s = new T.Shape();
    s.absarc(0, 0, rad, 0, Math.PI * 2, false);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (p) {
      var hole = new T.Path();
      hole.absarc(p[0] * rad * 0.28, p[1] * rad * 0.28, rad * 0.11, 0, Math.PI * 2, true);
      s.holes.push(hole);
    });
    var g = new T.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.022, bevelSegments: 4, curveSegments: 40 });
    var m = new T.MeshPhysicalMaterial({ color: 0x6a4125, roughness: 0.34, clearcoat: 0.4, clearcoatRoughness: 0.4 });
    var btn = new T.Group();
    btn.add(new T.Mesh(g, m));
    var th = new T.MeshStandardMaterial({ color: 0xefe6d2, roughness: 0.9 });
    var len = rad * 0.28 * 2.9;
    [Math.PI / 4, -Math.PI / 4].forEach(function (a) {
      var c = new T.Mesh(new T.CylinderGeometry(0.011, 0.011, len, 8), th);
      c.rotation.z = a + Math.PI / 2 * 0;
      c.position.z = 0.092;
      btn.add(c);
    });
    btn.rotation.z = 0.35;
    this.place(T, btn, 'gabardina', x, y, 0.03);
  };
  Viewer.prototype.addSnap = function (T, x, y) {
    var g = new T.Group();
    var brass = new T.MeshStandardMaterial({ color: 0xa98a4c, roughness: 0.32, metalness: 0.95 });
    var disc = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.035, 48), brass);
    disc.rotation.x = Math.PI / 2;
    var dome = new T.Mesh(new T.SphereGeometry(0.11, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), brass);
    dome.rotation.x = Math.PI / 2; dome.position.z = 0.017;
    var ring = new T.Mesh(new T.TorusGeometry(0.2, 0.012, 12, 64), brass);
    ring.position.z = 0.004;
    g.add(disc, dome, ring);
    this.place(T, g, 'abrigo', x, y, 0.07);
  };

  Viewer.prototype.resize = function () {
    var w = this.stage.clientWidth, h = this.stage.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    var fit = W * 1.5 / (w / h);           // encuadre que mantiene la muestra completa
    this.camera.position.z = Math.max(6.4, fit / (2 * Math.tan(this.camera.fov * Math.PI / 360)) * 1.0 + 0.2);
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  };

  Viewer.prototype.bindInput = function (cv) {
    var self = this, drag = null;
    function clamp(v, a) { return Math.max(-a, Math.min(a, v)); }
    cv.style.touchAction = 'pan-y';
    cv.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY, ty: self.rot.ty, tx: self.rot.tx, id: e.pointerId };
      try { cv.setPointerCapture(e.pointerId); } catch (er) {}
      self.el.classList.add('is-drag');
      self.touched = true;
    });
    cv.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      self.light.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      self.light.y = -((e.clientY - r.top) / r.height - 0.5) * 2;
      if (drag) {
        self.rot.ty = clamp(drag.ty + (e.clientX - drag.x) / r.width * 3.2, 1.25);
        self.rot.tx = clamp(drag.tx + (e.clientY - drag.y) / r.height * 2.4, 0.8);
      }
      self.dirty = true;
    });
    function end() { drag = null; self.el.classList.remove('is-drag'); }
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    this.stage.addEventListener('keydown', function (e) {
      var k = e.key, s = 0.25;
      if (k === 'ArrowLeft') self.rot.ty = clamp(self.rot.ty - s, 1.25);
      else if (k === 'ArrowRight') self.rot.ty = clamp(self.rot.ty + s, 1.25);
      else if (k === 'ArrowUp') self.rot.tx = clamp(self.rot.tx - s, 0.8);
      else if (k === 'ArrowDown') self.rot.tx = clamp(self.rot.tx + s, 0.8);
      else if (k === 'Home') { self.rot.tx = -0.1; self.rot.ty = -0.2; }
      else return;
      e.preventDefault(); self.touched = true; self.dirty = true;
    });
  };

  Viewer.prototype.select = function (id) {
    if (id === this.id && !this.flip) return;
    this.setCopy(id);
    if (!this.ready) { this.id = id; return; }
    if (reduce.matches) { this.apply(id); return; }
    this.flip = { t0: performance.now(), to: id, swapped: false };
    this.dirty = true;
  };

  Viewer.prototype.setActive = function (on) {
    if (on === this.active) return;
    this.active = on;
    if (on) { this.last = performance.now(); this.loop(); }
  };
  Viewer.prototype.loop = function () {
    var self = this;
    if (!this.active || document.hidden) {
      if (this.active) requestAnimationFrame(function () { self.loop(); });
      return;
    }
    var now = performance.now(), t = now / 1000;
    var rot = this.rot, animate = !reduce.matches;
    var ease = 0.085;
    var idleY = animate && !this.touched ? Math.sin(t * 0.45) * 0.2 : 0;
    var idleX = animate && !this.touched ? Math.cos(t * 0.36) * 0.05 : 0;
    var flipY = 0, flipS = 1;
    if (this.flip) {
      var p = Math.min(1, (now - this.flip.t0) / 1000);
      function eo(u) { return 1 - Math.pow(1 - u, 3); }
      function ei(u) { return u * u * u; }
      if (p < 0.5) flipY = ei(p / 0.5) * Math.PI / 2;
      else {
        if (!this.flip.swapped) { this.apply(this.flip.to); this.flip.swapped = true; }
        flipY = -(1 - eo((p - 0.5) / 0.5)) * Math.PI / 2;
      }
      flipS = 1 - 0.08 * Math.sin(p * Math.PI);
      if (p >= 1) this.flip = null;
    }
    rot.x += (rot.tx + idleX - rot.x) * ease;
    rot.y += (rot.ty + idleY - rot.y) * ease;
    this.group.rotation.set(rot.x, rot.y + flipY, 0);
    this.group.scale.setScalar(flipS);
    this.key.position.x += (this.light.x * 3.2 - 0.4 - this.key.position.x) * 0.08;
    this.key.position.y += (this.light.y * 2.2 + 2.6 - this.key.position.y) * 0.08;
    var moving = animate || this.dirty || Math.abs(rot.tx - rot.x) > 0.001 || Math.abs(rot.ty - rot.y) > 0.001 || this.flip;
    if (moving) { this.renderer.render(this.scene, this.camera); this.dirty = false; }
    requestAnimationFrame(function () { self.loop(); });
  };

  /* ---------- arranque ---------- */
  function mountAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.fabric-viewer:not([data-mounted])'), function (el) {
      el.setAttribute('data-mounted', '');
      new Viewer(el);
    });
  }
  MC.fabric = { FABRICS: FABRICS, mountAll: mountAll };
  MC.ready(mountAll);
})();
