/* Galería · App 2026 · usuario: seguimiento, chat, trabajo terminado, reseña y agenda (app/usuario-seguimiento.ts).
   Cada pantalla va en el teléfono a 1:1 con data-captura="uc-…" en la pantalla de 414×896, para compararla con su foto
   de handy-2026/usuario/pantallas (galeria.mjs del scratchpad guarda una PNG por pieza), y las piezas sueltas.
   Demos en el timeline: el seguimiento pasa de confirmado a en camino (el especialista recorre la ruta) y a llegó; el
   chat recibe sus mensajes; el usuario paga; la reseña se llena (estrellas de a una, chips) y agradece.
   ?seccion=app2026-uc muestra solo esta sección · &t=SEGUNDOS congela las demos. */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import {
  pantallaSeguimiento, ponerSeguimiento, cambiarSeguimiento, moverPorRuta, rutaDelta, avisoSalio,
  pantallaChat, MENSAJES_CHAT, recibirMensaje, pantallaTerminado, avisoTerminado, avisoPagaste, pagar, ilustracionFin,
  hojaResena, ponerResena, cambiarResena, avisoGracias, pantallaAgendaUsuario,
} from '../app/usuario-seguimiento.ts';
import { aviso, barraDelAviso, bajarAviso, subirAviso } from '../app/ui/aviso.ts';
import { llenarEstrellas } from '../app/ui/estrellas.ts';
import { elegirChip } from '../app/ui/chips.ts';
import { apretarBoton } from '../app/ui/botones.ts';

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

/** Componente suelto en una caja con data-captura. */
const pieza = (rotulo: string, captura: string, html: string, { w = 414, h, fondo = '#FFFFFF', pad = 0, extra = '' }: { w?: number; h?: number; fondo?: string; pad?: number; extra?: string } = {}) =>
  muestra(rotulo, `<div class="ap-ui"${captura ? ` data-captura="${captura}"` : ''} style="position:relative;width:${w}px;${h ? `height:${h}px;` : ''}background:${fondo};padding:${pad}px;box-sizing:border-box;overflow:hidden;${extra}">${html}</div>`);

const avisoConfirmado = () => aviso({ titulo: 'Turno confirmado', detalle: 'Especialista 1 · Hoy · 16 a 18 h', icono: 'tilde', tono: 'verde', dato: 'confirmado' });

const seccion: Seccion = {
  id: 'app2026-uc',
  titulo: 'App 2026 · usuario: seguimiento, chat, fin y reseña',
  render(root, tl) {
    root.innerHTML = [
      bloque('Seguimiento (10/11-u-seguimiento) · phoneFrame({ estado: "claro" })', [
        telefono("uc-seguimiento · pantallaSeguimiento() + aviso «Turno confirmado» = 10-u-seguimiento", 'uc-seguimiento', pantallaSeguimiento() + avisoConfirmado(), 'claro'),
        telefono("uc-seguimiento-2 · pantallaSeguimiento({ estado: 'en-camino' }) + avisoSalio() = 11-u-seguimiento-2", 'uc-seguimiento-2', pantallaSeguimiento({ estado: 'en-camino' }) + avisoSalio(), 'claro'),
        telefono("uc-seguimiento-3 · pantallaSeguimiento({ estado: 'llego' }) (sin foto)", 'uc-seguimiento-3', pantallaSeguimiento({ estado: 'llego' }), 'claro'),
        telefono('demo (timeline): confirmado → en camino (ruta) → llegó', '', pantallaSeguimiento() + avisoSalio(), 'claro', 'ap-uc-demo-seg'),
      ].join('')),

      bloque('Chat (12-u-chat)', [
        telefono('uc-chat · pantallaChat() = 12-u-chat', 'uc-chat', pantallaChat()),
        telefono('demo (timeline): los mensajes entran de a uno', '', pantallaChat(), 'oscuro', 'ap-uc-demo-chat'),
      ].join('')),

      bloque('Trabajo terminado (13/14-u-terminado)', [
        telefono('uc-terminado · pantallaTerminado() + avisoTerminado() = 13-u-terminado', 'uc-terminado', pantallaTerminado() + avisoTerminado()),
        telefono('uc-terminado-2 · pantallaTerminado({ pagado: true }) + avisoPagaste() = 14-u-terminado-2', 'uc-terminado-2', pantallaTerminado({ pagado: true }) + avisoPagaste()),
        telefono('demo (timeline): pagar()', '', pantallaTerminado() + avisoPagaste(), 'oscuro', 'ap-uc-demo-pagar'),
      ].join('')),

      bloque('Reseña (15/16/17-u-resena) · sobre pantallaTerminado({ pagado: true })', [
        telefono("uc-resena · hojaResena() = 15-u-resena", 'uc-resena', pantallaTerminado({ pagado: true }) + hojaResena()),
        telefono("uc-resena-2 · hojaResena({ estado: 'llena' }) = 16-u-resena-2", 'uc-resena-2', pantallaTerminado({ pagado: true }) + hojaResena({ estado: 'llena' })),
        telefono("uc-resena-3 · hojaResena({ estado: 'gracias' }) + avisoGracias() = 17-u-resena-3", 'uc-resena-3', pantallaTerminado({ pagado: true }) + hojaResena({ estado: 'gracias' }) + avisoGracias()),
        telefono('demo (timeline): vacía → estrellas → chips → enviar → gracias', '', pantallaTerminado({ pagado: true }) + hojaResena() + avisoGracias(), 'oscuro', 'ap-uc-demo-resena'),
      ].join('')),

      bloque('Agenda (18-u-turnos)', [
        telefono('uc-agenda · pantallaAgendaUsuario() = 18-u-turnos', 'uc-agenda', pantallaAgendaUsuario()),
      ].join('')),

      bloque('Piezas sueltas', [
        pieza('avisoSalio() · avisoTerminado() · avisoPagaste() · avisoGracias() (capa: el aviso arriba)', 'uc-avisos',
          [avisoSalio(), avisoTerminado(), avisoPagaste(), avisoGracias()].map(a => `<div style="position:relative;height:100px">${a.replace('hd-capa ap-aviso-capa', 'ap-aviso-capa').replace(/class="ap-aviso-capa ap-ui"/, 'class="ap-aviso-capa ap-ui" style="height:100px"')}</div>`).join(''),
          { fondo: '#5F6B84' }),
        pieza('ilustracionFin() (los Handys de handys.ts y el tilde)', 'uc-ilustracion', `<div style="position:relative;height:200px">${ilustracionFin({ estilo: 'left:42px;top:6px' })}</div>`),
      ].join('')),
    ].join('');

    // los avisos quietos ya bajaron: la barra de estado y la isla quedan apagadas (como al final de bajarAviso)
    root.querySelectorAll('[data-captura] .ap-aviso-capa').forEach(a => gsap.set(barraDelAviso(a), { opacity: 0 }));

    // ── demo: seguimiento ───────────────────────────────────────────────
    const seg = root.querySelector('#ap-uc-demo-seg [data-pantalla="u-seguimiento"]');
    const avSalio = root.querySelector('#ap-uc-demo-seg .ap-aviso-capa');
    if (seg && avSalio) {
      ponerSeguimiento(seg, 'confirmado');
      gsap.set(avSalio.querySelector('.ap-aviso'), { y: -110 });
      const esp = seg.querySelector('.ap-uc-seg-esp');
      tl.set(esp, { ...rutaDelta(0) }, 0);
      cambiarSeguimiento(tl, seg, 'en-camino', 1.0);
      bajarAviso(tl, avSalio, 1.0);
      tl.fromTo(esp, { scale: 0.4 }, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, 1.0);
      moverPorRuta(tl, seg, 1.6, { dur: 2.6 });
      subirAviso(tl, avSalio, 3.2);
      cambiarSeguimiento(tl, seg, 'llego', 4.3);
      tl.fromTo(seg.querySelector('.ap-uc-seg-casa svg'), { scale: 0.5 }, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, 4.3);
    }

    // ── demo: chat ──────────────────────────────────────────────────────
    const chat = root.querySelector('#ap-uc-demo-chat [data-pantalla="u-chat"]');
    if (chat) {
      MENSAJES_CHAT.forEach((m, i) => recibirMensaje(tl, chat, m.id, 0.8 + i * 0.7));
    }

    // ── demo: pagar ─────────────────────────────────────────────────────
    const fin = root.querySelector('#ap-uc-demo-pagar [data-pantalla="u-terminado"]');
    const avPago = root.querySelector('#ap-uc-demo-pagar .ap-aviso-capa');
    if (fin && avPago) {
      gsap.set(avPago.querySelector('.ap-aviso'), { y: -110 });
      apretarBoton(tl, fin.querySelector('.ap-boton[data-accion="pagar"]')!, 1.0);
      pagar(tl, fin, 1.3);
      bajarAviso(tl, avPago, 1.6);
      subirAviso(tl, avPago, 4.2);
    }

    // ── demo: reseña ────────────────────────────────────────────────────
    const res = root.querySelector('#ap-uc-demo-resena [data-pantalla="hoja-resena"]');
    const avGracias = root.querySelector('#ap-uc-demo-resena .ap-aviso-capa');
    if (res && avGracias) {
      gsap.set(avGracias.querySelector('.ap-aviso'), { y: -110 });
      ponerResena(res, 'vacia');
      cambiarResena(tl, res, 'llena', 1.0, 0.55);
      llenarEstrellas(tl, res.querySelector('.ap-estrellas')!, 1.1, { paso: 0.14 });
      ['Puntual', 'Explicó todo', 'Buen trato'].forEach((c, i) => elegirChip(tl, res.querySelector(`.ap-chip[data-chip="${c}"]`)!, 2.2 + i * 0.35));
      apretarBoton(tl, res.querySelector('.ap-boton[data-accion="enviar"]')!, 3.5);
      cambiarResena(tl, res, 'gracias', 3.8, 0.6);
      tl.fromTo(res.querySelector('.ap-uc-resena-tilde'), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, 4.2);
      bajarAviso(tl, avGracias, 4.1);
    }
  },
};
export default seccion;
