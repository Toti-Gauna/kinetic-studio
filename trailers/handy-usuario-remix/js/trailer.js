/* HANDY USUARIO REMIX — el tráiler de Handy cortado como un spot (56 s, escenario 4:3 de 1440×1080 para iPad).
   Nueve escenas del original (escenas-a … escenas-d, copias sin cambios) corren al doble de velocidad con
   'hdr-corte' (js/remix.js): a 120 BPM cada tiempo del original cae en una corchea, así cada golpe sigue en el pulso.
   Entre ellas, golpes de palabras ('hdr-golpe'); el cierre del original ('hd-cierre') no se usa: el final es nuevo,
   con los Handys bailando ('hdr-final').
   Mismas reglas de contenido que el original (STORYBOARD.md): voseo, seis rubros, $ 45.000, verificados, 5 %.
   Cada escena declara su `dur`: src/handy/player.ts corta el build si la receta devuelve otra. */

import { PARTITURA } from './partitura.js';

// URL del QR del final. Vacía = solo el texto, centrado. En desarrollo, ?qr=<url> la pisa.
const QR_URL = '';

Trailer.run({
  stage: { w: 1440, h: 1080 },
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'Handy usuario Remix', subtitle: 'Usuario Remix', hud: 'HANDY REMIX',
    pageTitle: 'Handy usuario Remix', back: '../../index.html',
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

  // la partitura: js/partitura.js (estilos nuevos en js/recipes-music.js)
  music: PARTITURA,

  // 3 + 5 + 4 + 5 + 5 + 2 + 6 + 4 + 6 + 2 + 4 + 10 = 56 s
  scenes: [
    // ── el problema, en frío (0–8)
    { type: 'hdr-corte', id: 'gancho', titulo: 'Gancho', de: 'hd-gancho', base: 8, k: 0.5, hasta: 6, dur: 3 },             //  0–3
    { type: 'hdr-corte', id: 'problema', titulo: 'Problema', de: 'hd-problema', base: 10, k: 0.5, dur: 5 },                //  3–8
    // ── DROP 1: Handy (8–12)
    // el drop pega con un destello amarillo a pantalla completa mientras los Handys entran saltando
    { type: 'hdr-corte', id: 'entrada', titulo: 'Handy', de: 'hd-entrada', base: 8, k: 0.5, dur: 4,                    //  8–12
      destello: { pico: 1, color: '#F8FFA0', dur: 0.45 }, extra: [{ tipo: 'sello', at: 3 }] },
    // ── la app a toda velocidad (12–22)
    // el recorrido de las fichas (una por semicorchea) se ve de cerca: la cámara entra a los rubros (13,25), baja a
    // los accesos (14,125) y vuelve (15,0–15,5) antes de que entre el dedo (15,8)
    { type: 'hdr-corte', id: 'inicio', titulo: 'Inicio', de: 'hd-inicio', base: 10, k: 0.5, dur: 5,                       // 12–17
      camara: [
        { t: 1.25, escala: 1.9, foco: [1032, 386], dur: 0.25 },
        { t: 2.125, escala: 1.9, foco: [1032, 697], dur: 0.25 },
        { t: 3.0, escala: 1, foco: [720, 540], dur: 0.5, ease: 'expo.inOut' },
      ] },
    { type: 'hdr-corte', id: 'tipo-de-trabajo', titulo: 'Tipo de trabajo', de: 'hd-tipo-de-trabajo', base: 10, k: 0.5, dur: 5, empuje: 1.03 }, // 17–22 (el golpe tapa el corte)
    { type: 'hdr-golpe', dur: 2, salida: 'camara', palabras: [                                                          // 22–24
      { texto: '¿Cuánto', at: 0, fondo: 'azul', desde: 'der' },
      { texto: 'sale?', at: 1, fondo: 'amarillo', mitad: true, handy: 'gota', humor: 'preocupado', lado: 'der' },
    ] },
    // ── DROP 2: presupuestos (24–30); de la confirmación a la reseña el teléfono sigue en su lugar: el empuje sigue
    //    de una escena a la otra, sin saltos (24–42)
    { type: 'hdr-corte', id: 'presupuestos', titulo: 'Presupuestos', de: 'hd-presupuestos', base: 14, k: 0.5, hasta: 12, congela: 11.6, dur: 6, golpe: 0.05, destello: 0.4 }, // 24–30
    { type: 'hdr-corte', id: 'confirmacion', titulo: 'Confirmación', de: 'hd-confirmacion', base: 8, k: 0.5, dur: 4, empuje: [1, 1.02] }, // 30–34
    { type: 'hdr-corte', id: 'seguimiento', titulo: 'Seguimiento', de: 'hd-seguimiento', base: 12, k: 0.5, dur: 6, empuje: [1.02, 1.045] }, // 34–40
    { type: 'hdr-corte', id: 'resena', titulo: 'Reseña', de: 'hd-resena', base: 5, k: 0.5, hasta: 4, dur: 2, empuje: [1.045, 1.06] }, // 40–42
    { type: 'hdr-golpe', dur: 4, palabras: [                                                                          // 42–46
      { texto: 'Pedí.', at: 0, fondo: 'azul', desde: 'izq', sub: 'Lo que necesitás.', handy: 'lamparita', lado: 'der' },
      { texto: 'Compará.', at: 1, fondo: 'amarillo', desde: 'abajo', sub: 'Especialistas verificados.', icono: 'verificado', handy: 'engranaje', lado: 'izq' },
      { texto: 'Elegí.', at: 2, fondo: 'blanco', desde: 'der', sub: 'Con el precio final.', handy: 'gota', lado: 'der' },
      { texto: 'Seguí.', at: 3, fondo: 'azul', desde: 'arriba', sub: 'Todo queda en Handy.', handy: 'llave', lado: 'izq' },
    ] },
    // ── DROP 3: el final (46–56)
    { type: 'hdr-final', id: 'final', titulo: 'Final', dur: 10 },                                                          // 46–56
  ],
});
