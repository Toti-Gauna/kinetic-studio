/* Barra inferior de la app de usuario: barra azul de 414×88 con cuatro íconos blancos y sus nombres
   (Inicio · Agenda · Mensajes · Cuenta). La pestaña activa va en blanco y negrita; las otras, apagadas.
   bottomNav({ activo = 'inicio', className, id }) → string <nav class="hd-nav">.
   Dentro de una pantalla .hd-app queda pegada abajo (position absolute, bottom 0).
   Ganchos: .hd-nav · .hd-nav-item[data-tab="inicio|agenda|mensajes|cuenta"] (la activa lleva [data-activo]) · .hd-nav-texto. */
import '../css/base.css';
import '../css/ui.css';
import { icon, type IconName } from '../icons.ts';

export type NavTab = 'inicio' | 'agenda' | 'mensajes' | 'cuenta';

export interface BottomNavProps {
  /** pestaña resaltada (default 'inicio') */
  activo?: NavTab;
  className?: string;
  id?: string;
}

/** Las cuatro pestañas, en orden. */
export const NAV_TABS: readonly { tab: NavTab; icono: IconName; texto: string }[] = [
  { tab: 'inicio', icono: 'inicio', texto: 'Inicio' },
  { tab: 'agenda', icono: 'agenda', texto: 'Agenda' },
  { tab: 'mensajes', icono: 'mensajes', texto: 'Mensajes' },
  { tab: 'cuenta', icono: 'cuenta', texto: 'Cuenta' },
];

export function bottomNav({ activo = 'inicio', className = '', id }: BottomNavProps = {}): string {
  const cls = ['hd-nav', 'hd-ui', className].filter(Boolean).join(' ');
  const items = NAV_TABS.map(({ tab, icono, texto }) =>
    `<span class="hd-nav-item" data-tab="${tab}"${tab === activo ? ' data-activo' : ''}>`
    + icon(icono, { size: 28, stroke: tab === activo ? 2.3 : 2 })
    + `<span class="hd-nav-texto">${texto}</span></span>`).join('');
  return `<nav class="${cls}"${id ? ` id="${id.replace(/"/g, '')}"` : ''}>${items}</nav>`;
}
