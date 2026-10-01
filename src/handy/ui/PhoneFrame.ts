/* Teléfono de Handy: marco oscuro de 438×920 (radio 60) con la pantalla blanca de 414×896 (radio 48) y la barra de estado.
   phoneFrame({ pantalla, hora = '10:41', estado = 'oscuro', isla = true, className, id }) → string <div class="hd-telefono">.
   `pantalla` es el HTML de adentro: una o varias capas .hd-capa apiladas (414×896, absolutas), así un mismo teléfono
   muestra transiciones entre pantallas (ver pantallas/usuario.ts). La barra de estado queda siempre arriba de las capas.
   Posición: el div va en left:0 top:0 y se ubica con transform:
     gsap.set(el, { x: TELEFONO_EN_CASA.x, y: TELEFONO_EN_CASA.y })   // = PHONE_HOME.cx - PHONE.w / 2, PHONE_HOME.cy - PHONE.h / 2
   Ganchos: .hd-telefono (mover/escalar el teléfono entero) · .hd-pantalla (la pantalla, recorta a sus capas;
   está a PHONE.bezel = 12 px del borde del marco) · .hd-capa[data-pantalla] · .hd-barra-estado[data-tema] · .hd-barra-hora · .hd-isla. */
import '../css/base.css';
import '../css/ui.css';
import { PHONE, PHONE_HOME } from '../layout.ts';

export interface PhoneFrameProps {
  /** HTML de la pantalla: capas .hd-capa (las de pantallas/usuario.ts ya lo son) */
  pantalla: string;
  /** hora de la barra de estado (default '10:41') */
  hora?: string;
  /** color de los glifos de la barra de estado: 'oscuro' sobre pantallas blancas (default), 'claro' sobre azul */
  estado?: 'oscuro' | 'claro';
  /** isla negra arriba al centro (default true) */
  isla?: boolean;
  className?: string;
  id?: string;
}

/** Dónde poner el teléfono en las escenas de app (x/y del transform del .hd-telefono). */
export const TELEFONO_EN_CASA = { x: PHONE_HOME.cx - PHONE.w / 2, y: PHONE_HOME.cy - PHONE.h / 2 } as const;

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

/** señal: cuatro barras */
const SENAL = '<svg class="hd-barra-senal" width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">'
  + '<rect x="0" y="7.6" width="3.2" height="4.4" rx="1"/><rect x="4.9" y="5.2" width="3.2" height="6.8" rx="1"/>'
  + '<rect x="9.8" y="2.7" width="3.2" height="9.3" rx="1"/><rect x="14.7" y="0" width="3.2" height="12" rx="1"/></svg>';

/** wifi: abanico de tres bandas */
const WIFI = '<svg class="hd-barra-wifi" width="16" height="12" viewBox="0 0 16 12" fill="currentColor" stroke="currentColor" stroke-width=".6" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M.3 3.9A10.9 10.9 0 0 1 15.7 3.9L13.9 5.7A8.3 8.3 0 0 0 2.1 5.7Z"/>'
  + '<path d="M3.1 6.7A6.9 6.9 0 0 1 12.9 6.7L11.1 8.5A4.4 4.4 0 0 0 4.9 8.5Z"/>'
  + '<path d="M8 11.6 5.8 9.4A3.1 3.1 0 0 1 10.2 9.4Z"/></svg>';

/** batería con carga al 80 % */
const BATERIA = '<svg class="hd-barra-bateria" width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">'
  + '<rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" stroke-opacity=".4"/>'
  + '<rect x="2.2" y="2.2" width="16.6" height="8.6" rx="2.2" fill="currentColor"/>'
  + '<path d="M25 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1s-.6-1.8-1.4-2.1z" fill="currentColor" fill-opacity=".45"/></svg>';

export function phoneFrame({ pantalla, hora = '10:41', estado = 'oscuro', isla = true, className = '', id }: PhoneFrameProps): string {
  const cls = ['hd-telefono', 'hd-ui', className].filter(Boolean).join(' ');
  return `<div class="${cls}"${id ? ` id="${esc(id)}"` : ''} style="width:${PHONE.w}px;height:${PHONE.h}px;border-radius:${PHONE.radius}px">`
    + '<span class="hd-telefono-boton" data-lado="izq" style="top:150px;height:30px"></span>'
    + '<span class="hd-telefono-boton" data-lado="izq" style="top:206px;height:58px"></span>'
    + '<span class="hd-telefono-boton" data-lado="izq" style="top:278px;height:58px"></span>'
    + '<span class="hd-telefono-boton" data-lado="der" style="top:226px;height:92px"></span>'
    + `<div class="hd-pantalla" style="left:${PHONE.bezel}px;top:${PHONE.bezel}px;border-radius:${PHONE.screenRadius}px">`
    + pantalla
    + `<div class="hd-barra-estado" data-tema="${estado}">`
    + `<span class="hd-barra-lado"><span class="hd-barra-hora">${esc(hora)}</span></span>`
    + `<span class="hd-barra-lado">${SENAL}${WIFI}${BATERIA}</span>`
    + '</div>'
    + (isla ? '<div class="hd-isla"></div>' : '')
    + '</div></div>';
}
