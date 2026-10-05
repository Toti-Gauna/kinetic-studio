/* Calendario de mes y tira de días de la app 2026. Medidos en 20-e-turnos / pestanas (Tu agenda: noviembre 2026, el
   martes 17 marcado) y 27-u-programar (¿QUÉ DÍA? HOY 17 · MIÉ 18 · …).
   calendarioMes({ mes = 'Noviembre 2026', primerDia = 0, dias = 30, elegido = 17, hoy = 17, eventos = {…}, ancho = 368 })
     → caja #F4F5F8 (radio 26; 362 de alto con 5 filas) con: flechas en círculos grises de 49 a los costados y el mes en
     Archivo 900 azul de 20,3 al medio; las iniciales D L M M J V S (DM Sans 700 11, gris, a 73,5 del borde); la grilla
     de días (a 95): celdas de 47,5 × 45 + canto 3,5 (radio 12) cada 51,25 px. Eventos por defecto los de la foto: 5, 12,
     17, 23 y 27 con un puntito y 19 con dos. Días pasados (< hoy) gris ficha con número gris; los demás gris ficha con número tinta; los
     días con `eventos` (número = cantidad de puntitos) celeste #E9EFF9 con número azul y los puntos abajo.
     primerDia: columna del día 1 (0 = domingo; noviembre 2026 empieza en domingo).
     El elegido trae una capa azul con canto azul oscuro y número blanco ENCIMA de su celda normal (opacity 1): elegir
     otro día es cruzar capas (elegirDia). Todas las celdas tienen su capa .ap-cal-sel (en 0 salvo la elegida).
   tiraDias({ dias, elegido = 0 }) → fila de tarjetitas de 63 × 72 + canto (HOY/17, MIÉ/18, …) con su capa azul elegida.
   Ganchos: .ap-cal · .ap-cal-flecha[data-lado="izq|der"] · .ap-cal-mes · .ap-cal-dia[data-dia="1".."31"] (data-evento,
     data-pasado) · .ap-cal-sel (opacity) · .ap-cal-cara (apretar: y = 3,5) · .ap-tira · .ap-tira-dia[data-dia] · .ap-tira-sel.
   Ayuda: elegirDia(tl, cal, 17, at, dur = .2) → duración (apaga la elegida y prende la pedida). */
import { icono } from '../iconos.ts';
import { cls, esc } from './comun.ts';
import '../css/calendario.css';

export interface CalendarioProps {
  mes?: string;
  primerDia?: number;
  dias?: number;
  elegido?: number | false;
  /** días anteriores a `hoy` se ven apagados */
  hoy?: number;
  /** día → cantidad de puntitos */
  eventos?: Record<number, number>;
  ancho?: number;
  className?: string;
}

export const CALENDARIO = { celda: { w: 47.5, h: 45, canto: 3.5 }, paso: 51.25 } as const;

const puntos = (k: number) => (k ? `<span class="ap-cal-puntos">${'<i></i>'.repeat(Math.min(k, 3))}</span>` : '');

export function calendarioMes({
  mes = 'Noviembre 2026', primerDia = 0, dias = 30, elegido = 17, hoy = 17, eventos = { 5: 1, 12: 1, 17: 1, 19: 2, 23: 1, 27: 1 },
  ancho = 368, className = '',
}: CalendarioProps = {}): string {
  const p = CALENDARIO.paso;
  const iniciales = ['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => `<span style="left:${i * p}px">${d}</span>`).join('');
  let celdas = '';
  for (let d = 1; d <= dias; d++) {
    const i = primerDia + d - 1, x = (i % 7) * p, y = Math.floor(i / 7) * p;
    const ev = eventos[d] ?? 0, pasado = d < hoy;
    celdas += `<span class="ap-cal-dia" data-dia="${d}"${ev ? ' data-evento' : ''}${pasado ? ' data-pasado' : ''} style="left:${x}px;top:${y}px">`
      + `<span class="ap-cal-canto"></span><span class="ap-cal-cara"><b>${d}</b>${puntos(ev)}</span>`
      + `<span class="ap-cal-sel" style="opacity:${d === elegido ? 1 : 0}"><span class="ap-cal-canto"></span>`
      + `<span class="ap-cal-cara"><b>${d}</b>${puntos(ev || (d === elegido ? 1 : 0))}</span></span>`
      + '</span>';
  }
  const filas = Math.ceil((primerDia + dias) / 7);
  // la grilla arranca a 95 del borde y deja 13,5 abajo del canto de la última fila (20-e-turnos: 362 de alto con 5 filas)
  return `<div class="${cls('ap-cal', 'ap-caja', className)}" style="width:${ancho}px;height:${(157 + (filas - 1) * p).toFixed(1)}px">`
    + `<span class="ap-cal-flecha" data-lado="izq">${icono('chevron-izq', { tam: 22, trazo: 2.4 })}</span>`
    + `<span class="ap-cal-mes ap-display">${esc(mes)}</span>`
    + `<span class="ap-cal-flecha" data-lado="der">${icono('chevron-der', { tam: 22, trazo: 2.4 })}</span>`
    + `<span class="ap-cal-iniciales">${iniciales}</span>`
    + `<span class="ap-cal-grilla">${celdas}</span></div>`;
}

/** Cruza la capa elegida de un día a otro. Devuelve la duración. */
export function elegirDia(tl: GSAPTimeline, cal: Element, dia: number, at: number, dur = 0.2): number {
  cal.querySelectorAll<HTMLElement>('.ap-cal-dia').forEach(c => {
    tl.to(c.querySelector('.ap-cal-sel'), { opacity: Number(c.dataset.dia) === dia ? 1 : 0, duration: dur, ease: 'power1.out' }, at);
  });
  return dur;
}

export interface TiraDia { nombre: string; numero: number | string }

export function tiraDias({
  dias = [{ nombre: 'HOY', numero: 17 }, { nombre: 'MIÉ', numero: 18 }, { nombre: 'JUE', numero: 19 }, { nombre: 'VIE', numero: 20 }, { nombre: 'SÁB', numero: 21 }, { nombre: 'DOM', numero: 22 }],
  elegido = -1, className = '',
}: { dias?: readonly TiraDia[]; elegido?: number; className?: string } = {}): string {
  const cara = (d: TiraDia) => `<span class="ap-tira-cara"><span class="ap-tira-nombre">${esc(d.nombre)}</span><b>${esc(d.numero)}</b></span>`;
  return `<div class="${cls('ap-tira', className)}">` + dias.map((d, i) => `<span class="ap-tira-dia" data-dia="${esc(d.numero)}">`
    + `<span class="ap-tira-canto"></span>${cara(d)}`
    + `<span class="ap-tira-sel" style="opacity:${i === elegido ? 1 : 0}"><span class="ap-tira-canto"></span>${cara(d)}</span></span>`).join('')
    + '</div>';
}
