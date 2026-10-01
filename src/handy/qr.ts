/* Código QR como SVG en línea (qrcode-generator, corrección de errores 'M').
   qrSvg(url, { size = 200, color = COLORS.tinta, background = COLORS.blanco, margin = 2, className = '' }) → string <svg>
     url        texto a codificar (se pasa a bytes UTF-8). Vacío o solo espacios → '' (la escena muestra solo el texto).
     size       lado total en px, margen incluido. Para módulos parejos conviene un múltiplo de qrModulos(url, margin).
     color      color de los módulos oscuros (necesita buen contraste con el fondo: tinta o azul sobre blanco).
     background fondo del cuadrado; 'none' = transparente (el margen claro lo tiene que dar lo que haya detrás).
     margin     zona silenciosa en módulos (el estándar pide 4; 2 alcanza en pantalla con un fondo claro alrededor).
   Estructura: svg.hd-qr[data-modulos] (viewBox en módulos, shape-rendering crispEdges)
                 > rect.hd-qr-fondo + path.hd-qr-modulos (un solo path: cada tira horizontal de módulos es un rectángulo).
   Todo el QR es una pieza: se anima entero (scale / autoAlpha sobre el <svg> o su contenedor). */
import qrcode from 'qrcode-generator';
import { COLORS } from './tokens.ts';

export interface QrOptions {
  /** lado total en px, margen incluido (default 200) */
  size?: number;
  /** color de los módulos oscuros (default COLORS.tinta) */
  color?: string;
  /** fondo (default COLORS.blanco); 'none' = transparente */
  background?: string;
  /** zona silenciosa alrededor, en módulos (default 2) */
  margin?: number;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, ch => ESC[ch] ?? ch);

/** qrcode-generator pasa cada carácter a un byte (charCode & 0xff): le damos el texto ya convertido a UTF-8. */
function utf8Binario(s: string): string {
  let out = '';
  for (const b of new TextEncoder().encode(s)) out += String.fromCharCode(b);
  return out;
}

function generar(url: string) {
  const qr = qrcode(0, 'M');
  qr.addData(utf8Binario(url.trim()), 'Byte');
  qr.make();
  return qr;
}

/** Módulos por lado del QR de `url`, margen incluido (0 si url está vacía). */
export function qrModulos(url: string, margin = 2): number {
  if (!url || !url.trim()) return 0;
  return generar(url).getModuleCount() + 2 * margin;
}

export function qrSvg(url: string, { size = 200, color = COLORS.tinta, background = COLORS.blanco, margin = 2, className = '' }: QrOptions = {}): string {
  if (!url || !url.trim()) return '';
  const qr = generar(url);
  const n = qr.getModuleCount(), lado = n + 2 * margin;
  // una tira horizontal de módulos oscuros contiguos = un rectángulo "M x y h w v 1 h -w z"
  let d = '';
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!qr.isDark(r, c)) { c++; continue; }
      const c0 = c;
      while (c < n && qr.isDark(r, c)) c++;
      d += `M${c0 + margin} ${r + margin}h${c - c0}v1h${c0 - c}z`;
    }
  }
  const cls = 'hd-qr' + (className ? ' ' + esc(className) : '');
  const fondo = background && background !== 'none' ? `<rect class="hd-qr-fondo" width="${lado}" height="${lado}" fill="${esc(background)}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" data-modulos="${lado}" viewBox="0 0 ${lado} ${lado}" width="${size}" height="${size}"`
    + ` shape-rendering="crispEdges" role="img" aria-label="Código QR">`
    + `${fondo}<path class="hd-qr-modulos" fill="${esc(color)}" d="${d}"/></svg>`;
}
