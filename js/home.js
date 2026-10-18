/* Maison Canis · portada: escenas de colección */
MC.ready(function () {
  var box = document.getElementById('scenes');
  if (!box) return;
  box.innerHTML = MC.PRODUCTS.map(function (p, i) {
    var a = p.images[0], b = p.images[1];
    var n = String(i + 1);
    return '' +
      '<article class="scene' + (i % 2 ? ' scene-flip' : '') + '" data-tint="' + p.id + '" aria-labelledby="scene-' + p.id + '">' +
        '<div class="container scene-grid">' +
          '<a class="scene-media reveal" href="' + p.page + '" data-cursor="Descubrir" tabindex="-1">' +
            '<span class="frame ratio-4-5" data-parallax>' +
              '<img class="card-img" src="images/' + a.file + '" alt="' + MC.esc(a.alt) + '" width="' + a.w + '" height="' + a.h + '" loading="lazy" decoding="async">' +
              '<img class="card-img card-img-alt" src="images/' + b.file + '" alt="" width="' + b.w + '" height="' + b.h + '" loading="lazy" decoding="async">' +
            '</span>' +
          '</a>' +
          '<div class="scene-body">' +
            '<span class="scene-num" aria-hidden="true">' + n + '</span>' +
            '<p class="eyebrow reveal">' + p.num + ' · ' + p.type + '</p>' +
            '<h3 class="scene-title reveal" id="scene-' + p.id + '"><a href="' + p.page + '">' + p.name + '</a></h3>' +
            '<p class="scene-line reveal">' + p.lead + '</p>' +
            '<span class="stitch reveal" aria-hidden="true"><i></i><b></b></span>' +
            '<dl class="scene-facts reveal">' +
              '<div><dt>Tono</dt><dd>' + p.color + '</dd></div>' +
              '<div><dt>Tallas</dt><dd>XS–XL</dd></div>' +
              '<div><dt>Precio</dt><dd>' + MC.money(p.price) + '</dd></div>' +
            '</dl>' +
            '<a class="text-link reveal" href="' + p.page + '">Descubrir ' + p.name + '</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }).join('');
});
