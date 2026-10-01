/* Barra para escribir, al pie de un chat de Handy: campo blanco redondeado con el placeholder y el ícono de foto,
   y el botón redondo de enviar (como las pantallas originales; el avión va en el azul de la marca).
   chatInput({ placeholder = 'Escribí un mensaje…', className }) → string <div class="hd-chat-entrada">. Alto: 76 px.
   Ganchos: .hd-chat-entrada · .hd-chat-campo · .hd-chat-placeholder · .hd-chat-adjuntar (ícono de foto) · .hd-chat-enviar. */
import '../css/base.css';
import '../css/chat.css';
import { icon } from '../icons.ts';

export interface ChatInputProps {
  placeholder?: string;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function chatInput({ placeholder = 'Escribí un mensaje…', className = '' }: ChatInputProps = {}): string {
  const cls = ['hd-chat-entrada', className].filter(Boolean).join(' ');
  return `<div class="${cls}">`
    + `<div class="hd-chat-campo"><span class="hd-chat-placeholder">${esc(placeholder)}</span>`
    + `<span class="hd-chat-adjuntar">${icon('imagen', { size: 24, stroke: 2 })}</span></div>`
    + `<span class="hd-chat-enviar">${icon('enviar', { size: 24, stroke: 2, fill: 'currentColor' })}</span>`
    + '</div>';
}
