/* ============================================================================
   DEPLOY — del código al hub (#13 del hub).
   Prueba el módulo dev del kit: terminal con tipeo humano, editor con resaltado de
   sintaxis, pipeline de despliegue, treemap y un título monoespaciado.
   Nada inventado: todo lo que se ve corrió de verdad al armar este tráiler
   (DATA, inyectado por script):
   · la terminal muestra comandos reales con su salida real ($KIT = la carpeta del kit);
   · el editor muestra recipes-music.js con sus números de línea reales;
   · el pipeline es el chequeo real de los 14 tráileres publicados (estado, duración);
   · el treemap es el tamaño real de cada archivo del kit.
   ========================================================================== */
const DATA = {"checks":[{"id":"kinetic","title":"KINETIC","status":"ready","dur":52.1,"scenes":10,"wall":4.2},{"id":"manifiesto","title":"MANIFIESTO","status":"ready","dur":47.63,"scenes":9,"wall":3.5},{"id":"glitch","title":"GLITCH","status":"ready","dur":39.99,"scenes":9,"wall":3.3},{"id":"bauhaus","title":"BAUHAUS 100","status":"ready","dur":48.02,"scenes":10,"wall":2.7},{"id":"liquid","title":"LIQUID","status":"ready","dur":47.1,"scenes":11,"wall":4.3},{"id":"big-bang","title":"BIG BANG","status":"ready","dur":38.5,"scenes":7,"wall":3.2},{"id":"enjambre","title":"ENJAMBRE","status":"ready","dur":39.1,"scenes":7,"wall":4.8},{"id":"hyperspace","title":"HYPERSPACE","status":"ready","dur":49,"scenes":9,"wall":4},{"id":"paper-city","title":"PAPER CITY","status":"ready","dur":42.5,"scenes":7,"wall":4.5},{"id":"data-story","title":"DATA STORY","status":"ready","dur":48,"scenes":8,"wall":2.7},{"id":"global","title":"GLOBAL","status":"ready","dur":51.7,"scenes":7,"wall":3.2},{"id":"launch","title":"LAUNCH","status":"ready","dur":52.58,"scenes":8,"wall":2.6},{"id":"ecommerce","title":"ECOMMERCE","status":"ready","dur":90,"scenes":15,"wall":8.6},{"id":"ecommerce-remix","title":"ECOMMERCE REMIX","status":"ready","dur":60,"scenes":16,"wall":2.7}],"files":[{"name":"audio.js","bytes":16507},{"name":"engine.js","bytes":30278},{"name":"recipes-3d.js","bytes":43508},{"name":"recipes-city.js","bytes":33870},{"name":"recipes-cosmos.js","bytes":23448},{"name":"recipes-data.js","bytes":20994},{"name":"recipes-dev.js","bytes":26673},{"name":"recipes-glitch.js","bytes":22295},{"name":"recipes-globe.js","bytes":47303},{"name":"recipes-liquid.js","bytes":27834},{"name":"recipes-music.js","bytes":5748},{"name":"recipes-shop.js","bytes":54727},{"name":"recipes-swarm.js","bytes":27151},{"name":"recipes-type.js","bytes":17899},{"name":"recipes-ui.js","bytes":39875},{"name":"recipes.js","bytes":43291},{"name":"data/hl-032-238.js","bytes":43554},{"name":"data/land.js","bytes":43473},{"name":"style.css","bytes":70516}],"excerpt":[{"n":45,"text":"        const root = ch[0] - 12;"},{"n":46,"text":"        if (st === 'groove' || st === 'drive') {"},{"n":47,"text":"          if (e % 2 === 0) sfx('kick', t, 0.5 * v);"},{"n":48,"text":"          if (e === 2 || e === 6) sfx('clap', t, 0.28 * v);"},{"n":49,"text":"          if (e % 2 === 1) sfx('hat', t, 0.07 * v);"},{"n":50,"text":"          if (st === 'drive' && e % 2 === 0) sfx('hat', t, 0.035 * v);"},{"n":51,"text":"          const bassPat = { 0: 0, 3: 12, 4: 0, 6: 7, 7: 12 };"},{"n":52,"text":"          if (e in bassPat) sfx('bass', t, hz(root + bassPat[e]), 0.26 * v);"},{"n":53,"text":"          if (e % 2 === 1) sfx('plip', t, 0.03 * v, hz(ch[(e >> 1) % 3] + 24));"},{"n":54,"text":"          // the hook answers in the second half of every 4-bar phrase"},{"n":55,"text":"          const ph = ((bar % 4) + 4) % 4;"},{"n":56,"text":"          if (st === 'groove' && ph >= 2) {"},{"n":57,"text":"            const note = riff[(ph - 2) * 8 + e];"},{"n":58,"text":"            if (note != null) sfx('bell', t, hz(note), 0.045 * v, 0.9);"},{"n":59,"text":"          }"}],"ls":["bauhaus     deploy       enjambre  hyperspace  liquid","big-bang    ecommerce       glitch    kinetic     manifiesto","data-story  ecommerce-remix  global    launch     paper-city"],"wc":"  9545 total","check":["status   : ready","duration : 51.70s","scenes   :","    0.00s  globeintro     8s  MAPA","    8.00s  globeroutes  12.7s  RUTAS","   20.70s  globeclock   7.5s  DÍA Y NOCHE","   28.20s  globepulse   9.5s  PASAJEROS","   37.70s  globetitle     7s  GLOBAL","   44.70s  statement    3.3s  ","   48.00s  credits      3.7s"],"recipes":84};
const G = { bg: '#0d1117', ink: '#e6edf3', muted: '#8b949e', green: '#3fb950', blue: '#58a6ff', purple: '#d2a8ff', orange: '#ffa657', red: '#ff7b72', cyan: '#79c0ff', yellow: '#e3b341' };
const es = new Intl.NumberFormat('es-AR'), es1 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- terminal: real commands, real output
const lsOut = DATA.ls.map(l => esc(l).replace(/(\S+)/g, '<span class="tt-b">$1</span>'));
const wcOut = [esc(DATA.wc).replace(/(\d+)/, '<span class="tt-w">$1</span>')];
const checkOut = DATA.check.map(l => esc(l).replace(/: ready/, ': <span class="tt-g">ready</span>').replace(/^(duration\s*: )(\S+)/, '$1<span class="tt-w">$2</span>').replace(/^(\s+\S+s\s+)(\S+)/, '$1<span class="tt-c">$2</span>'));
const LINES = +DATA.wc.trim().split(/\s+/)[0];

// ---- treemap: every kit file, grouped
const GROUP = f => (/^(engine|audio|recipes|recipes-music)\.js$/.test(f) ? 'núcleo'
  : /cosmos|swarm|3d|city/.test(f) ? 'WebGL · 3D'
  : /globe|data\//.test(f) ? 'geo'
  : /\.css$/.test(f) ? 'estilos' : '2D');
const FILES = DATA.files.map(f => ({ name: f.name, value: f.bytes / 1024, group: GROUP(f.name) }));
const KB = FILES.reduce((s, f) => s + f.value, 0);

// ---- pipeline: the real check of every published trailer
const CHECKS = DATA.checks, OK = CHECKS.filter(c => c.status === 'ready').length;

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'DEPLOY', subtitle: 'DEL CÓDIGO AL HUB', hud: 'KINETIC STUDIO — DEPLOY', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: G.bg, ink: G.bg, paper: G.ink, accents: [G.green, G.blue, G.purple, G.orange, G.red, G.cyan], glow: G.blue },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true, preload: ['800 100px "JetBrains Mono"', '500 20px "JetBrains Mono"'] },

  // the groove is recipes-music.js — the same code the editor shows
  music: {
    bpm: 120, volume: 0.8, chords: Trailer.music.MINOR, riff: Trailer.music.RIFF_MINOR,
    parts: [
      { from: 0.5, to: 15, style: 'tension' },
      { from: 15, to: 25, style: 'soft' },
      { from: 25, style: 'hit', volume: 0.6 },
      { from: 25, to: 32.5, style: 'house' },
      { from: 32.5, to: 42.5, style: 'drive' },
      { from: 42.5, to: 44, style: 'tension' },
      { from: 44, to: 46, style: 'build' },
      { from: 46.5, to: 55, style: 'soft', volume: 0.7 },
    ],
  },

  scenes: [
    // ACTO I — una terminal
    {
      type: 'terminal', label: 'TERMINAL', duration: 15, title: 'zsh — animations', caption: 'todo empieza en una terminal',
      prompt: '<span class="tt-g">➜</span> <span class="tt-b">animations</span> <span class="tt-m">$</span> ',
      cmds: [
        { cmd: 'ls trailers', out: lsOut, wait: 0.8, base: 0.05 },
        { cmd: 'wc -l $KIT/template/js/*.js $KIT/template/css/style.css | tail -1', out: wcOut, wait: 0.35, think: 0.3, base: 0.018 },
        { cmd: 'node $KIT/tools/shoot.mjs trailers/global/index.html --check', out: checkOut, wait: 0.35, think: 0.9, base: 0.018 },
      ],
    },

    // ACTO II — el código
    {
      type: 'code', label: 'CÓDIGO', duration: 10, speed: 0.02, zoom: 1.3, file: 'recipes-music.js', tabs: ['engine.js', 'style.css'], title: 'trailer-kit — recipes-music.js',
      branch: 'trailer-kit', lines: DATA.excerpt, typed: [47, 48, 49], eval: { n: 47, text: '→ 4 bombos por compás' },
      caption: 'la música de este tráiler también es código',
    },
    {
      type: 'treemap', label: 'EL KIT', kicker: '02 · EL KIT', title: 'De qué está hecho el kit',
      sub: `Kilobytes por archivo · ${FILES.length} archivos, ${es1.format(KB)} kB en total · sin imágenes ni videos`,
      data: FILES, format: v => `${es1.format(v)} kB`,
      groups: { 'núcleo': G.blue, '2D': G.green, 'WebGL · 3D': G.purple, 'geo': G.orange, 'estilos': G.cyan },
      source: 'TAMAÑO REAL DE CADA ARCHIVO DEL KIT, MEDIDO AL ARMAR ESTE TRÁILER', caption: 'cada módulo, un tráiler',
    },

    // ACTO III — el deploy
    {
      type: 'pipeline', label: 'DEPLOY', window: 'deploy — trailer hub', title: 'Deploy al hub',
      sub: `Chequeo real de los ${CHECKS.length} tráileres publicados antes de sumar el siguiente`,
      running: 'Corriendo', doneLabel: 'Publicado', rowH: 31, gap: 0.3,
      stages: [
        { name: 'Chequeo', detail: `${OK}/${CHECKS.length} cargan sin errores` },
        { name: 'Cuadros', detail: '3 por escena · hojas de contacto', time: 0.8 },
        { name: 'Determinismo', detail: 'adelante = atrás', time: 0.8 },
        { name: 'Publicar', detail: 'hub/catalog.js', time: 0.8 },
      ],
      cols: ['TRÁILER', 'CHEQUEO', 'DURACIÓN', 'ESTADO'],
      rows: CHECKS.map(c => ({ name: c.title, value: `${es1.format(c.dur)} s`, status: c.status === 'ready' ? '✓ listo' : '✗ error' })),
      total: `${OK}/${CHECKS.length} · 0 ERRORES`, caption: 'cada tráiler, chequeado antes de publicar',
    },
    { type: 'devtitle', label: 'PUBLICADO', title: 'deploy', prompt: '$', done: '✓ publicado en el hub · trailers/deploy', tagline: 'DEL CÓDIGO AL HUB' },
    { type: 'statement', text: 'EL CÓDIGO <span>ES LA PELÍCULA.</span>', accent: G.green, bg: G.bg },
    {
      type: 'credits', mark: false,
      stats: [[String(CHECKS.length + 1), 'TRÁILERES EN EL HUB'], [String(DATA.recipes), 'RECETAS EN EL KIT'], [es.format(LINES), 'LÍNEAS DE CÓDIGO'], ['0', 'ARCHIVOS DE VIDEO']],
      line: 'TODO LO QUE VISTE CORRIÓ DE VERDAD: COMANDOS, CÓDIGO Y CHEQUEOS',
    },
  ],
});
