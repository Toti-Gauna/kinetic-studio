/* Piezas de la hoja "Tu precio" del especialista (03…09-e-precio) y el cuerpo armado para meter en hoja().
   Medidas en px de la pantalla (la hoja con top 99,3: su cuerpo arranca en x 35,7 · y 190,3) y relativas al cuerpo.
   sugerenciaHandy({ monto = '$ 44.000', etiqueta = 'Vos decidís' }) → renglón centrado: la lamparita de 36, "Handy sugiere"
       DM Sans 400 14,5 + monto 700 y la etiqueta amarilla de 21 de alto (texto 11,7).
   infoMateriales({ texto }) → "ⓘ Incluye $ 13.000 de materiales estimados." DM Sans 400 12,6 gris, ícono azul de 12,4.
   montosRapidos({ sugerido, sumas, elegido = 0 }) → dos filas centradas: "Dejar el sugerido" (azul, 49,6 + canto 2) y
       "+ $ 1.000" en la primera, "+ $ 2.000" · "+ $ 5.000" en la segunda (blancos, 48 + canto 2,2); texto 700 13,8.
       Elegir otro es cruzar capas: cada botón trae su versión azul encima (.ap-precio-rapido-sel, opacity).
   escribirOtroMonto() → píldora blanca sin canto de 191 × 49,5 con el lápiz y el texto azul 700 14,3.
   advertenciaPrecio({ texto }) → caja #FDECEA de 311,4 × 71,5 (radio 12) con el triángulo y el texto rojo oscuro 700 13,85
       en tres renglones de 18,7 ("Ese valor es muy bajo…", 05…08-e-precio).
   cajaRecibis({ monto = '$ 39.600', detalle }) → caja verde #E3F5EA (radio 22) con la billetera en un cuadrado verde de 47
       (radio 14), "Recibís" 700 14,9 verde oscuro, el monto en Archivo 900 de 24 a la derecha y el detalle 500 13 debajo.
   cuerpoPrecio({ modo = 'rapidos', ambos = true, horario = 0, valores, actual, advertencia, recibis, ... }) → el cuerpo
       entero para hoja({ titulo: 'Tu precio', cuerpo }) (ver hojaPrecio() en especialista.ts). Relativo al cuerpo:
       .ap-precio-rotulo "¿CUÁNDO PODÉS IR?" (mayúscula a 0) · .ap-precio-horarios (y 27: chips de 49,5, filas cada 57,8) ·
       .ap-boton[data-accion="elegir-fecha|elegir-horario"] (y 144,8 y 202,6; 342,6 × 49,2, punteados) ·
       .ap-precio-caja (y 269,2 · 343,4 de ancho): dentro, relativo a la caja —
         .ap-precio-fondo[data-modo="rapidos"] (356 de alto) y [data-modo="teclado"] (hasta abajo de la pantalla) ·
         .ap-precio-sugerencia (centro y 35) · .ap-monto (x 16 · y 67,2; ver teclado.ts) ·
         .ap-precio-rapidos (modo montos rápidos, opacity): .ap-precio-info (centro y 143) · .ap-precio-rapido[data-monto]
           (filas en y 165 y 224,1) · .ap-boton[data-accion="escribir-monto"] (y 287) · .ap-precio-recibis (y 373,2)
         .ap-precio-tecleo (modo teclado, opacity): .ap-precio-advertencia (x 16 · y 135; opacity) ·
           .ap-precio-tecleo-grupo (Listo + teclado; con advertencia en y 0, sin ella sube 85,2: y = −85,2) ·
           .ap-boton[data-accion="listo"] (centrado, y 220,1; 87,2 × 49,5 + canto 2,2) · .ap-teclado (x 16 · y 284,1)
       modo 'rapidos' = 03-e-precio · 'teclado' = 05…09-e-precio. Con ambos (default) trae las dos capas, la otra en 0.
   Ayudas: abrirTeclado(tl, cuerpo, at) → duración (de montos rápidos al teclado sin parpadeo del fondo) ·
     mostrarAdvertencia(tl, cuerpo, at, { ver = true }) → duración (la caja roja aparece o se va y el grupo baja o sube). */
import { icono } from '../iconos.ts';
import { handy } from '../../handys.ts';
import { boton } from './botones.ts';
import { chipHorario, etiqueta } from './chips.ts';
import { rotulo } from './textos.ts';
import { montoGrande, teclado } from './teclado.ts';
import { cls, esc } from './comun.ts';
import '../css/precio.css';

/** Cuánto sube Listo + teclado cuando no hay advertencia (05 → 09-e-precio). */
export const SIN_ADVERTENCIA = -85.2;

export function sugerenciaHandy({ monto = '$ 44.000', etiqueta: tag = 'Vos decidís', className = '' }: { monto?: string; etiqueta?: string; className?: string } = {}): string {
  return `<div class="${cls('ap-precio-sugerencia', className)}">`
    + `<span class="ap-precio-lamparita">${handy('lamparita', { altura: 36 })}</span>`
    + `<span class="ap-precio-sugerencia-texto">Handy sugiere <b>${esc(monto)}</b></span>`
    + etiqueta({ texto: tag })
    + '</div>';
}

export function infoMateriales({ texto = 'Incluye $ 13.000 de materiales estimados.', className = '' }: { texto?: string; className?: string } = {}): string {
  return `<div class="${cls('ap-precio-info', className)}">${icono('info', { tam: 12.4, trazo: 2.2 })}<span>${esc(texto)}</span></div>`;
}

/** Un monto rápido: la versión blanca (o azul) y encima la azul elegida, para cruzarlas. */
function rapido(texto: string, dato: string, elegido: boolean, base: 'azul' | 'blanco', alto: number, canto: number): string {
  const b = (v: 'azul' | 'blanco') => boton({ texto, variante: v, tam: 'pildora', alto, canto });
  return `<span class="ap-precio-rapido" data-monto="${esc(dato)}">`
    + b(base)
    + (base === 'blanco' ? `<span class="ap-precio-rapido-sel" style="opacity:${elegido ? 1 : 0}">${b('azul')}</span>` : '')
    + '</span>';
}

export function montosRapidos({ sugerido = 'Dejar el sugerido', sumas = ['+ $ 1.000', '+ $ 2.000', '+ $ 5.000'], elegido = -1, className = '' }:
  { sugerido?: string; sumas?: readonly string[]; elegido?: number; className?: string } = {}): string {
  const [a, b, c] = sumas;
  return `<div class="${cls('ap-precio-rapidos-filas', className)}">`
    + `<div class="ap-precio-rapidos-fila">${rapido(sugerido, 'sugerido', true, 'azul', 49.6, 2)}${a ? rapido(a, a, elegido === 0, 'blanco', 49.6, 2) : ''}</div>`
    + `<div class="ap-precio-rapidos-fila" data-fila="2">${b ? rapido(b, b, elegido === 1, 'blanco', 48, 2.2) : ''}${c ? rapido(c, c, elegido === 2, 'blanco', 48, 2.2) : ''}</div>`
    + '</div>';
}

export function escribirOtroMonto({ texto = 'Escribir otro monto', className = '' }: { texto?: string; className?: string } = {}): string {
  return boton({ texto, icono: 'lapiz', variante: 'texto-azul', tam: 'pildora', alto: 49.5, ancho: 191, accion: 'escribir-monto', className: cls('ap-precio-escribir', className) });
}

export function advertenciaPrecio({ texto = 'Ese valor es muy bajo. Handy quiere que tu trabajo se vea bien recompensado.', className = '', estilo = '' }:
  { texto?: string; className?: string; estilo?: string } = {}): string {
  return `<div class="${cls('ap-precio-advertencia', className)}" style="${estilo}">${icono('alerta', { tam: 16, trazo: 2.2 })}<p>${esc(texto)}</p></div>`;
}

export function cajaRecibis({ monto = '$ 39.600', detalle = 'Handy retiene solo su tarifa del 10%: $ 4.400', className = '', estilo = '' }:
  { monto?: string; detalle?: string; className?: string; estilo?: string } = {}): string {
  return `<div class="${cls('ap-precio-recibis', className)}" style="${estilo}">`
    + `<span class="ap-precio-recibis-icono">${icono('billetera', { tam: 22, trazo: 2 })}</span>`
    + '<span class="ap-precio-recibis-titulo">Recibís</span>'
    + `<span class="ap-precio-recibis-monto">${esc(monto)}</span>`
    + `<p class="ap-precio-recibis-detalle">${esc(detalle)}</p>`
    + '</div>';
}

export interface CuerpoPrecioProps {
  /** 'rapidos' = 03-e-precio (montos rápidos) · 'teclado' = 05…09-e-precio */
  modo?: 'rapidos' | 'teclado';
  /** traer las dos capas (la otra en opacity 0) para cruzarlas (default true) */
  ambos?: boolean;
  /** horarios (el elegido en azul) */
  horarios?: readonly string[];
  horario?: number;
  /** sugerencia de Handy */
  sugerido?: string;
  /** capas del monto (ver montoGrande) y la que se ve */
  valores?: readonly string[];
  actual?: number;
  /** se ve la caja roja (modo teclado) */
  advertencia?: boolean;
  materiales?: string;
  recibis?: { monto: string; detalle: string };
}

export function cuerpoPrecio({
  modo = 'rapidos', ambos = true,
  horarios = ['Hoy, de 16 a 18 h', 'Hoy, de 18 a 20 h', 'Hoy, de 20 a 22 h'], horario = 0,
  sugerido = '$ 44.000', valores = ['$ 44.000'], actual = 0, advertencia = false,
  materiales, recibis = { monto: '$ 39.600', detalle: 'Handy retiene solo su tarifa del 10%: $ 4.400' },
}: CuerpoPrecioProps = {}): string {
  const ve = (on: boolean) => `opacity:${on ? 1 : 0}`;
  const rapidos = modo === 'rapidos';
  return '<div class="ap-precio">'
    + rotulo('¿Cuándo podés ir?', { className: 'ap-precio-rotulo' })
    + `<div class="ap-precio-horarios">${horarios.map((h, i) => chipHorario({ texto: h, elegido: i === horario })).join('')}</div>`
    + '<div class="ap-precio-contornos">'
    + boton({ texto: 'Prefiero elegir la fecha', icono: 'calendario', variante: 'contorno', tam: 'medio', alto: 49.2, ancho: 342.6, accion: 'elegir-fecha' })
    + boton({ texto: 'Prefiero elegir el horario', icono: 'reloj', variante: 'contorno', tam: 'medio', alto: 49.2, ancho: 342.6, accion: 'elegir-horario' })
    + '</div>'
    + '<div class="ap-precio-caja">'
    + ((ambos || !rapidos) ? `<div class="ap-precio-fondo" data-modo="teclado" style="${ve(!rapidos)}"></div>` : '')
    + '<div class="ap-precio-fondo" data-modo="rapidos"></div>'
    + sugerenciaHandy({ monto: sugerido })
    + montoGrande({ valores, actual })
    + ((ambos || rapidos) ? `<div class="ap-precio-rapidos" style="${ve(rapidos)}">`
      + infoMateriales(materiales ? { texto: materiales } : {})
      + montosRapidos()
      + escribirOtroMonto()
      + cajaRecibis(recibis)
      + '</div>' : '')
    + ((ambos || !rapidos) ? `<div class="ap-precio-tecleo" style="${ve(!rapidos)}">`
      + advertenciaPrecio({ estilo: ve(advertencia) })
      + `<div class="ap-precio-tecleo-grupo"${advertencia ? '' : ` style="transform:translateY(${SIN_ADVERTENCIA}px)"`}>`
      + boton({ texto: 'Listo', icono: 'lapiz', variante: 'azul', tam: 'pildora', alto: 49.5, canto: 2.2, ancho: 87.2, accion: 'listo', className: 'ap-precio-listo' })
      + teclado()
      + '</div></div>' : '')
    + '</div></div>';
}

/** De montos rápidos al teclado: primero entra el fondo largo y el teclado, después se va lo de los montos rápidos
    (los dos fondos son del mismo gris: así no parpadea). Devuelve la duración. */
export function abrirTeclado(tl: GSAPTimeline, cuerpo: Element, at: number, { dur = 0.35 }: { dur?: number } = {}): number {
  const q = (s: string) => cuerpo.querySelector(s);
  tl.to(q('.ap-precio-fondo[data-modo="teclado"]'), { opacity: 1, duration: dur * 0.6, ease: 'power1.out' }, at);
  tl.to(q('.ap-precio-rapidos'), { opacity: 0, y: 12, duration: dur * 0.5, ease: 'power1.in' }, at);
  tl.fromTo(q('.ap-precio-tecleo'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: dur, ease: 'power2.out' }, at + dur * 0.3);
  return dur * 1.3;
}

/** Muestra (o saca) la caja roja de "muy bajo": el grupo Listo + teclado baja (o sube) 85,2. Devuelve la duración. */
export function mostrarAdvertencia(tl: GSAPTimeline, cuerpo: Element, at: number, { ver = true, dur = 0.3 }: { ver?: boolean; dur?: number } = {}): number {
  tl.to(cuerpo.querySelector('.ap-precio-advertencia'), { opacity: ver ? 1 : 0, duration: dur * 0.6, ease: 'power1.out' }, ver ? at + dur * 0.4 : at);
  tl.to(cuerpo.querySelector('.ap-precio-tecleo-grupo'), { y: ver ? 0 : SIN_ADVERTENCIA, duration: dur, ease: 'power2.inOut' }, at);
  return dur;
}
