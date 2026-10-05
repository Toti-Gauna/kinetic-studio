/* Superficies de la app 2026: tarjeta blanca con sombra suave, caja de sección gris clara y la tarjeta-ticket del turno.
   tarjeta(html, { borde = false, radio = 22, className, estilo }) → <div class="ap-tarjeta"> blanca, sombra suave
       (borde: filete #E6E9EF de 1,5 adentro, como la tarjeta del turno).
   caja(html, { radio = 22, className, estilo }) → <div class="ap-caja"> #F4F5F8 (cajas dentro de hojas: precio, horarios).
   tarjetaTurno({ iniciales, nombre, rubro, estado, cuando, accion, className, estilo }) → la tarjeta "TU PRÓXIMO TURNO"
       de 01-u-inicio: 366,8 × 139, radio 22, filete + sombra; arriba avatar E2 + "Especialista 2" + rubro + etiqueta
       "Confirmado"; muescas a los costados y línea punteada en y 85; abajo calendario + "Jue 19 · 10 a 12 h" + "Ver el turno ›".
       Medidas relativas a la tarjeta (en 01-u-inicio va en x 23,6 y 481): avatar (18,6 , 16,7) 52 · nombre x 84,8 mayúscula
       y 27,2 (17 px) · rubro y 48 (13 px) · etiqueta (266 , 31,8) 82 × 18,2 · punteado y 84,9 de x 17 a 350 · fecha x 51,7
       mayúscula y 106,2 (16 px) · "Ver el turno" x 256,5.
   Ganchos: .ap-tarjeta · .ap-caja · .ap-turno · .ap-turno-avatar · .ap-turno-nombre · .ap-turno-rubro · .ap-turno-estado ·
     .ap-turno-punteado · .ap-turno-muesca[data-lado] · .ap-turno-cuando · .ap-turno-accion. */
import { icono } from '../iconos.ts';
import { avatar, type TonoAvatar } from './avatar.ts';
import { etiqueta } from './chips.ts';
import { cls, esc } from './comun.ts';
import '../css/tarjeta.css';
import type { Icono } from '../iconos.ts';

export interface SuperficieOpciones {
  radio?: number;
  className?: string;
  /** estilos en línea extra (posición, tamaño) */
  estilo?: string;
}

export function tarjeta(html: string, { borde = false, radio = 22, className = '', estilo = '' }: SuperficieOpciones & { borde?: boolean } = {}): string {
  return `<div class="${cls('ap-tarjeta', className)}"${borde ? ' data-borde' : ''} style="border-radius:${radio}px;${estilo}">${html}</div>`;
}

export function caja(html: string, { radio = 22, className = '', estilo = '' }: SuperficieOpciones = {}): string {
  return `<div class="${cls('ap-caja', className)}" style="border-radius:${radio}px;${estilo}">${html}</div>`;
}

export interface TurnoProps {
  iniciales?: string;
  tono?: TonoAvatar;
  nombre?: string;
  rubro?: { icono: Icono; texto: string };
  estado?: string;
  cuando?: string;
  accion?: string;
  className?: string;
  estilo?: string;
}

export function tarjetaTurno({
  iniciales = 'E2', tono = 'tinta', nombre = 'Especialista 2', rubro = { icono: 'rayo', texto: 'Electricidad' },
  estado = 'Confirmado', cuando = 'Jue 19 · 10 a 12 h', accion = 'Ver el turno', className = '', estilo = '',
}: TurnoProps = {}): string {
  return `<div class="${cls('ap-turno', 'ap-tarjeta', className)}" data-borde style="${estilo}">`
    + `<span class="ap-turno-avatar">${avatar({ iniciales, tono, tam: 52, tilde: true })}</span>`
    + `<span class="ap-turno-nombre">${esc(nombre)}</span>`
    + `<span class="ap-turno-rubro">${icono(rubro.icono, { tam: 14, trazo: 2 })}<span>${esc(rubro.texto)}</span></span>`
    + `<span class="ap-turno-estado">${etiqueta({ texto: estado, tono: 'verde' })}</span>`
    + '<span class="ap-turno-muesca" data-lado="izq"></span><span class="ap-turno-muesca" data-lado="der"></span>'
    + '<span class="ap-turno-punteado"></span>'
    + `<span class="ap-turno-cuando">${icono('calendario', { tam: 22.7, trazo: 2.1 })}<span>${esc(cuando)}</span></span>`
    + `<span class="ap-turno-accion"><span>${esc(accion)}</span>${icono('chevron-der', { tam: 14, trazo: 2.6 })}</span>`
    + '</div>';
}
