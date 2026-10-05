/* Galería · App 2026 · especialista, segunda parte (src/handy/app/especialista-trabajo.ts): agenda, chat con el cliente,
   en camino, trabajo, fin, cobros y la reseña, cada una en el teléfono a 1:1 con data-captura="eb-…" en la pantalla de
   414×896 (para compararlas con handy-2026/especialista/pantallas/*.png), más las piezas sueltas. Demos en el timeline:
   el chat avanza (contesta y llega la respuesta), el especialista llega, el cronómetro corre y el botón se aprieta, el fin
   entra con su aviso y la reseña se llena.
   ?seccion=app2026-eb muestra solo esta sección · &t=SEGUNDOS congela las demos. */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import {
  avisoTeEligio, avisoCobro, pantallaAgendaEsp, pantallaChatCliente, ponerChatCliente, avanzarChatCliente, pantallaEnCamino,
  ponerEnCamino, llegarEnCamino, pantallaTrabajo, cronometro, correrCronometro, latirCronometro, pantallaFin, entrarFin,
  pantallaCobros, hojaResenaCliente, calificarResena, dibujoCano,
} from '../app/especialista-trabajo.ts';
import { barraDelAviso, bajarAviso, subirAviso } from '../app/ui/aviso.ts';
import { apretarBoton } from '../app/ui/botones.ts';

const bloque = (titulo: string, html: string) =>
  `<div style="flex:1 1 100%"><h3 style="margin:0 0 14px;font:700 18px/1.2 var(--hd-font);color:var(--hd-tinta)">${titulo}</h3>`
  + `<div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">${html}</div></div>`;

const muestra = (rotulo: string, html: string, estilo = '') =>
  `<figure style="margin:0;display:flex;flex-direction:column;gap:8px"><div style="position:relative;${estilo}">${html}</div>`
  + `<figcaption style="font:600 13px/1.3 var(--hd-font);color:#4A4A4A;max-width:440px">${rotulo}</figcaption></figure>`;

/** Teléfono con la pantalla; la pantalla (414×896, con la barra de estado) lleva data-captura. */
const telefono = (rotulo: string, captura: string, pantalla: string, { estado = 'oscuro', id }: { estado?: 'oscuro' | 'claro'; id?: string } = {}) =>
  muestra(rotulo, phoneFrame({ pantalla, hora: '9:41', estado, id }).replace('class="hd-pantalla"', `class="hd-pantalla"${captura ? ` data-captura="${captura}"` : ''}`),
    'width:438px;height:920px');

/** Componente suelto en una caja con data-captura. */
const pieza = (rotulo: string, captura: string, html: string, { w = 414, h, fondo = '#FFFFFF', pad = 0, extra = '' }: { w?: number; h?: number; fondo?: string; pad?: number; extra?: string } = {}) =>
  muestra(rotulo, `<div class="ap-ui"${captura ? ` data-captura="${captura}"` : ''} style="position:relative;width:${w}px;${h ? `height:${h}px;` : ''}background:${fondo};padding:${pad}px;box-sizing:border-box;overflow:hidden;${extra}">${html}</div>`);

const seccion: Seccion = {
  id: 'app2026-eb',
  titulo: 'App 2026 · especialista: agenda, chat, camino, trabajo, fin y cobro',
  render(root, tl) {
    root.innerHTML = [
      bloque('Pantallas (1:1, 414×896 dentro del marco de 438×920)', [
        telefono('eb-agenda · pantallaAgendaEsp() = 20/21-e-turnos', 'eb-agenda', pantallaAgendaEsp()),
        telefono('eb-chat-0 · pantallaChatCliente({ paso: 0 }) + avisoTeEligio() = 11-e-chat', 'eb-chat-0', pantallaChatCliente({ paso: 0 }) + avisoTeEligio()),
        telefono('eb-chat-0-sin-aviso · pantallaChatCliente({ paso: 0 })', 'eb-chat-0-sin-aviso', pantallaChatCliente({ paso: 0 })),
        telefono('eb-chat-1 · pantallaChatCliente({ paso: 1 })', 'eb-chat-1', pantallaChatCliente({ paso: 1 })),
        telefono('eb-chat · pantallaChatCliente() = 12-e-chat-2', 'eb-chat', pantallaChatCliente()),
        telefono("eb-camino · pantallaEnCamino() = 14-e-en-camino-2 (sin SIMULAR)", 'eb-camino', pantallaEnCamino(), { estado: 'claro' }),
        telefono("eb-camino-llegaste · pantallaEnCamino({ estado: 'llegaste' })", 'eb-camino-llegaste', pantallaEnCamino({ estado: 'llegaste' }), { estado: 'claro' }),
        telefono('eb-trabajo · pantallaTrabajo() = 15-e-trabajo', 'eb-trabajo', pantallaTrabajo()),
        telefono('eb-trabajo-apretado · pantallaTrabajo({ segundos: 12, apretado: true })', 'eb-trabajo-apretado', pantallaTrabajo({ segundos: 12, apretado: true })),
        telefono('eb-fin · pantallaFin() + avisoCobro() = 19-e-fin', 'eb-fin', pantallaFin() + avisoCobro()),
        telefono('eb-fin-sin-aviso · pantallaFin()', 'eb-fin-sin-aviso', pantallaFin()),
        telefono('eb-cobros · pantallaCobros() = 41-e-caja', 'eb-cobros', pantallaCobros()),
        telefono('eb-resena · hojaResenaCliente() sobre pantallaFin() (estilo 16-u-resena-2)', 'eb-resena', pantallaFin() + hojaResenaCliente()),
      ].join('')),

      bloque('Demos (timeline: ?t=SEGUNDOS)', [
        telefono('chat: aviso «te eligió» baja (0,4 s) y sube (2,2 s) · paso 1 (2,8 s) · paso 2 (4,4 s)', 'eb-demo-chat', pantallaChatCliente({ paso: 0 }) + avisoTeEligio(), { id: 'ap-eb-demo-chat' }),
        telefono('en camino → llegaste (1 s → 2,85 s)', 'eb-demo-camino', pantallaEnCamino(), { estado: 'claro', id: 'ap-eb-demo-camino' }),
        telefono('trabajo: cronómetro 00:01 → 01:05 acelerado (0,5 → 4,7 s), «Terminar trabajo» apretado (5 s)', 'eb-demo-trabajo', pantallaTrabajo(), { id: 'ap-eb-demo-trabajo' }),
        telefono('fin: entrarFin (0,4 s) + avisoCobro baja (1,8 s)', 'eb-demo-fin', pantallaFin() + avisoCobro(), { id: 'ap-eb-demo-fin' }),
        telefono('reseña: calificarResena (0,5 s → ≈ 2,6 s)', 'eb-demo-resena', pantallaFin() + hojaResenaCliente({ llenas: 0 }), { id: 'ap-eb-demo-resena' }),
      ].join('')),

      bloque('Piezas sueltas', [
        pieza('cronometro({ segundos: 1 }) · ({ segundos: 12 }) · ({ segundos: 659 })', 'eb-crono',
          `<div style="position:relative;height:56px">${[1, 12, 659].map((s, i) => cronometro({ segundos: s }).replace('class="ap-eb-crono"', `class="ap-eb-crono" style="left:${12 + i * 96}px;top:9px"`)).join('')}</div>`,
          { w: 310 }),
        pieza('dibujoCano() (la foto del caño) a 158,4 y a 98,6', 'eb-cano', `<div style="display:flex;gap:16px;align-items:flex-end;padding:12px">${dibujoCano()}${dibujoCano({ ancho: 98.6 })}</div>`, { w: 300 }),
      ].join('')),
    ].join('');

    // avisos ya bajados: la barra de estado y la isla quedan apagadas (como al final de bajarAviso)
    for (const c of ['eb-chat-0', 'eb-fin']) {
      const av = root.querySelector(`[data-captura="${c}"] .ap-aviso-capa`);
      if (av) gsap.set(barraDelAviso(av), { opacity: 0 });
    }

    const demo = (id: string, sel: string) => root.querySelector(`#${id} ${sel}`);

    // chat: baja el aviso, se va, el especialista contesta y el cliente responde
    const chat = demo('ap-eb-demo-chat', '[data-pantalla="e-chat-cliente"]');
    const avisoChat = demo('ap-eb-demo-chat', '.ap-aviso-capa');
    if (chat && avisoChat) {
      ponerChatCliente(chat, 0);
      gsap.set(avisoChat.querySelector('.ap-aviso'), { y: -110 });
      bajarAviso(tl, avisoChat, 0.4);
      subirAviso(tl, avisoChat, 2.2);
      avanzarChatCliente(tl, chat, 1, 2.8);
      avanzarChatCliente(tl, chat, 2, 4.4);
    }

    // en camino → llegaste
    const camino = demo('ap-eb-demo-camino', '[data-pantalla="e-en-camino"]');
    if (camino) {
      ponerEnCamino(camino, 'camino');
      llegarEnCamino(tl, camino, 1);
    }

    // trabajo: el cronómetro corre acelerado, el punto late y se aprieta «Terminar trabajo»
    const trabajo = demo('ap-eb-demo-trabajo', '[data-pantalla="e-trabajo"]');
    if (trabajo) {
      const crono = trabajo.querySelector('.ap-eb-crono')!;
      correrCronometro(tl, crono, 1, 65, 0.5, { paso: 0.065 });
      latirCronometro(tl, crono, 0.5, { veces: 5 });
      const terminar = trabajo.querySelector('[data-accion="terminar-trabajo"]');
      if (terminar) apretarBoton(tl, terminar, 5);
    }

    // fin: entrada + aviso de cobro
    const fin = demo('ap-eb-demo-fin', '[data-pantalla="e-fin"]');
    const avisoFin = demo('ap-eb-demo-fin', '.ap-aviso-capa');
    if (fin && avisoFin) {
      gsap.set(avisoFin.querySelector('.ap-aviso'), { y: -110 });
      entrarFin(tl, fin, 0.4);
      bajarAviso(tl, avisoFin, 1.8);
    }

    // reseña
    const resena = demo('ap-eb-demo-resena', '[data-pantalla="hoja-resena-cliente"]');
    if (resena) {
      gsap.set(resena.querySelector('.ap-hoja'), { y: 820 });
      gsap.set(resena.querySelector('.ap-velo'), { opacity: 0 });
      calificarResena(tl, resena, 0.5);
    }
  },
};
export default seccion;
