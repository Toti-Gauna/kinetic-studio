/* Desglose de precios de la app 2026: filas texto · monto, separadores y el total. Medido en 09-u-confirmar
   ("Mano de obra $ 32.000 … Total final para vos $ 47.250") y 15-e-trabajo ("Tu cuenta del trabajo … Recibís $ 40.500").
   desglose({ filas, total, paso = 26.2, ancho, className }) → <div class="ap-desglose">
     filas: { texto, monto, fuerte?, tono?: 'tinta'|'rojo'|'verde', antes?: 'punteado'|'linea', dato? }[]
       texto DM Sans 400 14,6 gris (fuerte: 700 tinta) · monto DM Sans 700 14,6 tinta (rojo #D93025 / verde #1E9E57),
       alineado a la derecha; una fila cada `paso` px. `antes` dibuja un separador arriba de la fila: punteado fino
       #E6E9EF (1,1 de grueso, trazos de 4 cada 6,5) o filete #EBEDF2; 3 de aire arriba y 1,5 abajo (15-e-trabajo).
     total: { texto, monto, tono = 'azul', display = true, antes = 'punteado' } → texto 700 16,5 tinta y el monto en
       Archivo 900 de 22 al 106 % (azul "$ 47.250", 101 × 17,8 en 09-u-confirmar) o, con display false, DM Sans 700 17
       (verde "Recibís $ 40.500"). Su separador lleva 5,4 de aire arriba; la letra del total arranca 14,5 (display) o
       12,4 debajo de la línea.
     monto acepta número (sale con pesos(): "$ 45.000", negativos "− $ 4.500") o el texto ya armado.
   Ganchos: .ap-desglose · .ap-desglose-fila[data-fila] (aparecen de a una con y/opacity) · .ap-desglose-texto ·
     .ap-desglose-monto · .ap-desglose-separador · .ap-desglose-total · .ap-desglose-total-monto (pop con scale). */
import { cls, esc, pesos } from './comun.ts';
import '../css/desglose.css';

export interface FilaDesglose {
  texto: string;
  monto: number | string;
  fuerte?: boolean;
  tono?: 'tinta' | 'rojo' | 'verde';
  antes?: 'punteado' | 'linea';
  dato?: string;
}

export interface TotalDesglose {
  texto: string;
  monto: number | string;
  tono?: 'azul' | 'verde' | 'tinta';
  /** monto en Archivo (default true) */
  display?: boolean;
  antes?: 'punteado' | 'linea' | false;
}

const montoTexto = (m: number | string) => (typeof m === 'number' ? pesos(m) : m);
const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function desglose({ filas, total, paso = 26.2, ancho, className = '' }: { filas: readonly FilaDesglose[]; total?: TotalDesglose; paso?: number; ancho?: number; className?: string }): string {
  const sep = (t?: 'punteado' | 'linea' | false, lugar = 'fila') => (t ? `<span class="ap-desglose-separador" data-tipo="${t}" data-lugar="${lugar}"></span>` : '');
  const html = filas.map(f => sep(f.antes)
    + `<div class="ap-desglose-fila" data-fila="${esc(f.dato ?? slug(f.texto))}"${f.fuerte ? ' data-fuerte' : ''} style="height:${paso}px">`
    + `<span class="ap-desglose-texto">${esc(f.texto)}</span>`
    + `<span class="ap-desglose-monto" data-tono="${f.tono ?? 'tinta'}">${esc(montoTexto(f.monto))}</span></div>`).join('')
    + (total
      ? sep(total.antes === undefined ? 'punteado' : total.antes, 'total')
        + `<div class="ap-desglose-total" data-tono="${total.tono ?? 'azul'}"${total.display === false ? '' : ' data-display'}>`
        + `<span class="ap-desglose-texto">${esc(total.texto)}</span>`
        + `<span class="ap-desglose-total-monto">${esc(montoTexto(total.monto))}</span></div>`
      : '');
  return `<div class="${cls('ap-desglose', className)}"${ancho ? ` style="width:${ancho}px"` : ''}>${html}</div>`;
}
