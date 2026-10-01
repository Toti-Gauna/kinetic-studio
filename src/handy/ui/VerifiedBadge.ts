/* Insignia "Verificado" de Handy: sello azul festoneado con tilde blanco, como el de las cuentas de empresa
   verificadas de las apps de mensajería, más la palabra (opcional).
   verifiedBadge({ conTexto = true, tamano = 16, texto = 'Verificado', sobreAzul = false, className })
     → string <span class="hd-verificado">.
   sobreAzul: sello blanco con tilde azul y texto blanco, para encabezados o paneles azules.
   Ganchos: .hd-verificado > .hd-verificado-sello (svg) + .hd-verificado-texto. */
import '../css/base.css';
import '../css/chat.css';

export interface VerifiedBadgeProps {
  /** mostrar la palabra al lado del sello (default true) */
  conTexto?: boolean;
  /** lado del sello en px (default 16); el texto acompaña (≈ 0,78 × tamano) */
  tamano?: number;
  /** default "Verificado" */
  texto?: string;
  /** variante para fondos azules */
  sobreAzul?: boolean;
  className?: string;
}

/** contorno festoneado del sello (lucide badge-check, ISC) */
const SELLO = 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

/** Solo el sello, como string <svg> (para usarlo dentro de otros componentes). */
export function selloVerificado(tamano = 16, sobreAzul = false, className = ''): string {
  const fondo = sobreAzul ? '#FFFFFF' : 'var(--hd-azul-handy)';
  const tilde = sobreAzul ? 'var(--hd-azul)' : '#FFFFFF';
  return `<svg class="hd-verificado-sello${className ? ' ' + className : ''}" viewBox="0 0 24 24" width="${tamano}" height="${tamano}" aria-hidden="true">`
    + `<path d="${SELLO}" fill="${fondo}" stroke="${fondo}" stroke-width="1.8" stroke-linejoin="round"/>`
    + `<path d="m16 9-5.5 5.5L8 12" fill="none" stroke="${tilde}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function verifiedBadge({ conTexto = true, tamano = 16, texto = 'Verificado', sobreAzul = false, className = '' }: VerifiedBadgeProps = {}): string {
  const cls = ['hd-verificado', sobreAzul ? 'hd-verificado--sobre-azul' : '', className].filter(Boolean).join(' ');
  const t = conTexto
    ? `<span class="hd-verificado-texto" style="font-size:${Math.round(tamano * 0.78 * 10) / 10}px">${esc(texto)}</span>`
    : '';
  return `<span class="${cls}" style="gap:${Math.max(3, Math.round(tamano * 0.25))}px">${selloVerificado(tamano, sobreAzul)}${t}</span>`;
}
