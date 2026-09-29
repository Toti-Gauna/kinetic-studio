/* ============================================================================
   SYNTHWAVE — un viaje a los 80 (#19 del hub).
   Prueba el módulo synth: sol de neón con franjas, montañas, grilla en perspectiva,
   sólidos de alambre (con su número real de vértices y aristas), letras cromadas,
   neón que parpadea y una cinta VHS (scanlines, bandas de tracking, la fecha real
   de hoy en pantalla). Música: synthwave sintetizado (arpegios, bajo pulsante,
   pads de sierras desafinadas). Todo lo que dice es verdad.
   ========================================================================== */
Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'SYNTHWAVE', subtitle: 'UN VIAJE A LOS 80', hud: 'KINETIC STUDIO — SYNTHWAVE', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#07011a', ink: '#07011a', paper: '#ffe6f7', accents: ['#ff2e97', '#34e1ff', '#ffe66d', '#ff8a3d', '#b36bff', '#ff5f6d'], glow: '#ff2e97' },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true, preload: ['italic 400 96px "Instrument Serif"', '700 44px "JetBrains Mono"'] },
  vhs: { first: 6, every: 7.5 },
  music: {
    bpm: 120, volume: 0.85, chords: Trailer.music.MINOR,
    parts: [
      { from: 4, to: 8, style: 'soft' },
      { from: 8, to: 12, style: 'build' },
      { from: 12, style: 'hit' },
      { from: 12, to: 34, style: 'synth' },
      { from: 34, to: 37.5, style: 'half', volume: 0.7 },
    ],
  },

  scenes: [
    { type: 'synboot', label: 'PLAY' },
    { type: 'synride', label: 'LA RUTA', lines: ['En los 80, esto se hacía con cinta de video.', 'Hoy, con código.'], at: [0.6, 4.4], hold: 3 },
    { type: 'synchrome', label: 'CROMO', step: 1.5, words: ['SIN CINTA', 'SIN VIDEO', 'SOLO CÓDIGO'] },
    { type: 'synwire', label: 'ALAMBRE', step: 2.5 },
    { type: 'syntitle', label: 'SYNTHWAVE', title: 'SYNTHWAVE', script: 'Kinetic', tagline: 'UN VIAJE A LOS 80 · HECHO CON CÓDIGO' },
    { type: 'synend', label: 'STOP', fin: 'FIN', from: 38 },
  ],
});
