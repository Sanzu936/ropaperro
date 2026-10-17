(function () {
  var D = window.MAISON;
  var $ = function (id) { return document.getElementById(id); };

  /* Escapa texto del archivo de datos antes de insertarlo como HTML */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function price(n) {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }

  /* Aplica imagen real a un placeholder si hay ruta */
  function setImage(el, src, alt) {
    if (!src) return;
    el.style.backgroundImage = "url('" + src.replace(/'/g, "%27") + "')";
    el.classList.add("ph--img");
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", alt || "");
  }

  /* ---- Hero ---- */
  $("heroTagline").textContent = D.heroTaglines[D.heroIndex] || D.heroTaglines[0];
  setImage($("heroBg"), D.heroImage, "Maison Canis");

  /* ---- Colecciones ---- */
  $("collections").innerHTML = D.collections.map(function (c, i) {
    var items = c.products.map(function (p) {
      return '<article class="product">' +
        '<div class="product__img ph" data-tone="' + esc(p.tone || "arena") + '" data-img="' + esc(p.img || "") + '" data-alt="' + esc(p.name) + '"></div>' +
        '<h4 class="product__name">' + esc(p.name) + '</h4>' +
        '<p class="product__mat">' + esc(p.material) + '</p>' +
        '<p class="product__price">' + price(p.price) + '</p>' +
      '</article>';
    }).join("");
    return '<div class="collection reveal' + (i % 2 ? ' collection--alt' : '') + '" id="' + esc(c.id) + '">' +
      '<div class="collection__intro">' +
        '<p class="eyebrow">' + esc(c.label) + ' · ' + esc(c.season) + '</p>' +
        '<h3 class="subtitle">' + esc(c.title) + '</h3>' +
        '<p class="lead">' + esc(c.text) + '</p>' +
      '</div>' +
      '<div class="collection__grid">' + items + '</div>' +
    '</div>';
  }).join("");

  document.querySelectorAll(".product__img").forEach(function (el) {
    setImage(el, el.dataset.img, el.dataset.alt);
  });

  /* ---- Atelier ---- */
  var A = D.atelier;
  $("atelierLabel").textContent = A.label;
  $("atelierTitle").textContent = A.title;
  $("atelierText").textContent = A.text;
  setImage($("atelierImg"), A.image, A.title);
  $("atelierPillars").innerHTML = A.pillars.map(function (p) {
    return "<li><h4>" + esc(p.title) + "</h4><p>" + esc(p.text) + "</p></li>";
  }).join("");

  /* ---- Hecho a medida ---- */
  var B = D.bespoke;
  $("bespokeLabel").textContent = B.label;
  $("bespokeTitle").textContent = B.title;
  $("bespokeText").textContent = B.text;
  $("bespokeSteps").innerHTML = B.steps.map(function (s, i) {
    return '<li class="step reveal"><span class="step__num">0' + (i + 1) + '</span>' +
      "<h4>" + esc(s.title) + "</h4><p>" + esc(s.text) + "</p></li>";
  }).join("");

  /* ---- Contacto ---- */
  var C = D.contact;
  $("contactLabel").textContent = C.label;
  $("contactTitle").textContent = C.title;
  $("contactText").textContent = C.text;

  var form = $("waitlistForm");
  var err = $("formError");
  var ok = $("formSuccess");
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // maqueta: no se envía nada
    var valid = form.checkValidity();
    err.hidden = valid;
    if (!valid) {
      err.textContent = "Por favor, complete todos los campos con un correo válido.";
      return;
    }
    ok.textContent = C.success;
    ok.hidden = false;
    form.reset();
  });

  /* ---- Footer ---- */
  $("social").innerHTML = D.social.map(function (s) {
    return '<li><a href="' + esc(s.url) + '" aria-label="' + esc(s.name) + '">' + esc(s.name) + "</a></li>";
  }).join("");
  $("year").textContent = new Date().getFullYear();

  /* ---- Menú móvil ---- */
  var toggle = $("menuToggle");
  var nav = $("nav");
  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("no-scroll", open);
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeMenu(); });

  /* ---- Cabecera al hacer scroll ---- */
  var header = $("header");
  function onScroll() { header.classList.toggle("is-solid", window.scrollY > 60); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Fade-in suave ---- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
