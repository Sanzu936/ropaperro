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
      id: 'gabardina',
      page: 'gabardina.html',
      num: 'Nº 1',
      name: 'Gabardina Auteuil',
      type: 'Gabardina impermeable',
      color: 'Arena',
      price: 890,
      cardLine: 'Algodón de trama densa, forro de lino a rayas.',
      lead: 'Una gabardina de corte recto, pensada para que la lluvia resbale y la silueta del perro permanezca intacta.',
      description: [
        'El tejido es una gabardina de algodón de trama muy densa, con un acabado hidrorrepelente sin PFAS. Resiste la lluvia fina y el viento de ciudad sin el tacto plástico de los impermeables técnicos.',
        'El forro es de lino a rayas finas, que respira y no acumula humedad. Se cierra con cuatro botones de corozo y un cuello alto protege la nuca. Una abertura discreta en el lomo deja pasar la anilla del arnés sin quitar la prenda.'
      ],
      details: [
        'Gabardina de algodón de trama densa, hidrorrepelente sin PFAS',
        'Forro de lino a rayas finas',
        'Cuatro botones de corozo',
        'Cuello alto abotonable',
        'Abertura dorsal para la anilla del arnés',
        'Costuras selladas con cinta de algodón'
      ],
      materials: 'Exterior: 100 % algodón, tejido en Cataluña. Forro: 100 % lino, cultivado en Normandía. Botones: corozo (nuez de tagua), tallados y pulidos a mano. Confeccionada en nuestro taller del norte de Portugal.',
      care: 'Limpie con un paño húmedo y deje secar al aire, lejos de cualquier fuente de calor. Limpieza en seco profesional una vez por temporada. El acabado hidrorrepelente se renueva cada dos inviernos; en la Maison lo hacemos sin coste.',
      images: [
        { file: 'gabardina-01.jpg', w: 1200, h: 1500, alt: 'Perro de pelo corto con la gabardina Auteuil en color arena, de perfil, sobre fondo neutro' },
        { file: 'gabardina-02.jpg', w: 1000, h: 1000, alt: 'Detalle del cuello alto y de los botones de corozo de la gabardina Auteuil' },
        { file: 'gabardina-03.jpg', w: 1000, h: 1000, alt: 'Interior de la gabardina Auteuil con el forro de lino a rayas' },
        { file: 'gabardina-04.jpg', w: 1500, h: 1000, alt: 'Perro caminando bajo la lluvia con la gabardina Auteuil, en una calle empedrada' }
      ]
    },
    {
      id: 'jersey',
      page: 'jersey.html',
      num: 'Nº 2',
      name: 'Jersey Passy',
      type: 'Jersey de cachemir',
      color: 'Avena',
      price: 540,
      cardLine: 'Cachemir de fibra larga, punto liso de galga fina.',
      lead: 'Punto de cachemir de dos cabos, suave contra la piel y lo bastante tupido para el invierno.',
      description: [
        'Tejido en cachemir de fibra larga, hilado en el Piamonte y trabajado en punto liso de galga fina. Es una prenda de capa intermedia: ligera, elástica y cálida sin añadir volumen.',
        'El cuello vuelto se dobla sobre sí mismo y no aprieta. Las costuras son planas y el borde inferior lleva un remate de canalé para que la prenda no suba al correr. Una pequeña abertura en el lomo deja pasar la anilla del arnés.'
      ],
      details: [
        '100 % cachemir de fibra larga, dos cabos',
        'Punto liso de galga fina',
        'Cuello vuelto que no aprieta',
        'Costuras planas, sin relieve sobre la piel',
        'Remate inferior de canalé, del mismo cachemir',
        'Abertura dorsal para la anilla del arnés'
      ],
      materials: '100 % cachemir de Mongolia Interior, de fibra de 15,5 micras. Hilado en el Piamonte (Italia) y tricotado en nuestro taller del norte de Portugal.',
      care: 'Lávelo a mano a 30 °C con un champú neutro, sin retorcer. Séquelo en plano, a la sombra. Guárdelo doblado, nunca colgado. Durante los primeros lavados el cachemir suelta algo de pelusa; es normal y se retira con un peine para punto.',
      images: [
        { file: 'jersey-01.jpg', w: 1200, h: 1500, alt: 'Perro sentado con el jersey Passy en color avena, de tres cuartos, sobre fondo neutro' },
        { file: 'jersey-02.jpg', w: 1000, h: 1000, alt: 'Detalle del punto liso de cachemir del jersey Passy' },
        { file: 'jersey-03.jpg', w: 1000, h: 1000, alt: 'Cuello vuelto del jersey Passy doblado sobre sí mismo' },
        { file: 'jersey-04.jpg', w: 1500, h: 1000, alt: 'Jersey Passy plegado sobre una superficie de madera clara' }
      ]
    },
    {
      id: 'abrigo',
      page: 'abrigo.html',
      num: 'Nº 3',
      name: 'Abrigo Marais',
      type: 'Abrigo acolchado',
      color: 'Loden',
      price: 1180,
      cardLine: 'Lana batida acolchada en retícula, relleno de merino.',
      lead: 'Un abrigo acolchado en retícula, de lana batida, para los días en que el frío deja de ser una promesa.',
      description: [
        'Lana batida de tipo loden, acolchada en retícula de cinco centímetros sobre un relleno de lana merino. Aísla sin pesar: en la talla M, el conjunto no supera los 280 gramos.',
        'El forro de algodón peinado es suave y no retiene electricidad estática. Se cierra con corchetes metálicos ocultos bajo una tapeta, que se abren de un solo gesto. La abertura dorsal para el arnés lleva un refuerzo de lona encerada.'
      ],
      details: [
        'Lana batida tipo loden, repelente a la lluvia ligera',
        'Acolchado en retícula con relleno de lana merino',
        'Forro de algodón peinado',
        'Corchetes metálicos ocultos bajo tapeta',
        'Cuello alto forrado que cubre la nuca',
        'Abertura dorsal reforzada para la anilla del arnés'
      ],
      materials: 'Exterior: 100 % lana, tejida en Biella (Italia). Relleno: 100 % lana merino. Forro: 100 % algodón peinado. Confeccionado en nuestro taller del norte de Portugal.',
      care: 'Limpieza en seco profesional. Ventílelo al aire tras cada uso y cepíllelo en el sentido de la fibra. No lo planche: si fuera necesario, aplique vapor desde lejos y deje que la lana recupere su forma.',
      images: [
        { file: 'abrigo-01.jpg', w: 1200, h: 1500, alt: 'Perro de pie con el abrigo acolchado Marais en color loden, de perfil, sobre fondo neutro' },
        { file: 'abrigo-02.jpg', w: 1000, h: 1000, alt: 'Detalle del acolchado en retícula del abrigo Marais' },
        { file: 'abrigo-03.jpg', w: 1000, h: 1000, alt: 'Tapeta del abrigo Marais levantada para mostrar los corchetes metálicos' },
        { file: 'abrigo-04.jpg', w: 1500, h: 1000, alt: 'Perro paseando por un parque en otoño con el abrigo Marais' }
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
