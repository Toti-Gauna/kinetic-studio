/* Teclado numérico y monto grande de la hoja "Tu precio" (03…09-e-precio).
   teclado({ className }) → <div class="ap-teclado"> de 311,3 × 236,5: 4 filas × 3 teclas (1–9, 00, 0, ←). Cada tecla es
     blanca de 97,3 × 52,4 con canto gris #D3D6DC de 3,2 (radio 14), dígitos en Archivo 800 de 19,5 sin expandir (100 %),
     tinta; la de borrar va gris #ECECEC con la flecha. Columnas cada 107, filas cada 60,3. (En 09-e-precio-7 va en
     x 51,3 · y 658,5.)
   montoGrande({ valores, actual = 0, menosMas = true, ancho = 312 }) → el renglón "− $ 45.000 +": los botones redondos
     blancos de 53,5 (con canto) a los costados y en el medio los montos apilados, uno por valor (una celda de grilla: la
     fila mide lo del monto más ancho), solo el `actual` se ve (opacity 1). Escribir un monto es cruzar capas: ['$ 44.000',
     '$ 4', '$ 45', '$ 450', '$ 4.500', '$ 45.000']. Un valor que empieza con "!" sale rojo (monto demasiado bajo,
     05-e-precio) y con cursor. Montos en Archivo 900 de 41 al 110 % (azul; rojo #D93025).
     Como en las fotos, `ancho` es el MÍNIMO de la fila (312: 05-e-precio, "$ 4" centrado entre − y +); con un monto
     largo la fila crece hacia la derecha y deja 12,5 / 13 de aire a cada lado ("$ 44.000": el + sale de la caja, 03).
     acomodarMonto(el) (con el monto ya en el DOM) corre cada capa y el + para que cada valor quede como en su foto.
   Ganchos: .ap-tecla[data-tecla="1".."9"|"00"|"0"|"borrar"] · .ap-tecla-cara (apretar: y = 3,2) · .ap-tecla-canto ·
     .ap-monto · .ap-monto-valor[data-valor="i"] (opacity) · .ap-monto-cursor · .ap-monto-boton[data-boton="menos|mas"]
     (el + se corre con x según el valor).
   Ayudas: teclear(tl, teclado, '4', at) → duración (aprieta la tecla) · mostrarMonto(tl, monto, i, at) → cruza al valor i
     (y lleva el + a su lugar si acomodarMonto ya midió) · acomodarMonto(monto). */
import { gsap } from 'gsap';
import { icono } from '../iconos.ts';
import { cls, esc } from './comun.ts';
import '../css/teclado.css';

export const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'borrar'] as const;
export const TECLADO = { tecla: { w: 97.3, h: 52.4, canto: 3.2 }, paso: { x: 107, y: 60.3 } } as const;

export function teclado({ className = '' }: { className?: string } = {}): string {
  const teclas = TECLAS.map((t, i) => {
    const x = (i % 3) * TECLADO.paso.x, y = Math.floor(i / 3) * TECLADO.paso.y;
    const cara = t === 'borrar' ? icono('flecha-izq', { tam: 24, trazo: 2.2 }) : `<span class="ap-tecla-numero">${t}</span>`;
    return `<span class="ap-tecla" data-tecla="${t}" style="left:${x}px;top:${y}px">`
      + `<span class="ap-tecla-canto"></span><span class="ap-tecla-cara">${cara}</span></span>`;
  }).join('');
  return `<div class="${cls('ap-teclado', className)}">${teclas}</div>`;
}

/** Aprieta una tecla (la cara baja hasta tapar el canto y vuelve). Devuelve la duración. */
export function teclear(tl: GSAPTimeline, el: Element, tecla: string, at: number, dur = 0.18): number {
  const cara = el.querySelector(`.ap-tecla[data-tecla="${tecla}"] .ap-tecla-cara`);
  tl.to(cara, { y: TECLADO.tecla.canto, duration: dur * 0.4, ease: 'power2.out' }, at);
  tl.to(cara, { y: 0, duration: dur * 0.6, ease: 'power2.out' }, at + dur * 0.4);
  return dur;
}

export interface MontoProps {
  valores: readonly string[];
  actual?: number;
  /** botones − y + a los costados (default true) */
  menosMas?: boolean;
  ancho?: number;
  className?: string;
}

export function montoGrande({ valores, actual = 0, menosMas = true, ancho = 312, className = '' }: MontoProps): string {
  const capas = valores.map((v, i) => {
    const rojo = v.startsWith('!');
    const t = rojo ? v.slice(1) : v;
    return `<span class="ap-monto-valor" data-valor="${i}"${rojo ? ' data-tono="rojo"' : ''} style="opacity:${i === actual ? 1 : 0}">`
      + `${esc(t)}${rojo ? '<span class="ap-monto-cursor"></span>' : ''}</span>`;
  }).join('');
  const b = (q: 'menos' | 'mas') => `<span class="ap-monto-boton" data-boton="${q}"><span class="ap-monto-boton-canto"></span>`
    + `<span class="ap-monto-boton-cara">${icono(q, { tam: 22, trazo: 3.8 })}</span></span>`;
  return `<div class="${cls('ap-monto', className)}" style="min-width:${ancho}px">`
    + (menosMas ? b('menos') : '') + `<span class="ap-monto-valores">${capas}</span>` + (menosMas ? b('mas') : '')
    + '</div>';
}

/** Aire entre los botones y el monto (03-e-precio: 12,5 a la izquierda, 13 a la derecha). */
const AIRE_MONTO = 12.5 + 13;

/** Mide cada capa y la corre para que quede centrada como en su foto (si el monto no pide más, la fila es la mínima)
    y deja el + junto al valor `actual`. Necesita el monto en el DOM. Guarda en cada capa el corrimiento del + (data-mas). */
export function acomodarMonto(el: Element): void {
  const celda = el.querySelector<HTMLElement>('.ap-monto-valores');
  const fila = el as HTMLElement;
  if (!celda) return;
  const minimo = (parseFloat(fila.style.minWidth) || 312) - 2 * 53.5;
  const total = celda.offsetWidth;
  let actual = 0;
  el.querySelectorAll<HTMLElement>('.ap-monto-valor').forEach(v => {
    const propia = Math.max(minimo, v.offsetWidth + AIRE_MONTO);
    // offsetWidth redondea: menos de 1 px de diferencia es la misma fila
    const corre = Math.min(0, Math.round(propia - total));
    v.dataset.mas = String(corre);
    gsap.set(v, { x: corre / 2 });
    if (parseFloat(v.style.opacity) > 0) actual = corre;
  });
  gsap.set(el.querySelector('.ap-monto-boton[data-boton="mas"]'), { x: actual });
}

/** Cruza el monto al valor i (corte seco por defecto: un dígito tecleado) y lleva el + a su lugar. Devuelve la duración. */
export function mostrarMonto(tl: GSAPTimeline, el: Element, i: number, at: number, dur = 0.06): number {
  el.querySelectorAll<HTMLElement>('.ap-monto-valor').forEach(v => {
    const es = Number(v.dataset.valor) === i;
    tl.to(v, { opacity: es ? 1 : 0, duration: dur, ease: 'none' }, at);
    if (es && v.dataset.mas !== undefined) {
      tl.to(el.querySelector('.ap-monto-boton[data-boton="mas"]'), { x: Number(v.dataset.mas), duration: 0.18, ease: 'power2.out' }, at);
    }
  });
  return dur;
}
