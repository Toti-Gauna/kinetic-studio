/* Pantallas completas de la app de usuario (414×896) armadas con los componentes de ui/, con el contenido corregido del
   storyboard (español rioplatense, pesos, octubre de 2026). Cada función devuelve UNA capa .hd-capa[data-pantalla] para
   el `pantalla` de phoneFrame; se apilan en orden para mostrar transiciones dentro del mismo teléfono:
     phoneFrame({ pantalla: pantallaInicio() + hojaTipoTrabajo() + pantallaFecha() })
   Las capas de pantalla (.hd-app) tienen fondo blanco y tapan a las de abajo; las hojas son transparentes (velo + hoja).
   Todo se dibuja en su estado final; la escena pone los estados iniciales con gsap.set.

   pantallaInicio({ seleccion })   escena 4 · [data-pantalla="inicio"]: encabezado, "¿Qué necesitás hoy?" + los seis rubros,
                                   "Quiero…" + los seis accesos, botón flotante de urgencia y barra inferior (Inicio activa).
       .hd-titulo-seccion[data-bloque="rubros|quiero"] · .hd-fichas[data-grupo="rubros|accesos"] ·
       .hd-ficha[data-id] (ids en RUBROS / ACCESOS; 'plomeria' es la que toca el dedo) · .hd-ficha-sel · .hd-urgencia · .hd-nav
   hojaTipoTrabajo({ seleccion })  escena 5 · [data-pantalla="tipo-de-trabajo"]: hoja sobre el inicio, "Plomería" +
                                   "¿Qué tipo de trabajo es?", filas Urgencia · Programado · Obra.
       .hd-velo · .hd-hoja · .hd-opcion[data-id="urgencia|programado|obra"] · .hd-opcion-sel (apagada; prenderla con opacity)
   pantallaFecha()                 escena 5 · [data-pantalla="fecha"]: "¿Cuándo te queda bien?", rueda de días y horarios en
                                   Jue 15 oct · 16:00, resumen "Jueves 15 de octubre · 16:00" y botón "Pedir presupuestos".
       .hd-rueda (ponerRueda / girarRueda(tl, rueda, 'dia'|'hora', i, at); índices en FECHA) · .hd-resumen ·
       .hd-boton[data-accion="pedir-presupuestos"]
   pantallaConfirmar({ exito })    escena 7 · [data-pantalla="confirmar"]: "Confirmá tu pedido", Martín R. verificado,
                                   Jue 15 oct · Llega entre 16:06 y 16:30, Casa · Mar del Plata, desglose con la tarifa del 5 %
                                   (priceWithFee(45000)) y botón "Confirmar". Con exito (default true) suma la capa .hd-exito
                                   (velo + tarjeta con tilde verde y "¡Pedido confirmado!"); la escena la esconde al construir.
       .hd-bloque[data-bloque="especialista|turno|precio"] · .hd-tarjeta · .hd-desglose-total · .hd-boton[data-accion="confirmar"] ·
       .hd-exito > .hd-velo + .hd-exito-tarjeta > .hd-exito-check + .hd-exito-titulo + .hd-exito-detalle
   hojaResena()                    escena 9 · [data-pantalla="resena"]: hoja "¿Cómo fue tu experiencia con Martín?", avatar,
                                   Martín R. · Plomería, cinco estrellas y "Enviar".
       .hd-velo · .hd-hoja · .hd-avatar · .hd-estrellas (prepararEstrellas / llenarEstrellas) ·
       .hd-boton[data-accion="enviar-resena"] */
import '../css/base.css';
import '../css/ui.css';
import { appHeader } from '../ui/AppHeader.ts';
import { bottomNav } from '../ui/BottomNav.ts';
import { tile } from '../ui/Tile.ts';
import { button } from '../ui/Button.ts';
import { bottomSheet, opcionTrabajo } from '../ui/BottomSheet.ts';
import { dateWheel } from '../ui/DateWheel.ts';
import { starRating } from '../ui/StarRating.ts';
import { priceBreakdown } from '../ui/PriceBreakdown.ts';
import { avatar } from '../ui/Avatar.ts';
import { verifiedBadge } from '../ui/VerifiedBadge.ts';
import { icon, type IconName } from '../icons.ts';
import { priceWithFee } from '../tokens.ts';

interface Ficha { id: string; icono: IconName; texto: string }

/** Los seis rubros, en orden de la grilla (3 por fila). */
export const RUBROS: readonly Ficha[] = [
  { id: 'electricidad', icono: 'electricidad', texto: 'Electricidad' },
  { id: 'plomeria', icono: 'plomeria', texto: 'Plomería' },
  { id: 'gas', icono: 'gas', texto: 'Gas' },
  { id: 'cerrajeria', icono: 'cerrajeria', texto: 'Cerrajería' },
  { id: 'albanileria', icono: 'albanileria', texto: 'Albañilería' },
  { id: 'aire', icono: 'aire', texto: 'Aire acondicionado' },
];

/** Los seis accesos "Quiero…". */
export const ACCESOS: readonly Ficha[] = [
  { id: 'destapar', icono: 'destapar', texto: 'Destapar cañería' },
  { id: 'cerradura', icono: 'cerradura', texto: 'Cambiar cerradura' },
  { id: 'instalar-aire', icono: 'instalar-aire', texto: 'Instalar aire' },
  { id: 'enchufe', icono: 'enchufe', texto: 'Arreglar enchufe' },
  { id: 'perdida-gas', icono: 'perdida-gas', texto: 'Revisar pérdida de gas' },
  { id: 'humedad', icono: 'humedad', texto: 'Reparar humedad' },
];

/** Las tres filas de la hoja "¿Qué tipo de trabajo es?". */
export const TIPOS_DE_TRABAJO = [
  { id: 'urgencia', icono: 'urgencia', titulo: 'Urgencia', detalle: 'Lo antes posible' },
  { id: 'programado', icono: 'programado', titulo: 'Programado', detalle: 'Elegís día y horario' },
  { id: 'obra', icono: 'obra', titulo: 'Obra', detalle: 'Un trabajo más grande' },
] as const satisfies readonly { id: string; icono: IconName; titulo: string; detalle: string }[];

export type TipoDeTrabajo = (typeof TIPOS_DE_TRABAJO)[number]['id'];

/** Datos de la rueda de la escena 5: la elección final es Jue 15 oct (dia 2) · 16:00 (hora 2). */
export const FECHA = {
  dias: ['Mar 13 oct', 'Mié 14 oct', 'Jue 15 oct', 'Vie 16 oct', 'Sáb 17 oct'],
  horas: ['14:00', '15:00', '16:00', '17:00', '18:00'],
  dia: 2,
  hora: 2,
  filaAlto: 52,
  resumen: 'Jueves 15 de octubre · 16:00',
} as const;

/** Botón de urgencia flotante: cuadrado azul con el triángulo amarillo de alerta. */
const TRIANGULO_ALERTA = '<svg class="hd-urgencia-icono" viewBox="0 0 48 44" width="44" height="40" aria-hidden="true">'
  + '<path d="M20.5 4.3a4 4 0 0 1 7 0l18.6 32.6a4 4 0 0 1-3.5 6H5.4a4 4 0 0 1-3.5-6z" fill="#FFC21A" stroke="#FFC21A" stroke-width="2" stroke-linejoin="round"/>'
  + '<path d="M24 16v12" stroke="#1F57A8" stroke-width="4.6" stroke-linecap="round"/><circle cx="24" cy="35" r="2.8" fill="#1F57A8"/></svg>';

export function pantallaInicio({ seleccion }: { seleccion?: string } = {}): string {
  const fichas = (lista: readonly Ficha[]) => lista.map(f => tile({ ...f, seleccionada: f.id === seleccion })).join('');
  return '<div class="hd-capa hd-app hd-inicio" data-pantalla="inicio">'
    + appHeader()
    + '<div class="hd-cuerpo">'
    + '<h2 class="hd-titulo-seccion" data-bloque="rubros">¿Qué necesitás hoy?</h2>'
    + `<div class="hd-fichas" data-grupo="rubros">${fichas(RUBROS)}</div>`
    + '<h2 class="hd-titulo-seccion" data-bloque="quiero">Quiero…</h2>'
    + `<div class="hd-fichas" data-grupo="accesos">${fichas(ACCESOS)}</div>`
    + '</div>'
    + `<div class="hd-urgencia">${TRIANGULO_ALERTA}</div>`
    + bottomNav({ activo: 'inicio' })
    + '</div>';
}

export function hojaTipoTrabajo({ seleccion }: { seleccion?: TipoDeTrabajo } = {}): string {
  const opciones = TIPOS_DE_TRABAJO.map(o => opcionTrabajo({ ...o, seleccionada: o.id === seleccion })).join('');
  return '<div class="hd-capa" data-pantalla="tipo-de-trabajo">'
    + bottomSheet({
      titulo: 'Plomería',
      subtitulo: '¿Qué tipo de trabajo es?',
      cerrar: true,
      contenido: `<div class="hd-opciones">${opciones}</div>`,
    })
    + '</div>';
}

export function pantallaFecha(): string {
  return '<div class="hd-capa hd-app hd-fecha" data-pantalla="fecha">'
    + appHeader({ ubicacion: false, atras: true, titulo: 'Plomería · Programado' })
    + '<div class="hd-cuerpo">'
    + '<h2 class="hd-titulo-seccion hd-fecha-titulo">¿Cuándo te queda bien?</h2>'
    + '<div class="hd-fecha-rueda">'
    + dateWheel({
      filaAlto: FECHA.filaAlto,
      columnas: [
        { id: 'dia', items: [...FECHA.dias], indice: FECHA.dia, ancho: 1.45, alinear: 'derecha' },
        { id: 'hora', items: [...FECHA.horas], indice: FECHA.hora, ancho: 1, alinear: 'centro' },
      ],
    })
    + '</div>'
    + '<div class="hd-resumen"><div class="hd-rotulo">Día y horario</div>'
    + `<div class="hd-resumen-pildora">${icon('calendario', { size: 22, stroke: 2.2 })}<span class="hd-resumen-texto">${FECHA.resumen}</span></div>`
    + '</div>'
    + `<p class="hd-nota">${icon('verificado', { size: 20, stroke: 2 })}<span>Especialistas verificados te mandan su presupuesto.</span></p>`
    + '</div>'
    + `<div class="hd-pie">${button({ texto: 'Pedir presupuestos', accion: 'pedir-presupuestos' })}</div>`
    + '</div>';
}

export function pantallaConfirmar({ exito = true }: { exito?: boolean } = {}): string {
  const p = priceWithFee(45000);
  const exitoCapa = '<div class="hd-exito">'
    + '<div class="hd-velo"></div>'
    + '<div class="hd-exito-tarjeta">'
    + `<div class="hd-exito-check">${icon('tilde', { size: 60, stroke: 3.2 })}</div>`
    + '<h3 class="hd-exito-titulo">¡Pedido confirmado!</h3>'
    + '<p class="hd-exito-detalle">Martín R. · Jue 15 oct<br>Llega entre 16:06 y 16:30</p>'
    + '</div></div>';
  return '<div class="hd-capa hd-app hd-confirmar" data-pantalla="confirmar">'
    + appHeader({ ubicacion: false, atras: true, titulo: 'Confirmá tu pedido' })
    + '<div class="hd-cuerpo">'
    + '<div class="hd-bloque" data-bloque="especialista"><div class="hd-rotulo">Especialista</div>'
    + '<div class="hd-tarjeta hd-tarjeta-azul">'
    + avatar({ iniciales: 'MR', tamano: 54, anillo: true })
    + `<div class="hd-tarjeta-textos"><div class="hd-tarjeta-titulo">Martín R. ${verifiedBadge({ tamano: 18, sobreAzul: true })}</div>`
    + '<div class="hd-tarjeta-detalle">Plomería</div></div>'
    + '</div></div>'
    + '<div class="hd-bloque" data-bloque="turno"><div class="hd-rotulo">Turno</div>'
    + '<div class="hd-tarjeta hd-tarjeta-doble">'
    + `<div class="hd-tarjeta-fila"><span class="hd-tarjeta-icono">${icon('calendario', { size: 24, stroke: 2 })}</span>`
    + '<div class="hd-tarjeta-textos"><div class="hd-tarjeta-titulo">Jue 15 oct</div><div class="hd-tarjeta-detalle">Llega entre 16:06 y 16:30</div></div></div>'
    + `<div class="hd-tarjeta-fila"><span class="hd-tarjeta-icono">${icon('casa', { size: 24, stroke: 2 })}</span>`
    + '<div class="hd-tarjeta-textos"><div class="hd-tarjeta-titulo">Casa · Mar del Plata</div></div></div>'
    + '</div></div>'
    + '<div class="hd-bloque" data-bloque="precio"><div class="hd-rotulo">Precio final</div>'
    + priceBreakdown({
      filas: [
        { etiqueta: 'Presupuesto de Martín R.', valor: p.budget },
        { etiqueta: 'Tarifa de servicio Handy (5%)', valor: p.fee },
      ],
      total: { etiqueta: 'Total', valor: p.total },
    })
    + '</div>'
    + '</div>'
    + `<div class="hd-pie">${button({ texto: 'Confirmar', variante: 'exito', accion: 'confirmar' })}</div>`
    + (exito ? exitoCapa : '')
    + '</div>';
}

export function hojaResena(): string {
  return '<div class="hd-capa" data-pantalla="resena">'
    + bottomSheet({
      titulo: '¿Cómo fue tu experiencia con Martín?',
      contenido: '<div class="hd-resena">'
        + avatar({ iniciales: 'MR', tamano: 92 })
        + `<div class="hd-resena-nombre">Martín R. ${verifiedBadge({ conTexto: false, tamano: 22 })}</div>`
        + `<div class="hd-resena-rubro">Plomería ${icon('plomeria', { size: 20, stroke: 2 })}</div>`
        + starRating({ valor: 5, tamano: 44 })
        + button({ texto: 'Enviar', accion: 'enviar-resena' })
        + '</div>',
    })
    + '</div>';
}
