/* ============================================================================
   OPENING TITLES — títulos de apertura (#18 del hub).
   Homenaje al estilo de Saul Bass (no copias): campos de color plano, recortes de
   papel con bordes de tijera, tipografía "recortada a mano", barras que barren,
   una espiral y una grilla en perspectiva. Sigue la convención de los créditos de
   cine: presenta · una película · el título · el reparto · el equipo · dirigida por.
   Nada inventado: la "película" es el propio hub, el reparto son tráileres reales
   del hub y el equipo técnico es de verdad cómo están hechos.
   ========================================================================== */
Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'OPENING TITLES', subtitle: 'TÍTULOS DE APERTURA', hud: 'KINETIC STUDIO — OPENING TITLES', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#141414', ink: '#141414', paper: '#efe6d2', accents: ['#f26b1d', '#d7263d', '#efe6d2', '#141414', '#f26b1d', '#d7263d'], glow: '#f26b1d' },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true, preload: ['italic 400 56px "Instrument Serif"'] },
  bass: { orange: '#f26b1d', black: '#141414', cream: '#efe6d2', red: '#d7263d' },
  music: {
    bpm: 120, volume: 0.85, chords: Trailer.music.NOIR,
    parts: [
      { from: 0.5, to: 10, style: 'walk' },
      { from: 10, to: 12.5, style: 'tension' },
      { from: 12.5, style: 'hit' },
      { from: 12.5, to: 17, style: 'half' },
      { from: 17, to: 35.5, style: 'walk' },
      { from: 35.5, to: 39.5, style: 'soft', volume: 0.7 },
    ],
  },

  scenes: [
    { type: 'sbopen', label: 'PRESENTA', company: 'KINETIC STUDIO', presents: 'presenta' },
    { type: 'sbcutout', label: 'UNA PELÍCULA', line1: 'una película', line2: 'HECHA CON CÓDIGO' },
    { type: 'sbspiral', label: 'TRAILER HUB', title: 'TRAILER HUB', subtitle: 'un catálogo en movimiento' },
    {
      type: 'sbcast', label: 'REPARTO', step: 3.5,
      cards: [
        [['KINETIC', 'El Primero'], ['GLOBAL', 'El Viajero']],
        [['NOCTURNO', 'El Detective'], ['PAPER CITY', 'La Ciudad']],
        [['BIG BANG', 'El Origen'], ['ENJAMBRE', 'La Multitud']],
      ],
    },
    {
      type: 'sbgrid', label: 'EQUIPO', step: 1.6,
      credits: [['dirección de fotografía', 'CANVAS 2D Y WEBGL'], ['música', 'WEB AUDIO, EN VIVO'], ['montaje', 'GSAP'], ['tipografía', 'ARCHIVO E INSTRUMENT SERIF']],
    },
    { type: 'sbend', label: 'DIRIGIDA POR', by: 'dirigida por', name: 'UNA LÍNEA DE TIEMPO' },
  ],
});
