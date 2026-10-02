/* Interruptor (switch) de la app del especialista: pista redondeada con dos capas de color apiladas —apagada (gris) y
   prendida (azul Handy)— y la perilla blanca encima. Prenderlo es cruzar las dos capas con opacity y correr la perilla
   con x (nada de tweens de color).
   interruptor({ prendido = false, ancho = 64, alto = 38, className, id }) → string <span class="hd-interruptor">.
   El estado se dibuja con estilos en línea (opacity de las capas y translate de la perilla): sin gsap.set queda tal cual.
   Recorrido de la perilla en x: interruptorRecorrido(ancho, alto) = ancho − alto (26 px con los valores por defecto).
   Ayudas de timeline (solo transform/opacity, tiempos absolutos):
     ponerInterruptor(el, prendido)                                al construir: deja el estado (gsap.set)
     prenderInterruptor(tl, el, at, { prender = true, dur = .32 })  cruza las capas y corre la perilla → duración
   Ganchos: .hd-interruptor[data-prendido="0|1"][data-recorrido] · .hd-interruptor-apagado · .hd-interruptor-prendido ·
   .hd-interruptor-perilla. */
import { gsap } from 'gsap';
import '../css/base.css';
import '../css/especialista.css';

export interface InterruptorProps {
  /** dibujarlo prendido (default false) */
  prendido?: boolean;
  /** ancho de la pista en px (default 64) */
  ancho?: number;
  /** alto de la pista en px (default 38); la perilla mide alto − 6 */
  alto?: number;
  className?: string;
  id?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

/** Cuánto corre la perilla (px en x) de apagado a prendido. */
export function interruptorRecorrido(ancho = 64, alto = 38): number {
  return ancho - alto;
}

export function interruptor({ prendido = false, ancho = 64, alto = 38, className = '', id }: InterruptorProps = {}): string {
  const cls = ['hd-interruptor', className].filter(Boolean).join(' ');
  const recorrido = interruptorRecorrido(ancho, alto);
  const perilla = alto - 6;
  return `<span class="${cls}"${id ? ` id="${esc(id)}"` : ''} data-prendido="${prendido ? 1 : 0}" data-recorrido="${recorrido}"`
    + ` style="width:${ancho}px;height:${alto}px;border-radius:${alto / 2}px">`
    + `<span class="hd-interruptor-apagado" style="opacity:${prendido ? 0 : 1}"></span>`
    + `<span class="hd-interruptor-prendido" style="opacity:${prendido ? 1 : 0}"></span>`
    + `<span class="hd-interruptor-perilla" style="width:${perilla}px;height:${perilla}px;transform:translate(${prendido ? recorrido : 0}px, 0px)"></span>`
    + '</span>';
}

const partes = (el: Element) => ({
  apagado: el.querySelector('.hd-interruptor-apagado'),
  prendido: el.querySelector('.hd-interruptor-prendido'),
  perilla: el.querySelector('.hd-interruptor-perilla'),
  recorrido: Number((el as HTMLElement).dataset?.recorrido) || 26,
});

/** Al construir la escena: deja el interruptor apagado o prendido. */
export function ponerInterruptor(el: Element, prendido: boolean): void {
  const p = partes(el);
  gsap.set(p.apagado, { opacity: prendido ? 0 : 1 });
  gsap.set(p.prendido, { opacity: prendido ? 1 : 0 });
  gsap.set(p.perilla, { x: prendido ? p.recorrido : 0 });
}

/** Lo prende (o lo apaga con prender: false): cruza las capas y la perilla cruza con un rebote corto. Devuelve la duración. */
export function prenderInterruptor(
  tl: GSAPTimeline, el: Element, at: number,
  { prender = true, dur = 0.32 }: { prender?: boolean; dur?: number } = {},
): number {
  const p = partes(el);
  tl.to(p.prendido, { opacity: prender ? 1 : 0, duration: dur * 0.6, ease: 'power1.out' }, at);
  tl.to(p.apagado, { opacity: prender ? 0 : 1, duration: dur * 0.6, ease: 'power1.out' }, at);
  tl.to(p.perilla, { x: prender ? p.recorrido : 0, duration: dur, ease: 'back.out(2)' }, at);
  return dur;
}
