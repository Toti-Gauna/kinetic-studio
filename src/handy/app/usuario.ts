/* Pantallas de la app de usuario, diseño 2026 (src/handy/app/DISENO.md), armadas con los componentes de app/ui.
   Cada función devuelve UNA capa <div class="hd-capa ap-pantalla" data-pantalla="…"> de 414×896 para el `pantalla` de
   phoneFrame (src/handy/ui/PhoneFrame.ts); las capas se apilan para mostrar transiciones dentro del mismo teléfono.
   Todo se dibuja en su estado final; la escena pone los estados iniciales con gsap.set (solo transform y opacity).

   pantallaInicioUsuario({ apretada, pestana = 'inicio' })   01-u-inicio · [data-pantalla="u-inicio"]
     Encabezado blanco (campana con globito "2"), dirección, "¿Qué necesitás hoy?" con "hoy" subrayado, los seis rubros,
     TU PRÓXIMO TURNO (Especialista 2 · Jue 19 · 10 a 12 h), el banner de HandIA, "Quiero…" con sus accesos (la barra tapa
     casi todo: la foto también los corta) y la barra inferior. apretada: id del rubro que se ve apretado (sin canto).
     Ganchos y posición medida (px de la pantalla 414×896, x · y · ancho × alto):
       .ap-encabezado (0 · 0 · 414 × 124) — .ap-encabezado-logo (24 · 55,7 · 147 × 53)
         .ap-boton-cuadrado[data-boton="campana"] (273,9 · 54,9 · 53,5 × 57,9) con .ap-globito (centro 322,9 · 59,5)
         .ap-boton-cuadrado[data-boton="ubicacion"] (336,9 · 54,9)
       .ap-direccion (23,6 · 131 · 233 × 31,3)
       .ap-u-titulo "¿Qué necesitás hoy?" (mayúscula de 183,4 a 204,5; tinta x 24,7 → 389,6) · .ap-resalte-banda bajo "hoy"
       .ap-fichas[data-grupo="rubros"] (23,6 · 229,2 · 366,9 × 211,8):
         .ap-ficha[data-ficha="electricidad|plomeria|gas"] y 229,2 · [data-ficha="cerrajeria|albanileria|aire"] y 339,4
         columnas x 23,6 · 150 · 276,5 (114 × 98 + canto 3,6) — Plomería tiene el centro en (207 , 278)
       .ap-u-rotulo "TU PRÓXIMO TURNO" (23,6 · mayúscula 458)
       .ap-turno (23,8 · 480,8 · 366,6 × 139,2) — partes en tarjeta.ts
       .ap-handia (23,6 · 639,2 · 366,4 × 99,3 + canto 5,5) · .ap-handia-cuadro (37,8 · 653 · 71 × 71, azul medio) ·
         .ap-handia-halo (círculo amarillo translúcido de 39,2, centro 72,4 · 688,5: detrás del cuello del foco) ·
         .ap-handia-lampara (la lamparita de 61 de alto: bulbo 56,8 → 88, rayos desde 653,4, pies en 713,4) ·
         .ap-handia-flecha (círculo amarillo, centro 353,6 · 688,8)
       .ap-u-quiero "Quiero…" (23,6 · mayúscula 764) · .ap-fichas[data-grupo="accesos"] (y 801,5; la barra las tapa desde 812)
       .ap-barra (0 · 812 · 414 × 84) — pestañas en barra.ts */
import './ui/comun.ts';
import './css/pantallas.css';
import { encabezado, pildoraDireccion } from './ui/encabezado.ts';
import { barraInferior, type Pestana } from './ui/barra.ts';
import { fichaRubro, fichaAcceso } from './ui/fichas.ts';
import { RUBROS, type Rubro } from './ui/chips.ts';
import { tarjetaTurno } from './ui/tarjeta.ts';
import { tituloResaltado, rotulo } from './ui/textos.ts';
import { icono } from './iconos.ts';
import { handy } from '../handys.ts';

/** Los accesos "Quiero…" (la foto los corta: textos plausibles, como los de la pantalla vieja). */
export const ACCESOS = [
  { id: 'cuerito', icono: 'canilla', texto: 'Cambiar un cuerito' },
  { id: 'service-aire', icono: 'aire', texto: 'Service del aire' },
  { id: 'enchufe', icono: 'rayo', texto: 'Cambiar un enchufe' },
] as const;

/** Columnas y filas de la grilla de fichas (px de la pantalla). */
export const GRILLA_INICIO = { x: [23.6, 150, 276.5], rubros: [229.2, 339.4], accesos: 801.5 } as const;

/** Banner "Contale a HandIA" (01-u-inicio). Ganchos: .ap-handia · .ap-handia-cuadro · .ap-handia-halo · .ap-handia-lampara · .ap-handia-flecha. */
export function bannerHandIA({ estilo = '' }: { estilo?: string } = {}): string {
  return `<div class="ap-handia" style="${estilo}">`
    + '<span class="ap-handia-canto"></span>'
    + '<span class="ap-handia-cara">'
    + `<span class="ap-handia-cuadro"><span class="ap-handia-halo"></span><span class="ap-handia-lampara">${handy('lamparita', { altura: 61 })}</span></span>`
    + '<span class="ap-handia-pregunta">¿No sabés qué rubro es?</span>'
    + '<span class="ap-handia-titulo ap-display">Contale a HandIA</span>'
    + `<span class="ap-handia-ayuda">${icono('destello', { tam: 12, trazo: 2.4 })}<span>Te ayuda a armar el pedido</span></span>`
    + `<span class="ap-handia-flecha">${icono('flecha-der', { tam: 20, trazo: 2.4 })}</span>`
    + '</span></div>';
}

export interface InicioUsuarioProps {
  /** rubro que se ve apretado (sin canto), como Plomería en la foto */
  apretada?: Rubro;
  /** pestaña prendida de la barra (default 'inicio') */
  pestana?: Pestana;
}

export function pantallaInicioUsuario({ apretada, pestana = 'inicio' }: InicioUsuarioProps = {}): string {
  const g = GRILLA_INICIO;
  // las fichas se ubican relativas a su grupo (así la escena puede mover o escalar el grupo entero)
  const rubros = RUBROS.map((r, i) => fichaRubro({
    rubro: r.id, apretada: r.id === apretada,
    estilo: `left:${(g.x[i % 3] - g.x[0]).toFixed(1)}px;top:${(g.rubros[Math.floor(i / 3)] - g.rubros[0]).toFixed(1)}px`,
  })).join('');
  const accesos = ACCESOS.map((a, i) =>
    fichaAcceso({ id: a.id, icono: a.icono, texto: a.texto, estilo: `left:${(g.x[i] - g.x[0]).toFixed(1)}px;top:0` })).join('');
  return '<div class="hd-capa ap-pantalla ap-ui" data-pantalla="u-inicio">'
    + `<div class="ap-fichas" data-grupo="accesos" style="left:${g.x[0]}px;top:${g.accesos}px">${accesos}</div>`
    + `<div class="ap-fichas" data-grupo="rubros" style="left:${g.x[0]}px;top:${g.rubros[0]}px">${rubros}</div>`
    + encabezado({ variante: 'blanco', campana: 2 })
    + pildoraDireccion({ estilo: 'left:23.6px;top:131px' })
    + tituloResaltado({ texto: '¿Qué necesitás hoy?', resaltar: 'hoy', tam: 30.7, ancho: 110, className: 'ap-abs ap-u-titulo' })
    + rotulo('Tu próximo turno', { className: 'ap-abs ap-u-rotulo' })
    + tarjetaTurno({ estilo: 'left:23.8px;top:480.8px' })
    + bannerHandIA({ estilo: 'left:23.6px;top:639.2px' })
    + tituloResaltado({ texto: 'Quiero...', tam: 25, ancho: 110, color: 'var(--ap-azul)', className: 'ap-abs ap-u-quiero' })
    + barraInferior({ activa: pestana })
    + '</div>';
}
