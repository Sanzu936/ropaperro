/* Maison Canis · checkout simulado */
MC.ready(function () {
  var form = document.getElementById('checkout-form');
  var mainBox = document.getElementById('checkout-main');
  var emptyBox = document.getElementById('checkout-empty');

  if (!MC.cart.count()) {
    mainBox.hidden = true;
    emptyBox.hidden = false;
    return;
  }

  var country = document.getElementById('country');
  country.innerHTML = MC.COUNTRIES.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');

  var shipBox = document.getElementById('shipping-options');
  shipBox.setAttribute('role', 'radiogroup');
  shipBox.setAttribute('aria-label', 'Método de envío');
  shipBox.innerHTML = MC.SHIPPING.map(function (s, i) {
    return '<label class="radio-card"><input type="radio" name="shipping" value="' + s.id + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="rc-body"><strong>' + s.name + '</strong><small>' + s.note + '</small></span>' +
      '<span class="rc-price">' + (s.price ? MC.money(s.price) : 'Gratuito') + '</span></label>';
  }).join('');

  function shipping() {
    var v = form.querySelector('input[name="shipping"]:checked').value;
    return MC.SHIPPING.filter(function (s) { return s.id === v; })[0];
  }

  var payBtn = document.getElementById('pay-btn');
  function renderSummary() {
    var items = MC.cart.items();
    var sub = MC.cart.subtotal();
    var ship = shipping();
    var total = sub + ship.price;
    document.getElementById('sum-items').innerHTML = items.map(function (i) {
      var p = MC.product(i.id);
      return '<div class="summary-item"><span class="frame"><img src="images/' + p.images[0].file + '" width="' + p.images[0].w + '" height="' + p.images[0].h + '" alt=""></span>' +
        '<p><span class="name">' + p.name + '</span><span class="meta" style="display:block">Talla ' + i.size + ' · Cantidad ' + i.qty + '</span></p>' +
        '<span class="amt">' + MC.money(p.price * i.qty) + '</span></div>';
    }).join('');
    document.getElementById('sum-totals').innerHTML =
      '<div><dt>Subtotal</dt><dd>' + MC.money(sub) + '</dd></div>' +
      '<div><dt>' + ship.name + '</dt><dd>' + (ship.price ? MC.money(ship.price) : 'Gratuito') + '</dd></div>' +
      '<div class="total"><dt>Total</dt><dd>' + MC.money(total) + '</dd></div>' +
      '<div><dt style="font-size:13.5px">IVA incluido (21 %)</dt><dd style="font-size:13.5px;font-weight:300">' + MC.money2(total - total / (1 + MC.VAT)) + '</dd></div>';
    if (!payBtn.disabled) payBtn.textContent = 'Confirmar y pagar · ' + MC.money(total);
  }
  form.addEventListener('change', function (e) { if (e.target.name === 'shipping') renderSummary(); });
  renderSummary();

  /* Formato de campos de tarjeta */
  var num = document.getElementById('cardNumber');
  var exp = document.getElementById('cardExp');
  var cvc = document.getElementById('cardCvc');
  num.addEventListener('input', function () {
    var d = num.value.replace(/\D/g, '').slice(0, 19);
    num.value = d.replace(/(.{4})/g, '$1 ').trim();
  });
  exp.addEventListener('input', function (e) {
    var d = exp.value.replace(/\D/g, '').slice(0, 4);
    var adding = !e.inputType || e.inputType.indexOf('insert') === 0;
    exp.value = d.length > 2 || (d.length === 2 && adding) ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });
  cvc.addEventListener('input', function () { cvc.value = cvc.value.replace(/\D/g, '').slice(0, 4); });

  /* Validación */
  function val(id) { return document.getElementById(id).value.trim(); }
  var rules = {
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Introduzca un correo electrónico válido, por ejemplo nombre@dominio.com.'; },
    phone: function (v) { return v.replace(/\D/g, '').length >= 9 ? '' : 'Introduzca un teléfono de contacto válido, con al menos 9 dígitos.'; },
    firstName: function (v) { return v ? '' : 'Indique su nombre.'; },
    lastName: function (v) { return v ? '' : 'Indique sus apellidos.'; },
    address: function (v) { return v.length >= 5 ? '' : 'Indique la calle, el número y, si procede, el piso.'; },
    postal: function (v) { return /^[A-Za-z0-9 -]{4,10}$/.test(v) ? '' : 'Introduzca un código postal válido.'; },
    city: function (v) { return v ? '' : 'Indique la ciudad.'; },
    country: function (v) { return v ? '' : 'Elija el país de entrega.'; },
    cardName: function (v) { return v ? '' : 'Indique el nombre que figura en la tarjeta.'; },
    cardNumber: function (v) { var n = v.replace(/\D/g, '').length; return n >= 13 && n <= 19 ? '' : 'Introduzca el número de tarjeta, de 13 a 19 dígitos.'; },
    cardExp: function (v) {
      var m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
      if (!m) return 'Introduzca la caducidad con el formato MM/AA.';
      var end = new Date(2000 + parseInt(m[2], 10), parseInt(m[1], 10), 1);
      return end > new Date() ? '' : 'La tarjeta ha caducado.';
    },
    cardCvc: function (v) { return /^\d{3,4}$/.test(v) ? '' : 'Introduzca el código de seguridad, de 3 o 4 dígitos.'; }
  };
  var labels = {
    email: 'Correo electrónico', phone: 'Teléfono', firstName: 'Nombre', lastName: 'Apellidos', address: 'Dirección', postal: 'Código postal',
    city: 'Ciudad', country: 'País', cardName: 'Titular de la tarjeta', cardNumber: 'Número de tarjeta', cardExp: 'Caducidad', cardCvc: 'Código de seguridad'
  };

  function setError(id, msg) {
    var input = document.getElementById(id);
    var holder = input.closest('.field');
    var el = document.getElementById('err-' + id);
    if (msg) {
      if (!el) {
        el = document.createElement('p');
        el.className = 'field-error';
        el.id = 'err-' + id;
        holder.appendChild(el);
      }
      el.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', el.id);
    } else {
      if (el) el.remove();
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }

  Object.keys(rules).forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener('blur', function () { if (input.value !== '' || input.hasAttribute('aria-invalid')) setError(id, rules[id](val(id))); });
    input.addEventListener('input', function () { if (input.hasAttribute('aria-invalid') && !rules[id](val(id))) setError(id, ''); });
  });

  var terms = document.getElementById('terms');
  var termsErr = document.getElementById('terms-error');
  terms.addEventListener('change', function () { if (terms.checked) { termsErr.hidden = true; terms.removeAttribute('aria-invalid'); } });

  var summary = document.getElementById('error-summary');
  var list = document.getElementById('error-list');
  list.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    var t = document.getElementById(a.getAttribute('data-for'));
    if (t) { t.focus(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  });

  function businessDays(from, n) {
    var d = new Date(from.getTime());
    while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n--; }
    return d;
  }
  function fmtDay(d) { return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(d); }
  function estimate(ship, now) {
    var start = new Date(now.getTime());
    var weekend = start.getDay() === 0 || start.getDay() === 6;
    if (weekend || start.getHours() >= 14) start = businessDays(start, 1);
    var a = businessDays(start, ship.minDays), b = businessDays(start, ship.maxDays);
    return a.getTime() === b.getTime() ? 'Entrega prevista el ' + fmtDay(a) + '.' : 'Entrega prevista entre el ' + fmtDay(a) + ' y el ' + fmtDay(b) + '.';
  }

  var sending = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    var errors = [];
    Object.keys(rules).forEach(function (id) {
      var msg = rules[id](val(id));
      setError(id, msg);
      if (msg) errors.push({ id: id, msg: msg });
    });
    if (!terms.checked) {
      termsErr.hidden = false;
      terms.setAttribute('aria-invalid', 'true');
      errors.push({ id: 'terms', msg: 'Acepte las condiciones para confirmar el pedido.' });
    }
    if (errors.length) {
      list.innerHTML = errors.map(function (er) {
        return '<li><a href="#' + er.id + '" data-for="' + er.id + '">' + (labels[er.id] || 'Condiciones') + ':</a> ' + er.msg + '</li>';
      }).join('');
      summary.hidden = false;
      summary.focus();
      summary.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    summary.hidden = true;
    if (!MC.cart.count()) { location.reload(); return; }

    sending = true;
    payBtn.disabled = true;
    payBtn.textContent = 'Procesando el pago…';
    setTimeout(function () {
      var now = new Date();
      var ship = shipping();
      var items = MC.cart.items().map(function (i) {
        var p = MC.product(i.id);
        return { id: i.id, name: p.name, num: p.num, size: i.size, qty: i.qty, price: p.price, image: p.images[0].file };
      });
      var sub = MC.cart.subtotal();
      var total = sub + ship.price;
      var yy = String(now.getFullYear()).slice(2);
      var mm = ('0' + (now.getMonth() + 1)).slice(-2);
      var dd = ('0' + now.getDate()).slice(-2);
      var order = {
        number: 'MC-' + yy + mm + dd + '-' + String(Math.floor(1000 + Math.random() * 9000)),
        date: now.toISOString(),
        items: items,
        shipping: { name: ship.name, price: ship.price },
        subtotal: sub,
        total: total,
        delivery: estimate(ship, now),
        customer: {
          firstName: val('firstName'), lastName: val('lastName'), email: val('email'), phone: val('phone'),
          address: val('address'), postal: val('postal'), city: val('city'), country: val('country')
        }
      };
      MC.cart.saveOrder(order);
      MC.cart.clear();
      location.href = 'confirmacion.html';
    }, 1400);
  });
});
