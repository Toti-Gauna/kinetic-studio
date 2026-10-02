/* HANDY · App del especialista — el tráiler (70 s, escenario 4:3 de 1440×1080 para iPad), cortado como un spot.
   La misma historia que el tráiler de usuario (trailers/handy-usuario), del otro lado: Martín R., plomero verificado,
   recibe el pedido de "Reparar pérdida en el caño de la bacha" (Jue 15 oct · 16:00), pone su precio ($ 45.000), lo
   eligen, habla con el cliente sin dar su número, hace el trabajo y cobra. Ver STORYBOARD.md.
   Misma estética y misma forma que el de usuario: pop a 96 BPM con tres drops (10 · 30 · 57,5 s), golpes de palabras y
   los Handys bailando al final. Todo está escrito a 120 BPM y corre LENTO = 1,25 veces más lento (js/partitura.js):
   cada receta pasa por 'hdr-corte' con k = LENTO, y la partitura, con sus tiempos × LENTO.
   Reglas de contenido (STORYBOARD.md): voseo, pesos ($ 45.000), verificados, nada en inglés, ningún nombre real.
   Cada escena declara su `dur`: src/handy/player.ts corta el build si la receta devuelve otra. */

import { PARTITURA, LENTO } from './partitura.js';

// URL del QR del final. Vacía = solo el texto, centrado. En desarrollo, ?qr=<url> la pisa.
const QR_URL = '';

/** una receta por 'hdr-corte', LENTO veces más lenta: dura base × LENTO */
const escena = (de, base, op = {}) => ({ type: 'hdr-corte', de, base, k: LENTO, ...op, dur: +(base * LENTO).toFixed(6) });

Trailer.run({
  stage: { w: 1440, h: 1080 },
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'Handy', subtitle: 'App del especialista', hud: 'HANDY',
    pageTitle: 'Handy — App del especialista', back: '../../index.html',
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

  // la partitura: js/partitura.js (estilos en js/recipes-music.js); misma forma que la del tráiler de usuario
  music: PARTITURA,

  // escritas: 3 + 5 + 4 + 5 + 5 + 2 + 6 + 4 + 6 + 2 + 4 + 10 = 56 s → en la película × 1,25 = 70 s
  scenes: [
    // ── el problema, en frío (0–10)
    escena('he-gancho', 3, { id: 'gancho', titulo: 'Gancho' }),                                     //  0–3,75
    escena('he-problema', 5, { id: 'problema', titulo: 'Problema' }),                               //  3,75–10
    // ── DROP 1: Handy, para especialistas (10–15)
    escena('he-entrada', 4, { id: 'entrada', titulo: 'Handy', destello: { pico: 1, color: '#F8FFA0', dur: 0.56 } }), // 10–15
    // ── la app (15–27,5): activás y te llegan pedidos; vos ponés el precio
    escena('he-inicio', 5, { id: 'inicio', titulo: 'Inicio' }),                                     // 15–21,25
    escena('he-pedido', 5, { id: 'pedido', titulo: 'Pedido' }),                                     // 21,25–27,5
    escena('hdr-golpe', 2, {                                                                         // 27,5–30
      salida: 'camara',
      palabras: [
        { texto: '¿Te', at: 0, fondo: 'azul', desde: 'der' },
        { texto: 'eligen?', at: 1, fondo: 'amarillo', mitad: true, handy: 'engranaje', humor: 'preocupado', lado: 'der', tamano: 205 },
      ],
    }),
    // ── DROP 2: te eligieron (30–37,5), el chat y el camino, el trabajo y el cobro (37,5–52,5)
    escena('he-elegido', 6, { id: 'elegido', titulo: 'Te eligieron', golpe: 0.05, destello: 0.4 }),  // 30–37,5
    escena('he-camino', 4, { id: 'camino', titulo: 'En camino' }),                                  // 37,5–42,5
    escena('he-trabajo', 6, { id: 'trabajo', titulo: 'Trabajo' }),                                  // 42,5–50
    escena('he-cobro', 2, { id: 'cobro', titulo: 'Cobro' }),                                        // 50–52,5
    // ── el resumen (52,5–57,5): una palabra por medio compás
    escena('hdr-golpe', 4, {                                                                         // 52,5–57,5
      palabras: [
        { texto: 'Activá.', at: 0, fondo: 'azul', desde: 'izq', sub: 'Trabajás cuando querés.', handy: 'lamparita', lado: 'der' },
        { texto: 'Presupuestá.', at: 1, fondo: 'amarillo', desde: 'abajo', sub: 'Vos ponés el precio.', handy: 'engranaje', lado: 'izq' },
        { texto: 'Trabajá.', at: 2, fondo: 'blanco', desde: 'der', sub: 'Con tu agenda en orden.', handy: 'llave', lado: 'der' },
        { texto: 'Cobrá.', at: 3, fondo: 'azul', desde: 'arriba', sub: 'En tu CBU o alias.', handy: 'gota', lado: 'izq' },
      ],
    }),
    // ── DROP 3: el final (57,5–70); su último cuadro queda quieto bajo "Ver de nuevo"
    escena('hdr-final', 10, { id: 'final', titulo: 'Final', queda: true }),                          // 57,5–70
  ],
});
