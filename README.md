# Trailer Hub — motion graphics 100% código

Un hub de tráilers cinematográficos generados en vivo en el navegador: GSAP, canvas, WebGL y audio sintetizado con WebAudio. Sin videos, sin imágenes y sin audio grabado.

**En vivo:** https://toti-gauna.github.io/motion-animations/

## Desarrollo

Requiere Node 22.18 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo → http://localhost:5173
npm run build      # chequeo de tipos + build de producción en dist/
npm run preview    # sirve dist/ → http://localhost:4173
```

Cada tráiler acepta `?t=SEGUNDOS` para congelar un cuadro, por ejemplo `trailers/kinetic/index.html?t=42.3`.

## Deploy a GitHub Pages

El workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) hace el build y publica `dist/` en cada push a `main`.

Solo hay que configurarlo una vez: en el repo, **Settings → Pages → Build and deployment → Source: GitHub Actions**.

El build usa rutas relativas (`base: './'`), así que funciona bajo `/motion-animations/` o en cualquier otro dominio.

## Estructura

```
index.html              hub (página principal)
hub/                    código del hub en TypeScript: catálogo, pósters generativos, UI
src/lib/                GSAP y Three.js desde npm, expuestos en window para el kit
src/types/              tipos de los globals que comparten el hub y el kit
src/handy/              componentes compartidos de los tráileres de Handy (galería en /src/handy/galeria.html con npm run dev)
trailers/<id>/          un tráiler por carpeta
  index.html            escenario + <script type="module" src="./main.ts">
  main.ts               entry point: importa los scripts del kit en orden
  js/                   el Trailer Kit (engine, audio, recetas, configuración del tráiler)
  css/style.css
legacy/kinetic-v1/      la primera versión de KINETIC
scripts/                herramientas del proyecto (adopt-trailer.mjs)
exports/                renders en MP4/GIF/WAV (no se publican)
```

Los scripts del kit (`trailers/<id>/js/*.js`) son módulos ES que se comunican a través de `window` (`window.Trailer`, `window.SFX`), igual que cuando se cargaban con `<script>`. Por eso el orden de los imports en cada `main.ts` importa.

## Agregar un tráiler nuevo

1. Construirlo en `trailers/<id>/` con el agente **trailer-director** (genera `<script>` clásicos y GSAP desde el CDN).
2. Adoptarlo en Vite: `npm run adopt -- trailers/<id>`. Reemplaza los `<script>` por un `main.ts` y usa GSAP y Three.js desde npm.
3. Agregarlo en [hub/catalog.ts](hub/catalog.ts) con `enabled: true`.

Si un tráiler todavía tiene `<script>` clásicos, `npm run build` falla y avisa qué comando correr.

## Herramientas de datos

`trailers/wrapped/tools/measure.mjs` y el paso `hash` de `trailers/export/tools/capture.mjs` cargan los tráilers en Chrome headless. Como ahora son módulos ES, ya no se abren desde `file://`: primero hay que servir el sitio (`npm run build && npm run preview`, o definir `TRAILER_BASE`).
