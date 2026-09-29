/* ============================================================================
   ENJAMBRE — inteligencia colectiva (#07 del hub).
   Prueba el módulo swarm del kit: una simulación real de bandada (boids, cada
   agente sigue a sus 7 vecinos más cercanos, como los estorninos) precalculada al
   cargar a paso fijo → se puede saltar a cualquier cuadro y repetir idéntica.
   Del atardecer a la noche: un pájaro solo, la bandada, la palabra, el halcón,
   las figuras y el título hecho de aves que brillan como un show de drones.
   ========================================================================== */
const NIGHT = '#02030b', INK = '#120e18', PAPER = '#fff4ec';
const CORAL = '#ff7a59', VIOLET = '#6b5bff', GOLD = '#ffcf6b', ICE = '#bdf3ff', ROSE = '#ff5c8a', INDIGO = '#3a3fb8';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'ENJAMBRE',
    subtitle: 'INTELIGENCIA COLECTIVA',
    hud: 'KINETIC STUDIO — ENJAMBRE',
    back: '../../index.html',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: {
    night: NIGHT, ink: INK, paper: PAPER,
    accents: [CORAL, VIOLET, GOLD, ICE, ROSE, INDIGO],
    glow: VIOLET,
  },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACTO I — atardecer: uno solo… y llegan todos
    { type: 'murmuration', label: 'UNO', count: 1600, lines: ['UNO SOLO', 'NO ES NADA.'], caption: '1.600 AGENTES · CADA UNO SIGUE A SUS 7 VECINOS' },
    { type: 'flockword', label: 'JUNTOS', word: 'JUNTOS' },

    // ACTO II — la amenaza y la forma
    { type: 'predator', label: 'AMENAZA', lines: ['NADIE MANDA.', 'TODOS REACCIONAN.'] },
    { type: 'flockshape', label: 'FORMAS' },

    // ACTO III — de noche, un show de drones hecho de aves
    { type: 'flocktitle', label: 'ENJAMBRE', word: 'ENJAMBRE', subtitle: 'INTELIGENCIA COLECTIVA' },
    { type: 'statement', text: 'JUNTOS, <span>SOMOS FORMA.</span>', accent: GOLD },
    {
      type: 'credits', mark: false,
      stats: [['1.600', 'AGENTES'], ['7', 'VECINOS POR AGENTE'], ['0', 'LÍDERES']],
      line: 'ENJAMBRE — KINETIC STUDIO · CADA CUADRO SE SIMULA DE ANTEMANO',
    },
  ],
});
