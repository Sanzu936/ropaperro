/* ==========================================================================
   MAISON CANIS — Contenido editable
   Cambia aquí textos, precios e imágenes. No hace falta tocar el HTML.

   IMÁGENES: pon la ruta en `img` (p. ej. "assets/img/montmartre.jpg") o una
   URL completa (Unsplash, etc.). Si `img` está vacío se muestra un bloque de
   color con textura (placeholder). `tone` elige el color del placeholder.
   ========================================================================== */

window.MAISON = {

  /* ---- Hero ---------------------------------------------------------------
     Opciones de frase de posicionamiento. Se usa la indicada en `heroIndex`.
     0 · "El abrigo, a la medida de quien camina a tu lado."
     1 · "Alta artesanía para el compañero más fiel."
     2 · "Lana noble. Manos pacientes. Series de pocas piezas."              */
  heroTaglines: [
    "El abrigo, a la medida de quien camina a tu lado.",
    "Alta artesanía para el compañero más fiel.",
    "Lana noble. Manos pacientes. Series de pocas piezas."
  ],
  heroIndex: 1,
  heroImage: "", // p. ej. "assets/img/hero.jpg"

  /* ---- Colecciones ------------------------------------------------------ */
  collections: [
    {
      id: "urbana",
      label: "Línea Urbana",
      season: "Paseo",
      title: "Urbana",
      text: "Abrigos de lana merino y gabardinas impermeables para el día a día en la ciudad.",
      products: [
        { name: "Abrigo Montmartre", material: "Lana merino doble faz", price: 390, img: "", tone: "tabaco" },
        { name: "Gabardina Passy",   material: "Algodón encerado, forro de seda", price: 320, img: "", tone: "arena" },
        { name: "Capa Tuileries",    material: "Lana virgen cardada", price: 260, img: "", tone: "piedra" }
      ]
    },
    {
      id: "alpina",
      label: "Línea Alpina",
      season: "Invierno",
      title: "Alpina",
      text: "Plumíferos y jerséis de punto para el frío y la montaña. Calor sin peso.",
      products: [
        { name: "Plumífero Zermatt", material: "Plumón de oca, tejido técnico mate", price: 450, img: "", tone: "noche" },
        { name: "Jersey Engadina",   material: "Punto de cachemira", price: 360, img: "", tone: "crema" },
        { name: "Jersey Verbier",    material: "Cachemira y seda, punto trenzado", price: 295, img: "", tone: "tabaco" }
      ]
    },
    {
      id: "ceremonia",
      label: "Línea Ceremonia",
      season: "Ocasión · Edición limitada",
      title: "Ceremonia",
      text: "Edición limitada para eventos. Cada pieza se numera y se produce en una única serie.",
      products: [
        { name: "Chaleco Versalles", material: "Terciopelo de seda", price: 240, img: "", tone: "noche" },
        { name: "Pajarita Opéra",    material: "Seda natural, cierre de latón", price: 180, img: "", tone: "arena" },
        { name: "Capa Bellecour",    material: "Terciopelo y forro de satén", price: 420, img: "", tone: "tabaco" }
      ]
    }
  ],

  /* ---- Atelier ---------------------------------------------------------- */
  atelier: {
    label: "Atelier",
    title: "Hecho a mano, pieza a pieza.",
    text: "Cada prenda nace en nuestro taller a partir de tejidos seleccionados y se confecciona a mano por artesanos con décadas de oficio. Trabajamos en series cortas para que ninguna pieza pierda carácter.",
    image: "",
    pillars: [
      { title: "Materiales nobles", text: "Lana merino, cachemira, seda y terciopelo de hilaturas europeas." },
      { title: "Confección artesanal", text: "Costuras a mano, forros cosidos y acabados revisados uno a uno." },
      { title: "Pequeñas series", text: "Entre veinte y cuarenta piezas por modelo. Nunca más." }
    ]
  },

  /* ---- Hecho a medida --------------------------------------------------- */
  bespoke: {
    label: "Hecho a medida",
    title: "Una prenda que solo es de su perro.",
    text: "Cada perro tiene una anatomía distinta. Por eso confeccionamos a medida: usted nos envía las medidas y nosotros nos ocupamos del resto.",
    steps: [
      { title: "Envíe las medidas", text: "Le facilitamos una guía sencilla para tomarlas en casa: cuello, pecho, largo de lomo." },
      { title: "Diseñamos su prenda", text: "Elegimos con usted tejido, color y detalles. Recibirá una propuesta antes de empezar." },
      { title: "Confección y entrega", text: "El atelier la cose a mano en 3–4 semanas y se la entregamos en estuche." }
    ]
  },

  /* ---- Contacto --------------------------------------------------------- */
  contact: {
    label: "Lista de espera",
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
