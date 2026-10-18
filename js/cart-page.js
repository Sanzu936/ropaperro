/* Maison Canis · página del carrito */
MC.ready(function () {
  var root = document.getElementById('cart-root');
  var removed = [];
  var info = '';
  var focusKey = null;

  function key(i) { return i.id + '|' + i.size; }

  function line(i) {
    var p = MC.product(i.id);
    var im = p.images[0];
    var k = key(i);
    var opts = MC.SIZES.map(function (s) {
      return '<option value="' + s.id + '"' + (s.id === i.size ? ' selected' : '') + '>' + s.id + '</option>';
    }).join('');
    return '' +
      '<li class="line" data-key="' + k + '">' +
        '<a class="frame line-media" href="' + p.page + '" tabindex="-1" aria-hidden="true"><img src="images/' + im.file + '" width="' + im.w + '" height="' + im.h + '" alt="" loading="lazy"></a>' +
        '<div class="line-info">' +
          '<p class="eyebrow">' + p.num + '</p>' +
          '<h2><a href="' + p.page + '">' + p.name + '</a></h2>' +
          '<p class="meta">Color ' + p.color + ' · ' + MC.money(p.price) + ' la unidad</p>' +
          '<div class="line-controls">' +
            '<div><label class="field-label" for="size-' + k.replace('|', '-') + '">Talla</label>' +
              '<select class="input" id="size-' + k.replace('|', '-') + '" data-action="size" aria-label="Talla de ' + p.name + '">' + opts + '</select></div>' +
            '<div><span class="field-label" id="q-' + k.replace('|', '-') + '">Cantidad</span>' +
              '<div class="qty" role="group" aria-labelledby="q-' + k.replace('|', '-') + '">' +
                '<button type="button" data-action="minus" aria-label="Reducir la cantidad de ' + p.name + '"' + (i.qty <= 1 ? ' disabled' : '') + '>−</button>' +
                '<output aria-live="polite">' + i.qty + '</output>' +
                '<button type="button" data-action="plus" aria-label="Aumentar la cantidad de ' + p.name + '"' + (i.qty >= MC.MAX_QTY ? ' disabled' : '') + '>+</button>' +
              '</div></div>' +
          '</div>' +
          '<button class="btn-text line-remove" type="button" data-action="remove" aria-label="Retirar ' + p.name + ', talla ' + i.size + ', del carrito">Retirar</button>' +
        '</div>' +
        '<p class="line-total">' + MC.money(p.price * i.qty) + (i.qty > 1 ? '<small>' + i.qty + ' × ' + MC.money(p.price) + '</small>' : '') + '</p>' +
      '</li>';
  }

  function empty() {
    return '' +
      '<div class="empty">' +
        '<h2>Su carrito está vacío.</h2>' +
        '<p>Aún no ha elegido ninguna prenda. La colección reúne tres: una gabardina, un jersey y un abrigo.</p>' +
        '<div class="actions"><a class="btn" href="index.html#coleccion">Ver la colección</a><a class="btn btn-line" href="guia-de-tallas.html">Consultar la guía de tallas</a></div>' +
      '</div>';
  }

  function render() {
    var items = MC.cart.items();
    var last = removed[removed.length - 1];
    var notice = last
      ? '<div class="notice" id="undo-notice"><span><strong style="font-weight:400">' + MC.product(last.id).name + '</strong>, talla ' + last.size + ', se ha retirado del carrito.</span><button class="btn-text" type="button" data-action="undo">Deshacer</button></div>'
      : '';
    if (info) notice += '<div class="notice"><span>' + info + '</span></div>';
    info = '';
    if (!items.length) {
      root.innerHTML = '<div role="status">' + notice + '</div>' + empty();
      var u = document.querySelector('[data-action="undo"]');
      if (focusKey === 'undo' && u) u.focus();
      focusKey = null;
      return;
    }
    var sub = MC.cart.subtotal();
    var count = MC.cart.count();
    root.innerHTML = '' +
      '<div class="cart-layout">' +
        '<div>' + (notice ? '<div role="status">' + notice + '</div>' : '') +
          '<ul class="lines">' + items.map(line).join('') + '</ul>' +
        '</div>' +
        '<aside class="summary" aria-labelledby="sum-title">' +
          '<h2 id="sum-title">Resumen</h2>' +
          '<dl>' +
            '<div><dt>' + count + (count === 1 ? ' prenda' : ' prendas') + '</dt><dd>' + MC.money(sub) + '</dd></div>' +
            '<div><dt>Envío asegurado</dt><dd>Gratuito</dd></div>' +
            '<div class="total"><dt>Total</dt><dd>' + MC.money(sub) + '</dd></div>' +
          '</dl>' +
          '<a class="btn btn-block" href="checkout.html">Continuar con el pedido</a>' +
          '<p class="fine">IVA incluido. Podrá elegir la entrega en 24 horas en el siguiente paso.</p>' +
          '<a class="text-link" href="index.html#coleccion">Seguir descubriendo</a>' +
        '</aside>' +
      '</div>';
    if (focusKey) {
      var el;
      if (focusKey === 'undo') el = document.querySelector('[data-action="undo"]');
      else {
        var parts = focusKey.split('~');
        var row = document.querySelector('.line[data-key="' + parts[0] + '"]');
        el = row && row.querySelector('[data-action="' + parts[1] + '"]');
        if (el && el.disabled) el = row.querySelector('[data-action="' + (parts[1] === 'plus' ? 'minus' : 'plus') + '"]');
      }
      if (el) el.focus();
      focusKey = null;
    }
  }

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'undo') {
      MC.cart.restore(removed.pop());
      render();
      return;
    }
    var row = btn.closest('.line');
    if (!row) return;
    var parts = row.getAttribute('data-key').split('|');
    var id = parts[0], size = parts[1];
    var item = MC.cart.items().filter(function (i) { return i.id === id && i.size === size; })[0];
    if (!item) return;
    if (action === 'plus') { focusKey = row.getAttribute('data-key') + '~plus'; MC.cart.setQty(id, size, item.qty + 1); }
    if (action === 'minus') { focusKey = row.getAttribute('data-key') + '~minus'; MC.cart.setQty(id, size, item.qty - 1); }
    if (action === 'remove') {
      removed.push({ id: id, size: size, qty: item.qty });
      focusKey = 'undo';
      MC.cart.remove(id, size);
    }
    render();
  });

  root.addEventListener('change', function (e) {
    var sel = e.target.closest('[data-action="size"]');
    if (!sel) return;
    var row = sel.closest('.line');
    var parts = row.getAttribute('data-key').split('|');
    var before = MC.cart.items();
    var target = before.filter(function (i) { return i.id === parts[0] && i.size === sel.value; })[0];
    var from = before.filter(function (i) { return i.id === parts[0] && i.size === parts[1]; })[0];
    MC.cart.setSize(parts[0], parts[1], sel.value);
    if (target && from) {
      var sum = target.qty + from.qty;
      info = 'Ya tenía esta prenda en talla ' + sel.value + ': hemos unido las dos líneas' + (sum > MC.MAX_QTY ? ' y limitado la cantidad a ' + MC.MAX_QTY + ' unidades, el máximo por línea.' : '.');
    }
    focusKey = parts[0] + '|' + sel.value + '~size';
    render();
  });

  window.addEventListener('storage', function () { removed = []; render(); });

  render();
});
