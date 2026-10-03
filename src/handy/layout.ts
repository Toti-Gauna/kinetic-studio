/* Composición compartida del escenario 1440×1080 de los tráileres de Handy.
   Las escenas de app dejan el teléfono en PHONE_HOME para que los cortes entre escenas sean invisibles. */
import { SCREEN, STAGE } from './tokens.ts';

/** Marco del teléfono alrededor de la pantalla de 414×896. */
export const PHONE = {
  bezel: 12,
  w: SCREEN.w + 24,
  h: SCREEN.h + 24,
  radius: 60,
  screenRadius: 48,
} as const;

/** Centro del teléfono en reposo (escenas de app): la columna izquierda queda para el titular. */
export const PHONE_HOME = { cx: 1030, cy: 540 } as const;

/** Columna del titular en las escenas de app. */
export const HEADLINE = { x: 110, w: 620 } as const;

/** Margen seguro del escenario. */
export const SAFE = 72;

/** Posición (x, y) de la esquina del teléfono en PHONE_HOME, para gsap.set(telefono, PHONE_XY) con el marco en left:0 top:0. */
export const PHONE_XY = { x: PHONE_HOME.cx - PHONE.w / 2, y: PHONE_HOME.cy - PHONE.h / 2 } as const;

/* ── sangrado ───────────────────────────────────────────────────────────────────────────────────────────────────────
   El escenario de 1440×1080 se escala para entrar entero en la pantalla (contain). En una pantalla 4:3 (el iPad a
   pantalla completa, el video exportado) llena todo; en una más ancha (el iPad con las barras de Safari, una compu
   16:10 o 16:9) o más alta (el iPad vertical) sobra pantalla a los costados o arriba y abajo: ese es el SANGRADO, y
   ahí se ve la película (src/handy/player.ts deja el escenario sin recortar hasta el borde de la pantalla). Así:
   - los fondos de pantalla completa (paneles de los golpes, destellos, capas de color) cubren también el sangrado;
   - lo que entra o sale "de afuera" arranca o termina más allá del sangrado (afuera()), no en el borde del 1440×1080:
     aparece desde el borde de la pantalla, no desde una línea en el medio.
   Se mide UNA vez, la primera vez que se pide (al construir la película) y queda fijo: si después la ventana se
   ensancha, lo que pase del sangrado medido queda tapado por el gris (como antes). En 4:3 vale { x: 0, y: 0 } y la
   película es exactamente la de siempre. Fuera de un tráiler (la galería de componentes: no hay #stage) también vale 0. */

/** Tope del sangrado medido (px del escenario), por si la pantalla es muy angosta o muy ancha. */
const SANGRADO_MAX = 1200;
let sangradoMedido: { x: number; y: number } | null = null;

/** Cuánto se ve del escenario fuera del cuadro de 1440×1080, de cada lado (px del escenario). Medido una vez. */
export function sangrado(): { readonly x: number; readonly y: number } {
  if (!sangradoMedido) {
    if (!document.getElementById('stage')) return (sangradoMedido = Object.freeze({ x: 0, y: 0 }));
    const { w, h } = escenario();
    const vw = window.innerWidth || w, vh = window.innerHeight || h;
    const s = Math.min(vw / w, vh / h);
    const lado = (v: number) => Math.min(SANGRADO_MAX, Math.max(0, Math.ceil(v)));
    sangradoMedido = Object.freeze({ x: lado((vw / s - w) / 2), y: lado((vh / s - h) / 2) });
  }
  return sangradoMedido;
}

/** El tamaño del escenario de la película: el que el engine anota en <html data-stage="WxH"> al arrancar (1440×1080
    en los tráileres para iPad; 1080×1920 el vertical, 1920×1080 el de anuncios). Antes de eso, STAGE. */
export function escenario(): { w: number; h: number } {
  const m = /^(\d+)x(\d+)$/.exec(document.documentElement.dataset.stage || '');
  return m ? { w: Number(m[1]), h: Number(m[2]) } : { w: STAGE.w, h: STAGE.h };
}

/** Los bordes de lo que se ve, en coordenadas del escenario: izq ≤ 0, der ≥ el ancho, arriba ≤ 0, abajo ≥ el alto. */
export function visible(): { izq: number; der: number; arriba: number; abajo: number } {
  const s = sangrado(), { w, h } = escenario();
  return { izq: -s.x, der: w + s.x, arriba: -s.y, abajo: h + s.y };
}

/** Cuánto hay que sumarle a una distancia "hasta el borde del cuadro" para que llegue al borde de lo que se ve:
    afuera('x') = sangrado().x (izquierda o derecha) · afuera('y') = sangrado().y (arriba o abajo). Ej.: un Handy que
    entraba desde x = −(left + ancho + 20) ahora entra desde −(left + ancho + 20 + afuera('x')). */
export function afuera(eje: 'x' | 'y'): number {
  return sangrado()[eje];
}
