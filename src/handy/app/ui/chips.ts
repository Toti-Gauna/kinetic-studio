/* Chips de la app 2026. Los que se eligen (horarios, opciones de la reseña) traen el estado elegido como una capa
   encima (.ap-chip-sel, misma forma y contenido en azul/blanco): elegirlo es subir su opacity, nunca cambiar colores.
   chipHorario({ texto, elegido = false, className }) → pill de 49,5 de alto, reloj de 13,6 + texto 13 negrita.
       Apagado gris ficha #ECECEC y tinta; elegido azul con texto blanco (03-e-precio: "Hoy, de 16 a 18 h").
   chip({ texto, icono, tono = 'gris', elegido, tam = 'm', className }) → pill genérico con capa de elegido.
       tono 'gris' · 'blanco' · 'celeste'; tam 's' (26) · 'm' (36) · 'l' (49,5). ("Puntual", "Llave de paso")
   chipRubro({ rubro, tam = 's' }) → celeste #E9EFF9 con ícono y texto azul: "Plomería", "Gas" (02-e-inicio: 19,3 de alto;
       tam 'm' = 26 como en 16-u-resena).
   etiqueta({ texto, tono = 'amarillo', icono }) → tag chico (18–20 de alto): "Vos decidís", "Hoy" (amarillo),
       "Confirmado" (verde), "Nuevo" (amarillo), "Con visita" (celeste sobre azul: tono 'translucido').
   Ganchos: .ap-chip[data-chip][data-elegido] · .ap-chip-base · .ap-chip-sel (opacity 0/1) · .ap-chip-rubro[data-rubro] ·
     .ap-etiqueta[data-tono]. Ayuda: elegirChip(tl, chip, at, { elegir = true, dur = .2 }) → duración. */
import { icono as dibujarIcono, type Icono } from '../iconos.ts';
import { cls, esc } from './comun.ts';
import '../css/chips.css';

export type TonoChip = 'gris' | 'blanco' | 'celeste';
export type TamChip = 's' | 'm' | 'l';

export interface ChipProps {
  texto: string;
  icono?: Icono;
  tono?: TonoChip;
  elegido?: boolean;
  tam?: TamChip;
  /** data-chip (para encontrarlo) */
  dato?: string;
  className?: string;
}

const ICONO_CHIP: Record<TamChip, number> = { s: 14, m: 16, l: 13.6 };

export function chip({ texto, icono, tono = 'gris', elegido = false, tam = 'm', dato, className = '' }: ChipProps): string {
  // el reloj chico de los horarios va con trazo más grueso (en la foto mide ≈ 1,6 px)
  const ic = (blanco: boolean) => (icono ? dibujarIcono(icono, { tam: ICONO_CHIP[tam], trazo: tam === 'l' ? 2.9 : blanco ? 2.3 : 2.2 }) : '');
  const cuerpo = (blanco: boolean) => `${ic(blanco)}<span class="ap-chip-texto">${esc(texto)}</span>`;
  return `<span class="${cls('ap-chip', className)}" data-tono="${tono}" data-tam="${tam}" data-chip="${esc(dato ?? texto)}"${elegido ? ' data-elegido' : ''}>`
    + `<span class="ap-chip-base">${cuerpo(false)}</span>`
    + `<span class="ap-chip-sel" style="opacity:${elegido ? 1 : 0}">${cuerpo(true)}</span>`
    + '</span>';
}

export function chipHorario({ texto, elegido = false, className = '' }: { texto: string; elegido?: boolean; className?: string }): string {
  return chip({ texto, icono: 'reloj', tono: 'gris', tam: 'l', elegido, className: cls('ap-chip-horario', className) });
}

export type Rubro = 'electricidad' | 'plomeria' | 'gas' | 'cerrajeria' | 'albanileria' | 'aire';

/** Los seis rubros: ícono y nombre (en el orden de la grilla de inicio). */
export const RUBROS: readonly { id: Rubro; icono: Icono; texto: string }[] = [
  { id: 'electricidad', icono: 'rayo', texto: 'Electricidad' },
  { id: 'plomeria', icono: 'canilla', texto: 'Plomería' },
  { id: 'gas', icono: 'llama', texto: 'Gas' },
  { id: 'cerrajeria', icono: 'llave', texto: 'Cerrajería' },
  { id: 'albanileria', icono: 'ladrillos', texto: 'Albañilería' },
  { id: 'aire', icono: 'aire', texto: 'Aire acond.' },
];

export const rubro = (id: Rubro) => RUBROS.find(r => r.id === id)!;

export function chipRubro({ rubro: id, tam = 's', className = '' }: { rubro: Rubro; tam?: 's' | 'm'; className?: string }): string {
  const r = rubro(id);
  return `<span class="${cls('ap-chip-rubro', className)}" data-rubro="${id}" data-tam="${tam}">`
    + dibujarIcono(r.icono, { tam: tam === 's' ? 13 : 16, trazo: 2.3 })
    + `<span class="ap-chip-texto">${esc(r.texto === 'Aire acond.' ? 'Aire acondicionado' : r.texto)}</span></span>`;
}

export type TonoEtiqueta = 'amarillo' | 'verde' | 'celeste' | 'rojo' | 'translucido';

export function etiqueta({ texto, tono = 'amarillo', icono, className = '' }: { texto: string; tono?: TonoEtiqueta; icono?: Icono; className?: string }): string {
  return `<span class="${cls('ap-etiqueta', className)}" data-tono="${tono}">`
    + (icono ? dibujarIcono(icono, { tam: 12, trazo: 2.4 }) : '')
    + `<span class="ap-etiqueta-texto">${esc(texto)}</span></span>`;
}

/** Elige (o suelta) un chip: sube la capa azul. Devuelve la duración. */
export function elegirChip(tl: GSAPTimeline, el: Element, at: number, { elegir = true, dur = 0.2 }: { elegir?: boolean; dur?: number } = {}): number {
  tl.to(el.querySelector('.ap-chip-sel'), { opacity: elegir ? 1 : 0, duration: dur, ease: 'power1.out' }, at);
  return dur;
}
