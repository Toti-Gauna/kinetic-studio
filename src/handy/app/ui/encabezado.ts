/* Encabezado de la app 2026: logo "Handy" + bajada a la izquierda, botones cuadrados con la campana (globito amarillo
   con el número) y el pin a la derecha. Medido en 01-u-inicio (blanco) y 01/02-e-inicio (azul).
   encabezado({ variante = 'blanco', campana = 2, ubicacion = true, className, id }) → string <header class="ap-encabezado">
     variante 'blanco': fondo transparente (va sobre la pantalla blanca), logo azul, botones azules con canto 3D.
     variante 'azul'  : barra azul de 414×124 desde y = 0 (detrás de la barra de estado: usar phoneFrame({ estado: 'claro' }))
                        con las esquinas de abajo redondeadas (30) y sombra; logo blanco; botones blanco 20 % sin canto.
     campana: número del globito (0 o false = sin globito; el diseño del especialista no lo muestra).
   botonCuadrado({ icono, tono = 'azul', globito, className, estilo }) → el botón suelto (54×58 con canto · 54×54 sin canto).
   Medidas (px de la pantalla 414×896; el header va en left 0 top 0):
     logo: wordmark x 24 → 171 (147 de ancho), y 55,7 → 95 · bajada "Soluciones, no problemas" y 99 → 108.
     botones: campana x 274 · pin x 337 (53,5 × 53,5, radio 16), y 55; canto azul oscuro de 4,4 px abajo (solo 'blanco').
     globito: círculo amarillo de 14 con aro blanco de 2, centro (323, 59,5) = esquina superior derecha de la campana.
   pildoraDireccion({ texto = 'Catamarca 1650 · La Perla' }) → la píldora celeste de la dirección bajo el encabezado
     (01-u-inicio: x 23,6 y 131, 233 × 31,3; pin de 15 + texto azul 13,6 negrita + chevron). Gancho: .ap-direccion.
   Ganchos: .ap-encabezado[data-variante] · .ap-encabezado-fondo (la barra azul) · .ap-encabezado-logo ·
     .ap-encabezado-palabra (el wordmark, svg) · .ap-encabezado-bajada · .ap-boton-cuadrado[data-boton="campana|ubicacion"] ·
     .ap-boton-cuadrado-cara (bajarla 4,4 px en y = apretarlo) · .ap-globito (aparece con scale desde 0) · .ap-globito-numero. */
import { handyLogo } from '../../logo.ts';
import { icono, type Icono } from '../iconos.ts';
import { cls, esc, idAttr } from './comun.ts';
import '../css/encabezado.css';

export type VarianteEncabezado = 'blanco' | 'azul';

export interface EncabezadoProps {
  variante?: VarianteEncabezado;
  /** número del globito de la campana (0/false: sin globito). Default 2 en 'blanco', sin globito en 'azul'. */
  campana?: number | false;
  /** botón del pin de ubicación (default true) */
  ubicacion?: boolean;
  className?: string;
  id?: string;
}

/** Posiciones medidas (px de la pantalla) para las escenas. */
export const ENCABEZADO = {
  alto: 124,
  logo: { x: 24, y: 55.7, w: 147.3, h: 52.3 },
  campana: { x: 273.9, y: 54.9, lado: 53.5 },
  ubicacion: { x: 336.9, y: 54.9, lado: 53.5 },
  canto: 4.4,
  globito: { cx: 322.9, cy: 59.5, d: 18 },
} as const;

export interface BotonCuadradoProps {
  icono: Icono;
  /** 'azul' (con canto 3D, sobre blanco) · 'translucido' (blanco 20 %, sobre azul) */
  tono?: 'azul' | 'translucido';
  /** número del globito amarillo (opcional) */
  globito?: number | false;
  /** data-boton (default el nombre del ícono) */
  boton?: string;
  className?: string;
  /** estilos en línea (posición cuando va suelto) */
  estilo?: string;
}

export function botonCuadrado({ icono: ic, tono = 'azul', globito, boton, className = '', estilo = '' }: BotonCuadradoProps): string {
  return `<span class="${cls('ap-boton-cuadrado', className)}" data-tono="${tono}" data-boton="${esc(boton ?? ic)}"${estilo ? ` style="${estilo}"` : ''}>`
    + (tono === 'azul' ? '<span class="ap-boton-cuadrado-canto"></span>' : '')
    + `<span class="ap-boton-cuadrado-cara">${icono(ic, { tam: 28, trazo: 2.1 })}</span>`
    + (globito ? `<span class="ap-globito"><span class="ap-globito-numero">${esc(globito)}</span></span>` : '')
    + '</span>';
}

export function encabezado({ variante = 'blanco', campana, ubicacion = true, className = '', id }: EncabezadoProps = {}): string {
  const globo = campana === undefined ? (variante === 'blanco' ? 2 : false) : campana;
  const tono = variante === 'azul' ? 'translucido' : 'azul';
  const palabra = handyLogo({ tagline: false, width: ENCABEZADO.logo.w, color: 'currentColor', className: 'ap-encabezado-palabra' });
  return `<header class="${cls('ap-encabezado', 'ap-ui', className)}" data-variante="${variante}"${idAttr(id)}>`
    + (variante === 'azul' ? '<div class="ap-encabezado-fondo"></div>' : '')
    + `<div class="ap-encabezado-logo">${palabra}<span class="ap-encabezado-bajada">Soluciones, no problemas</span></div>`
    + botonCuadrado({ icono: 'campana', tono, globito: globo, boton: 'campana', className: 'ap-encabezado-campana' })
    + (ubicacion ? botonCuadrado({ icono: 'pin', tono, boton: 'ubicacion', className: 'ap-encabezado-ubicacion' }) : '')
    + '</header>';
}

export function pildoraDireccion({ texto = 'Catamarca 1650 · La Perla', className = '', estilo = '' }: { texto?: string; className?: string; estilo?: string } = {}): string {
  return `<span class="${cls('ap-direccion', className)}" style="${estilo}">${icono('pin', { tam: 15, trazo: 2.3 })}`
    + `<span class="ap-direccion-texto">${esc(texto)}</span>${icono('chevron-abajo', { tam: 15, trazo: 2.2, clase: 'ap-direccion-chevron' })}</span>`;
}
