/* HANDY · App de usuario — el tráiler (70 s, escenario 4:3 de 1440×1080 para iPad), cortado como un spot.
   Nueve escenas de la primera versión (escenas-a … escenas-d, escritas para 90 s) corren 1,6 veces más rápido con
   'hdr-corte' (js/corte.js), en el pulso de un pop a 96 BPM; entre ellas, golpes de palabras ('hdr-golpe') y un final
   con los Handys bailando ('hdr-final'). El cierre de la primera versión ('hd-cierre') no se usa.
   Todo está escrito a 120 BPM y corre LENTO = 1,25 veces más lento (js/partitura.js): las escenas de la primera
   versión con k = 0,5 × LENTO (cada tiempo suyo cae en una corchea), las de este tráiler con k = LENTO, y la partitura
   con sus tiempos × LENTO. Para cambiar el ritmo de toda la película alcanza con cambiar LENTO.
   Reglas de contenido (STORYBOARD.md): voseo, seis rubros, $ 45.000, verificados, 5 %.
   Cada escena declara su `dur`: src/handy/player.ts corta el build si la receta devuelve otra. */

import { PARTITURA, LENTO } from './partitura.js';

// URL del QR del final. Vacía = solo el texto, centrado. En desarrollo, ?qr=<url> la pisa.
const QR_URL = '';

/** las escenas de la primera versión: al doble, por LENTO */
const K = 0.5 * LENTO;
/** segundos escritos a 120 BPM → segundos de la película */
const L = t => t * LENTO;
/** una escena por 'hdr-corte': dura (hasta ?? base) × k */
const corte = (de, base, op = {}) => {
  const k = op.k ?? K;
  return { type: 'hdr-corte', de, base, k, ...op, dur: +((op.hasta ?? base) * k).toFixed(6) };
};

Trailer.run({
  stage: { w: 1440, h: 1080 },
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'Handy', subtitle: 'App de usuario', hud: 'HANDY',
    pageTitle: 'Handy — App de usuario', back: '../../index.html',
  },
  ui: {
    play: 'Tocá para empezar', seconds: 'segundos', sound: 'con sonido', replay: 'Ver de nuevo', back: 'Volver',
    keys: 'Tocá la pantalla para pausar', paused: 'En pausa', soundOn: 'Sonido activado', soundOff: 'Sin sonido',
    particles: '',
  },
  palette: {
    night: '#CFCFCF', ink: '#141414', paper: '#FFFFFF',
    accents: ['#1F57A8', '#2F6BFF', '#F5F59A', '#4A72B0', '#8EC5FF', '#9C9C9C'],
  },
  fonts: { display: 'Inter', mono: 'Inter', serif: 'Inter', stretch: false },
  qrUrl: QR_URL,

  // la partitura: js/partitura.js (estilos en js/recipes-music.js)
  music: PARTITURA,

  // 3,75 + 6,25 + 5 + 6,25 + 6,25 + 2,5 + 7,5 + 5 + 7,5 + 2,5 + 5 + 12,5 = 70 s
  scenes: [
    // ── el problema, en frío (0–10)
    corte('hd-gancho', 8, { id: 'gancho', titulo: 'Gancho', hasta: 6 }),                                     //  0–3,75
    corte('hd-problema', 10, { id: 'problema', titulo: 'Problema' }),                                        //  3,75–10
    // ── DROP 1: Handy (10–15). Pega con un destello amarillo a pantalla completa mientras los Handys entran saltando
    corte('hd-entrada', 8, { id: 'entrada', titulo: 'Handy', destello: { pico: 1, color: '#F8FFA0', dur: L(0.45) } }), // 10–15
    // ── la app (15–27,5). En inicio la cámara entra a los rubros (16,56) y baja a los accesos (17,66), donde las fichas
    //    se levantan una por semicorchea, y vuelve (18,75–19,38) antes de que entre el dedo
    corte('hd-inicio', 10, {                                                                                  // 15–21,25
      id: 'inicio', titulo: 'Inicio',
      camara: [
        { t: L(1.25), escala: 1.9, foco: [1032, 386], dur: L(0.25) },
        { t: L(2.125), escala: 1.9, foco: [1032, 697], dur: L(0.25) },
        { t: L(3.0), escala: 1, foco: [720, 540], dur: L(0.5), ease: 'expo.inOut' },
      ],
    }),
    corte('hd-tipo-de-trabajo', 10, { id: 'tipo-de-trabajo', titulo: 'Tipo de trabajo', empuje: 1.03 }),    // 21,25–27,5 (el golpe tapa el corte)
    corte('hdr-golpe', 2, {                                                                                   // 27,5–30
      k: LENTO, salida: 'camara',
      palabras: [
        { texto: '¿Cuánto', at: 0, fondo: 'azul', desde: 'der' },
        { texto: 'sale?', at: 1, fondo: 'amarillo', mitad: true, handy: 'gota', humor: 'preocupado', lado: 'der' },
      ],
    }),
    // ── DROP 2: presupuestos (30–37,5); de la confirmación a la reseña el teléfono sigue en su lugar: el empuje sigue
    //    de una escena a la otra, sin saltos (37,5–52,5)
    corte('hd-presupuestos', 14, { id: 'presupuestos', titulo: 'Presupuestos', hasta: 12, congela: 11.6, golpe: 0.05, destello: 0.4 }), // 30–37,5
    corte('hd-confirmacion', 8, { id: 'confirmacion', titulo: 'Confirmación', empuje: [1, 1.02] }),          // 37,5–42,5
    corte('hd-seguimiento', 12, { id: 'seguimiento', titulo: 'Seguimiento', empuje: [1.02, 1.045] }),        // 42,5–50
    corte('hd-resena', 5, { id: 'resena', titulo: 'Reseña', hasta: 4, empuje: [1.045, 1.06] }),             // 50–52,5
    // ── el resumen (52,5–57,5): una palabra por medio compás
    corte('hdr-golpe', 4, {                                                                                   // 52,5–57,5
      k: LENTO,
      palabras: [
        { texto: 'Pedí.', at: 0, fondo: 'azul', desde: 'izq', sub: 'Lo que necesitás.', handy: 'lamparita', lado: 'der' },
        { texto: 'Compará.', at: 1, fondo: 'amarillo', desde: 'abajo', sub: 'Especialistas verificados.', icono: 'verificado', handy: 'engranaje', lado: 'izq' },
        { texto: 'Elegí.', at: 2, fondo: 'blanco', desde: 'der', sub: 'Con el precio final.', handy: 'gota', lado: 'der' },
        { texto: 'Seguí.', at: 3, fondo: 'azul', desde: 'arriba', sub: 'Todo queda en Handy.', handy: 'llave', lado: 'izq' },
      ],
    }),
    // ── DROP 3: el final (57,5–70); su último cuadro queda quieto bajo "Ver de nuevo"
    corte('hdr-final', 10, { k: LENTO, id: 'final', titulo: 'Final', queda: true }),                         // 57,5–70
  ],
});
