/* Dedo que toca la pantalla: mano de dibujo (derecha, vista de dorso, índice estirado) en estilo plano con contorno oscuro
   del mismo tono, como los Handys, y una puñera azul Handy. Entra desde abajo a la derecha.
   finger({ id, className }) → string <div class="hd-dedo">: contenedor de 0×0 cuya esquina (0,0) es la YEMA del índice,
   así el x/y del .hd-dedo es la posición de la yema en su contenedor (stage o .hd-telefono). Escalarlo (scale) lo agranda
   alrededor de la yema. Mano ≈ 200×240 px.
   Hijos: .hd-dedo-onda (anillo azul centrado en la yema, apagado: opacity 0) y .hd-dedo-mano (la mano; su
   transform-origin es la yema). z-index 60.
   Ayudas de timeline (solo transform/opacity, tiempos absolutos; devuelven duraciones):
     prepararDedo(dedo, x?, y?)                       al construir: oculto (autoAlpha 0), opcionalmente ya en x/y
     entrarDedo(tl, dedo, x, y, at, { dur, dx, dy })  entra deslizándose desde (x+dx, y+dy) → duración
     tocar(tl, dedo, x, y, at, { viaje, mantener })   viaja en curva hasta x,y, aprieta (mano .9), onda, suelta
                                                      → { duracion, toque }: toque = momento absoluto del apretón
     salirDedo(tl, dedo, at, { dur, dx, dy })         sale hacia abajo a la derecha y se apaga → duración
     centro(el, ref) → { x, y }                       centro de `el` en coordenadas de `ref` (layout, sin transforms)
   Ejemplo: const t = tocar(D.tl, dedo, p.x, p.y, T + 2); D.tl.to(ficha, { scale: .94, … }, t.toque); D.sfx('tap', t.toque).
   Ganchos: .hd-dedo · .hd-dedo-mano · .hd-dedo-onda. */
import { gsap } from 'gsap';
import '../css/base.css';
import '../css/ui.css';

export interface FingerProps {
  id?: string;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

const PIEL = '#F7C8A2';
const LINEA = '#A9663F';
const UNA = '#FDE6D6';
const BRILLO = '#FFE3CC';
const PUNO = '#2F6BFF';
const PUNO_LINEA = '#1B48B8';

/* Mano en coordenadas locales: índice vertical, yema en (0,0) (el borde de la punta queda 10 px más arriba).
   Todo se rota -20° alrededor de la yema (la mano viene de abajo a la derecha). */
const FORMAS = [
  '<rect x="-38.75" y="-14" width="77.5" height="28" rx="14" transform="translate(-24 110) rotate(46.6)"/>', // pulgar
  '<rect x="-22" y="92" width="117" height="86" rx="32"/>', // palma
  '<rect x="-4" y="148" width="78" height="50" rx="8"/>', // muñeca
  '<rect x="68" y="84" width="27" height="46" rx="13.5"/>', // meñique (nudillo del dedo enroscado)
  '<rect x="42" y="70" width="31" height="52" rx="15.5"/>', // anular
  '<rect x="13" y="60" width="33" height="56" rx="16.5"/>', // mayor
  '<rect x="-17" y="-10" width="34" height="114" rx="17"/>', // índice
].join('');

const DETALLES = [
  // separaciones entre los nudillos de los dedos enroscados y el índice
  `<path d="M17 68v32M46 78v28M73 90v22" stroke="${LINEA}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`,
  // pliegue del pulgar contra la palma
  `<path d="M-17 96q7 10 18 18" stroke="${LINEA}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`,
  // uña
  `<path d="M-10.5 5a10.5 10.5 0 0 1 21 0v8.5a5 5 0 0 1-5 5h-11a5 5 0 0 1-5-5z" fill="${UNA}" stroke="${LINEA}" stroke-width="1.6" stroke-opacity=".45"/>`,
  // arrugas de los nudillos del índice
  `<path d="M-6.5 40q6.5 3.4 13 0M-6 66q6 3.2 12 0" stroke="${LINEA}" stroke-width="2.2" stroke-linecap="round" fill="none" stroke-opacity=".55"/>`,
  // brillo
  `<path d="M-10 28v20" stroke="${BRILLO}" stroke-width="4" stroke-linecap="round"/>`,
].join('');

const PUNERA = `<rect x="-17" y="184" width="104" height="40" rx="12" fill="${PUNO}" stroke="${PUNO_LINEA}" stroke-width="3.5"/>`
  + '<path d="M-5 197h80" stroke="#6E98FF" stroke-width="3" stroke-linecap="round"/>';

/** caja del svg en coordenadas de la mano (incluye la rotación); la yema (0,0) queda en (-VB_X, -VB_Y) del svg */
const VB_X = -40;
const VB_Y = -16;
const VB_W = 210;
const VB_H = 240;

const MANO = `<svg viewBox="${VB_X} ${VB_Y} ${VB_W} ${VB_H}" width="${VB_W}" height="${VB_H}" aria-hidden="true">`
  + '<g class="hd-dedo-dibujo"><g transform="rotate(-20)">'
  + `<g fill="${LINEA}" stroke="${LINEA}" stroke-width="7" stroke-linejoin="round">${FORMAS}</g>`
  + `<g fill="${PIEL}">${FORMAS}</g>`
  + DETALLES
  + PUNERA
  + '</g></g></svg>';

export function finger({ id, className = '' }: FingerProps = {}): string {
  const cls = ['hd-dedo', className].filter(Boolean).join(' ');
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''}>`
    + '<div class="hd-dedo-onda"></div>'
    + `<div class="hd-dedo-mano" style="left:${VB_X}px;top:${VB_Y}px;width:${VB_W}px;height:${VB_H}px;transform-origin:${-VB_X}px ${-VB_Y}px">${MANO}</div>`
    + '</div>';
}

const parte = (dedo: Element, sel: string) => dedo.querySelector<HTMLElement>(sel) ?? dedo;

/** Al construir la escena: dedo oculto (y, si se pasa, ya ubicado en x/y). */
export function prepararDedo(dedo: Element, x?: number, y?: number): void {
  gsap.set(dedo, x === undefined || y === undefined ? { autoAlpha: 0 } : { autoAlpha: 0, x, y });
  gsap.set(parte(dedo, '.hd-dedo-onda'), { opacity: 0, scale: 0 });
}

/** Entra desde abajo a la derecha (x+dx, y+dy) hasta la yema en x,y. Devuelve la duración. */
export function entrarDedo(
  tl: GSAPTimeline, dedo: Element, x: number, y: number, at: number,
  { dur = 0.7, dx = 150, dy = 260 }: { dur?: number; dx?: number; dy?: number } = {},
): number {
  tl.set(dedo, { x: x + dx, y: y + dy, autoAlpha: 0 }, at);
  tl.to(dedo, { autoAlpha: 1, duration: 0.2, ease: 'power1.out' }, at);
  tl.to(dedo, { x, y, duration: dur, ease: 'expo.out' }, at);
  return dur;
}

/** Viaja en una curva suave hasta x,y, aprieta (la mano baja a .9 desde la yema), larga la onda y suelta.
    Devuelve la duración del gesto y `toque`, el momento absoluto del apretón (para apretar el botón y el sonido). */
export function tocar(
  tl: GSAPTimeline, dedo: Element, x: number, y: number, at: number,
  { viaje = 0.55, mantener = 0.12 }: { viaje?: number; mantener?: number } = {},
): { duracion: number; toque: number } {
  const mano = parte(dedo, '.hd-dedo-mano');
  const onda = parte(dedo, '.hd-dedo-onda');
  if (viaje > 0) {
    // eases distintos en x e y → el recorrido se curva
    tl.to(dedo, { x, duration: viaje, ease: 'power2.inOut' }, at);
    tl.to(dedo, { y, duration: viaje, ease: 'power3.inOut' }, at);
    tl.to(mano, { rotation: -5, duration: viaje * 0.5, ease: 'sine.out' }, at);
    tl.to(mano, { rotation: 0, duration: viaje * 0.5, ease: 'sine.in' }, at + viaje * 0.5);
  } else {
    tl.set(dedo, { x, y }, at);
  }
  const toque = at + viaje;
  tl.to(mano, { scale: 0.9, duration: 0.08, ease: 'power2.out' }, toque);
  tl.set(onda, { scale: 0, opacity: 0.5 }, toque);
  tl.to(onda, { scale: 1, opacity: 0, duration: 0.5, ease: 'power2.out' }, toque);
  tl.to(mano, { scale: 1, duration: 0.2, ease: 'power2.out' }, toque + 0.08 + mantener);
  return { duracion: viaje + 0.08 + mantener + 0.2, toque };
}

/** Sale hacia abajo a la derecha y se apaga. Devuelve la duración. */
export function salirDedo(
  tl: GSAPTimeline, dedo: Element, at: number,
  { dur = 0.45, dx = 150, dy = 260 }: { dur?: number; dx?: number; dy?: number } = {},
): number {
  tl.to(dedo, { x: `+=${dx}`, y: `+=${dy}`, duration: dur, ease: 'power3.in' }, at);
  tl.to(dedo, { autoAlpha: 0, duration: dur * 0.6, ease: 'power1.in' }, at + dur * 0.4);
  return dur;
}

/** Centro de `el` en el sistema de coordenadas de `ref` (un ancestro posicionado, p. ej. el .hd-telefono o el escenario),
    medido con el layout (offsetLeft/Top): ignora los transforms, así sirve aunque la escena tenga cosas escondidas o
    escaladas al construir. Si `ref` no está en la cadena de offsetParent, usa los rects (corrigiendo la escala de `ref`). */
export function centro(el: HTMLElement, ref: HTMLElement): { x: number; y: number } {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let n: HTMLElement | null = el;
  while (n && n !== ref) {
    x += n.offsetLeft + (n !== el ? n.clientLeft : 0);
    y += n.offsetTop + (n !== el ? n.clientTop : 0);
    n = n.offsetParent as HTMLElement | null;
  }
  if (n === ref) return { x, y };
  const r = el.getBoundingClientRect();
  const R = ref.getBoundingClientRect();
  const k = ref.offsetWidth ? R.width / ref.offsetWidth : 1;
  return { x: (r.left + r.width / 2 - R.left) / k - ref.clientLeft, y: (r.top + r.height / 2 - R.top) / k - ref.clientTop };
}
