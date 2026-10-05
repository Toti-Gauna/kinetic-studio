/* Interruptor "No disponible ↔ Disponible" del especialista (01/02-e-inicio) y la llavecita suelta.
   interruptorDisponible({ prendido = false, className, estilo }) → <div class="ap-disponible"> alineado a la derecha
     (en inicio: right 17,1 · top 137,5). Dos píldoras apiladas, ambas pegadas a la derecha:
       .ap-disponible-no  tinta #1D2C4A, 193,5 × 51, maletín + "No disponible"
       .ap-disponible-si  azul con canto #143E7E de 3,3 abajo, 169,5 × 51, maletín + "Disponible", resplandor azul
     y encima la llavecita compartida (pista de 40,4 × 21,8 a 6,5 del borde derecho, centrada en y 25,5 de la píldora).
     Prender = cruzar las píldoras y las pistas con opacity y correr la perilla 17,6 px en x (prenderDisponible).
   llavecita({ prendido = false }) → la pista sola (gris #D3D6DC ↔ verde #1E9E57) con la perilla blanca de 17,5.
   Ganchos: .ap-disponible[data-prendido] · .ap-disponible-no · .ap-disponible-si (opacity) · .ap-llavecita ·
     .ap-llavecita-apagada · .ap-llavecita-prendida (opacity) · .ap-llavecita-perilla (x 0 → 17,6).
   Ayudas: prenderDisponible(tl, el, at, { prender = true, dur = .35 }) → duración · ponerDisponible(el, prendido). */
import { gsap } from 'gsap';
import { icono } from '../iconos.ts';
import { cls } from './comun.ts';
import '../css/interruptor.css';

/** Recorrido de la perilla (px en x). */
export const RECORRIDO_PERILLA = 17.6;

export function llavecita({ prendido = false, className = '' }: { prendido?: boolean; className?: string } = {}): string {
  return `<span class="${cls('ap-llavecita', className)}" data-prendido="${prendido ? 1 : 0}">`
    + `<span class="ap-llavecita-apagada" style="opacity:${prendido ? 0 : 1}"></span>`
    + `<span class="ap-llavecita-prendida" style="opacity:${prendido ? 1 : 0}"></span>`
    + `<span class="ap-llavecita-perilla" style="transform:translate(${prendido ? RECORRIDO_PERILLA : 0}px, 0px)"></span>`
    + '</span>';
}

export function interruptorDisponible({ prendido = false, className = '', estilo = '' }: { prendido?: boolean; className?: string; estilo?: string } = {}): string {
  return `<div class="${cls('ap-disponible', className)}" data-prendido="${prendido ? 1 : 0}" style="${estilo}">`
    + `<span class="ap-disponible-no" style="opacity:${prendido ? 0 : 1}">${icono('maletin', { tam: 17, trazo: 2.2 })}<span>No disponible</span></span>`
    + `<span class="ap-disponible-si" style="opacity:${prendido ? 1 : 0}"><span class="ap-disponible-canto"></span>`
    + `<span class="ap-disponible-cara">${icono('maletin', { tam: 17, trazo: 2.2 })}<span>Disponible</span></span></span>`
    + llavecita({ prendido })
    + '</div>';
}

const partes = (el: Element) => ({
  no: el.querySelector('.ap-disponible-no'),
  si: el.querySelector('.ap-disponible-si'),
  apagada: el.querySelector('.ap-llavecita-apagada'),
  prendida: el.querySelector('.ap-llavecita-prendida'),
  perilla: el.querySelector('.ap-llavecita-perilla'),
});

/** Al construir la escena: deja el interruptor apagado o prendido (gsap.set). */
export function ponerDisponible(el: Element, prendido: boolean): void {
  const p = partes(el);
  gsap.set([p.no, p.apagada].filter(Boolean), { opacity: prendido ? 0 : 1 });
  gsap.set([p.si, p.prendida].filter(Boolean), { opacity: prendido ? 1 : 0 });
  gsap.set(p.perilla, { x: prendido ? RECORRIDO_PERILLA : 0 });
}

/** Prende (o apaga) el interruptor: cruza píldoras y pistas y corre la perilla con un rebote corto. Devuelve la duración. */
export function prenderDisponible(tl: GSAPTimeline, el: Element, at: number, { prender = true, dur = 0.35 }: { prender?: boolean; dur?: number } = {}): number {
  const p = partes(el);
  tl.to(p.perilla, { x: prender ? RECORRIDO_PERILLA : 0, duration: dur, ease: 'back.out(2)' }, at);
  tl.to([p.prendida, p.si].filter(Boolean), { opacity: prender ? 1 : 0, duration: dur * 0.6, ease: 'power1.out' }, at);
  tl.to([p.apagada, p.no].filter(Boolean), { opacity: prender ? 0 : 1, duration: dur * 0.6, ease: 'power1.out' }, at);
  return dur;
}
