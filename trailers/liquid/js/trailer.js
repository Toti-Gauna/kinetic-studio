/* ============================================================================
   LIQUID — todo fluye (#05 del hub).
   Prueba el módulo líquido del kit: drop, metaballs, melt, flood, underwater,
   mesh. Cada escena nace de la anterior: la gota cae al centro → de ese punto
   brota un blob → lo sólido se derrite y gotea → el líquido sube desde abajo e
   inunda el cuadro → quedamos bajo el agua.
   ========================================================================== */
const NIGHT = '#0a0618', INK = '#0d0a1c', PAPER = '#f2f0ff', DEEP = '#06142e';
const CYAN = '#2de2e6', VIOLET = '#7b3cff', PINK = '#ff4fa3', LIME = '#c8ff4d', BLUE = '#2b6bff', MAGENTA = '#b43cff';

// Formas propias para `shift` (viewBox -250..250, spin 0 → quedan derechas)
const GOTA = 'M0,-232C52,-132 132,-42 132,58C132,150 72,212 0,212C-72,212 -132,150 -132,58C-132,-42 -52,-132 0,-232Z';
const ONDA = (() => { // una cinta ondulada
  const top = [], bot = [];
  for (let x = -230; x <= 230; x += 23) {
    const y = Math.sin(x * 0.021) * 70;
    top.push(`${x},${(y - 48).toFixed(1)}`);
    bot.unshift(`${x},${(y + 48).toFixed(1)}`);
  }
  return `M${top.join('L')}L${bot.join('L')}Z`;
})();

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'LIQUID',
    subtitle: 'TODO FLUYE',
    hud: 'KINETIC STUDIO — LIQUID',
    back: '../../index.html',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: {
    night: NIGHT, ink: INK, paper: PAPER,
    accents: [CYAN, VIOLET, PINK, LIME, BLUE, MAGENTA],
    spectrum: [BLUE, VIOLET, PINK, CYAN],
    glow: VIOLET,
  },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACTO I — una gota cae al centro… y de ese punto brota el líquido
    { type: 'drop', label: 'GOTA', lines: ['TODO EMPIEZA', 'CON UNA <em>GOTA</em>.'], accent: CYAN },
    { type: 'metaballs', label: 'FUSIÓN', words: ['SEPARAR', 'UNIR', 'FLUIR'], colors: [CYAN, VIOLET, PINK, BLUE], caption: '8 GOTAS · 129.600 PÍXELES POR CUADRO' },

    // ACTO II — cambio de estado: lo sólido se derrite, el líquido sube, quedamos abajo
    { type: 'melt', label: 'ESTADO', word: 'SÓLIDO', color: PAPER, captions: ['ESTADO · SÓLIDO', 'ESTADO · LÍQUIDO'] },
    { type: 'flood', label: 'MAREA', word: 'FLOTAR', to: CYAN, back: BLUE },
    { type: 'underwater', label: 'PROFUNDIDAD', word: 'PROFUNDO', top: CYAN, bottom: DEEP, caption: '−40 M · 5 ATM' },
    {
      type: 'shift', label: 'FORMAS', spin: 0,
      steps: [
        { word: 'GOTA', form: GOTA, fx: 'rise', bg: BLUE, shape: CYAN, name: 'GOTA' },
        { word: 'ONDA', form: ONDA, fx: 'slide', bg: CYAN, shape: VIOLET, cut: 'right', name: 'ONDA' },
        { word: 'MAREA', form: 'blob', fx: 'flip', bg: VIOLET, shape: PINK, name: 'MAREA' },
        { word: 'ESPUMA', form: 'flower', fx: 'bloom', bg: PAPER, shape: BLUE, cut: 'up', name: 'ESPUMA' },
      ],
    },
    { type: 'mesh', label: 'CALMA', lines: ['SIN <b>BORDES.</b>', 'SIN <b>FORMA FIJA.</b>'], colors: [VIOLET, PINK, CYAN, BLUE, MAGENTA] },
    {
      type: 'montage',
      cards: [
        { bg: CYAN, text: 'AGUA', color: NIGHT },
        { bg: NIGHT, kind: 'circle', color: PINK },
        { bg: VIOLET, text: 'LLUVIA', style: 'italic', color: PAPER },
        { bg: PAPER, kind: 'circle', color: BLUE },
        { bg: BLUE, text: 'MAR', style: 'thin', color: CYAN },
        { bg: PINK, kind: 'circle', color: NIGHT },
        { bg: NIGHT, text: 'VAPOR', style: 'glow', color: CYAN },
        { bg: LIME, text: 'HIELO', style: 'outline', color: NIGHT },
      ],
    },

    // ACTO III
    { type: 'title', label: 'LIQUID', title: 'LIQUID', subtitle: 'UN TRÁILER EN ESTADO LÍQUIDO', colors: [CYAN, VIOLET, PINK] },
    { type: 'statement', text: 'TODO <span>FLUYE.</span>', accent: CYAN },
    {
      type: 'credits', mark: false,
      stats: [['8', 'GOTAS'], ['129.600', 'PÍXELES POR CUADRO'], ['0', 'IMÁGENES']],
      line: 'LIQUID — KINETIC STUDIO · HECHO SOLO CON CÓDIGO',
    },
  ],
});
