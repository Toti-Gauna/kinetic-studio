/* Desglose de precio: panel azul claro redondeado con filas "concepto … $ 45.000", una línea y el total en grande,
   como el panel de costo de las pantallas originales (en pesos: los números pasan por formatARS).
   priceBreakdown({ filas: [{ etiqueta, valor }], total: { etiqueta, valor }, className, id }) → string <div class="hd-desglose">.
   Ejemplo (confirmación): const p = priceWithFee(45000);
     priceBreakdown({ filas: [{ etiqueta: 'Presupuesto de Martín R.', valor: p.budget },
                              { etiqueta: 'Tarifa de servicio Handy (5%)', valor: p.fee }],
                      total: { etiqueta: 'Total', valor: p.total } })
   Ganchos: .hd-desglose · .hd-desglose-fila[data-i] · .hd-desglose-etiqueta · .hd-desglose-valor ·
   .hd-desglose-total · .hd-desglose-total-valor. */
import '../css/base.css';
import '../css/ui.css';
import { formatARS } from '../tokens.ts';

export interface PriceRow {
  etiqueta: string;
  /** en pesos (número; se formatea como "$ 45.000") */
  valor: number;
}

export interface PriceBreakdownProps {
  filas: PriceRow[];
  total: PriceRow;
  className?: string;
  id?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function priceBreakdown({ filas, total, className = '', id }: PriceBreakdownProps): string {
  const cls = ['hd-desglose', 'hd-ui', className].filter(Boolean).join(' ');
  const rows = filas.map((f, i) =>
    `<div class="hd-desglose-fila" data-i="${i}"><span class="hd-desglose-etiqueta">${esc(f.etiqueta)}</span>`
    + `<span class="hd-desglose-valor">${formatARS(f.valor)}</span></div>`).join('');
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''}>${rows}`
    + `<div class="hd-desglose-total"><span class="hd-desglose-etiqueta">${esc(total.etiqueta)}</span>`
    + `<span class="hd-desglose-total-valor">${formatARS(total.valor)}</span></div></div>`;
}
