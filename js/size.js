/* Maison Canis · guía de tallas: tabla y calculadora */
MC.ready(function () {
  var tbody = document.querySelector('#size-table tbody');
  tbody.innerHTML = MC.SIZES.map(function (s) {
    return '<tr data-size="' + s.id + '"><td>' + s.id + '</td><td>' + s.chest[0] + '–' + s.chest[1] + ' cm</td><td>' + s.back[0] + '–' + s.back[1] + ' cm</td><td>' + s.breeds + '</td></tr>';
  }).join('');

  var form = document.getElementById('calc-form');
  var result = document.getElementById('calc-result');
  var chestEl = document.getElementById('chest');
  var backEl = document.getElementById('back');

  function parse(v) {
    var n = parseFloat(String(v).trim().replace(',', '.'));
    return isFinite(n) ? n : NaN;
  }
  function indexFor(value, key) {
    var last = MC.SIZES.length - 1;
    if (value < MC.SIZES[0][key][0] || value >= MC.SIZES[last][key][1] + 1) return -1;
    for (var i = last; i >= 0; i--) if (value >= MC.SIZES[i][key][0]) return i;
    return -1;
  }
  function fail(msg, field) {
    result.className = 'result is-error';
    result.textContent = msg;
    chestEl.removeAttribute('aria-invalid');
    backEl.removeAttribute('aria-invalid');
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    Array.prototype.forEach.call(document.querySelectorAll('#size-table tr.is-match'), function (r) { r.classList.remove('is-match'); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var chest = parse(chestEl.value);
    var back = parse(backEl.value);
    if (isNaN(chest) || chest <= 0) return fail('Indique el contorno de pecho en centímetros.', chestEl);
    if (isNaN(back) || back <= 0) return fail('Indique el largo de lomo en centímetros.', backEl);
    var ci = indexFor(chest, 'chest');
    if (ci < 0) return fail('Un contorno de pecho de ' + chest + ' cm queda fuera de nuestra gama, que va de 30 a 82 cm. Escríbanos a atelier@maisoncanis.com y estudiaremos una prenda a medida.', chestEl);
    var bi = indexFor(back, 'back');
    var s = MC.SIZES[ci];
    var note = '';
    if (bi < 0) {
      note = 'El largo de lomo indicado queda fuera de la tabla. Elegimos por el contorno de pecho; si tiene dudas, escríbanos antes de pedir.';
    } else if (bi > ci) {
      note = 'Su perro tiene el lomo largo para su pecho: por largo le correspondería la talla ' + MC.SIZES[bi].id + '. Recomendamos ' + s.id + ' porque el pecho es lo que decide el ajuste; la prenda cubrirá algo menos de lomo.';
    } else if (bi < ci) {
      note = 'Su perro tiene el lomo corto para su pecho: por largo le correspondería la talla ' + MC.SIZES[bi].id + '. Recomendamos ' + s.id + ' porque el pecho es lo que decide el ajuste; la prenda quedará algo más larga en el lomo.';
    } else {
      note = 'Las dos medidas coinciden con esta talla.';
    }
    result.className = 'result';
    chestEl.removeAttribute('aria-invalid');
    backEl.removeAttribute('aria-invalid');
    result.innerHTML =
      '<span class="eyebrow">Talla recomendada</span>' +
      '<div class="big">' + s.id + '</div>' +
      '<p>Para un contorno de pecho de ' + chest + ' cm y un largo de lomo de ' + back + ' cm. ' + note + '</p>' +
      '<div class="links">' + MC.PRODUCTS.map(function (p) {
        return '<a class="text-link" href="' + p.page + '?talla=' + s.id + '">' + p.name + ' en talla ' + s.id + '</a>';
      }).join('') + '</div>';
    Array.prototype.forEach.call(document.querySelectorAll('#size-table tr'), function (r) {
      r.classList.toggle('is-match', r.getAttribute('data-size') === s.id);
    });
  });
});
