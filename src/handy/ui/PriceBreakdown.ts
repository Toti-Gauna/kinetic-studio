/* Desglose de precio: panel azul claro redondeado con filas "concepto … $ 45.000", una línea y el total en grande,
   como el panel de costo de las pantallas originales (en pesos: los números pasan por formatARS).
   priceBreakdown({ filas: [{ etiqueta, valor, texto? }], total: { etiqueta, valor, texto? }, className, id }) → string
   <div class="hd-desglose">. `texto` reemplaza al monto formateado (un descuento: "− $ 4.500").
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
  /** lo que se muestra en lugar de formatARS(valor) (por ejemplo "− $ 4.500" para un descuento) */
  texto?: string;
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
    + `<span class="hd-desglose-valor">${esc(f.texto ?? formatARS(f.valor))}</span></div>`).join('');
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''}>${rows}`
    + `<div class="hd-desglose-total"><span class="hd-desglose-etiqueta">${esc(total.etiqueta)}</span>`
    + `<span class="hd-desglose-total-valor">${esc(total.texto ?? formatARS(total.valor))}</span></div></div>`;
}
