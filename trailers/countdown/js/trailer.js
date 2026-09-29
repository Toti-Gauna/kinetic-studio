/* ============================================================================
   COUNTDOWN — cuenta regresiva en vivo (#15 del hub).
   Prueba el módulo countdown: dígitos de trazo que se transforman (MorphSVG), un
   reloj real, un tablero de paletas, el año en puntos y un final con fuegos y CTA.
   Nada inventado: la cuenta es hacia el próximo Año Nuevo y se calcula EN VIVO con
   el reloj de quien lo mira (la hora y la fecha de hoy, cuánto falta, cuánto del
   año ya pasó). ?to=AAAA-MM-DD cuenta hacia otra fecha; ?now=… fija el "ahora"
   (para renders reproducibles).
   ========================================================================== */
const INK = '#0e0e10', RED = '#ff4d2e', PAPER = '#f2ede4', GOLD = '#ffc21a', BLUE = '#2b50ff';
const Q = new URLSearchParams(location.search);
const NOW = Q.get('now') ? new Date(Q.get('now')) : new Date();
const TARGET = Q.get('to') ? new Date(Q.get('to') + 'T00:00:00') : new Date(NOW.getFullYear() + 1, 0, 1);
const YEAR = TARGET.getFullYear();
const LONG = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(TARGET).toUpperCase();
const DOTS = `${TARGET.getDate()}·${TARGET.getMonth() + 1}·${YEAR}`;

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  now: NOW, target: TARGET,
  meta: { title: 'COUNTDOWN', subtitle: `CUENTA REGRESIVA A ${YEAR}`, hud: `COUNTDOWN — ${YEAR}`, back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: INK, ink: INK, paper: PAPER, accents: [RED, BLUE, GOLD, '#d4ff3a', '#ff2e88', '#6a2bff'], glow: RED },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
  music: {
    bpm: 120, volume: 0.85,
    parts: [
      { from: 0.5, to: 7.5, style: 'tension' },
      { from: 7.5, style: 'hit' },
      { from: 7.5, to: 9.5, style: 'drive' },
      { from: 9.5, to: 16.5, style: 'soft' },
      { from: 16.5, to: 24.5, style: 'groove' },
      { from: 24.5, to: 31.5, style: 'half' },
      { from: 31.5, to: 34.5, style: 'build' },
      { from: 34.5, style: 'hit' },
      { from: 34.5, to: 38, style: 'house' },
    ],
  },

  scenes: [
    // ACTO I — los números
    { type: 'cdmorph', label: 'CUENTA', from: 10, kicker: 'CUENTA REGRESIVA · EN VIVO', colors: [INK, RED, PAPER, INK, BLUE] },
    {
      type: 'slam', label: '¿CUÁNTO FALTA?', beat: 0.5,
      words: [
        { text: '¿CUÁNTO', bg: RED, fg: PAPER, shape: 'circle', sc: GOLD },
        { text: 'FALTA', bg: PAPER, fg: INK, shape: 'square', sc: BLUE },
        { text: 'PARA', bg: INK, fg: PAPER, shape: 'triangle', sc: RED },
        { text: `${YEAR}?`, bg: GOLD, fg: INK, shape: 'circle', sc: RED },
      ],
    },

    // ACTO II — el tiempo real
    { type: 'cdclock', label: 'AHORA', kicker: 'AHORA MISMO · HORA LOCAL', note: 'LA HORA DE TU DISPOSITIVO, EN VIVO' },
    { type: 'cdflip', label: 'FALTAN', kicker: 'FALTAN', line: () => `PARA EL <span>${LONG}</span>` },
    { type: 'cdyear', label: 'EL AÑO', kicker: 'EL AÑO, DÍA POR DÍA', title: '{Y} en puntos', source: 'UN PUNTO POR DÍA · CALCULADO CON EL RELOJ DE ESTE DISPOSITIVO' },

    // ACTO III — el año nuevo
    { type: 'cdfinal', label: String(YEAR), cta: `AGENDÁ EL ${DOTS}`, sub: 'UNA CUENTA REGRESIVA EN VIVO · HECHA CON CÓDIGO' },
  ],
});
