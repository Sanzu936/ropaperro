/* Colecciones: escultura de perro en yeso con la prenda puesta, en 3D. Cada prenda se genera por
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
      noise(200, 10);
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
    var mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(m.color), roughness: 0.9, envMapIntensity: 0.55 });
    var kind = m.fabric;
    mat.map = tex(kind, true);
    mat.bumpMap = tex(kind, false);
    mat.bumpScale = kind === "knit" ? 1.4 : kind === "wool" ? 0.3 : kind === "velvet" ? 0.12 : 0.25;
    if (kind === "velvet") { mat.roughness = 0.9; mat.sheen = 0.9; mat.sheenColor = new THREE.Color(m.sheen || "#d9b98d"); mat.sheenRoughness = 0.55; }
    if (kind === "silk") { mat.roughness = 0.3; mat.sheen = 0.8; mat.sheenColor = new THREE.Color("#fff1d8"); mat.sheenRoughness = 0.3; mat.envMapIntensity = 1; }
    if (kind === "gabardine") { mat.roughness = 0.55; mat.envMapIntensity = 0.7; }
    if (kind === "quilt") { mat.roughness = 0.38; mat.envMapIntensity = 0.9; mat.clearcoat = 0.25; mat.clearcoatRoughness = 0.5; }
    hookDissolve(mat, dis);
    return mat;
  }

  /* ---- Radio de la prenda ---- */
  function garmentR(t, th, m) {
    var span = m.t1 - m.t0, s = clamp((t - m.t0) / span, -0.2, 1);
    var r = bodyR(t) + 0.045 + (m.thick || 0);
    r += (m.flare || 0) * Math.pow(Math.max(0, 1 - s), 2.2);
    if (m.puff) {
      var a = m.baffles
        ? Math.pow(Math.abs(Math.sin(s * (m.puffM || 8) * Math.PI)), 0.55) * (0.88 + 0.12 * Math.cos(th * 5))
        : Math.pow(Math.abs(Math.sin(th * (m.puffN || 12) / 2)), 0.6) * Math.pow(Math.abs(Math.sin(s * (m.puffM || 7) * Math.PI)), 0.6);
      r += m.puff * a;
    }
    if (m.folds) r += m.folds * Math.pow(Math.max(0, 1 - s), 1.5) * (0.5 + 0.5 * Math.sin(th * (m.foldN || 9) + 2 * Math.sin(t * 6)));
    if (m.cable) r += 0.02 * Math.sin(th * m.cable) * smooth(0.05, 0.25, s);
    if (m.ribHem) r += -0.04 * smooth(0.16, 0, s) + 0.012 * Math.sin(th * 64) * smooth(0.17, 0.02, s);
    r += (m.wr === undefined ? 0.008 : m.wr) * Math.sin(th * 7 + t * 9) * (0.4 + 0.6 * (1 - s));
    return r;
  }

  function dim(hex, k) { return new THREE.Color(hex).multiplyScalar(k); }

  function makeGarment(m) {
    var g = new THREE.Group();
    var dis = g.userData.dis = { value: 0 };
    var pip = g.userData.pip = [];
    var mat = fabricMaterial(m, dis);
    var neckBase = new THREE.Vector3(1.35, 0.12, 0);
    var dir = new THREE.Vector3(Math.cos(NECK_A), Math.sin(NECK_A), 0);
    var up = new THREE.Vector3(-Math.sin(NECK_A), Math.cos(NECK_A), 0);
    function add(mesh, cast) { mesh.castShadow = cast !== false; mesh.receiveShadow = true; g.add(mesh); return mesh; }
    var pipeMat = new THREE.MeshStandardMaterial({ color: m.piping ? new THREE.Color(m.piping) : dim(m.color, 0.5), roughness: m.piping ? 0.35 : 0.7, metalness: m.piping ? 0.6 : 0, envMapIntensity: 0.8 });

    if (!m.bow) {
      var th0 = m.cape ? -2.3 : -Math.PI, th1 = m.cape ? 2.3 : Math.PI;
      var drop = m.cape ? 0 : (m.hemDrop === undefined ? 0.07 : m.hemDrop);
      var lowT = function (th) { return m.t0 - drop * (0.5 + 0.5 * Math.cos(th)); };
      var pt = function (s, u) {
        var th = th0 + (th1 - th0) * u, lo = lowT(th), t = lo + (m.t1 - lo) * s;
        var p = section(garmentR(t, th, m), th);
        return new THREE.Vector3(X0 + L * t, p[0], p[1]);
      };
      var geo = surface(140, 100, function (s, u) { var v = pt(s, u); return [v.x, v.y, v.z]; });
      add(new THREE.Mesh(geo, mat));
      var lmat = new THREE.MeshStandardMaterial({ color: new THREE.Color(m.lining || "#e6dac4"), roughness: 0.6, side: THREE.BackSide });
      hookDissolve(lmat, dis);
      add(new THREE.Mesh(geo, lmat), false);

      // ribetes: dobladillo, cuello y costura del lomo
      var tube = function (points, closed, r) {
        var mesh = add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed), 220, r, 8, closed), pipeMat), false);
        pip.push(mesh);
      };
      var hem = [], neckEdge = [], ui;
      for (ui = 0; ui < 90; ui++) { var uu = ui / 90; hem.push(pt(0, uu)); neckEdge.push(pt(1, uu)); }
      if (m.cape) { hem.push(pt(0, 1)); neckEdge.push(pt(1, 1)); }
      tube(hem, !m.cape, 0.016);
      tube(neckEdge, !m.cape, 0.012);
      var spine = [];
      for (ui = 0; ui <= 30; ui++) spine.push(pt(ui / 30, 0.5));
      tube(spine, false, 0.009);

      if (m.buttons) {
        var bm = new THREE.MeshStandardMaterial({ color: m.btnColor || 0x20150e, roughness: 0.5, metalness: m.btnColor ? 0.3 : 0.1, envMapIntensity: 0.6 });
        var bgeo = new THREE.CylinderGeometry(0.05, 0.05, 0.035, 20);
        [-1, 1].forEach(function (side) {
          for (var bi = 0; bi < m.buttons; bi++) {
            var bt = 0.32 + (0.72 - 0.32) * (m.buttons > 1 ? bi / (m.buttons - 1) : 0.5), bth = side * 1.12;
            var bp = section(garmentR(bt, bth, m) + 0.02, bth);
            var btn = new THREE.Mesh(bgeo, bm);
            btn.position.set(X0 + L * bt, bp[0], bp[1]);
            btn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, bp[0] / 1.04, bp[1] / 0.88).normalize());
            btn.castShadow = true;
            g.add(btn);
            pip.push(btn);
          }
        });
      }
    }
    if (m.collar) {
      var cg = new THREE.Group();
      cg.position.copy(neckBase).addScaledVector(dir, 0.34);
      cg.rotation.z = NECK_A;
      var tor = new THREE.Mesh(new THREE.TorusGeometry(0.37 + m.collar * 0.5, m.collar, 24, 64), mat);
      tor.rotation.y = Math.PI / 2; tor.castShadow = true; tor.receiveShadow = true;
      cg.add(tor);
      g.add(cg);
    }
    if (m.belt) {
      var bg = new THREE.Group();
      var bt0 = 0.45;
      bg.position.x = X0 + L * bt0;
      bg.scale.set(1, 1.04, 0.88);
      var belt = new THREE.Mesh(new THREE.TorusGeometry(garmentR(bt0, 0, m) + 0.02, 0.04, 14, 90),
        new THREE.MeshStandardMaterial({ color: 0x2b1b12, roughness: 0.45, envMapIntensity: 0.8 }));
      belt.rotation.y = Math.PI / 2; belt.castShadow = true;
      bg.add(belt);
      var buckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.045), new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.3, metalness: 0.8, envMapIntensity: 1.2 }));
      buckle.position.set(0, garmentR(bt0, 0, m) + 0.02, 0);
      buckle.rotation.y = Math.PI / 2;
      bg.add(buckle);
      g.add(bg);
      pip.push(bg);
    }
    if (m.clasp) { // broche de latón en lo alto del cuello
      var cl = new THREE.Group();
      cl.position.copy(neckBase).addScaledVector(dir, 0.3).addScaledVector(up, 0.46);
      cl.rotation.z = NECK_A;
      var brassM = new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.28, metalness: 0.85, envMapIntensity: 1.3 });
      var disc = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 32), brassM);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.016, 12, 40), brassM);
      ring.rotation.x = Math.PI / 2;
      cl.add(disc, ring);
      g.add(cl);
      pip.push(cl);
    }
    if (m.bow) {
      // cinta alrededor del cuello y pajarita anudada en la parte superior
      var center = neckBase.clone().addScaledVector(dir, 0.3);
      var band = new THREE.Group();
      band.position.copy(center); band.rotation.z = NECK_A;
      var ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.045, 14, 64), mat);
      ring2.rotation.y = Math.PI / 2; ring2.castShadow = true;
      band.add(ring2);
      g.add(band);

      var bow = new THREE.Group();
      bow.position.copy(center).addScaledVector(up, 0.42);
      bow.rotation.z = NECK_A;
      var wing = new THREE.ConeGeometry(0.27, 0.58, 32);
      var wl = new THREE.Mesh(wing, mat); wl.rotation.x = -Math.PI / 2; wl.position.z = 0.29; wl.scale.x = 0.35;
      var wr = new THREE.Mesh(wing, mat); wr.rotation.x = Math.PI / 2; wr.position.z = -0.29; wr.scale.x = 0.35;
      var knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), mat);
      wl.castShadow = wr.castShadow = knot.castShadow = true;
      bow.add(wl, wr, knot);
      g.add(bow);
    }
    return g;
  }

  /* ---- Entorno de estudio (reflejos suaves) ---- */
  function studioEnv(renderer) {
    var envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(12, 32, 16), new THREE.MeshBasicMaterial({ color: 0x2a211a, side: THREE.BackSide })));
    function panel(x, y, z, w, h, c, k) {
      var p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      p.position.set(x, y, z); p.lookAt(0, 0, 0); envScene.add(p);
    }
    panel(5, 6, 5, 6, 4, 0xfff0dc, 5);
    panel(-7, 3, -2, 3, 7, 0xd9bf94, 3);
    panel(0, 9, -5, 8, 3, 0xffffff, 3);
    panel(-3, 1, 8, 4, 3, 0xcfd8e6, 1.2);
    var pm = new THREE.PMREMGenerator(renderer);
    var tx = pm.fromScene(envScene, 0.04).texture;
    pm.dispose();
    return tx;
  }

  /* ---- Escultura de perro en yeso ---- */
  function buildDog(formColor, add) {
    var plaster = new THREE.MeshStandardMaterial({ color: new THREE.Color(formColor || "#d9d0c0"), roughness: 0.85, envMapIntensity: 0.5 });
    var dark = new THREE.MeshStandardMaterial({ color: 0x1d1612, roughness: 0.4, envMapIntensity: 0.8 });
    var brass = new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.3, metalness: 0.85, envMapIntensity: 1.3 });
    function mesh(geo, mt, x, y, z) { var m = new THREE.Mesh(geo, mt); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; add(m); return m; }

    mesh(surface(96, 64, function (s, u) {
      var th = -Math.PI + TAU * u, R = bodyR(s), p = section(R, th);
      return [X0 + L * s, p[0], p[1]];
    }, true), plaster, 0, 0, 0);

    // cuello y cabeza
    var neck = mesh(new THREE.CapsuleGeometry(0.34, 0.5, 8, 24), plaster, 1.78, 0.56, 0);
    neck.rotation.z = -(Math.PI / 2 - NECK_A);
    var hx = 2.3, hy = 1.02;
    var skull = mesh(new THREE.SphereGeometry(0.37, 36, 28), plaster, hx, hy, 0); skull.scale.set(1.12, 1, 0.9);
    var snout = mesh(new THREE.CylinderGeometry(0.12, 0.21, 0.56, 28), plaster, hx + 0.42, hy - 0.13, 0);
    snout.rotation.z = -Math.PI / 2 + 0.1;
    mesh(new THREE.SphereGeometry(0.105, 24, 18), dark, hx + 0.69, hy - 0.16, 0).scale.set(1, 0.85, 1.1);
    [-1, 1].forEach(function (sd) {
      var ear = mesh(new THREE.SphereGeometry(0.14, 24, 18), plaster, hx - 0.12, hy - 0.02, sd * 0.31);
      ear.scale.set(0.9, 2.2, 0.55); ear.rotation.z = 0.18; ear.rotation.x = sd * -0.1;
      mesh(new THREE.SphereGeometry(0.036, 12, 10), dark, hx + 0.3, hy + 0.1, sd * 0.27);
    });

    // patas
    [[0.95, 0.34], [0.95, -0.34], [-1.0, 0.34], [-1.0, -0.34]].forEach(function (p) {
      mesh(new THREE.CylinderGeometry(0.2, 0.105, 1.56, 28), plaster, p[0], -1.03, p[1]);
      var paw = mesh(new THREE.SphereGeometry(0.135, 20, 14), plaster, p[0] + 0.06, -1.76, p[1]); paw.scale.set(1.5, 0.55, 1.1);
    });
    // cola
    var tail = new THREE.CatmullRomCurve3([new THREE.Vector3(-1.5, 0.12, 0), new THREE.Vector3(-1.95, 0.18, 0), new THREE.Vector3(-2.28, 0.5, 0), new THREE.Vector3(-2.4, 0.95, 0)]);
    mesh(new THREE.TubeGeometry(tail, 40, 0.065, 12, false), plaster, 0, 0, 0);

    // plinto de latón
    var base = mesh(new THREE.CylinderGeometry(1.75, 1.8, 0.07, 64), brass, 0.1, -1.84, 0); base.scale.set(1, 1, 0.5);
    base.castShadow = false;
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
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    scene.environment = studioEnv(renderer);
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    scene.add(new THREE.HemisphereLight(0xfff1dc, 0x2a1d14, 0.3));
    var key = new THREE.DirectionalLight(0xffe3c2, 2.2); key.position.set(3.5, 5, 4);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4.5; key.shadow.camera.right = 4.5; key.shadow.camera.top = 4.5; key.shadow.camera.bottom = -4.5;
    key.shadow.camera.near = 1; key.shadow.camera.far = 20; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xc9ae86, 1.3); rim.position.set(-4, 2.5, -3.5); scene.add(rim);

    var stage = new THREE.Group(); scene.add(stage);
    var turn = new THREE.Group(); stage.add(turn);
    buildDog(opts.form, function (m) { turn.add(m); });

    // sombra de contacto sobre el suelo
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.22 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.8; floor.receiveShadow = true;
    stage.add(floor);

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
        var pv = h < 0.05;
        garments[j].userData.pip.forEach(function (p) { p.visible = pv; });
      }
      turn.rotation.y = -0.72 + k * 0.58; // arco de vista: 3/4 frontal → perfil → 3/4 trasero (la cabeza siempre apunta a la derecha)
      turn.position.y = Math.sin(t * 0.8) * 0.03;
    }
    function resize() {
      var w = canvas.clientWidth || 800, h = canvas.clientHeight || 600;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var portrait = w / h < 0.9;
      camera.position.set(0, 1.4, portrait ? 22 : 9.6);
      camera.lookAt(0, -0.2, 0);
      stage.position.set(portrait ? 0 : w / h > 1.4 ? 1.3 : 0.6, portrait ? 0.2 : 0, 0);
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
