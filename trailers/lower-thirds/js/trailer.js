/* ============================================================================
   LOWER THIRDS — pack de rótulos, zócalos y transiciones (#16 del hub).
   No es un tráiler: son 13 componentes reutilizables. Sin parámetros se ve el
   showreel (cada componente sobre un fondo que simula video; a la derecha, en
   algunos, un damero que muestra la transparencia). Con ?solo=<id> se ve UN
   componente solo, con fondo transparente, listo para exportar:
     node ~/.claude/trailer-kit/tools/frames.mjs index.html --alpha --query solo=nombre-barra
   → secuencia PNG con alfa para Premiere, DaVinci Resolve, After Effects o Final Cut.
   ?solo=<id>&chroma=00b140 lo da sobre croma verde. Los nombres son de ejemplo.
   ========================================================================== */
const INK = '#0e0e10', PAPER = '#f7f4ee', ORANGE = '#ff4d2e', BLUE = '#2b50ff';
const Q = new URLSearchParams(location.search), SOLO = Q.get('solo');

// the pack: [id, name, scene]
const PACK = [
  ['nombre-barra', 'Nombre · barra', { type: 'ltname', style: 'bar', name: 'Sofía Ramírez', role: 'Directora de arte' }],
  ['nombre-linea', 'Nombre · línea', { type: 'ltname', style: 'line', name: 'Martín Acosta', role: 'Productor ejecutivo' }],
  ['nombre-bloque', 'Nombre · bloque Bauhaus', { type: 'ltname', style: 'block', name: 'Lucía Fernández', role: 'DISEÑO · MOTION', split: 0.42 }],
  ['nombre-capsula', 'Nombre · cápsula', { type: 'ltname', style: 'pill', name: 'Tomás Herrera', role: 'Invitado especial' }],
  ['ubicacion', 'Ubicación', { type: 'ltlocation', place: 'BUENOS AIRES', detail: 'ARGENTINA · 34°36′S 58°22′O' }],
  ['redes', 'Redes sociales', { type: 'ltsocial', kicker: 'SEGUINOS EN', handle: '@kinetic.studio' }],
  ['en-vivo', 'En vivo + zócalo corrido', {
    type: 'ltlive', duration: 5, badge: 'EN VIVO', clock: '20:00 HS', tickerLabel: 'ÚLTIMO',
    items: ['Rótulos listos para cualquier editor de video', 'Fondo transparente con ?alpha', 'Secuencias PNG con frames.mjs', 'Hecho 100% con código'],
  }],
  ['capitulo', 'Capítulo', { type: 'ltchapter', num: '02', title: 'EL MÉTODO' }],
  ['llamada', 'Llamada de atención', { type: 'ltcallout', text: 'MIRÁ ESTO', sub: 'UN DETALLE IMPORTANTE', x: 1180, y: 430 }],
  ['transicion-iris', 'Transición · iris', { type: 'ltwipe', style: 'iris' }],
  ['transicion-barras', 'Transición · barras', { type: 'ltwipe', style: 'bars' }],
  ['transicion-formas', 'Transición · formas', { type: 'ltwipe', style: 'shapes', split: 0.42 }],
  ['transicion-persianas', 'Transición · persianas', { type: 'ltwipe', style: 'blinds' }],
];
const fmt1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
const lenOf = s => s.duration || (s.type === 'ltwipe' ? 1.5 : 3.5);
const REEL = PACK.map(([id, name, s], i) => ({ ...s, label: name.toUpperCase(), tag: `${String(i + 1).padStart(2, '0')}/${PACK.length} · ${id} · ${fmt1.format(lenOf(s))} s` }));
const one = PACK.find(([id]) => id === SOLO);

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'LOWER THIRDS', subtitle: 'PACK DE RÓTULOS Y TRANSICIONES', hud: 'KINETIC STUDIO — LOWER THIRDS', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: INK, ink: INK, paper: PAPER, accents: [ORANGE, BLUE, '#ffc21a', '#d4ff3a', '#ff2e88', '#6a2bff'], glow: ORANGE },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
  lower: { accent: ORANGE, accent2: BLUE, ink: INK, paper: PAPER, glass: 'rgba(12, 12, 16, .72)' },
  // solo: one component, transparent (unless a chroma colour is asked for); reel: the stand-in footage plate
  transparent: !!one && !Q.get('chroma'),
  plate: one ? null : { colors: ['#10283c', '#1d6b73', '#c9803a', '#6d3b7a'] },
  music: one ? null : {
    bpm: 120, volume: 0.7,
    parts: [{ from: 0.5, to: 4, style: 'tension' }, { from: 4, style: 'hit', volume: 0.5 }, { from: 4, to: 48.5, style: 'soft' }],
  },

  scenes: one ? [{ ...one[2] }] : [
    { type: 'ltreel', label: 'PACK', kicker: 'KINETIC STUDIO · PACK', title: 'LOWER THIRDS', sub: 'RÓTULOS · ZÓCALOS · TRANSICIONES · FONDO TRANSPARENTE' },
    ...REEL,
    {
      type: 'ltindex', label: 'ÍNDICE', kicker: 'EL PACK', title: `${PACK.length} componentes, listos para exportar`,
      items: PACK.map(([id, name]) => [id, name]),
      cmd: 'node frames.mjs trailers/lower-thirds/index.html --alpha --query solo=nombre-barra',
    },
  ],
});
