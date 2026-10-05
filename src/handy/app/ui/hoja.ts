/* Hoja inferior (bottom sheet) de la app 2026 sobre un velo oscuro. Medida en 03-e-precio ("Tu precio") y 02-u-opciones.
   hoja({ titulo, cuerpo, top = 99.3, tono = 'azul', tam = 21, ancho = 125, linea = true, cerrar = true, velo = true,
          dato, capa = true, className }) → string
     capa true: devuelve UNA capa <div class="hd-capa ap-hoja-capa" data-pantalla="hoja-<dato>"> (transparente: velo + hoja)
     para apilar sobre la pantalla en phoneFrame; capa false: solo la hoja (sin velo), para meterla donde se quiera.
     La hoja va de x 10,6 a 403,4 (392,8 de ancho), arranca en `top` y sigue hasta abajo; radio 32 arriba.
     Asa gris 52,4 × 4,7 centrada, a 12 del borde · título en Archivo (azul en las hojas del especialista, tinta en las del usuario:
     tono 'tinta'), centrado, mayúscula a 37 del borde · X roja: círculo #D93025 de 56 en (313,2 , 26,2) de la hoja con la
     cruz blanca · filete #EBEDF2 de 1,5 a 74,6 del borde, a 25,1 de cada lado (pasa por detrás de la X) · `cuerpo` empieza a 91
     (contenido absoluto o en flujo dentro de .ap-hoja-cuerpo, que tiene 25 de margen a los lados).
     Velo: rgba(14, 29, 54, .45) sobre toda la pantalla (medido: el azul del encabezado queda #173D76, el blanco #8F96A2).
   Ganchos: .ap-hoja-capa · .ap-velo (opacity) · .ap-hoja (subirla: y desde 800) · .ap-hoja-asa · .ap-hoja-titulo ·
     .ap-hoja-cerrar (la X: aparece con scale) · .ap-hoja-linea · .ap-hoja-cuerpo.
   Ayuda: subirHoja(tl, capa, at, { dur = .5 }) → duración (velo de 0 a 1 y la hoja desde abajo con un rebote corto). */
import { icono } from '../iconos.ts';
import { tituloResaltado } from './textos.ts';
import { cls, esc } from './comun.ts';
import '../css/hoja.css';

export interface HojaProps {
  titulo?: string;
  /** palabra resaltada del título (opcional) */
  resaltar?: string;
  /** HTML del contenido (va en .ap-hoja-cuerpo, desde 91 px del borde de la hoja) */
  cuerpo?: string;
  /** borde de arriba de la hoja en la pantalla (default 99,3 como "Tu precio") */
  top?: number;
  /** color del título: 'azul' (default) o 'tinta' */
  tono?: 'azul' | 'tinta';
  /** cuerpo del título en px (default 21) y ancho de Archivo (default 125 %, medido en "Tu precio") */
  tam?: number;
  ancho?: number;
  /** filete bajo el título (default true) */
  linea?: boolean;
  /** X roja (default true) */
  cerrar?: boolean;
  /** velo oscuro detrás (default true; solo con capa) */
  velo?: boolean;
  /** nombre para data-pantalla="hoja-<dato>" */
  dato?: string;
  /** devolver la capa entera (default true) o solo la hoja */
  capa?: boolean;
  className?: string;
}

export const HOJA = { x: 10.6, w: 392.8, radio: 32, cerrar: { x: 313.2, y: 26.2, d: 56 }, linea: 74.6, cuerpo: 91 } as const;

export function hoja({
  titulo = '', resaltar, cuerpo = '', top = 99.3, tono = 'azul', tam = 21, ancho = 125, linea = true, cerrar = true,
  velo = true, dato = 'hoja', capa = true, className = '',
}: HojaProps = {}): string {
  const tit = titulo
    ? tituloResaltado({ texto: titulo, resaltar, tam, ancho, alto: 1.08, etiqueta: 'h2', color: tono === 'azul' ? 'var(--ap-azul)' : 'var(--ap-tinta)', className: 'ap-hoja-titulo' })
    : '';
  const laHoja = `<div class="${cls('ap-hoja', className)}" style="top:${top}px">`
    + '<span class="ap-hoja-asa"></span>'
    + tit
    + (linea ? '<span class="ap-hoja-linea"></span>' : '')
    + (cerrar ? `<span class="ap-hoja-cerrar">${icono('cerrar', { tam: 22, trazo: 3 })}</span>` : '')
    + `<div class="ap-hoja-cuerpo">${cuerpo}</div>`
    + '</div>';
  if (!capa) return laHoja;
  return `<div class="hd-capa ap-hoja-capa ap-ui" data-pantalla="hoja-${esc(dato)}">`
    + (velo ? '<div class="ap-velo"></div>' : '')
    + laHoja + '</div>';
}

/** Sube la hoja: velo 0 → 1 y la hoja desde abajo. Devuelve la duración. */
export function subirHoja(tl: GSAPTimeline, capa: Element, at: number, { dur = 0.5 }: { dur?: number } = {}): number {
  const velo = capa.querySelector('.ap-velo');
  if (velo) tl.fromTo(velo, { opacity: 0 }, { opacity: 1, duration: dur * 0.6, ease: 'power1.out' }, at);
  tl.fromTo(capa.querySelector('.ap-hoja'), { y: 820 }, { y: 0, duration: dur, ease: 'back.out(1.1)' }, at);
  return dur;
}
