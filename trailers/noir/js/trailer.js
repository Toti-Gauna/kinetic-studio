/* ============================================================================
   NOCTURNO — un thriller en blanco y negro (#17 del hub).
   Prueba el módulo noir: lluvia que brilla en el cono de un farol, charcos, niebla,
   humo, luz de persianas con polvo en los haces (y un texto que solo se ve donde cae
   la luz), gotas en un vidrio con la ciudad desenfocada, un reflector que revela el
   título serif y un único color en todo el film: una línea roja. Música: walking bass
   de jazz con escobillas, sintetizado. Es ficción; los créditos del final son
   técnicos y verdaderos.
   ========================================================================== */
const es = new Intl.NumberFormat('es-AR');
const C = Trailer.noir.counts;

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'NOCTURNO', subtitle: 'UN THRILLER EN BLANCO Y NEGRO', hud: 'KINETIC STUDIO — NOCTURNO', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#070707', ink: '#0a0a0a', paper: '#ece9e2', accents: ['#c1121f', '#9a9a9a', '#d8d4cc', '#5a5a5a', '#bdbdbd', '#6a6a6a'], glow: '#5e5e5e' },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true, preload: ['400 96px "Instrument Serif"', 'italic 400 64px "Instrument Serif"'] },
  music: {
    bpm: 120, volume: 0.8, chords: Trailer.music.NOIR,
    parts: [
      { from: 4, to: 31, style: 'walk' },
      { from: 31, to: 34.5, style: 'tension' },
      { from: 34.5, to: 39, style: 'half', volume: 0.7 },
      { from: 39, to: 44, style: 'walk', volume: 0.6 },
    ],
  },

  scenes: [
    {
      type: 'nrstreet', label: 'LA CALLE', thunderAt: 3.4, at: [1.2, 4.8],
      lines: [{ text: 'Llovía desde hacía tres días.' }, { text: 'En esta ciudad, la lluvia no limpia nada.' }],
    },
    { type: 'nrcards', label: 'EL CASO', step: 2, cards: ['Un caso.', 'Una ciudad.', 'Ninguna salida.'] },
    {
      type: 'nrblinds', label: 'LA OFICINA', carAt: 4.2, at: [1, 5.6],
      lines: [{ text: 'Ella entró a las 3:12', y: 480 }, { text: 'y la noche cambió de dueño.', y: 610 }],
    },
    {
      type: 'nrwindow', label: 'LA VENTANA', at: [0.8, 2.2],
      lines: [{ text: 'Algunas verdades', style: 'top:470px' }, { text: 'solo se ven de noche.', style: 'top:580px' }],
    },
    { type: 'nrtitle', label: 'NOCTURNO', title: 'NOCTURNO', subtitle: 'Una historia en blanco y negro.', red: '#c1121f' },
    {
      type: 'nrcredits', presents: 'KINETIC STUDIO PRESENTA', title: 'NOCTURNO',
      billing: ['Dirección: GSAP', 'Fotografía: Canvas 2D', `Lluvia: ${es.format(C.rain)} gotas`, 'Música: sintetizada en vivo', 'Tipografía: Instrument Serif', 'Cero archivos de video'],
      soon: 'Próximamente', where: 'EN ESTE NAVEGADOR',
    },
  ],
});
