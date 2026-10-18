/* Maison Canis · datos de catálogo (única fuente de verdad para precios, tallas y textos de producto) */
(function () {
  'use strict';

  var SIZES = [
    { id: 'XS', chest: [30, 37], back: [20, 25], breeds: 'Chihuahua, yorkshire terrier' },
    { id: 'S',  chest: [38, 45], back: [26, 31], breeds: 'Bichón maltés, carlino, westie' },
    { id: 'M',  chest: [46, 55], back: [32, 39], breeds: 'Beagle, cocker spaniel, bulldog francés' },
    { id: 'L',  chest: [56, 67], back: [40, 49], breeds: 'Border collie, springer spaniel' },
    { id: 'XL', chest: [68, 82], back: [50, 60], breeds: 'Labrador, golden retriever, bóxer' }
  ];

  var PRODUCTS = [
    {
      id: 'vendome',
      page: 'vendome.html',
      num: 'Nº 1',
      name: 'Abrigo Vendôme',
      type: 'Abrigo cruzado',
      color: 'Gris jaspeado',
      price: 1290,
      cardLine: 'Lana gris jaspeada, doble botonadura y cinturón.',
      lead: 'Abrigo cruzado de lana.',
      description: [
        'Abrigo de lana en gris jaspeado, de corte cruzado: solapas, dos filas de botones negros y un cinturón a juego que se anuda en la cintura. Cubre el lomo y el pecho.'
      ],
      details: [
        'Solapas y doble botonadura con botones negros',
        'Cinturón a juego, anudado en la cintura',
        'Cubre el lomo y el pecho'
      ],
      materials: 'Lana.',
      care: 'Limpieza en seco profesional. Cepíllela en el sentido del tejido y déjela airear tras cada uso. No la planche: si fuera necesario, aplique vapor desde lejos.',
      images: [
        { file: 'vendome-01.jpg', w: 1200, h: 1500, alt: 'Galgo whippet con el abrigo cruzado Vendôme de lana gris, de perfil, sobre fondo liso de estudio' },
        { file: 'vendome-02.jpg', w: 1000, h: 1000, alt: 'Detalle de la solapa y de los botones negros del abrigo Vendôme' },
        { file: 'vendome-03.jpg', w: 1000, h: 1000, alt: 'Detalle del cinturón anudado y de la lana jaspeada del abrigo Vendôme' },
        { file: 'vendome-04.jpg', w: 1500, h: 1000, alt: 'Lomo y costado del abrigo Vendôme sobre un galgo whippet' }
      ]
    },
    {
      id: 'montaigne',
      page: 'montaigne.html',
      num: 'Nº 2',
      name: 'Plumífero Montaigne',
      type: 'Plumífero',
      color: 'Negro lacado',
      price: 1190,
      cardLine: 'Acolchado en canales, negro brillante, con capucha.',
      lead: 'Plumífero acolchado de acabado brillante.',
      description: [
        'Plumífero acolchado en canales horizontales, con un acabado negro brillante y lacado. Cuello alto, capucha y cremallera frontal.'
      ],
      details: [
        'Acolchado en canales horizontales',
        'Cuello alto y capucha',
        'Cremallera frontal'
      ],
      materials: 'Exterior: tejido negro de acabado lacado. Cierre: cremallera.',
      care: 'Limpie con un paño húmedo. Déjelo secar al aire, lejos de fuentes de calor. Guárdelo sin comprimir para que conserve el volumen.',
      images: [
        { file: 'montaigne-01.jpg', w: 1200, h: 1500, alt: 'Galgo whippet con el plumífero negro lacado Montaigne, de perfil, sobre fondo oscuro' },
        { file: 'montaigne-02.jpg', w: 1000, h: 1000, alt: 'Detalle del cuello alto y de la cremallera del plumífero Montaigne' },
        { file: 'montaigne-03.jpg', w: 1000, h: 1000, alt: 'Detalle del acolchado en canales y del brillo negro del plumífero Montaigne' },
        { file: 'montaigne-04.jpg', w: 1500, h: 1000, alt: 'Lomo y costado del plumífero Montaigne sobre un galgo whippet' }
      ]
    },
    {
      id: 'rivoli',
      page: 'rivoli.html',
      num: 'Nº 3',
      name: 'Capa Rivoli',
      type: 'Capa',
      color: 'Camel',
      price: 1680,
      cardLine: 'Cachemir doble faz en camel, con broche de latón.',
      lead: 'Capa de cachemir doble faz.',
      description: [
        'Capa de cachemir doble faz en tono camel. Se apoya sobre el lomo y el pecho, se cierra en el cuello con un broche de latón y deja las patas libres.'
      ],
      details: [
        'Broche de latón en el cuello',
        'Se apoya sobre el lomo y el pecho',
        'Deja las patas libres'
      ],
      materials: 'Cachemir doble faz. Broche: latón.',
      care: 'Limpieza en seco profesional. Guárdela doblada o en una percha ancha, nunca colgada de un solo punto. Cepíllela suavemente en el sentido del tejido.',
      images: [
        { file: 'rivoli-01.jpg', w: 1200, h: 1500, alt: 'Galgo whippet con la capa Rivoli de cachemir camel, de perfil, sobre fondo terracota' },
        { file: 'rivoli-02.jpg', w: 1000, h: 1000, alt: 'Detalle del cuello y del broche de latón de la capa Rivoli' },
        { file: 'rivoli-03.jpg', w: 1000, h: 1000, alt: 'Detalle de la caída y del tejido de cachemir de la capa Rivoli' },
        { file: 'rivoli-04.jpg', w: 1500, h: 1000, alt: 'Lomo y costado de la capa Rivoli sobre un galgo whippet' }
      ]
    }
  ];

  var SHIPPING = [
    { id: 'estandar', name: 'Envío asegurado', note: 'Entrega en 3 a 4 días laborables', price: 0, minDays: 3, maxDays: 4 },
    { id: 'express', name: 'Entrega en 24 horas', note: 'Pedidos confirmados antes de las 14:00 h', price: 18, minDays: 1, maxDays: 1 }
  ];

  var COUNTRIES = ['España', 'Portugal', 'Francia', 'Italia', 'Alemania', 'Países Bajos', 'Bélgica'];

  var fmt0 = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  var fmt2 = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  window.MC = window.MC || {};
  MC.SIZES = SIZES;
  MC.PRODUCTS = PRODUCTS;
  MC.SHIPPING = SHIPPING;
  MC.COUNTRIES = COUNTRIES;
  MC.MAX_QTY = 10;
  MC.VAT = 0.21;
  MC.product = function (id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  };
  MC.size = function (id) {
    for (var i = 0; i < SIZES.length; i++) if (SIZES[i].id === id) return SIZES[i];
    return null;
  };
  MC.money = function (n) { return fmt0.format(n); };
  MC.money2 = function (n) { return fmt2.format(n); };
  MC.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  MC.sizeRange = function (s) {
    return 'Pecho ' + s.chest[0] + '–' + s.chest[1] + ' cm · Lomo ' + s.back[0] + '–' + s.back[1] + ' cm';
  };
})();
