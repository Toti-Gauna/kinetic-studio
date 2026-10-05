/* Aviso (notificación tipo toast) de la app 2026: píldora negra arriba con un círculo de color y su ícono, título
   blanco en negrita y detalle gris. Medido en 03-e-precio ("Nuevo pedido de plomería"), 05-u-presupuestos, 11-e-chat.
   aviso({ titulo, detalle, icono = 'canilla', tono = 'amarillo', top = 13.1, capa = true, dato }) → string
     capa true: UNA capa <div class="hd-capa ap-aviso-capa" data-pantalla="aviso-<dato>"> transparente para apilar arriba
     de todo; capa false: solo la píldora.
     Píldora negra #000 de 379,4 × 74,6 en (17,1 , top), radio 30. Círculo de 47 a 13 del borde izquierdo, centrado en
     alto: tono 'amarillo' (#F5F59A, ícono tinta: pedidos) · 'verde' (tilde blanca: confirmado, te eligió) · 'azul'
     (billetera blanca: propuestas) · 'rojo'. Título DM Sans 700 14,5 en x 74,6 de la píldora (mayúscula a 22,6 del borde);
     detalle DM Sans 400 13,4 gris #B3B3B3 debajo (mayúscula a 42,6).
     La capa va con z-index 60, por encima de la barra de estado y de la isla de PhoneFrame: el toast las tapa solo (como
     en la foto); bajarAviso apaga además la barra y la isla mientras baja y subirAviso las vuelve a prender.
   Ganchos: .ap-aviso-capa · .ap-aviso (entra con y desde −110 y sale igual) · .ap-aviso-circulo (pop con scale) ·
     .ap-aviso-titulo · .ap-aviso-detalle. Ayudas: bajarAviso(tl, aviso, at, { dur = .45 }) y subirAviso(tl, aviso, at,
     { dur = .35 }) → duración; barraDelAviso(aviso) → [barra, isla] del teléfono (gsap.set para una pantalla quieta). */
import { icono as dibujarIcono, type Icono } from '../iconos.ts';
import { cls, esc } from './comun.ts';
import '../css/aviso.css';

export type TonoAviso = 'amarillo' | 'verde' | 'azul' | 'rojo';

export interface AvisoProps {
  titulo: string;
  detalle?: string;
  icono?: Icono;
  tono?: TonoAviso;
  /** borde de arriba en la pantalla (default 13,1) */
  top?: number;
  capa?: boolean;
  dato?: string;
  className?: string;
}

export function aviso({ titulo, detalle = '', icono = 'canilla', tono = 'amarillo', top = 13.1, capa = true, dato = 'aviso', className = '' }: AvisoProps): string {
  const pildora = `<div class="${cls('ap-aviso', className)}" data-tono="${tono}" style="top:${top}px">`
    + `<span class="ap-aviso-circulo">${dibujarIcono(icono, { tam: 22, trazo: 2.3 })}</span>`
    + `<span class="ap-aviso-titulo">${esc(titulo)}</span>`
    + (detalle ? `<span class="ap-aviso-detalle">${esc(detalle)}</span>` : '')
    + '</div>';
  return capa ? `<div class="hd-capa ap-aviso-capa ap-ui" data-pantalla="aviso-${esc(dato)}">${pildora}</div>` : pildora;
}

/** La barra de estado y la isla del teléfono donde está el aviso (para apagarlas mientras el toast ocupa su lugar). */
export function barraDelAviso(el: Element): Element[] {
  const pantalla = el.closest('.hd-pantalla');
  return pantalla ? [...pantalla.querySelectorAll(':scope > .hd-barra-estado, :scope > .hd-isla')] : [];
}

/** Baja el aviso desde arriba (y −110 → 0) con un rebote corto y apaga la barra de estado y la isla. Devuelve la duración. */
export function bajarAviso(tl: GSAPTimeline, el: Element, at: number, { dur = 0.45 }: { dur?: number } = {}): number {
  const pildora = el.classList.contains('ap-aviso') ? el : el.querySelector('.ap-aviso');
  tl.fromTo(pildora, { y: -110 }, { y: 0, duration: dur, ease: 'back.out(1.3)' }, at);
  const barra = barraDelAviso(el);
  if (barra.length) tl.to(barra, { opacity: 0, duration: dur * 0.5, ease: 'power1.out' }, at + dur * 0.15);
  return dur;
}

/** Sube el aviso (y 0 → −110) y vuelve a prender la barra de estado y la isla. Devuelve la duración. */
export function subirAviso(tl: GSAPTimeline, el: Element, at: number, { dur = 0.35 }: { dur?: number } = {}): number {
  const pildora = el.classList.contains('ap-aviso') ? el : el.querySelector('.ap-aviso');
  tl.to(pildora, { y: -110, duration: dur, ease: 'power2.in' }, at);
  const barra = barraDelAviso(el);
  if (barra.length) tl.to(barra, { opacity: 1, duration: dur * 0.6, ease: 'power1.out' }, at + dur * 0.4);
  return dur;
}
