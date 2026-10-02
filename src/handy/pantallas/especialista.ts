/* Pantallas de la app del especialista (tráiler handy-especialista), armadas con los componentes de ui/ y el mismo
   lenguaje visual que la app de usuario (usuario.ts, usuario-chat.ts). Contenido del storyboard: Martín R. (plomero
   verificado), Carla M. (la clienta), el pedido de Plomería del Jue 15 oct · 16:00 y su presupuesto de $ 45.000.
   Cada función devuelve UNA capa .hd-capa[data-pantalla] de 414×896 para el `pantalla` de phoneFrame; se apilan en orden:
     phoneFrame({ pantalla: pantallaInicioEsp() + tarjetaPedido() + hojaPresupuesto() })
   Las pantallas (.hd-app) tienen fondo y tapan a las de abajo; las capas tarjetaPedido, hojaPresupuesto, avisoElegido,
   avisoCobro y resenaCliente son transparentes (van encima de otra pantalla). Todo se dibuja en su estado FINAL; la escena
   pone los estados iniciales con gsap.set al construir. Medidas en px de la pantalla (x, y desde su esquina; el .hd-pantalla
   está a 12 px del borde del .hd-telefono). Barra de estado: HORAS (manana, camino, chat, trabajo, cobro).

   pantallaInicioEsp({ trabajando = true })   escena 4 · [data-pantalla="inicio-esp"]: encabezado blanco (logo, campana,
       ubicación; esquinas de abajo redondeadas sobre el mapa), mapa de Mar del Plata con Martín, ficha "Trabajando" con el
       interruptor y barra inferior (Inicio activa). Con trabajando false: interruptor gris y mapa con el velo (dormido).
       .hd-header-logo (22, 56, 150×52: el mismo lugar que en la app de usuario, para el match cut del logo) ·
       .hd-esp-mapa (y 88, 414×720, debajo del encabezado) > .hd-mapa + .hd-esp-mapa-velo (velo claro: opacity 1 = dormido,
       0 = despierto) + .hd-esp-pulso[data-i="0|1"] (anillos de 220 px centrados en Martín, apagados: prepararPulso /
       pulsar) + .hd-esp-yo (avatar MR de 50 px, centro en INICIO_YO = (180, 350)) ·
       .hd-esp-trabajando[data-prendido] (ficha: x 169 y 132, 231×56) > .hd-esp-trabajando-icono + .hd-esp-trabajando-texto +
       .hd-interruptor (x 327 y 141, 64×38; ver ui/Interruptor.ts: .hd-interruptor-apagado / -prendido se cruzan con
       opacity, .hd-interruptor-perilla corre x 0 → 26; ponerInterruptor / prenderInterruptor) ·
       .hd-nav (y 808) > .hd-nav-item[data-tab="agenda"] (centro (157, 844): adonde se mete el aviso de la escena 6).
     Para arrancar apagado: ponerInterruptor(llave, false) + gsap.set(velo, { opacity: 1 }) + prepararPulso(pantalla); al
     toque: prenderInterruptor(tl, llave, t) + tl.to(velo, { opacity: 0 }) + pulsar(tl, pantalla, t).
   tarjetaPedido()                    escena 5 · [data-pantalla="pedido"] (capa transparente sobre el inicio): pin de la casa
       de Carla sobre el mapa y la tarjeta del pedido abajo (sobre la barra).
       .hd-esp-pedido-pin (.hd-pin-casa: punta en INICIO_CASA = (256, 274); pop con scale y transformOrigin '50% 100%') ·
       .hd-esp-pedido (x 14 y 405, 386×389; subirla con y) > .hd-esp-pedido-cabeza (.hd-esp-rubro-icono + .hd-esp-pedido-rubro
       "Plomería" + .hd-esp-pedido-titulo "Pedido programado") · .hd-esp-filas > .hd-esp-fila[data-fila="fecha|trabajo|lugar"] ·
       .hd-boton[data-accion="mandar-presupuesto"] (x 32 y 654, 350×56) · .hd-boton[data-accion="ahora-no"] (y 720).
   hojaPresupuesto({ enviado = true })  escena 5 · [data-pantalla="presupuesto"]: hoja "Tu presupuesto" (bottomSheet: velo +
       hoja gris que sube) con Mano de obra, Materiales, Llegada "Entre 16:06 y 16:30", Total, la línea "Comisión Handy 10 % ·
       recibís $ 40.500" y "Enviar presupuesto"; encima,
       la capa de éxito "Presupuesto enviado" (con enviado false está, pero en opacity 0).
       .hd-velo · .hd-hoja (y 403, alto 493: gsap.set(hoja, { yPercent: 100 }) → 0) ·
       .hd-esp-campo[data-campo="mano-de-obra|materiales|llegada"] > .hd-esp-campo-etiqueta + .hd-esp-campo-caja (cajas blancas
       x 202, 190×48, en y 518 · 576 · 634) > .hd-esp-monto + .hd-esp-cursor (cursor azul apagado: titilarlo con opacity) ·
       .hd-esp-total (x 22 y 694, 370×62) > .hd-esp-monto[data-monto="total"] (golpe con scale; transformOrigin a la derecha
       ya en el CSS) · .hd-esp-recibis (y 766: la comisión y lo que recibe; entra después del total) ·
       .hd-boton[data-accion="enviar-presupuesto"] (x 22 y 806, 370×56) ·
       .hd-esp-enviado (= .hd-exito de usuario.ts) > .hd-velo + .hd-exito-tarjeta (x 34 y 280, 346×269) > .hd-exito-check
       (104 px, centro (207, 366)) + .hd-exito-titulo + .hd-exito-detalle. Construida con enviado true: apagar la capa con
       gsap.set(.hd-esp-enviado, { opacity: 0 }) y prenderla con opacity (+ pop de la tarjeta y del tilde con scale).
     Montos: .hd-esp-monto[data-monto][data-valor] > .hd-esp-car[data-i][data-tipo="signo|espacio|digito|punto"]: un span
     por carácter ("$ 32.000" → $ · espacio · 3 · 2 · . · 0 · 0 · 0). prepararMonto(monto) esconde dígitos y puntos al
     construir y escribirMonto(tl, monto, at, { paso = .125 }) los hace entrar de a uno (devuelve el momento de cada uno).
   avisoElegido()                     escena 6 · [data-pantalla="elegido"]: velo + tarjeta grande "¡Te eligieron!".
       .hd-velo · .hd-esp-aviso (x 30 y 214, 354×415; centro (207, 421)) > .hd-esp-aviso-cabeza (banda azul) >
       .hd-esp-aviso-sello (círculo amarillo con el ícono de festejo, centro (207, 274)) + .hd-esp-aviso-titulo ·
       .hd-esp-aviso-cuerpo > .hd-esp-aviso-cliente (avatar CM + "Carla M. aceptó tu presupuesto") ·
       .hd-esp-fila[data-fila="rubro|fecha"] · .hd-esp-aviso-total > .hd-esp-monto[data-monto="total"].
       tarjetaElegido() da la tarjeta sola (toma el ancho de su contenedor: 354 en el teléfono), para armarla afuera.
   pantallaAgenda()                   escena 6 · [data-pantalla="agenda"]: encabezado, "Agenda", calendario de octubre de 2026
       (empieza el lunes; el 1 es jueves) con el jueves 15 marcado, "Próximas visitas" y la barra (Agenda activa).
       .hd-esp-agenda-titulo · .hd-calendario (x 22 y 167, 370×364; ver ui/Calendario.ts) > .hd-cal-dia[data-dia="1…31"]
       (44×46) · .hd-cal-dia[data-dia="15"] (x 185 y 365) > .hd-cal-marca (capa azul del 15: pop con scale/opacity) ·
       .hd-esp-subtitulo (y 555) · .hd-esp-visita[data-id="carla"] (x 22 y 592, 370×125) > .hd-esp-visita-fecha +
       .hd-esp-visita-textos (+ .hd-esp-visita-tipo "Programado") · .hd-nav-item[data-tab="agenda"][data-activo].
   pantallaChatCliente()              escena 7 · [data-pantalla="chat-cliente"]: el espejo de pantallaChatEspecialista():
       cabecera Carla M. (avatar CM) · "Plomería · Jue 15 oct", aviso "Tu número no se comparte", Martín a la derecha
       (salientes blancas con tildes) y Carla a la izquierda (azul) con la foto del caño.
       .hd-chat-panel · .hd-chat-cuerpo (ventana y 182–804) · .hd-chat-lista (583 de alto: entra sin desplazar) ·
       .hd-chip-sistema (y 196) · .hd-burbuja[data-id="hola"] (y 238) · [data-id="pide-foto"] (y 312) · [data-id="foto"]
       (y 407, 288 de alto; .hd-foto-gota[data-i] para el goteo) · [data-id="perfecto"] (y 705). Barra: HORAS.chat.
   pantallaEnCamino({ estado = 'en-camino' })  escena 7 · [data-pantalla="en-camino"]: el espejo de pantallaSeguimiento():
       encabezado azul (usar phoneFrame({ estado: 'claro' })), mapa con la ruta hasta la casa de Carla y el panel azul
       "En camino a lo de Carla M." · Casa · Mar del Plata · "Llegás entre 16:06 y 16:30" · Tu cliente Carla M.
       estado 'llego': Martín al lado de la casa, ruta apagada y el título "¡Llegaste!".
       Mapa (ui/MapView.ts) en y 94, 414×560: .hd-ruta-punto[data-t] · .hd-pin-casa (punta en (302, 346)) ·
       .hd-pin-especialista (MR; sale de (28, 504) + rutaDelta(t); moverPorRuta) · .hd-mapa-atras ·
       .hd-esp-camino-panel (y 625, 414×271) > .hd-esp-camino-estado[data-estado="en-camino|llego"] (cruzarlos con opacity) >
       .hd-esp-camino-titulo + .hd-esp-camino-lugar · .hd-seg-llegada (x 26 y 729) · .hd-seg-btn[data-accion="ruta|chat"].
   pantallaTrabajo()                  escena 8 · [data-pantalla="trabajo"]: "Trabajo en curso" (En curso), Plomería · Carla M.,
       cronómetro grande en 42:15, turno, detalle (Mano de obra · Materiales · Comisión Handy (10 %) − $ 4.500 · Ganás
       $ 40.500) y "Terminar trabajo".
       .hd-esp-en-curso > .hd-esp-en-curso-punto (titilar con opacity) · .hd-esp-trabajo-quien > .hd-esp-chip ·
       .hd-esp-crono-panel (x 22 y 219, 370×150) > .hd-crono (x 85 y 261, 245×94; ver ui/Cronometro.ts:
       .hd-crono-digito[data-i] > .hd-crono-tira movida con y; ponerCrono(crono, CRONO.inicio) al construir y
       saltarCrono(tl, crono, '18:49', at, { dur }) — dur 0 = salto seco) · .hd-esp-turno (y 385) ·
       .hd-desglose (y 584; ver ui/PriceBreakdown.ts) · .hd-boton[data-accion="terminar"] (x 22 y 800, 370×56).
   pantallaFin()                      escena 8 · [data-pantalla="fin"]: "¡Terminaste el trabajo!", el escenario vacío para
       los Handys, "Ganaste $ 40.500", Plomería · Carla M. · Jue 15 oct, "Cobrás en tu CBU o alias" y "Volver al inicio".
       .hd-esp-fin-titulo (y 130) · .hd-esp-fin-escenario (FIN_ESCENARIO: x 22 y 178, 370×344, celeste, radio 30; los
       Handys van adentro, en coordenadas de la caja, parados en FIN_ESCENARIO.piso = 300: la Gota de ≈ 150 y el Caño de
       ≈ 230 de alto entran; la caja no recorta) > .hd-esp-fin-piso (sombra del piso) · .hd-esp-fin-ganaste (y 548) >
       .hd-esp-monto[data-monto="ganaste"] (verde, 40 px) · .hd-esp-fin-detalle · .hd-esp-fin-cobro (y 650) ·
       .hd-boton[data-accion="volver"] (y 800).
   avisoCobro()                       escena 9 · [data-pantalla="cobro"]: notificación arriba "Te transferimos $ 40.500" ·
       "a martin.r.plomero" con el ícono del banco. .hd-esp-cobro (x 12 y 54, 390×90: bajarla con y desde ≈ −150) >
       .hd-esp-cobro-icono + .hd-esp-cobro-titulo > .hd-esp-monto[data-monto="cobro"] + .hd-esp-cobro-alias.
       tarjetaCobro() da la notificación sola.
   resenaCliente()                    escena 9 · [data-pantalla="resena-cliente"]: velo + la reseña de Carla.
       .hd-velo · .hd-esp-resena (x 30 y 300, 354×223) > .hd-esp-resena-cabeza (avatar CM, Carla M., Plomería · Jue 15 oct) +
       .hd-estrellas (x 92 y 394; ui/StarRating.ts: prepararEstrellas / llenarEstrellas con paso .125) +
       .hd-esp-resena-texto "¡Excelente! Rápido y prolijo.". tarjetaResena() da la tarjeta sola.

   Datos exportados (para no escribirlos a mano en las escenas): ESPECIALISTA (= ESPECIALISTAS.martin), CLIENTE
   { nombre: 'Carla M.', nombreCorto, iniciales: 'CM', color }, PEDIDO { rubro, icono, tipo, dia, hora, fecha, trabajo,
   lugar, distancia }, PRESUPUESTO { manoDeObra, materiales, total, llegada, llegas, validez }, ALIAS, CBU, RESENA,
   CRONO { inicio: '00:00', final: '42:15' }, AGENDA, MENSAJES, HORAS, INICIO_MAPA, INICIO_YO, INICIO_CASA, FIN_ESCENARIO.
   Ayudas: montoSpans(valor, clave) · prepararMonto / escribirMonto · prepararPulso / pulsar. */
import { gsap } from 'gsap';
import '../css/base.css';
import '../css/ui.css';
import '../css/chat.css';
import '../css/especialista.css';
import { formatARS, netoEspecialista, HANDY_COMISION } from '../tokens.ts';
import { icon, type IconName } from '../icons.ts';
import { appHeader } from '../ui/AppHeader.ts';
import { bottomNav } from '../ui/BottomNav.ts';
import { bottomSheet } from '../ui/BottomSheet.ts';
import { button } from '../ui/Button.ts';
import { avatar } from '../ui/Avatar.ts';
import { chatHeader } from '../ui/ChatHeader.ts';
import { chatBubble } from '../ui/ChatBubble.ts';
import { chatInput } from '../ui/ChatInput.ts';
import { systemChip } from '../ui/SystemChip.ts';
import { photoCard } from '../ui/PhotoCard.ts';
import { mapView, MAPA } from '../ui/MapView.ts';
import { priceBreakdown } from '../ui/PriceBreakdown.ts';
import { starRating } from '../ui/StarRating.ts';
import { interruptor } from '../ui/Interruptor.ts';
import { calendario } from '../ui/Calendario.ts';
import { cronometro } from '../ui/Cronometro.ts';
import { ESPECIALISTAS, PRESUPUESTOS, TRABAJO } from './usuario-chat.ts';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

// ── datos ─────────────────────────────────────────────────────────────────

/** El especialista del tráiler: Martín R. (mismos datos que en el tráiler de usuario). */
export const ESPECIALISTA = ESPECIALISTAS.martin;

/** La clienta: Carla M. (avatar violeta, fuera de los azules de la interfaz y lejos del naranja de Martín). */
export const CLIENTE = { nombre: 'Carla M.', nombreCorto: 'Carla', iniciales: 'CM', color: '#7C55C9' } as const;

/** El pedido (el mismo del tráiler de usuario). */
export const PEDIDO = {
  rubro: 'Plomería',
  icono: 'plomeria' as IconName,
  tipo: 'Pedido programado',
  dia: 'Jue 15 oct',
  hora: '16:00',
  fecha: 'Jue 15 oct · 16:00',
  trabajo: TRABAJO,
  lugar: 'Casa · Mar del Plata',
  distancia: 'a 15 min',
} as const;

const PRESU_MARTIN = PRESUPUESTOS[0];

const TOTAL_MARTIN = PRESU_MARTIN.manoDeObra + PRESU_MARTIN.materiales;
const NETO_MARTIN = netoEspecialista(TOTAL_MARTIN);

/** El presupuesto de Martín (PRESUPUESTOS[0] de usuario-chat.ts): $ 45.000. Handy se queda con su comisión del 10 %
    ($ 4.500) y Martín recibe $ 40.500 (el cliente paga aparte su tarifa de servicio del 5 %: eso es del tráiler de usuario). */
export const PRESUPUESTO = {
  manoDeObra: PRESU_MARTIN.manoDeObra,
  materiales: PRESU_MARTIN.materiales,
  total: TOTAL_MARTIN,
  /** comisión de Handy (10 %) y lo que recibe Martín */
  comision: NETO_MARTIN.comision,
  neto: NETO_MARTIN.neto,
  /** "10 %" */
  porcentaje: `${Math.round(HANDY_COMISION * 100)} %`,
  /** como lo ve el especialista en su hoja */
  llegada: 'Entre 16:06 y 16:30',
  /** como se lo dice la app en camino */
  llegas: 'Llegás entre 16:06 y 16:30',
  validez: '48 h',
} as const;

/** Cobro: alias ficticio y CBU enmascarado (si aparece). */
export const ALIAS = 'martin.r.plomero';
export const CBU = 'CBU •••• 4821';

/** Reseña de Carla. */
export const RESENA = { estrellas: 5, texto: '¡Excelente! Rápido y prolijo.' } as const;

/** Cronómetro de "Trabajo en curso": arranca en 00:00 y termina en 42:15. */
export const CRONO = { inicio: '00:00', final: '42:15' } as const;

/** Calendario de la agenda: octubre de 2026 (mes 9), con el jueves 15 marcado. */
export const AGENDA = { anio: 2026, mes: 9, titulo: 'Octubre 2026', dia: 15 } as const;

/** Chat con Carla (el mismo del tráiler de usuario, con los lados al revés: Martín escribe a la derecha). */
export const MENSAJES = [
  { id: 'hola', de: 'martin', texto: '¡Hola! Estoy a unas cuadras.', hora: '16:04' },
  { id: 'pide-foto', de: 'martin', texto: '¿Me mandás una foto de la pérdida? Así llevo el repuesto justo.', hora: '16:04' },
  { id: 'foto', de: 'carla', texto: 'Es abajo de la bacha.', hora: '16:05' },
  { id: 'perfecto', de: 'martin', texto: 'Perfecto, ya sé qué llevar.', hora: '16:05' },
] as const;

/** Horas sugeridas para la barra de estado (phoneFrame({ hora })). */
export const HORAS = { manana: '10:41', camino: '16:04', chat: '16:05', trabajo: '16:54', cobro: '17:10' } as const;

// ── geometría (px de la pantalla de 414×896) ───────────────────────────────

/** Mapa del inicio: arranca en y 88 (debajo de las esquinas redondeadas del encabezado) y mide 414×720. */
export const INICIO_MAPA = { y: 88, alto: 720 } as const;
/** Pasar de coordenadas del mapa de diseño (MAPA, 414×560) a la pantalla del inicio. */
const enPantalla = (x: number, y: number) => ({ x, y: y + INICIO_MAPA.y + (INICIO_MAPA.alto - MAPA.h) / 2 });
/** Dónde está Martín en el inicio (centro de su marcador y del pulso): la esquina de la plaza. */
export const INICIO_YO = enPantalla(180, 182);
/** Punta del pin de la casa de Carla en el inicio (capa del pedido): otra esquina, arriba a la derecha. */
export const INICIO_CASA = enPantalla(256, 106);

// ── piezas sueltas ────────────────────────────────────────────────────────

/** svg de 24×24 en el estilo de icons.ts (trazo, currentColor) para los íconos que no están en el set compartido. */
const svg = (paths: string, size: number, stroke = 2) =>
  `<svg class="hd-icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
/** maletín (lucide briefcase, ISC) */
const MALETIN = '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>';
/** banco (lucide landmark, ISC) */
const BANCO = '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>';

/** Pin de la casa (el mismo dibujo que el del mapa de seguimiento): la punta queda en left/top. */
const PIN_CASA = '<span class="hd-pin-sombra"></span>'
  + '<svg class="hd-pin-casa-svg" viewBox="0 0 44 56" width="44" height="56" aria-hidden="true">'
  + '<path d="M22 54C22 54 4 34.6 4 21.6a18 18 0 0 1 36 0C40 34.6 22 54 22 54Z" fill="var(--hd-azul)" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>'
  + `<g transform="translate(11.5 11) scale(.875)" color="#FFFFFF">${icon('casa', { size: 24, stroke: 2.4 })}</g>`
  + '</svg>';

/** "$ 32.000" con cada carácter en su span: .hd-esp-monto[data-monto] > .hd-esp-car[data-i][data-tipo]. */
export function montoSpans(valor: number, clave: string): string {
  const texto = formatARS(valor);
  const cars = Array.from(texto).map((c, i) => {
    const tipo = /\d/.test(c) ? 'digito' : c === '$' ? 'signo' : c === '.' ? 'punto' : 'espacio';
    return `<span class="hd-esp-car" data-i="${i}" data-tipo="${tipo}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`;
  }).join('');
  return `<span class="hd-esp-monto" data-monto="${esc(clave)}" data-valor="${valor}">${cars}</span>`;
}

/** Caracteres de un monto que "se escriben" (dígitos y puntos; el "$ " queda siempre). */
const tecleables = (monto: Element) =>
  Array.from(monto.querySelectorAll<HTMLElement>('.hd-esp-car[data-tipo="digito"], .hd-esp-car[data-tipo="punto"]'));

/** Al construir: esconde los dígitos y puntos de un .hd-esp-monto (quedan en su lugar, con opacity 0 y 10 px abajo). */
export function prepararMonto(monto: Element): void {
  gsap.set(tecleables(monto), { opacity: 0, y: 10 });
}

/** Los dígitos (y los puntos) del monto entran de a uno, uno por `paso` (default una semicorchea escrita: .125), con un
    saltito. Devuelve los momentos absolutos de cada carácter (para un sonido por dígito). */
export function escribirMonto(tl: GSAPTimeline, monto: Element, at: number, { paso = 0.125 }: { paso?: number } = {}): number[] {
  return tecleables(monto).map((c, i) => {
    const t = at + i * paso;
    tl.to(c, { opacity: 1, duration: 0.06, ease: 'none' }, t);
    tl.to(c, { y: 0, duration: 0.3, ease: 'back.out(3)' }, t);
    return t;
  });
}

// ── 1 · inicio del especialista ───────────────────────────────────────────

/** Al construir: los anillos del pulso, chicos y apagados. */
export function prepararPulso(pantalla: Element): void {
  gsap.set(pantalla.querySelectorAll('.hd-esp-pulso'), { scale: 0.25, opacity: 0 });
}

/** El mapa se "despierta": cada anillo del pulso sale desde Martín (scale .25 → 1) y se apaga, uno cada `paso`.
    Se puede llamar varias veces. Devuelve la duración. */
export function pulsar(tl: GSAPTimeline, pantalla: Element, at: number, { dur = 1.5, paso = 0.5 }: { dur?: number; paso?: number } = {}): number {
  const anillos = Array.from(pantalla.querySelectorAll('.hd-esp-pulso'));
  anillos.forEach((a, i) => {
    const t = at + i * paso;
    tl.set(a, { scale: 0.25, opacity: 1 }, t);
    tl.to(a, { scale: 1, duration: dur, ease: 'power2.out' }, t);
    tl.to(a, { opacity: 0, duration: dur, ease: 'power1.in' }, t);
  });
  return dur + paso * Math.max(0, anillos.length - 1);
}


export function pantallaInicioEsp({ trabajando = true }: { trabajando?: boolean } = {}): string {
  const yo = INICIO_YO;
  const mapaY = (p: { x: number; y: number }) => `left:${p.x}px;top:${p.y - INICIO_MAPA.y}px`;
  return `<div class="hd-capa hd-app hd-esp-inicio" data-pantalla="inicio-esp" data-trabajando="${trabajando ? 1 : 0}">`
    + appHeader({ className: 'hd-esp-header' })
    + `<div class="hd-esp-mapa" style="top:${INICIO_MAPA.y}px;height:${INICIO_MAPA.alto}px">`
    + mapView({ alto: INICIO_MAPA.alto, marcadores: false })
    + `<div class="hd-esp-mapa-velo" style="opacity:${trabajando ? 0 : 1}"></div>`
    + [0, 1].map(i => `<span class="hd-esp-pulso" data-i="${i}" style="${mapaY(yo)};opacity:0"></span>`).join('')
    + `<span class="hd-esp-yo" style="${mapaY(yo)}">${avatar({ iniciales: ESPECIALISTA.iniciales, color: ESPECIALISTA.color, tamano: 50, anillo: true })}</span>`
    + '</div>'
    + `<div class="hd-esp-trabajando" data-prendido="${trabajando ? 1 : 0}">`
    + `<span class="hd-esp-trabajando-icono">${svg(MALETIN, 22, 2.2)}</span>`
    + '<span class="hd-esp-trabajando-texto">Trabajando</span>'
    + interruptor({ prendido: trabajando })
    + '</div>'
    + bottomNav({ activo: 'inicio' })
    + '</div>';
}

// ── 2 · tarjeta del pedido ────────────────────────────────────────────────

/** Fila con ícono en cuadradito y texto (pedido, aviso). */
const filaIcono = (clave: string, ic: IconName, texto: string, cls = 'hd-esp-fila') =>
  `<div class="${cls}" data-fila="${clave}"><span class="hd-esp-fila-icono">${icon(ic, { size: 20, stroke: 2.2 })}</span>`
  + `<span class="hd-esp-fila-texto">${esc(texto)}</span></div>`;

export function tarjetaPedido(): string {
  const c = INICIO_CASA;
  return '<div class="hd-capa hd-esp-pedido-capa" data-pantalla="pedido">'
    + `<div class="hd-pin-casa hd-esp-pedido-pin" style="left:${c.x}px;top:${c.y}px">${PIN_CASA}</div>`
    + '<div class="hd-esp-pedido">'
    + '<div class="hd-esp-pedido-cabeza">'
    + `<span class="hd-esp-rubro-icono">${icon(PEDIDO.icono, { size: 30, stroke: 2 })}</span>`
    + `<div class="hd-esp-pedido-titulos"><div class="hd-esp-pedido-rubro">${PEDIDO.rubro}</div>`
    + `<div class="hd-esp-pedido-titulo">${PEDIDO.tipo}</div></div>`
    + '</div>'
    + '<div class="hd-esp-filas">'
    + filaIcono('fecha', 'calendario', PEDIDO.fecha)
    + filaIcono('trabajo', 'herramienta', PEDIDO.trabajo)
    + filaIcono('lugar', 'casa', `${PEDIDO.lugar} · ${PEDIDO.distancia}`)
    + '</div>'
    + '<div class="hd-esp-pedido-botones">'
    + button({ texto: 'Mandar presupuesto', accion: 'mandar-presupuesto' })
    + button({ texto: 'Ahora no', variante: 'contorno', accion: 'ahora-no' })
    + '</div>'
    + '</div></div>';
}

// ── 3 · hoja "Tu presupuesto" ─────────────────────────────────────────────

export function hojaPresupuesto({ enviado = true }: { enviado?: boolean } = {}): string {
  const campo = (clave: string, etiqueta: string, valor: number) =>
    `<div class="hd-esp-campo" data-campo="${clave}"><span class="hd-esp-campo-etiqueta">${etiqueta}</span>`
    + `<span class="hd-esp-campo-caja">${montoSpans(valor, clave)}<i class="hd-esp-cursor" style="opacity:0"></i></span></div>`;
  const contenido = '<div class="hd-esp-presu">'
    + campo('mano-de-obra', 'Mano de obra', PRESUPUESTO.manoDeObra)
    + campo('materiales', 'Materiales', PRESUPUESTO.materiales)
    + '<div class="hd-esp-campo" data-campo="llegada"><span class="hd-esp-campo-etiqueta">Llegada</span>'
    + `<span class="hd-esp-campo-caja hd-esp-campo-caja--texto">${icon('reloj', { size: 19, stroke: 2.3 })}<span>${PRESUPUESTO.llegada}</span></span></div>`
    + `<div class="hd-esp-total"><span class="hd-esp-total-etiqueta">Total</span>${montoSpans(PRESUPUESTO.total, 'total')}</div>`
    + `<p class="hd-esp-recibis">Comisión Handy ${PRESUPUESTO.porcentaje} · recibís <b>${formatARS(PRESUPUESTO.neto)}</b></p>`
    + button({ texto: 'Enviar presupuesto', accion: 'enviar-presupuesto', icono: 'enviar' })
    + '</div>';
  const exito = `<div class="hd-exito hd-esp-enviado"${enviado ? '' : ' style="opacity:0"'}>`
    + '<div class="hd-velo"></div>'
    + '<div class="hd-exito-tarjeta">'
    + `<div class="hd-exito-check">${icon('tilde', { size: 60, stroke: 3.2 })}</div>`
    + '<h3 class="hd-exito-titulo">Presupuesto enviado</h3>'
    + `<p class="hd-exito-detalle">${PEDIDO.rubro} · ${PEDIDO.fecha}<br>Total ${formatARS(PRESUPUESTO.total)}</p>`
    + '</div></div>';
  return '<div class="hd-capa hd-esp-presu-capa" data-pantalla="presupuesto">'
    + bottomSheet({ titulo: 'Tu presupuesto', subtitulo: `${PEDIDO.rubro} · ${PEDIDO.fecha}`, contenido })
    + exito
    + '</div>';
}

// ── 4 · aviso "¡Te eligieron!" ────────────────────────────────────────────

/** La tarjeta del aviso sola (para armarla también fuera del teléfono). */
export function tarjetaElegido(): string {
  return '<div class="hd-esp-aviso">'
    + '<div class="hd-esp-aviso-cabeza">'
    + `<span class="hd-esp-aviso-sello">${icon('festejo', { size: 34, stroke: 2 })}</span>`
    + '<div class="hd-esp-aviso-titulo">¡Te eligieron!</div>'
    + '</div>'
    + '<div class="hd-esp-aviso-cuerpo">'
    + '<div class="hd-esp-aviso-cliente">'
    + avatar({ iniciales: CLIENTE.iniciales, color: CLIENTE.color, tamano: 52 })
    + `<div class="hd-esp-aviso-quien"><b>${CLIENTE.nombre}</b> aceptó tu presupuesto</div>`
    + '</div>'
    + '<div class="hd-esp-filas">'
    + filaIcono('rubro', PEDIDO.icono, PEDIDO.rubro)
    + filaIcono('fecha', 'calendario', PEDIDO.fecha)
    + '</div>'
    + `<div class="hd-esp-aviso-total"><span>Tu presupuesto</span>${montoSpans(PRESUPUESTO.total, 'total')}</div>`
    + '</div></div>';
}

export function avisoElegido(): string {
  return '<div class="hd-capa hd-esp-elegido-capa" data-pantalla="elegido">'
    + '<div class="hd-velo"></div>'
    + tarjetaElegido()
    + '</div>';
}

// ── 5 · agenda ────────────────────────────────────────────────────────────

export function pantallaAgenda(): string {
  return '<div class="hd-capa hd-app hd-esp-agenda" data-pantalla="agenda">'
    + appHeader()
    + '<div class="hd-cuerpo">'
    + '<h2 class="hd-titulo-seccion hd-esp-agenda-titulo">Agenda</h2>'
    + calendario({ anio: AGENDA.anio, mes: AGENDA.mes, marcados: [AGENDA.dia], icono: PEDIDO.icono })
    + '<h3 class="hd-esp-subtitulo">Próximas visitas</h3>'
    + '<div class="hd-esp-visita" data-id="carla">'
    + '<div class="hd-esp-visita-fecha"><span class="hd-esp-visita-dsem">Jue</span><span class="hd-esp-visita-dia">15</span><span class="hd-esp-visita-mes">oct</span></div>'
    + '<div class="hd-esp-visita-textos">'
    + `<div class="hd-esp-visita-fila"><span class="hd-esp-visita-titulo">${PEDIDO.hora} · ${PEDIDO.rubro}</span>`
    + `<span class="hd-esp-visita-monto">${formatARS(PRESUPUESTO.total)}</span></div>`
    + `<div class="hd-esp-visita-trabajo">${esc(PEDIDO.trabajo)}</div>`
    + `<div class="hd-esp-visita-cliente">${avatar({ iniciales: CLIENTE.iniciales, color: CLIENTE.color, tamano: 26 })}<span>${CLIENTE.nombre}</span>`
    + `<span class="hd-esp-visita-tipo">${icon('programado', { size: 15, stroke: 2.3 })}Programado</span></div>`
    + '</div></div>'
    + '</div>'
    + bottomNav({ activo: 'agenda' })
    + '</div>';
}

// ── 6 · chat con la clienta ───────────────────────────────────────────────

export function pantallaChatCliente(): string {
  const lista = systemChip({ icono: 'candado', texto: 'Tu número no se comparte' })
    + MENSAJES.map(m => m.id === 'foto'
      ? chatBubble({ lado: 'entrante', foto: photoCard({ ancho: 200, alto: 240 }), texto: m.texto, hora: m.hora, id: m.id })
      : chatBubble({ lado: m.de === 'martin' ? 'saliente' : 'entrante', texto: m.texto, hora: m.hora, tildes: 'leido', id: m.id })).join('');
  const cabecera = chatHeader({
    nombre: CLIENTE.nombre, subtitulo: `${PEDIDO.rubro} · ${PEDIDO.dia}`, avatar: { iniciales: CLIENTE.iniciales, color: CLIENTE.color },
  });
  return '<div class="hd-capa hd-app hd-pantalla-chat hd-esp-chat" data-pantalla="chat-cliente">'
    + appHeader({ campana: true, ubicacion: false })
    + '<div class="hd-chat-panel">'
    + cabecera
    + `<div class="hd-chat-cuerpo"><div class="hd-chat-lista">${lista}</div></div>`
    + chatInput()
    + '</div></div>';
}

// ── 7 · en camino ─────────────────────────────────────────────────────────

export type EstadoCamino = 'en-camino' | 'llego';

export function pantallaEnCamino({ estado = 'en-camino' }: { estado?: EstadoCamino } = {}): string {
  const m = ESPECIALISTA;
  const estados: [EstadoCamino, string][] = [['en-camino', `En camino a lo de ${CLIENTE.nombre}`], ['llego', '¡Llegaste!']];
  const capas = estados.map(([e, t]) =>
    `<div class="hd-esp-camino-estado" data-estado="${e}"${e === estado ? '' : ' style="opacity:0"'}>`
    + `<div class="hd-esp-camino-titulo">${esc(t)}</div>`
    + `<div class="hd-esp-camino-lugar">${icon('casa', { size: 17, stroke: 2.3 })}<span>${PEDIDO.lugar}</span></div>`
    + '</div>').join('');
  const panel = `<section class="hd-seguimiento hd-esp-camino-panel" data-estado="${estado}">`
    + '<span class="hd-seg-asa"></span>'
    + `<div class="hd-esp-camino-estados">${capas}</div>`
    + '<div class="hd-seg-fila">'
    + `<span class="hd-seg-llegada">${icon('reloj', { size: 21, stroke: 2.3 })}<span>${PRESUPUESTO.llegas}</span></span>`
    + `<span class="hd-seg-btn" data-accion="ruta">${icon('navegacion', { size: 24, stroke: 2.1 })}</span>`
    + '</div>'
    + '<div class="hd-seg-especialista">'
    + avatar({ iniciales: CLIENTE.iniciales, color: CLIENTE.color, tamano: 46, anillo: true })
    + '<div class="hd-seg-quien"><span class="hd-seg-quien-etiqueta">Tu cliente</span>'
    + `<span class="hd-seg-quien-nombre">${CLIENTE.nombre}</span></div>`
    + `<span class="hd-seg-btn" data-accion="chat">${icon('mensajes', { size: 26, stroke: 2.1 })}</span>`
    + '</div>'
    + '</section>';
  return `<div class="hd-capa hd-app hd-pantalla-seguimiento hd-esp-camino" data-pantalla="en-camino" data-estado="${estado}">`
    + appHeader({ variante: 'azul', campana: true, ubicacion: false, className: 'hd-seg-header' })
    + mapView({ alto: 560, estado, especialista: { iniciales: m.iniciales, color: m.color } })
    + `<span class="hd-mapa-atras">${icon('atras', { size: 24, stroke: 2.3 })}</span>`
    + panel
    + '</div>';
}

// ── 8 · trabajo en curso ──────────────────────────────────────────────────

export function pantallaTrabajo(): string {
  return '<div class="hd-capa hd-app hd-esp-trabajo" data-pantalla="trabajo">'
    + appHeader()
    + '<div class="hd-cuerpo">'
    + '<div class="hd-esp-trabajo-cabeza"><h2 class="hd-titulo-seccion">Trabajo en curso</h2>'
    + '<span class="hd-esp-en-curso"><i class="hd-esp-en-curso-punto"></i>En curso</span></div>'
    + '<div class="hd-esp-trabajo-quien">'
    + `<span class="hd-esp-chip">${icon(PEDIDO.icono, { size: 18, stroke: 2.2 })}<span>${PEDIDO.rubro}</span></span>`
    + `<span class="hd-esp-chip">${avatar({ iniciales: CLIENTE.iniciales, color: CLIENTE.color, tamano: 24 })}<span>${CLIENTE.nombre}</span></span>`
    + '</div>'
    + '<div class="hd-esp-crono-panel">'
    + `<div class="hd-esp-crono-rotulo">${icon('reloj', { size: 20, stroke: 2.3 })}<span>Tiempo de trabajo</span></div>`
    + cronometro({ valor: CRONO.final, tamano: 84 })
    + '</div>'
    + '<div class="hd-tarjeta hd-tarjeta-doble hd-esp-turno">'
    + `<div class="hd-tarjeta-fila" data-fila="fecha"><span class="hd-tarjeta-icono">${icon('calendario', { size: 24, stroke: 2 })}</span>`
    + `<div class="hd-tarjeta-textos"><div class="hd-tarjeta-titulo">${PEDIDO.fecha}</div></div></div>`
    + `<div class="hd-tarjeta-fila" data-fila="lugar"><span class="hd-tarjeta-icono">${icon('casa', { size: 24, stroke: 2 })}</span>`
    + `<div class="hd-tarjeta-textos"><div class="hd-tarjeta-titulo">${PEDIDO.lugar}</div></div></div>`
    + '</div>'
    + '<div class="hd-rotulo hd-esp-detalle-rotulo">Detalle</div>'
    + priceBreakdown({
      filas: [
        { etiqueta: 'Mano de obra', valor: PRESUPUESTO.manoDeObra },
        { etiqueta: 'Materiales', valor: PRESUPUESTO.materiales },
        { etiqueta: `Comisión Handy (${PRESUPUESTO.porcentaje})`, valor: -PRESUPUESTO.comision, texto: `− ${formatARS(PRESUPUESTO.comision)}` },
      ],
      total: { etiqueta: 'Ganás', valor: PRESUPUESTO.neto },
    })
    + '</div>'
    + `<div class="hd-pie">${button({ texto: 'Terminar trabajo', variante: 'exito', icono: 'tilde', accion: 'terminar' })}</div>`
    + '</div>';
}

// ── 9 · fin del trabajo ───────────────────────────────────────────────────

/** Escenario de los Handys en pantallaFin (px de la pantalla): caja .hd-esp-fin-escenario. */
export const FIN_ESCENARIO = { x: 22, y: 178, w: 370, h: 344, piso: 300 } as const;

export function pantallaFin(): string {
  const e = FIN_ESCENARIO;
  return '<div class="hd-capa hd-app hd-esp-fin" data-pantalla="fin">'
    + appHeader()
    + '<h2 class="hd-esp-fin-titulo">¡Terminaste el trabajo!</h2>'
    + `<div class="hd-esp-fin-escenario" style="left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px">`
    + `<span class="hd-esp-fin-piso" style="top:${e.piso}px"></span></div>`
    + `<div class="hd-esp-fin-ganaste"><span>Ganaste</span>${montoSpans(PRESUPUESTO.neto, 'ganaste')}</div>`
    + `<p class="hd-esp-fin-detalle">${PEDIDO.rubro} · ${CLIENTE.nombre} · ${PEDIDO.dia}</p>`
    + '<div class="hd-tarjeta hd-esp-fin-cobro">'
    + `<span class="hd-tarjeta-icono">${svg(BANCO, 24, 2)}</span>`
    + `<div class="hd-tarjeta-textos"><div class="hd-tarjeta-titulo">Cobrás en tu CBU o alias</div><div class="hd-tarjeta-detalle">${ALIAS}</div></div>`
    + '</div>'
    + `<div class="hd-pie">${button({ texto: 'Volver al inicio', variante: 'contorno', accion: 'volver' })}</div>`
    + '</div>';
}

// ── 10 · cobro y reseña ───────────────────────────────────────────────────

/** La notificación de la transferencia sola (para armarla también fuera del teléfono). */
export function tarjetaCobro(): string {
  return '<div class="hd-esp-cobro">'
    + `<span class="hd-esp-cobro-icono">${svg(BANCO, 28, 2)}</span>`
    + '<div class="hd-esp-cobro-textos">'
    + '<div class="hd-esp-cobro-app"><span>Handy</span><span>ahora</span></div>'
    + `<div class="hd-esp-cobro-titulo">Te transferimos ${montoSpans(PRESUPUESTO.neto, 'cobro')}</div>`
    + `<div class="hd-esp-cobro-alias">a <b>${ALIAS}</b></div>`
    + '</div></div>';
}

export function avisoCobro(): string {
  return `<div class="hd-capa hd-esp-cobro-capa" data-pantalla="cobro">${tarjetaCobro()}</div>`;
}

/** La reseña de Carla sola. */
export function tarjetaResena(): string {
  return '<div class="hd-esp-resena">'
    + '<div class="hd-esp-resena-cabeza">'
    + avatar({ iniciales: CLIENTE.iniciales, color: CLIENTE.color, tamano: 52 })
    + `<div class="hd-esp-resena-quien"><div class="hd-esp-resena-nombre">${CLIENTE.nombre}</div>`
    + `<div class="hd-esp-resena-rubro">${PEDIDO.rubro} · ${PEDIDO.dia}</div></div>`
    + '</div>'
    + starRating({ valor: RESENA.estrellas, tamano: 38 })
    + `<p class="hd-esp-resena-texto">${esc(RESENA.texto)}</p>`
    + '</div>';
}

export function resenaCliente(): string {
  return '<div class="hd-capa hd-esp-resena-capa" data-pantalla="resena-cliente">'
    + '<div class="hd-velo"></div>'
    + tarjetaResena()
    + '</div>';
}
