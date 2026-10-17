# Maison Canis — maqueta web

Maqueta provisional de una marca premium de ropa para perros. Sitio estático (HTML + CSS + JS), sin build y sin dependencias que instalar: funciona en Vercel tal cual.

## Qué lleva
- Hero con tejido 3D (Three.js, shader propio) que reacciona al cursor y al scroll.
- Scroll suave (Lenis + GSAP ScrollTrigger).
- Cada colección fija el scroll y presenta sus prendas en 3D sobre un maniquí de sastre que gira; cada prenda se disuelve en la siguiente. Numeradas «Nº 07 / 30».
- Hilo de costura que recorre la página y cursor propio.
- Guía de tallas interactiva: dibujo técnico con cotas que se reescala por talla.
- Las animaciones se muestran siempre, aunque el sistema tenga «reducir movimiento». Para respetar ese ajuste, `RESPECT_REDUCED_MOTION = true` al inicio de `js/main.js`. Funciona sin WebGL.

## Estructura

```
index.html        Secciones
css/styles.css    Estilos (paleta y tipografías en :root)
js/data.js        Textos, precios, tallas e imágenes (editar aquí)
js/main.js        Render, animaciones, tallas, formulario
js/hero3d.js      Tejido 3D del hero
js/stage3d.js     Maniquí y prendas 3D de las colecciones
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
- Prendas 3D: parámetros `model` de cada producto (tejido, color, largo, cuello, botones...).
- Tipografía: Marcellus (títulos) y Jost (texto). Colores y fuentes al inicio de `css/styles.css`.

## Publicar en Vercel

1. En https://vercel.com inicia sesión con GitHub y pulsa **Add New… → Project**.
2. Importa el repositorio `ropaperro`.
3. **Framework Preset: Other**, sin Build Command ni Output Directory.
4. **Deploy**. Cada `git push` a la rama de producción redespliega solo.
