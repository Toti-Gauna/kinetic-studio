/* Logo de Handy como SVG en línea: wordmark "Handy" + bajada "Soluciones, no problemas". 100 % código, sin fuentes.
   - Wordmark: vectorizado desde handy-png/logo-handy.png (contorno iso 50 % del alfa, esquinas reales, rectas y cúbicas;
     un path por letra en orden H a n d y; los huecos de la "a" y la "d" van en sentido inverso: anda con nonzero y evenodd).
     Contra el PNG (pixelmatch umbral 0,1 sobre las máscaras de alfa): 0 px distintos con la detección de antialias por
     defecto; 0,2 % de los píxeles de tinta si se cuentan también los bordes antialiasados (IoU 0,9987).
   - Bajada: Belanosima Regular (Google Fonts, OFL), la versión libre y con las mismas métricas de la letra del logo
     original (Berlin Sans FB), pasada a contornos con opentype.js: cuerpo 92,76 u, misma línea de base y altura
     que el PNG, tracking 9,5 u (el original en inglés usa 12,06; "Soluciones, no problemas" es más largo).
   Unidades del viewBox: 1 u = 1 px del PNG original. Origen (0,0) = esquina superior izquierda del wordmark.

   handyLogo({ tagline = true, color = COLORS.azul, width, className = '', split = false }) → string <svg>
     tagline  true: lockup amplio (como logo-handy.png; la bajada es más ancha que "Handy") · viewBox 1167.75 × 298.99
              'compacta': lockup del encabezado de la app (pantalla-inicio.png; la bajada del ancho del wordmark) · 763.7 × 262.54
              false: solo el wordmark, viewBox recortado a "Handy" · 725.24 × 191.52
     color    relleno de todo el logo (acepta 'currentColor')
     width    ancho en px; el alto es proporcional (logoAlto). Sin width el SVG ocupa el ancho de su contenedor.
     split    cada letra en su propio <g class="hd-logo-letra" data-letra="H|a|n|d|y"> para animarlas por separado.
   Estructura y ganchos (ningún <g> con gancho trae transform propio: GSAP puede animarlos desde cero):
     svg.hd-logo[data-bajada="amplia|compacta|no"]   overflow visible: las letras pueden salir del viewBox sin recortarse
       g.hd-logo-palabra
         split: g.hd-logo-letra[data-letra] > path   ·   sin split: path[data-letra]
       g.hd-logo-bajada        (en 'compacta' la escala va en un <g> interno, no en este)
         path.hd-logo-bajada-palabra[data-palabra="soluciones|no|problemas"]

   Animar con GSAP (solo transform y opacity):
     - En los <g> del logo, x/y van en unidades del viewBox (no en px). px → u: dividir por width / viewBox.w.
     - transformOrigin en SVG es relativo a la caja de ESE elemento: gsap.set(letra, { transformOrigin: '50% 100%' })
       para que salte y se aplaste apoyada abajo. svgOrigin: 'x y' fija el origen en coordenadas del viewBox; para
       aplastar todas sobre la línea de base: svgOrigin: `${b.x + b.w / 2} ${LOGO_INFO.lineaBase.palabra}` (b = LOGO_INFO.letras[l]).
     - Cinco Handys, cinco letras: dibujar el logo con split en su lugar final y, para cada letra,
       tl.set(letra, { ...letraHacia(l, cajaDelLogo, puntoSobreElPersonaje, 'base'), scale: 0 }) → la letra queda
       arriba del personaje (apoyada en una línea común); tl.to(letra, { scale: 1, ease: 'back.out(2)' }) la hace aparecer;
       después tl.to(letras, { x: 0, y: 0, ease: 'expo.out', stagger }) → se juntan en el wordmark real.
       Demo completa en src/handy/galeria/logo.ts.
     - Bajada amplia → posición compacta (para pasar al encabezado):
       tl.to(svg.querySelector('.hd-logo-bajada'), { ...LOGO_INFO.bajadaCompacta, svgOrigin: '0 0' }).
     - Logo del escenario → encabezado (escena 4), con el logo amplio en un contenedor HTML del tamaño del <svg>:
         tl.to(cont.querySelector('.hd-logo-bajada'), { ...LOGO_INFO.bajadaCompacta, svgOrigin: '0 0', duration, ease }, T);
         tl.to(cont, { ...palabraHacia(cajaEscenario, { ...cajaEncabezado, tagline: 'compacta' }), transformOrigin: '0 0', duration, ease }, T);
       al terminar queda exactamente encima del handyLogo({ tagline: 'compacta' }) del encabezado: se puede cortar a ese. */
import { COLORS } from './tokens.ts';

export type LetraHandy = 'H' | 'a' | 'n' | 'd' | 'y';
/** true = lockup amplio · 'compacta' = lockup del encabezado de la app · false = solo el wordmark */
export type BajadaLogo = boolean | 'compacta';
export type VarianteLogo = 'amplia' | 'compacta' | 'palabra';
export interface Caja { x: number; y: number; w: number; h: number }

export interface LogoOptions {
  /** bajada "Soluciones, no problemas": true = lockup amplio (default) · 'compacta' = la del encabezado de la app · false = sin bajada */
  tagline?: BajadaLogo;
  /** color de todo el logo (default COLORS.azul; acepta 'currentColor') */
  color?: string;
  /** ancho en px; el alto es proporcional. Sin width, el SVG ocupa el ancho de su contenedor. */
  width?: number;
  className?: string;
  /** cada letra de "Handy" en su propio <g class="hd-logo-letra" data-letra="H|a|n|d|y"> para animarlas por separado */
  split?: boolean;
}

/** Las letras del wordmark, en orden. */
export const LETRAS: readonly LetraHandy[] = ['H', 'a', 'n', 'd', 'y'];

export interface LogoInfo {
  /** viewBox de cada variante (unidades del logo; mismo sistema de coordenadas en las tres) */
  viewBox: Record<VarianteLogo, Caja>;
  /** caja del wordmark "Handy" */
  palabra: Caja;
  /** caja de la bajada en cada lockup */
  bajada: { amplia: Caja; compacta: Caja };
  /** caja de cada palabra de la bajada (lockup amplio) */
  bajadaPalabras: { soluciones: Caja; no: Caja; problemas: Caja };
  /** caja de cada letra (incluye los rebases de la a y la d) */
  letras: Record<LetraHandy, Caja>;
  /** líneas de base: del wordmark y de la bajada en cada lockup */
  lineaBase: { palabra: number; bajadaAmplia: number; bajadaCompacta: number };
  /** transform (svgOrigin '0 0') que lleva la bajada amplia a su lugar en el lockup compacto */
  bajadaCompacta: { x: number; y: number; scale: number };
}

export const LOGO_INFO: LogoInfo = {
  viewBox: {
    amplia: { x: -8.38, y: 0, w: 1167.75, h: 298.99 },
    compacta: { x: -28, y: 0, w: 763.7, h: 262.54 },
    palabra: { x: 0, y: 0, w: 725.24, h: 191.52 },
  },
  palabra: { x: 0, y: 0, w: 725.24, h: 191.52 },
  bajada: {
    amplia: { x: -8.38, y: 218.64, w: 1167.75, h: 80.35 },
    compacta: { x: -28, y: 209.99, w: 763.7, h: 52.55 },
  },
  bajadaPalabras: {
    soluciones: { x: -8.38, y: 218.64, w: 498.02, h: 77 },
    no: { x: 538.17, y: 241.69, w: 98.55, h: 43.12 },
    problemas: { x: 685.38, y: 218.64, w: 473.99, h: 80.35 },
  },
  letras: {
    H: { x: 0, y: 9.28, w: 126.86, h: 144.12 },
    a: { x: 157.2, y: 34.65, w: 118.17, h: 122.31 },
    n: { x: 311.49, y: 34.64, w: 115.37, h: 118.76 },
    d: { x: 459.51, y: 0, w: 118.86, h: 157 },
    y: { x: 605.21, y: 38.03, w: 120.03, h: 153.49 },
  },
  lineaBase: { palabra: 153.4, bajadaAmplia: 283.95, bajadaCompacta: 252.7 },
  bajadaCompacta: { x: -22.5195, y: 66.9988, scale: 0.654 },
};

// Contornos (path data relativo, 2 decimales). Generados en el scratch del agente "brand" — no editar a mano.
const D_LETRA: Record<LetraHandy, string> = {
  H: 'm0 9.28h46.11v50.88h34.63v-50.88h46.12v144.12h-46.12v-50.88h-34.63v50.88h-46.11z',
  a: 'm275.37 153.4h-23.13l-12.96-12.96c-10.02 9.61-21.22 14.68-35.03 16.2c-11.71 1.28-28.9-1.13-37.55-9.79c-8.66-8.68-10.63-23.32-8.95-35c1.71-11.9 8.52-20.91 19.07-26.49c8.23-4.34 23.85-7.73 33.03-7.88l19.39-.32v-8.15l-12.32-.64c-.96-.05-6.89 .2-8.18 .27c-8.78 .46-17.79 1.1-26.34 3.3l-10.16 2.62l-5.56-33.07l13.5-3.24c9.27-2.23 27.23-3.6 36.94-3.6c19.32 0 44.82 1.65 54.65 21.31c1.77 3.54 3.59 10 3.59 13.83zm-46.13-49.37h-12.2c-2.17 0-4.82 .41-6.93 .91c-3.51 .83-6.25 3.4-6.25 7.23v11.1h12.14c2.75 0 5.86-.37 8.46-1.33c2.58-.95 4.78-3.63 4.78-6.52z',
  n: 'm426.86 153.4h-46.24v-80.76h-8.6c-4.61 0-14.4 .97-14.4 7.33l-.01 73.43h-46.12v-115.37h22.86l11.66 11.63c12.37-8.28 23.84-13.38 38.86-14.71c15.05-1.33 35.01 1.09 40.68 17.7c.65 1.88 1.31 5.11 1.31 7.07z',
  d: 'm578.37 0v153.4h-23.05l-10.1-9.48c-6.26 7.59-14.27 10.71-23.81 12.15c-35.71 5.4-57.86-12.76-61.28-48.41c-2.23-23.25 .57-53.17 24.03-64.97c5.54-2.78 12.92-4.63 19.07-4.64l28.88-.04v-34.54zm-46.26 68.27h-10.24c-2.83 0-6.83 .56-9.34 1.93c-1.9 1.04-3.41 3.89-3.41 6.01l-.01 47.06h9.87c2.84 0 7.29-.39 9.72-1.9c1.61-1 3.41-3.76 3.41-5.61z',
  y: 'm605.21 38.03h46.14l12.6 74.34c.13 .79 2.41 .73 2.6-.41l12.53-73.93h46.16l-29.51 117.99c-.21 .85-1.85 5.6-2.24 6.63c-6.29 16.51-13.8 26.07-32.17 28.36c-1.68 .21-3.51 .51-5.18 .51h-48.65v-29.93l25.45-5.08c.97-.19 6.06-1.78 7.28-2.18c8.26-2.72 12.07-4.93 16.18-12.81h-25.41z',
};

const D_BAJADA: ReadonlyArray<{ id: 'soluciones' | 'no' | 'problemas'; d: string }> = [
  { id: 'soluciones', d: 'm25.68 223.76q0 .22-.31 1.67q-.32 1.45-.66 2.92q-.34 1.47-.47 1.79q-.19 .64-.5 1.11q-.32 .48-1.09 .48q-.5 0-1.09-.23q-1.72-.59-3.46-.97q-1.75-.39-3.6-.39q-2.27 0-4.51 .64q-2.24 .63-3.74 2.17q-1.49 1.54-1.49 4.26q0 3.39 1.72 5.59q1.72 2.2 4.42 3.76q2.69 1.56 5.73 3.08q3.03 1.52 5.73 3.58q2.69 2.06 4.41 5.18q1.72 3.13 1.72 8.02q0 6.7-3.17 10.69q-3.17 3.99-8.33 5.75q-5.17 1.77-11.1 1.77q-1.77 0-4.19-.2q-2.42-.21-4.8-.64q-2.38-.43-4.01-1.06q-.54-.23-.9-.55q-.37-.31-.37-.99q0-.27 .37-1.79q.36-1.52 .77-3.06q.4-1.54 .49-1.9q.23-.64 .53-1.04q.29-.41 1.06-.41q.45 0 .86 .13q2.22 .64 4.51 1.09q2.28 .45 4.59 .45q2.86 0 5.51-.79q2.65-.79 4.35-2.69q1.69-1.9 1.69-5.21q0-3.76-1.76-6.05q-1.77-2.29-4.53-3.85q-2.76-1.56-5.87-2.99q-3.1-1.42-5.86-3.33q-2.77-1.9-4.53-4.93q-1.77-3.04-1.77-7.88q0-6.03 2.86-9.72q2.85-3.69 7.51-5.41q4.67-1.72 10.01-1.72q2.68 0 6.16 .5q3.49 .49 5.94 1.58q.54 .23 .86 .57q.31 .34 .31 1.02m18.11 39.85q0-6.29 2.7-11.23q2.69-4.94 7.54-7.81q4.84-2.88 11.18-2.88q6.25 0 10.92 2.83q4.66 2.83 7.27 7.72q2.6 4.9 2.6 11.01q0 6.3-2.58 11.17q-2.58 4.86-7.27 7.63q-4.69 2.76-11.12 2.76q-6.38 0-11.16-2.65q-4.78-2.65-7.43-7.4q-2.65-4.76-2.65-11.15m21.2-12.77q-3.45 0-5.76 1.84q-2.3 1.83-3.48 4.68q-1.18 2.86-1.18 5.98q0 2.95 1.25 5.66q1.24 2.72 3.55 4.44q2.31 1.72 5.48 1.72q3.44 0 5.73-1.74q2.29-1.74 3.44-4.51q1.16-2.76 1.16-5.89q0-3.03-1.16-5.82q-1.15-2.78-3.42-4.57q-2.26-1.79-5.61-1.79m37.9-30.35q0-1.85 1.85-1.85h7.16q1.86 0 1.86 1.85q0 7.7-.05 15.4q-.04 7.7-.04 15.4q0 7.7 .04 15.4q.05 7.7 .05 15.4q0 1.86-1.86 1.86h-7.16q-1.85 0-1.85-1.86q0-7.7 .04-15.4q.05-7.7 .05-15.4q0-7.7-.05-15.4q-.04-7.7-.04-15.4m70.14 63.46h-6.2q-1.59 0-1.86-1.63q-.13-.91-.25-1.83q-.11-.93-.2-1.84q0-.14-.09-.47q-.09-.34-.32-.34q-.18 0-.38 .2q-.21 .2-.3 .34q-2.99 3.44-7.27 4.94q-4.28 1.49-8.76 1.49q-3.67 0-7.09-1.29q-3.42-1.29-5.62-3.96q-2.19-2.68-2.19-6.8q0-5.25 .06-10.53q.07-5.27 .07-10.48v-7.02q0-1.86 1.86-1.86h6.97q1.86 0 1.86 1.86v7.11q0 4.25-.04 8.56q-.05 4.3 0 8.6q.09 3.58 2.33 5.05q2.24 1.48 5.5 1.48q4.08 0 6.93-2.18q2.85-2.17 4.37-5.59q1.52-3.42 1.52-7.14v-15.89q0-1.86 1.86-1.86h6.93q1.85 0 1.85 1.86q0 1.94-.02 3.89q-.02 1.95-.02 3.9q0 4.98 .07 10.01q.06 5.02 .11 10.01q.04 2.35 .11 4.73q.07 2.38 .07 4.78q0 1.9-1.86 1.9m46.78-10.42q.63 0 .97 .41q.34 .41 .57 .91q.18 .36 .72 1.76q.55 1.41 1.02 2.77q.48 1.35 .48 1.63q0 .99-1.56 1.72q-1.57 .72-3.74 1.17q-2.17 .46-4.12 .66q-1.95 .21-2.77 .21q-9.55 0-14.9-5.67q-5.34-5.66-5.34-15.08q0-6.29 2.47-11.32q2.47-5.03 7.13-7.97q4.67-2.95 11.19-2.95q2.53 0 5.48 .57q2.94 .56 5.16 1.79q.46 .22 .75 .52q.29 .29 .29 .84q0 .45-.22 .9l-2.09 5.26q-.49 1.26-1.58 1.26q-.45 0-1-.22q-1.49-.5-2.99-.84q-1.49-.34-3.08-.34q-5.48 0-8.13 3.44q-2.65 3.44-2.65 8.56q0 4.94 2.52 8.31q2.51 3.38 7.81 3.38q1.72 0 3.31-.41q1.58-.41 3.17-1q.27-.09 .54-.18q.27-.09 .59-.09m19.83-46.11q0-2.49 1.85-4.28q1.86-1.78 4.35-1.78q2.54 0 4.46 1.83q1.93 1.83 1.93 4.42q0 2.49-1.84 4.32q-1.83 1.84-4.37 1.84q-2.58 0-4.48-1.88q-1.9-1.88-1.9-4.47m.68 27.32v-10.01q0-1.86 1.85-1.86h6.98q1.85 0 1.85 1.86q0 9.33 .05 18.68q.05 9.35 .05 18.68q0 1.86-1.86 1.86h-7.16q-1.86 0-1.86-1.86q0-6.84 .05-13.68q.05-6.83 .05-13.67m27.7 8.87q0-6.29 2.7-11.23q2.69-4.94 7.54-7.81q4.85-2.88 11.19-2.88q6.25 0 10.91 2.83q4.67 2.83 7.27 7.72q2.61 4.9 2.61 11.01q0 6.3-2.59 11.17q-2.58 4.86-7.26 7.63q-4.69 2.76-11.12 2.76q-6.39 0-11.17-2.65q-4.78-2.65-7.43-7.4q-2.65-4.76-2.65-11.15m21.2-12.77q-3.44 0-5.75 1.84q-2.31 1.83-3.49 4.68q-1.18 2.86-1.18 5.98q0 2.95 1.25 5.66q1.24 2.72 3.55 4.44q2.31 1.72 5.48 1.72q3.45 0 5.73-1.74q2.29-1.74 3.45-4.51q1.15-2.76 1.15-5.89q0-3.03-1.15-5.82q-1.16-2.78-3.42-4.57q-2.27-1.79-5.62-1.79m39.57-7.97h6.12q1.68 0 1.86 1.63q.13 .91 .22 1.81q.09 .91 .18 1.81q0 .09 .09 .52q.1 .43 .32 .43q.23 0 .43-.27q.21-.27 .3-.4q2.71-3.49 6.61-5.03q3.89-1.54 8.2-1.54q3.53 0 6.5 1.47q2.96 1.47 4.78 4.17q1.81 2.69 1.81 6.41q0 7.02 .16 14.08q.15 7.07 .15 14.09q0 1.9-1.85 1.9h-7.11q-1.73 0-1.86-1.86q-.14-1.94-.09-3.91q.04-1.98 0-3.92q-.05-4.17-.05-8.29q0-4.12 0-8.24q0-3.22-1.85-4.83q-1.86-1.61-4.94-1.61q-3.85 0-6.32 2.36q-2.47 2.35-3.67 5.8q-1.2 3.44-1.2 6.75q0 3.98-.04 7.94q-.05 3.97-.09 7.95q0 1.86-1.86 1.86h-7.11q-1.86 0-1.86-1.9q0-2.54 .07-5.05q.07-2.52 .11-5.01q.14-10.6 .14-21.19v-6.07q0-1.86 1.85-1.86m76.04 42.17q-6.61 0-11.53-2.63q-4.91-2.63-7.63-7.47q-2.72-4.85-2.72-11.51q0-6.2 2.59-11.14q2.58-4.94 7.29-7.81q4.71-2.88 11.05-2.88q7.83 0 12.3 4.39q4.46 4.4 6.04 11.69q.05 .14 .05 .45q0 .68-.34 1.02q-.34 .34-.88 .57q-1.54 .72-3.27 1.27q-1.72 .54-3.35 1.17q-4.75 1.77-9.55 3.47q-4.81 1.7-9.52 3.6q-.36 .18-.36 .45q0 .14 .09 .32q1.81 3.26 4.98 4.85q3.18 1.58 6.8 1.58q2.85 0 5.32-.9q2.47-.91 4.87-2.27q.32-.18 .63-.32q.32-.13 .64-.13q.63 0 .97 .38q.34 .39 .57 .89q.18 .31 .7 1.42q.52 1.11 1 2.22q.47 1.11 .47 1.43q0 .5-.27 .81q-.27 .32-.63 .59q-3.22 2.22-7.82 3.35q-4.59 1.14-8.49 1.14m-11.37-22.06q4.58-1.59 9.15-3.17q4.58-1.59 9.1-3.17q-1.13-2.49-3.14-4.35q-2.02-1.86-4.96-1.86q-3.44 0-5.71 1.86q-2.26 1.86-3.35 4.73q-1.09 2.88-1.09 5.96m53.98 22.15q-2.58 0-5.39-.95q-2.81-.95-4.67-2.86q-.54-.54-.54-1.17q0-.28 .3-1.39q.29-1.11 .65-2.28q.36-1.18 .45-1.54q.19-.55 .5-1.07q.32-.52 1-.52q.86 0 2.67 1.13q1.81 1.14 4.17 1.14q4.12 0 4.12-3.99q0-2.58-1.65-3.58q-1.66-.99-3.56-1.99q-3.8-2.04-5.8-4.98q-1.99-2.95-1.99-7.34q0-5.57 3.29-8.7q3.28-3.12 8.76-3.12q.68 0 2.11 .18q1.42 .18 2.96 .57q1.54 .38 2.63 1.04q1.09 .65 1.09 1.56q0 .86-.37 1.88q-.36 1.02-.58 1.88q-.19 .59-.5 1.13q-.32 .54-1.09 .54q-.95 0-2.04-.49q-1.09-.5-2.35-.5q-1.72 0-3.04 1.02q-1.31 1.02-1.31 2.87q0 2.13 1.29 3.31q1.29 1.18 3.19 2.08q1.9 .91 3.81 2.22q1.9 1.32 3.19 3.65q1.29 2.33 1.29 6.41q0 5.8-3.24 9.83q-3.24 4.03-9.35 4.03m34.37-9.6h5.75q.63 0 1.36 .2q.72 .2 .72 1.06q0 .37-.13 .73q-.14 .36-.32 .72q-1.18 2.4-2.45 4.78q-1.27 2.38-2.53 4.78q-.91 1.72-1.79 3.46q-.89 1.75-1.93 3.42q-.54 .96-1.63 .96h-4.98q-.64 0-1.36-.21q-.72-.2-.72-1.06q0-.36 .13-.75q.14-.38 .32-.7q1.18-2.54 2.42-5.03q1.25-2.49 2.47-4.98q.77-1.59 1.47-3.19q.7-1.61 1.52-3.15q.54-1.04 1.68-1.04' },
  { id: 'no', d: 'm540.35 242.87h6.11q1.68 0 1.86 1.63q.13 .91 .22 1.81q.09 .91 .19 1.81q0 .09 .09 .52q.09 .43 .31 .43q.23 0 .43-.27q.21-.27 .3-.4q2.72-3.49 6.61-5.03q3.9-1.54 8.2-1.54q3.53 0 6.5 1.47q2.96 1.47 4.78 4.17q1.81 2.69 1.81 6.41q0 7.02 .16 14.08q.16 7.07 .16 14.09q0 1.9-1.86 1.9h-7.11q-1.72 0-1.86-1.86q-.14-1.94-.09-3.91q.04-1.98 0-3.92q-.05-4.17-.05-8.29q0-4.12 0-8.24q0-3.22-1.85-4.83q-1.86-1.61-4.94-1.61q-3.85 0-6.32 2.36q-2.47 2.35-3.67 5.8q-1.2 3.44-1.2 6.75q0 3.98-.04 7.94q-.05 3.97-.09 7.95q0 1.86-1.86 1.86h-7.11q-1.86 0-1.86-1.9q0-2.54 .07-5.05q.07-2.52 .11-5.01q.14-10.6 .14-21.19v-6.07q0-1.86 1.86-1.86m54.15 20.74q0-6.29 2.7-11.23q2.69-4.94 7.54-7.81q4.85-2.88 11.19-2.88q6.25 0 10.91 2.83q4.67 2.83 7.27 7.72q2.61 4.9 2.61 11.01q0 6.3-2.58 11.17q-2.59 4.86-7.27 7.63q-4.69 2.76-11.12 2.76q-6.39 0-11.17-2.65q-4.78-2.65-7.43-7.4q-2.65-4.76-2.65-11.15m21.2-12.77q-3.44 0-5.75 1.84q-2.31 1.83-3.49 4.68q-1.18 2.86-1.18 5.98q0 2.95 1.25 5.66q1.25 2.72 3.56 4.44q2.31 1.72 5.48 1.72q3.44 0 5.73-1.74q2.28-1.74 3.44-4.51q1.15-2.76 1.15-5.89q0-3.03-1.15-5.82q-1.16-2.78-3.42-4.57q-2.27-1.79-5.62-1.79' },
  { id: 'problemas', d: 'm709.98 284.81q-3.44 0-6.59-1.09q-3.15-1.08-5.82-3.35q-.14-.09-.3-.25q-.15-.16-.38-.16q-.23 0-.27 .34q-.05 .34-.05 .48q-.09 2.94-.09 5.96q0 3.01-.09 5.95q0 1.09 .02 2.24q.03 1.16-.06 2.25q-.09 .9-.48 1.35q-.38 .46-1.38 .46h-7.29q-1.82 0-1.82-1.91q0-3.48 .16-7.02q.16-3.53 .25-6.97q.18-7.38 .27-14.74q.09-7.36 .09-14.75q0-2.22-.02-4.43q-.02-2.22-.02-4.44q0-1.86 1.86-1.86h5.84q1.4 0 1.74 1.13q.34 1.13 .39 2.24q.04 1.11 .54 1.11q.18 0 .5-.22q3.31-2.54 6.88-3.94q3.58-1.41 7.79-1.41q6.39 0 10.74 2.99q4.35 2.99 6.57 7.97q2.22 4.99 2.22 10.92q0 6.48-2.61 11.23q-2.6 4.76-7.36 7.34q-4.75 2.58-11.23 2.58m-2.13-9.28q3.44 0 6.27-1.59q2.83-1.59 4.53-4.33q1.7-2.74 1.7-6.18q0-5.39-3.49-8.85q-3.48-3.47-8.87-3.47q-3.85 0-6.84 1.95q-2.99 1.95-4.35 5.57q0 2.27-.02 4.53q-.03 2.27-.03 4.53q0 .23 .3 .95q.29 .73 .38 .95q1.45 2.95 4.35 4.44q2.9 1.5 6.07 1.5m41.75-32.66h6.07q1.72 0 1.86 1.68l.45 5.16q0 .04 .09 .66q.09 .61 .32 .61q.22 0 .47-.5q.25-.5 .3-.59q1.85-3.49 4.52-5.48q2.68-1.99 6.75-1.99q.95 0 2.43 .15q1.47 .16 1.47 1.52q0 .68-.27 2.13q-.27 1.45-.61 2.92q-.34 1.47-.53 2.24q-.18 .77-.56 1.2q-.39 .43-1.29 .43q-.46 0-.89-.06q-.43-.07-.92-.07q-3.58 0-6.03 2.24q-2.44 2.24-3.67 5.5q-1.22 3.27-1.22 6.44v15.03q0 1.86-1.86 1.86h-7.02q-1.85 0-1.85-1.9q0-7.02 .06-14.02q.07-7 .07-13.97v-9.33q0-1.86 1.86-1.86m36.72 20.74q0-6.29 2.69-11.23q2.7-4.94 7.55-7.81q4.84-2.88 11.18-2.88q6.25 0 10.92 2.83q4.66 2.83 7.27 7.72q2.6 4.9 2.6 11.01q0 6.3-2.58 11.17q-2.58 4.86-7.27 7.63q-4.69 2.76-11.12 2.76q-6.38 0-11.16-2.65q-4.78-2.65-7.43-7.4q-2.65-4.76-2.65-11.15m21.2-12.77q-3.45 0-5.76 1.84q-2.31 1.83-3.48 4.68q-1.18 2.86-1.18 5.98q0 2.95 1.25 5.66q1.24 2.72 3.55 4.44q2.31 1.72 5.48 1.72q3.44 0 5.73-1.74q2.29-1.74 3.44-4.51q1.16-2.76 1.16-5.89q0-3.03-1.16-5.82q-1.15-2.78-3.42-4.57q-2.26-1.79-5.61-1.79m81.88 12.68q0 5.85-2.45 10.69q-2.45 4.85-6.93 7.72q-4.48 2.88-10.6 2.88q-7.38 0-12.64-4.66q-.13-.1-.29-.25q-.16-.16-.39-.16q-.22 0-.27 .34q-.04 .34-.04 .47q0 1.09-.09 2.25q-.09 1.15-1.68 1.15h-7.25q-1.85 0-1.85-1.9q0-2.49 .07-4.96q.06-2.47 .11-4.96q.09-5.21 .13-10.42q.05-5.21 .05-10.42q0-5.2-.05-10.41q-.04-5.21-.13-10.42q-.05-2.49-.11-4.96q-.07-2.47-.07-4.96q0-1.9 1.85-1.9h7.02q1.09 0 1.43 .45q.34 .45 .43 1.4q.18 1.45 .12 3.95q-.07 2.49-.03 4.12q.05 4.25 .07 8.47q.02 4.21 .02 8.47q0 .18 .05 .45q.04 .27 .32 .27q.22 0 .58-.27q5.89-4.17 13.09-4.17q6.44 0 10.76 2.92q4.33 2.93 6.55 7.86q2.22 4.94 2.22 10.96m-22.11 11.28q3.35 0 5.89-1.68q2.54-1.67 3.96-4.43q1.43-2.77 1.43-5.98q0-3.26-1.4-6.05q-1.41-2.78-3.92-4.51q-2.52-1.72-5.96-1.72q-3.08 0-5.91 1.34q-2.83 1.34-4.46 4.05q-.18 .32-.54 1.04q-.37 .73-.46 1.09q-.09 .55-.04 1.27q.04 .72 .04 1.31q0 1.72 0 3.47q0 1.74-.04 3.46q1.45 3.72 4.48 5.53q3.04 1.81 6.93 1.81m39.03-54.31q0-1.85 1.86-1.85h7.16q1.85 0 1.85 1.85q0 7.7-.04 15.4q-.05 7.7-.05 15.4q0 7.7 .05 15.4q.04 7.7 .04 15.4q0 1.86-1.85 1.86h-7.16q-1.86 0-1.86-1.86q0-7.7 .05-15.4q.04-7.7 .04-15.4q0-7.7-.04-15.4q-.05-7.7-.05-15.4m49.63 64.55q-6.61 0-11.52-2.63q-4.92-2.63-7.64-7.47q-2.71-4.85-2.71-11.51q0-6.2 2.58-11.14q2.58-4.94 7.29-7.81q4.71-2.88 11.05-2.88q7.84 0 12.3 4.39q4.46 4.4 6.05 11.69q.04 .14 .04 .45q0 .68-.34 1.02q-.34 .34-.88 .57q-1.54 .72-3.26 1.27q-1.72 .54-3.36 1.17q-4.75 1.77-9.55 3.47q-4.8 1.7-9.51 3.6q-.37 .18-.37 .45q0 .14 .09 .32q1.82 3.26 4.99 4.85q3.17 1.58 6.79 1.58q2.85 0 5.32-.9q2.47-.91 4.87-2.27q.32-.18 .64-.32q.31-.13 .63-.13q.63 0 .97 .38q.34 .39 .57 .89q.18 .31 .7 1.42q.52 1.11 1 2.22q.47 1.11 .47 1.43q0 .5-.27 .81q-.27 .32-.63 .59q-3.22 2.22-7.81 3.35q-4.6 1.14-8.5 1.14m-11.37-22.06q4.58-1.59 9.15-3.17q4.58-1.59 9.11-3.17q-1.14-2.49-3.15-4.35q-2.02-1.86-4.96-1.86q-3.44 0-5.71 1.86q-2.26 1.86-3.35 4.73q-1.09 2.88-1.09 5.96m47.78-20.11h6.16q1.54 0 1.81 1.63q.09 .36 .18 1.45q.09 1.09 .25 2.04q.16 .95 .43 .95q.23 0 .41-.21q.18-.2 .27-.33q2.99-3.58 6.86-5.1q3.87-1.52 8.45-1.52q3.71 0 7.22 1.36q3.51 1.36 5.19 4.98q.09 .14 .18 .37q.09 .22 .32 .22q.18 0 .31-.16q.14-.15 .23-.25q2.81-3.08 6.52-4.77q3.72-1.7 7.88-1.7q5.53 0 9.54 3.05q4.01 3.06 4.01 9q0 4.75 .09 9.53q.09 4.78 .18 9.53q.09 2.27 .2 4.56q.11 2.28 .11 4.55q0 1.9-1.85 1.9h-7.07q-1 0-1.38-.45q-.39-.46-.48-1.36q-.18-1.9-.13-3.87q.04-1.97-.05-3.88q-.04-4.07-.11-8.15q-.07-4.08-.07-8.15q0-3.17-1.52-4.96q-1.51-1.79-4.77-1.79q-3.76 0-6.39 2.31q-2.63 2.31-4.01 5.73q-1.38 3.42-1.38 6.72q0 3.99 .05 7.98q.04 3.98 .04 8.01q0 1.86-1.86 1.86h-7.15q-1.86 0-1.86-1.86q0-6.02 .09-12q.09-5.98 0-12q-.04-3.04-1.52-4.89q-1.47-1.86-4.68-1.86q-3.85 0-6.48 2.29q-2.63 2.28-3.99 5.73q-1.36 3.44-1.45 6.84q-.04 2.76-.09 5.52q-.04 2.76-.13 5.57q0 1.18 .02 2.43q.02 1.24-.11 2.42q-.09 .9-.48 1.36q-.38 .45-1.38 .45h-7.11q-1.86 0-1.86-1.95q0-2.35 .11-4.69q.12-2.33 .16-4.68q.28-9.92 .28-19.8q0-1.85-.1-4.07q-.09-2.22 .05-4.03q.14-1.86 1.86-1.86m101.12 41.94q-5.88 0-9.87-2.81q-3.99-2.81-6-7.45q-2.02-4.64-2.02-10.08v-.72q.09-5.71 2.38-10.74q2.29-5.02 6.64-8.13q4.35-3.1 10.5-3.1q3.81 0 7.09 1.43q3.29 1.43 6.14 3.87q.32 .32 .54 .32q.55 0 .52-1.13q-.02-1.14 .32-2.27q.34-1.13 1.79-1.13h6.39q1.85 0 1.85 1.86q0 1.94-.02 3.89q-.02 1.95-.02 3.9q0 4.98 .07 10.01q.06 5.02 .11 10.01q.05 2.35 .11 4.73q.07 2.38 .07 4.78q0 1.9-1.86 1.9h-7.11q-1.22 0-1.58-.79q-.36-.8-.32-1.88q.05-1.09 0-1.95q0-.14-.04-.45q-.05-.32-.28-.32q-.18 0-.34 .14q-.15 .13-.29 .22q-3.17 2.67-6.84 4.28q-3.67 1.61-7.93 1.61m4.62-9.65q3.22 0 5.96-1.33q2.74-1.34 4.28-4.24q.09-.18 .43-.93q.34-.74 .34-.92q0-1.59-.02-3.18q-.02-1.58-.02-3.12q0-.73 .04-1.61q.05-.88-.04-1.56q-.05-.32-.34-.95q-.3-.64-.43-.91q-1.59-2.85-4.49-4.26q-2.9-1.4-6.07-1.4q-3.35 0-5.89 1.68q-2.53 1.67-3.96 4.41q-1.43 2.74-1.43 6q0 3.26 1.5 6.07q1.49 2.81 4.14 4.53q2.65 1.72 6 1.72m48.68 9.97q-2.58 0-5.39-.95q-2.81-.95-4.66-2.86q-.55-.54-.55-1.17q0-.28 .3-1.39q.29-1.11 .66-2.28q.36-1.18 .45-1.54q.18-.55 .5-1.07q.31-.52 .99-.52q.86 0 2.68 1.13q1.81 1.14 4.16 1.14q4.12 0 4.12-3.99q0-2.58-1.65-3.58q-1.65-.99-3.55-1.99q-3.81-2.04-5.8-4.98q-2-2.95-2-7.34q0-5.57 3.29-8.7q3.28-3.12 8.76-3.12q.68 0 2.11 .18q1.43 .18 2.97 .57q1.54 .38 2.62 1.04q1.09 .65 1.09 1.56q0 .86-.36 1.88q-.37 1.02-.59 1.88q-.18 .59-.5 1.13q-.32 .54-1.09 .54q-.95 0-2.04-.49q-1.08-.5-2.35-.5q-1.72 0-3.03 1.02q-1.32 1.02-1.32 2.87q0 2.13 1.29 3.31q1.29 1.18 3.2 2.08q1.9 .91 3.8 2.22q1.9 1.32 3.19 3.65q1.29 2.33 1.29 6.41q0 5.8-3.23 9.83q-3.24 4.03-9.36 4.03' },
];

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, ch => ESC[ch] ?? ch);
const num = (v: number) => String(+v.toFixed(2));

/** Variante de lockup que corresponde a la opción tagline. */
export function varianteLogo(tagline: BajadaLogo = true): VarianteLogo {
  return tagline === 'compacta' ? 'compacta' : tagline ? 'amplia' : 'palabra';
}

/** Alto en px de un logo dibujado con `width` px de ancho. */
export function logoAlto(width: number, tagline: BajadaLogo = true): number {
  const vb = LOGO_INFO.viewBox[varianteLogo(tagline)];
  return (width * vb.h) / vb.w;
}

/** Caja en px (relativa a la esquina superior izquierda del <svg>) de una parte del logo dibujado con `width` px de ancho.
    Sirve para alinear el wordmark del escenario con el del encabezado, o para ubicar cada letra. */
export function logoCaja(parte: LetraHandy | 'palabra' | 'bajada', width: number, tagline: BajadaLogo = true): Caja {
  const v = varianteLogo(tagline), vb = LOGO_INFO.viewBox[v], k = width / vb.w;
  const b = parte === 'palabra' ? LOGO_INFO.palabra : parte === 'bajada' ? (v === 'palabra' ? null : LOGO_INFO.bajada[v]) : LOGO_INFO.letras[parte];
  if (!b) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: (b.x - vb.x) * k, y: (b.y - vb.y) * k, w: b.w * k, h: b.h * k };
}

/** Desplazamiento x/y (unidades del viewBox, para gsap.set/to sobre g.hd-logo-letra) que lleva la letra al punto
    `punto` del escenario. `logo`: esquina superior izquierda y ancho del <svg> en px del escenario (antes de animarlo).
    ancla 'centro' (default): el centro de la caja de la letra cae en el punto.
    ancla 'base': el punto es el medio de la letra sobre la línea de base (todas las letras quedan apoyadas en la misma
    línea aunque la "y" tenga descendente y la "H" y la "d" sean más altas). */
export function letraHacia(
  letra: LetraHandy,
  logo: { x: number; y: number; width: number; tagline?: BajadaLogo },
  punto: { x: number; y: number },
  ancla: 'centro' | 'base' = 'centro',
): { x: number; y: number } {
  const vb = LOGO_INFO.viewBox[varianteLogo(logo.tagline ?? true)], k = logo.width / vb.w, b = LOGO_INFO.letras[letra];
  const ay = ancla === 'base' ? LOGO_INFO.lineaBase.palabra : b.y + b.h / 2;
  const cx = logo.x + (b.x + b.w / 2 - vb.x) * k, cy = logo.y + (ay - vb.y) * k;
  return { x: (punto.x - cx) / k, y: (punto.y - cy) / k };
}

/** Caja de un logo dibujado: esquina superior izquierda y ancho del <svg> (px del escenario) y su variante. */
export interface LogoEnEscena { x: number; y: number; width: number; tagline?: BajadaLogo }

/** FLIP del wordmark: x/y/scale (px del escenario) para gsap.to sobre el CONTENEDOR del <svg> `desde` (un elemento HTML
    del mismo tamaño y posición que el <svg>, con transformOrigin '0 0') que deja su wordmark exactamente encima del
    wordmark del logo `hacia`. Junto con LOGO_INFO.bajadaCompacta lleva el logo amplio del escenario al del encabezado. */
export function palabraHacia(desde: LogoEnEscena, hacia: LogoEnEscena): { x: number; y: number; scale: number } {
  const a = logoCaja('palabra', desde.width, desde.tagline ?? true), b = logoCaja('palabra', hacia.width, hacia.tagline ?? true);
  const scale = b.w / a.w;
  return { x: hacia.x + b.x - desde.x - scale * a.x, y: hacia.y + b.y - desde.y - scale * a.y, scale };
}

export function handyLogo({ tagline = true, color = COLORS.azul, width, className = '', split = false }: LogoOptions = {}): string {
  const v = varianteLogo(tagline), vb = LOGO_INFO.viewBox[v];
  const size = width ? ` width="${num(width)}" height="${num((width * vb.h) / vb.w)}"` : '';
  const letras = LETRAS.map(l => (split
    ? `<g class="hd-logo-letra" data-letra="${l}"><path d="${D_LETRA[l]}"/></g>`
    : `<path data-letra="${l}" d="${D_LETRA[l]}"/>`)).join('');
  let bajada = '';
  if (v !== 'palabra') {
    const paths = D_BAJADA.map(p => `<path class="hd-logo-bajada-palabra" data-palabra="${p.id}" d="${p.d}"/>`).join('');
    const t = LOGO_INFO.bajadaCompacta;
    bajada = `<g class="hd-logo-bajada">${v === 'compacta' ? `<g transform="matrix(${t.scale} 0 0 ${t.scale} ${t.x} ${t.y})">${paths}</g>` : paths}</g>`;
  }
  const cls = 'hd-logo' + (className ? ' ' + esc(className) : '');
  const label = v === 'palabra' ? 'Handy' : 'Handy. Soluciones, no problemas';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" data-bajada="${v === 'palabra' ? 'no' : v}" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}"${size}`
    + ` fill="${esc(color)}" overflow="visible" role="img" aria-label="${label}">`
    + `<g class="hd-logo-palabra">${letras}</g>${bajada}</svg>`;
}
