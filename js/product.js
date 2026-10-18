/* Maison Canis · página de producto */
MC.ready(function () {
  var main = document.getElementById('main');
  var p = MC.product(main.getAttribute('data-product'));
  if (!p) return;

  var params = new URLSearchParams(location.search);
  var preset = (params.get('talla') || '').toUpperCase();
  if (!MC.size(preset)) preset = '';

  var gallery = p.images.map(function (im, i) {
    var ratio = i === 0 ? 'ratio-4-5' : (i === 3 ? 'ratio-3-2' : 'ratio-1-1');
    return '<div class="frame ' + ratio + '"><img src="images/' + im.file + '" width="' + im.w + '" height="' + im.h + '" alt="' + MC.esc(im.alt) + '"' +
      (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></div>';
  }).join('');

  var sizes = MC.SIZES.map(function (s) {
    return '<label class="size"><input type="radio" name="size" value="' + s.id + '"' + (s.id === preset ? ' checked' : '') + '><span>' + s.id + '</span></label>';
  }).join('');

  function acc(title, body, open) {
    return '<details' + (open ? ' open' : '') + '><summary>' + title + '</summary><div class="acc-body">' + body + '</div></details>';
  }

  var others = MC.PRODUCTS.filter(function (o) { return o.id !== p.id; });

  main.innerHTML = '' +
    '<div class="container">' +
      '<nav class="breadcrumb" aria-label="Ruta de navegación"><ol>' +
        '<li><a href="index.html">Inicio</a></li>' +
        '<li><a href="index.html#coleccion">Colección</a></li>' +
        '<li><span aria-current="page">' + p.name + '</span></li>' +
      '</ol></nav>' +
      '<div class="product">' +
        '<div class="gallery" role="group" aria-label="Fotografías de ' + p.name + '">' + gallery + '</div>' +
        '<div class="buy">' +
          '<p class="eyebrow">' + p.num + ' · ' + p.type + '</p>' +
          '<h1>' + p.name + '</h1>' +
          '<p class="lead">' + p.lead + '</p>' +
          '<div class="price-row"><span class="price">' + MC.money(p.price) + '</span><span class="price-note">IVA incluido · Color ' + p.color + '</span></div>' +
          '<form id="buy-form" novalidate>' +
            '<fieldset class="field-group" aria-describedby="size-hint size-error">' +
              '<legend>Talla</legend>' +
              '<div class="sizes">' + sizes + '</div>' +
              '<div class="hint-row"><p class="size-hint" id="size-hint">Elija la talla según el contorno de pecho de su perro.</p><a class="text-link size-link" href="guia-de-tallas.html">Guía de tallas</a></div>' +
              '<p class="field-error" id="size-error" role="alert" hidden>Elija una talla para añadir la prenda al carrito.</p>' +
            '</fieldset>' +
            '<div class="buy-actions">' +
              '<div class="qty" role="group" aria-label="Cantidad">' +
                '<button type="button" id="qty-minus" aria-label="Reducir cantidad">−</button>' +
                '<output id="qty-out" aria-live="polite">1</output>' +
                '<button type="button" id="qty-plus" aria-label="Aumentar cantidad">+</button>' +
              '</div>' +
              '<button class="btn" type="submit" id="add-btn">Añadir al carrito</button>' +
            '</div>' +
          '</form>' +
          '<ul class="reassure">' +
            '<li>Envío asegurado y gratuito</li>' +
            '<li>Cambio de talla sin coste durante 30 días</li>' +
            '<li>Reparación de por vida</li>' +
          '</ul>' +
          '<div class="accordion">' +
            acc('Descripción', p.description.map(function (t) { return '<p>' + t + '</p>'; }).join(''), true) +
            acc('Detalles', '<ul>' + p.details.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>') +
            acc('Materiales y origen', '<p>' + p.materials + '</p>') +
            acc('Cuidado', '<p>' + p.care + '</p>') +
            acc('Envíos y cambios', '<p>Envío asegurado y gratuito en 3 a 4 días laborables, o en 24 horas por 18 €. Cambio de talla sin coste durante 30 días.</p><p><a href="envios-y-cuidados.html">Consultar las condiciones completas</a></p>') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<section class="section bg-stone" aria-labelledby="otras">' +
      '<div class="container">' +
        '<div class="section-head"><div><p class="eyebrow">La colección</p><h2 id="otras" style="margin-top:20px">Las otras dos prendas.</h2></div>' +
        '<p>Pensadas para combinarse: el jersey bajo la gabardina, la gabardina sobre el jersey.</p></div>' +
        '<div class="cards two">' + others.map(MC.card).join('') + '</div>' +
      '</div>' +
    '</section>';

  var form = document.getElementById('buy-form');
  var hint = document.getElementById('size-hint');
  var err = document.getElementById('size-error');
  var out = document.getElementById('qty-out');
  var minus = document.getElementById('qty-minus');
  var plus = document.getElementById('qty-plus');
  var btn = document.getElementById('add-btn');
  var qty = 1;
  var resetTimer = null;

  function chosen() {
    var r = form.querySelector('input[name="size"]:checked');
    return r ? r.value : '';
  }
  function showHint() {
    var s = MC.size(chosen());
    if (s) {
      hint.textContent = 'Talla ' + s.id + ' · ' + MC.sizeRange(s);
      err.hidden = true;
    }
  }
  function renderQty() {
    out.textContent = qty;
    minus.disabled = qty <= 1;
    plus.disabled = qty >= MC.MAX_QTY;
  }

  form.addEventListener('change', showHint);
  minus.addEventListener('click', function () { if (qty > 1) { qty--; renderQty(); } });
  plus.addEventListener('click', function () { if (qty < MC.MAX_QTY) { qty++; renderQty(); } });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var size = chosen();
    if (!size) {
      err.hidden = false;
      form.querySelector('input[name="size"]').focus();
      return;
    }
    var prev = MC.cart.items().filter(function (i) { return i.id === p.id && i.size === size; })[0];
    var before = prev ? prev.qty : 0;
    MC.cart.add(p.id, size, qty);
    var added = Math.min(qty, MC.MAX_QTY - before);
    var msg = added <= 0
      ? 'Ya tiene ' + MC.MAX_QTY + ' unidades en talla ' + size + ', el máximo por línea. Para más, escríbanos.'
      : 'Talla ' + size + ', ' + added + (added === 1 ? ' unidad añadida' : ' unidades añadidas') + ' al carrito' + (added < qty ? ' (máximo de ' + MC.MAX_QTY + ' por línea).' : '.');
    MC.toast(
      '<span class="t-name">' + p.name + '</span>' +
      '<p>' + msg + '</p>' +
      '<div class="t-actions"><a class="text-link" href="carrito.html">Ver el carrito</a><a class="text-link" href="checkout.html">Finalizar el pedido</a></div>'
    );
    btn.textContent = 'Añadida al carrito';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () { btn.textContent = 'Añadir al carrito'; }, 2400);
  });

  showHint();
  renderQty();
});
