/* Partes de los pasos del pedido del usuario (app 2026): el botón Volver, la cabecera del paso (Volver + título + bajada)
   y el pie fijo blanco con su degradé de sombra. Medidos en 03-u-describir, 04-u-buscando y 27-u-programar (sirven
   también para 05-u-presupuestos, que tiene la misma cabecera). CSS en css/ua.css.
   botonVolver({ tono = 'gris', estilo, className }) → <span class="ap-ua-volver" data-tono>: cara de 48,8 × 48,5 (radio 14)
     con canto #D3D6DC de 3,8 abajo y la flecha tinta de 22 al centro. tono 'gris' (#ECECEC: 03, 27, 05) · 'blanco'
     (blanco con sombra suave: sobre el mapa de 04-u-buscando). Apretarlo: bajar .ap-ua-volver-cara con y = 3,8.
   cabeceraPaso({ titulo, bajada, icono, className }) → bloque de pantalla: Volver en (23,6 · 131,5) y, a su derecha,
     el título en Archivo 900 de 24,2 (x 87, mayúscula 137,7 → 154,3) y la bajada gris DM Sans 500 de 14 (base 172,5),
     con un ícono azul chico adelante si se pide (27-u-programar: la canilla de "Plomería · Programado").
   pieFijo({ cuerpo, top, className }) → panel blanco desde `top` hasta abajo de la pantalla, con un degradé gris de 18 px
     encima (el contenido de arriba "pasa por debajo", como en 03/27). `cuerpo` va en coordenadas del panel.
   Ganchos: .ap-ua-volver[data-tono] · .ap-ua-volver-canto · .ap-ua-volver-cara · .ap-ua-paso · .ap-ua-paso-titulo ·
     .ap-ua-paso-bajada · .ap-ua-pie · .ap-ua-pie-sombra. */
import { icono as dibujarIcono, type Icono } from '../iconos.ts';
import { cls, esc } from './comun.ts';
import '../css/ua.css';

/** Posiciones medidas de la cabecera de paso (px de la pantalla). */
export const PASO = {
  volver: { x: 23.6, y: 131.5, w: 48.8, h: 48.5, canto: 3.8 },
  titulo: { x: 87, mayuscula: 137.7, base: 154.3 },
  bajada: { x: 86.6, base: 172.5 },
} as const;

export function botonVolver({ tono = 'gris', estilo = '', className = '' }: { tono?: 'gris' | 'blanco'; estilo?: string; className?: string } = {}): string {
  return `<span class="${cls('ap-ua-volver', className)}" data-tono="${tono}"${estilo ? ` style="${estilo}"` : ''}>`
    + '<span class="ap-ua-volver-canto"></span>'
    + `<span class="ap-ua-volver-cara">${dibujarIcono('flecha-izq', { tam: 22, trazo: 2.4 })}</span>`
    + '</span>';
}

export interface CabeceraPasoProps {
  titulo: string;
  bajada?: string;
  /** ícono azul antes de la bajada (opcional) */
  icono?: Icono;
  className?: string;
}

export function cabeceraPaso({ titulo, bajada = '', icono, className = '' }: CabeceraPasoProps): string {
  return `<div class="${cls('ap-ua-paso', className)}">`
    + botonVolver({ estilo: `left:${PASO.volver.x}px;top:${PASO.volver.y}px` })
    + `<h2 class="ap-ua-paso-titulo ap-display">${esc(titulo)}</h2>`
    + (bajada
      ? `<span class="ap-ua-paso-bajada">${icono ? dibujarIcono(icono, { tam: 14, trazo: 2.3 }) : ''}<span>${esc(bajada)}</span></span>`
      : '')
    + '</div>';
}

export function pieFijo({ cuerpo = '', top, className = '' }: { cuerpo?: string; top: number; className?: string }): string {
  return `<div class="${cls('ap-ua-pie', className)}" style="top:${top}px"><span class="ap-ua-pie-sombra"></span>${cuerpo}</div>`;
}
