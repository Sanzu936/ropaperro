# Maison Canis

Web estática de una marca de ropa para perro de gama alta. HTML, CSS y JavaScript, sin servidor ni dependencias: se abre con `index.html` y se sube tal cual a Vercel (Add New → Project → carpeta, sin framework ni build).

## Estructura

```
index.html                 Portada
gabardina.html             Nº 1 · Gabardina Auteuil (890 €)
jersey.html                Nº 2 · Jersey Passy (540 €)
abrigo.html                Nº 3 · Abrigo Marais (1.180 €)
guia-de-tallas.html        Cómo medir, calculadora y tabla de tallas
la-maison.html             Historia, materiales y artesanía
envios-y-cuidados.html     Envíos, cambios, cuidado y reparaciones
carrito.html               Carrito
checkout.html              Entrega y pago simulado
confirmacion.html          Pedido confirmado
404.html                   Página no encontrada (Vercel la usa sola)
css/styles.css             Todo el diseño
js/                        data.js (catálogo) · cart.js · ui.js · un archivo por página
images/                    20 fotografías generadas con IA (ver LISTA-DE-IMAGENES.md)
tools/generar-imagenes.py  prompts y script de generación (sin clave)
js/fx.js                   scroll suave, revelados, cinta de sastre, cursor
js/fabric.js               muestra de tejido en 3D (carga diferida)
js/vendor/                 three.js 0.170.0 y Lenis 1.1.20, copias locales con licencia
fonts/                     Cormorant Garamond y Jost, alojadas en local
```

## Qué editar

- **Precios, tallas, textos de producto, textos alternativos de las fotos:** `js/data.js`. Es la única fuente: ficha, tarjetas, carrito y checkout leen de ahí.
- **Envíos (precio y plazos) y países:** `js/data.js`.
- **Colores y tipografía:** variables al inicio de `css/styles.css`.

## Decisiones

- **Prendas:** gabardina impermeable, jersey de cachemir y abrigo acolchado. Cubren tres capas del invierno, tres rangos de precio (540–1.180 €) y tres materiales distintos.
- **Un solo color por prenda** (Arena, Avena, Loden): refuerza la idea de «tres prendas, ninguna de más» y evita un selector de color.
- **Tallas por medidas** (pecho y lomo), cinco tallas XS–XL, con calculadora que enlaza a cada prenda con la talla ya elegida.
- **Carrito:** `localStorage` (clave `maisoncanis.cart.v1`), máximo 10 unidades por línea, con «Deshacer» al retirar.
- **Checkout:** valida todos los campos; no almacena datos de tarjeta y acepta cualquier número de 13 a 19 dígitos. El pedido queda en `localStorage` solo para mostrar la confirmación. No se envía ningún correo real.
- **Datos de marca inventados** (fundación en 2019, taller de Guimarães, proveedores, horas de trabajo, correo `atelier@maisoncanis.com`): son verosímiles pero ficticios; sustitúyalos por los reales antes de publicar.
- **Identidad:** cotas de sastre sobre la foto de portada; cinta métrica lateral como indicador de scroll (y navegación al hacer clic); puntadas que se «cosen» al entrar cada bloque; fondo de la colección que adopta el tono de la prenda en pantalla; cursor «Descubrir» sobre las fotos; manifiesto cuyas palabras se encienden con el scroll.
- **3D:** muestra de tejido (sarga, punto de cachemir, acolchado en retícula con relieve real y botones de corozo / corchete de latón) en la portada y en cada ficha. Arrastrar o flechas del teclado para girar; la luz sigue al cursor. Three.js se descarga solo cuando la sección está cerca de la pantalla; sin WebGL queda la fotografía de detalle.
- **Movimiento:** respeta `prefers-reduced-motion` (sin scroll suave, sin revelados, 3D estático).
- **Imágenes:** generadas una sola vez con OpenRouter (`google/gemini-3-pro-image-preview` para retratos y `google/gemini-3.1-flash-image-preview` para detalles y bodegones) con `tools/generar-imagenes.py`. La web no llama a OpenRouter. Para rehacer una: `OPENROUTER_API_KEY=... python3 tools/generar-imagenes.py nombre`. La clave va en el entorno o en `.env` (ignorado por git), nunca en el código.
