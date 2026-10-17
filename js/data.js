/* ==========================================================================
   MAISON CANIS — Contenido editable
   Cambia aquí textos, precios, tallas e imágenes. No hace falta tocar el HTML.

   PRENDAS 3D: cada prenda se dibuja por código sobre un maniquí con los
   parámetros de `model` (fabric: wool | gabardine | knit | quilt | velvet |
   silk; color; t0/t1 = dónde empieza y acaba (0 cola, 1 cuello); collar,
   belt, flare, puff, cape, bow). Cuando haya fotos reales se sustituyen.
   ATELIER: `img` en la sección atelier admite ruta o URL de imagen.
   ========================================================================== */

window.MAISON = {

  /* ---- Hero ---------------------------------------------------------------
     0 · "El abrigo, a la medida de quien camina a tu lado."
     1 · "Alta artesanía para el compañero más fiel."
     2 · "Lana noble. Manos pacientes. Series de pocas piezas."              */
  heroTaglines: [
    "El abrigo, a la medida de quien camina a tu lado.",
    "Alta artesanía para el compañero más fiel.",
    "Lana noble. Manos pacientes. Series de pocas piezas."
  ],
  heroIndex: 1,
  heroSeason: "Colección otoño–invierno 26",

  /* ---- Manifiesto (se ilumina palabra a palabra al hacer scroll) -------- */
  manifesto: "Cada prenda se cose a mano en una serie de treinta piezas. Cuando la serie se agota, no se vuelve a hacer.",

  /* ---- Colecciones ------------------------------------------------------ */
  edition: 30, // piezas por serie
  collections: [
    {
      id: "urbana",
      theme: "light", form: "#cbbba0",
      label: "Línea Urbana",
      season: "Paseo",
      text: "Abrigos de lana merino y gabardinas impermeables para el día a día en la ciudad.",
      products: [
        { name: "Abrigo Montmartre", material: "Lana merino doble faz", price: 390, number: 7,  model: { fabric: "wool", color: "#7a5638", t0: 0.17, t1: 0.88, collar: 0.12, flare: 0.06, wr: 0.014, buttons: 5 } },
        { name: "Gabardina Passy",   material: "Algodón encerado, forro de seda", price: 320, number: 12, model: { fabric: "gabardine", color: "#c8b08a", t0: 0.16, t1: 0.86, collar: 0.09, belt: true, flare: 0.05, buttons: 4, btnColor: 0x8a6a3c } },
        { name: "Capa Tuileries",    material: "Lana virgen cardada", price: 260, number: 21, model: { fabric: "wool", color: "#8e867a", t0: 0.2, t1: 0.9, cape: true, flare: 0.28, collar: 0.07 } }
      ]
    },
    {
      id: "alpina",
      theme: "stone", form: "#cbbba0",
      label: "Línea Alpina",
      season: "Invierno",
      text: "Plumíferos y jerséis de punto para el frío y la montaña. Calor sin peso.",
      products: [
        { name: "Plumífero Zermatt", material: "Plumón de oca, tejido técnico mate", price: 450, number: 3,  model: { fabric: "quilt", color: "#2d2a26", t0: 0.13, t1: 0.9, puff: 0.085, puffN: 12, puffM: 7, collar: 0.16 } },
        { name: "Jersey Engadina",   material: "Punto de cachemira", price: 360, number: 15, model: { fabric: "knit", color: "#e3d6bf", t0: 0.18, t1: 0.9, collar: 0.15, thick: 0.02 } },
        { name: "Jersey Verbier",    material: "Cachemira y seda, punto trenzado", price: 295, number: 9,  model: { fabric: "knit", color: "#8b6140", t0: 0.2, t1: 0.88, collar: 0.13, thick: 0.02 } }
      ]
    },
    {
      id: "ceremonia",
      theme: "dark", form: "#d2c6b0",
      label: "Línea Ceremonia",
      season: "Ocasión · Edición limitada",
      text: "Edición limitada para eventos. Cada pieza va numerada y se produce en una única serie.",
      products: [
        { name: "Chaleco Versalles", material: "Terciopelo de seda", price: 240, number: 18, model: { fabric: "velvet", color: "#6b4a2f", sheen: "#d9b98d", t0: 0.32, t1: 0.8, buttons: 5, btnColor: 0x8a6a3c, lining: "#3a2a20" } },
        { name: "Pajarita Opéra",    material: "Seda natural, cierre de latón", price: 180, number: 26, model: { fabric: "silk", color: "#c8b08a", bow: true } },
        { name: "Capa Bellecour",    material: "Terciopelo y forro de satén", price: 420, number: 5,  model: { fabric: "velvet", color: "#3c2a1f", sheen: "#d9b98d", cape: true, t0: 0.18, t1: 0.9, flare: 0.3, collar: 0.08 } }
      ]
    }
  ],

  /* ---- Atelier ---------------------------------------------------------- */
  atelier: {
    title: "Hecho a mano, pieza a pieza.",
    text: "Cada prenda nace en nuestro taller a partir de tejidos seleccionados y la cosen a mano artesanos con décadas de oficio. Trabajamos en series cortas para que ninguna pieza pierda carácter.",
    pillars: [
      { title: "Materiales nobles", text: "Lana merino, cachemira, seda y terciopelo de hilaturas europeas." },
      { title: "Confección artesanal", text: "Costuras a mano, forros cosidos y acabados revisados uno a uno." },
      { title: "Series de treinta", text: "Treinta piezas por modelo. Nunca más." }
    ]
  },

  /* ---- Guía de tallas ----------------------------------------------------
     cuello / pecho / lomo en cm. `scale` escala el dibujo (1 = talla M).    */
  sizing: {
    title: "Encuentre su talla.",
    text: "Nuestras prendas se ofrecen en cinco tallas. Mida a su perro en tres puntos y elija la talla que mejor le corresponda.",
    tip: "Con una cinta flexible, sin apretar. Si está entre dos tallas, elija la mayor.",
    sizes: [
      { code: "XS", neck: 24, chest: 34, back: 24, scale: 0.62, breeds: "Chihuahua, yorkshire terrier" },
      { code: "S",  neck: 30, chest: 42, back: 30, scale: 0.78, breeds: "Bichón, teckel, jack russell" },
      { code: "M",  neck: 38, chest: 54, back: 40, scale: 0.92, breeds: "Beagle, bulldog francés, cocker" },
      { code: "L",  neck: 46, chest: 68, back: 52, scale: 1.06, breeds: "Border collie, bóxer, setter" },
      { code: "XL", neck: 54, chest: 82, back: 64, scale: 1.2,  breeds: "Labrador, pastor alemán, golden" }
    ],
    defaultIndex: 2
  },

  /* ---- Contacto --------------------------------------------------------- */
  contact: {
    title: "Acceso anticipado.",
    text: "Las nuevas series se presentan primero a quienes forman parte de nuestra lista. Déjenos sus datos y le avisaremos.",
    success: "Gracias. Hemos recibido su solicitud y nos pondremos en contacto con usted muy pronto."
  },

  /* ---- Redes (placeholders) -------------------------------------------- */
  social: [
    { name: "Instagram", url: "#" },
    { name: "Pinterest", url: "#" },
    { name: "Correo",    url: "#" }
  ]
};
