/* ============================================================================
   MANIFIESTO — un tráiler hecho solo de letras (#02 del hub).
   Prueba las recetas tipográficas del kit: typewriter, stack, specimen, rules,
   ticker, más montage / title / statement / credits en modo 100% texto.
   ========================================================================== */
const PAPER = '#f1ece2', INK = '#121110', NIGHT = '#0b0a09';
const RED = '#ff3b1d', BLUE = '#2340ff', GOLD = '#ffc21a', LIME = '#d4ff3a', PINK = '#ff2e88', VIOLET = '#7a3cff';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'MANIFIESTO',
    subtitle: 'UN TRÁILER HECHO SOLO DE LETRAS',
    hud: 'KINETIC STUDIO — MANIFIESTO',
    back: '../../index.html',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
    particles: '{n} PARTÍCULAS · 1 CANVAS · 0 IMÁGENES',
  },
  // Editorial palette: paper, ink and a signal red do most of the work.
  palette: {
    night: NIGHT, ink: INK, paper: PAPER,
    accents: [RED, BLUE, GOLD, LIME, PINK, VIOLET],
    glow: RED,
  },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACT I — a blinking caret, one word gets selected and becomes the page
    { type: 'typewriter', label: 'PALABRA', lines: ['TODO EMPIEZA', 'CON UNA <em>PALABRA</em>.'], to: PAPER },

    // ACT II — the manifesto
    {
      type: 'stack', label: 'FORMA',
      stacks: [
        ['LA LETRA', 'ES', '*IMAGEN'],
        ['LEER', 'TAMBIÉN ES', '*MIRAR'],
        ['CADA PALABRA', 'TIENE', '*PESO'],
      ],
    },
    { type: 'specimen', label: 'ANATOMÍA', name: 'ARCHIVO', highlight: 'Ñ' },
    {
      type: 'rules', label: 'REGLAS', head: 'MANIFIESTO', unit: 'REGLA',
      rules: [
        { text: 'EL RITMO ES <i>significado.</i>' },
        { text: 'EL ESPACIO TAMBIÉN <i>habla.</i>' },
        { text: 'MENOS, PERO <i>mejor.</i>' },
        { text: 'ROMPÉ LA <i>grilla.</i>', bg: BLUE, num: LIME, accent: LIME },
      ],
    },
    { type: 'ticker', label: 'MOVIMIENTO', text: 'NADA ESTÁ QUIETO', bg: INK, accent: RED },
    {
      type: 'montage',
      cards: [
        { bg: RED, text: 'LEER', color: INK },
        { bg: INK, text: 'Ñ', style: 'glow', color: PAPER },
        { bg: PAPER, text: 'MIRAR', style: 'italic', color: INK },
        { bg: BLUE, text: '&', color: PAPER },
        { bg: GOLD, text: 'SENTIR', style: 'thin', color: INK },
        { bg: INK, text: '¿?', style: 'outline', color: RED },
        { bg: PAPER, text: 'MOVER', color: RED },
        { bg: INK, text: 'ROMPER', style: 'outline', color: PAPER },
      ],
    },

    // ACT III — payoff
    { type: 'title', label: 'MANIFIESTO', title: 'MANIFIESTO', subtitle: 'UN TRÁILER HECHO SOLO DE LETRAS', glyphs: ['A', 'Ñ', '&'], colors: [RED, PAPER, BLUE] },
    { type: 'statement', text: 'LA TIPOGRAFÍA <span>SE MUEVE.</span>', accent: RED },
    {
      type: 'credits',
      mark: false,
      stats: [['3', 'FAMILIAS TIPOGRÁFICAS'], ['2', 'EJES VARIABLES'], ['0', 'IMÁGENES']],
      line: 'UN MANIFIESTO DE KINETIC STUDIO — HECHO SOLO CON CÓDIGO',
    },
  ],
});
