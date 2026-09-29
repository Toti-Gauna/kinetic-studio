/* ============================================================================
   BIG BANG — del vacío al universo (#06 del hub).
   Prueba la capa WebGL del kit (módulo cosmos): 120.000 partículas calculadas en
   la GPU que pasan por 6 formaciones — singularidad, inflación, red cósmica,
   galaxia espiral, planeta con anillos y el título escrito con estrellas — y al
   final colapsan de nuevo en un punto.
   ========================================================================== */
const NIGHT = '#02030a', INK = '#05060f', PAPER = '#eef1ff';
const GOLD = '#ffc46b', VIOLET = '#8b5cf6', PINK = '#ff6fd8', ICE = '#7dd3fc', BLUE = '#3b5bff', MAGENTA = '#b84dff';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'BIG BANG',
    subtitle: 'DEL VACÍO AL UNIVERSO',
    hud: 'KINETIC STUDIO — BIG BANG',
    back: '../../index.html',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: {
    night: NIGHT, ink: INK, paper: PAPER,
    accents: [GOLD, VIOLET, PINK, ICE, BLUE, MAGENTA],
    glow: VIOLET,
  },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACTO I — la oscuridad, un latido de luz, y la explosión
    { type: 'bigbang', label: 'SINGULARIDAD', lines: ['HACE 13.800 MILLONES DE AÑOS', 'NO HABÍA <em>NADA</em>.'], caption: '10⁻³² SEGUNDOS · INFLACIÓN' },

    // ACTO II — la materia se organiza
    { type: 'cosmicweb', label: 'RED CÓSMICA', word: 'LA RED CÓSMICA', caption: 'MATERIA OSCURA · FILAMENTOS · NODOS' },
    { type: 'galaxy', label: 'GALAXIAS', word: 'GALAXIAS', caption: '100.000 AÑOS LUZ DE PUNTA A PUNTA' },
    { type: 'planet', label: 'MUNDOS', word: 'MUNDOS', caption: 'ANILLOS DE HIELO Y ROCA' },

    // ACTO III — el título escrito con estrellas, y el colapso
    { type: 'starword', label: 'BIG BANG', word: 'BIG BANG', subtitle: 'DEL VACÍO AL UNIVERSO' },
    { type: 'statement', text: 'SOMOS <span>POLVO DE ESTRELLAS.</span>', accent: GOLD },
    {
      type: 'credits', mark: false,
      stats: [['120.000', 'PARTÍCULAS'], ['6', 'FORMACIONES'], ['0', 'IMÁGENES']],
      line: 'BIG BANG — KINETIC STUDIO · CADA ESTRELLA SE CALCULA EN LA GPU',
    },
  ],
});
