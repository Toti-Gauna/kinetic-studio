/* Especialista · el pedido y el precio, diseño 2026 (src/handy/app/DISENO.md): le llega el pedido urgente de plomería,
   pone su precio en la hoja "Tu precio" y queda esperando que el cliente elija. Todo con los datos de la historia.
   Cada pantalla es UNA capa <div class="hd-capa …"> de 414×896 para el `pantalla` de phoneFrame (src/handy/ui/PhoneFrame.ts;
   con el encabezado azul usar phoneFrame({ estado: 'claro' })). Se dibuja en su estado final y los estados que cambian
   (monto tecleado, montos rápidos, Recibís, horario elegido, advertencia, puntitos) vienen apilados: la escena los cruza
   con opacity y mueve lo demás con transform. Posiciones medidas en el DOM, en px de la pantalla (x · y · ancho × alto;
   "centro" = donde apoya el dedo), calcadas de las fotos (≈1138×2513 × 0,3638). Las fotos miden 914 de alto: lo pegado
   abajo sube 8 (29) o 13 (10) para respetar nuestra barra y nuestro borde.

   avisoNuevoPedido({ capa = true, top, className }) · [data-pantalla="aviso-nuevo-pedido"] → el toast negro de 03-e-precio
     (aviso() de ui/aviso.ts): círculo amarillo con la canilla, «Nuevo pedido de plomería» · «La Perla, a 2,3 km. Handy
     sugiere $ 44.000.». Píldora .ap-aviso 17,1 · 13,1 · 379,4 × 74,6 (círculo centro 53,6 · 50,4). Bajarlo con bajarAviso
     (apaga la barra de estado y la isla de PhoneFrame) y sacarlo con subirAviso; quieto: gsap.set(barraDelAviso(el), { opacity: 0 }).

   tarjetaPedido({ rubro, icono, tipo, cita, renglones = 2, sugerido, datos, ubicacion = false, estilo, className }) → la
     tarjeta "NUEVO PEDIDO" de 29-e-pedido-programado, por defecto con la urgencia de la historia (PEDIDO): "Plomería",
     etiqueta "Urgencia", la cita en dos renglones, "Handy sugiere $ 44.000" + "El precio lo ponés vos", las cajas Cuándo
     (Hoy, martes 17) y Dónde (La Perla · a 2,3 km), "Aceptar", "Aceptar con otro precio" y el pie. Sin el renglón de
     ubicación de la foto (lo dice la caja Dónde): los botones suben a 16 de las cajas. La foto entera se reproduce con
     sus datos (ver CALIBRA_29 en la galería): medidasPedido({ renglones, ubicacion }) → { crece, botones, alto }.
   rutaPedido() → la ruta del mapa de 29: punto "yo" con su halo, pin rojo con su halo y diez puntitos azules del pin al yo.
   pantallaPedido({ pestana, pedido, abajo = 793,6 }) · [data-pantalla="e-pedido"] → 29-e-pedido-programado con la
     urgencia: mapa en color, ruta, encabezado azul, "Disponible" prendido, la tarjeta pegada abajo (termina en `abajo`) y
     la barra. Mismo mapa, encabezado, interruptor y barra que pantallaInicioEspecialista({ disponible: true }): cruzar una
     con otra con opacity solo cambia lo distinto (el yo, la píldora "Buscando pedidos", las tarjetas).
     Ganchos y posición (con la historia):
       .ap-ea-ruta-yo (centro 270,6 · 236,3; punto de 18,4 con aro blanco) · .ap-ea-ruta-halo[data-halo="yo|pin"] (latir
       con scale/opacity: el span mide 0×0 y está en el centro) · .ap-ea-ruta-pin (punta en 171,7 · 310,7, 32 × 41: caer
       con y) · .ap-ea-ruta-punto[data-i="0…9"] (<line> del svg, de 178,3 · 305 a 260,7 · 244; aparecen con opacity) ·
       .ap-disponible (203,4 · 137,5, prendido) ·
       .ap-ea-pedido (16 · 390,7 · 382 × 402,9, radio 28: sube con y) — .ap-ea-pedido-icono (cuadrado azul 35,6 · 411,8 ·
       51,2 × 51,3 + canto 2,9) · .ap-ea-pedido-rotulo · .ap-ea-pedido-titulo (x 99,9, mayúscula y 441) ·
       .ap-ea-pedido-etiqueta (233,1 · 427,3 · 82,5 × 19,6) · .ap-ea-pedido-cerrar[data-accion="rechazar"] (círculo gris
       de 48,5, centro 354,9 · 437,9) · .ap-ea-pedido-cita (35,6 · 479,9 · 344,2 × 60,7) · .ap-ea-pedido-sugiere (y 556,1) ·
       .ap-ea-pedido-monto (35,3 · 573,3) · .ap-ea-pedido-pones (214,7 · 583,9 · 165,1 × 21,8) ·
       .ap-ea-pedido-dato[data-dato="cuando"] (35,6 · 621,7 · 160,4 × 59) · [data-dato="donde"] (205,5 · 621,7 · 174,3 × 59) ·
       .ap-boton[data-accion="aceptar"] (35,6 · 696,7 · 164,8 × 51, plano como en la foto: centro 118 · 722,2) ·
       .ap-boton[data-accion="aceptar-otro-precio"] (213,5 · 696,7 · 166,3 × 50,9 + canto 4: centro 296,6 · 722,2) ·
       .ap-ea-pedido-pie (mayúscula y 762)
   llegaPedido(tl, capa, at) → duración: sube la tarjeta, cae el pin, aparecen los puntitos y laten los halos.

   hojaTuPrecio({ modo, monto, advertencia, rapido, recibis, horario, desplazado }) · [data-pantalla="hoja-tu-precio"]
     La hoja "Tu precio" completa (03…09-e-precio): UNA capa (velo + hoja de ui/hoja.ts, para apilar sobre la pantalla del
     especialista). Usa las clases y medidas de ui/precio.ts (sirven abrirTeclado y mostrarAdvertencia) y agrega lo que
     faltaba: el monto rápido elegido como capa en los cuatro (también "Dejar el sugerido"), Recibís con sus montos
     apilados, el botón "Enviar presupuesto" al final y el cuerpo que se desplaza (la foto lo corta: la hoja sigue abajo).
       modo 'rapidos' (03, default) · 'teclado' (04…09) — los dos vienen apilados (el otro en opacity 0).
       monto: índice de MONTOS_PRECIO ($ 44.000 · $ 0 · $ 4 · $ 45 · $ 450 · $ 4.500 · $ 45.000; los rojos con cursor).
       advertencia: caja roja "Ese valor es muy bajo…" (default: si el monto visible es rojo, solo en modo teclado).
       rapido: −1 ninguno · 0 "Dejar el sugerido" (default) · 1 "+ $ 1.000" · 2 "+ $ 2.000" · 3 "+ $ 5.000".
       recibis: índice de RECIBIS_PRECIO (0: $ 39.600 · 1: $ 40.500). horario: chip elegido (default 0, "Hoy, de 16 a 18 h").
       desplazado: y del cuerpo (default 0; DESPLAZAMIENTO_ENVIAR = −170 muestra Recibís entero y "Enviar presupuesto").
     Ganchos y posición (hoja en y 99,3; cuerpo desde x 35,7 · y 190,3; sin desplazar):
       .ap-velo · .ap-hoja (subirHoja de ui/hoja.ts) · .ap-hoja-cerrar (centro 351,8 · 153,5) ·
       .ap-precio-horarios .ap-chip[data-chip="Hoy, de 16 a 18 h"] (35,7 · 217,3 · 148,1 × 49,5: centro 109,8 · 242) ·
         [data-chip="Hoy, de 18 a 20 h"] (centro 267,7 · 242) · [data-chip="Hoy, de 20 a 22 h"] (centro 112,6 · 299,8) —
         elegido = su .ap-chip-sel en opacity 1 ·
       .ap-boton[data-accion="elegir-fecha"] (35,7 · 335,1 · 342,6 × 49,2) · [data-accion="elegir-horario"] (35,7 · 392,9) ·
       .ap-precio-sugerencia (centro y 494,5) · .ap-monto (51,3 · 526,7; − centro 78 · 553,5; + centro 356,8 · 553,5 con
         $ 44.000, se corre con el monto) · .ap-monto-valor[data-valor="0…6"] (opacity) · .ap-monto-cursor ·
         .ap-monto-boton-cara (apretar − / +: y = 4) ·
       modo rápidos: .ap-precio-rapidos (opacity) — .ap-precio-info (y 595,5) · .ap-precio-rapido[data-monto="sugerido"]
         (centro 158,7 · 649,3) · [data-monto="+ $ 1.000"] (centro 281,9 · 649,3) · [data-monto="+ $ 2.000"] (centro
         157,4 · 707,6) · [data-monto="+ $ 5.000"] (centro 256,3 · 707,6) — cada uno blanco con su .ap-precio-rapido-sel
         azul encima (opacity) · .ap-boton[data-accion="escribir-monto"] (111,5 · 746,5 · 191 × 49,5: centro 207 · 771,2) ·
         .ap-precio-recibis (35,3 · 832,7 · 343,4 × 130) con .ap-precio-recibis-monto[data-valor] y
         .ap-precio-recibis-detalle[data-valor] (opacity) · .ap-boton[data-accion="enviar-presupuesto"] (35,3 · 980,7 ·
         343,4 × 52 + canto 4,7; desplazado −170: 35,3 · 810,7, centro 207 · 836,7)
       modo teclado: .ap-precio-tecleo (opacity) — .ap-precio-advertencia (51,3 · 594,5 · 311,4 × 71,5; opacity) ·
         .ap-precio-tecleo-grupo (y 0 con advertencia, −85,2 sin ella) con .ap-boton[data-accion="listo"] y .ap-teclado ·
         .ap-tecla[data-tecla="1…9|00|0|borrar"] (97,3 × 52,4 + canto 3,2; columnas cada 107, filas cada 60,3).
         Sin advertencia: Listo centro 207 · 620,2 · teclado 51,3 · 658,4 · "4" centro 99,9 · 746,5 · "5" 206,9 · 746,5 ·
         "0" 206,9 · 867,1. Con advertencia todo 85,2 más abajo (en las fotos 05…08 la fila del 0 queda bajo el borde).
       .ap-ea-precio-ventana (recorta el cuerpo desde y 175,3) · .ap-ea-precio-desplazable (desplazarlo con y).
   Ayudas (devuelven la duración): escribirPrecio(tl, capa, at, { paso = .42, fijo = true }) — aprieta "Escribir otro
     monto", abre el teclado en $ 0 y tipea 4 · 5 · 0 · 0 · 0 hasta $ 45.000 (la advertencia aparece con $ 4 y se va con
     $ 45.000; con fijo el cuerpo sube mientras está, así el teclado queda quieto y el dedo aprieta en las posiciones "sin
     advertencia") · confirmarPrecio(tl, capa, at) — aprieta Listo, vuelve a los montos rápidos (ninguno elegido) y
     Recibís pasa a $ 40.500 · sumarRapido(tl, capa, at, { rapido = 1 }) — el camino corto: "+ $ 1.000" → $ 45.000 y
     $ 40.500 · enviarPresupuesto(tl, capa, at) — desplaza y aprieta "Enviar presupuesto" · elegirHorario(tl, capa, i, at) ·
     elegirRapido(tl, capa, i, at) · mostrarRecibis(tl, capa, i, at) · cerrarTeclado(tl, capa, at) ·
     desplazarPrecio(tl, capa, at, { y }). Al montar: acomodarMonto(capa.querySelector('.ap-monto')) (ui/teclado.ts),
     para que el + siga al monto (sin eso queda donde está).

   tarjetaResumen({ estilo }) → la tarjeta-ticket de 10-e-aceptado (366 × 264,1, radio 24,5).
   pantallaAceptado({ pie = true }) · [data-pantalla="e-aceptado"] → 10-e-aceptado: encabezado azul, el engranaje en su
     cuadrado gris con tres anillos, PRESUPUESTO ENVIADO, "Ahora elige el cliente" ("elige" subrayado), el texto, los
     puntitos de "escribiendo", la tarjeta Plomería · La Perla (Urgencia · Hoy, de 16 a 18 h) con el desglose (Mano de obra
     $ 32.000 · Materiales $ 13.000 · Tu presupuesto $ 45.000 · Tarifa Handy (10%) − $ 4.500 · Recibís $ 40.500) y abajo
     "Esperando al cliente →" gris en su franja blanca. Ganchos y posición:
       .ap-ea-emblema (0×0 en el centro 207 · 223) — .ap-ea-emblema-anillo[data-anillo="1|2|3"] (r 69,1 · 81,1 · 94,3; pop
       con scale) · .ap-ea-emblema-fondo (cuadrado gris de 128 girado −4°) · .ap-ea-emblema-handy (0×0 en 211 · 229: el
       engranaje inclinado 12° va adentro, en .ap-ea-emblema-giro; saltar con y/scale) ·
       .ap-ea-acept-rotulo (mayúscula y 323) · .ap-ea-acept-titulo (0 · 344 · 414 × 58,5) con .ap-resalte-banda ·
       .ap-ea-acept-texto (y 414) · .ap-ea-escribiendo (172,8 · 471,3 · 68 × 35,4) con .ap-ea-punto[data-i="0|1|2"]
       (centros 193,8 · 206,8 · 220,5; arriba y −4,2; cada uno con .ap-ea-punto-claro y .ap-ea-punto-oscuro en opacity) ·
       .ap-ea-resumen (24 · 528 · 366 × 264,1: sube con y) — .ap-ea-resumen-icono · .ap-ea-resumen-titulo ·
       .ap-ea-resumen-cuando · .ap-ea-resumen-etiqueta · .ap-ea-resumen-muesca[data-lado] · .ap-ea-resumen-punteado ·
       .ap-desglose-fila[data-fila="mano-de-obra|materiales|tu-presupuesto|tarifa-handy-10"] (y 622 · 648,2 · 680 · 706,2) ·
       .ap-desglose-total (Recibís, 738,8) · .ap-ea-acept-pie (franja blanca desde y 808: sube con y) ·
       .ap-boton[data-accion="esperando"] (26,2 · 824,4 · 361,6 × 53,1 + canto 4,4: centro 207 · 851)
   Ayudas: entrarAceptado(tl, capa, at) → duración (anillos, cuadrado, engranaje que salta, textos, banda amarilla, tarjeta
     y pie; la capa ya visible) · latirPuntos(tl, capa, at, { vueltas = 3 }) → duración (cada puntito sube y se oscurece). */
import './ui/comun.ts';
import './css/ea.css';
import { gsap } from 'gsap';
import { encabezado } from './ui/encabezado.ts';
import { barraInferior, type Pestana } from './ui/barra.ts';
import { mapa } from './ui/mapa.ts';
import { interruptorDisponible } from './ui/interruptor.ts';
import { aviso } from './ui/aviso.ts';
import { boton, apretarBoton } from './ui/botones.ts';
import { chipHorario, etiqueta, elegirChip, type TonoEtiqueta } from './ui/chips.ts';
import { rotulo, tituloResaltado } from './ui/textos.ts';
import { hoja } from './ui/hoja.ts';
import { desglose } from './ui/desglose.ts';
import { sugerenciaHandy, infoMateriales, escribirOtroMonto, advertenciaPrecio, abrirTeclado, mostrarAdvertencia, SIN_ADVERTENCIA } from './ui/precio.ts';
import { montoGrande, teclado, teclear, mostrarMonto } from './ui/teclado.ts';
import { cls, esc } from './ui/comun.ts';
import { icono, type Icono } from './iconos.ts';
import { handy } from '../handys.ts';

// ── datos de la historia ─────────────────────────────────────────────────

/** El pedido urgente que le llega al especialista. */
export const PEDIDO = {
  rubro: 'Plomería',
  tipo: 'Urgencia',
  cita: '«Se rompió el caño de abajo de la pileta de la cocina y pierde agua.»',
  sugerido: '$ 44.000',
  cuando: 'Hoy, martes 17',
  donde: 'La Perla · a 2,3 km',
} as const;

export const AVISO_PEDIDO = { titulo: 'Nuevo pedido de plomería', detalle: 'La Perla, a 2,3 km. Handy sugiere $ 44.000.' } as const;

/** Capas del monto grande (montoGrande): el sugerido, el teclado vacío y lo que se tipea. "!" = rojo con cursor. */
export const MONTOS_PRECIO = ['$ 44.000', '$ 0', '!$ 4', '!$ 45', '!$ 450', '!$ 4.500', '$ 45.000'] as const;
/** Índices con nombre de MONTOS_PRECIO. */
export const MONTO = { sugerido: 0, vacio: 1, final: 6 } as const;
/** Lo que tipea la escena: tecla y capa de monto que queda. */
export const TECLEO_PRECIO: readonly { tecla: string; valor: number }[] = [
  { tecla: '4', valor: 2 }, { tecla: '5', valor: 3 }, { tecla: '0', valor: 4 }, { tecla: '0', valor: 5 }, { tecla: '0', valor: 6 },
];
/** Capas de la caja Recibís (10 % menos). */
export const RECIBIS_PRECIO: readonly { monto: string; detalle: string }[] = [
  { monto: '$ 39.600', detalle: 'Handy retiene solo su tarifa del 10%: $ 4.400' },
  { monto: '$ 40.500', detalle: 'Handy retiene solo su tarifa del 10%: $ 4.500' },
];
export const HORARIOS_PRECIO = ['Hoy, de 16 a 18 h', 'Hoy, de 18 a 20 h', 'Hoy, de 20 a 22 h'] as const;
/** Los montos rápidos (data-monto de cada uno). */
export const RAPIDOS_PRECIO = ['sugerido', '+ $ 1.000', '+ $ 2.000', '+ $ 5.000'] as const;
/** Cuánto sube el cuerpo de la hoja para ver Recibís y "Enviar presupuesto". */
export const DESPLAZAMIENTO_ENVIAR = -170;

/** Dónde va la tarjeta del pedido en pantallaPedido: pegada abajo (en la foto termina en 801,6; acá 8 más arriba porque
    su barra empieza en 820 y la nuestra en 812). y y h son los de la tarjeta con la historia. */
export const TARJETA_PEDIDO = { x: 16, abajo: 793.6, y: 390.7, w: 382, h: 402.9 } as const;
/** La ruta del mapa de 29-e-pedido-programado. */
export const RUTA_PEDIDO = {
  yo: { x: 270.6, y: 236.3 },
  pin: { x: 171.7, y: 310.7 },
  /** de cerca del pin a cerca del yo */
  desde: { x: 178.3, y: 305 },
  hasta: { x: 260.7, y: 244 },
  puntos: 10,
} as const;

// ── aviso ────────────────────────────────────────────────────────────────

export function avisoNuevoPedido({ capa = true, top, className = '' }: { capa?: boolean; top?: number; className?: string } = {}): string {
  return aviso({ ...AVISO_PEDIDO, icono: 'canilla', tono: 'amarillo', dato: 'nuevo-pedido', capa, top, className });
}

// ── tarjeta del pedido y la ruta del mapa ────────────────────────────────

/** Etiqueta de precio con el signo (la de "El precio lo ponés vos"), en la grilla de 24 como los de iconos.ts. */
const ICONO_PRECIO = '<svg class="ap-icono" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/>'
  + '<path d="M13.3 9.5c-.6-.8-1.9-1-2.7-.4-.7.6-.5 1.5.4 1.9l1.3.6c.9.4 1.1 1.4.4 2-.8.6-2.1.4-2.8-.4"/><path d="m12.6 8.2-.6-.9"/><path d="m10.6 15.2-.6-.9"/></svg>';

/** Una caja celeste de la tarjeta (Cuándo / Dónde): rótulo gris y el valor azul con su ícono. */
export interface DatoPedido { id: string; rotulo: string; icono: Icono; valor: string; ancho: number }

export interface PedidoProps {
  rubro?: string;
  icono?: Icono;
  /** la etiqueta de arriba (default "Urgencia" amarilla con el triángulo) */
  tipo?: { texto: string; tono?: TonoEtiqueta; icono?: Icono };
  cita?: string;
  /** renglones de la cita (default 2: la de la historia no entra en uno) */
  renglones?: number;
  sugerido?: string;
  /** las dos cajas (anchos en px; entre las dos y el hueco de 9,5 suman 344,2) */
  datos?: readonly DatoPedido[];
  /** renglón con el pin rojo debajo de las cajas (la foto: "Los Troncos · a 3,1 km"); default sin él */
  ubicacion?: string | false;
  estilo?: string;
  className?: string;
}

const DATOS_PEDIDO: readonly DatoPedido[] = [
  { id: 'cuando', rotulo: 'Cuándo', icono: 'calendario', valor: PEDIDO.cuando, ancho: 160.4 },
  { id: 'donde', rotulo: 'Dónde', icono: 'pin', valor: PEDIDO.donde, ancho: 174.3 },
];

/** Geometría de la tarjeta (relativa a ella), medida en 29-e-pedido-programado: lo de arriba queda fijo, la cita crece de
    a un renglón de 20 y lo de abajo la sigue; sin el renglón de ubicación, los botones suben a 16 de las cajas. */
export const GEOMETRIA_PEDIDO = { cita: 89.2, citaAlto: 40.7, renglon: 20, datos: 211, datosAlto: 59, ubicacion: 47.3, sinUbicacion: 16, pie: 96.9 } as const;

/** Alto de la tarjeta y dónde empiezan los botones. */
export function medidasPedido({ renglones = 2, ubicacion = false }: { renglones?: number; ubicacion?: string | false } = {}): { crece: number; botones: number; alto: number } {
  const g = GEOMETRIA_PEDIDO;
  const crece = Math.max(0, renglones - 1) * g.renglon;
  const botones = g.datos + crece + g.datosAlto + (ubicacion ? g.ubicacion : g.sinUbicacion);
  return { crece, botones, alto: Math.round((botones + g.pie) * 10) / 10 };
}

export function tarjetaPedido({
  rubro = PEDIDO.rubro, icono: ic = 'canilla', tipo = { texto: PEDIDO.tipo, icono: 'alerta' }, cita = PEDIDO.cita, renglones = 2,
  sugerido = PEDIDO.sugerido, datos = DATOS_PEDIDO, ubicacion = false, estilo = '', className = '',
}: PedidoProps = {}): string {
  const m = medidasPedido({ renglones, ubicacion });
  let x = 19.6;
  const cajas = datos.map(d => {
    const html = `<div class="ap-ea-pedido-dato" data-dato="${esc(d.id)}" style="left:${x}px;width:${d.ancho}px">`
      + `<span class="ap-ea-pedido-dato-rotulo">${esc(d.rotulo)}</span>`
      + `<span class="ap-ea-pedido-dato-valor">${icono(d.icono, { tam: 16, trazo: 2.4 })}<span>${esc(d.valor)}</span></span></div>`;
    x += d.ancho + 9.5;
    return html;
  }).join('');
  return `<div class="${cls('ap-ea-pedido', 'ap-tarjeta', className)}" style="--ap-ea-crece:${m.crece}px;--ap-ea-botones:${m.botones}px;height:${m.alto}px;${estilo}">`
    + '<span class="ap-ea-pedido-icono"><span class="ap-ea-pedido-icono-canto"></span>'
    + `<span class="ap-ea-pedido-icono-cara">${icono(ic, { tam: 30, trazo: 2 })}</span></span>`
    + '<span class="ap-ea-pedido-rotulo ap-rotulo">Nuevo<br>pedido</span>'
    + `<span class="ap-ea-pedido-titulo ap-display">${esc(rubro)}</span>`
    + `<span class="ap-ea-pedido-etiqueta">${etiqueta({ texto: tipo.texto, tono: tipo.tono ?? 'amarillo', icono: tipo.icono })}</span>`
    + `<span class="ap-ea-pedido-cerrar" data-accion="rechazar">${icono('cerrar', { tam: 19, trazo: 2.5 })}</span>`
    + `<p class="ap-ea-pedido-cita">${esc(cita)}</p>`
    + '<span class="ap-ea-pedido-sugiere">Handy sugiere</span>'
    + `<span class="ap-ea-pedido-monto ap-display">${esc(sugerido)}</span>`
    + `<span class="ap-ea-pedido-pones">${ICONO_PRECIO}<span>El precio lo ponés vos</span></span>`
    + cajas
    + (ubicacion ? `<span class="ap-ea-pedido-ubicacion">${icono('pin', { tam: 15.5, trazo: 2.4 })}<span>${esc(ubicacion)}</span></span>` : '')
    + boton({ texto: 'Aceptar', variante: 'azul', tam: 'grande', alto: 51, canto: 0, ancho: 164.8, accion: 'aceptar', className: 'ap-ea-pedido-aceptar' })
    + boton({ texto: 'Aceptar con otro precio', variante: 'gris', tam: 'grande', alto: 50.9, canto: 4, ancho: 166.3, accion: 'aceptar-otro-precio', className: 'ap-ea-pedido-otro' })
    + '<p class="ap-ea-pedido-pie">Si no te sirve, lo rechazás sin penalización.</p>'
    + '</div>';
}

/** Pin rojo con borde blanco (la punta abajo al medio: 16 · 39,5 del svg). */
const PIN = '<svg viewBox="0 0 32 41" width="32" height="41" aria-hidden="true">'
  + '<path d="M16 38.6C9.4 30.6 1.9 23.9 1.9 15.4a14.1 14.1 0 0 1 28.2 0C30.1 23.9 22.6 30.6 16 38.6z" fill="#E5392F" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>'
  + '<circle cx="16" cy="15.2" r="5.6" fill="#FFFFFF"/></svg>';

export function rutaPedido({ className = '' }: { className?: string } = {}): string {
  const r = RUTA_PEDIDO;
  const dx = (r.hasta.x - r.desde.x) / (r.puntos - 1), dy = (r.hasta.y - r.desde.y) / (r.puntos - 1);
  const largo = Math.hypot(dx, dy), ux = dx / largo, uy = dy / largo, medio = 0.7; // medio largo del trazo (sin las puntas redondas)
  const n = (v: number) => Math.round(v * 100) / 100;
  const puntos = Array.from({ length: r.puntos }, (_, i) => {
    const x = r.desde.x + dx * i, y = r.desde.y + dy * i;
    return `<line class="ap-ea-ruta-punto" data-i="${i}" x1="${n(x - ux * medio)}" y1="${n(y - uy * medio)}" x2="${n(x + ux * medio)}" y2="${n(y + uy * medio)}"/>`;
  }).join('');
  return `<div class="${cls('ap-ea-ruta', className)}">`
    + `<span class="ap-ea-ruta-halo" data-halo="yo" style="left:${r.yo.x}px;top:${r.yo.y}px"></span>`
    + `<span class="ap-ea-ruta-halo" data-halo="pin" style="left:${r.pin.x}px;top:${r.pin.y + 4}px"></span>`
    + `<svg class="ap-ea-ruta-puntos" viewBox="0 0 414 896" width="414" height="896" aria-hidden="true">${puntos}</svg>`
    + `<span class="ap-ea-ruta-yo" style="left:${r.yo.x}px;top:${r.yo.y}px"><span class="ap-ea-ruta-yo-punto"></span></span>`
    + `<span class="ap-ea-ruta-pin" style="left:${r.pin.x}px;top:${r.pin.y}px">${PIN}</span>`
    + '</div>';
}

export function pantallaPedido({ pestana = 'inicio', pedido = {}, abajo = TARJETA_PEDIDO.abajo }: { pestana?: Pestana; pedido?: Omit<PedidoProps, 'estilo'>; abajo?: number } = {}): string {
  const { alto } = medidasPedido(pedido);
  return '<div class="hd-capa ap-pantalla ap-ui" data-pantalla="e-pedido">'
    + mapa({ estado: 'color', ambos: false, yo: false })
    + rutaPedido()
    + encabezado({ variante: 'azul', campana: false })
    + interruptorDisponible({ prendido: true, estilo: 'left:203.4px;top:137.5px' })
    + tarjetaPedido({ ...pedido, estilo: `left:${TARJETA_PEDIDO.x}px;top:${Math.round((abajo - alto) * 10) / 10}px` })
    + barraInferior({ activa: pestana })
    + '</div>';
}

/** Llega el pedido a la pantalla: cae el pin, se dibuja la ruta del pin al yo, laten los halos y sube la tarjeta.
    Devuelve la duración. */
export function llegaPedido(tl: GSAPTimeline, capa: Element, at: number): number {
  const q = (s: string) => capa.querySelector(s);
  tl.fromTo(q('.ap-ea-pedido'), { y: 440 }, { y: 0, duration: 0.55, ease: 'back.out(1.15)' }, at);
  tl.fromTo(q('.ap-ea-ruta-pin'), { y: -46, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'bounce.out' }, at + 0.15);
  tl.fromTo(capa.querySelectorAll('.ap-ea-ruta-punto'), { opacity: 0 }, { opacity: 1, duration: 0.08, ease: 'none', stagger: 0.045 }, at + 0.45);
  tl.fromTo(capa.querySelectorAll('.ap-ea-ruta-halo'), { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.12 }, at + 0.5);
  return 1.2;
}

// ── hoja "Tu precio" ─────────────────────────────────────────────────────

export interface TuPrecioProps {
  modo?: 'rapidos' | 'teclado';
  /** capa visible de MONTOS_PRECIO (default 0: $ 44.000) */
  monto?: number;
  /** caja roja de monto bajo (default: si el monto visible es rojo; solo en modo teclado) */
  advertencia?: boolean;
  /** monto rápido elegido: −1 ninguno · 0 sugerido (default) · 1…3 las sumas */
  rapido?: number;
  /** capa visible de RECIBIS_PRECIO (default 0) */
  recibis?: number;
  /** chip de horario elegido (default 0) */
  horario?: number;
  /** y del cuerpo (default 0; DESPLAZAMIENTO_ENVIAR muestra el botón de enviar) */
  desplazado?: number;
}

/** Un monto rápido: base blanca y encima la azul (elegido = opacity 1). Mismas medidas que en ui/precio.ts. */
function montoRapido(texto: string, dato: string, elegido: boolean, alto: number, canto: number): string {
  const b = (v: 'azul' | 'blanco') => boton({ texto, variante: v, tam: 'pildora', alto, canto });
  return `<span class="ap-precio-rapido" data-monto="${esc(dato)}">${b('blanco')}`
    + `<span class="ap-precio-rapido-sel" style="opacity:${elegido ? 1 : 0}">${b('azul')}</span></span>`;
}

function cuerpoTuPrecio({ modo = 'rapidos', monto = 0, advertencia, rapido = 0, recibis = 0, horario = 0, desplazado = 0 }: TuPrecioProps): string {
  const ve = (on: boolean) => `opacity:${on ? 1 : 0}`;
  const rapidos = modo === 'rapidos';
  const rojo = MONTOS_PRECIO[monto]?.startsWith('!') ?? false;
  const alerta = !rapidos && (advertencia ?? rojo);
  const [sug, mil, dosMil, cincoMil] = RAPIDOS_PRECIO;
  return '<div class="ap-ea-precio-ventana">'
    + `<div class="ap-ea-precio-desplazable"${desplazado ? ` style="transform:translateY(${desplazado}px)"` : ''}>`
    + '<div class="ap-precio">'
    + rotulo('¿Cuándo podés ir?', { className: 'ap-precio-rotulo' })
    + `<div class="ap-precio-horarios">${HORARIOS_PRECIO.map((h, i) => chipHorario({ texto: h, elegido: i === horario })).join('')}</div>`
    + '<div class="ap-precio-contornos">'
    + boton({ texto: 'Prefiero elegir la fecha', icono: 'calendario', variante: 'contorno', tam: 'medio', alto: 49.2, ancho: 342.6, accion: 'elegir-fecha' })
    + boton({ texto: 'Prefiero elegir el horario', icono: 'reloj', variante: 'contorno', tam: 'medio', alto: 49.2, ancho: 342.6, accion: 'elegir-horario' })
    + '</div>'
    + '<div class="ap-precio-caja">'
    + `<div class="ap-precio-fondo" data-modo="teclado" style="${ve(!rapidos)}"></div>`
    + '<div class="ap-precio-fondo" data-modo="rapidos"></div>'
    + sugerenciaHandy({ monto: PEDIDO.sugerido })
    + montoGrande({ valores: MONTOS_PRECIO, actual: monto })
    // montos rápidos, Recibís y enviar
    + `<div class="ap-precio-rapidos" style="${ve(rapidos)}">`
    + infoMateriales()
    + '<div class="ap-precio-rapidos-filas">'
    + `<div class="ap-precio-rapidos-fila">${montoRapido('Dejar el sugerido', sug, rapido === 0, 49.6, 2)}${montoRapido(mil, mil, rapido === 1, 49.6, 2)}</div>`
    + `<div class="ap-precio-rapidos-fila" data-fila="2">${montoRapido(dosMil, dosMil, rapido === 2, 48, 2.2)}${montoRapido(cincoMil, cincoMil, rapido === 3, 48, 2.2)}</div>`
    + '</div>'
    + escribirOtroMonto()
    + '<div class="ap-precio-recibis ap-ea-recibis">'
    + `<span class="ap-precio-recibis-icono">${icono('billetera', { tam: 22, trazo: 2 })}</span>`
    + '<span class="ap-precio-recibis-titulo">Recibís</span>'
    + RECIBIS_PRECIO.map((r, i) => `<span class="ap-precio-recibis-monto" data-valor="${i}" style="${ve(i === recibis)}">${esc(r.monto)}</span>`).join('')
    + RECIBIS_PRECIO.map((r, i) => `<p class="ap-precio-recibis-detalle" data-valor="${i}" style="${ve(i === recibis)}">${esc(r.detalle)}</p>`).join('')
    + '</div>'
    + boton({ texto: 'Enviar presupuesto', icono: 'enviar', variante: 'azul', tam: 'grande', ancho: 343.4, accion: 'enviar-presupuesto', className: 'ap-ea-precio-enviar' })
    + '</div>'
    // teclado
    + `<div class="ap-precio-tecleo" style="${ve(!rapidos)}">`
    + advertenciaPrecio({ estilo: ve(alerta) })
    + `<div class="ap-precio-tecleo-grupo"${alerta ? '' : ` style="transform:translateY(${SIN_ADVERTENCIA}px)"`}>`
    + boton({ texto: 'Listo', icono: 'lapiz', variante: 'azul', tam: 'pildora', alto: 49.5, canto: 2.2, ancho: 87.2, accion: 'listo', className: 'ap-precio-listo' })
    + teclado()
    + '</div></div>'
    + '</div></div></div></div>';
}

export function hojaTuPrecio(props: TuPrecioProps = {}): string {
  return hoja({ titulo: 'Tu precio', dato: 'tu-precio', cuerpo: cuerpoTuPrecio(props), className: 'ap-ea-hoja-precio' });
}

const partesPrecio = (capa: Element) => {
  const q = (s: string) => capa.querySelector(s)!;
  return {
    cuerpo: q('.ap-precio'), monto: q('.ap-monto'), teclado: q('.ap-teclado'), desplazable: q('.ap-ea-precio-desplazable'),
    escribir: q('.ap-boton[data-accion="escribir-monto"]'), listo: q('.ap-boton[data-accion="listo"]'),
    enviar: q('.ap-boton[data-accion="enviar-presupuesto"]'),
  };
};

/** Elige un chip de horario (y suelta los otros). Devuelve la duración. */
export function elegirHorario(tl: GSAPTimeline, capa: Element, i: number, at: number): number {
  capa.querySelectorAll('.ap-precio-horarios .ap-chip').forEach((c, j) => elegirChip(tl, c, at, { elegir: j === i }));
  return 0.2;
}

/** Deja elegido el monto rápido i (−1: ninguno). Devuelve la duración. */
export function elegirRapido(tl: GSAPTimeline, capa: Element, i: number, at: number, { dur = 0.2 }: { dur?: number } = {}): number {
  capa.querySelectorAll('.ap-precio-rapido-sel').forEach((s, j) => tl.to(s, { opacity: j === i ? 1 : 0, duration: dur, ease: 'power1.out' }, at));
  return dur;
}

/** Cruza la caja Recibís al valor i de RECIBIS_PRECIO. Devuelve la duración. */
export function mostrarRecibis(tl: GSAPTimeline, capa: Element, i: number, at: number, { dur = 0.25 }: { dur?: number } = {}): number {
  capa.querySelectorAll<HTMLElement>('.ap-precio-recibis [data-valor]').forEach(v => {
    tl.to(v, { opacity: Number(v.dataset.valor) === i ? 1 : 0, duration: dur, ease: 'power1.inOut' }, at);
  });
  return dur;
}

/** Del teclado a los montos rápidos (lo contrario de abrirTeclado). Devuelve la duración. */
export function cerrarTeclado(tl: GSAPTimeline, capa: Element, at: number, { dur = 0.35 }: { dur?: number } = {}): number {
  const q = (s: string) => capa.querySelector(s);
  tl.to(q('.ap-precio-tecleo'), { opacity: 0, y: 40, duration: dur * 0.6, ease: 'power1.in' }, at);
  tl.fromTo(q('.ap-precio-rapidos'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: dur, ease: 'power2.out' }, at + dur * 0.3);
  tl.to(q('.ap-precio-fondo[data-modo="teclado"]'), { opacity: 0, duration: dur * 0.6, ease: 'power1.in' }, at + dur * 0.5);
  return dur * 1.3;
}

/** Aprieta "Escribir otro monto", abre el teclado en $ 0 y tipea TECLEO_PRECIO (4 · 5 · 0 · 0 · 0 → $ 45.000): con el
    primer monto rojo aparece la advertencia y con el último se va. Con `fijo` (default) el teclado no se mueve: mientras
    está la advertencia el cuerpo sube lo mismo que el grupo baja (−85,2), así la fila del 0 sigue en pantalla (en las
    fotos 05…08 queda abajo del borde) y el dedo aprieta siempre en el mismo lugar: "4" 99,9 · 746,5 · "5" 206,9 · 746,5 ·
    "0" 206,9 · 867,1 · Listo 207 · 620,2. Devuelve la duración. */
export function escribirPrecio(tl: GSAPTimeline, capa: Element, at: number, { paso = 0.42, teclas = TECLEO_PRECIO, fijo = true }:
  { paso?: number; teclas?: readonly { tecla: string; valor: number }[]; fijo?: boolean } = {}): number {
  const p = partesPrecio(capa);
  let t = at + apretarBoton(tl, p.escribir, at);
  abrirTeclado(tl, p.cuerpo, t);
  mostrarMonto(tl, p.monto, MONTO.vacio, t + 0.08);
  t += 0.75;
  let rojo = false;
  for (const { tecla, valor } of teclas) {
    teclear(tl, p.teclado, tecla, t);
    mostrarMonto(tl, p.monto, valor, t + 0.06);
    const esRojo = MONTOS_PRECIO[valor]?.startsWith('!') ?? false;
    if (esRojo !== rojo) {
      const d = mostrarAdvertencia(tl, p.cuerpo, t + 0.06, { ver: esRojo });
      if (fijo) tl.to(p.desplazable, { y: esRojo ? SIN_ADVERTENCIA : 0, duration: d, ease: 'power2.inOut' }, t + 0.06);
    }
    rojo = esRojo;
    t += paso;
  }
  return t - at;
}

/** Aprieta Listo: vuelve a los montos rápidos (ninguno elegido) y Recibís pasa al valor `recibis`. Devuelve la duración. */
export function confirmarPrecio(tl: GSAPTimeline, capa: Element, at: number, { recibis = 1 }: { recibis?: number } = {}): number {
  const p = partesPrecio(capa);
  const t = at + apretarBoton(tl, p.listo, at);
  const d = cerrarTeclado(tl, capa, t);
  elegirRapido(tl, capa, -1, t);
  mostrarRecibis(tl, capa, recibis, t + 0.15);
  return t + d - at;
}

/** El camino corto: aprieta un monto rápido (default "+ $ 1.000"), lo elige y el monto y Recibís cambian. Devuelve la duración. */
export function sumarRapido(tl: GSAPTimeline, capa: Element, at: number, { rapido = 1, monto = MONTO.final, recibis = 1 }: { rapido?: number; monto?: number; recibis?: number } = {}): number {
  const p = partesPrecio(capa);
  const el = capa.querySelector(`.ap-precio-rapido[data-monto="${RAPIDOS_PRECIO[rapido]}"]`);
  if (!el) return 0;
  // aprieta la cara de las dos capas (la blanca y la azul de encima) a la vez
  el.querySelectorAll('.ap-boton').forEach(b => apretarBoton(tl, b, at));
  elegirRapido(tl, capa, rapido, at + 0.08);
  mostrarMonto(tl, p.monto, monto, at + 0.1);
  mostrarRecibis(tl, capa, recibis, at + 0.15);
  return 0.4;
}

/** Desplaza el cuerpo de la hoja (default: hasta ver "Enviar presupuesto"). Devuelve la duración. */
export function desplazarPrecio(tl: GSAPTimeline, capa: Element, at: number, { y = DESPLAZAMIENTO_ENVIAR, dur = 0.6 }: { y?: number; dur?: number } = {}): number {
  tl.to(partesPrecio(capa).desplazable, { y, duration: dur, ease: 'power3.inOut' }, at);
  return dur;
}

/** Desplaza hasta "Enviar presupuesto" y lo aprieta. Devuelve la duración. */
export function enviarPresupuesto(tl: GSAPTimeline, capa: Element, at: number): number {
  const d = desplazarPrecio(tl, capa, at);
  return d + 0.25 + apretarBoton(tl, partesPrecio(capa).enviar, at + d + 0.25);
}

// ── presupuesto enviado (10-e-aceptado) ──────────────────────────────────

/** La tarjeta-ticket del presupuesto enviado (relativa a sí misma; en la pantalla va en 24 · 528). */
export function tarjetaResumen({ estilo = '', className = '' }: { estilo?: string; className?: string } = {}): string {
  return `<div class="${cls('ap-ea-resumen', 'ap-tarjeta', className)}" style="${estilo}">`
    + '<span class="ap-ea-resumen-icono"><span class="ap-ea-resumen-icono-canto"></span>'
    + `<span class="ap-ea-resumen-icono-cara">${icono('canilla', { tam: 30, trazo: 2.1 })}</span></span>`
    + '<span class="ap-ea-resumen-titulo">Plomería · La Perla</span>'
    + `<span class="ap-ea-resumen-cuando">${esc(HORARIOS_PRECIO[0])}</span>`
    + `<span class="ap-ea-resumen-etiqueta">${etiqueta({ texto: PEDIDO.tipo, icono: 'alerta' })}</span>`
    + '<span class="ap-ea-resumen-muesca" data-lado="izq"></span><span class="ap-ea-resumen-muesca" data-lado="der"></span>'
    + '<span class="ap-ea-resumen-punteado"></span>'
    + '<div class="ap-ea-resumen-desglose">'
    + desglose({
      filas: [
        { texto: 'Mano de obra', monto: 32000 },
        { texto: 'Materiales', monto: 13000 },
        { texto: 'Tu presupuesto', monto: 45000, fuerte: true, antes: 'punteado' },
        { texto: 'Tarifa Handy (10%)', monto: -4500, tono: 'rojo' },
      ],
      total: { texto: 'Recibís', monto: 40500, tono: 'verde', display: false },
    })
    + '</div></div>';
}

export function pantallaAceptado({ pie = true }: { pie?: boolean } = {}): string {
  const punto = (i: number, arriba: boolean) => `<span class="ap-ea-punto" data-i="${i}"${arriba ? ' style="transform:translateY(-4.2px)"' : ''}>`
    + `<span class="ap-ea-punto-claro"></span><span class="ap-ea-punto-oscuro" style="opacity:${arriba ? 1 : 0}"></span></span>`;
  return '<div class="hd-capa ap-pantalla ap-ui" data-pantalla="e-aceptado">'
    + encabezado({ variante: 'azul', campana: false })
    + '<div class="ap-ea-emblema">'
    + ['3', '2', '1'].map(a => `<span class="ap-ea-emblema-anillo" data-anillo="${a}"></span>`).join('')
    + '<span class="ap-ea-emblema-fondo"></span>'
    + `<span class="ap-ea-emblema-handy"><span class="ap-ea-emblema-giro">${handy('engranaje', { altura: 100, humor: 'feliz' })}</span></span>`
    + '</div>'
    + rotulo('Presupuesto enviado', { className: 'ap-ea-acept-rotulo' })
    + tituloResaltado({ texto: 'Ahora elige\nel cliente', resaltar: 'elige', tam: 29.5, alto: '29px', ancho: 120, className: 'ap-ea-acept-titulo' })
    + '<p class="ap-ea-acept-texto">El cliente compara los presupuestos y<br>elige. Te avisamos apenas lo haga.</p>'
    + `<div class="ap-ea-escribiendo">${punto(0, true)}${punto(1, true)}${punto(2, false)}</div>`
    + tarjetaResumen()
    + (pie ? '<div class="ap-ea-acept-pie">'
      + boton({ texto: 'Esperando al cliente', icono: 'flecha-der', iconoLado: 'der', variante: 'gris', tam: 'grande', alto: 53.1, canto: 4.4, ancho: 361.6, accion: 'esperando', className: 'ap-ea-acept-esperando' })
      + '</div>' : '')
    + '</div>';
}

/** Los puntitos de "escribiendo": cada uno sube y se oscurece, de a uno, `vueltas` veces. Devuelve la duración. */
export function latirPuntos(tl: GSAPTimeline, capa: Element, at: number, { vueltas = 3, paso = 0.16 }: { vueltas?: number; paso?: number } = {}): number {
  const puntos = [...capa.querySelectorAll('.ap-ea-punto')];
  const ciclo = paso * (puntos.length + 2);
  gsap.set(puntos, { y: 0 });
  gsap.set(capa.querySelectorAll('.ap-ea-punto-oscuro'), { opacity: 0 });
  for (let v = 0; v < vueltas; v++) {
    puntos.forEach((p, i) => {
      const t = at + v * ciclo + i * paso;
      tl.to(p, { y: -4.2, duration: paso, ease: 'power1.out' }, t);
      tl.to(p.querySelector('.ap-ea-punto-oscuro'), { opacity: 1, duration: paso, ease: 'power1.out' }, t);
      tl.to(p, { y: 0, duration: paso * 1.4, ease: 'power1.in' }, t + paso * 1.6);
      tl.to(p.querySelector('.ap-ea-punto-oscuro'), { opacity: 0, duration: paso * 1.4, ease: 'power1.in' }, t + paso * 1.6);
    });
  }
  return vueltas * ciclo + paso * 1.2;
}

/** Entra la pantalla de presupuesto enviado: anillos, el engranaje que salta, el título con su banda, el texto, la
    tarjeta y el pie. (La capa ya visible: cruzarla antes con opacity.) Devuelve la duración. */
export function entrarAceptado(tl: GSAPTimeline, capa: Element, at: number): number {
  const q = (s: string) => capa.querySelector(s);
  tl.fromTo(capa.querySelectorAll('.ap-ea-emblema-anillo'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.08 }, at);
  tl.fromTo(q('.ap-ea-emblema-fondo'), { scale: 0.5, opacity: 0, rotation: -30 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.5)' }, at + 0.05);
  tl.fromTo(q('.ap-ea-emblema-handy'), { y: 40, scale: 0.6, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)' }, at + 0.15);
  tl.fromTo([q('.ap-ea-acept-rotulo'), q('.ap-ea-acept-titulo'), q('.ap-ea-acept-texto'), q('.ap-ea-escribiendo')], { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.07 }, at + 0.3);
  tl.fromTo(q('.ap-ea-acept-titulo .ap-resalte-banda'), { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, at + 0.65);
  tl.fromTo(q('.ap-ea-resumen'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, at + 0.5);
  const pie = q('.ap-ea-acept-pie');
  if (pie) tl.fromTo(pie, { y: 100 }, { y: 0, duration: 0.45, ease: 'power3.out' }, at + 0.6);
  return 1.1;
}
