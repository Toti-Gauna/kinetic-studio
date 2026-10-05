/* Avatar con iniciales y píldora "Verificado" de la app 2026 (sin nombres propios: "E1", "E2", "LP").
   avatar({ iniciales, tam = 52, tono = 'tinta', tilde = false, className }) → string <span class="ap-avatar">
     tono 'tinta' #1D2C4A (E2 en 01-u-inicio) · 'azul' #1F57A8 (E1) · 'medio' #4A6FB2 (E3) · 'vivo' #2F6BFF.
     Iniciales en Archivo expandida 900, blancas, a 0,31 del lado. tilde: círculo verde con tilde blanca y aro blanco,
     abajo a la derecha (en 52: verde de 15,6 con aro de 2, centro a (44,5 , 44,7) del avatar).
   pildoraVerificado({ texto = 'Verificado' }) → verde #E3F5EA con tilde en círculo y texto verde negrita (18 de alto).
   Ganchos: .ap-avatar[data-tono] · .ap-avatar-iniciales · .ap-avatar-tilde (aparece con scale desde 0) · .ap-verificado. */
import { icono } from '../iconos.ts';
import { cls, esc } from './comun.ts';
import '../css/avatar.css';

export type TonoAvatar = 'tinta' | 'azul' | 'medio' | 'vivo';

export interface AvatarProps {
  iniciales: string;
  /** diámetro en px (default 52) */
  tam?: number;
  tono?: TonoAvatar;
  /** tilde verde de verificado (default false) */
  tilde?: boolean;
  className?: string;
}

export function avatar({ iniciales, tam = 52, tono = 'tinta', tilde = false, className = '' }: AvatarProps): string {
  const t = tam * 0.3;
  const dTilde = tam * 0.3;
  return `<span class="${cls('ap-avatar', className)}" data-tono="${tono}" style="width:${tam}px;height:${tam}px">`
    + `<span class="ap-avatar-iniciales" style="font-size:${(tam * 0.31).toFixed(1)}px">${esc(iniciales)}</span>`
    + (tilde
      ? `<span class="ap-avatar-tilde" style="width:${dTilde.toFixed(1)}px;height:${dTilde.toFixed(1)}px;left:${(tam * 0.856 - dTilde / 2).toFixed(1)}px;top:${(tam * 0.86 - dTilde / 2).toFixed(1)}px">`
        + `${icono('tilde', { tam: Math.round(t * 0.62), trazo: 3.6 })}</span>`
      : '')
    + '</span>';
}

export function pildoraVerificado({ texto = 'Verificado', className = '' }: { texto?: string; className?: string } = {}): string {
  return `<span class="${cls('ap-verificado', className)}">${icono('verificado', { tam: 12, trazo: 2.4 })}<span>${esc(texto)}</span></span>`;
}
