/* Pantallas de la app del especialista, diseño 2026 (src/handy/app/DISENO.md), armadas con los componentes de app/ui.
   Cada función devuelve UNA capa <div class="hd-capa ap-pantalla" data-pantalla="…"> de 414×896 para el `pantalla` de
   phoneFrame (src/handy/ui/PhoneFrame.ts; con el encabezado azul usar phoneFrame({ estado: 'claro' })).
   Todo se dibuja en su estado final; la escena pone los estados iniciales con gsap.set (solo transform y opacity).

   pantallaInicioEspecialista({ disponible = false, ambos = true })   01-e-inicio / 02-e-inicio · [data-pantalla="e-inicio"]
     disponible false = 01-e-inicio: mapa gris, "No disponible", tarjeta FUERA DE SERVICIO con la Llave asomada.
     disponible true  = 02-e-inicio: mapa en color con el radar, "Buscando pedidos", "Disponible", tarjeta "Estás disponible".
     ambos (default true): la capa trae LOS DOS estados apilados (el otro en opacity 0), así una escena prende el
     interruptor y cruza todo: prenderInicioEspecialista(tl, capa, at) hace la transición completa.
     Ganchos y posición medida (px de la pantalla 414×896, x · y · ancho × alto). La foto mide 914 de alto: lo que va
     pegado abajo (tarjetas) sube 8 px para mantener su aire sobre la barra, que acá empieza en 812 (en la foto, 820).
       .ap-mapa (pantalla entera) — capas [data-capa="gris|color"], .ap-mapa-yo (109,5 · 394,5), .ap-radar (mismo centro;
         anillos r 20 · 38 · 97,5 · 153), etiquetas Av. Colón (12 · 242) · Plaza (131 · 335) · LA PERLA (47 · 424) ·
         Av. Luro (12 · 572) · MAR ARGENTINO (inclinado 11° siguiendo la costa: x 336 · y 399 → x 364 · y 521)
       .ap-encabezado[data-variante="azul"] (0 · 0 · 414 × 124, esquinas de abajo r 30) — botones campana (273,9 · 54,9)
         y pin (336,9 · 54,9) de 53,5 en blanco 20 %
       .ap-disponible (203,4 · 137,5 · 193,5 × 51, pegado a la derecha en 396,9): .ap-disponible-no (tinta) /
         .ap-disponible-si (227 · 137,5 · 169,5 × 51 + canto 3,3) · .ap-llavecita (350 · 152,1 · 40,4 × 21,8) ·
         .ap-llavecita-perilla (x 0 → 17,6)
       .ap-buscando "Buscando pedidos" (17 · 149,2 · 154,5 × 27,2) — .ap-buscando-punto (centro 32 · 162,8)
       .ap-e-fuera (16 · 539,5 · 382 × 254, radio 28): .ap-e-fuera-rotulo · .ap-e-fuera-titulo (tres renglones, "pedidos"
         con .ap-resalte-banda) · .ap-e-fuera-texto · .ap-boton[data-accion="ponerme-disponible"] (36,7 · 718,9 ·
         340,5 × 52 + canto 4,7) · .ap-e-llave (la Llave asomada: 299,6 · 531,1 · 89,5 × 84; el .hd-handy de adentro gira y salta desde los pies)
       .ap-e-disponible (16 · 663,6 · 382 × 129,8, radio 28): .ap-e-disponible-icono (círculo azul de 56, centro 63,7 ·
         728,7) · .ap-e-disponible-titulo · .ap-e-disponible-texto · .ap-chip-rubro[data-rubro="plomeria|gas"] (y 757)
       .ap-barra (0 · 812 · 414 × 84)

   hojaPrecio({ modo, valores, actual, advertencia, … })   03…09-e-precio · [data-pantalla="hoja-precio"]
     La hoja "Tu precio" (capa con velo, para apilar sobre e-inicio) con cuerpoPrecio() de ui/precio.ts: horarios,
     punteados, Handy sugiere, el monto con − / +, montos rápidos + Recibís (modo 'rapidos') o advertencia + Listo +
     teclado (modo 'teclado'). Ganchos y medidas en ui/precio.ts; subirla con subirHoja (ui/hoja.ts), pasar al teclado
     con abrirTeclado y tipear con teclear + mostrarMonto (ui/teclado.ts). Después de montarla: acomodarMonto(.ap-monto). */
import './ui/comun.ts';
import './css/pantallas.css';
import { gsap } from 'gsap';
import { encabezado } from './ui/encabezado.ts';
import { barraInferior, type Pestana } from './ui/barra.ts';
import { mapa, cruzarMapa } from './ui/mapa.ts';
import { interruptorDisponible, prenderDisponible } from './ui/interruptor.ts';
import { boton } from './ui/botones.ts';
import { chipRubro } from './ui/chips.ts';
import { tituloResaltado, rotulo } from './ui/textos.ts';
import { hoja } from './ui/hoja.ts';
import { cuerpoPrecio, type CuerpoPrecioProps } from './ui/precio.ts';
import { icono } from './iconos.ts';
import { handy } from '../handys.ts';

export interface InicioEspecialistaProps {
  /** false = 01-e-inicio (No disponible) · true = 02-e-inicio (Disponible, buscando pedidos) */
  disponible?: boolean;
  /** dibujar los dos estados apilados para poder cruzarlos (default true) */
  ambos?: boolean;
  pestana?: Pestana;
}

/** Tarjeta FUERA DE SERVICIO con la Llave (01-e-inicio). */
export function tarjetaFueraDeServicio({ estilo = '' }: { estilo?: string } = {}): string {
  return `<div class="ap-e-fuera ap-tarjeta" style="${estilo}">`
    + rotulo('Fuera de servicio', { className: 'ap-e-fuera-rotulo' })
    + tituloResaltado({ texto: 'No estás\nrecibiendo\npedidos', resaltar: 'pedidos', tam: 23.6, alto: '24.5px', ancho: 120, className: 'ap-e-fuera-titulo' })
    + '<p class="ap-e-fuera-texto ap-texto">Prendé «Disponible» cuando quieras<br>trabajar y apagalo cuando termines.</p>'
    + boton({ texto: 'Ponerme disponible', icono: 'interruptor', variante: 'azul', tam: 'grande', ancho: 340.5, accion: 'ponerme-disponible', className: 'ap-e-fuera-boton' })
    + `<span class="ap-e-llave">${handy('llave', { altura: 84 })}</span>`
    + '</div>';
}

/** Tarjeta "Estás disponible" (02-e-inicio). */
export function tarjetaDisponible({ estilo = '' }: { estilo?: string } = {}): string {
  return `<div class="ap-e-disponible ap-tarjeta" style="${estilo}">`
    + `<span class="ap-e-disponible-icono">${icono('maletin', { tam: 27, trazo: 2.1 })}</span>`
    + '<span class="ap-e-disponible-titulo ap-display">Estás disponible</span>'
    + '<p class="ap-e-disponible-texto">Te avisamos cuando entre un pedido de<br>tus rubros en tus zonas.</p>'
    + `<span class="ap-e-disponible-chips">${chipRubro({ rubro: 'plomeria' })}${chipRubro({ rubro: 'gas' })}</span>`
    + '</div>';
}

/** Píldora blanca "Buscando pedidos" (02-e-inicio). */
export function pildoraBuscando({ texto = 'Buscando pedidos', estilo = '' }: { texto?: string; estilo?: string } = {}): string {
  return `<span class="ap-buscando" style="${estilo}"><span class="ap-buscando-punto"></span><span>${texto}</span></span>`;
}

export function pantallaInicioEspecialista({ disponible = false, ambos = true, pestana = 'inicio' }: InicioEspecialistaProps = {}): string {
  const ve = (on: boolean) => `opacity:${on ? 1 : 0}`;
  return '<div class="hd-capa ap-pantalla ap-ui" data-pantalla="e-inicio">'
    + mapa({ estado: disponible ? 'color' : 'gris', ambos, radar: disponible })
    + encabezado({ variante: 'azul', campana: false })
    + ((ambos || disponible) ? pildoraBuscando({ estilo: `left:17px;top:149.2px;${ve(disponible)}` }) : '')
    + interruptorDisponible({ prendido: disponible, estilo: 'left:203.4px;top:137.5px' })
    + ((ambos || !disponible) ? tarjetaFueraDeServicio({ estilo: `left:16px;top:539.5px;${ve(!disponible)}` }) : '')
    + ((ambos || disponible) ? tarjetaDisponible({ estilo: `left:16px;top:663.6px;${ve(disponible)}` }) : '')
    + barraInferior({ activa: pestana })
    + '</div>';
}

/** Al construir la escena: deja la pantalla de inicio en un estado (gsap.set; necesita ambos: true). */
export function ponerInicioEspecialista(capa: Element, disponible: boolean): void {
  const q = (s: string) => capa.querySelector(s);
  gsap.set(q('.ap-e-fuera'), { opacity: disponible ? 0 : 1, y: 0 });
  gsap.set([q('.ap-e-disponible'), q('.ap-buscando')], { opacity: disponible ? 1 : 0, y: 0 });
}

/** Prende "Disponible": el interruptor, el mapa (gris → color + radar), baja la tarjeta de fuera de servicio y sube la
    de disponible, aparece "Buscando pedidos". Devuelve la duración total. */
export function prenderInicioEspecialista(tl: GSAPTimeline, capa: Element, at: number): number {
  const q = (s: string) => capa.querySelector(s);
  prenderDisponible(tl, q('.ap-disponible')!, at);
  cruzarMapa(tl, q('.ap-mapa')!, 'color', at + 0.1, 0.5);
  tl.to(q('.ap-e-fuera'), { y: 60, opacity: 0, duration: 0.35, ease: 'power2.in' }, at + 0.15);
  tl.fromTo(q('.ap-e-disponible'), { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' }, at + 0.45);
  tl.fromTo(q('.ap-buscando'), { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, at + 0.35);
  return 0.9;
}

/** Hoja "Tu precio" (03…09-e-precio): UNA capa (velo + hoja) con el cuerpo de ui/precio.ts. */
export function hojaPrecio(props: CuerpoPrecioProps = {}): string {
  return hoja({ titulo: 'Tu precio', dato: 'precio', cuerpo: cuerpoPrecio(props) });
}
