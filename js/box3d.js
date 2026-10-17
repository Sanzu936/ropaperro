/* El estuche: caja de cuero negro con lacre. Se abre con el scroll: tapa, papel de seda,
   prenda doblada y tarjeta numerada. Todo generado por código. */
(function () {
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(t) { return t * t * (3 - 2 * t); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  var GOLD = "#c9a46c";
  var SERIF = '"Marcellus", "Cinzel", Georgia, serif';

  function canvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function noiseFill(ctx, w, h, base, amp) {
    ctx.fillStyle = "rgb(" + base + "," + base + "," + base + ")"; ctx.fillRect(0, 0, w, h);
    var d = ctx.getImageData(0, 0, w, h);
    for (var p = 0; p < d.data.length; p += 4) { var n = (Math.random() - 0.5) * amp; d.data[p] += n; d.data[p + 1] += n; d.data[p + 2] += n; }
    ctx.putImageData(d, 0, 0);
  }
  function spaced(ctx, text, cx, y, gap) {
    var total = 0, i, ws = [];
    for (i = 0; i < text.length; i++) { var w = ctx.measureText(text[i]).width; ws.push(w); total += w + gap; }
    total -= gap;
    var x = cx - total / 2;
    ctx.textAlign = "left";
    for (i = 0; i < text.length; i++) { ctx.fillText(text[i], x, y); x += ws[i] + gap; }
  }
  function tex(c, srgb) {
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function leatherMaps() {
    var c = canvas(256, 256), x = c.getContext("2d");
    noiseFill(x, 256, 256, 170, 34);
    return { map: tex(c, true), bump: tex(c, false) };
  }
  function lidTexture(color) {
    var c = canvas(1024, 704), x = c.getContext("2d");
    noiseFill(x, 1024, 704, 40, 22);
    x.strokeStyle = "rgba(201,164,108,.55)"; x.lineWidth = 3; x.strokeRect(54, 54, 916, 596);
    x.strokeStyle = "rgba(201,164,108,.25)"; x.lineWidth = 1.5; x.strokeRect(70, 70, 884, 564);
    x.fillStyle = color || GOLD;
    x.font = "58px " + SERIF; x.textBaseline = "middle";
    spaced(x, "MAISON CANIS", 512, 330, 22);
    x.font = "22px " + SERIF; x.globalAlpha = 0.8;
    spaced(x, "ATELIER · SERIE DE TREINTA", 512, 410, 10);
    return tex(c, true);
  }
  function sealTexture() {
    var c = canvas(256, 256), x = c.getContext("2d");
    x.fillStyle = "#6a3a20"; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "rgba(255,225,190,.55)"; x.lineWidth = 3;
    x.beginPath(); x.arc(128, 128, 96, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(128, 128, 84, 0, Math.PI * 2); x.setLineDash([3, 6]); x.stroke();
    x.setLineDash([]);
    x.fillStyle = "rgba(255,225,190,.8)"; x.font = "78px " + SERIF; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText("MC", 128, 134);
    return tex(c, true);
  }
  function cardTexture(num, name) {
    var c = canvas(512, 720), x = c.getContext("2d");
    noiseFill(x, 512, 720, 238, 10);
    x.strokeStyle = "rgba(107,74,47,.5)"; x.lineWidth = 2; x.strokeRect(26, 26, 460, 668);
    x.fillStyle = "#6b4a2f"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = "30px " + SERIF; spaced(x, "MAISON CANIS", 256, 100, 8);
    x.font = "130px " + SERIF; x.fillText("Nº", 256, 250);
    x.font = "110px " + SERIF; x.fillText(num, 256, 380);
    x.font = "34px " + SERIF; x.fillStyle = "#1a1a1a"; x.fillText(name, 256, 500);
    x.font = "22px " + SERIF; x.fillStyle = "#6b4a2f"; spaced(x, "CONFECCIONADA A MANO", 256, 590, 5);
    return tex(c, true);
  }
  function woolTexture() {
    var c = canvas(256, 256), x = c.getContext("2d");
    noiseFill(x, 256, 256, 190, 28);
    x.strokeStyle = "rgba(0,0,0,.1)";
    for (var i = 0; i < 256; i += 4) { x.beginPath(); x.moveTo(i + .5, 0); x.lineTo(i + .5, 256); x.stroke(); x.beginPath(); x.moveTo(0, i + .5); x.lineTo(256, i + .5); x.stroke(); }
    var t = tex(c, true); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 6);
    return t;
  }

  /* Caja redondeada (superelipsoide) para la prenda doblada */
  function foldedGeometry(w, h, d) {
    var g = new THREE.SphereGeometry(1, 64, 40);
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      p.setXYZ(i, Math.sign(x) * Math.pow(Math.abs(x), 0.5) * w, Math.sign(y) * Math.pow(Math.abs(y), 0.55) * h, Math.sign(z) * Math.pow(Math.abs(z), 0.5) * d);
    }
    g.computeVertexNormals();
    return g;
  }

  function studioEnv(renderer) {
    var envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(12, 32, 16), new THREE.MeshBasicMaterial({ color: 0x241b15, side: THREE.BackSide })));
    function panel(x, y, z, w, h, c, k) {
      var p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      p.position.set(x, y, z); p.lookAt(0, 0, 0); envScene.add(p);
    }
    panel(5, 7, 4, 7, 4, 0xfff0dc, 5);
    panel(-7, 3, -2, 3, 7, 0xd9bf94, 3);
    panel(0, 9, -5, 8, 3, 0xffffff, 3);
    var pm = new THREE.PMREMGenerator(renderer);
    var t = pm.fromScene(envScene, 0.04).texture;
    pm.dispose();
    return t;
  }

  window.initBox = function (cv, opts) {
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    scene.environment = studioEnv(renderer);
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    scene.add(new THREE.HemisphereLight(0xfff1dc, 0x20160f, 0.3));
    var key = new THREE.DirectionalLight(0xffe3c2, 2.4); key.position.set(3, 6, 4);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    var sc = key.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 20;
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xc9ae86, 1.2); rim.position.set(-4, 3, -4); scene.add(rim);

    var W = 3.4, D = 2.4, HB = 0.9, HL = 0.5, T = 0.07;
    var root = new THREE.Group(); scene.add(root);
    function shadowed(m) { m.castShadow = true; m.receiveShadow = true; return m; }

    var lm = leatherMaps(); lm.map.wrapS = lm.map.wrapT = lm.bump.wrapS = lm.bump.wrapT = THREE.RepeatWrapping; lm.map.repeat.set(3, 2); lm.bump.repeat.set(3, 2);
    var leather = new THREE.MeshStandardMaterial({ color: 0x14100d, roughness: 0.5, map: lm.map, bumpMap: lm.bump, bumpScale: 0.05, envMapIntensity: 0.6 });
    var lining = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.85, side: THREE.BackSide });
    var liningFront = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.85 });

    // base: cuatro paredes + fondo (cuero) y forro interior crema
    var base = new THREE.Group(); root.add(base);
    function wall(w, h, d, x, y, z) { var m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), leather)); m.position.set(x, y, z); base.add(m); }
    wall(W, T, D, 0, T / 2, 0);
    wall(W, HB, T, 0, HB / 2, D / 2 - T / 2);
    wall(W, HB, T, 0, HB / 2, -D / 2 + T / 2);
    wall(T, HB, D - 2 * T, W / 2 - T / 2, HB / 2, 0);
    wall(T, HB, D - 2 * T, -W / 2 + T / 2, HB / 2, 0);
    var inner = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * T - 0.02, HB - T, D - 2 * T - 0.02), lining);
    inner.position.set(0, T + (HB - T) / 2, 0); inner.receiveShadow = true; base.add(inner);

    // tapa con bisagra en el borde trasero
    var lidPivot = new THREE.Group(); lidPivot.position.set(0, HB, -D / 2); root.add(lidPivot);
    var lidTop = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, map: lidTexture(), envMapIntensity: 1 });
    var lidMats = [leather, leather, lidTop, liningFront, leather, leather];
    var lid = shadowed(new THREE.Mesh(new THREE.BoxGeometry(W + 0.14, HL, D + 0.14), lidMats));
    lid.position.set(0, HL / 2, D / 2); lidPivot.add(lid);
    // cinta y lacre
    var ribbonMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.55, envMapIntensity: 0.8 });
    var ribbon = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.22, HL + 0.025, D + 0.2), ribbonMat));
    ribbon.position.set(0, HL / 2, D / 2); lidPivot.add(ribbon);
    var sealGroup = new THREE.Group(); sealGroup.position.set(0, HL + 0.04, D / 2 + 0.55); lidPivot.add(sealGroup);
    var seal = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.1, 40),
      [new THREE.MeshStandardMaterial({ color: 0x6a3a20, roughness: 0.3, envMapIntensity: 1.1 }), new THREE.MeshStandardMaterial({ color: 0x6a3a20, map: sealTexture(), roughness: 0.3, envMapIntensity: 1.1 }), new THREE.MeshStandardMaterial({ color: 0x6a3a20, roughness: 0.3 })]));
    sealGroup.add(seal);

    // interior: prenda doblada, papel de seda y tarjeta
    var wool = new THREE.MeshStandardMaterial({ color: 0x7a5638, roughness: 0.92, map: woolTexture(), envMapIntensity: 0.5 });
    var coat = new THREE.Group(); coat.position.set(0, T + 0.2, 0); root.add(coat);
    var liningFold = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.7, envMapIntensity: 0.6 });
    var layer1 = shadowed(new THREE.Mesh(foldedGeometry(W / 2 - 0.22, 0.2, D / 2 - 0.22), wool)); layer1.position.y = 0; coat.add(layer1);
    var layer2 = shadowed(new THREE.Mesh(foldedGeometry(W / 2 - 0.5, 0.17, D / 2 - 0.4), wool)); layer2.position.set(-0.12, 0.3, 0); layer2.rotation.y = 0.04; coat.add(layer2);
    var peek = shadowed(new THREE.Mesh(foldedGeometry(0.62, 0.07, D / 2 - 0.46), liningFold)); peek.position.set(W / 2 - 0.95, 0.37, 0); coat.add(peek);
    var layer3 = shadowed(new THREE.Mesh(foldedGeometry(0.85, 0.18, D / 2 - 0.55), wool)); layer3.position.set(W / 2 - 1.05, 0.5, 0); layer3.rotation.y = -0.05; coat.add(layer3);
    var tag = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.2), new THREE.MeshStandardMaterial({ color: 0xc9a46c, roughness: 0.35, metalness: 0.6, envMapIntensity: 1.2 })));
    tag.position.set(-0.55, 0.7, 0.55); tag.rotation.y = 0.3; coat.add(tag);

    var card = new THREE.Group(); card.position.set(-0.55, 0.68, 0.55); coat.add(card);
    var cardMesh = shadowed(new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.34), new THREE.MeshStandardMaterial({ map: cardTexture("07", "Abrigo Montmartre"), roughness: 0.8, side: THREE.DoubleSide })));
    cardMesh.position.y = -0.67; card.add(cardMesh);
    var cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0xc9a46c, roughness: 0.4 }));
    cord.position.y = -0.0; card.add(cord);

    // papel de seda: dos hojas que se abren como un libro
    var tissueMat = new THREE.MeshStandardMaterial({ color: 0xf2e9d9, roughness: 0.85, side: THREE.DoubleSide, envMapIntensity: 0.6 });
    function tissueGeo(w, d) {
      var g = new THREE.PlaneGeometry(w, d, 40, 30);
      var p = g.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var x = p.getX(i), y = p.getY(i);
        p.setZ(i, Math.sin(x * 5 + y * 3) * 0.035 + Math.sin(x * 11 - y * 7) * 0.018 + Math.sin(y * 9) * 0.02);
      }
      g.computeVertexNormals();
      return g;
    }
    var hw = (W - 2 * T - 0.04) / 2, TY = HB - 0.02;
    var flapL = new THREE.Group(); flapL.position.set(-hw, TY, 0); root.add(flapL);
    var flapR = new THREE.Group(); flapR.position.set(hw, TY, 0); root.add(flapR);
    var tl = shadowed(new THREE.Mesh(tissueGeo(hw, D - 2 * T - 0.04), tissueMat)); tl.rotation.x = -Math.PI / 2; tl.position.x = hw / 2; flapL.add(tl);
    var tr = shadowed(new THREE.Mesh(tissueGeo(hw, D - 2 * T - 0.04), tissueMat)); tr.rotation.x = -Math.PI / 2; tr.position.x = -hw / 2; flapR.add(tr);

    var floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity: 0.4 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.001; floor.receiveShadow = true; scene.add(floor);

    var p = 0, target = 0, running = false, raf = 0, inView = false, reduce = !!(opts && opts.reduceMotion);

    function apply(t) {
      var enter = easeOut(seg(p, 0, 0.14));
      var seal = seg(p, 0.14, 0.26);
      var lidA = ease(seg(p, 0.26, 0.5));
      var flaps = ease(seg(p, 0.5, 0.7));
      var rise = easeOut(seg(p, 0.7, 1));

      root.rotation.y = -0.85 + enter * 0.5 + p * 0.45 + Math.sin(t * 0.5) * 0.02;
      root.position.y = (1 - enter) * -0.5 + Math.sin(t * 0.9) * 0.015;
      root.scale.setScalar(0.88 + enter * 0.12);

      sealGroup.scale.setScalar(Math.max(0.0001, 1 - seal));
      sealGroup.position.y = HL + 0.04 + seal * 0.5;
      sealGroup.visible = seal < 0.999;
      lidPivot.rotation.x = -lidA * 1.72;
      flapL.rotation.z = -flaps * 1.5;
      flapR.rotation.z = flaps * 1.5;
      flapL.scale.x = flapR.scale.x = 1 - 0.4 * flaps;

      coat.position.y = T + 0.2 + rise * 1.9;
      coat.rotation.y = rise * 0.5;
      coat.rotation.z = rise * 0.08;
      var shown = seg(p, 0.74, 0.9);
      card.visible = shown > 0.001;
      card.rotation.y = -0.55 + Math.sin(t * 0.8) * 0.1;
      card.rotation.z = Math.sin(t * 0.7) * 0.05;
      card.scale.setScalar(Math.max(0.0001, ease(shown) * 1.35));
      cord.visible = true;

      // cámara: se acerca y sube a medida que se abre
      var ca = 0.1 + seg(p, 0.2, 1) * 0.0;
      camera.position.set(0, 3.4 + lidA * 0.6, 12.4 - rise * 0.8);
      camera.lookAt(0, 0.9 + lidA * 0.5 + rise * 0.5, 0);
    }
    function resize() {
      var w = cv.clientWidth || 800, h = cv.clientHeight || 600;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var portrait = w / h < 0.9;
      camera.fov = portrait ? 42 : 30;
      root.position.x = portrait ? 0 : (w / h > 1.4 ? 1.7 : 0.6);
      camera.updateProjectionMatrix();
    }
    function render() { renderer.render(scene, camera); }
    function frame() {
      if (!running) return;
      p += (target - p) * 0.09;
      apply(performance.now() / 1000);
      render();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    resize(); apply(0); render();
    window.addEventListener("resize", function () { resize(); apply(0); render(); });
    new IntersectionObserver(function (en) {
      inView = en[0].isIntersecting;
      inView && !document.hidden ? start() : stop();
    }, { threshold: 0 }).observe(cv);
    document.addEventListener("visibilitychange", function () { document.hidden || !inView ? stop() : start(); });

    return {
      setP: function (v) { target = v; if (reduce) { p = v; apply(0); render(); } },
      resize: resize
    };
  };
})();
