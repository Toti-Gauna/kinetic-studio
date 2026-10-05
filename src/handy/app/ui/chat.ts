/* Chat del trabajo de la app 2026: burbujas, tarjeta de foto, aviso del chat, separador de fecha, acciones rápidas y
   campo de mensaje. Medido en 12-u-chat, 11/12-e-chat (fondo del chat #F4F5F8).
   Colores: las burbujas del ESPECIALISTA son azules (texto blanco) y las del CLIENTE blancas (texto tinta) en las dos
   apps; lo que cambia es el lado: lo propio va a la derecha.
   burbuja({ texto, lado = 'der', tono = 'blanca', ancho, app = 'usuario' }) → <div class="ap-burbuja"> DM Sans 14,2, radio 16
       (la esquina del lado del que habla, 6), blanca con sombra suave. Cambia con la app de la pantalla (`app` → data-app):
       'usuario' (12-u-chat): 600, renglones de 19,8, relleno 6,2 / 9,3 × 12,5, máx. 306 de ancho (1 renglón: 35,3 de alto;
       2: 55,1); 'especialista' (11/12-e-chat): 500 con tracking 0,15, renglones de 21,6, relleno 6,5 / 8,8 × 12,6, máx. 300
       (así corta "…la pérdida / de la cocina."; 1 renglón: 36,9; 2: 58,5).
   tarjetaFoto({ pie = 'Así está el caño de abajo de la pileta', lado = 'der', app = 'usuario', imagen }) → burbuja blanca con
       la "foto" y el pie (600 14,2 en la del usuario; 500 14,2 con tracking 0,15 en la del especialista). imagen: 'canilla'
       (12-u-chat: gris claro de 127 × 84 con la canilla en un círculo blanco; tarjeta de 124 de alto; default del usuario) o 'cano'
       (11/12-e-chat: dibujo de 158,4 × 119,3 con la franja de arriba más oscura, el caño gris con su contorno claro y dos
       gotas celestes; relleno 5,5 × 5,1; tarjeta de 160 de alto; default del especialista).
   avisoChat({ texto }) → tarjeta blanca centrada (radio 24) con el escudo azul en un círculo de 44 y el texto gris 13
       ("Chat del trabajo. Tu número no se comparte: hablan por acá.").
   fechaChat('Hoy') → pildorita gris centrada.
   accionesChat({ principales, secundarias }) → fila de píldoras planas de 49,5 (azul "Programar turno", amarillo "Quiero
       un turno ahora"; texto 700 13,8, ícono de 16) y, 19,5 más abajo, fila de chips celestes de 49,4 ("Salgo para allá" ·
       "Llave de paso" · "¿Qué timbre?"; texto 700 14,2). Cada fila va en un solo renglón: lo que no entra se sale por la
       derecha como un scroll horizontal (32/36-e-chat cortan el último botón en el borde).
   campoMensaje({ texto = 'Escribí un mensaje...', boton = 'camara', escrito }) → círculo gris de 47,5 con la cámara/imagen,
       el campo #F4F5F8 de 42 de alto y el botón de enviar azul de 49 con canto. `escrito`: capa con el texto tipeado
       (opacity 0 hasta que la escena lo muestra; el placeholder es otra capa).
   tarjetaChat({ rotulo, filas, nota, estados, estado = 0, tono = 'blanca', lado = 'izq', ancho = 334 }) → tarjeta de turno
       del chat (32/36-e-chat-nuevo, 36/40-u-chat2): blanca o celeste #E9EFF9 (radio 22, sombra suave), 18,5 de relleno a
       los lados. Arriba el calendario azul de 17 y el rótulo DM Sans 700 13 mayúsculas azul (tracking 0,08 em); después
       las filas clave · valor (clave 400 14,2 gris, valor 700 14,2 tinta a la derecha, renglones de 17; `fuerte`: las dos
       en 700 16 tinta), con `antes: 'punteado'` el separador fino (tinta al 18 %); la `nota` gris 12,3 (renglones de 14,6) y la
       etiqueta de estado (píldora de 19,3: gris #ECECEC "Esperando respuesta" / "Reemplazada por otra propuesta", verde
       "Aceptada"). Los `estados` van apilados en el mismo lugar y solo el `estado` se ve: cambiarlo es cruzar opacity.
       solicitudTurno({ quePaso, cuando, nota, estados, … }) y propuestaChat({ trabajo, fecha, horario, mano, materiales,
       tarifa, total, nota, estados, … }) arman las dos de la historia (y aceptan los textos de las fotos).
   Ganchos: .ap-burbuja[data-lado][data-tono][data-app] (entran con y/opacity/scale; origen en la esquina de abajo del lado que
     habla) · .ap-foto[data-imagen] · .ap-foto-imagen · .ap-foto-cano · .ap-foto-gota / .ap-foto-gotita (las gotas del dibujo,
     para que caigan: y/opacity; origen al centro) · .ap-chat-tarjeta[data-tono][data-lado] (entra como una burbuja) · .ap-chat-tarjeta-rotulo ·
     .ap-chat-tarjeta-fila[data-fila] · .ap-chat-tarjeta-separador · .ap-chat-tarjeta-nota ·
     .ap-chat-tarjeta-estado[data-estado="i"][data-tono] (opacity) · .ap-aviso-chat · .ap-fecha-chat · .ap-acciones · .ap-acciones .ap-boton[data-accion] ·
     .ap-campo · .ap-campo-placeholder / .ap-campo-escrito (opacity) · .ap-campo-enviar (apretar: y = 4). */
import { icono, type Icono } from '../iconos.ts';
import { boton } from './botones.ts';
import { chip } from './chips.ts';
import { cls, esc } from './comun.ts';
import '../css/chat.css';

export type LadoChat = 'izq' | 'der';
/** De qué app es la pantalla del chat: cambia el peso y el interlineado del texto (y la foto por defecto). */
export type AppChat = 'usuario' | 'especialista';

export function burbuja({ texto, lado = 'der', tono = 'blanca', ancho, app = 'usuario', className = '' }: { texto: string; lado?: LadoChat; tono?: 'blanca' | 'azul'; ancho?: number; app?: AppChat; className?: string }): string {
  return `<div class="${cls('ap-burbuja', className)}" data-lado="${lado}" data-tono="${tono}" data-app="${app}"${ancho ? ` style="width:${ancho}px"` : ''}>${esc(texto)}</div>`;
}

/** El dibujo de la foto del caño (11/12-e-chat), en px de la imagen de 158,4 × 119,3 medida en 12-e-chat-2. */
const DIBUJO_CANO = '<svg class="ap-foto-cano" viewBox="0 0 158.4 119.3" width="158.4" height="119.3" aria-hidden="true">'
  + '<rect width="158.4" height="119.3" fill="#DCE3EC"/><rect width="158.4" height="29.1" fill="#C9D2DE"/>'
  + '<path d="M79.6 28.6V54.3a14.5 14.5 0 0 0 14.5 14.5h17.3v23.6" fill="none" stroke="#F4F6F9" stroke-width="14.6" stroke-linecap="round" stroke-miterlimit="10"/>'
  + '<path d="M79.6 28.6V54.3a14.5 14.5 0 0 0 14.5 14.5h17.3v23.6" fill="none" stroke="#9AA6B6" stroke-width="2.6" stroke-linecap="round" stroke-miterlimit="10"/>'
  + '<circle class="ap-foto-gota" cx="111.4" cy="103.4" r="3.9" fill="#6FB5FF"/><circle class="ap-foto-gotita" cx="103.4" cy="111.4" r="2.6" fill="#6FB5FF"/>'
  + '</svg>';

export function tarjetaFoto({ pie = 'Así está el caño de abajo de la pileta', lado = 'der', app = 'usuario', imagen, className = '' }: { pie?: string; lado?: LadoChat; app?: AppChat; imagen?: 'canilla' | 'cano'; className?: string } = {}): string {
  const img = imagen ?? (app === 'especialista' ? 'cano' : 'canilla');
  const dibujo = img === 'cano' ? DIBUJO_CANO : `<span class="ap-foto-canilla">${icono('canilla', { tam: 18, trazo: 2.2 })}</span>`;
  return `<div class="${cls('ap-foto', 'ap-burbuja', className)}" data-lado="${lado}" data-tono="blanca" data-app="${app}" data-imagen="${img}">`
    + `<span class="ap-foto-imagen">${dibujo}</span>`
    + `<span class="ap-foto-pie">${esc(pie)}</span></div>`;
}

export interface FilaTarjetaChat { clave: string; valor: string; fuerte?: boolean; antes?: 'punteado'; dato?: string }
export interface EstadoTarjetaChat { texto: string; tono?: 'gris' | 'verde' }

export interface TarjetaChatProps {
  rotulo: string;
  filas: readonly FilaTarjetaChat[];
  nota?: string;
  /** ancho máximo de la nota en px (la solicitud la corta en ≈ 240: "…o le / proponés otro.") */
  notaAncho?: number;
  estados?: readonly EstadoTarjetaChat[];
  /** índice del estado que se ve (los demás quedan en opacity 0, apilados) */
  estado?: number;
  tono?: 'blanca' | 'celeste';
  lado?: LadoChat;
  ancho?: number;
  className?: string;
}

const slugChat = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function tarjetaChat({ rotulo, filas, nota, notaAncho, estados = [], estado = 0, tono = 'blanca', lado = 'izq', ancho = 334, className = '' }: TarjetaChatProps): string {
  const filasHtml = filas.map(f => (f.antes ? '<span class="ap-chat-tarjeta-separador"></span>' : '')
    + `<div class="ap-chat-tarjeta-fila" data-fila="${esc(f.dato ?? slugChat(f.clave))}"${f.fuerte ? ' data-fuerte' : ''}>`
    + `<span class="ap-chat-tarjeta-clave">${esc(f.clave)}</span><span class="ap-chat-tarjeta-valor">${esc(f.valor)}</span></div>`).join('');
  const estadosHtml = estados.length
    ? '<div class="ap-chat-tarjeta-estados">' + estados.map((e, i) => `<span class="ap-chat-tarjeta-estado" data-estado="${i}" data-tono="${e.tono ?? 'gris'}"`
      + ` style="opacity:${i === estado ? 1 : 0}">${esc(e.texto)}</span>`).join('') + '</div>'
    : '';
  return `<div class="${cls('ap-chat-tarjeta', className)}" data-tono="${tono}" data-lado="${lado}" style="width:${ancho}px">`
    + `<div class="ap-chat-tarjeta-rotulo">${icono('calendario', { tam: 17, trazo: 2.1 })}<span>${esc(rotulo)}</span></div>`
    + `<div class="ap-chat-tarjeta-filas">${filasHtml}</div>`
    + (nota ? `<p class="ap-chat-tarjeta-nota"${notaAncho ? ` style="max-width:${notaAncho}px"` : ''}>${esc(nota)}</p>` : '')
    + estadosHtml + '</div>';
}

/** "SOLICITUD DE TURNO": qué pasó y cuándo (la pide el cliente). */
export function solicitudTurno({
  quePaso = 'Se rompió el caño de abajo de la pileta de la cocina', cuando = 'Hoy · 16 a 18 h',
  nota = 'Te pide este horario. Vos lo cotizás o le proponés otro.', estados = [{ texto: 'Esperando respuesta' }],
  cuandoFuerte = true, ...resto
}: Partial<Omit<TarjetaChatProps, 'rotulo' | 'filas'>> & { quePaso?: string; cuando?: string; cuandoFuerte?: boolean } = {}): string {
  return tarjetaChat({
    rotulo: 'Solicitud de turno', nota, notaAncho: 240, estados, ...resto,
    filas: [{ clave: 'Qué pasó', valor: quePaso }, { clave: 'Cuándo', valor: cuando, fuerte: cuandoFuerte, antes: cuandoFuerte ? 'punteado' : undefined }],
  });
}

/** "PROPUESTA" (o "TU PROPUESTA" del lado del especialista): trabajo, fecha, horario, montos y el total. */
export function propuestaChat({
  rotulo = 'Propuesta', trabajo = 'Cambiar el caño de abajo de la pileta de la cocina', fecha = 'Hoy, martes 17/11', horario = '16 a 18 h',
  mano = '$ 32.000', materiales = '$ 13.000', tarifa = '$ 2.250', total = '$ 47.250', totalTexto = 'Total final para vos',
  nota = 'No es un turno confirmado hasta que se acepte.', estados = [{ texto: 'Esperando respuesta' }, { texto: 'Aceptada', tono: 'verde' }],
  ...resto
}: Partial<Omit<TarjetaChatProps, 'filas'>> & { trabajo?: string; fecha?: string; horario?: string; mano?: string; materiales?: string; tarifa?: string; total?: string; totalTexto?: string } = {}): string {
  return tarjetaChat({
    rotulo, nota, estados, ...resto,
    filas: [
      { clave: 'Trabajo', valor: trabajo }, { clave: 'Fecha', valor: fecha }, { clave: 'Horario', valor: horario },
      { clave: 'Mano de obra', valor: mano }, { clave: 'Materiales', valor: materiales },
      { clave: 'Tarifa de Handy · cliente (5%)', valor: tarifa, dato: 'tarifa' },
      { clave: totalTexto, valor: total, fuerte: true, antes: 'punteado', dato: 'total' },
    ],
  });
}

/** Cambia el estado de la tarjeta (cruza las etiquetas apiladas). Devuelve la duración. */
export function cambiarEstadoTarjeta(tl: GSAPTimeline, el: Element, i: number, at: number, dur = 0.25): number {
  el.querySelectorAll<HTMLElement>('.ap-chat-tarjeta-estado').forEach(e => {
    tl.to(e, { opacity: Number(e.dataset.estado) === i ? 1 : 0, duration: dur, ease: 'power1.inOut' }, at);
  });
  return dur;
}

export function avisoChat({ texto = 'Chat del trabajo. Tu número no se comparte: hablan por acá.', className = '' }: { texto?: string; className?: string } = {}): string {
  return `<div class="${cls('ap-aviso-chat', className)}"><span class="ap-aviso-chat-escudo">${icono('escudo', { tam: 22, trazo: 2.1 })}</span>`
    + `<span class="ap-aviso-chat-texto">${esc(texto)}</span></div>`;
}

export function fechaChat(texto = 'Hoy', { className = '' }: { className?: string } = {}): string {
  return `<div class="${cls('ap-fecha-chat', className)}"><span>${esc(texto)}</span></div>`;
}

export interface AccionChat { texto: string; icono?: Icono; variante?: 'azul' | 'amarillo'; accion?: string }

export function accionesChat({
  principales = [{ texto: 'Programar turno', icono: 'agenda', variante: 'azul', accion: 'programar' }, { texto: 'Quiero un turno ahora', icono: 'alerta', variante: 'amarillo', accion: 'turno-ahora' }],
  secundarias = [], className = '',
}: { principales?: readonly AccionChat[]; secundarias?: readonly string[]; className?: string } = {}): string {
  return `<div class="${cls('ap-acciones', className)}">`
    + `<div class="ap-acciones-fila">${principales.map(a => boton({ texto: a.texto, icono: a.icono, variante: a.variante ?? 'azul', tam: 'pildora', alto: 49.5, canto: 0, accion: a.accion })).join('')}</div>`
    + (secundarias.length ? `<div class="ap-acciones-fila" data-fila="2">${secundarias.map(s => chip({ texto: s, tono: 'celeste', tam: 'm', className: 'ap-acciones-chip' })).join('')}</div>` : '')
    + '</div>';
}

export function campoMensaje({ texto = 'Escribí un mensaje...', boton: b = 'camara', escrito = '', className = '' }: { texto?: string; boton?: 'camara' | 'imagen'; escrito?: string; className?: string } = {}): string {
  return `<div class="${cls('ap-campo', className)}">`
    + `<span class="ap-campo-adjuntar">${icono(b, { tam: 22, trazo: 2 })}</span>`
    + `<span class="ap-campo-entrada"><span class="ap-campo-placeholder">${esc(texto)}</span>`
    + `<span class="ap-campo-escrito" style="opacity:0">${esc(escrito)}</span></span>`
    + `<span class="ap-campo-enviar"><span class="ap-campo-enviar-canto"></span><span class="ap-campo-enviar-cara">${icono('enviar', { tam: 22, trazo: 2.1 })}</span></span>`
    + '</div>';
}
