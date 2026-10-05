/* Pantallas del usuario, diseño 2026 (src/handy/app/DISENO.md): las propuestas, el perfil del especialista y la
   confirmación del turno (05-u-presupuestos, 06-u-perfil, 09-u-confirmar y el aviso de arriba de 10-u-seguimiento).
   Cada pantalla devuelve UNA capa <div class="hd-capa ap-pantalla" data-pantalla="…"> de 414×896 para el `pantalla` de
   phoneFrame (src/handy/ui/PhoneFrame.ts). Todo se dibuja en su estado final; los estados que cambian (elegida,
   apretado, cuántas llegaron, forma de pago) son capas apiladas que se cruzan con opacity: la escena pone el estado
   inicial con gsap.set y anima solo transform y opacity (las ayudas de abajo ya lo hacen así).
   Posiciones medidas: px de la pantalla de 414×896 (foto × 0,3638), x · y · ancho × alto. Estilos en css/ub.css (ap-ub-).
   Datos: ESPECIALISTAS (E1 · E2 · E3 con sus montos, la tarifa del 5 % y el horario), TRABAJO / TRABAJO_RENGLONES,
   PROPUESTAS y CONFIRMAR (geometría para las escenas).

   ── Piezas sueltas ─────────────────────────────────────────────────────────────────────────────────────────────────
   tarjetaPropuesta({ especialista = 1, elegida = false, apretado, className, estilo, id }) → la tarjeta de una propuesta
     (366,8 × 505,5, radio 26) que anda también FUERA del teléfono (trae .ap-ui y las fuentes: se puede escalar y volar;
     para sacarla del teléfono, montar otra igual afuera encima de la de adentro — en la pantalla está en (23,6 · 275),
     + 12 del bisel del marco — y apagar la de adentro). position: relative (en la lista va absoluta).
     Partes (relativas a la tarjeta):
       .ap-ub-tarjeta[data-especialista="1|2|3"] (la cara blanca: mover / escalar la tarjeta entera)
       .ap-ub-tarjeta-canto (canto #19468C de 5,1 abajo) · .ap-ub-tarjeta-elegida (el anillo amarillo de 3,6 de la foto,
         radio 29,6, con su canto ancho; opacity 0/1 → elegirPropuesta)
       .ap-ub-tarjeta-avatar (16,9 · 16,9, Ø 51,4 con tilde: .ap-avatar-tilde) · .ap-ub-tarjeta-nombre (x 82, mayúscula
         22,6) · .ap-ub-tarjeta-verificado (81,5 · 46 · 90 × 18,2, la roseta) · .ap-ub-tarjeta-rubros (x 180,5) ·
         .ap-ub-tarjeta-linea (y 81,2)
       .ap-ub-tarjeta-presupuesto (llave + "Presupuesto" en Archivo azul, 17,3 · 98) · .ap-ub-tarjeta-trabajo (rótulo
         "Trabajo" en y 130 y el trabajo en dos renglones hasta y 180,5)
       .ap-ub-tarjeta-desglose (desglose() de ui/desglose.ts, 17,1 · 193 → 340, 332,2 de ancho): filas [data-fila=
         "mano-de-obra|materiales|subtotal|tarifa"] y el total (.ap-desglose-total-monto "$ 47.250": 234,3 · 306,3 ·
         114,9 × 23,6; en la pantalla 257,9 · 581,3)
       .ap-ub-tarjeta-horario (17,1 · 343,1 · 332,6 × 95,7, celeste): .ap-ub-horario-icono / -clave / -valor [data-fila="1|2"]
         ("Horario que propone · Hoy · 16 a 18 h", "Vence · en 24 h")
       .ap-ub-tarjeta-botones (y 454,4 → 505,5): .ap-ub-tarjeta-boton[data-accion="perfil"] (0 → 183,4, gris) y
         [data-accion="elegir"] (183,4 → 366,8, azul), cada uno con .ap-ub-tarjeta-boton-apretado (capa más oscura,
         opacity) y .ap-ub-tarjeta-boton-texto (escala). Centro del dedo: Ver perfil (91,7 · 479,9) · Elegir (275,1 · 479,9).
     especialista: 1 · 2 · 3 con los datos de la historia. elegida: anillo prendido. apretado: 'perfil' | 'elegir'
     dibuja ese botón ya apretado (para una pantalla quieta).

   ── Pantallas ──────────────────────────────────────────────────────────────────────────────────────────────────────
   pantallaPropuestas({ cuantas = 3, elegida = 1, apretado, desplazar = 0 })   05-u-presupuestos · [data-pantalla="u-propuestas"]
     Encabezado blanco (campana + pin), volver + "Propuestas" / "Plomería · Urgencia · Hoy", el panel azul "Te llegaron 3 ·
     Ordenadas por llegada" y la lista de tarjetas (E1, E2, E3 en el orden de llegada).
       .ap-encabezado (0 · 0 · 414 × 124) · .ap-ub-volver (23,6 · 132,8 · 48,4 × 47,3 + canto 3,8; centro de la cara
       47,8 · 156,4) · .ap-ub-titulo "Propuestas" (x 88, mayúscula 138,2 → 153,2) · .ap-ub-bajada (canilla en x 88,4 +
       texto desde 106,2, mayúscula 163)
       .ap-ub-panel (0 · 200,3 · 414 × 740, radio 36; sube entero con y) · .ap-ub-panel-asa (181,2 · 213,4 · 51,6 × 5,2)
       .ap-ub-panel-titulo[data-cuantas="1|2|3"] (x 23,6, mayúscula 236,8 → 250,6: "Te llegó 1" · "Te llegaron 2" ·
         "Te llegaron 3", capas con opacity) · .ap-ub-panel-orden "Ordenadas por llegada" (237,2 · 235,5 · 153,2 × 19,7)
       .ap-ub-lista (recorta desde y 262) > .ap-ub-lista-pista (moverla con y desplaza la lista) >
         .ap-ub-tarjeta[data-especialista="n"] en (23,6 · 275 + (n − 1) × 519,9): E1 275 → 780,5 · E2 desde 794,9.
         Botones de E1 en la pantalla: Ver perfil (23,6 · 729,4 · 183,4 × 51,1; centro 115,3 · 754,9) · Elegir
         (207 · 729,4; centro 298,7 · 754,9).
     cuantas: 0…3, las tarjetas que ya llegaron (las otras en opacity 0) y el título que se ve (con 0, ninguno).
     elegida: 0 = ninguna (la foto tiene el anillo en E1). desplazar: y inicial de la pista (negativo = la lista subida;
     −470 deja E2 arriba).

   pantallaPerfil({ apretado = false })   06-u-perfil · [data-pantalla="u-perfil"]  (el perfil de Especialista 1)
       .ap-encabezado (sin pin: la campana en 336,9) · .ap-ub-volver · .ap-ub-titulo "Perfil del especialista" (un renglón,
       mayúscula 146,6)
       .ap-ub-perfil-tarjeta (23,6 · 201,3 · 366,6 × 211,6 + canto 5,6, azul con la trama de cuadraditos): .ap-ub-perfil-trama
         · .ap-ub-perfil-avatar (círculo blanco Ø 87,4, centro 206,8 · 270) con .ap-ub-perfil-avatar-iniciales "E1" y
         .ap-ub-perfil-avatar-tilde (Ø 28,7, centro 237 · 300) · .ap-ub-perfil-nombre "Especialista 1" (centrado,
         mayúscula 329) · .ap-ub-perfil-verificado "Verificado por Handy" (117,9 · 364,2 · 177,7 × 27,4)
       .ap-ub-perfil-rubros (y 430): rótulo RUBROS + .ap-ub-perfil-chip[data-tono="azul"] Plomería (24 · 458,4 · 97 × 26,2)
         · [data-tono="gris"] Gas (130 · 458,4)
       .ap-ub-perfil-datos (23,6 · 504,2 · 366,7 × 166,3): .ap-ub-perfil-fila[data-dato="zona|horario"] (y 529,3 · 598,4)
       .ap-ub-perfil-historial (23,6 · 690 · 366,7 × 69,6) · .ap-ub-perfil-propuesta (la tarjeta azul que el pie tapa, y 779)
       .ap-ub-pie (blanco desde 794,9): .ap-ub-perfil-nota "El precio lo pone el especialista." · .ap-boton[data-accion=
         "elegir-propuesta"] (23,6 · 838 · 366,7 × 52,4 + canto 4,6; centro 206,9 · 864,2) → apretarBoton de ui/botones.ts.
     apretado: Elegir esta propuesta dibujado abajo (la cara corrida el canto).

   pantallaConfirmar({ pago = 'final', apretado = false })   09-u-confirmar · [data-pantalla="u-confirmar"]
       .ap-encabezado (sin pin) · .ap-ub-volver · .ap-ub-titulo "Confirmá el turno" · .ap-ub-bajada "Revisá todo antes de
       confirmar" (mayúscula 163)
       .ap-ub-confirmar-tarjeta (23,8 · 200,2 · 366 × 469,8, radio 24): .ap-ub-confirmar-avatar (42,2 · 219,4, Ø 52) ·
         .ap-ub-confirmar-nombre (x 108,4, mayúscula 227) · .ap-ub-confirmar-rubro (canilla + "Plomería · Urgencia") ·
         .ap-ub-confirmar-trabajo (42,5 · 288 → 323) · .ap-ub-confirmar-dato[data-dato="cuando"] (41,9 · 340,4 ·
         159,6 × 122,5) y [data-dato="donde"] (212,2 · 340,4) · .ap-ub-confirmar-muesca[data-lado="izq|der"] +
         .ap-ub-confirmar-punteado (y 482,4) · .ap-ub-confirmar-desglose (42,5 · 499,3 · 329,2 × 156,5; el total
         .ap-desglose-total-monto "$ 47.250" en 268 · 621,6 · 103,6 × 22)
       .ap-ub-confirmar-info (23,8 · 690 · 366 × 53) · .ap-ub-confirmar-rotulo "¿CÓMO QUERÉS PAGAR?" (mayúscula 761,4)
       .ap-ub-pago[data-pago="ahora|final"] (23,9 y 212,6 · 787 · 177,2 × 104; el pie tapa casi todo) con .ap-ub-pago-base
         (gris) y .ap-ub-pago-sel (la azul elegida, opacity)
       .ap-ub-pie (blanco desde 821,1, sombra hacia arriba): .ap-boton[data-accion="cancelar"] (24,2 · 838 · 131 × 52,4 +
         canto 4,6; centro 89,7 · 864,2) · .ap-boton[data-accion="confirmar-turno"] (171,1 · 838 · 218,4 × 52,4, verde
         plano; centro 280,3 · 864,2) con .ap-ub-confirmar-apretado (verde oscuro dentro de la cara, opacity).
     pago: la opción elegida ('ahora' | 'final'; la foto: 'final'). apretado: Confirmar turno ya apretado.

   avisoTurnoConfirmado({ top }) → la capa del aviso verde "Turno confirmado · Especialista 1 · Hoy · 16 a 18 h"
     (10-u-seguimiento) con aviso() de ui/aviso.ts [data-pantalla="aviso-turno-confirmado"]: bajarla con bajarAviso (que
     apaga la barra de estado y la isla); para una pantalla quieta, gsap.set(barraDelAviso(capa), { opacity: 0 }).
   avisoPropuesta({ especialista = 3, top }) → el aviso azul "Te llegó una propuesta · Especialista n · $ … final para vos"
     de 05 (con el total de la historia: E3 $ 53.550; la foto dice $ 45.675).
   botonVolver({ estilo }) · cabeceraPagina({ titulo, bajada, icono, una }) → el botón gris de volver y la cabecera
     volver + título + bajada que comparten las tres pantallas (por si otra pantalla del usuario la usa).

   ── Ayudas para el timeline (devuelven la duración) ─────────────────────────────────────────────────────────────────
   elegirPropuesta(tl, tarjeta, at, { elegir = true, dur = .3 }) — prende (o apaga) el anillo amarillo con un pulso.
   apretarEnTarjeta(tl, tarjeta, 'elegir' | 'perfil', at, { dur = .24 }) — oscurece el botón y achica el texto, y vuelve.
   llegaPropuesta(tl, pantalla, n, at, { dur = .45 }) — entra la tarjeta n (desde abajo) y el título pasa a "n".
   desplazarPropuestas(tl, pantalla, at, { y, dur = .7 }) — mueve la pista de la lista hasta y (px; negativo = sube).
   apretarConfirmar(tl, pantalla, at, { dur = .26 }) — aprieta Confirmar turno (capa oscura + escala .97 y vuelve).
   elegirPago(tl, pantalla, 'ahora' | 'final', at, { dur = .2 }) — cruza las dos opciones de pago. */
import { encabezado } from './ui/encabezado.ts';
import { avatar, type TonoAvatar } from './ui/avatar.ts';
import { boton } from './ui/botones.ts';
import { aviso } from './ui/aviso.ts';
import { desglose } from './ui/desglose.ts';
import { tituloResaltado, rotulo } from './ui/textos.ts';
import { cls, esc, idAttr, pesos } from './ui/comun.ts';
import { icono, type Icono } from './iconos.ts';
// al final: así ub.css va después del CSS de los componentes y sus ajustes ganan a igual especificidad
import './css/ub.css';

// ── datos de la historia ────────────────────────────────────────────────────────────────────────────────────────

export type NumEspecialista = 1 | 2 | 3;

export interface DatosEspecialista {
  iniciales: string;
  nombre: string;
  tono: TonoAvatar;
  rubros: string;
  mano: number;
  materiales: number;
  subtotal: number;
  tarifa: number;
  total: number;
  /** horario que propone (E1 es el de la historia; E2 y E3 toman las otras franjas de "Tu precio") */
  horario: string;
}

const propuesta = (iniciales: string, tono: TonoAvatar, rubros: string, mano: number, materiales: number, horario: string): DatosEspecialista => {
  const subtotal = mano + materiales;
  const tarifa = Math.round(subtotal * 0.05);
  return { iniciales, nombre: `Especialista ${iniciales.slice(1)}`, tono, rubros, mano, materiales, subtotal, tarifa, total: subtotal + tarifa, horario };
};

/** Las tres propuestas, en el orden en que llegan (DISENO.md · La historia). */
export const ESPECIALISTAS: Record<NumEspecialista, DatosEspecialista> = {
  1: propuesta('E1', 'azul', 'Plomería · Gas', 32000, 13000, 'Hoy · 16 a 18 h'),
  2: propuesta('E2', 'tinta', 'Plomería · Electricidad', 36000, 12500, 'Hoy · 18 a 20 h'),
  3: propuesta('E3', 'medio', 'Plomería · Albañilería', 29000, 22000, 'Hoy · 20 a 22 h'),
};

/** El trabajo, cortado en los dos renglones de las fotos (05 y 09). */
export const TRABAJO_RENGLONES = ['Cambiar el caño de abajo de la pileta de', 'la cocina'] as const;
export const TRABAJO = TRABAJO_RENGLONES.join(' ');
const trabajoHtml = TRABAJO_RENGLONES.map(esc).join('<br>');

/** Geometría para las escenas (px de la pantalla 414×896). */
export const PROPUESTAS = {
  tarjeta: { x: 23.6, y: 275, w: 366.8, h: 505.5, paso: 519.9, radio: 26 },
  botones: { y: 454.4, h: 51.1, perfil: { cx: 91.7 }, elegir: { cx: 275.1 } },
  lista: { y: 262 },
  panel: { y: 200.3 },
  volver: { x: 23.6, y: 132.8, w: 48.4, h: 47.3 },
} as const;

export const CONFIRMAR = {
  tarjeta: { x: 23.8, y: 200.2, w: 366, h: 469.8 },
  cancelar: { x: 24.2, y: 838, w: 131, h: 52.4 },
  confirmar: { x: 171.1, y: 838, w: 218.4, h: 52.4 },
  total: { x: 268, y: 621.6, w: 103.6, h: 22 },
} as const;

// ── íconos que todavía no están en iconos.ts (mismo formato: grilla de 24, trazo redondeado) ─────────────────────

const PROPIOS = {
  // badge-check de Lucide: la roseta con tilde de "Verificado" (las fotos no usan el círculo)
  insignia: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  // credit-card de Lucide (la opción de pago "Ahora")
  tarjeta: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  // flecha de volver: más larga y con la punta más corta que flecha-izq (16 × 13,5 en la foto)
  volver: '<path d="M19.2 12H4.7"/><path d="M10.6 6.1 4.7 12l5.9 5.9"/>',
} as const;

function iconoPropio(nombre: keyof typeof PROPIOS, { tam = 24, trazo = 2, clase = '' }: { tam?: number; trazo?: number; clase?: string } = {}): string {
  return `<svg class="ap-icono${clase ? ' ' + clase : ''}" data-icono="${nombre}" viewBox="0 0 24 24" width="${tam}" height="${tam}"`
    + ` fill="none" stroke="currentColor" stroke-width="${trazo}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PROPIOS[nombre]}</svg>`;
}

// ── piezas compartidas por las tres pantallas ───────────────────────────────────────────────────────────────────

/** Botón cuadrado gris de volver (flecha) con su canto: 48,4 × 47,3 + 3,8. Ganchos: .ap-ub-volver · .ap-ub-volver-cara. */
export function botonVolver({ estilo = '' }: { estilo?: string } = {}): string {
  return `<span class="ap-ub-volver"${estilo ? ` style="${estilo}"` : ''}><span class="ap-ub-volver-canto"></span>`
    + `<span class="ap-ub-volver-cara">${iconoPropio('volver', { tam: 22.7, trazo: 2.4 })}</span></span>`;
}

/** Volver + título en Archivo + bajada opcional (con ícono): la cabecera de 05, 06 y 09. */
export function cabeceraPagina({ titulo, bajada, icono: ic, una = false }: { titulo: string; bajada?: string; icono?: Icono; una?: boolean }): string {
  return botonVolver()
    + tituloResaltado({ texto: titulo, tam: 20.6, etiqueta: 'h1', className: cls('ap-ub-titulo', una && 'ap-ub-titulo-solo') })
    + (bajada ? `<span class="ap-ub-bajada">${ic ? icono(ic, { tam: 14.5, trazo: 2.1 }) : ''}<span>${esc(bajada)}</span></span>` : '');
}

/** Encabezado blanco; sin el pin, la campana se corre a su lugar (06 y 09). */
function encabezadoUsuario(pin: boolean): string {
  return encabezado({ variante: 'blanco', campana: 2, ubicacion: pin, className: pin ? '' : 'ap-ub-encabezado-solo' });
}

/** Pie blanco pegado abajo (06, 09) con sombra hacia arriba. */
const pie = (top: number, html: string) => `<div class="ap-ub-pie" style="top:${top}px">${html}</div>`;

// ── tarjeta de propuesta (05-u-presupuestos) ────────────────────────────────────────────────────────────────────

export interface TarjetaPropuestaProps {
  especialista?: NumEspecialista;
  /** anillo amarillo prendido (la tarjeta elegida / destacada de la foto) */
  elegida?: boolean;
  /** botón dibujado ya apretado */
  apretado?: 'perfil' | 'elegir';
  className?: string;
  /** estilos en línea (posición) */
  estilo?: string;
  id?: string;
}

export function tarjetaPropuesta({ especialista = 1, elegida = false, apretado, className = '', estilo = '', id }: TarjetaPropuestaProps = {}): string {
  const e = ESPECIALISTAS[especialista];
  const ve = (on: boolean) => `opacity:${on ? 1 : 0}`;
  const botonTarjeta = (accion: 'perfil' | 'elegir', texto: string) =>
    `<span class="ap-ub-tarjeta-boton" data-accion="${accion}">`
    + `<span class="ap-ub-tarjeta-boton-apretado" style="${ve(apretado === accion)}"></span>`
    + `<span class="ap-ub-tarjeta-boton-texto"${apretado === accion ? ' style="transform:scale(0.95)"' : ''}>${esc(texto)}`
    + (accion === 'elegir' ? icono('tilde', { tam: 15, trazo: 2.4 }) : '') + '</span></span>';
  return `<div class="${cls('ap-ub-tarjeta', 'ap-ui', className)}" data-especialista="${especialista}"${elegida ? ' data-elegida' : ''}${idAttr(id)}${estilo ? ` style="${estilo}"` : ''}>`
    + '<span class="ap-ub-tarjeta-canto"></span>'
    + `<span class="ap-ub-tarjeta-elegida" style="${ve(elegida)}"></span>`
    + '<div class="ap-ub-tarjeta-cara">'
    + `<span class="ap-ub-tarjeta-avatar">${avatar({ iniciales: e.iniciales, tono: e.tono, tam: 51.4, tilde: true })}</span>`
    + `<span class="ap-ub-tarjeta-nombre">${esc(e.nombre)}</span>`
    + `<span class="ap-ub-tarjeta-verificado ap-verificado">${iconoPropio('insignia', { tam: 11.2, trazo: 2.3 })}<span>Verificado</span></span>`
    + `<span class="ap-ub-tarjeta-rubros">${esc(e.rubros)}</span>`
    + '<span class="ap-ub-tarjeta-linea"></span>'
    + `<span class="ap-ub-tarjeta-presupuesto">${icono('llave', { tam: 20.2, trazo: 2.3 })}<span class="ap-display">Presupuesto</span></span>`
    + '<div class="ap-ub-tarjeta-trabajo"><span class="ap-ub-tarjeta-rotulo">Trabajo</span>'
    + `<p class="ap-ub-tarjeta-trabajo-texto">${trabajoHtml}</p></div>`
    + '<div class="ap-ub-tarjeta-desglose">' + desglose({
      paso: 21.1,
      filas: [
        { texto: 'Mano de obra', monto: e.mano },
        { texto: 'Materiales', monto: e.materiales },
        { texto: 'Subtotal', monto: e.subtotal, fuerte: true, antes: 'punteado' },
        { texto: 'Tarifa de Handy · cliente (5%)', monto: e.tarifa, dato: 'tarifa' },
      ],
      total: { texto: 'Total final para vos', monto: e.total, antes: 'linea' },
    }) + '</div>'
    + '<div class="ap-ub-tarjeta-horario">'
    + `<span class="ap-ub-horario-icono" data-fila="1">${icono('reloj', { tam: 19.6, trazo: 2 })}</span>`
    + `<span class="ap-ub-horario-clave" data-fila="1">Horario que propone</span><span class="ap-ub-horario-valor" data-fila="1">${esc(e.horario)}</span>`
    + `<span class="ap-ub-horario-icono" data-fila="2">${icono('reloj', { tam: 19.6, trazo: 2 })}</span>`
    + '<span class="ap-ub-horario-clave" data-fila="2">Vence</span><span class="ap-ub-horario-valor" data-fila="2">en 24 h</span>'
    + '</div>'
    + `<div class="ap-ub-tarjeta-botones">${botonTarjeta('perfil', 'Ver perfil')}${botonTarjeta('elegir', 'Elegir')}</div>`
    + '</div></div>';
}

// ── 05-u-presupuestos ───────────────────────────────────────────────────────────────────────────────────────────

export interface PropuestasProps {
  /** cuántas propuestas llegaron (las demás quedan en opacity 0; default 3) */
  cuantas?: 0 | 1 | 2 | 3;
  /** tarjeta con el anillo amarillo (0 = ninguna; default 1, como en la foto) */
  elegida?: 0 | NumEspecialista;
  /** botón de la tarjeta elegida dibujado apretado */
  apretado?: 'perfil' | 'elegir';
  /** y inicial de la pista de la lista (negativo = subida) */
  desplazar?: number;
}

const TITULOS_CUANTAS = ['Te llegó 1', 'Te llegaron 2', 'Te llegaron 3'];

export function pantallaPropuestas({ cuantas = 3, elegida = 1, apretado, desplazar = 0 }: PropuestasProps = {}): string {
  const g = PROPUESTAS.tarjeta;
  const tarjetas = ([1, 2, 3] as const).map(n => tarjetaPropuesta({
    especialista: n, elegida: n === elegida, apretado: n === elegida ? apretado : undefined,
    estilo: `left:${g.x}px;top:${(g.y - PROPUESTAS.lista.y + (n - 1) * g.paso).toFixed(1)}px;opacity:${n <= cuantas ? 1 : 0}`,
  })).join('');
  const titulos = TITULOS_CUANTAS.map((t, i) =>
    `<h2 class="ap-ub-panel-titulo ap-display" data-cuantas="${i + 1}" style="opacity:${i + 1 === cuantas ? 1 : 0}">${esc(t)}</h2>`).join('');
  return '<div class="hd-capa ap-pantalla ap-ui ap-ub" data-pantalla="u-propuestas">'
    + encabezadoUsuario(true)
    + cabeceraPagina({ titulo: 'Propuestas', bajada: 'Plomería · Urgencia · Hoy', icono: 'canilla' })
    + '<div class="ap-ub-panel">'
    + '<span class="ap-ub-panel-asa"></span>'
    + titulos
    + '<span class="ap-ub-panel-orden">Ordenadas por llegada</span>'
    + `<div class="ap-ub-lista"><div class="ap-ub-lista-pista"${desplazar ? ` style="transform:translateY(${desplazar}px)"` : ''}>${tarjetas}</div></div>`
    + '</div></div>';
}

// ── 06-u-perfil ─────────────────────────────────────────────────────────────────────────────────────────────────

export function pantallaPerfil({ apretado = false }: { apretado?: boolean } = {}): string {
  const fila = (ic: Icono, clave: string, valor: string, dato: string) =>
    `<div class="ap-ub-perfil-fila" data-dato="${dato}"><span class="ap-ub-perfil-fila-icono">${icono(ic, { tam: ic === 'pin' ? 22 : 21.7, trazo: ic === 'pin' ? 2 : 2.1 })}</span>`
    + `<span class="ap-ub-perfil-fila-clave">${esc(clave)}</span><span class="ap-ub-perfil-fila-valor">${esc(valor)}</span></div>`;
  const elegir = boton({ texto: 'Elegir esta propuesta', variante: 'azul', tam: 'grande', ancho: 366.7, alto: 52.4, canto: 4.6, accion: 'elegir-propuesta', className: 'ap-ub-perfil-elegir' });
  return '<div class="hd-capa ap-pantalla ap-ui ap-ub" data-pantalla="u-perfil">'
    + encabezadoUsuario(false)
    + cabeceraPagina({ titulo: 'Perfil del especialista', una: true })
    + '<div class="ap-ub-perfil-tarjeta"><span class="ap-ub-perfil-canto"></span><span class="ap-ub-perfil-trama"></span>'
    + `<span class="ap-ub-perfil-avatar"><span class="ap-ub-perfil-avatar-iniciales ap-display">E1</span><span class="ap-ub-perfil-avatar-tilde">${icono('tilde', { tam: 15, trazo: 3.4 })}</span></span>`
    + '<span class="ap-ub-perfil-nombre ap-display">Especialista 1</span>'
    + `<span class="ap-ub-perfil-verificado">${iconoPropio('insignia', { tam: 13.3, trazo: 2.2 })}<span>Verificado por Handy</span></span>`
    + '</div>'
    + '<div class="ap-ub-perfil-rubros">' + rotulo('Rubros', { className: 'ap-ub-perfil-rotulo' })
    + `<span class="ap-ub-perfil-chip" data-tono="azul">${icono('canilla', { tam: 15, trazo: 2.3 })}<span>Plomería</span></span>`
    + '<span class="ap-ub-perfil-chip" data-tono="gris"><span>Gas</span></span></div>'
    + '<div class="ap-ub-perfil-datos">'
    + fila('pin', 'Zona donde trabaja', 'La Perla, Centro y Güemes', 'zona')
    + '<span class="ap-ub-perfil-datos-linea"></span>'
    + fila('reloj', 'Horario que declaró', 'Todos los días, de 8 a 20 h', 'horario')
    + '</div>'
    + '<div class="ap-ub-perfil-historial"><span class="ap-ub-perfil-historial-canto"></span><span class="ap-ub-perfil-historial-cara">'
    + `<span class="ap-ub-perfil-historial-icono">${icono('agenda', { tam: 23, trazo: 2 })}</span>`
    + '<span class="ap-ub-perfil-historial-titulo">Ver historial de trabajos</span><span class="ap-ub-perfil-historial-detalle">5 trabajos terminados</span>'
    + `<span class="ap-ub-perfil-historial-flecha">${icono('chevron-der', { tam: 16, trazo: 2.2 })}</span></span></div>`
    + `<div class="ap-ub-perfil-propuesta"><span>Su propuesta</span><b>${esc(pesos(ESPECIALISTAS[1].total))}</b></div>`
    + pie(794.9, `<span class="ap-ub-perfil-nota">${icono('info', { tam: 13.5, trazo: 2 })}<span>El precio lo pone el especialista.</span></span>`
      + (apretado ? elegir.replace(/class="ap-boton-cara" style="/, 'class="ap-boton-cara" style="transform:translateY(4.6px);') : elegir))
    + '</div>';
}

// ── 09-u-confirmar ──────────────────────────────────────────────────────────────────────────────────────────────

export type FormaPago = 'ahora' | 'final';

export function pantallaConfirmar({ pago = 'final', apretado = false }: { pago?: FormaPago; apretado?: boolean } = {}): string {
  const e = ESPECIALISTAS[1];
  const dato = (id: string, ic: Icono, clave: string, valor: string, detalle: string) =>
    `<div class="ap-ub-confirmar-dato" data-dato="${id}"><span class="ap-ub-confirmar-dato-icono">${icono(ic, { tam: 23.5, trazo: 2 })}</span>`
    + `${rotulo(clave, { className: 'ap-ub-confirmar-dato-clave' })}<span class="ap-ub-confirmar-dato-valor">${esc(valor)}</span>`
    + `<span class="ap-ub-confirmar-dato-detalle">${detalle}</span></div>`;
  const opcion = (id: FormaPago, ic: string, titulo: string, detalle: string) => {
    const cuerpo = `<span class="ap-ub-pago-icono">${ic}</span><span class="ap-ub-pago-titulo">${esc(titulo)}</span>`
      + `<span class="ap-ub-pago-detalle">${esc(detalle)}</span>`;
    return `<div class="ap-ub-pago" data-pago="${id}"><span class="ap-ub-pago-base">${cuerpo}</span>`
      + `<span class="ap-ub-pago-sel" style="opacity:${pago === id ? 1 : 0}">${cuerpo}</span></div>`;
  };
  const confirmar = boton({ texto: 'Confirmar turno', icono: 'tilde', variante: 'verde', tam: 'grande', ancho: 218.4, alto: 52.4, accion: 'confirmar-turno', className: 'ap-ub-confirmar-boton' })
    .replace(/(<span class="ap-boton-cara"[^>]*>)/, `$1<span class="ap-ub-confirmar-apretado" style="opacity:${apretado ? 1 : 0}"></span>`);
  return '<div class="hd-capa ap-pantalla ap-ui ap-ub" data-pantalla="u-confirmar">'
    + encabezadoUsuario(false)
    + cabeceraPagina({ titulo: 'Confirmá el turno', bajada: 'Revisá todo antes de confirmar' })
    + '<div class="ap-ub-confirmar-tarjeta ap-tarjeta">'
    + `<span class="ap-ub-confirmar-avatar">${avatar({ iniciales: e.iniciales, tono: e.tono, tam: 52, tilde: true })}</span>`
    + `<span class="ap-ub-confirmar-nombre">${esc(e.nombre)}</span>`
    + `<span class="ap-ub-confirmar-rubro">${icono('canilla', { tam: 13.5, trazo: 2.1 })}<span>Plomería · Urgencia</span></span>`
    + `<p class="ap-ub-confirmar-trabajo">${trabajoHtml}</p>`
    + dato('cuando', 'agenda', 'Cuándo', 'Hoy, martes 17', '16 a 18 h')
    + dato('donde', 'casa', 'Dónde', 'Casa', 'Catamarca 1650, Mar<br>del Plata')
    + '<span class="ap-ub-confirmar-muesca" data-lado="izq"></span><span class="ap-ub-confirmar-muesca" data-lado="der"></span>'
    + '<span class="ap-ub-confirmar-punteado"></span>'
    + '<div class="ap-ub-confirmar-desglose">' + desglose({
      filas: [
        { texto: 'Mano de obra', monto: e.mano },
        { texto: 'Materiales', monto: e.materiales },
        { texto: 'Subtotal', monto: e.subtotal, fuerte: true },
        { texto: 'Tarifa de Handy · cliente (5%)', monto: e.tarifa, dato: 'tarifa' },
      ],
      total: { texto: 'Total final para vos', monto: e.total },
    }) + '</div>'
    + '</div>'
    + `<div class="ap-ub-confirmar-info">${icono('billetera', { tam: 17, trazo: 2 })}<p>La plata del trabajo va directo a la cuenta del especialista. Handy solo cobra su tarifa.</p></div>`
    + rotulo('¿Cómo querés pagar?', { className: 'ap-ub-confirmar-rotulo' })
    + opcion('ahora', iconoPropio('tarjeta', { tam: 22, trazo: 2 }), 'Ahora', 'Débito ••••9010')
    + opcion('final', icono('reloj', { tam: 22, trazo: 2.2 }), 'Al terminar', 'Pagás cuando quede listo')
    + pie(821.1, boton({ texto: 'Cancelar', variante: 'gris', tam: 'grande', ancho: 131, alto: 52.4, canto: 4.6, accion: 'cancelar', className: 'ap-ub-cancelar' })
      + confirmar)
    + '</div>';
}

// ── avisos ──────────────────────────────────────────────────────────────────────────────────────────────────────

/** "Turno confirmado · Especialista 1 · Hoy · 16 a 18 h" (10-u-seguimiento): capa del aviso verde. */
export function avisoTurnoConfirmado({ top }: { top?: number } = {}): string {
  return aviso({ titulo: 'Turno confirmado', detalle: 'Especialista 1 · Hoy · 16 a 18 h', icono: 'tilde', tono: 'verde', top, dato: 'turno-confirmado' });
}

/** "Te llegó una propuesta · Especialista n · $ … final para vos" (05-u-presupuestos): capa del aviso azul. */
export function avisoPropuesta({ especialista = 3, top }: { especialista?: NumEspecialista; top?: number } = {}): string {
  const e = ESPECIALISTAS[especialista];
  return aviso({ titulo: 'Te llegó una propuesta', detalle: `${e.nombre} · ${pesos(e.total)} final para vos`, icono: 'billetera', tono: 'azul', top, dato: `propuesta-${especialista}` });
}

// ── ayudas para el timeline ─────────────────────────────────────────────────────────────────────────────────────

/** Prende (o apaga) el anillo amarillo de la tarjeta, con un pulso chico de la tarjeta. */
export function elegirPropuesta(tl: GSAPTimeline, tarjeta: Element, at: number, { elegir = true, dur = 0.3 }: { elegir?: boolean; dur?: number } = {}): number {
  tl.to(tarjeta.querySelector('.ap-ub-tarjeta-elegida'), { opacity: elegir ? 1 : 0, duration: dur * 0.7, ease: 'power1.out' }, at);
  if (elegir) {
    tl.to(tarjeta, { scale: 1.015, duration: dur * 0.4, ease: 'power2.out' }, at);
    tl.to(tarjeta, { scale: 1, duration: dur * 0.6, ease: 'back.out(2)' }, at + dur * 0.4);
  }
  return dur;
}

/** Aprieta un botón de la tarjeta: la capa oscura sube y el texto se achica; después vuelve. */
export function apretarEnTarjeta(tl: GSAPTimeline, tarjeta: Element, accion: 'elegir' | 'perfil', at: number, { dur = 0.24 }: { dur?: number } = {}): number {
  const b = tarjeta.querySelector(`.ap-ub-tarjeta-boton[data-accion="${accion}"]`);
  if (!b) return 0;
  const capa = b.querySelector('.ap-ub-tarjeta-boton-apretado');
  const texto = b.querySelector('.ap-ub-tarjeta-boton-texto');
  tl.to(capa, { opacity: 1, duration: dur * 0.35, ease: 'power1.out' }, at);
  tl.to(texto, { scale: 0.95, duration: dur * 0.35, ease: 'power2.out' }, at);
  tl.to(capa, { opacity: 0, duration: dur * 0.65, ease: 'power1.in' }, at + dur * 0.35);
  tl.to(texto, { scale: 1, duration: dur * 0.65, ease: 'back.out(2)' }, at + dur * 0.35);
  return dur;
}

/** Llega la propuesta n: el título pasa a "Te llegaron n" y la tarjeta entra desde abajo. */
export function llegaPropuesta(tl: GSAPTimeline, pantalla: Element, n: NumEspecialista, at: number, { dur = 0.45 }: { dur?: number } = {}): number {
  const titulos = pantalla.querySelectorAll('.ap-ub-panel-titulo');
  titulos.forEach(t => {
    const es = t.getAttribute('data-cuantas') === String(n);
    tl.to(t, { opacity: es ? 1 : 0, duration: dur * 0.4, ease: 'power1.inOut' }, at);
  });
  const tarjeta = pantalla.querySelector(`.ap-ub-tarjeta[data-especialista="${n}"]`);
  if (tarjeta) tl.fromTo(tarjeta, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: dur, ease: 'back.out(1.2)' }, at);
  return dur;
}

/** Desplaza la lista de propuestas: la pista va hasta y (px; negativo = sube). */
export function desplazarPropuestas(tl: GSAPTimeline, pantalla: Element, at: number, { y, dur = 0.7 }: { y: number; dur?: number }): number {
  tl.to(pantalla.querySelector('.ap-ub-lista-pista'), { y, duration: dur, ease: 'power3.inOut' }, at);
  return dur;
}

/** Aprieta Confirmar turno (verde plano): capa oscura + el botón un poco más chico, y vuelve. */
export function apretarConfirmar(tl: GSAPTimeline, pantalla: Element, at: number, { dur = 0.26 }: { dur?: number } = {}): number {
  const b = pantalla.querySelector('.ap-boton[data-accion="confirmar-turno"]');
  if (!b) return 0;
  const capa = b.querySelector('.ap-ub-confirmar-apretado');
  tl.to(capa, { opacity: 1, duration: dur * 0.35, ease: 'power1.out' }, at);
  tl.to(b, { scale: 0.97, duration: dur * 0.35, ease: 'power2.out' }, at);
  tl.to(capa, { opacity: 0, duration: dur * 0.65, ease: 'power1.in' }, at + dur * 0.35);
  tl.to(b, { scale: 1, duration: dur * 0.65, ease: 'back.out(2)' }, at + dur * 0.35);
  return dur;
}

/** Cruza las dos opciones de pago (prende la pedida, apaga la otra). */
export function elegirPago(tl: GSAPTimeline, pantalla: Element, pago: FormaPago, at: number, { dur = 0.2 }: { dur?: number } = {}): number {
  pantalla.querySelectorAll('.ap-ub-pago').forEach(p => {
    tl.to(p.querySelector('.ap-ub-pago-sel'), { opacity: p.getAttribute('data-pago') === pago ? 1 : 0, duration: dur, ease: 'power1.out' }, at);
  });
  return dur;
}
