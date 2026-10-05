/* Ayudas compartidas por los componentes de la app 2026 (src/handy/app/ui): escapar texto, armar clases y el id.
   Todos los componentes devuelven strings de HTML; importan app.css (tokens + base) a través de este módulo. */
import '../fuentes.ts';
import '../css/app.css';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** Escapa texto para meterlo en HTML (contenido o atributo). */
export const esc = (s: string | number): string => String(s).replace(/[&<>"]/g, c => ESC[c] ?? c);

/** Une clases ignorando las vacías: cls('ap-boton', extra) */
export const cls = (...c: (string | false | undefined | null)[]): string => c.filter(Boolean).join(' ');

/** ` id="…"` o nada */
export const idAttr = (id?: string): string => (id ? ` id="${esc(id)}"` : '');

/** "$ 45.000": pesos sin decimales, punto de miles y espacio duro después del signo (como en las fotos). */
export function pesos(valor: number): string {
  const s = Math.round(Math.abs(valor)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${valor < 0 ? '− ' : ''}$ ${s}`;
}
