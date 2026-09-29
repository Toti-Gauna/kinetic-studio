/* ============================================================================
   BEAT — la partitura mueve la imagen (#20 del hub).
   Un videoclip generativo: la imagen lee la PARTITURA misma (cada bombo, caja,
   hi-hat, nota de bajo y de arpegio, con su tiempo exacto), así que la sincronía es
   perfecta y cada cuadro se puede exportar. Mientras suena con audio, el medidor de
   abajo muestra el espectro real (AnalyserNode); en silencio, el calculado de la
   partitura. La letra cae palabra por palabra sobre los pulsos y dice la verdad
   sobre lo que se ve.
   ========================================================================== */
Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'BEAT', subtitle: 'LA PARTITURA MUEVE LA IMAGEN', hud: 'KINETIC STUDIO — BEAT', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#0c0c10', ink: '#0c0c10', paper: '#f2ede4', accents: ['#ff4d2e', '#d4ff3a', '#1b1bd6', '#ff2e88', '#35d0ff', '#f2ede4'], glow: '#ff4d2e' },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
  beat: { palette: ['#0c0c10', '#ff4d2e', '#1b1bd6', '#d4ff3a', '#f2ede4', '#ff2e88'] },
  music: {
    bpm: 120, volume: 0.9, chords: Trailer.music.MINOR, riff: Trailer.music.RIFF_MINOR,
    parts: [
      { from: 0, to: 8, style: 'pulse' },
      { from: 8, to: 16, style: 'house' },
      { from: 16, to: 28, style: 'synth' },
      { from: 28, style: 'hit' },
      { from: 28, to: 33.5, style: 'house', volume: 0.8 },
    ],
  },

  scenes: [
    {
      type: 'bxpulse', label: 'PULSO',
      lyrics: [{ words: 'Cada golpe', at: 1 }, { words: 'mueve la imagen.', at: 3 }, { words: 'Nada está grabado.', at: 5 }],
    },
    {
      type: 'bxgrid', label: 'GRILLA',
      lyrics: [{ words: 'Dieciséis pasos', at: 0.5 }, { words: 'por compás.', at: 2.5 }, { words: 'Así se ve la partitura.', at: 4.5 }],
    },
    {
      type: 'bxring', label: 'NOTAS', lyricsAt: { x: 520, y: 470 }, maxW: 760, ring: { x: 1320, y: 500, r: 350 },
      lyrics: [{ words: 'Doce notas,', at: 0.5 }, { words: 'un círculo,', at: 2.5 }, { words: 'y cada nota', at: 4.5 }, { words: 'enciende su rayo.', at: 6.5 }, { words: 'Todo en vivo.', at: 9 }],
    },
    { type: 'bxtitle', label: 'BEAT', title: 'BEAT', subtitle: 'CADA LETRA ES UN INSTRUMENTO · SINTETIZADO EN VIVO' },
  ],
});
