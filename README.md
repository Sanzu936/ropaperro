# Maison Canis

Web estática de una marca de ropa para perro de gama alta. HTML, CSS y JavaScript, sin servidor ni dependencias: se abre con `index.html` y se sube tal cual a Vercel (Add New → Project → carpeta, sin framework ni build).

## Estructura

```
index.html                 Portada
vendome.html               Nº 1 · Abrigo Vendôme (185 €)
montaigne.html            Nº 2 · Plumífero Montaigne (165 €)
rivoli.html                Nº 3 · Capa Rivoli (240 €)
guia-de-tallas.html        Cómo medir, calculadora y tabla de tallas
la-maison.html             Marca y contacto
envios-y-cuidados.html     Envíos, cambios y cuidado
carrito.html               Carrito
checkout.html              Entrega y pago simulado
confirmacion.html          Pedido confirmado
404.html                   Página no encontrada (Vercel la usa sola)
css/styles.css             Todo el diseño
js/                        data.js (catálogo) · cart.js · ui.js · un archivo por página
images/                    fotografías generadas con IA (ver LISTA-DE-IMAGENES.md)
tools/generar-imagenes.py  prompts y script de generación (sin clave)
js/fx.js                   scroll suave, revelados, cinta de sastre y cursor
js/lupa.js                 lupa sobre la foto de detalle de cada prenda
js/vendor/                 Lenis 1.1.20 (scroll suave), copia local con licencia
fonts/                     Cormorant Garamond y Jost, alojadas en local
```

## Qué editar

- **Precios, tallas, textos de producto, textos alternativos de las fotos:** `js/data.js`. Es la única fuente: ficha, tarjetas, carrito y checkout leen de ahí.
- **Envíos (precio y plazos) y países:** `js/data.js`.
- **Colores y tipografía:** variables al inicio de `css/styles.css`.

## Decisiones

- **Prendas:** abrigo cruzado de lana gris (Vendôme, a partir de la fotografía de referencia del cliente), plumífero negro lacado (Montaigne, ídem) y una capa de cachemir camel (Rivoli, propuesta de la casa). Los precios son provisionales.
- **Un solo color por prenda** (gris jaspeado, negro lacado, camel): evita un selector de color.
- **Tallas por medidas** (pecho y lomo), cinco tallas XS–XL, con calculadora que enlaza a cada prenda con la talla ya elegida.
- **Carrito:** `localStorage` (clave `maisoncanis.cart.v1`), máximo 10 unidades por línea, con «Deshacer» al retirar.
- **Checkout:** valida todos los campos; no almacena datos de tarjeta y acepta cualquier número de 13 a 19 dígitos. El pedido queda en `localStorage` solo para mostrar la confirmación. No se envía ningún correo real.
- **Textos provisionales:** las instrucciones de cuidado de cada prenda (`care` en `js/data.js` y `envios-y-cuidados.html`) son genéricas y provisionales; confírmelas con las etiquetas reales de cada prenda antes de publicar.
- **Sin datos de marca inventados:** la web no cuenta historia, año de fundación, taller ni proceso de confección. Solo describe las prendas y las condiciones de la tienda (envíos, cambios, tallas), que son los valores provisionales del carrito simulado: confírmelos antes de publicar.
- **Identidad:** cotas de sastre sobre la foto de portada; cinta métrica lateral como indicador de scroll (y navegación al hacer clic); fondo de la colección que adopta el tono de la prenda en pantalla.
- **Lupa:** en la portada y en cada ficha, una lupa circular amplía la fotografía real de detalle de la prenda (cursor, toque y arrastre, o flechas del teclado). Sin JavaScript queda la foto.
- **Movimiento:** por decisión de marca, todas las animaciones se muestran siempre, también cuando el sistema operativo tiene activado «reducir movimiento» (la web ignora `prefers-reduced-motion`).
- **Imágenes:** generadas una sola vez con IA y guardadas en `images/`; la web no llama a ningún servicio. `tools/generar-imagenes.py` contiene los prompts: usa OpenRouter (`google/gemini-3-pro-image-preview`) y, si no hay saldo (error 402), Kie API (`nano-banana-pro`). Las claves van en el entorno (`OPENROUTER_API_KEY`, `KIE_API_KEY`) o en `.env` (ignorado por git), nunca en el código. Las fotos de detalle son recortes de las fotos principales (originales 4K en `tools/originales/`, fuera de git; `python3 tools/generar-imagenes.py --reconstruir` los regenera con el acabado fotográfico: negros elevados, luces suaves, viñeta y grano) y `hero-inicio.jpg` es una composición con el fondo de estudio extendido.
