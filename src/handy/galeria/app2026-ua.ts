/* Galería · App 2026 · usuario: el pedido (src/handy/app/usuario-pedido.ts). ?seccion=app2026-ua
   Las pantallas en el estado de la foto (para compararlas con handy-2026/usuario/pantallas: ua-opciones = 02,
   ua-describir = 03, ua-buscando = 04, ua-programar-27 / -29 = 27 / 29), los estados de la historia, las piezas sueltas
   y las demos en el timeline: la hoja sube, las opciones caen en cascada, se aprieta Urgencia y la hoja se cierra; el
   texto se tipea; llegan las tres propuestas (0/3 → 3/3, con sus avisos); se programa HOY 17 · Tarde 16 a 18 h.
   Cada pantalla de 414×896 lleva data-captura="ua-…" (galeria.mjs del scratchpad guarda una PNG por pieza).
   &t=SEGUNDOS congela las demos (opciones 0–3 s · texto 0,5–3 s · propuestas 0,4–6,4 s · programar 0,5–2,4 s). */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import { pantallaInicioUsuario } from '../app/usuario.ts';
import {
  hojaParaCuando, cascadaOpciones, apretarOpcion, cerrarHoja, pantallaDescribir, escribirTexto, pantallaProgramar,
  elegirFranja, elegirDiaTira, cambiarPie, pantallaBuscando, llegarPropuesta, latirRadar, menearLupa, avisoPropuesta,
} from '../app/usuario-pedido.ts';
import { botonVolver, cabeceraPaso } from '../app/ui/ua-paso.ts';
import { subirHoja } from '../app/ui/hoja.ts';
import { bajarAviso, subirAviso, barraDelAviso } from '../app/ui/aviso.ts';
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

const seccion: Seccion = {
  id: 'app2026-ua',
  titulo: 'App 2026 · usuario: el pedido',
  render(root, tl) {
    const foto27 = { dia: -1, otraFecha: 'Martes 24/11' } as const;
    root.innerHTML = [
      bloque('Como en las fotos (1:1, 414×896 dentro del marco de 438×920)', [
        telefono('ua-opciones · pantallaInicioUsuario() + hojaParaCuando() = 02-u-opciones', 'ua-opciones',
          pantallaInicioUsuario() + hojaParaCuando()),
        telefono('ua-describir · pantallaDescribir() = 03-u-describir', 'ua-describir', pantallaDescribir()),
        telefono('ua-buscando · pantallaBuscando({ n: 1 }) + avisoPropuesta(1) = 04-u-buscando', 'ua-buscando',
          pantallaBuscando({ n: 1 }) + avisoPropuesta(1), 'claro'),
        telefono("ua-programar-27 · pantallaProgramar({ dia: -1, otraFecha: 'Martes 24/11' }) = 27-u-programar", 'ua-programar-27',
          pantallaProgramar(foto27)),
        telefono("ua-programar-29 · pantallaProgramar({ dia: -1, franja: -1, otraFecha, otraHora: '08:00 h' }) = 29-u-programar-2", 'ua-programar-29',
          pantallaProgramar({ ...foto27, franja: -1, otraHora: '08:00 h' })),
      ].join('')),

      bloque('Estados de la historia', [
        telefono('ua-programar · pantallaProgramar() (HOY 17 · Tarde 16 a 18 h)', 'ua-programar', pantallaProgramar()),
        telefono("ua-opciones-libre · hojaParaCuando({ apretada: false })", 'ua-opciones-libre',
          pantallaInicioUsuario() + hojaParaCuando({ apretada: false })),
        ...([0, 1, 2, 3] as const).map(n => telefono(`ua-buscando-${n} · pantallaBuscando({ n: ${n} })`, `ua-buscando-${n}`, pantallaBuscando({ n }), 'claro')),
        telefono('ua-buscando-aviso-3 · pantallaBuscando({ n: 3 }) + avisoPropuesta(3)', 'ua-buscando-aviso-3',
          pantallaBuscando({ n: 3 }) + avisoPropuesta(3), 'claro'),
      ].join('')),

      bloque('Piezas sueltas', [
        ...([1, 2, 3] as const).map(n => pieza(`avisoPropuesta(${n}, { capa: false })`, `ua-aviso-${n}`,
          avisoPropuesta(n, { capa: false }), { h: 100, fondo: '#5F6B84' })),
        pieza("botonVolver() · botonVolver({ tono: 'blanco' })", 'ua-volver',
          `<div style="position:relative;height:72px">${botonVolver({ estilo: 'left:20px;top:10px' })}${botonVolver({ tono: 'blanco', estilo: 'left:90px;top:10px' })}</div>`,
          { w: 170, fondo: '#E6E9EE' }),
        pieza("cabeceraPaso({ titulo: 'Programá el turno', bajada: 'Plomería · Programado', icono: 'canilla' })", 'ua-cabecera',
          `<div style="position:absolute;left:0;top:-120px;width:414px;height:896px">${cabeceraPaso({ titulo: 'Programá el turno', bajada: 'Plomería · Programado', icono: 'canilla' })}</div>`,
          { h: 80 }),
      ].join('')),

      bloque('Demos (timeline: ?t=SEGUNDOS)', [
        telefono('demo: sube la hoja, cascada, aprieta Urgencia, se cierra (0–3 s)', 'ua-demo-opciones',
          pantallaInicioUsuario() + hojaParaCuando({ apretada: false }), 'oscuro', 'ap-ua-demo-opciones'),
        telefono('demo: escribirTexto (0,5–3 s)', 'ua-demo-texto', pantallaDescribir(), 'oscuro', 'ap-ua-demo-texto'),
        telefono('demo: llegan las propuestas 0/3 → 3/3 con sus avisos (0,4–6,4 s)', 'ua-demo-buscando',
          pantallaBuscando({ n: 0 }) + avisoPropuesta(1) + avisoPropuesta(2) + avisoPropuesta(3), 'claro', 'ap-ua-demo-buscando'),
        telefono('demo: elegirDiaTira + elegirFranja + cambiarPie + Siguiente (0,5–2,4 s)', 'ua-demo-programar',
          pantallaProgramar({ dia: -1, franja: -1, pies: ['Elegí el día y la franja', 'Martes 17/11', 'Martes 17/11 · 16 a 18 h'], actual: 0 }),
          'oscuro', 'ap-ua-demo-programar'),
      ].join('')),
    ].join('');

    // avisos quietos en pantalla: la barra de estado y la isla quedan apagadas (como al final de bajarAviso)
    for (const c of ['ua-buscando', 'ua-buscando-aviso-3']) {
      const a = root.querySelector(`[data-captura="${c}"] .ap-aviso-capa`);
      if (a) gsap.set(barraDelAviso(a), { opacity: 0 });
    }

    // ── demo: la hoja "¿Para cuándo lo necesitás?" ─────────────────────────
    const dOp = root.querySelector('#ap-ua-demo-opciones [data-pantalla="hoja-para-cuando"]');
    if (dOp) {
      subirHoja(tl, dOp, 0.3);
      cascadaOpciones(tl, dOp, 0.55);
      apretarOpcion(tl, dOp, 'urgencia', 1.7);
      cerrarHoja(tl, dOp, 2.3);
    }

    // ── demo: el texto se tipea ────────────────────────────────────────────
    const dTx = root.querySelector('#ap-ua-demo-texto [data-pantalla="u-describir"]');
    if (dTx) {
      escribirTexto(tl, dTx, 0.5, { porPalabra: 0.15 });
      apretarBoton(tl, dTx.querySelector('[data-accion="pedir-presupuestos"]')!, 2.75);
    }

    // ── demo: llegan las propuestas ────────────────────────────────────────
    const dBu = root.querySelector('#ap-ua-demo-buscando [data-pantalla="u-buscando"]');
    if (dBu) {
      const avisos = [...root.querySelectorAll('#ap-ua-demo-buscando .ap-aviso-capa .ap-aviso')];
      avisos.forEach(a => gsap.set(a, { y: -110 }));
      latirRadar(tl, dBu, 0, { veces: 5 });
      menearLupa(tl, dBu, 0, 0.2, { dur: 1.2 });
      ([1, 2, 3] as const).forEach((n, i) => {
        const at = 0.6 + i * 1.9;
        bajarAviso(tl, avisos[i], at);
        llegarPropuesta(tl, dBu, n, at + 0.25);
        subirAviso(tl, avisos[i], at + 1.4);
      });
      menearLupa(tl, dBu, 1, 1.5, { dur: 1.2 });
      menearLupa(tl, dBu, 2, 3.4, { dur: 1.2 });
    }

    // ── demo: programar ────────────────────────────────────────────────────
    const dPr = root.querySelector('#ap-ua-demo-programar [data-pantalla="u-programar"]');
    if (dPr) {
      elegirDiaTira(tl, dPr, 0, 0.5);
      cambiarPie(tl, dPr, 1, 0.55);
      elegirFranja(tl, dPr, 4, 1.2);
      cambiarPie(tl, dPr, 2, 1.25);
      apretarBoton(tl, dPr.querySelector('[data-accion="siguiente"]')!, 2.0);
    }
  },
};
export default seccion;
