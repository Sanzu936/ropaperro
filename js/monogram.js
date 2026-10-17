/* Monograma de la casa: «MC» en un anillo de puntadas, con huella de pata y cruces de punto.
   Se dibuja por código y se usa como tejido jacquard: en el tejido 3D del hero (máscara)
   y como fondo tono sobre tono en las secciones oscuras (variables CSS --mono-dark / --mono-light). */
(function () {
  var FONT = '"Marcellus", "Cinzel", Georgia, serif';

  function paw(ctx, cx, cy, s) {
    ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.25, s * 0.55, s * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    [[-0.62, -0.38, -0.3], [-0.22, -0.78, -0.1], [0.22, -0.78, 0.1], [0.62, -0.38, 0.3]].forEach(function (t) {
      ctx.beginPath(); ctx.ellipse(cx + t[0] * s, cy + t[1] * s, s * 0.2, s * 0.28, t[2], 0, Math.PI * 2); ctx.fill();
    });
  }
  function cross(ctx, cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s);
    ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s);
    ctx.stroke();
  }
  function seal(ctx, cx, cy, r, size) {
    ctx.lineWidth = Math.max(1, size * 0.006);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.setLineDash([size * 0.012, size * 0.016]);
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.84, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    ctx.font = Math.round(r * 0.95) + "px " + FONT;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("MC", cx, cy + r * 0.06);
  }

  /* Un tile cuadrado que repite sin costuras: dos monogramas en diagonal, huellas y cruces */
  function draw(canvas, fg, bg) {
    var size = canvas.width, ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size); }
    ctx.fillStyle = fg; ctx.strokeStyle = fg;
    seal(ctx, size * 0.25, size * 0.25, size * 0.16, size);
    seal(ctx, size * 0.75, size * 0.75, size * 0.16, size);
    paw(ctx, size * 0.75, size * 0.25, size * 0.045);
    paw(ctx, size * 0.25, size * 0.75, size * 0.045);
    ctx.lineWidth = Math.max(1, size * 0.006);
    [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5]].forEach(function (c) { cross(ctx, size * c[0], size * c[1], size * 0.022); });
  }

  function make(size, fg, bg) {
    var c = document.createElement("canvas"); c.width = c.height = size;
    draw(c, fg, bg);
    return c;
  }

  var maskCanvas = make(256, "#fff", "#000");
  var cssDark = make(256, "rgba(245,240,232,.05)");
  var cssLight = make(256, "rgba(107,74,47,.09)");
  var cssStrong = make(256, "rgba(245,240,232,.22)");

  function setCss() {
    var r = document.documentElement.style;
    r.setProperty("--mono-dark", "url(" + cssDark.toDataURL() + ")");
    r.setProperty("--mono-light", "url(" + cssLight.toDataURL() + ")");
    r.setProperty("--mono-strong", "url(" + cssStrong.toDataURL() + ")");
  }
  setCss();

  window.MC = {
    maskCanvas: maskCanvas,
    redraw: function () {
      draw(maskCanvas, "#fff", "#000"); draw(cssDark, "rgba(245,240,232,.05)"); draw(cssLight, "rgba(107,74,47,.09)"); draw(cssStrong, "rgba(245,240,232,.22)");
      setCss();
      window.dispatchEvent(new Event("mc-ready"));
    }
  };

  // al cargar la tipografía real, se vuelve a dibujar con Marcellus
  if (document.fonts && document.fonts.load) {
    document.fonts.load("40px Marcellus").then(function () { window.MC.redraw(); }, function () {});
  }
})();
