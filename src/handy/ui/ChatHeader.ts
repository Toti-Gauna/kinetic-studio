/* Encabezado de una conversación.
   chatHeader({ nombre, verificado, subtitulo, avatar, atras = true, tema = 'handy', menu, className })
     → string <div class="hd-chat-cabecera" data-tema="handy|mensajeria">.
   tema 'handy' (como las pantallas originales): banda gris, botón de volver cuadrado gris claro a la izquierda,
     nombre en azul centrado (+ sello Verificado) con el subtítulo abajo, y el avatar a la derecha.
   tema 'mensajeria' (escena 2, genérica y sin marcas): banda clara, flecha, avatar del grupo, nombre en negrita y la
     línea de integrantes en gris, alineados a la izquierda.
   avatar: props de avatar() ({ iniciales, color } o { icono, color }); sin avatar → silueta gris "sin foto".
   Alto: 64 px ('handy') · 62 px ('mensajeria').
   Ganchos: .hd-chat-cabecera · .hd-chat-atras · .hd-chat-titulo · .hd-chat-nombre · .hd-chat-subtitulo ·
   .hd-chat-cabecera-avatar. */
import '../css/base.css';
import '../css/chat.css';
import { icon } from '../icons.ts';
import { avatar as avatarHtml, type AvatarProps } from './Avatar.ts';
import { selloVerificado } from './VerifiedBadge.ts';
import type { TemaChat } from './ChatBubble.ts';

export interface ChatHeaderProps {
  nombre: string;
  /** sello azul al lado del nombre */
  verificado?: boolean;
  /** segunda línea: "Jue 15 oct · 16:00", "Vos, Ana, Carlos y más" */
  subtitulo?: string;
  avatar?: Pick<AvatarProps, 'iniciales' | 'color' | 'icono'>;
  /** botón / flecha de volver (default true) */
  atras?: boolean;
  tema?: TemaChat;
  /** tres puntitos a la derecha (solo 'mensajeria'; default true) */
  menu?: boolean;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function chatHeader({
  nombre, verificado = false, subtitulo, avatar, atras = true, tema = 'handy', menu = true, className = '',
}: ChatHeaderProps): string {
  const cls = ['hd-chat-cabecera', className].filter(Boolean).join(' ');
  const handy = tema === 'handy';
  const sello = verificado ? selloVerificado(handy ? 17 : 16, false, 'hd-chat-sello') : '';
  const titulo = `<div class="hd-chat-titulo">`
    + `<div class="hd-chat-nombre"><span class="hd-chat-nombre-texto">${esc(nombre)}</span>${sello}</div>`
    + (subtitulo ? `<div class="hd-chat-subtitulo">${esc(subtitulo)}</div>` : '')
    + `</div>`;
  const av = `<span class="hd-chat-cabecera-avatar">${avatarHtml({ ...avatar, tamano: handy ? 44 : 40 })}</span>`;

  if (handy) {
    return `<div class="${cls}" data-tema="handy">`
      + (atras ? `<span class="hd-chat-atras">${icon('atras', { size: 24, stroke: 2.3 })}</span>` : '<span class="hd-chat-atras-vacio"></span>')
      + titulo + av + '</div>';
  }
  return `<div class="${cls}" data-tema="mensajeria">`
    + (atras ? `<span class="hd-chat-atras">${icon('chevron-izq', { size: 26, stroke: 2.2 })}</span>` : '')
    + av + titulo
    + (menu ? `<span class="hd-chat-menu">${icon('menu', { size: 22, stroke: 2.6 })}</span>` : '')
    + '</div>';
}
