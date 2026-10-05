/* Fichas de la grilla de inicio de la app 2026 (01-u-inicio): rubros y accesos "Quiero…".
   fichaRubro({ rubro, apretada = false, className }) → ficha gris #ECECEC de 114 × 98 (radio 18) con canto #D3D6DC de 3,6
       abajo; ícono de 36 (trazo 1,85) centrado a 38,9 del borde de arriba; nombre DM Sans 700 13,5 con la base a 74,6.
       apretada: sin canto (como Plomería en la foto, cuando el dedo la toca).
   fichaAcceso({ icono, texto, className }) → la misma ficha con el ícono azul en un cuadrado blanco de 41 (radio 12)
       arriba y el texto en dos renglones ("Cambiar un cuerito").
   Para apretar en una escena: tl.to(canto, { opacity: 0 }) o bajar la cara con y = 3,6 (las dos son transform/opacity).
   Ganchos: .ap-ficha[data-ficha] (id del rubro o del acceso) · .ap-ficha-canto · .ap-ficha-cara · .ap-ficha-icono ·
     .ap-ficha-texto · .ap-ficha-cuadro (accesos). */
import { icono as dibujarIcono, type Icono } from '../iconos.ts';
import { rubro as datosRubro, type Rubro } from './chips.ts';
import { cls, esc } from './comun.ts';
import '../css/fichas.css';

export const FICHA = { w: 114, h: 98, canto: 3.6 } as const;

export function fichaRubro({ rubro, apretada = false, className = '', estilo = '' }: { rubro: Rubro; apretada?: boolean; className?: string; estilo?: string }): string {
  const r = datosRubro(rubro);
  return `<span class="${cls('ap-ficha', className)}" data-ficha="${rubro}" style="${estilo}">`
    + `<span class="ap-ficha-canto"${apretada ? ' style="opacity:0"' : ''}></span>`
    + `<span class="ap-ficha-cara"><span class="ap-ficha-icono">${dibujarIcono(r.icono, { tam: 36, trazo: 1.85 })}</span>`
    + `<span class="ap-ficha-texto">${esc(r.texto)}</span></span>`
    + '</span>';
}

export function fichaAcceso({ id, icono, texto, className = '', estilo = '' }: { id: string; icono: Icono; texto: string; className?: string; estilo?: string }): string {
  return `<span class="${cls('ap-ficha', 'ap-ficha-acceso', className)}" data-ficha="${esc(id)}" style="${estilo}">`
    + '<span class="ap-ficha-canto"></span>'
    + `<span class="ap-ficha-cara"><span class="ap-ficha-cuadro">${dibujarIcono(icono, { tam: 22, trazo: 2.1 })}</span>`
    + `<span class="ap-ficha-texto">${esc(texto)}</span></span>`
    + '</span>';
}
