/* Calendario de un mes (pestaña Agenda del especialista): banda azul clara con el mes y las flechas, fila de los días de
   la semana empezando el lunes (Lu Ma Mi Ju Vi Sá Do) y la grilla de días en cuadraditos blancos sobre gris, como el
   calendario de las pantallas originales.
   calendario({ anio = 2026, mes = 9 (0 = enero: 9 = octubre), marcados = [], icono = 'plomeria', className, id })
     → string <div class="hd-calendario" data-anio data-mes>.
   Los días marcados llevan encima la capa .hd-cal-marca (cuadradito azul con el número en blanco y el ícono del rubro),
   visible en el estado final; para un "pop": gsap.set(marca, { scale: 0, opacity: 0 }) al construir y
   tl.to(marca, { scale: 1, opacity: 1, ease: 'back.out(3)' }) en el timeline (transformOrigin al centro, ya en el CSS).
   Medidas: 370 px de ancho por defecto (el ancho del cuerpo de la pantalla); celdas de 44 × 46 (6 px entre columnas, 7 entre filas).
   primerDiaSemana(anio, mes) → 0 = lunes … 6 = domingo (1 oct 2026 = 3, jueves).
   Ganchos: .hd-calendario · .hd-cal-cabeza · .hd-cal-mes · .hd-cal-flecha[data-lado="izq|der"] · .hd-cal-semana >
   .hd-cal-dsem · .hd-cal-grilla > .hd-cal-hueco (antes del 1) + .hd-cal-dia[data-dia="1…31"] (con [data-marcado] los
   marcados) > .hd-cal-num + .hd-cal-marca > .hd-cal-marca-num + .hd-cal-marca-icono. */
import '../css/base.css';
import '../css/especialista.css';
import { icon, type IconName } from '../icons.ts';

export interface CalendarioProps {
  anio?: number;
  /** 0 = enero … 11 = diciembre (default 9: octubre) */
  mes?: number;
  /** días con la marca azul (default ninguno) */
  marcados?: number[];
  /** ícono de los días marcados (default 'plomeria') */
  icono?: IconName;
  className?: string;
  id?: string;
}

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre',
  'Noviembre', 'Diciembre'] as const;
export const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'] as const;

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

/** Día de la semana del 1.º del mes, con la semana empezando el lunes (0 = lunes … 6 = domingo). */
export function primerDiaSemana(anio: number, mes: number): number {
  return (new Date(Date.UTC(anio, mes, 1)).getUTCDay() + 6) % 7;
}

/** Cantidad de días del mes. */
export function diasDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
}

export function calendario({ anio = 2026, mes = 9, marcados = [], icono = 'plomeria', className = '', id }: CalendarioProps = {}): string {
  const cls = ['hd-calendario', 'hd-ui', className].filter(Boolean).join(' ');
  const huecos = primerDiaSemana(anio, mes);
  const n = diasDelMes(anio, mes);
  const celdas = Array.from({ length: huecos }, () => '<span class="hd-cal-hueco"></span>').join('')
    + Array.from({ length: n }, (_, k) => {
      const dia = k + 1;
      const marcado = marcados.includes(dia);
      return `<span class="hd-cal-dia" data-dia="${dia}"${marcado ? ' data-marcado' : ''}><span class="hd-cal-num">${dia}</span>`
        + (marcado
          ? `<span class="hd-cal-marca"><span class="hd-cal-marca-num">${dia}</span>`
            + `<span class="hd-cal-marca-icono">${icon(icono, { size: 15, stroke: 2.3 })}</span></span>`
          : '')
        + '</span>';
    }).join('');
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''} data-anio="${anio}" data-mes="${mes}">`
    + '<div class="hd-cal-cabeza">'
    + `<span class="hd-cal-flecha" data-lado="izq">${icon('chevron-izq', { size: 24, stroke: 2.6 })}</span>`
    + `<span class="hd-cal-mes">${MESES[mes]} ${anio}</span>`
    + `<span class="hd-cal-flecha" data-lado="der">${icon('chevron-der', { size: 24, stroke: 2.6 })}</span>`
    + '</div>'
    + `<div class="hd-cal-semana">${DIAS_SEMANA.map(d => `<span class="hd-cal-dsem">${d}</span>`).join('')}</div>`
    + `<div class="hd-cal-grilla">${celdas}</div>`
    + '</div>';
}
