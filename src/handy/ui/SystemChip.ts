/* Aviso del sistema dentro de un chat: píldora centrada con ícono y texto corto.
   systemChip({ icono, texto, tono = 'azul', className }) → string <div class="hd-chip-sistema" data-tono="azul|neutro">.
   Ejemplos: { icono: 'escudo', texto: 'Tu pedido llegó a especialistas verificados.' } ·
             { icono: 'candado', texto: 'Tu teléfono no se comparte' }.
   Dentro de una lista en columna se centra solo. Ganchos: .hd-chip-sistema · .hd-chip-sistema-icono · .hd-chip-sistema-texto. */
import '../css/base.css';
import '../css/chat.css';
import { icon, type IconName } from '../icons.ts';

export interface SystemChipProps {
  icono?: IconName;
  texto: string;
  /** 'azul' (default): fondo celeste y texto azul · 'neutro': fondo blanco y texto gris */
  tono?: 'azul' | 'neutro';
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function systemChip({ icono, texto, tono = 'azul', className = '' }: SystemChipProps): string {
  const cls = ['hd-chip-sistema', className].filter(Boolean).join(' ');
  return `<div class="${cls}" data-tono="${tono}">`
    + (icono ? `<span class="hd-chip-sistema-icono">${icon(icono, { size: 16, stroke: 2.3 })}</span>` : '')
    + `<span class="hd-chip-sistema-texto">${esc(texto)}</span></div>`;
}
