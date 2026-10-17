/* Colecciones: maniquí de sastre para perros en 3D. Cada prenda se genera por
   código a partir de los parámetros `model` de data.js y se disuelve en la siguiente. */
(function () {
  var TAU = Math.PI * 2, L = 3.2, X0 = -1.6;
  var NECK_A = 0.77; // ángulo del cuello respecto al eje del cuerpo

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* Radio del torso: t = 0 (cola) → 1 (cuello) */
  function bodyR(t) {
    var cap = Math.pow(Math.sin(Math.PI * clamp(t, 0.0001, 0.9999)), 0.3);
    var r = 0.5 + 0.1 * Math.sin(Math.PI * t) +
      0.13 * Math.exp(-Math.pow((t - 0.72) / 0.17, 2)) -
      0.09 * Math.exp(-Math.pow((t - 0.38) / 0.14, 2));
    return r * cap;
  }
  function section(R, th) { return [R * 1.04 * Math.cos(th), R * 0.88 * Math.sin(th)]; }

  /* Superficie paramétrica -> BufferGeometry */
  function surface(nu, nv, fn, capped) {
    var pos = new Float32Array((nu + 1) * (nv + 1) * 3), uv = new Float32Array((nu + 1) * (nv + 1) * 2), idx = [];
    var k = 0, q = 0, i, j;
    for (i = 0; i <= nv; i++) for (j = 0; j <= nu; j++) {
      var p = fn(i / nv, j / nu);
      pos[k++] = p[0]; pos[k++] = p[1]; pos[k++] = p[2];
      uv[q++] = j / nu; uv[q++] = i / nv;
    }
    for (i = 0; i < nv; i++) for (j = 0; j < nu; j++) {
      var a = i * (nu + 1) + j, b = a + 1, c = a + nu + 1, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    if (capped) {
      var nm = g.attributes.normal;
      for (j = 0; j <= nu; j++) { nm.setXYZ(j, -1, 0, 0); nm.setXYZ(nv * (nu + 1) + j, 1, 0, 0); }
    }
    return g;
  }

  /* ---- Texturas de tejido generadas en canvas ---- */
  var canvases = {};
  function fabricCanvas(kind) {
    if (canvases[kind]) return canvases[kind];
    var c = document.createElement("canvas"); c.width = c.height = 256;
    var x = c.getContext("2d"), i, j;
    function noise(base, amp) {
      x.fillStyle = "rgb(" + base + "," + base + "," + base + ")"; x.fillRect(0, 0, 256, 256);
      var d = x.getImageData(0, 0, 256, 256);
      for (var p = 0; p < d.data.length; p += 4) { var n = (Math.random() - 0.5) * amp; d.data[p] += n; d.data[p + 1] += n; d.data[p + 2] += n; }
      x.putImageData(d, 0, 0);
    }
    if (kind === "wool") {
      noise(195, 26); x.strokeStyle = "rgba(0,0,0,.12)";
      for (i = 0; i < 256; i += 4) { x.beginPath(); x.moveTo(i + .5, 0); x.lineTo(i + .5, 256); x.stroke(); x.beginPath(); x.moveTo(0, i + .5); x.lineTo(256, i + .5); x.stroke(); }
    } else if (kind === "gabardine") {
      noise(208, 10); x.lineWidth = 1;
      for (i = -256; i < 256; i += 4) { x.strokeStyle = "rgba(0,0,0,.13)"; x.beginPath(); x.moveTo(i, 256); x.lineTo(i + 256, 0); x.stroke(); x.strokeStyle = "rgba(255,255,255,.1)"; x.beginPath(); x.moveTo(i + 2, 256); x.lineTo(i + 258, 0); x.stroke(); }
    } else if (kind === "knit") {
      noise(195, 14); x.lineCap = "round";
      for (i = 0; i < 256; i += 16) for (j = 0; j < 256; j += 16) {
        x.lineWidth = 4; x.strokeStyle = "rgba(0,0,0,.4)";
        x.beginPath(); x.moveTo(i + 1, j + 2); x.lineTo(i + 8, j + 13); x.lineTo(i + 15, j + 2); x.stroke();
        x.lineWidth = 1.6; x.strokeStyle = "rgba(255,255,255,.55)";
        x.beginPath(); x.moveTo(i + 2, j + 1); x.lineTo(i + 8, j + 11); x.lineTo(i + 14, j + 1); x.stroke();
      }
    } else if (kind === "quilt") {
      noise(208, 10); x.strokeStyle = "rgba(0,0,0,.08)";
      for (i = 0; i < 256; i += 8) { x.beginPath(); x.moveTo(i + .5, 0); x.lineTo(i + .5, 256); x.stroke(); x.beginPath(); x.moveTo(0, i + .5); x.lineTo(256, i + .5); x.stroke(); }
    } else if (kind === "velvet") {
      noise(190, 22);
    } else { // silk
      noise(220, 10);
    }
    canvases[kind] = c;
    return c;
  }
  var REPEAT = { wool: [10, 6], gabardine: [26, 15], knit: [5, 3], quilt: [8, 5], velvet: [14, 8], silk: [6, 4] };
  function tex(kind, srgb) {
    var t = new THREE.CanvasTexture(fabricCanvas(kind));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    var r = REPEAT[kind] || [8, 5];
    t.repeat.set(r[0], r[1]);
    t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /* ---- Disolución por ruido (se aplica a la prenda y a su forro) ---- */
  function hookDissolve(mat, dis) {
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uDis = dis;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vDisUv;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvDisUv = uv;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uDis; varying vec2 vDisUv;\nfloat hh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }")
        .replace("#include <clipping_planes_fragment>",
          "#include <clipping_planes_fragment>\nif (uDis > 0.001) { float nn = hh(floor(vDisUv * vec2(70., 110.))); float e = vDisUv.y + (nn - .5) * .4; if (e < uDis * 1.5 - .25) discard; }");
    };
  }

  /* ---- Material de la prenda ---- */
  function fabricMaterial(m, dis) {
    var mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(m.color), roughness: 0.9 });
    var kind = m.fabric;
    mat.map = tex(kind, true);
    mat.bumpMap = tex(kind, false);
    mat.bumpScale = kind === "knit" ? 1.6 : kind === "wool" ? 0.5 : 0.35;
    if (kind === "velvet") { mat.roughness = 0.9; mat.sheen = 0.8; mat.sheenColor = new THREE.Color(m.sheen || "#d9b98d"); mat.sheenRoughness = 0.65; }
    if (kind === "silk") { mat.roughness = 0.32; mat.sheen = 0.8; mat.sheenColor = new THREE.Color("#fff1d8"); mat.sheenRoughness = 0.3; }
    if (kind === "gabardine") mat.roughness = 0.6;
    if (kind === "quilt") mat.roughness = 0.5;
    hookDissolve(mat, dis);
    return mat;
  }

  /* ---- Radio de la prenda ---- */
  function garmentR(t, th, m) {
    var span = m.t1 - m.t0, s = (t - m.t0) / span;
    var r = bodyR(t) + 0.045 + (m.thick || 0);
    r += (m.flare || 0) * Math.pow(Math.max(0, 1 - s), 2.2);
    if (m.puff) {
      var a = Math.pow(Math.abs(Math.sin(th * (m.puffN || 12) / 2)), 0.6) * Math.pow(Math.abs(Math.sin(s * (m.puffM || 7) * Math.PI)), 0.6);
      r += m.puff * a;
    }
    r += (m.wr === undefined ? 0.01 : m.wr) * Math.sin(th * 7 + t * 9) * (0.4 + 0.6 * (1 - s));
    return r;
  }

  function makeGarment(m) {
    var g = new THREE.Group();
    var dis = g.userData.dis = { value: 0 };
    var mat = fabricMaterial(m, dis);
    var neckBase = new THREE.Vector3(1.35, 0.12, 0);
    var dir = new THREE.Vector3(Math.cos(NECK_A), Math.sin(NECK_A), 0);

    if (!m.bow) {
      var th0 = m.cape ? -2.3 : -Math.PI, th1 = m.cape ? 2.3 : Math.PI;
      var drop = m.cape ? 0 : (m.hemDrop === undefined ? 0.07 : m.hemDrop);
      var geo = surface(120, 90, function (s, u) {
        var th = th0 + (th1 - th0) * u;
        var lo = m.t0 - drop * (0.5 + 0.5 * Math.cos(th));
        var t = lo + (m.t1 - lo) * s;
        var R = garmentR(t, th, m), p = section(R, th);
        return [X0 + L * t, p[0], p[1]];
      });
      g.add(new THREE.Mesh(geo, mat));
      var lmat = new THREE.MeshStandardMaterial({ color: new THREE.Color(m.lining || "#e6dac4"), roughness: 0.6, side: THREE.BackSide });
      hookDissolve(lmat, dis);
      g.add(new THREE.Mesh(geo, lmat));
      if (m.buttons) {
        var bm = new THREE.MeshStandardMaterial({ color: m.btnColor || 0x20150e, roughness: 0.35, metalness: m.btnColor ? 0.4 : 0.1 });
        var bgeo = new THREE.CylinderGeometry(0.05, 0.05, 0.035, 18);
        [-1, 1].forEach(function (side) {
          for (var bi = 0; bi < m.buttons; bi++) {
            var bt = 0.32 + (0.72 - 0.32) * (m.buttons > 1 ? bi / (m.buttons - 1) : 0.5), bth = side * 1.12;
            var bp = section(garmentR(bt, bth, m) + 0.02, bth);
            var btn = new THREE.Mesh(bgeo, bm);
            btn.position.set(X0 + L * bt, bp[0], bp[1]);
            btn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, bp[0] / 1.04, bp[1] / 0.88).normalize());
            g.add(btn);
          }
        });
      }
    }
    if (m.collar) {
      var cg = new THREE.Group();
      cg.position.copy(neckBase).addScaledVector(dir, 0.34);
      cg.rotation.z = NECK_A;
      var tor = new THREE.Mesh(new THREE.TorusGeometry(0.33 + m.collar * 0.5, m.collar, 20, 56), mat);
      tor.rotation.y = Math.PI / 2;
      cg.add(tor);
      g.add(cg);
    }
    if (m.belt) {
      var bg = new THREE.Group();
      var t = 0.45;
      bg.position.x = X0 + L * t;
      bg.scale.set(1, 1.04, 0.88);
      var belt = new THREE.Mesh(new THREE.TorusGeometry(garmentR(t, 0, m) + 0.02, 0.04, 14, 80),
        new THREE.MeshStandardMaterial({ color: 0x2b1b12, roughness: 0.5 }));
      belt.rotation.y = Math.PI / 2;
      bg.add(belt);
      var buckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.13, 0.04), new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.35, metalness: 0.6 }));
      buckle.position.set(0, garmentR(t, 0, m) + 0.02, 0);
      buckle.rotation.y = Math.PI / 2;
      bg.add(buckle);
      g.add(bg);
    }
    if (m.bow) {
      // cinta alrededor del cuello y pajarita anudada en la parte superior (visible desde casi cualquier ángulo)
      var center = neckBase.clone().addScaledVector(dir, 0.3);
      var band = new THREE.Group();
      band.position.copy(center); band.rotation.z = NECK_A;
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.04, 14, 64), mat);
      ring.rotation.y = Math.PI / 2;
      band.add(ring);
      g.add(band);

      var bow = new THREE.Group();
      var up = new THREE.Vector3(-Math.sin(NECK_A), Math.cos(NECK_A), 0);
      bow.position.copy(center).addScaledVector(up, 0.38);
      bow.rotation.z = NECK_A;
      var wing = new THREE.ConeGeometry(0.27, 0.58, 32);
      var wl = new THREE.Mesh(wing, mat); wl.rotation.x = -Math.PI / 2; wl.position.z = 0.29; wl.scale.x = 0.35;
      var wr = new THREE.Mesh(wing, mat); wr.rotation.x = Math.PI / 2; wr.position.z = -0.29; wr.scale.x = 0.35;
      var knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), mat);
      bow.add(wl, wr, knot);
      g.add(bow);
    }
    return g;
  }

  /* ---- Escenario ---- */
  window.initStage = function (canvas, opts) {
    var models = opts.models, n = models.length;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    scene.add(new THREE.HemisphereLight(0xfff1dc, 0x2a1d14, 0.75));
    var key = new THREE.DirectionalLight(0xffe3c2, 2.4); key.position.set(3.5, 4.5, 4); scene.add(key);
    var rim = new THREE.DirectionalLight(0xc9ae86, 1.5); rim.position.set(-4, 2.5, -3.5); scene.add(rim);
    var fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(-3, 0.5, 4); scene.add(fill);

    var stage = new THREE.Group(); scene.add(stage);
    var turn = new THREE.Group(); stage.add(turn);

    // maniquí
    var formMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(opts.form || "#2b231d"), roughness: 0.9, map: tex("wool", true) });
    formMat.map.repeat.set(12, 7);
    turn.add(new THREE.Mesh(surface(96, 64, function (s, u) {
      var th = -Math.PI + TAU * u, R = bodyR(s), p = section(R, th);
      return [X0 + L * s, p[0], p[1]];
    }, true), formMat));
    var neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 8, 24), formMat);
    neck.position.set(1.78, 0.56, 0); neck.rotation.z = -(Math.PI / 2 - NECK_A);
    turn.add(neck);
    var brass = new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.4, metalness: 0.5 });
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 20), brass);
    pole.position.set(0.1, -1.5, 0); turn.add(pole);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.84, 0.07, 56), brass);
    base.position.set(0.1, -2.45, 0); turn.add(base);

    // sombra de contacto
    var sc = document.createElement("canvas"); sc.width = sc.height = 128;
    var sx = sc.getContext("2d"), gr = sx.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, "rgba(0,0,0,.4)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    sx.fillStyle = gr; sx.fillRect(0, 0, 128, 128);
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0.1, -2.48, 0);
    stage.add(shadow);

    var garments = models.map(function (m) { var g = makeGarment(m); turn.add(g); return g; });

    var k = 0, targetK = 0, running = false, raf = 0, inView = false, reduce = !!opts.reduceMotion;

    function apply(t) {
      for (var j = 0; j < n; j++) {
        var d = Math.abs(k - (j + 0.5));
        if (j === 0 && k < 0.5) d = 0;
        if (j === n - 1 && k > n - 0.5) d = 0;
        var h = smooth(0.34, 0.6, d);
        garments[j].userData.dis.value = h;
        garments[j].visible = h < 0.999;
      }
      turn.rotation.y = 0.55 + k * 2.1;
      turn.position.y = Math.sin(t * 0.8) * 0.035;
    }
    function resize() {
      var w = canvas.clientWidth || 800, h = canvas.clientHeight || 600;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var portrait = w / h < 0.9;
      camera.position.set(0, 1.5, portrait ? 17.5 : 9.2);
      camera.lookAt(0, -0.2, 0);
      stage.position.set(portrait ? 0 : w / h > 1.4 ? 2.0 : 1.0, portrait ? 0.35 : 0, 0);
      camera.updateProjectionMatrix();
    }
    function render() { renderer.render(scene, camera); }
    function frame() {
      if (!running) return;
      k += (targetK - k) * 0.09;
      apply(performance.now() / 1000);
      render();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    resize();
    window.addEventListener("resize", function () { resize(); apply(0); render(); });
    apply(0); render();

    new IntersectionObserver(function (en) {
      inView = en[0].isIntersecting;
      inView && !document.hidden ? start() : stop();
    }, { threshold: 0 }).observe(canvas);
    document.addEventListener("visibilitychange", function () { document.hidden || !inView ? stop() : start(); });

    return {
      setK: function (v) { targetK = v; if (reduce) { k = v; apply(0); render(); } },
      resize: resize
    };
  };
})();
