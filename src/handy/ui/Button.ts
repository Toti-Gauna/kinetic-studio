/* Botón de la app de Handy: píldora de 56 px de alto con texto en negrita y un ícono opcional a la izquierda.
   button({ texto, variante = 'primario', icono, id, accion, ancho = 'completo', className }) → string <div class="hd-boton">.
   Variantes: 'primario' azul · 'secundario' azul claro · 'exito' verde · 'peligro' rojo · 'contorno' blanco con borde azul.
   ancho 'completo' ocupa el ancho del contenedor; 'auto' se ajusta al texto.
   Para "apretarlo" la escena anima scale (p. ej. 1 → .96 → 1) en el momento del toque del dedo.
   `accion` pone data-accion (gancho estable sin ids repetidos si dos escenas arman la misma pantalla).
   Ganchos: .hd-boton[data-variante][data-accion] (#id si se pasa) · .hd-boton-icono · .hd-boton-texto. */
import '../css/base.css';
import '../css/ui.css';
import { icon, type IconName } from '../icons.ts';

export type ButtonVariant = 'primario' | 'secundario' | 'exito' | 'peligro' | 'contorno';

export interface ButtonProps {
  texto: string;
  /** default 'primario' */
  variante?: ButtonVariant;
  /** ícono a la izquierda del texto */
  icono?: IconName;
  id?: string;
  /** data-accion del botón, p. ej. 'confirmar' */
  accion?: string;
  /** 'completo' (default) o 'auto' */
  ancho?: 'completo' | 'auto';
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function button({ texto, variante = 'primario', icono, id, accion, ancho = 'completo', className = '' }: ButtonProps): string {
  const cls = ['hd-boton', 'hd-ui', className].filter(Boolean).join(' ');
  return `<div class="${cls}" data-variante="${variante}"${ancho === 'auto' ? ' data-ancho="auto"' : ''}${accion ? ` data-accion="${esc(accion)}"` : ''}${id ? ` id="${esc(id)}"` : ''}>`
    + (icono ? `<span class="hd-boton-icono">${icon(icono, { size: 22, stroke: 2.3 })}</span>` : '')
    + `<span class="hd-boton-texto">${esc(texto)}</span></div>`;
}
