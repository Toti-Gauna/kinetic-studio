/* ============================================================================
   THE TRAILER — this is the only file you normally edit per project.
   Scenes run back-to-back; each recipe knows its own length (see README).
   This example is "KINETIC", the reference trailer the kit was extracted from.
   ========================================================================== */
Trailer.run({
  meta: {
    title: 'KINETIC',                 // intro screen + default title card
    subtitle: 'A MOTION STUDY',       // intro screen line
    hud: 'KINETIC — MOTION STUDY',    // top-left HUD text
    back: '../../index.html',         // → trailer hub (back link + Esc)
  },

  // Hex colours only. accents[0..2] are the "hero trio" (circle / square / triangle).
  palette: {
    night: '#07070a',
    ink: '#0e0e10',
    paper: '#f2ede4',
    accents: ['#ff4d2e', '#2b50ff', '#ffc21a', '#d4ff3a', '#ff2e88', '#6a2bff'],
    // spectrum: [...]  gradient for grid / particles / tunnel (defaults from accents)
    // glow: '#6a2bff'  nebula + glows (defaults to accents[5])
  },

  // Must match the <link> tags in index.html. stretch:true → use the wdth axis on canvas text.
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', stretch: true },
  ui: { back: 'HUB' },

  scenes: [
    { type: 'origin', label: 'ORIGIN', lines: ['EVERYTHING BEGINS', 'WITH A SINGLE <em>POINT</em>'] },
    { type: 'forms', label: 'FORM', word: 'FORM' },
    {
      type: 'shift', label: 'SHIFT',
      steps: [
        { word: 'SHAPE', form: 'square' },
        { word: 'SHIFT', form: 'triangle' },
        { word: 'BEND', form: 'blob' },
        { word: 'BREAK', form: 'star' },
        { word: 'BUILD', form: 'hexagon' },
        { word: 'BLEND', form: 'cross' },
        { word: 'BLOOM', form: 'flower' },
        { word: 'EVOLVE', form: 'circle' },
      ],
    },
    { type: 'rhythm', label: 'RHYTHM', word: 'RHYTHM' },
    { type: 'particles', label: 'MOTION', word: 'MOTION' },
    { type: 'warp', label: 'DEPTH', words: ['DEPTH', 'SPEED', 'LIGHT'] },
    { type: 'montage', words: ['COLOR', 'TYPE', 'TIME', 'LIGHT', 'SPACE'] },
    { type: 'title', label: 'KINETIC', title: 'KINETIC', subtitle: 'A MOTION STUDY IN FORM, COLOR & TIME' },
    { type: 'statement', text: 'EVERYTHING <span>MOVES.</span>' },
    {
      type: 'credits',
      stats: [['0', 'VIDEO FILES'], ['0', 'IMAGES'], ['100%', 'CODE']],
      line: 'HTML · CSS · JAVASCRIPT — RENDERED LIVE, FRAME BY FRAME',
    },
  ],
});
