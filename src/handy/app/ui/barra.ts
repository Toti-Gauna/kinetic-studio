/* Barra inferior de la app 2026: barra azul de 414×84 pegada abajo (y 812 → 896), esquinas de arriba redondeadas (30),
   cuatro pestañas Inicio · Agenda · Mensajes · Cuenta. La activa va en blanco y negrita con un punto amarillo abajo; las
   otras en azul pálido. Medida en 01-u-inicio y en pestanas/*.png (que tienen el alto exacto de 896).
   barraInferior({ activa = 'inicio', className, id }) → string <nav class="ap-barra">
   Cada pestaña tiene sus dos estados apilados (apagada y prendida): cambiar de pestaña es cruzarlos con opacity.
     cambiarPestana(tl, barra, 'agenda', at, dur = .25) → duración (apaga la que estaba prendida y prende la pedida).
   Medidas: columnas de 98,5 desde x = 10 (centros 59 · 158 · 256 · 355) · ícono en una caja de 27 arriba en y 826 (los
     cuatro dibujados en esa caja: casa, agenda, mensajes y usuario de app/iconos.ts; trazo 1,9, la prendida 2) ·
     nombre DM Sans 12,35 (mayúscula y 857,6 → 866,5) · punto amarillo de 5 centrado en y 873 (pestanas/*).
   Ganchos: .ap-barra · .ap-barra-item[data-tab="inicio|agenda|mensajes|cuenta"] (la activa con [data-activa]) ·
     .ap-barra-apagada · .ap-barra-prendida (opacity 0/1) · .ap-barra-punto (dentro de la prendida). */
import { gsap } from 'gsap';
import { icono, type Icono } from '../iconos.ts';
import { cls, idAttr } from './comun.ts';
import '../css/barra.css';

export type Pestana = 'inicio' | 'agenda' | 'mensajes' | 'cuenta';

export const PESTANAS: readonly { tab: Pestana; icono: Icono; texto: string }[] = [
  { tab: 'inicio', icono: 'casa', texto: 'Inicio' },
  { tab: 'agenda', icono: 'agenda', texto: 'Agenda' },
  { tab: 'mensajes', icono: 'mensajes', texto: 'Mensajes' },
  { tab: 'cuenta', icono: 'usuario', texto: 'Cuenta' },
];

/** Geometría para las escenas (px de la pantalla). */
export const BARRA = { y: 812, alto: 84, centros: [59.3, 157.8, 256.3, 354.8] as readonly number[], iconoY: 826, punto: { y: 873.5 } } as const;

export interface BarraProps {
  activa?: Pestana;
  className?: string;
  id?: string;
}

const estado = (ic: Icono, texto: string, prendida: boolean) =>
  `<span class="${prendida ? 'ap-barra-prendida' : 'ap-barra-apagada'}">`
  + `<span class="ap-barra-icono">${icono(ic, { tam: 27, trazo: prendida ? 2 : 1.9 })}</span>`
  + `<span class="ap-barra-texto">${texto}</span>`
  + (prendida ? '<span class="ap-barra-punto"></span>' : '')
  + '</span>';

export function barraInferior({ activa = 'inicio', className = '', id }: BarraProps = {}): string {
  const items = PESTANAS.map(({ tab, icono: ic, texto }) => {
    const on = tab === activa;
    return `<span class="ap-barra-item" data-tab="${tab}"${on ? ' data-activa' : ''}>`
      + estado(ic, texto, false).replace('class="ap-barra-apagada"', `class="ap-barra-apagada" style="opacity:${on ? 0 : 1}"`)
      + estado(ic, texto, true).replace('class="ap-barra-prendida"', `class="ap-barra-prendida" style="opacity:${on ? 1 : 0}"`)
      + '</span>';
  }).join('');
  return `<nav class="${cls('ap-barra', 'ap-ui', className)}"${idAttr(id)}>${items}</nav>`;
}

/** Cruza la pestaña prendida con la pedida (solo opacity). Devuelve la duración. */
export function cambiarPestana(tl: GSAPTimeline, barra: Element, a: Pestana, at: number, dur = 0.25): number {
  barra.querySelectorAll<HTMLElement>('.ap-barra-item').forEach(item => {
    const on = item.dataset.tab === a;
    tl.to(item.querySelector('.ap-barra-prendida'), { opacity: on ? 1 : 0, duration: dur, ease: 'power1.out' }, at);
    tl.to(item.querySelector('.ap-barra-apagada'), { opacity: on ? 0 : 1, duration: dur, ease: 'power1.out' }, at);
  });
  return dur;
}

/** Al construir la escena: deja prendida una pestaña (gsap.set). */
export function ponerPestana(barra: Element, a: Pestana): void {
  barra.querySelectorAll<HTMLElement>('.ap-barra-item').forEach(item => {
    const on = item.dataset.tab === a;
    gsap.set(item.querySelector('.ap-barra-prendida'), { opacity: on ? 1 : 0 });
    gsap.set(item.querySelector('.ap-barra-apagada'), { opacity: on ? 0 : 1 });
  });
}
