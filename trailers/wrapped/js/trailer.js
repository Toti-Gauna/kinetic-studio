/* ============================================================================
   WRAPPED — tu año en números (#21 del hub).
   Una plantilla alimentada por datos: el mismo tráiler sirve para N perfiles.
   Los datos son reales: tools/measure.mjs abre cada tráiler publicado del hub y mide
   su duración, escenas, animaciones (interpolaciones en la línea de tiempo), eventos
   (sonidos y señales), palabras en pantalla y recetas; la categoría y la paleta vienen
   de hub/catalog.js. Todo queda en js/data/wrapped-data.js (window.WRAPPED_DATA).
     · sin parámetros: el año del estudio (los 22 tráileres sumados);
     · ?who=<id>: el año de un tráiler (?who=kinetic, ?who=noir, ?who=beat…).
   Trailer.wrapped.scenes(perfil) convierte el perfil en las escenas.
   ========================================================================== */
const DATA = window.WRAPPED_DATA;
const ALL = DATA.trailers, N = ALL.length;
const es = (v, d = 0) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const sum = k => ALL.reduce((a, t) => a + t[k], 0);
const { vivid, sat } = Trailer.wrapped;
const SET = ['#1ed760', '#ff90e8', '#2d46b9', '#ff6437', '#fff45a', '#af2896'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const [yy, mm, dd] = DATA.measured.split('-').map(Number);
const UNTIL = `Medido el ${dd} de ${MESES[mm - 1]} de ${yy}`;
const lista = xs => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);
/** 1 + how many trailers beat this one on `k` */
const rank = (t, k) => 1 + ALL.filter(o => o[k] > t[k]).length;
const puesto = (r, what) => (r === 1 ? `El número 1 de los ${N} tráileres del hub en ${what}.` : `Puesto ${r} de ${N} en ${what}.`);

const who = new URLSearchParams(location.search).get('who');
const me = ALL.find(t => t.id === who);

// the deck: everyone's card from the same template (yours last, on top)
const deckCards = [...ALL.filter(t => t !== me), ...(me ? [me] : [])].map(t => ({ name: t.title, bg: vivid(t.palette), value: t.animations, strip: t.palette, me: t === me }));
const deck = {
  kicker: `WRAPPED ${yy}`, unit: 'ANIMACIONES', cards: deckCards, land: 4,
  lines: ['UNA PLANTILLA.', `${N} HISTORIAS.`],
  sub: 'El mismo tráiler, armado con los datos de cada uno.',
  hint: me ? `?who=${me.id} · ?who=${ALL.find(t => t !== me && t.id === 'noir') ? 'noir' : ALL[0].id} · sin ?who: el estudio` : '?who=kinetic · ?who=noir · ?who=beat',
};

function studio() {
  const secs = sum('duration'), cats = {};
  ALL.forEach(t => { (cats[t.category] = cats[t.category] || []).push(t.title); });
  const [cat, inCat] = Object.entries(cats).sort((a, b) => b[1].length - a[1].length)[0];
  const top = [...ALL].sort((a, b) => b.animations - a.animations).slice(0, 5);
  const colors = ALL.map(t => [vivid(t.palette), t.title]);
  return {
    name: 'KINETIC STUDIO', kicker: 'KINETIC STUDIO · WRAPPED', line1: 'TU', year: String(yy), until: UNTIL,
    colors: SET,
    stats: [
      { label: 'TRÁILERES', kicker: 'TU AÑO EN EL HUB', lead: 'Este año publicaste', value: N, unit: 'TRÁILERES', sub: 'Todos hechos con código: ni un archivo de video, de imagen o de audio.' },
      { label: 'MINUTOS', kicker: 'SI LOS MIRÁS DE CORRIDO', lead: 'Todos seguidos duran', value: secs / 60, decimals: 1, unit: 'MINUTOS', sub: `Son ${es(secs, 1)} segundos de línea de tiempo.` },
      { label: 'ANIMACIONES', kicker: 'LO QUE SE MUEVE', lead: 'Se mueven con', value: sum('animations'), unit: 'ANIMACIONES', sub: 'Cada una es una interpolación en la línea de tiempo maestra.' },
      { label: 'EVENTOS', kicker: 'LO QUE SUENA', lead: 'Y disparan', value: sum('events'), unit: 'EVENTOS', sub: 'Sonidos y señales, cada uno en su segundo exacto.' },
      { label: 'CATEGORÍA', kicker: 'TU CATEGORÍA FAVORITA', lead: 'Lo que más hiciste fue', text: cat.toUpperCase(), sub: `${inCat.length} de tus ${N} tráileres: ${lista(inCat)}.` },
    ],
    top: { kicker: 'TOP 5 · ANIMACIONES', title: 'LOS QUE MÁS SE MUEVEN', items: top.map(t => [t.title, t.animations]) },
    palette: { kicker: 'UN COLOR POR TRÁILER', title: `TU AÑO EN ${N} COLORES`, swatches: colors },
    summary: {
      kicker: `MI ${yy} · WRAPPED`, cta: 'COMPARTIR', strip: colors.map(c => c[0]),
      rows: [['TRÁILERES', es(N)], ['MINUTOS', es(secs / 60, 1)], ['ANIMACIONES', es(sum('animations'))], ['EVENTOS', es(sum('events'))], ['PALABRAS', es(sum('words'))], ['CATEGORÍA TOP', cat.toUpperCase()]],
    },
    deck,
  };
}

function trailer(t) {
  const d = t.duration % 1 ? 1 : 0;
  const own = [vivid(t.palette), ...t.palette.filter(c => sat(c) > 0.4)];
  const colors = [...new Set([...own, ...SET])].slice(0, 6);
  const top = t.scenes.map((s, i) => [s.label || `ESCENA ${i + 1}`, s.dur]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return {
    name: t.title, kicker: 'KINETIC STUDIO · WRAPPED', line1: 'TU', year: String(yy), until: UNTIL,
    colors,
    stats: [
      { label: 'DURACIÓN', kicker: 'TU DURACIÓN', lead: 'Durás', value: t.duration, decimals: d, unit: 'SEGUNDOS', sub: puesto(rank(t, 'duration'), 'duración') },
      { label: 'ESCENAS', kicker: 'TU HISTORIA', lead: 'La contás en', value: t.scenes.length, unit: 'ESCENAS', sub: `Con ${t.recipes} recetas distintas del kit.` },
      { label: 'ANIMACIONES', kicker: 'TU MOVIMIENTO', lead: 'Te movés con', value: t.animations, unit: 'ANIMACIONES', sub: puesto(rank(t, 'animations'), 'movimiento') },
      { label: 'EVENTOS', kicker: 'TU SONIDO', lead: 'Disparás', value: t.events, unit: 'EVENTOS', sub: puesto(rank(t, 'events'), 'sonidos y señales') },
      { label: 'PALABRAS', kicker: 'TUS PALABRAS', lead: 'En pantalla escribís', value: t.words, unit: 'PALABRAS', sub: puesto(rank(t, 'words'), 'palabras') },
    ],
    top: { kicker: 'TOP 5 · SEGUNDOS', title: 'TUS ESCENAS MÁS LARGAS', unit: ' s', decimals: 1, items: top },
    palette: { kicker: 'TU PALETA', title: `TUS ${t.palette.length} COLORES`, swatches: t.palette },
    summary: {
      kicker: `MI ${yy} · WRAPPED`, cta: 'COMPARTIR', strip: t.palette,
      rows: [['DURACIÓN', `${es(t.duration, d)} s`], ['ESCENAS', es(t.scenes.length)], ['ANIMACIONES', es(t.animations)], ['EVENTOS', es(t.events)], ['PALABRAS', es(t.words)], ['CATEGORÍA', t.category.toUpperCase()]],
    },
    deck,
  };
}

const profile = me ? trailer(me) : studio();

Trailer.run({
  stage: { w: 1080, h: 1920 },
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'WRAPPED', subtitle: me ? `EL ${yy} DE ${me.title}` : 'TU AÑO EN NÚMEROS', hud: me ? `WRAPPED — ${me.title}` : 'KINETIC STUDIO — WRAPPED', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#121212', ink: '#121212', paper: '#ffffff', accents: SET, glow: '#1ed760' },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
  music: {
    bpm: 120, volume: 0.85,
    parts: [
      { from: 0, to: 4, style: 'pulse' },
      { from: 4, style: 'hit' },
      { from: 4, to: 19, style: 'groove' },
      { from: 19, to: 25, style: 'drive' },
      { from: 25, to: 29, style: 'soft', volume: 0.8 },
      { from: 29, style: 'hit', volume: 0.7 },
      { from: 29, to: 35, style: 'groove' },
      { from: 35, to: 39, style: 'build' },
      { from: 39, style: 'hit' },
      { from: 39, to: 43, style: 'soft', volume: 0.7 },
    ],
  },
  // 4 + 5 × 3 + 6 + 4 + 6 + 8 = 43 s; each card starts on a beat
  scenes: Trailer.wrapped.scenes(profile).map(s => ({
    ...s,
    duration: { wrcover: 4, wrstat: 3, wrtop: 6, wrcolors: 4, wrsummary: 6, wrdeck: 8 }[s.type],
  })),
});
