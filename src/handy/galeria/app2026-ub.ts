/* Galería · App 2026 · usuario: propuestas y confirmación (app/usuario-propuestas.ts). ?seccion=app2026-ub
   Cada pantalla va dentro del teléfono a 1:1 con data-captura="ub-…" en la pantalla de 414×896 (galeria.mjs del
   scratchpad guarda una PNG por pieza para compararla con handy-2026/usuario/pantallas/05, 06, 09 y 10). Abajo, las
   piezas sueltas (la tarjeta de propuesta también fuera del teléfono, escalada) y una demo en el timeline (ub-demo):
   llegan las tres propuestas (0,4 · 1,2 · 2), la lista baja y sube (2,8 → 4,6), Elegir en E1 y su anillo (4,8), entra
   Confirmá el turno (5,7), se cruza la forma de pago (6,6 · 7,1), se aprieta Confirmar turno (7,7) y baja el aviso
   «Turno confirmado» (8,1). &t=SEGUNDOS congela la demo. */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import { barraDelAviso, bajarAviso } from '../app/ui/aviso.ts';
import {
  pantallaPropuestas, pantallaPerfil, pantallaConfirmar, tarjetaPropuesta, avisoTurnoConfirmado, avisoPropuesta,
  elegirPropuesta, apretarEnTarjeta, llegaPropuesta, desplazarPropuestas, apretarConfirmar, elegirPago,
} from '../app/usuario-propuestas.ts';

const bloque = (titulo: string, html: string) =>
  `<div style="flex:1 1 100%"><h3 style="margin:0 0 14px;font:700 18px/22px var(--hd-font);color:var(--hd-tinta)">${titulo}</h3>`
  + `<div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">${html}</div></div>`;

const muestra = (rotulo: string, html: string, estilo = '') =>
  `<figure style="margin:0;display:flex;flex-direction:column;gap:8px"><div style="position:relative;${estilo}">${html}</div>`
  + `<figcaption style="font:600 13px/17px var(--hd-font);color:#4A4A4A;max-width:440px">${rotulo}</figcaption></figure>`;
// (alturas enteras en títulos y epígrafes: así cada teléfono cae en px enteros y la captura no se corre medio px)

/** Teléfono con la pantalla; la pantalla (414×896, con la barra de estado) lleva data-captura. */
const telefono = (rotulo: string, captura: string, pantalla: string, id?: string) =>
  muestra(rotulo, phoneFrame({ pantalla, hora: '9:41', id }).replace('class="hd-pantalla"', `class="hd-pantalla"${captura ? ` data-captura="${captura}"` : ''}`),
    'width:438px;height:920px');

/** Pieza suelta en una caja con data-captura. */
const pieza = (rotulo: string, captura: string, html: string, { w = 414, h, fondo = '#FFFFFF', pad = 0, extra = '' }: { w?: number; h?: number; fondo?: string; pad?: number; extra?: string } = {}) =>
  muestra(rotulo, `<div class="ap-ui"${captura ? ` data-captura="${captura}"` : ''} style="position:relative;width:${w}px;${h ? `height:${h}px;` : ''}background:${fondo};padding:${pad}px;box-sizing:border-box;overflow:hidden;${extra}">${html}</div>`);

const seccion: Seccion = {
  id: 'app2026-ub',
  titulo: 'App 2026 · usuario: propuestas y confirmación',
  render(root, tl) {
    root.innerHTML = [
      bloque('Pantallas (1:1, 414×896 dentro del marco de 438×920)', [
        telefono('ub-propuestas · pantallaPropuestas() + avisoPropuesta({ especialista: 3 }) = 05-u-presupuestos', 'ub-propuestas',
          pantallaPropuestas() + avisoPropuesta({ especialista: 3 })),
        telefono('ub-perfil · pantallaPerfil() = 06-u-perfil', 'ub-perfil', pantallaPerfil()),
        telefono('ub-confirmar · pantallaConfirmar() = 09-u-confirmar', 'ub-confirmar', pantallaConfirmar()),
        telefono('ub-aviso-confirmado · avisoTurnoConfirmado() sobre 09 (el aviso de 10-u-seguimiento)', 'ub-aviso-confirmado',
          pantallaConfirmar() + avisoTurnoConfirmado()),
      ].join('')),

      bloque('Estados (capas cruzadas con opacity)', [
        telefono('pantallaPropuestas({ cuantas: 1, elegida: 0 }) · llegó la primera', 'ub-propuestas-1', pantallaPropuestas({ cuantas: 1, elegida: 0 })),
        telefono("pantallaPropuestas({ apretado: 'elegir' }) · Elegir apretado", 'ub-propuestas-elegir', pantallaPropuestas({ apretado: 'elegir' })),
        telefono('pantallaPropuestas({ desplazar: −470 }) · la lista subida (E2 y E3)', 'ub-propuestas-bajada', pantallaPropuestas({ elegida: 0, desplazar: -470 })),
        telefono('pantallaPerfil({ apretado: true })', 'ub-perfil-apretado', pantallaPerfil({ apretado: true })),
        telefono("pantallaConfirmar({ pago: 'ahora', apretado: true })", 'ub-confirmar-apretado', pantallaConfirmar({ pago: 'ahora', apretado: true })),
      ].join('')),

      bloque('Tarjeta de propuesta suelta (anda fuera del teléfono)', [
        pieza('tarjetaPropuesta({ especialista: 1, elegida: true })', 'ub-tarjeta-1',
          tarjetaPropuesta({ especialista: 1, elegida: true }), { h: 540, fondo: '#1F57A8', extra: 'padding-top:16px;padding-left:23.6px' }),
        pieza('tarjetaPropuesta({ especialista: 2 })', 'ub-tarjeta-2', tarjetaPropuesta({ especialista: 2 }), { h: 540, fondo: '#1F57A8', extra: 'padding-top:16px;padding-left:23.6px' }),
        pieza("tarjetaPropuesta({ especialista: 3, apretado: 'perfil' })", 'ub-tarjeta-3', tarjetaPropuesta({ especialista: 3, apretado: 'perfil' }), { h: 540, fondo: '#1F57A8', extra: 'padding-top:16px;padding-left:23.6px' }),
        pieza('tarjetaPropuesta() escalada ×1,5 sobre el fondo del tráiler (para volar fuera del teléfono)', 'ub-tarjeta-grande',
          `<div style="position:absolute;left:40px;top:30px;transform:scale(1.5);transform-origin:0 0">${tarjetaPropuesta({ especialista: 1, elegida: true })}</div>`,
          { w: 640, h: 830, fondo: '#F2EEE6' }),
      ].join('')),

      bloque('Demo (timeline)', [
        telefono('ub-demo · llegan 3 → baja y sube la lista → Elegir → Confirmá el turno → pago → Confirmar → aviso', 'ub-demo',
          pantallaPropuestas({ cuantas: 0, elegida: 0 }) + pantallaConfirmar() + avisoTurnoConfirmado(), 'ap-ub-demo'),
      ].join('')),
    ].join('');

    // el aviso de 05 ya bajó: la barra de estado y la isla quedan apagadas (como al final de bajarAviso)
    for (const c of ['ub-propuestas', 'ub-aviso-confirmado']) {
      const capa = root.querySelector(`[data-captura="${c}"] .ap-aviso-capa`);
      if (capa) gsap.set(barraDelAviso(capa), { opacity: 0 });
    }

    // ── demo ─────────────────────────────────────────────────────────────
    const demo = root.querySelector('#ap-ub-demo');
    if (!demo) return;
    const props = demo.querySelector('[data-pantalla="u-propuestas"]')!;
    const conf = demo.querySelector('[data-pantalla="u-confirmar"]')!;
    const avisoCapa = demo.querySelector('.ap-aviso-capa')!;
    gsap.set(conf, { x: 414 });
    gsap.set(avisoCapa.querySelector('.ap-aviso'), { y: -110 });
    let t = 0.4;
    for (const n of [1, 2, 3] as const) { llegaPropuesta(tl, props, n, t); t += 0.8; }
    desplazarPropuestas(tl, props, t, { y: -560 }); t += 1.1;
    desplazarPropuestas(tl, props, t, { y: 0 }); t += 0.9;
    const e1 = props.querySelector('.ap-ub-tarjeta[data-especialista="1"]')!;
    apretarEnTarjeta(tl, e1, 'elegir', t); t += 0.2;
    elegirPropuesta(tl, e1, t); t += 0.7;
    tl.to(conf, { x: 0, duration: 0.5, ease: 'power3.out' }, t);
    tl.to(props, { x: -120, duration: 0.5, ease: 'power3.out' }, t); t += 0.9;
    elegirPago(tl, conf, 'ahora', t); t += 0.5;
    elegirPago(tl, conf, 'final', t); t += 0.6;
    apretarConfirmar(tl, conf, t); t += 0.4;
    bajarAviso(tl, avisoCapa, t); t += 1.6;
    tl.set({}, {}, t);
  },
};
export default seccion;
