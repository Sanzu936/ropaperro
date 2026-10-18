/* Maison Canis · confirmación del pedido */
MC.ready(function () {
  var root = document.getElementById('confirm-root');
  var o = MC.cart.lastOrder();

  if (!o || !o.items || !o.customer) {
    root.innerHTML =
      '<div class="empty"><h1 style="font-size:clamp(40px,5vw,72px);margin-bottom:20px">No hay ningún pedido reciente.</h1>' +
      '<p>Cuando complete una compra, aquí encontrará el resumen y la fecha de entrega prevista.</p>' +
      '<div class="actions"><a class="btn" href="index.html#coleccion">Ver la colección</a></div></div>';
    return;
  }

  var c = o.customer;
  var lines = o.items.map(function (i) {
    return '<div class="summary-item"><span class="frame"><img src="images/' + MC.esc(i.image) + '" width="1600" height="2000" alt=""></span>' +
      '<p><span class="name">' + MC.esc(i.name) + '</span><span class="meta" style="display:block">Talla ' + MC.esc(i.size) + ' · Cantidad ' + i.qty + '</span></p>' +
      '<span class="amt">' + MC.money(i.price * i.qty) + '</span></div>';
  }).join('');

  document.title = 'Pedido ' + o.number + ' confirmado · Maison Canis';
  root.innerHTML = '' +
    '<section class="confirm-head" aria-labelledby="gracias">' +
      '<p class="eyebrow">Pedido confirmado</p>' +
      '<h1 id="gracias">Gracias, <em>' + MC.esc(c.firstName) + '.</em></h1>' +
      '<p>Hemos recibido su pedido y lo estamos preparando. Recibirá la confirmación en ' + MC.esc(c.email) + '.</p>' +
      '<p class="order-no">Pedido ' + MC.esc(o.number) + '</p>' +
    '</section>' +
    '<div class="confirm-grid">' +
      '<section aria-labelledby="c-prendas"><h2 id="c-prendas">Su pedido</h2>' +
        '<div class="summary-items" style="border-bottom:0;margin-bottom:8px">' + lines + '</div>' +
        '<dl class="summary" style="padding:0;border:0;background:none;position:static">' +
          '<div style="display:flex;justify-content:space-between;padding:8px 0"><dt style="color:var(--muted)">Subtotal</dt><dd style="margin:0">' + MC.money(o.subtotal) + '</dd></div>' +
          '<div style="display:flex;justify-content:space-between;padding:8px 0"><dt style="color:var(--muted)">' + MC.esc(o.shipping.name) + '</dt><dd style="margin:0">' + (o.shipping.price ? MC.money(o.shipping.price) : 'Gratuito') + '</dd></div>' +
          '<div class="total" style="display:flex;justify-content:space-between;align-items:baseline;margin-top:8px;padding-top:18px;border-top:1px solid var(--ink)"><dt style="font-size:12.5px;letter-spacing:.2em;text-transform:uppercase">Total pagado</dt><dd style="margin:0;font-family:var(--serif);font-size:34px;line-height:1">' + MC.money(o.total) + '</dd></div>' +
        '</dl>' +
      '</section>' +
      '<section aria-labelledby="c-entrega"><h2 id="c-entrega">Entrega</h2>' +
        '<address><strong>' + MC.esc(c.firstName) + ' ' + MC.esc(c.lastName) + '</strong><br>' + MC.esc(c.address) + '<br>' + MC.esc(c.postal) + ' ' + MC.esc(c.city) + '<br>' + MC.esc(c.country) + '<br>' + MC.esc(c.phone) + '</address>' +
        '<p style="margin-top:20px;color:var(--muted)">' + MC.esc(o.delivery) + '</p>' +
        '<p style="margin-top:20px;color:var(--muted)">¿Necesita cambiar algo? Escríbanos a <a style="text-decoration:underline;text-underline-offset:4px;color:var(--ink)" href="mailto:atelier@maisoncanis.com?subject=Pedido%20' + encodeURIComponent(o.number) + '">atelier@maisoncanis.com</a> indicando el número de pedido.</p>' +
      '</section>' +
    '</div>' +
    '<div class="confirm-actions"><a class="btn" href="index.html#coleccion">Seguir descubriendo</a><a class="btn btn-line" href="envios-y-cuidados.html#cuidado">Cuidado de las prendas</a></div>';
  document.getElementById('gracias').setAttribute('tabindex', '-1');
});
