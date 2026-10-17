# Maison Canis — maqueta web

Maqueta provisional de una marca premium de ropa para perros. Sitio estático (HTML + CSS + JS), sin build y sin dependencias que instalar: funciona en Vercel tal cual.

## Qué lleva
- Hero con tejido 3D (Three.js, shader propio) que reacciona al cursor y al scroll.
- Scroll suave (Lenis + GSAP ScrollTrigger) y galería de colecciones en horizontal.
- Fichas numeradas «Nº 07 / 30», con inclinación 3D al pasar el cursor.
- Hilo de costura que recorre la página y cursor propio.
- Guía de tallas interactiva: dibujo técnico con cotas que se reescala por talla.
- Respeta `prefers-reduced-motion` (versión estática sin animaciones) y funciona sin WebGL.

## Estructura

```
index.html        Secciones
css/styles.css    Estilos (paleta y tipografías en :root)
js/data.js        Textos, precios, tallas e imágenes (editar aquí)
js/main.js        Render, animaciones, tallas, formulario
js/hero3d.js      Tejido 3D del hero
js/vendor/        three, gsap, ScrollTrigger, lenis (copias locales)
assets/img/       Imágenes propias
```

## Ver en local

```
python3 -m http.server 8000
```

y abre http://localhost:8000 (mejor que abrir el archivo con doble clic).

## Cambiar contenido

- Textos, productos, precios, tallas y frase del hero: `js/data.js`.
- Imágenes: copia el archivo en `assets/img/` y pon su ruta en el campo `img` (`"assets/img/montmartre.jpg"`). Sin ruta se muestra una muestra de tejido.
- Colores y tipografías: variables al inicio de `css/styles.css`.

## Publicar en Vercel

1. En https://vercel.com inicia sesión con GitHub y pulsa **Add New… → Project**.
2. Importa el repositorio `ropaperro`.
3. **Framework Preset: Other**, sin Build Command ni Output Directory.
4. **Deploy**. Cada `git push` a la rama de producción redespliega solo.
