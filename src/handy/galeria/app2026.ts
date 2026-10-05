/* Galería · app 2026 (src/handy/app): las pantallas ancla dentro del teléfono a 1:1 y cada componente suelto.
   Cada pieza lleva data-captura="nombre" (la pantalla de 414×896 del teléfono, o el componente) para compararla con las
   fotos de handy-2026/ (galeria.mjs del scratchpad guarda una PNG por pieza). Demo en el timeline: el especialista se
   pone Disponible (interruptor, mapa gris → color con radar, tarjetas), el radar late y las estrellas se llenan.
   ?seccion=app2026 muestra solo esta sección · &t=SEGUNDOS congela la demo. */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import { pantallaInicioUsuario, bannerHandIA } from '../app/usuario.ts';
import { pantallaInicioEspecialista, prenderInicioEspecialista, pildoraBuscando, hojaPrecio } from '../app/especialista.ts';
import { encabezado, botonCuadrado, pildoraDireccion } from '../app/ui/encabezado.ts';
import { barraInferior } from '../app/ui/barra.ts';
import { aviso, barraDelAviso } from '../app/ui/aviso.ts';
import { boton } from '../app/ui/botones.ts';
import { chip, chipHorario, chipRubro, etiqueta } from '../app/ui/chips.ts';
import { avatar, pildoraVerificado } from '../app/ui/avatar.ts';
import { tarjeta, caja, tarjetaTurno } from '../app/ui/tarjeta.ts';
import { tituloResaltado, rotulo } from '../app/ui/textos.ts';
import { desglose } from '../app/ui/desglose.ts';
import { pasos } from '../app/ui/pasos.ts';
import { mapa } from '../app/ui/mapa.ts';
import { interruptorDisponible, llavecita } from '../app/ui/interruptor.ts';
import { teclado, montoGrande, acomodarMonto } from '../app/ui/teclado.ts';
import { calendarioMes, tiraDias } from '../app/ui/calendario.ts';
import { burbuja, tarjetaFoto, avisoChat, fechaChat, accionesChat, campoMensaje, solicitudTurno, propuestaChat, tarjetaChat } from '../app/ui/chat.ts';
import { estrellas, llenarEstrellas } from '../app/ui/estrellas.ts';
import { fichaRubro, fichaAcceso } from '../app/ui/fichas.ts';
import { ICONOS, icono } from '../app/iconos.ts';

const bloque = (titulo: string, html: string) =>
  `<div style="flex:1 1 100%"><h3 style="margin:0 0 14px;font:700 18px/1.2 var(--hd-font);color:var(--hd-tinta)">${titulo}</h3>`
  + `<div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">${html}</div></div>`;

const muestra = (rotulo: string, html: string, estilo = '') =>
  `<figure style="margin:0;display:flex;flex-direction:column;gap:8px"><div style="position:relative;${estilo}">${html}</div>`
  + `<figcaption style="font:600 13px/1.3 var(--hd-font);color:#4A4A4A;max-width:440px">${rotulo}</figcaption></figure>`;

/** Teléfono con la pantalla; la pantalla (414×896, con la barra de estado) lleva data-captura. */
const telefono = (rotulo: string, captura: string, pantalla: string, estado: 'oscuro' | 'claro' = 'oscuro', id?: string) =>
  muestra(rotulo, phoneFrame({ pantalla, hora: '9:41', estado, id }).replace('class="hd-pantalla"', `class="hd-pantalla"${captura ? ` data-captura="${captura}"` : ''}`),
    'width:438px;height:920px');

/** Componente suelto en una caja con data-captura (fondo blanco por defecto). */
const pieza = (rotulo: string, captura: string, html: string, { w = 414, h, fondo = '#FFFFFF', pad = 0, extra = '' }: { w?: number; h?: number; fondo?: string; pad?: number; extra?: string } = {}) =>
  muestra(rotulo, `<div class="ap-ui"${captura ? ` data-captura="${captura}"` : ''} style="position:relative;width:${w}px;${h ? `height:${h}px;` : ''}background:${fondo};padding:${pad}px;box-sizing:border-box;overflow:hidden;${extra}">${html}</div>`);

/** Un pedazo de una capa de pantalla (para lo que va en posición absoluta de pantalla: encabezado, barra). */
const recorte = (html: string, y: number, h: number) =>
  `<div style="position:absolute;left:0;top:${-y}px;width:414px;height:896px">${html}</div><div style="height:${h}px"></div>`;

/** Un elemento del chat en su lugar de la foto: fila absoluta a `top` con márgenes `x` (la burbuja se alinea sola). */
const enLugar = (top: number, x: number, html: string) =>
  `<div style="position:absolute;left:${x}px;right:${x}px;top:${top}px;display:flex;flex-direction:column">${html}</div>`;

const seccion: Seccion = {
  id: 'app2026',
  titulo: 'App 2026 (diseño nuevo)',
  render(root, tl) {
    const azul = '#1F57A8';
    root.innerHTML = [
      bloque('Pantallas ancla (1:1, 414×896 dentro del marco de 438×920)', [
        telefono("u-inicio · pantallaInicioUsuario({ apretada: 'plomeria' }) = 01-u-inicio", 'u-inicio', pantallaInicioUsuario({ apretada: 'plomeria' })),
        telefono('e-inicio · pantallaInicioEspecialista() = 01-e-inicio', 'e-inicio', pantallaInicioEspecialista(), 'claro'),
        telefono('e-inicio-2 · pantallaInicioEspecialista({ disponible: true }) = 02-e-inicio', 'e-inicio-2', pantallaInicioEspecialista({ disponible: true }), 'claro'),
        telefono('hojaPrecio() + aviso sobre e-inicio-2 = 03-e-precio', 'hoja-precio',
          pantallaInicioEspecialista({ disponible: true })
          + hojaPrecio()
          + aviso({ titulo: 'Nuevo pedido de plomería', detalle: 'La Perla, a 2,3 km. Handy sugiere $ 44.000.', icono: 'canilla', tono: 'amarillo', dato: 'pedido' }), 'claro'),
        telefono("hojaPrecio({ modo: 'teclado', advertencia: true }) = 05-e-precio-3", 'hoja-precio-3',
          pantallaInicioEspecialista({ disponible: true })
          + hojaPrecio({ modo: 'teclado', valores: ['$ 44.000', '!$ 4', '!$ 45', '!$ 450', '!$ 4.500', '$ 45.000'], actual: 1, advertencia: true }), 'claro'),
        telefono("hojaPrecio({ modo: 'teclado' }) = 09-e-precio-7", 'hoja-precio-7',
          pantallaInicioEspecialista({ disponible: true })
          + hojaPrecio({ modo: 'teclado', valores: ['$ 44.000', '!$ 4', '!$ 45', '!$ 450', '!$ 4.500', '$ 45.000'], actual: 5 }), 'claro'),
        telefono('demo (timeline): No disponible → Disponible', '', pantallaInicioEspecialista(), 'claro', 'ap-gal-demo-disponible'),
      ].join('')),

      bloque('Encabezado y barra inferior', [
        pieza("encabezado({ variante: 'blanco', campana: 2 })", 'encabezado-blanco', recorte(encabezado({ variante: 'blanco', campana: 2 }), 0, 124)),
        pieza("encabezado({ variante: 'azul' })", 'encabezado-azul', recorte(encabezado({ variante: 'azul' }), 0, 124)),
        pieza("botonCuadrado({ icono: 'campana', globito: 3 }) · tono 'translucido'", 'boton-cuadrado',
          `<div style="position:relative;height:76px">${botonCuadrado({ icono: 'campana', globito: 3, estilo: 'left:20px;top:12px' })}${botonCuadrado({ icono: 'pin', estilo: 'left:83px;top:12px' })}</div>`
          + `<div style="position:relative;height:76px;background:#1F57A8">${botonCuadrado({ icono: 'campana', tono: 'translucido', estilo: 'left:20px;top:11px' })}${botonCuadrado({ icono: 'pin', tono: 'translucido', estilo: 'left:83px;top:11px' })}</div>`, { w: 160 }),
        pieza('pildoraDireccion()', 'direccion', `<div style="position:relative;height:44px">${pildoraDireccion({ estilo: 'left:12px;top:6px' })}</div>`, { w: 280 }),
        pieza("barraInferior({ activa: 'inicio' })", 'barra-inicio', recorte(barraInferior({ activa: 'inicio' }), 812, 84)),
        pieza("barraInferior({ activa: 'agenda' })", 'barra-agenda', recorte(barraInferior({ activa: 'agenda' }), 812, 84)),
        pieza("barraInferior({ activa: 'mensajes' })", 'barra-mensajes', recorte(barraInferior({ activa: 'mensajes' }), 812, 84)),
      ].join('')),

      bloque('Avisos', [
        pieza("aviso({ tono: 'amarillo', icono: 'canilla', capa: false })", 'aviso-pedido',
          aviso({ titulo: 'Nuevo pedido de plomería', detalle: 'La Perla, a 2,3 km. Handy sugiere $ 44.000.', capa: false }), { h: 100, fondo: '#5F6B84' }),
        pieza("aviso({ tono: 'verde', icono: 'tilde' })", 'aviso-elegido',
          aviso({ titulo: '¡El cliente te eligió!', detalle: 'Plomería en La Perla. Ya podés ir para allá.', icono: 'tilde', tono: 'verde', capa: false }), { h: 100, fondo: '#5F6B84' }),
        pieza("aviso({ tono: 'azul', icono: 'billetera' })", 'aviso-propuesta',
          aviso({ titulo: 'Te llegó una propuesta', detalle: 'Especialista 1 · $ 47.250 final para vos', icono: 'billetera', tono: 'azul', capa: false }), { h: 100, fondo: '#5F6B84' }),
      ].join('')),

      bloque('Botones, chips, avatar', [
        pieza('boton(): azul grande · verde · gris · amarillo · blanco · contorno · texto-azul · celeste', 'botones', [
          boton({ texto: 'Ponerme disponible', icono: 'interruptor', ancho: 340.5 }),
          `<div style="display:flex;gap:10px">${boton({ texto: 'Cancelar', variante: 'gris', tam: 'medio', ancho: 128 })}${boton({ texto: 'Confirmar turno', icono: 'tilde', variante: 'verde', tam: 'medio', ancho: 202 })}</div>`,
          `<div style="display:flex;gap:10px;flex-wrap:wrap">${boton({ texto: 'Dejar el sugerido', tam: 'pildora' })}${boton({ texto: '+ $ 1.000', variante: 'blanco', tam: 'pildora' })}${boton({ texto: 'Listo', icono: 'lapiz', tam: 'pildora' })}</div>`,
          `<div style="display:flex;gap:10px;flex-wrap:wrap">${boton({ texto: 'Permitir', variante: 'amarillo', tam: 'medio', ancho: 150 })}${boton({ texto: 'Escribir otro monto', icono: 'lapiz', variante: 'texto-azul', tam: 'pildora' })}</div>`,
          boton({ texto: 'Prefiero elegir la fecha', icono: 'calendario', variante: 'contorno', tam: 'medio', ancho: 342 }),
          `<div style="display:flex;gap:10px">${boton({ texto: 'Salgo para allá', variante: 'celeste', tam: 'pildora' })}</div>`,
        ].join(''), { w: 390, pad: 20, fondo: '#F4F5F8', extra: 'display:flex;flex-direction:column;gap:12px' }),
        pieza('chipHorario (elegido / apagado) · chip · chipRubro · etiqueta', 'chips', [
          `<div style="display:flex;gap:8px;flex-wrap:wrap">${chipHorario({ texto: 'Hoy, de 16 a 18 h', elegido: true })}${chipHorario({ texto: 'Hoy, de 18 a 20 h' })}</div>`,
          `<div style="display:flex;gap:8px;flex-wrap:wrap">${chip({ texto: 'Puntual', elegido: true })}${chip({ texto: 'Prolijo' })}${chip({ texto: 'Llave de paso', tono: 'celeste' })}</div>`,
          `<div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center">${chipRubro({ rubro: 'plomeria' })}${chipRubro({ rubro: 'gas' })}${chipRubro({ rubro: 'plomeria', tam: 'm' })}</div>`,
          `<div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center">${etiqueta({ texto: 'Vos decidís' })}${etiqueta({ texto: 'Hoy' })}${etiqueta({ texto: 'Confirmado', tono: 'verde' })}${etiqueta({ texto: 'Nuevo' })}${etiqueta({ texto: 'Urgencia', icono: 'alerta' })}</div>`,
        ].join(''), { w: 390, pad: 20, extra: 'display:flex;flex-direction:column;gap:12px' }),
        pieza("avatar(): E2 tinta · E1 azul con tilde · E3 medio · LP · pildoraVerificado()", 'avatar',
          `<div style="display:flex;gap:16px;align-items:center">${avatar({ iniciales: 'E2', tilde: true })}${avatar({ iniciales: 'E1', tono: 'azul', tam: 86, tilde: true })}${avatar({ iniciales: 'E3', tono: 'medio', tam: 44, tilde: true })}${avatar({ iniciales: 'LP', tono: 'azul', tam: 44 })}${pildoraVerificado()}</div>`, { w: 390, pad: 20 }),
      ].join('')),

      bloque('Superficies y textos', [
        pieza('tarjetaTurno()', 'tarjeta-turno', tarjetaTurno({ estilo: 'left:23.8px;top:16px' }), { h: 172 }),
        pieza("tituloResaltado({ texto: '¿Qué necesitás hoy?', resaltar: 'hoy' }) · rotulo()", 'titulos',
          tituloResaltado({ texto: '¿Qué necesitás hoy?', resaltar: 'hoy', tam: 30.7, ancho: 110 })
          + '<div style="height:16px"></div>' + tituloResaltado({ texto: 'Tu agenda', resaltar: 'agenda', tam: 28, ancho: 110 })
          + '<div style="height:16px"></div>' + rotulo('Tu próximo turno'), { pad: 22 }),
        pieza('tarjeta() · caja()', 'superficies',
          `<div style="display:flex;gap:16px">${tarjeta('<div style="padding:18px;font:700 15px/1.3 var(--ap-font)">tarjeta</div>', { estilo: 'width:160px;height:90px' })}`
          + `${caja('<div style="padding:18px;font:700 15px/1.3 var(--ap-font)">caja</div>', { estilo: 'width:160px;height:90px' })}</div>`, { w: 380, pad: 20 }),
        pieza('fichaRubro() · fichaAcceso() · bannerHandIA()', 'fichas',
          `<div style="position:relative;height:110px">${fichaRubro({ rubro: 'plomeria', estilo: 'left:20px;top:4px' })}${fichaRubro({ rubro: 'gas', apretada: true, estilo: 'left:146px;top:4px' })}${fichaAcceso({ id: 'cuerito', icono: 'canilla', texto: 'Cambiar un cuerito', estilo: 'left:272px;top:4px' })}</div>`
          + `<div style="position:relative;height:110px">${bannerHandIA({ estilo: 'left:23.6px;top:0' })}</div>`, { h: 236, extra: 'padding-top:6px' }),
      ].join('')),

      bloque('Desglose, pasos, interruptor', [
        pieza('desglose() del cliente (09-u-confirmar)', 'desglose-cliente', tarjeta(desglose({
          filas: [{ texto: 'Mano de obra', monto: 32000 }, { texto: 'Materiales', monto: 13000 }, { texto: 'Subtotal', monto: 45000, fuerte: true }, { texto: 'Tarifa de Handy · cliente (5%)', monto: 2250 }],
          total: { texto: 'Total final para vos', monto: 47250 },
        }), { estilo: 'padding:12px 19px 8px;width:366px' }), { pad: 24, fondo: '#F4F5F8' }),
        pieza('desglose() del especialista (15-e-trabajo)', 'desglose-especialista', tarjeta(desglose({
          filas: [{ texto: 'Mano de obra', monto: 32000 }, { texto: 'Materiales', monto: 13000 }, { texto: 'Tu presupuesto', monto: 45000, fuerte: true, antes: 'punteado' }, { texto: 'Tarifa Handy (10%)', monto: -4500, tono: 'rojo' }],
          total: { texto: 'Recibís', monto: 40500, tono: 'verde', display: false },
        }), { estilo: 'padding:12px 19px 8px;width:366px' }), { pad: 24, fondo: '#F4F5F8' }),
        pieza('pasos() del usuario (10-u-seguimiento)', 'pasos-usuario', pasos({ etiquetas: ['Confirmado', 'En camino', 'Llegó', 'Trabajando'], actual: 1, progreso: 0.855, prendida: 0, persona: 111.2 }), { fondo: azul, pad: 24, extra: 'padding-left:24px;padding-right:23.6px' }),
        pieza('pasos() del especialista (13-e-en-camino)', 'pasos-especialista', pasos({ etiquetas: ['Saliste', 'En camino', 'Llegaste'], actual: 0, progreso: 0.14, variante: 'especialista', persona: 30.8 }), { fondo: azul, pad: 24, extra: 'padding-left:24px;padding-right:23.6px' }),
        pieza('interruptorDisponible() apagado / prendido · llavecita()', 'interruptor',
          `<div style="position:relative;height:70px">${interruptorDisponible({ estilo: 'left:12px;top:8px' })}${interruptorDisponible({ prendido: true, estilo: 'left:212px;top:8px' })}</div>`
          + `<div style="display:flex;gap:12px;padding:6px 12px">${llavecita().replace('class="ap-llavecita"', 'class="ap-llavecita" style="position:relative;right:auto;top:auto"')}${llavecita({ prendido: true }).replace('class="ap-llavecita"', 'class="ap-llavecita" style="position:relative;right:auto;top:auto"')}</div>`,
          { w: 420, fondo: '#E2E2E2' }),
        pieza('pildoraBuscando()', 'buscando', `<div style="position:relative;height:44px">${pildoraBuscando({ estilo: 'left:12px;top:8px' })}</div>`, { w: 200, fondo: '#E6E9EE' }),
      ].join('')),

      bloque('Mapa (pantalla entera; acá recortado)', [
        pieza("mapa({ estado: 'gris' })", 'mapa-gris', mapa({ estado: 'gris', ambos: false }), { h: 560 }),
        pieza("mapa({ estado: 'color', radar: true })", 'mapa-color', mapa({ estado: 'color', radar: true, ambos: false }), { h: 560 }),
        pieza("mapa({ vista: { y: -120 }, pin, ruta })", 'mapa-ruta', mapa({ ambos: false, vista: { y: -120 }, yo: { x: 160, y: 470 }, pin: { x: 228, y: 252 }, ruta: [[160, 470], [160, 388], [222, 388], [222, 262]] }), { h: 560 }),
      ].join('')),

      bloque('Teclado, monto, calendario', [
        pieza('montoGrande() (fila mínima 312 que crece con el monto, como en 03/05-e-precio) · teclado()', 'teclado',
          `<div style="padding-bottom:16px">${montoGrande({ valores: ['$ 45.000'] })}</div>${montoGrande({ valores: ['!$ 4'] })}<div style="height:16px"></div>${teclado()}`,
          { w: 380, pad: 20, fondo: '#F4F5F8' }),
        pieza('calendarioMes() · noviembre 2026, martes 17', 'calendario', calendarioMes(), { w: 414, pad: 23, fondo: '#FFFFFF' }),
        pieza('tiraDias({ elegido: 0 })', 'tira-dias', tiraDias({ elegido: 0 }), { w: 440, pad: 20 }),
      ].join('')),

      bloque('Chat y reseña', [
        pieza('avisoChat · fechaChat · burbuja · tarjetaFoto (12-u-chat)', 'chat', [
          avisoChat(), fechaChat('Hoy'),
          burbuja({ texto: '¡Hola! Te elegí para arreglar la pérdida de la cocina.', lado: 'der', tono: 'blanca' }),
          tarjetaFoto(),
          burbuja({ texto: '¡Hola! Gracias. Voy en la franja que te marqué.', lado: 'izq', tono: 'azul' }),
          burbuja({ texto: '¡Genial, gracias!', lado: 'der', tono: 'blanca' }),
        ].join(''), { pad: 16, fondo: '#F4F5F8', extra: 'display:flex;flex-direction:column;gap:9px' }),
        pieza('burbujas y foto en el lugar de la foto (12-u-chat, y 380 → 790)', 'chat-u', [
          enLugar(18.4, 16, burbuja({ texto: '¡Hola! Te elegí para arreglar la pérdida de la cocina.', lado: 'der' })),
          enLugar(83.8, 16, tarjetaFoto()),
          enLugar(217.2, 16, burbuja({ texto: '¡Hola! Gracias. Voy en la franja que te marqué.', lado: 'izq', tono: 'azul' })),
          enLugar(282.8, 16, burbuja({ texto: '¡Genial, gracias!', lado: 'der' })),
          enLugar(328.3, 16, burbuja({ texto: 'De nada. Cualquier cosa, escribime por acá.', lado: 'izq', tono: 'azul' })),
        ].join(''), { h: 410, fondo: '#F4F5F8' }),
        pieza("burbuja({ app: 'especialista' }) · tarjetaFoto({ app: 'especialista' }) en el lugar de la foto (12-e-chat-2, y 250 → 690)", 'chat-e', [
          enLugar(35.6, 20, burbuja({ texto: '¡Hola! Te elegí para arreglar la pérdida de la cocina.', lado: 'izq', app: 'especialista' })),
          enLugar(103.4, 20, tarjetaFoto({ lado: 'izq', app: 'especialista' })),
          enLugar(273.6, 20, burbuja({ texto: '¿Venís hoy? Te espero.', lado: 'izq', app: 'especialista' })),
          enLugar(322.3, 19.6, burbuja({ texto: '¡Hola! Salgo para allá en la franja que te marqué.', lado: 'der', tono: 'azul', app: 'especialista' })),
          enLugar(390.4, 20, burbuja({ texto: '¡Genial! Te espero.', lado: 'izq', app: 'especialista' })),
        ].join(''), { h: 440, fondo: '#F4F5F8' }),
        pieza('solicitudTurno() blanca + tarjetaChat() celeste «TU PROPUESTA» (36-e-chat-nuevo-2, textos de la foto)', 'chat-tarjetas-e', [
          solicitudTurno({ quePaso: 'Pierde agua la mochila del inodoro', cuando: 'Viernes 20/11 · 10:00 h', estados: [{ texto: 'Esperando respuesta' }, { texto: 'Reemplazada por otra propuesta' }], estado: 1 }),
          tarjetaChat({ rotulo: 'Tu propuesta', tono: 'celeste', lado: 'der', filas: [{ clave: 'Cuándo', valor: 'Viernes 20/11 · 10:00 h' }, { clave: 'Precio', valor: '$ 26.000', fuerte: true, antes: 'punteado' }],
            nota: 'Esperando respuesta del cliente. No es un turno confirmado hasta que acepte.', estados: [{ texto: 'Esperando respuesta' }, { texto: 'Aceptada', tono: 'verde' }] }),
        ].join('<div style="height:8.4px"></div>'), { pad: 20, fondo: '#F4F5F8', extra: 'padding-top:14px' }),
        pieza('propuestaChat({ estado: 1 }) «Aceptada» (40-u-chat2-4, textos de la foto) · propuestaChat() con la historia', 'chat-propuesta', [
          propuestaChat({ trabajo: 'Cambio del flexible de la pileta del baño', fecha: 'Viernes 20', horario: '10 a 12 h', mano: '$ 18.000', materiales: '$ 6.000', tarifa: '$ 1.200', total: '$ 25.200', estado: 1 }),
          propuestaChat({ lado: 'izq' }),
        ].join('<div style="height:16px"></div>'), { pad: 15, fondo: '#F4F5F8' }),
        pieza('accionesChat() · campoMensaje()', 'chat-campo',
          accionesChat({ secundarias: ['Salgo para allá', 'Llave de paso', '¿Qué timbre?'] }) + '<div style="height:14px"></div>' + campoMensaje(),
          { pad: 16 }),
        pieza('estrellas() llenas · estrellas({ llenas: 0 })', 'estrellas', `${estrellas()}<div style="height:14px"></div>${estrellas({ llenas: 0 })}`, { w: 340, pad: 20 }),
        pieza('estrellas({ llenas: 0 }) en el lugar de la foto (15-u-resena, y 600 → 700)', 'estrellas-resena',
          `<div style="position:absolute;left:54.3px;top:31.2px">${estrellas({ llenas: 0 })}</div>`, { h: 100 }),
        pieza('estrellas (demo: se llenan)', '', estrellas({ llenas: 0, className: 'ap-gal-estrellas' }), { w: 340, pad: 20 }),
      ].join('')),

      bloque('Íconos (app/iconos.ts)', [
        pieza(`${ICONOS.length} íconos`, 'iconos', `<div style="display:flex;flex-wrap:wrap;gap:14px;color:#0E1D36">${ICONOS.map(n => `<span title="${n}" style="display:flex;flex-direction:column;align-items:center;gap:4px;width:64px;font:500 9px/1.1 var(--ap-font);color:#5B6780">${icono(n, { tam: 28 })}${n}</span>`).join('')}</div>`, { w: 700, pad: 16 }),
      ].join('')),
    ].join('');

    // el aviso ya bajó en hoja-precio: la barra de estado y la isla quedan apagadas (como al final de bajarAviso)
    const avisoPrecio = root.querySelector('[data-captura="hoja-precio"] .ap-aviso-capa');
    if (avisoPrecio) gsap.set(barraDelAviso(avisoPrecio), { opacity: 0 });
    // los montos se acomodan midiendo (el + sigue al valor, como en las fotos)
    root.querySelectorAll('.ap-monto').forEach(m => acomodarMonto(m));

    // ── demo: el especialista se pone Disponible ─────────────────────────
    const demo = root.querySelector('#ap-gal-demo-disponible [data-pantalla="e-inicio"]');
    if (demo) {
      prenderInicioEspecialista(tl, demo, 1.2);
      const anillos = demo.querySelectorAll('.ap-radar-anillo[data-anillo="1"], .ap-radar-anillo[data-anillo="2"]');
      tl.fromTo(anillos, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out', stagger: 0.25 }, 1.8);
    }
    const est = root.querySelector('.ap-gal-estrellas');
    if (est) llenarEstrellas(tl, est, 1.0);
  },
};
export default seccion;
