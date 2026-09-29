/* ============================================================================
   PAPER CITY — una ciudad de papel (#09 del hub).
   Prueba el módulo city del kit (sobre la capa Three.js): una maqueta de papel
   con sombras reales. Un plano azul que se dibuja solo, edificios que crecen piso
   por piso, tráfico en tilt-shift (efecto miniatura), un time-lapse de día a
   noche con ventanas que se encienden, y el título como un libro pop-up.
   ========================================================================== */
const NIGHT = '#0f1730', INK = '#1e293b', PAPER = '#fbf4e8';
const ORANGE = '#f97316', BUTTER = '#fde68a', SKY = '#9fc9ea', MINT = '#bfe0d4', ROSE = '#f4b69c', LILAC = '#e3cdea';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'PAPER CITY',
    subtitle: 'UNA CIUDAD DE PAPEL',
    hud: 'KINETIC STUDIO — PAPER CITY',
    back: '../../index.html',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: {
    night: NIGHT, ink: INK, paper: PAPER,
    accents: [ORANGE, SKY, BUTTER, MINT, ROSE, LILAC],
    glow: ORANGE,
  },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACTO I — el plano y la construcción
    { type: 'blueprint', label: 'PLANO', lines: ['TODA CIUDAD', 'EMPIEZA EN UN PAPEL.'], caption: 'PLANO GENERAL · ESCALA 1:1000' },
    { type: 'citybuild', label: 'OBRA', lines: ['BLOQUE', 'A BLOQUE.'] },

    // ACTO II — la vida de la ciudad
    { type: 'traffic', label: 'MINIATURA', lines: ['UNA CIUDAD', 'EN MINIATURA.'] },
    { type: 'daynight', label: 'TIME-LAPSE', lines: ['DE DÍA…', '…Y DE NOCHE.'] },

    // ACTO III — el título se despliega como un libro pop-up
    { type: 'citytitle', label: 'PAPER CITY', word: 'PAPER CITY', subtitle: 'UNA CIUDAD DE PAPEL', colors: [ORANGE, BUTTER] },
    { type: 'statement', text: 'LO GRANDE <span>EMPIEZA CHICO.</span>', accent: ORANGE },
    {
      type: 'credits', mark: false,
      stats: [['123', 'EDIFICIOS'], ['219', 'ÁRBOLES'], ['60', 'AUTOS'], ['1', 'HOJA DE PAPEL']],
      line: 'PAPER CITY — KINETIC STUDIO · SOMBRAS, LUCES Y TRÁFICO EN TIEMPO REAL',
    },
  ],
});
