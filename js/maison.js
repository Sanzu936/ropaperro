/* Maison Canis · La Maison: tarjetas de la colección */
MC.ready(function () {
  var box = document.getElementById('cards');
  if (box) box.innerHTML = MC.PRODUCTS.map(MC.card).join('');
});
