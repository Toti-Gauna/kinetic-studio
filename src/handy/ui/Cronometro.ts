/* Cronómetro "mm:ss" de la app del especialista (Trabajo en curso), con cada dígito en su propia ventana: adentro de cada
   ventana hay una tira vertical con los dígitos (0 arriba … 9, y otro 0 al pie) que se mueve con y, así el reloj salta de
   00:00 a 42:15 animando solo transform (o con tl.set para un corte seco).
   cronometro({ valor = '42:15', tamano = 80, className, id }) → string <div class="hd-crono" data-fila="…">.
   `tamano` es el cuerpo en px; cada fila de la tira mide round(tamano × 1,12) (data-fila) y cada ventana
   round(tamano × 0,64) de ancho (cifras tabulares: el reloj no baila).
   Ayudas:
     cronoY(digito, fila)                                   y de una tira para mostrar ese dígito: −digito × fila
                                                            (10 → el 0 del pie: para rodar de 9 a 0 hacia abajo)
     ponerCrono(el, '00:00')                                al construir: deja ese valor (gsap.set de las cuatro tiras)
     saltarCrono(tl, el, '12:40', at, { dur = .35, ease = 'power3.out', stagger = 0 })
                                                            cada tira rueda hasta su dígito (dur 0 → tl.set: salto seco)
                                                            → duración
   Ganchos: .hd-crono[data-fila][data-valor] · .hd-crono-digito[data-i="0|1|2|3"] (ventana: m m : s s, sin contar los dos
   puntos) · .hd-crono-tira (lo que se mueve) · .hd-crono-num[data-n="0…9"] (11 por tira) · .hd-crono-sep (los dos puntos: titilar con
   opacity). */
import { gsap } from 'gsap';
import '../css/base.css';
import '../css/especialista.css';

export interface CronometroProps {
  /** "mm:ss" (default '42:15') */
  valor?: string;
  /** cuerpo de los dígitos en px (default 80) */
  tamano?: number;
  className?: string;
  id?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

/** Alto de una fila de la tira (px) para un cuerpo dado. */
export function cronoFila(tamano = 80): number {
  return Math.round(tamano * 1.12);
}

/** y de la tira para mostrar `digito` (0–9). */
export function cronoY(digito: number, fila: number): number {
  return -Math.max(0, Math.min(10, digito)) * fila;
}

/** '42:15' → [4, 2, 1, 5] (lo que no sea dígito se ignora; faltantes = 0). */
function digitos(valor: string): number[] {
  const d = valor.replace(/\D/g, '').padStart(4, '0').slice(-4);
  return d.split('').map(Number);
}

export function cronometro({ valor = '42:15', tamano = 80, className = '', id }: CronometroProps = {}): string {
  const cls = ['hd-crono', className].filter(Boolean).join(' ');
  const fila = cronoFila(tamano);
  const ancho = Math.round(tamano * 0.64);
  // 0…9 y otro 0 al final: deja rodar de 9 a 0 hacia abajo y evita que la tira mida 10 filas (GSAP lee un translate de
  // exactamente −50 % del alto como yPercent: con el 5 en una tira de 10 filas, la y se duplicaría)
  const nums = Array.from({ length: 11 }, (_, n) => `<span class="hd-crono-num" data-n="${n % 10}">${n % 10}</span>`).join('');
  const ventana = (i: number, d: number) =>
    `<span class="hd-crono-digito" data-i="${i}" style="width:${ancho}px;height:${fila}px">`
    + `<span class="hd-crono-tira" style="transform:translate(0px, ${cronoY(d, fila)}px)">${nums}</span></span>`;
  const [a, b, c, d] = digitos(valor);
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''} data-fila="${fila}" data-valor="${esc(valor)}"`
    + ` style="font-size:${tamano}px;--hd-crono-fila:${fila}px">`
    + ventana(0, a) + ventana(1, b)
    + `<span class="hd-crono-sep" style="height:${fila}px">:</span>`
    + ventana(2, c) + ventana(3, d)
    + '</div>';
}

const tiras = (el: Element) => Array.from(el.querySelectorAll<HTMLElement>('.hd-crono-tira'));
const filaDe = (el: Element) => Number((el as HTMLElement).dataset?.fila) || cronoFila();

/** Al construir la escena: deja el cronómetro en `valor` ("mm:ss"). */
export function ponerCrono(el: Element, valor: string): void {
  const fila = filaDe(el);
  const d = digitos(valor);
  tiras(el).forEach((t, i) => gsap.set(t, { y: cronoY(d[i], fila) }));
}

/** Lleva el cronómetro a `valor`: cada tira rueda hasta su dígito (con dur 0, un tl.set: salto seco). Devuelve la duración. */
export function saltarCrono(
  tl: GSAPTimeline, el: Element, valor: string, at: number,
  { dur = 0.35, ease = 'power3.out', stagger = 0 }: { dur?: number; ease?: string; stagger?: number } = {},
): number {
  const fila = filaDe(el);
  const d = digitos(valor);
  tiras(el).forEach((t, i) => {
    if (dur <= 0) tl.set(t, { y: cronoY(d[i], fila) }, at);
    else tl.to(t, { y: cronoY(d[i], fila), duration: dur, ease }, at + i * stagger);
  });
  return dur <= 0 ? 0 : dur + stagger * 3;
}
