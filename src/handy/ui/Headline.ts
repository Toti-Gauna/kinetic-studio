/* Titular del escenario: los textos grandes de cada escena ("Se rompió algo en casa.").
   titular({ texto, tamano, color, acento, ancho, alinear, className, id }) → string <div class="hd-titular">.
   El texto se parte en palabras con máscara, para revelarlas solo con transform:
     .hd-titular > .hd-tit-grupo[data-i] > .hd-tit-palabra (máscara) > .hd-tit-in (lo que se mueve)
   "|" separa grupos que pueden entrar en tiempos distintos: 'Preguntás.|Esperás.|Nadie confirma.'
   *palabra* marca un acento (.hd-tit-acento, color `acento`).
   Uso en una receta: el div va posicionado (left/top) por la escena; prepararTitular(el) al construir,
   entraTitular(tl, el, at) y saleTitular(tl, el, at) en el timeline (devuelven su duración). */
import { gsap } from 'gsap';
import '../css/base.css';
import '../css/headline.css';
import { HEADLINE } from '../layout.ts';

export interface TitularOpts {
  texto: string;
  /** cuerpo en px del escenario (default 76) */
  tamano?: number;
  /** color del texto (default var(--hd-azul)) */
  color?: string;
  /** color de las palabras *marcadas* (default var(--hd-azul-handy)) */
  acento?: string;
  /** ancho de la caja en px (default HEADLINE.w) */
  ancho?: number;
  alinear?: 'left' | 'center' | 'right';
  className?: string;
  id?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function titular({ texto, tamano = 76, color, acento, ancho = HEADLINE.w, alinear = 'left', className = '', id }: TitularOpts): string {
  let enAcento = false; // *…* puede abarcar varias palabras: "*Vos elegís.*"
  const grupos = texto.split('|').map((g, i) => {
    const palabras = g.trim().split(/\s+/).map(p => {
      const abre = p.startsWith('*'), cierra = /\*[.,:;!?…]*$/.test(p);
      const marcada = enAcento || abre;
      if (abre) enAcento = true;
      if (cierra) enAcento = false;
      const limpia = p.replace(/^\*/, '').replace(/\*(?=[.,:;!?…]*$)/, '');
      return `<span class="hd-tit-palabra"><span class="hd-tit-in${marcada ? ' hd-tit-acento' : ''}">${esc(limpia)}</span></span>`;
    });
    return `<span class="hd-tit-grupo" data-i="${i}">${palabras.join(' ')}</span>`;
  });
  const style = [`width:${ancho}px`, `font-size:${tamano}px`, `text-align:${alinear}`, color ? `color:${color}` : '', acento ? `--hd-tit-acento:${acento}` : '']
    .filter(Boolean).join(';');
  return `<div class="hd-titular hd-ui${className ? ' ' + className : ''}"${id ? ` id="${id}"` : ''} style="${style}">${grupos.join(' ')}</div>`;
}

const piezas = (el: Element, grupo?: number) =>
  Array.from(el.querySelectorAll<HTMLElement>(grupo === undefined ? '.hd-tit-in' : `.hd-tit-grupo[data-i="${grupo}"] .hd-tit-in`));

/** Estado inicial (al construir la escena): todas las palabras escondidas debajo de su máscara. */
export function prepararTitular(el: Element): void {
  gsap.set(piezas(el), { yPercent: 115 });
}

/** Las palabras suben desde su máscara. `grupo` = solo ese grupo ("|"). Devuelve la duración. */
export function entraTitular(tl: GSAPTimeline, el: Element, at: number, { grupo, dur = 0.8, stagger = 0.06 }: { grupo?: number; dur?: number; stagger?: number } = {}): number {
  const p = piezas(el, grupo);
  tl.to(p, { yPercent: 0, duration: dur, ease: 'expo.out', stagger }, at);
  return dur + stagger * Math.max(0, p.length - 1);
}

/** Las palabras salen hacia arriba por su máscara. Devuelve la duración. */
export function saleTitular(tl: GSAPTimeline, el: Element, at: number, { dur = 0.45, stagger = 0.03 }: { dur?: number; stagger?: number } = {}): number {
  const p = piezas(el);
  tl.to(p, { yPercent: -115, duration: dur, ease: 'power3.in', stagger }, at);
  return dur + stagger * Math.max(0, p.length - 1);
}
