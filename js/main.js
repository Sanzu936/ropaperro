(function () {
  var D = window.MAISON;
  var $ = function (id) { return document.getElementById(id); };
  // Decisión de diseño: las animaciones son parte de la identidad de la marca y se muestran a todo el
  // mundo. Para respetar el ajuste «reducir movimiento» del sistema, cambiar a true.
  var RESPECT_REDUCED_MOTION = false;
  var reduce = RESPECT_REDUCED_MOTION && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.documentElement.classList.add("reduce-motion");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGSAP && !reduce;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function price(n) {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function setImage(el, src, alt) {
    if (!src) return;
    el.style.backgroundImage = "url('" + src.replace(/'/g, "%27") + "')";
    el.classList.add("swatch--img");
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", alt || "");
  }
  function words(el, cls) {
    var txt = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return txt.map(function (w, i) {
      var s = document.createElement("span");
      s.className = cls;
      s.textContent = w;
      el.appendChild(s);
      if (i < txt.length - 1) el.appendChild(document.createTextNode(" "));
      return s;
    });
  }

  /* =====================================================================
     Contenido
     ===================================================================== */
  $("heroTagline").textContent = D.heroTaglines[D.heroIndex] || D.heroTaglines[0];
  $("heroSeason").textContent = D.heroSeason;
  $("manifestoText").textContent = D.manifesto;

  // Título del hero: cada letra dentro de una máscara
  var heroChars = [];
  (function () {
    var t = $("heroTitle");
    "Maison Canis".split(" ").forEach(function (w, wi) {
      var word = document.createElement("span");
      word.className = "hero__word";
      word.setAttribute("aria-hidden", "true");
      w.split("").forEach(function (c) {
        var m = document.createElement("span");
        m.className = "ch";
        var i = document.createElement("span");
        i.className = "ch__i";
        i.textContent = c;
        m.appendChild(i);
        word.appendChild(m);
        heroChars.push(i);
      });
      t.appendChild(word);
    });
  })();

  // Colecciones: una escena fijada por colección
  var stagesEl = $("stages");
  stagesEl.innerHTML = D.collections.map(function (c, ci) {
    var name = c.label.replace(/^Línea\s+/, "");
    return '<section class="stage stage--' + esc(c.theme || "light") + '" id="' + (ci === 0 ? "colecciones" : esc(c.id)) + '" data-i="' + ci + '" aria-label="' + esc(c.label) + '">' +
      '<div class="stage__pin">' +
        '<canvas class="stage__canvas" aria-hidden="true"></canvas>' +
        '<div class="stage__text">' +
          '<p class="stage__season">' + esc(c.season) + '</p>' +
          '<h2 class="stage__title">' + esc(name) + '</h2>' +
          '<p class="stage__desc">' + esc(c.text) + '</p>' +
        '</div>' +
        '<div class="stage__items">' +
        c.products.map(function (p, pi) {
          return '<article class="pinfo' + (pi === 0 ? " is-active" : "") + '">' +
            '<p class="pinfo__tag">N&ordm; ' + pad(p.number) + ' / ' + D.edition + '</p>' +
            '<h3 class="pinfo__name">' + esc(p.name) + '</h3>' +
            '<p class="pinfo__mat">' + esc(p.material) + '</p>' +
            '<p class="pinfo__price">' + price(p.price) + '</p>' +
          '</article>';
        }).join("") +
        '</div>' +
        '<ol class="stage__list" aria-label="Prendas de la línea ' + esc(name) + '">' +
        c.products.map(function (p, pi) {
          return '<li><button type="button" class="stage__go' + (pi === 0 ? " is-active" : "") + '" data-p="' + pi + '"><span>' + esc(p.name) + '</span></button></li>';
        }).join("") +
        '</ol>' +
        (ci === 0 ? '<p class="stage__hint" aria-hidden="true"><span></span>Desplace para ver cada prenda</p>' : "") +
      '</div>' +
    '</section>';
  }).join("");

  // Atelier
  var A = D.atelier;
  $("atelierTitle").textContent = A.title;
  $("atelierText").textContent = A.text;
  $("atelierPillars").innerHTML = A.pillars.map(function (p) {
    return "<li><h3>" + esc(p.title) + "</h3><p>" + esc(p.text) + "</p></li>";
  }).join("");

  // Tallas
  var S = D.sizing;
  $("sizingTitle").textContent = S.title;
  $("sizingText").textContent = S.text;
  $("sizingTip").textContent = S.tip;
  $("sizes").innerHTML = S.sizes.map(function (s, i) {
    return '<button type="button" class="size" role="radio" aria-checked="false" tabindex="-1" data-i="' + i + '">' + esc(s.code) + "</button>";
  }).join("");
  $("readout").innerHTML = [["A", "Cuello", "neck"], ["B", "Pecho", "chest"], ["C", "Lomo", "back"]].map(function (r) {
    return '<div><dt><span class="readout__k">' + r[0] + "</span>" + r[1] + '</dt><dd><output data-key="' + r[2] + '">0</output> cm</dd></div>';
  }).join("");

  // Estuche
  var U = D.unbox;
  $("unboxTitle").textContent = U.title;
  $("unboxSteps").innerHTML = U.steps.map(function (t, i) {
    return '<p class="ustep' + (i === 0 ? " is-active" : "") + '">' + esc(t) + "</p>";
  }).join("");

  // Contacto y pie
  $("contactTitle").textContent = D.contact.title;
  $("contactText").textContent = D.contact.text;
  $("formSuccessText").textContent = D.contact.success;
  $("social").innerHTML = D.social.map(function (s) {
    return '<li><a href="' + esc(s.url) + '" aria-label="' + esc(s.name) + '">' + esc(s.name) + "</a></li>";
  }).join("");
  $("year").textContent = new Date().getFullYear();

  /* =====================================================================
     Tallas (interactivo)
     ===================================================================== */
  var sizeBtns = Array.prototype.slice.call(document.querySelectorAll(".size"));
  var outs = {};
  document.querySelectorAll("#readout output").forEach(function (o) { outs[o.dataset.key] = o; });
  var cur = { neck: 0, chest: 0, back: 0 };
  var sizeIndex = -1;
  var KEYS = ["neck", "chest", "back"];

  function selectSize(i, instant) {
    if (i === sizeIndex) return;
    sizeIndex = i;
    var s = S.sizes[i];
    sizeBtns.forEach(function (b, bi) {
      var on = bi === i;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    $("sizingBreeds").textContent = "Razas habituales: " + s.breeds + ".";
    if (animate && !instant) {
      gsap.to("#dogGroup", { scale: s.scale, svgOrigin: "300 312", duration: 0.8, ease: "power3.out", overwrite: true });
      gsap.to(cur, {
        neck: s.neck, chest: s.chest, back: s.back, duration: 0.8, ease: "power3.out", overwrite: true,
        onUpdate: function () { KEYS.forEach(function (k) { outs[k].textContent = Math.round(cur[k]); }); }
      });
    } else {
      if (hasGSAP) gsap.set("#dogGroup", { scale: s.scale, svgOrigin: "300 312" });
      else $("dogGroup").setAttribute("transform", "translate(300 312) scale(" + s.scale + ") translate(-300 -312)");
      cur.neck = s.neck; cur.chest = s.chest; cur.back = s.back;
      KEYS.forEach(function (k) { outs[k].textContent = cur[k]; });
    }
  }
  sizeBtns.forEach(function (b) {
    b.addEventListener("click", function () { selectSize(+b.dataset.i); });
    b.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = Math.max(0, Math.min(S.sizes.length - 1, sizeIndex + d));
      selectSize(n);
      sizeBtns[n].focus();
    });
  });
  selectSize(S.defaultIndex, true);

  /* =====================================================================
     Formulario (no envía nada)
     ===================================================================== */
  var form = $("waitlistForm"), err = $("formError"), ok = $("formSuccess");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = form.checkValidity();
    err.hidden = valid;
    if (!valid) { err.textContent = "Por favor, complete todos los campos con un correo válido."; return; }
    ok.hidden = false;
    if (animate) gsap.fromTo(ok.querySelector(".stamp"), { scale: 1.7, rotation: -14, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
    form.reset();
  });

  /* =====================================================================
     Menú móvil + cabecera
     ===================================================================== */
  var toggle = $("menuToggle"), nav = $("nav"), header = $("header");
  var lenis = null;
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("no-scroll", open);
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  function onScrollHeader() { header.classList.toggle("is-solid", window.scrollY > 60); }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* =====================================================================
     Cursor propio
     ===================================================================== */
  if (finePointer && !reduce) {
    var cur2 = $("cursor"), cx = -100, cy = -100, tx = -100, ty = -100;
    document.body.classList.add("has-cursor");
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur2.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", function (e) {
      cur2.classList.toggle("is-hover", !!e.target.closest("a, button, input, [data-cursor]"));
    });
  }

  /* =====================================================================
     Sin GSAP o con movimiento reducido: versión estática
     ===================================================================== */
  var hero = null;
  var canvas = $("heroCanvas");
  if (window.THREE && window.initHero) hero = window.initHero(canvas, { reduceMotion: reduce });
  if (!hero) document.querySelector(".hero").classList.add("no-webgl");

  var stageCtl = Array.prototype.map.call(document.querySelectorAll(".stage"), function (el, ci) {
    if (!window.THREE || !window.initStage) return null;
    var c = D.collections[ci];
    return window.initStage(el.querySelector(".stage__canvas"), {
      models: c.products.map(function (p) { return p.model; }), form: c.form, reduceMotion: reduce || !hasGSAP
    });
  });

  var boxCtl = (window.THREE && window.initBox) ? window.initBox($("boxCanvas"), { reduceMotion: reduce || !hasGSAP }) : null;

  if (!animate) {
    document.querySelectorAll(".stage").forEach(function (el) { el.classList.add("stage--static"); });
    document.querySelector(".unbox").classList.add("unbox--static");
    document.body.classList.remove("is-loading");
    var l = $("loader"); if (l) l.remove();
    heroChars.forEach(function (c) { c.style.transform = "none"; });
    return;
  }

  /* =====================================================================
     Scroll suave + GSAP
     ===================================================================== */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll("[data-lenis-link]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); } });
      else target.scrollIntoView();
    });
  });

  /* ---- Hero: parallax con el scroll ---- */
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
    onUpdate: function (self) { if (hero) hero.setScroll(self.progress); }
  });
  gsap.to("#heroContent", { yPercent: -14, opacity: 0.15, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---- Manifiesto: se ilumina palabra a palabra ---- */
  var mw = words($("manifestoText"), "w");
  gsap.fromTo(mw, { opacity: 0.12 }, {
    opacity: 1, ease: "none", stagger: 0.12,
    scrollTrigger: { trigger: "#manifestoText", start: "top 78%", end: "bottom 52%", scrub: true }
  });

  /* ---- Títulos: máscara por palabra ---- */
  document.querySelectorAll(".title, .stage__title").forEach(function (t) {
    var ws = words(t, "mw");
    ws.forEach(function (w) { w.innerHTML = '<span class="mw__i">' + esc(w.textContent) + "</span>"; });
    gsap.from(t.querySelectorAll(".mw__i"), {
      yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.07,
      scrollTrigger: { trigger: t, start: "top 88%", once: true }
    });
  });

  /* ---- Colecciones: cada línea fija el scroll y presenta sus prendas ---- */
  var threadEl = $("thread");
  document.querySelectorAll(".stage").forEach(function (el, ci) {
    var c = D.collections[ci], n = c.products.length, ctl = stageCtl[ci];
    var infos = el.querySelectorAll(".pinfo"), btns = el.querySelectorAll(".stage__go"), hint = el.querySelector(".stage__hint");
    var active = 0;
    function setActive(a) {
      if (a === active) return;
      active = a;
      infos.forEach(function (x, i) { x.classList.toggle("is-active", i === a); });
      btns.forEach(function (x, i) { x.classList.toggle("is-active", i === a); });
    }
    var st = ScrollTrigger.create({
      trigger: el, start: "top top", pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      end: function () { return "+=" + Math.round(window.innerHeight * n * 0.95); },
      onToggle: function (self) { if (c.theme === "dark") threadEl.classList.toggle("on-dark", self.isActive); },
      onUpdate: function (self) {
        var k = self.progress * n;
        if (ctl) ctl.setK(k);
        setActive(Math.max(0, Math.min(n - 1, Math.floor(k))));
        if (hint) hint.classList.toggle("is-gone", self.progress > 0.02);
      }
    });
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var y = st.start + ((+b.dataset.p + 0.5) / n) * (st.end - st.start);
        if (lenis) lenis.scrollTo(y, { duration: 1.5, easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); } });
        else window.scrollTo({ top: y });
      });
    });
  });

  /* ---- El estuche: se abre con el scroll ---- */
  (function () {
    var el = document.querySelector(".unbox"), steps = el.querySelectorAll(".ustep"), cur = 0;
    ScrollTrigger.create({
      trigger: el, start: "top top", pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      end: function () { return "+=" + Math.round(window.innerHeight * 3.2); },
      onToggle: function (self) { threadEl.classList.toggle("on-dark", self.isActive); },
      onUpdate: function (self) {
        if (boxCtl) boxCtl.setP(self.progress);
        var a = self.progress < 0.3 ? 0 : self.progress < 0.7 ? 1 : 2;
        if (a !== cur) { cur = a; steps.forEach(function (x, i) { x.classList.toggle("is-active", i === a); }); }
      }
    });
  })();

  /* ---- Atelier: la pieza se abre como un paño ---- */
  gsap.fromTo("#atelierFrame", { clipPath: "inset(16% 16% 16% 16%)" }, {
    clipPath: "inset(0% 0% 0% 0%)", ease: "none",
    scrollTrigger: { trigger: ".atelier__media", start: "top 90%", end: "top 25%", scrub: true }
  });
  gsap.fromTo("#atelierImg", { scale: 1.25 }, {
    scale: 1, ease: "none",
    scrollTrigger: { trigger: ".atelier__media", start: "top 90%", end: "bottom 30%", scrub: true }
  });

  /* ---- Tallas: el dibujo se traza y luego aparecen las cotas ---- */
  (function () {
    var body = document.querySelector(".dog__body");
    var parts = Array.prototype.slice.call(document.querySelectorAll(".dog__body, .dog__ear, .dog__tail"));
    var cotas = Array.prototype.slice.call(document.querySelectorAll(".cota"));
    parts.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    gsap.set(cotas, { opacity: 0 });
    gsap.set(".dog__eye", { opacity: 0 });
    var tl = gsap.timeline({ paused: true });
    tl.to(parts, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut", stagger: 0.15 })
      .to(".dog__eye", { opacity: 1, duration: 0.4 }, "-=0.6")
      .to(cotas, { opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.18 }, "-=0.2");
    ScrollTrigger.create({ trigger: ".sizing__lab", start: "top 70%", once: true, onEnter: function () { tl.play(); } });
  })();

  /* ---- Hilo: una costura que recorre la página ---- */
  var thread = $("thread"), threadFill = $("threadFill"), needle = $("threadNeedle");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      var y = self.progress * 100;
      threadFill.style.transform = "scaleY(" + self.progress + ")";
      needle.style.transform = "translateY(" + (y * window.innerHeight / 100) + "px)";
    }
  });
  ["#inicio", "#contacto", ".footer"].forEach(function (sel) {
    ScrollTrigger.create({
      trigger: sel, start: "top 30px", end: "bottom 30px",
      onToggle: function (self) { if (self.isActive) thread.classList.add("on-dark"); else thread.classList.remove("on-dark"); }
    });
  });

  /* =====================================================================
     Entrada: sello y luego el título del hero
     ===================================================================== */
  var loader = $("loader");
  var seen = false;
  try { seen = sessionStorage.getItem("mc-seen") === "1"; sessionStorage.setItem("mc-seen", "1"); } catch (e) {}

  gsap.set(heroChars, { yPercent: 115 });
  gsap.set([".hero__row", "#header"], { opacity: 0 });

  function heroIn() {
    document.body.classList.remove("is-loading");
    var tl = gsap.timeline();
    tl.to(heroChars, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.045 })
      .to(".hero__row", { opacity: 1, duration: 1.2, ease: "power2.out" }, "-=0.9")
      .to("#header", { opacity: 1, duration: 1, ease: "power2.out" }, "-=1");
  }

  if (seen) {
    loader.remove();
    heroIn();
  } else {
    var rings = loader.querySelectorAll(".loader__ring");
    gsap.set(rings[0], { strokeDasharray: 340, strokeDashoffset: 340 });
    gsap.set([rings[1], ".loader__mc"], { opacity: 0 });
    gsap.timeline({ onComplete: function () { loader.remove(); } })
      .to(rings[0], { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" })
      .to([rings[1], ".loader__mc"], { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.5")
      .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut", onStart: heroIn }, "+=0.25");
  }

  // recalcular posiciones cuando carguen las fuentes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
