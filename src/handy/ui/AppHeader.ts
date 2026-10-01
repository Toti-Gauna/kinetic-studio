/* Encabezado de la app de Handy: logo (wordmark ~150 px con la bajada) a la izquierda y botones cuadrados azules
   redondeados con la campana y el pin de ubicación en blanco, como en las pantallas originales.
   appHeader({ campana = true, ubicacion = true, variante = 'blanco', atras = false, titulo, className, id })
     → string <header class="hd-header">.
   variante 'azul': barra azul (se extiende detrás de la barra de estado; usar phoneFrame({ estado: 'claro' })), logo blanco.
   atras / titulo: segunda fila con la flecha de volver y el título en negrita ("Confirmá tu pedido").
   Va como primer hijo de una pantalla .hd-app (que ya deja el aire de la barra de estado). Alto: 72 px (+54 con la fila de título).
   Ganchos: .hd-header[data-variante] · .hd-header-logo · .hd-header-boton[data-boton="campana|ubicacion"] ·
   .hd-header-sub · .hd-header-atras · .hd-header-titulo. */
import '../css/base.css';
import '../css/ui.css';
import { handyLogo } from '../logo.ts';
import { icon } from '../icons.ts';
import { COLORS } from '../tokens.ts';

export interface AppHeaderProps {
  /** botón de notificaciones (default true) */
  campana?: boolean;
  /** botón de ubicación (default true) */
  ubicacion?: boolean;
  /** 'blanco' (default): fondo blanco y logo azul · 'azul': barra azul y logo blanco */
  variante?: 'blanco' | 'azul';
  /** flecha de volver en la fila del título (default false) */
  atras?: boolean;
  /** título de la segunda fila; sin título ni flecha no hay segunda fila */
  titulo?: string;
  className?: string;
  id?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

export function appHeader({ campana = true, ubicacion = true, variante = 'blanco', atras = false, titulo, className = '', id }: AppHeaderProps = {}): string {
  const cls = ['hd-header', 'hd-ui', className].filter(Boolean).join(' ');
  // lockup compacto (bajada del ancho del wordmark), como el encabezado de pantalla-inicio.png
  const logo = handyLogo({ tagline: 'compacta', width: 150, color: variante === 'azul' ? COLORS.blanco : COLORS.azul });
  const botones = [
    campana ? `<span class="hd-header-boton" data-boton="campana">${icon('campana', { size: 31, stroke: 1.9, fill: 'currentColor' })}</span>` : '',
    ubicacion ? `<span class="hd-header-boton" data-boton="ubicacion">${icon('ubicacion', { size: 31, stroke: 1.9, fill: 'currentColor' })}</span>` : '',
  ].join('');
  const sub = atras || titulo
    ? '<div class="hd-header-sub">'
      + (atras ? `<span class="hd-header-atras">${icon('atras', { size: 32, stroke: 2.2 })}</span>` : '')
      + (titulo ? `<h2 class="hd-header-titulo">${esc(titulo)}</h2>` : '')
      + '</div>'
    : '';
  return `<header class="${cls}" data-variante="${variante}"${id ? ` id="${esc(id)}"` : ''}>`
    + `<div class="hd-header-fila"><span class="hd-header-logo">${logo}</span><span class="hd-header-botones">${botones}</span></div>`
    + sub
    + '</header>';
}
