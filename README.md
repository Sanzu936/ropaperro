# Maison Canis — maqueta web

Maqueta provisional de una marca premium de ropa para perros. Sitio estático (HTML + CSS + JS vanilla): no necesita build ni configuración para Vercel.

## Estructura

```
index.html       Secciones de la página
css/styles.css   Estilos (paleta en :root)
js/data.js       Textos, precios, productos e imágenes (editar aquí)
js/main.js       Renderizado, menú móvil, animaciones, formulario
assets/img/      Imágenes propias
```

## Ver en local

Abre `index.html` con doble clic, o mejor con un servidor local:

```
python3 -m http.server 8000
```

y visita http://localhost:8000

## Cambiar contenido

- Textos, productos, precios y frase del hero: `js/data.js`.
- Imágenes: copia el archivo en `assets/img/` y pon su ruta en el campo `img` (`"assets/img/montmartre.jpg"`) o una URL completa. Sin ruta se muestra un placeholder de color.
- Colores y tipografías: variables al inicio de `css/styles.css`.

## Publicar en Vercel

1. En https://vercel.com inicia sesión con GitHub y pulsa **Add New… → Project**.
2. Importa el repositorio `ropaperro`.
3. Deja **Framework Preset: Other**, sin Build Command ni Output Directory.
4. Pulsa **Deploy**. Vercel te dará una URL `*.vercel.app`.

Cada `git push` a la rama de producción redespliega automáticamente.
