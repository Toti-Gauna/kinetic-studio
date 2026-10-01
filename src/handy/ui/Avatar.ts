/* Avatar redondo de Handy (chats, presupuestos, confirmación, mapa).
   avatar({ iniciales, color, tamano = 44, icono, anillo, className }) → string <span class="hd-avatar">.
   Tres variantes:
     - iniciales: "MR" en blanco, negrita, sobre un círculo de `color` (default azul Handy);
     - icono: un ícono blanco de icons.ts sobre el círculo (hilos de la app, grupos de chat);
     - sin iniciales ni ícono: el avatar gris "sin foto" de las pantallas originales (silueta negra).
   anillo: borde blanco (para apoyarlo sobre el mapa o sobre fondos de color).
   Ganchos: .hd-avatar[data-iniciales="MR"] · .hd-avatar[data-icono="plomeria"] · .hd-avatar--vacio. */
import '../css/base.css';
import '../css/chat.css';
import { icon, type IconName } from '../icons.ts';

export interface AvatarProps {
  /** iniciales a mostrar ("MR"); se usan hasta 2 letras */
  iniciales?: string;
  /** fondo del círculo (default var(--hd-azul)) */
  color?: string;
  /** diámetro en px (default 44) */
  tamano?: number;
  /** en lugar de iniciales: un ícono blanco */
  icono?: IconName;
  /** borde blanco (≈ 7 % del diámetro, mínimo 2 px) */
  anillo?: boolean;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);
const r1 = (n: number) => Math.round(n * 10) / 10;

export function avatar({ iniciales, color, tamano = 44, icono, anillo = false, className = '' }: AvatarProps = {}): string {
  const ini = (iniciales ?? '').trim().slice(0, 2).toUpperCase();
  const vacio = !ini && !icono;
  const cls = ['hd-avatar', vacio ? 'hd-avatar--vacio' : '', anillo ? 'hd-avatar--anillo' : '', className].filter(Boolean).join(' ');
  const estilo = [
    `width:${tamano}px`,
    `height:${tamano}px`,
    `font-size:${r1(tamano * 0.38)}px`,
    !vacio && color ? `background:${color}` : '',
    anillo ? `border-width:${Math.max(2, Math.round(tamano * 0.07))}px` : '',
  ].filter(Boolean).join(';');
  const dato = ini ? ` data-iniciales="${esc(ini)}"` : icono ? ` data-icono="${icono}"` : '';
  const dentro = ini
    ? esc(ini)
    : icon(icono ?? 'cuenta', { size: Math.round(tamano * (icono ? 0.52 : 0.66)), stroke: icono ? 2.1 : 1.9 });
  return `<span class="${cls}"${dato} style="${estilo}">${dentro}</span>`;
}
