# Imágenes

Las 15 imágenes de `images/` están generadas con IA y optimizadas (JPG progresivo, entre 70 y 190 KB). Los prompts están en `tools/generar-imagenes.py`.

| Archivo | Medida | Dónde aparece |
|---|---|---|
| hero-inicio, hero-inicio-movil | 2000×1125, 1200×1500 | Portada |
| vendome-01…04, montaigne-01…04, rivoli-01…04 | 1200×1500, 1000×1000 (×2), 1500×1000 | Fichas, colección, carrito, checkout |
| guia-medicion | 1500×1000 | Guía de tallas |

Las fotos `-02`, `-03` y `-04` de cada prenda son recortes de la foto principal `-01` (original 4K en `tools/originales/`, fuera de git). `hero-inicio.jpg` es la foto de Vendôme sobre un fondo de estudio extendido a 16:9. En `montaigne-01` se retocó el original para eliminar una zona no apta.

Los textos alternativos están en `js/data.js` (fichas) y en el HTML de cada página.
