/* Barra de pasos del seguimiento (sobre azul). Medida en 10-u-seguimiento (Confirmado · En camino · Llegó · Trabajando)
   y 13-e-en-camino (Saliste · En camino · Llegaste).
   pasos({ etiquetas, actual = 1, progreso = .85, tramos = [1, 2.2, 1], variante = 'usuario', persona, icono = 'caminando',
           ancho = 366.4, prendida }) → <div>
     Tres tramos separados 8 px, anchos proporcionales a `tramos` (en las fotos 83,3 · 183 · 83,3), con la pista blanca
     al 25 % (#5781BE sobre el azul). Cada tramo trae dos capas propias: .ap-pasos-relleno (el avance del tramo en curso,
     blanco translúcido, ancho completo con scaleX = progreso desde la izquierda: avanzar es animar scaleX) y
     .ap-pasos-completo (blanco lleno, opacity 1 en los tramos terminados: terminar un tramo es subir su opacity).
     variante 'usuario' (10-u-seguimiento): tramos de 6,2, relleno en curso #9AB3D8 (55 % sobre el azul), etiquetas a
       10,9 de la barra, la prendida (default: la del tramo actual) en blanco y las demás #9AB3D8 (todas 600), repartidas de
       punta a punta; personita de 26 con los pies a 10,5 de la barra.
     variante 'especialista' (13-e-en-camino): tramos de 7,3, relleno en curso casi blanco (#EDF2F8), etiquetas a 7,4
       en #BCCDE5 600 sin ninguna prendida (la del medio centrada); personita de 23,7 con los pies a 7,4.
     Etiquetas DM Sans 12,1. La personita (ícono 'caminando') va donde diga `persona` (x de su centro en px desde el borde
     izquierdo; las fotos no la ponen en la punta: 111,2 en 10-u-seguimiento, 30,8 en 13-e-en-camino) o, sin `persona`,
     arriba de la punta del relleno.
   Ganchos: .ap-pasos · .ap-pasos-tramo[data-tramo="0|1|2"] · .ap-pasos-relleno (scaleX) · .ap-pasos-completo (opacity) ·
     .ap-pasos-icono (moverlo con x: pasosX(el, tramo, progreso) da la x de la punta) · .ap-pasos-etiqueta[data-etiqueta]
     con sus capas .ap-pasos-etiqueta-apagada / .ap-pasos-etiqueta-prendida (opacity). */
import { icono as dibujarIcono, type Icono } from '../iconos.ts';
import { cls, esc } from './comun.ts';
import '../css/pasos.css';

export type VariantePasos = 'usuario' | 'especialista';

export interface PasosProps {
  etiquetas?: readonly string[];
  /** tramo en curso (0, 1 o 2) */
  actual?: number;
  /** cuánto del tramo en curso está lleno (0–1) */
  progreso?: number;
  /** anchos relativos de los tramos */
  tramos?: readonly number[];
  variante?: VariantePasos;
  /** x del centro de la personita en px (default: la punta del relleno) */
  persona?: number;
  icono?: Icono | false;
  /** ancho total en px (default 366,4: de x 24 a 390,4) */
  ancho?: number;
  /** índice de la etiqueta prendida (default: la del tramo actual en el usuario, ninguna (−1) en el especialista) */
  prendida?: number;
  className?: string;
}

const GAP = 8;

/** Medidas de cada variante: alto del tramo, opacidad del relleno en curso (sobre la pista), aire hasta las etiquetas,
    personita (lado del ícono y aire de los pies a la barra). */
const VARIANTE: Record<VariantePasos, { barra: number; relleno: number; aire: number; icono: number; pies: number }> = {
  usuario: { barra: 6.2, relleno: 0.4, aire: 10.9, icono: 26, pies: 10.5 },
  especialista: { barra: 7.3, relleno: 0.89, aire: 7.4, icono: 23.7, pies: 7.4 },
};

export function pasos({
  etiquetas = ['Confirmado', 'En camino', 'Llegó', 'Trabajando'], actual = 1, progreso = 0.85, tramos = [1, 2.2, 1],
  variante = 'usuario', persona, icono = 'caminando', ancho = 366.4, prendida, className = '',
}: PasosProps = {}): string {
  const v = VARIANTE[variante];
  const total = tramos.reduce((a, b) => a + b, 0);
  const util = ancho - GAP * (tramos.length - 1);
  // la figura ocupa casi todo el alto del ícono (de 0,6 a 23,6 sobre 24)
  const barraTop = +(v.icono * (23.6 / 24) + v.pies).toFixed(1);
  let x = 0;
  let punta = 0;
  const barras = tramos.map((t, i) => {
    const w = (util * t) / total;
    const lleno = i === actual ? progreso : 0;
    if (i === actual) punta = x + w * progreso;
    const html = `<span class="ap-pasos-tramo" data-tramo="${i}" style="left:${x.toFixed(1)}px;width:${w.toFixed(1)}px">`
      + `<span class="ap-pasos-relleno" style="opacity:${v.relleno};transform:scaleX(${lleno})"></span>`
      + `<span class="ap-pasos-completo" style="opacity:${i < actual ? 1 : 0}"></span></span>`;
    x += w + GAP;
    return html;
  }).join('');
  const on = prendida ?? (variante === 'usuario' ? Math.min(actual, etiquetas.length - 1) : -1);
  const etiq = etiquetas.map((e, i) => `<span class="ap-pasos-etiqueta" data-etiqueta="${i}">`
    + `<span class="ap-pasos-etiqueta-apagada" style="opacity:${i === on ? 0 : 1}">${esc(e)}</span>`
    + `<span class="ap-pasos-etiqueta-prendida" style="opacity:${i === on ? 1 : 0}">${esc(e)}</span></span>`).join('');
  const cx = persona ?? punta;
  return `<div class="${cls('ap-pasos', className)}" data-variante="${variante}" style="width:${ancho}px;height:${(barraTop + v.barra + v.aire + 14).toFixed(1)}px" data-punta="${punta.toFixed(1)}">`
    + (icono ? `<span class="ap-pasos-icono" style="transform:translate(${(cx - v.icono / 2).toFixed(1)}px, 0px)">${dibujarIcono(icono, { tam: v.icono, trazo: 2 })}</span>` : '')
    + `<div class="ap-pasos-tramos" style="top:${barraTop}px;height:${v.barra}px">${barras}</div>`
    + `<div class="ap-pasos-etiquetas" data-n="${etiquetas.length}" style="top:${(barraTop + v.barra + v.aire - 2).toFixed(1)}px">${etiq}</div></div>`;
}

/** x (px, relativa a .ap-pasos) de la punta del relleno del tramo `i` lleno hasta `progreso`. */
export function pasosX(el: Element, i: number, progreso: number): number {
  const t = el.querySelector<HTMLElement>(`.ap-pasos-tramo[data-tramo="${i}"]`);
  if (!t) return 0;
  return parseFloat(t.style.left) + parseFloat(t.style.width) * progreso;
}
