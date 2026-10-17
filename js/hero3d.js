/* Hero: tejido de lana/terciopelo ondulando, reacciona al cursor y al scroll. */
(function () {
  var VERT = [
    "uniform float uTime; uniform vec2 uMouse; uniform float uStrength; uniform float uScroll;",
    "varying vec3 vN; varying vec3 vView; varying vec2 vUv; varying float vH;",
    "float h(vec2 p){",
    "  float t = uTime * .22;",
    "  float a = sin(p.x*.9 + t*1.7 + sin(p.y*.6 + t)*1.4) * .55;",
    "  a += sin(p.y*1.5 - t*1.2 + p.x*.5) * .30;",
    "  a += sin((p.x+p.y)*2.6 + t*2.2) * .07;",
    "  float d = length(p - uMouse);",
    "  a += exp(-d*d*.9) * uStrength * sin(d*6. - uTime*2.4) * .5;",
    "  return a * (.8 + uScroll*.9);",
    "}",
    "void main(){",
    "  vec3 pos = position;",
    "  float e = .03;",
    "  float z = h(pos.xy);",
    "  float dx = h(pos.xy + vec2(e,0.)) - h(pos.xy - vec2(e,0.));",
    "  float dy = h(pos.xy + vec2(0.,e)) - h(pos.xy - vec2(0.,e));",
    "  vec3 n = normalize(vec3(-dx/(2.*e), -dy/(2.*e), 1.));",
    "  pos.z = z;",
    "  vec4 mv = modelViewMatrix * vec4(pos, 1.);",
    "  vN = normalize(normalMatrix * n);",
    "  vView = -mv.xyz;",
    "  vUv = uv; vH = z;",
    "  gl_Position = projectionMatrix * mv;",
    "}"
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform sampler2D uMono;",
    "varying vec3 vN; varying vec3 vView; varying vec2 vUv; varying float vH;",
    "void main(){",
    "  vec3 n = normalize(vN);",
    "  vec3 v = normalize(vView);",
    "  vec3 l = normalize(vec3(-.45, .7, .65));",
    "  float diff = dot(n, l) * .5 + .5;",
    "  float fres = pow(1. - max(dot(n, v), 0.), 2.4);",
    "  vec3 deep = vec3(.075, .056, .043);",
    "  vec3 tab  = vec3(.40, .27, .17);",
    "  vec3 col = mix(deep, tab, smoothstep(.25, 1., diff));",
    "  col += fres * vec3(.50, .34, .21) * .75;",
    "  float spec = pow(max(dot(reflect(-l, n), v), 0.), 22.);",
    "  col += spec * vec3(.9, .72, .5) * .16;",
    "  float mk = smoothstep(.35, .75, texture2D(uMono, vUv * vec2(15., 9.)).r);",
    "  col = mix(col, col * 1.32 + vec3(.035, .02, .008), mk * .75);",
    "  col += mk * spec * 2.4 * vec3(.9, .72, .5) * .16;",
    "  float weave = sin(vUv.x * 720.) * sin(vUv.y * 420.);",
    "  col *= 1. + weave * .018;",
    "  vec2 sp = gl_FragCoord.xy / uRes;",
    "  float vig = smoothstep(1.15, .25, length(sp - vec2(.5, .55)));",
    "  col *= mix(.45, 1., vig);",
    "  gl_FragColor = vec4(col, 1.);",
    "}"
  ].join("\n");

  window.initHero = function (canvas, opts) {
    opts = opts || {};
    var reduce = !!opts.reduceMotion;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
    } catch (e) { return null; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x14110e, 1);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0.2, 7.5);

    var uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uStrength: { value: 0 },
      uScroll: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) }
    };
    // tejido jacquard: máscara del monograma
    var monoTex = new THREE.CanvasTexture(window.MC.maskCanvas);
    monoTex.wrapS = monoTex.wrapT = THREE.RepeatWrapping;
    monoTex.anisotropy = 8;
    uniforms.uMono = { value: monoTex };
    window.addEventListener("mc-ready", function () { monoTex.needsUpdate = true; if (reduce) renderer.render(scene, camera); });
    var mat = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 12, 240, 140), mat);
    mesh.rotation.x = -0.72;
    mesh.position.set(0, -0.7, -1.5);
    scene.add(mesh);

    var ray = new THREE.Raycaster();
    var ndc = new THREE.Vector2();
    var target = new THREE.Vector2(0, 0);
    var last = new THREE.Vector2(0, 0);
    var strength = 0;
    var running = false, raf = 0, inView = true;
    var t0 = performance.now();

    function resize() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // en vertical (móvil) alejamos la cámara para que el tejido llene el encuadre
      camera.position.z = w / h < 1 ? 9.5 : 7.5;
      camera.updateProjectionMatrix();
      var pr = renderer.getPixelRatio();
      uniforms.uRes.value.set(w * pr, h * pr);
    }

    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      var hit = ray.intersectObject(mesh)[0];
      if (hit) {
        var p = mesh.worldToLocal(hit.point.clone());
        target.set(p.x, p.y);
        var dist = target.distanceTo(last);
        strength = Math.min(1, strength + dist * 0.6);
        last.copy(target);
      }
    }

    function frame() {
      if (!running) return;
      var t = (performance.now() - t0) / 1000;
      uniforms.uTime.value = t;
      uniforms.uMouse.value.lerp(target, 0.08);
      strength *= 0.965;
      uniforms.uStrength.value = strength;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    if (reduce) {
      uniforms.uTime.value = 6;
      renderer.render(scene, camera);
    } else {
      new IntersectionObserver(function (en) {
        inView = en[0].isIntersecting;
        inView && !document.hidden ? start() : stop();
      }, { threshold: 0 }).observe(canvas);
      document.addEventListener("visibilitychange", function () {
        document.hidden || !inView ? stop() : start();
      });
      start();
    }

    return {
      setScroll: function (v) { uniforms.uScroll.value = v; if (reduce) renderer.render(scene, camera); },
      resize: resize
    };
  };
})();
