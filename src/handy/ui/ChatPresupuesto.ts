/* Presupuesto de un especialista como mensaje estructurado del chat, con el estilo de una cuenta de empresa verificada:
   cabecera (avatar, nombre, insignia Verificado, rubro y ★ calificación), título "Presupuesto", filas Trabajo /
   Mano de obra / Materiales, Total grande (= mano de obra + materiales), llegada declarada, validez, hora, y abajo
   los botones a todo el ancho separados por filetes: Consultar | Aceptar (primario).
   chatPresupuesto({ especialista: { nombre, iniciales, color, rubro, calificacion }, trabajo, manoDeObra, materiales,
     llegada, validez = '48 h', hora, acciones = true, elegido = false, atenuado = false, escala = 1, id, className })
     → string <article class="hd-presu" data-id="…">.
   Tamaño: 340 px de ancho a escala 1 (entra como mensaje en la pantalla de 414). Todo se mide en em: `escala` lo
   redibuja más grande a resolución nativa (1,4 → 476 px), nítido para la comparación lado a lado en el escenario.
   Alto: 397 px × escala con acciones (347 sin acciones). Como todo está en em, una tarjeta de escala k achicada con
   transform scale(1/k) calza exacta sobre la de escala 1 (para "devolver" la elegida al teléfono).
   Ganchos: .hd-presu[data-id] · .hd-presu-cabecera · .hd-presu-titulo · .hd-presu-fila[data-fila="trabajo|mano-de-obra|materiales"] ·
   .hd-presu-total (fila) > .hd-presu-total-valor · .hd-presu-llegada · .hd-presu-validez · .hd-presu-hora ·
   .hd-presu-acciones · .hd-presu-btn[data-accion="aceptar|consultar"] ·
   .hd-presu-sello (capa "Elegido": marco verde .hd-presu-sello-marco + píldora .hd-presu-sello-pildora). El sello sale con
   opacity:0 en línea salvo con `elegido: true`: la escena lo hace aparecer con opacity (y la píldora con un pop de scale).
   Atenuar los presupuestos no elegidos: tweenear la opacity del .hd-presu a ≈ 0,45 (o `atenuado: true` / .hd-presu--atenuado
   para dibujarlo ya atenuado). */
import '../css/base.css';
import '../css/chat.css';
import { icon } from '../icons.ts';
import { formatARS } from '../tokens.ts';
import { avatar } from './Avatar.ts';
import { verifiedBadge } from './VerifiedBadge.ts';

export interface EspecialistaPresupuesto {
  nombre: string;
  iniciales: string;
  color: string;
  /** "Plomería" */
  rubro: string;
  /** 4.9 → "★ 4,9" (opcional) */
  calificacion?: number;
}

export interface ChatPresupuestoProps {
  especialista: EspecialistaPresupuesto;
  /** "Reparar pérdida en el caño de la bacha" */
  trabajo: string;
  /** pesos */
  manoDeObra: number;
  /** pesos */
  materiales: number;
  /** "Llega entre 16:06 y 16:30" (tal como lo declara el especialista) */
  llegada: string;
  /** "48 h" → "Validez 48 h" */
  validez?: string;
  /** hora del mensaje, "10:04" */
  hora?: string;
  /** botones Consultar | Aceptar (default true) */
  acciones?: boolean;
  /** sello "Elegido" visible (default false: sale con opacity 0) */
  elegido?: boolean;
  /** dibujarlo atenuado (opacity .45) */
  atenuado?: boolean;
  /** 1 = 340 px de ancho; 1,4 = 476 px (todo escala en em) */
  escala?: number;
  id?: string;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);
const r1 = (n: number) => Math.round(n * 10) / 10;

/** 4.9 → "4,9" */
export function formatCalificacion(n: number): string {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function chatPresupuesto({
  especialista, trabajo, manoDeObra, materiales, llegada, validez = '48 h', hora, acciones = true,
  elegido = false, atenuado = false, escala = 1, id, className = '',
}: ChatPresupuestoProps): string {
  const e = especialista;
  const total = manoDeObra + materiales;
  const cls = ['hd-presu', atenuado ? 'hd-presu--atenuado' : '', className].filter(Boolean).join(' ');
  const base = r1(16 * escala);
  // íconos: el tamaño real lo pone el CSS en em; el atributo es solo el de partida
  const ic = (n: Parameters<typeof icon>[0], stroke = 2.2) => icon(n, { size: 16, stroke });

  const cabecera = '<header class="hd-presu-cabecera">'
    + avatar({ iniciales: e.iniciales, color: e.color, tamano: r1(44 * escala) })
    + '<div class="hd-presu-quien">'
    + `<div class="hd-presu-nombre-fila"><span class="hd-presu-nombre">${esc(e.nombre)}</span>`
    + verifiedBadge({ tamano: r1(16 * escala) }) + '</div>'
    + `<div class="hd-presu-rubro"><span>${esc(e.rubro)}</span>`
    + (e.calificacion !== undefined
      ? `<span class="hd-presu-punto">·</span><span class="hd-presu-calif">${icon('estrella', { size: 14, stroke: 1.5, fill: 'currentColor' })}<b>${formatCalificacion(e.calificacion)}</b></span>`
      : '')
    + '</div></div></header>';

  const fila = (clave: string, etiqueta: string, valor: string) =>
    `<div class="hd-presu-fila" data-fila="${clave}"><span class="hd-presu-etiqueta">${etiqueta}</span><span class="hd-presu-valor">${valor}</span></div>`;

  const cuerpo = '<div class="hd-presu-cuerpo">'
    + `<div class="hd-presu-titulo">${ic('herramienta', 2.3)}<span>Presupuesto</span></div>`
    + `<div class="hd-presu-fila hd-presu-fila--trabajo" data-fila="trabajo"><span class="hd-presu-etiqueta">Trabajo</span><span class="hd-presu-valor">${esc(trabajo)}</span></div>`
    + fila('mano-de-obra', 'Mano de obra', formatARS(manoDeObra))
    + fila('materiales', 'Materiales', formatARS(materiales))
    + `<div class="hd-presu-total"><span class="hd-presu-etiqueta">Total</span><span class="hd-presu-total-valor">${formatARS(total)}</span></div>`
    + '<div class="hd-presu-datos">'
    + `<div class="hd-presu-llegada">${ic('reloj')}<span>${esc(llegada)}</span></div>`
    + `<div class="hd-presu-validez">${ic('reloj-arena')}<span>Validez ${esc(validez)}</span>`
    + (hora ? `<span class="hd-presu-hora">${esc(hora)}</span>` : '')
    + '</div></div></div>';

  const botones = acciones
    ? '<footer class="hd-presu-acciones">'
      + `<span class="hd-presu-btn" data-accion="consultar">${ic('mensajes')}<span>Consultar</span></span>`
      + `<span class="hd-presu-btn hd-presu-btn--primario" data-accion="aceptar">${ic('tilde', 2.8)}<span>Aceptar</span></span>`
      + '</footer>'
    : '';

  const sello = `<div class="hd-presu-sello"${elegido ? '' : ' style="opacity:0"'}>`
    + '<span class="hd-presu-sello-marco"></span>'
    + `<span class="hd-presu-sello-pildora">${ic('tilde', 3)}<span>Elegido</span></span></div>`;

  return `<article class="${cls}"${id ? ` data-id="${esc(id)}"` : ''} style="font-size:${base}px">${cabecera}${cuerpo}${botones}${sello}</article>`;
}
