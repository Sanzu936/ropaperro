# Imágenes que debe aportar

Todas están ya enlazadas en la carpeta `images/` con un archivo provisional (gris con monograma y el nombre del archivo escrito). Para sustituirlas, **arrastre su imagen a `images/` con exactamente el mismo nombre y la extensión `.jpg`**. No hay que tocar código.

Medidas en píxeles (ancho × alto). Recomendado: JPG calidad 80–85, menos de 400 KB por imagen, perfil sRGB. Las proporciones son importantes: con otra proporción la imagen se recorta (`object-fit: cover`).

| # | Archivo | Medida | Proporción | Dónde aparece | Qué debe mostrar |
|---|---------|--------|-----------|---------------|------------------|
| 1 | `hero-inicio.jpg` | 2400 × 1350 | 16:9 | Portada, a todo el ancho (escritorio) | Perro con la gabardina Auteuil frente a un muro de piedra clara; sujeto centrado |
| 2 | `hero-inicio-movil.jpg` | 1200 × 1500 | 4:5 | Portada en móvil (hasta 640 px) | Versión vertical de la anterior |
| 3 | `home-maison.jpg` | 1600 × 2000 | 4:5 | Portada, bloque «Nació de un abrigo mal cortado» | Manos de costurera sobre un patrón, en el taller |
| 4 | `gabardina-01.jpg` | 1600 × 2000 | 4:5 | Ficha, tarjeta de colección, carrito, checkout y confirmación | Gabardina Auteuil puesta, de perfil, fondo neutro |
| 5 | `gabardina-02.jpg` | 1200 × 1200 | 1:1 | Ficha; aparece al pasar el ratón sobre la tarjeta | Cuello alto y botones de corozo |
| 6 | `gabardina-03.jpg` | 1200 × 1200 | 1:1 | Ficha | Interior con el forro de lino a rayas |
| 7 | `gabardina-04.jpg` | 1800 × 1200 | 3:2 | Ficha | Perro caminando bajo la lluvia, calle empedrada |
| 8 | `jersey-01.jpg` | 1600 × 2000 | 4:5 | Ficha, tarjeta, carrito, checkout y confirmación | Jersey Passy puesto, de tres cuartos, fondo neutro |
| 9 | `jersey-02.jpg` | 1200 × 1200 | 1:1 | Ficha; aparece al pasar el ratón sobre la tarjeta | Detalle del punto liso de cachemir |
| 10 | `jersey-03.jpg` | 1200 × 1200 | 1:1 | Ficha | Cuello vuelto doblado sobre sí mismo |
| 11 | `jersey-04.jpg` | 1800 × 1200 | 3:2 | Ficha | Jersey plegado sobre madera clara |
| 12 | `abrigo-01.jpg` | 1600 × 2000 | 4:5 | Ficha, tarjeta, carrito, checkout y confirmación | Abrigo Marais puesto, de perfil, fondo neutro |
| 13 | `abrigo-02.jpg` | 1200 × 1200 | 1:1 | Ficha; aparece al pasar el ratón sobre la tarjeta | Detalle del acolchado en rombos |
| 14 | `abrigo-03.jpg` | 1200 × 1200 | 1:1 | Ficha | Tapeta y corchetes ocultos |
| 15 | `abrigo-04.jpg` | 1800 × 1200 | 3:2 | Ficha | Perro paseando por un parque en otoño |
| 16 | `maison-retrato.jpg` | 1600 × 2000 | 4:5 | La Maison, historia | Retrato de una galga italiana junto a una ventana |
| 17 | `maison-materiales.jpg` | 1600 × 2000 | 4:5 | La Maison, materiales | Muestras de algodón, lino, cachemir y lana sobre una mesa |
| 18 | `maison-atelier.jpg` | 1800 × 1200 | 3:2 | La Maison, artesanía | Mesa de corte del taller con patrones y tijeras |
| 19 | `maison-costura.jpg` | 1200 × 1200 | 1:1 | La Maison, artesanía | Detalle de un ojal rematado a mano |
| 20 | `guia-medicion.jpg` | 1800 × 1200 | 3:2 | Guía de tallas | Perro de pie mientras se le mide con cinta métrica |

Total: 20 imágenes. Si algún día añade vídeo, basta con sustituir una etiqueta `<img>` por `<video autoplay muted loop playsinline poster="images/archivo.jpg">`.

Los textos alternativos (`alt`) de cada foto describen la escena indicada en la última columna; si su fotografía es distinta, edite el `alt` en `js/data.js` (fichas de producto) o en el HTML correspondiente.
