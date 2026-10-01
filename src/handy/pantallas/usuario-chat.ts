/* Pantallas de chat y seguimiento de la app de usuario (tráiler handy-usuario), armadas con los componentes de ui/.
   Cada pantalla es una capa .hd-capa.hd-app de 414×896 (deja los 44 px de la barra de estado), para phoneFrame():
     pantallaPresupuestos()          escena 6 · chat "Presupuestos · Plomería" con el aviso y los tres presupuestos.
     pantallaSeguimiento(estado)     escena 8 · encabezado azul, mapa y panel de seguimiento (usar phoneFrame({ estado: 'claro' })).
     pantallaChatEspecialista()      escena 8 · chat con Martín R.: mensajes, foto de la pérdida y "Tu teléfono no se comparte".
   Bloque de la escena 2 (no es una pantalla): grupoMensajeria({ nombre, miembros, mensajes }) → tarjeta de chat de grupo
   genérica (sin marcas), y GRUPOS_PROBLEMA con los tres grupos del guion.
   Datos exportados: TRABAJO, ESPECIALISTAS, PRESUPUESTOS, presupuestoProps() → la escena 6 rearma las tarjetas grandes
   (chatPresupuesto({ ...presupuestoProps(PRESUPUESTOS[0]), escala: 1.4 })).
   Ganchos (además de los de cada componente):
     .hd-capa[data-pantalla="presupuestos|seguimiento|chat-especialista"] · .hd-chat-panel · .hd-chat-cuerpo (ventana que
     recorta) · .hd-chat-lista (lo que se desplaza con y) · .hd-presu[data-id="martin|lucia|diego"] ·
     .hd-burbuja[data-id="hola|pide-foto|foto|perfecto"] · .hd-chip-sistema · .hd-mapa-atras ·
     .hd-grupo[data-id] > .hd-chat-cabecera + .hd-grupo-lista > .hd-burbuja[data-i].
   Geometría medida (px de la pantalla de 414×896):
     chats → panel gris x 14 y 118 (386×762) · cabecera 64 · ventana .hd-chat-cuerpo y 182 (386×622) · entrada y 804 (76).
       presupuestos: .hd-chat-lista mide 1292; dentro de la lista: aviso y 14 · martin y 56 · lucia y 467 · diego y 879
       (cada tarjeta 340×397, x 12). Para ver a Lucía entera: lista y −453; hasta el final: y −670.
       chat-especialista: lista 562 (entra sin desplazar): aviso 14 · hola 56 · pide-foto 110 · foto 205 (288 de alto) · perfecto 502.
     seguimiento → azul del encabezado 0–122 · mapa y 94 (414×560) · volver (16, 136) · panel y 602 (414×294) ·
       punta del pin de la casa en (302, 346) · el especialista sale de (28, 504) + rutaDelta(t). */
import '../css/base.css';
import '../css/ui.css';
import '../css/chat.css';
import { COLORS } from '../tokens.ts';
import { icon } from '../icons.ts';
import { appHeader } from '../ui/AppHeader.ts';
import type { AvatarProps } from '../ui/Avatar.ts';
import { chatHeader } from '../ui/ChatHeader.ts';
import { chatBubble, type ChatBubbleProps } from '../ui/ChatBubble.ts';
import { chatInput } from '../ui/ChatInput.ts';
import { chatPresupuesto, type ChatPresupuestoProps, type EspecialistaPresupuesto } from '../ui/ChatPresupuesto.ts';
import { systemChip } from '../ui/SystemChip.ts';
import { photoCard } from '../ui/PhotoCard.ts';
import { mapView, type EstadoSeguimiento } from '../ui/MapView.ts';
import { trackingPanel } from '../ui/TrackingPanel.ts';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

// ── datos ─────────────────────────────────────────────────────────────────

/** El trabajo del pedido del jueves 15 de octubre de 2026 a las 16:00. */
export const TRABAJO = 'Reparar pérdida en el caño de la bacha';

/** Especialistas ficticios (colores de avatar propios, fuera de los azules de la interfaz). */
export const ESPECIALISTAS = {
  martin: { nombre: 'Martín R.', iniciales: 'MR', color: '#EE7A30', rubro: 'Plomería', calificacion: 4.9 },
  lucia: { nombre: 'Lucía G.', iniciales: 'LG', color: '#C2418A', rubro: 'Plomería', calificacion: 4.8 },
  diego: { nombre: 'Diego P.', iniciales: 'DP', color: '#14967F', rubro: 'Plomería', calificacion: 4.7 },
} as const satisfies Record<string, EspecialistaPresupuesto>;

export type IdPresupuesto = keyof typeof ESPECIALISTAS;

export interface PresupuestoDato {
  id: IdPresupuesto;
  especialista: EspecialistaPresupuesto;
  manoDeObra: number;
  materiales: number;
  /** tal como la declara el especialista */
  llegada: string;
  /** hora del mensaje */
  hora: string;
  /** el que acepta el usuario (Martín R.) */
  elegido: boolean;
}

/** Los tres presupuestos del guion (escena 6), en el orden en que llegan. */
export const PRESUPUESTOS: readonly PresupuestoDato[] = [
  { id: 'martin', especialista: ESPECIALISTAS.martin, manoDeObra: 32000, materiales: 13000, llegada: 'Llega entre 16:06 y 16:30', hora: '10:04', elegido: true },
  { id: 'lucia', especialista: ESPECIALISTAS.lucia, manoDeObra: 36000, materiales: 12500, llegada: 'Llega entre 15:40 y 16:10', hora: '10:06', elegido: false },
  { id: 'diego', especialista: ESPECIALISTAS.diego, manoDeObra: 29000, materiales: 22000, llegada: 'Llega entre 17:00 y 17:30', hora: '10:09', elegido: false },
];

/** Props de chatPresupuesto() para un presupuesto del guion (+ lo que se quiera pisar: escala, elegido, acciones…). */
export function presupuestoProps(d: PresupuestoDato, extra: Partial<ChatPresupuestoProps> = {}): ChatPresupuestoProps {
  return {
    especialista: d.especialista, trabajo: TRABAJO, manoDeObra: d.manoDeObra, materiales: d.materiales,
    llegada: d.llegada, validez: '48 h', hora: d.hora, id: d.id, ...extra,
  };
}

// ── pantallas ─────────────────────────────────────────────────────────────

/** Pantalla de chat de Handy: encabezado con logo, panel gris con la cabecera, la lista y la barra para escribir. */
function pantallaChat(idPantalla: string, cabecera: string, lista: string): string {
  return `<div class="hd-capa hd-app hd-pantalla-chat" data-pantalla="${idPantalla}">`
    + appHeader({ campana: true, ubicacion: false })
    + '<div class="hd-chat-panel">'
    + cabecera
    + `<div class="hd-chat-cuerpo"><div class="hd-chat-lista">${lista}</div></div>`
    + chatInput()
    + '</div></div>';
}

/** Escena 6: "Presupuestos · Plomería". La lista mide más que la ventana (≈ 1300 px contra 622): la escena la desplaza
    con y sobre .hd-chat-lista. `elegido: true` dibuja el sello "Elegido" en el de Martín R. */
export function pantallaPresupuestos({ elegido = false }: { elegido?: boolean } = {}): string {
  const lista = systemChip({ icono: 'escudo', texto: 'Tu pedido llegó a especialistas verificados.' })
    + PRESUPUESTOS.map(d => chatPresupuesto(presupuestoProps(d, { elegido: elegido && d.elegido }))).join('');
  const cabecera = chatHeader({
    nombre: 'Presupuestos · Plomería', subtitulo: 'Jue 15 oct · 16:00', avatar: { icono: 'plomeria', color: COLORS.azul },
  });
  return pantallaChat('presupuestos', cabecera, lista);
}

/** Escena 8: mapa + panel de seguimiento en uno de sus tres estados (las capas de los otros estados ya están, en 0). */
export function pantallaSeguimiento(estado: EstadoSeguimiento = 'en-camino'): string {
  const m = ESPECIALISTAS.martin;
  return `<div class="hd-capa hd-app hd-pantalla-seguimiento" data-pantalla="seguimiento" data-estado="${estado}">`
    + appHeader({ variante: 'azul', campana: true, ubicacion: false, className: 'hd-seg-header' })
    + mapView({ alto: 560, estado, especialista: { iniciales: m.iniciales, color: m.color } })
    + `<span class="hd-mapa-atras">${icon('atras', { size: 24, stroke: 2.3 })}</span>`
    + trackingPanel({ especialista: 'Martín', nombre: m.nombre, estado, avatar: { iniciales: m.iniciales, color: m.color } })
    + '</div>';
}

/** Escena 8: chat con Martín R. dentro de la app (sin teléfonos de por medio). */
export function pantallaChatEspecialista(): string {
  const m = ESPECIALISTAS.martin;
  const lista = systemChip({ icono: 'candado', texto: 'Tu teléfono no se comparte' })
    + chatBubble({ lado: 'entrante', texto: '¡Hola! Estoy a unas cuadras.', hora: '16:04', id: 'hola' })
    + chatBubble({ lado: 'entrante', texto: '¿Me mandás una foto de la pérdida? Así llevo el repuesto justo.', hora: '16:04', id: 'pide-foto' })
    + chatBubble({ lado: 'saliente', foto: photoCard({ ancho: 200, alto: 240 }), texto: 'Es abajo de la bacha.', hora: '16:05', tildes: 'leido', id: 'foto' })
    + chatBubble({ lado: 'entrante', texto: 'Perfecto, ya sé qué llevar.', hora: '16:05', id: 'perfecto' });
  const cabecera = chatHeader({
    nombre: m.nombre, verificado: true, subtitulo: 'Plomería · en camino', avatar: { iniciales: m.iniciales, color: m.color },
  });
  return pantallaChat('chat-especialista', cabecera, lista);
}

// ── escena 2: grupos de mensajería genéricos ───────────────────────────────

export type MensajeGrupo = Omit<ChatBubbleProps, 'tema'>;

export interface GrupoMensajeriaProps {
  /** "Vecinos del edificio" */
  nombre: string;
  /** "Vos, Ana, Carlos y más" */
  miembros: string;
  mensajes: MensajeGrupo[];
  /** avatar del grupo (default: ícono de personas sobre gris verdoso) */
  avatar?: Pick<AvatarProps, 'iniciales' | 'icono' | 'color'>;
  /** ancho de la tarjeta en px del escenario (default 380) */
  ancho?: number;
  id?: string;
  className?: string;
}

/** Tarjeta de chat de grupo genérico (escena 2): cabecera con avatar, nombre e integrantes, y burbujas de mensajería.
    La colita va en la primera burbuja de cada racha (mismo lado y mismo autor). Burbujas: .hd-burbuja[data-i]. */
export function grupoMensajeria({ nombre, miembros, mensajes, avatar, ancho = 380, id, className = '' }: GrupoMensajeriaProps): string {
  const cls = ['hd-grupo', className].filter(Boolean).join(' ');
  const burbujas = mensajes.map((m, i) => {
    const prev = mensajes[i - 1];
    const cola = m.cola ?? !(prev && prev.lado === m.lado && prev.autor === m.autor);
    return chatBubble({ ...m, tema: 'mensajeria', cola, indice: i });
  }).join('');
  return `<div class="${cls}"${id ? ` data-id="${esc(id)}"` : ''} style="width:${ancho}px">`
    + chatHeader({ nombre, subtitulo: miembros, tema: 'mensajeria', atras: false, avatar: avatar ?? { icono: 'usuarios', color: '#8FA3AD' } })
    + `<div class="hd-grupo-lista">${burbujas}</div></div>`;
}

const PREGUNTA = '¿Alguien tiene un plomero?';

/** Los tres grupos de la escena 2 (mismo mensaje en todos, respuestas que no resuelven, "Visto"). Sin cifras. */
export const GRUPOS_PROBLEMA: readonly GrupoMensajeriaProps[] = [
  {
    id: 'vecinos', nombre: 'Vecinos del edificio', miembros: 'Vos, Ana, Carlos y más', avatar: { icono: 'casa', color: '#7E9AA8' },
    mensajes: [{ lado: 'saliente', texto: PREGUNTA, hora: '10:02', tildes: 'entregado', visto: true }],
  },
  {
    id: 'familia', nombre: 'Familia', miembros: 'Vos, Mamá, Papá, Sofi', avatar: { icono: 'corazon', color: '#C98A9B' },
    mensajes: [
      { lado: 'saliente', texto: PREGUNTA, hora: '12:47', tildes: 'entregado' },
      { lado: 'entrante', autor: 'Mamá', texto: 'Tu tío tenía uno, preguntale.', hora: '13:05' },
    ],
  },
  {
    id: 'futbol', nombre: 'Fútbol de los jueves', miembros: 'Vos, Nico, Carlos y más', avatar: { icono: 'usuarios', color: '#8FA3AD' },
    mensajes: [
      { lado: 'saliente', texto: PREGUNTA, hora: '16:30', tildes: 'entregado' },
      { lado: 'entrante', autor: 'Nico', texto: 'Ni idea, che.', hora: '19:15' },
    ],
  },
];
