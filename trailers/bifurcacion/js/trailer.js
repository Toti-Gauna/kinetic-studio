/* ============================================================================
   BIFURCACIÓN — un tráiler que se elige (#23 del hub).
   Prueba el modo interactivo del motor (cfg.interactive + js/interactive.js):
     · en la bifurcación, el espectador elige el camino: A · LA FORMA o B · EL DATO
       (clic en la opción o tecla A / B); si vuelve atrás más allá de la bifurcación, elige de nuevo;
     · el mouse mueve la cámara: las capas con data-depth hacen parallax (GSAP Observer);
     · la rueda del mouse es el tiempo: el scroll recorre el camino elegido (ScrollTrigger), hacia
       adelante y hacia atrás; si no se toca, sigue solo.
   Las dos ramas viven en la misma línea de tiempo (una región cada una). La vista previa del hub,
   ?t= y las exportaciones son lineales: ?path=a (por defecto) o ?path=b.
   Los datos son reales: los tráileres del hub (hub/catalog.js) y las cifras que midió WRAPPED.
   ========================================================================== */
const V = '#a78bfa', G = '#34d399';
const HUB = window.HUB_CATALOG.filter(t => t.enabled && t.id !== 'bifurcacion');
const W = window.WRAPPED_DATA.trailers, sum = k => W.reduce((a, t) => a + t[k], 0);
const OPTS = [
  { id: 'a', key: 'A', title: 'LA FORMA', sub: 'GEOMETRÍA · CAPAS', color: V },
  { id: 'b', key: 'B', title: 'EL DATO', sub: 'CIFRAS REALES · TIEMPO', color: G },
];
const [yy, mm, dd] = window.WRAPPED_DATA.measured.split('-');

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'BIFURCACIÓN', subtitle: 'UN TRÁILER QUE SE ELIGE', hud: 'KINETIC STUDIO — BIFURCACIÓN', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'RUEDA TIEMPO · MOUSE CÁMARA · A / B CAMINO · ESPACIO PAUSA · M SILENCIO · R DE NUEVO',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  interactive: {
    names: { a: 'A · LA FORMA', b: 'B · EL DATO' },
    hint: 'RUEDA · TIEMPO &nbsp;&nbsp; MOUSE · CÁMARA &nbsp;&nbsp; A / B · CAMINO',
  },
  palette: { night: '#0e0e10', ink: '#0e0e10', paper: '#f4f4f5', accents: [V, G, '#f4f4f5', '#c4b5fd', '#6ee7b7', '#f0abfc'], glow: V },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
  // each branch has its own music, anchored to its region (the same in the interactive film and in ?path=)
  music: {
    bpm: 120, volume: 0.85, chords: Trailer.music.MINOR, riff: Trailer.music.RIFF_MINOR,
    parts: [
      { from: 0, to: 6, style: 'pulse' },
      { from: 6, style: 'hit', volume: 0.6 },
      { from: 6, to: 10, style: 'tension' },
      { at: 'a', from: 0, style: 'hit' },
      { at: 'a', from: 0, to: 12, style: 'synth' },
      { at: 'b', from: 0, style: 'hit' },
      { at: 'b', from: 0, to: 12, style: 'house' },
      { at: 'end', from: 0, style: 'hit', volume: 0.7 },
      { at: 'end', from: 0, to: 6, style: 'groove' },
      { at: 'end', from: 6, style: 'hit' },
      { at: 'end', from: 6, to: 12, style: 'soft', volume: 0.7 },
    ],
  },

  scenes: [
    // 0–10 s: una sola línea… que se bifurca
    {
      type: 'brline', label: 'UNA LÍNEA', duration: 6, commits: HUB.map(t => t.title),
      kicker: `${HUB.length} TRÁILERES · UNA SOLA DIRECCIÓN`, lines: ['Todos van de principio a fin.', 'Este se <em>bi</em><strong>furca</strong>.'],
    },
    {
      type: 'brfork', label: 'ELEGÍ', duration: 4, commits: HUB.length, options: OPTS,
      kicker: 'BIFURCACIÓN', title: 'Elegí un camino.',
      sub: '<span class="if-ix">CLIC O TECLA · A / B</span><span class="if-lin">EN LA WEB, LO ELEGÍS VOS</span>',
    },

    // A · LA FORMA (12 s)
    {
      branch: 'a', type: 'brworld', label: 'LA FORMA', duration: 6, kind: 'shapes', seed: 7,
      color: V, tints: [V, '#c4b5fd', '#7c3aed', '#f4f4f5'], from: { x: 1450, y: 380 },
      bg: 'radial-gradient(120% 90% at 72% 30%, #2e1065 0%, #0e0e10 72%)', base: '#150d24',
      kicker: 'A · LA FORMA', title: 'Cada capa, su profundidad.',
      hintIx: 'MOVÉ EL MOUSE · LA CÁMARA TE SIGUE', hintLin: 'EN LA WEB, LA CÁMARA SIGUE AL MOUSE',
    },
    {
      branch: 'a', type: 'brmorph', label: 'UN TRAZO', duration: 6, color: V, color2: '#f0abfc', word: 'FORMA',
      bg: 'radial-gradient(110% 90% at 50% 55%, #2e1065 0%, #0e0e10 70%)', base: '#150d24',
      kicker: 'A · LA FORMA', title: 'Cinco formas, un solo trazo.',
    },

    // B · EL DATO (12 s)
    {
      branch: 'b', type: 'brworld', label: 'EL DATO', duration: 6, kind: 'data',
      color: G, from: { x: 1450, y: 800 },
      bg: 'radial-gradient(120% 90% at 72% 75%, #064e3b 0%, #0e0e10 72%)', base: '#0b1a15',
      kicker: 'B · EL DATO', title: 'Los datos, en capas.',
      hintIx: 'MOVÉ EL MOUSE · LOS NÚMEROS TIENEN PROFUNDIDAD', hintLin: 'EN LA WEB, LA CÁMARA SIGUE AL MOUSE',
      items: [
        [HUB.length, 'TRÁILERES EN EL HUB'],
        [sum('animations'), 'ANIMACIONES'],
        [sum('duration') / 60, 'MINUTOS DE PELÍCULA', 1],
        [sum('events'), 'SONIDOS Y SEÑALES'],
        [sum('words'), 'PALABRAS EN PANTALLA'],
        [W.reduce((a, t) => a + t.scenes.length, 0), 'ESCENAS'],
      ],
      bars: W.map(t => t.duration),
      source: `HUB/CATALOG.JS · WRAPPED: ${W.length} TRÁILERES MEDIDOS EL ${dd}/${mm}/${yy} · BARRAS: LA DURACIÓN DE CADA UNO`,
    },
    {
      branch: 'b', type: 'brscrub', label: 'EL TIEMPO', duration: 6, color: G, length: 34,
      bg: 'radial-gradient(110% 90% at 50% 70%, #064e3b 0%, #0e0e10 70%)', base: '#0b1a15',
      kicker: 'B · EL DATO', title: 'El tiempo es tuyo.',
      hintIx: 'GIRÁ LA RUEDA · EL TIEMPO VA Y VUELVE', hintLin: 'EN LA WEB, LA RUEDA DEL MOUSE MUEVE EL TIEMPO',
    },

    // el final, compartido (12 s)
    {
      type: 'brmerge', label: 'MERGE', duration: 6, options: OPTS, kicker: 'MERGE', lead: 'Elegiste',
      sub: 'El otro camino sigue ahí.', button: '⑂  PROBÁ EL OTRO', linear: 'EN LA WEB, PODÉS VOLVER Y ELEGIR EL OTRO',
    },
    {
      type: 'brtitle', label: 'BIFURCACIÓN', duration: 6, title: 'BIFURCACIÓN', colors: [V, G],
      tagline: 'UN TRÁILER QUE SE ELIGE', legend: [['RUEDA', 'TIEMPO'], ['MOUSE', 'CÁMARA'], ['A / B', 'CAMINO']],
    },
  ],
});
