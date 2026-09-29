/* ============================================================================
   LAUNCH — el tráiler de producto de KINETIC STUDIO (#12 del hub).
   Prueba el módulo ui del kit: una interfaz real en HTML/CSS que se arma sola,
   un cursor que hace clics, tipeo humano, un modal con barra de progreso,
   notificaciones apiladas, una fila que entra y empuja a las demás (FLIP),
   el cambio a modo oscuro con un círculo y una vista explotada en 3D.
   El "producto" es este mismo estudio: cada número del panel es real y sale de
   un script que lee el hub y el kit (DATA, más abajo). La duración y la cantidad
   de escenas de LAUNCH se miden del propio film una vez armado ({dur}, {scenes}).
   ========================================================================== */
const DATA = {"trailers":[{"title":"KINETIC","category":"Estudio","duration":52,"palette":["#0e0e10","#ff4d2e","#2b50ff"]},{"title":"MANIFIESTO","category":"Tipografía","duration":48,"palette":["#f2ede4","#0e0e10","#ff4d2e"]},{"title":"GLITCH","category":"Efectos","duration":40,"palette":["#0a0a0a","#00ff9c","#ff2e88"]},{"title":"BAUHAUS 100","category":"Formas","duration":48,"palette":["#f2ede4","#e63922","#1d4ed8"]},{"title":"LIQUID","category":"Formas","duration":47,"palette":["#1e0b3a","#7c3aed","#22d3ee"]},{"title":"BIG BANG","category":"Partículas","duration":38,"palette":["#0b1026","#8b5cf6","#fbbf24"]},{"title":"ENJAMBRE","category":"Partículas","duration":39,"palette":["#0f172a","#22d3ee","#f8fafc"]},{"title":"HYPERSPACE","category":"3D","duration":49,"palette":["#020617","#3b82f6","#e879f9"]},{"title":"PAPER CITY","category":"3D","duration":43,"palette":["#fde68a","#f97316","#1e293b"]},{"title":"DATA STORY","category":"Datos","duration":48,"palette":["#0f172a","#10b981","#f59e0b"]},{"title":"GLOBAL","category":"Datos","duration":52,"palette":["#031525","#38bdf8","#f472b6"]}],"ideas":23,"recipes":66,"modules":11,"lines":7706};
const es = new Intl.NumberFormat('es-AR');
const int = v => es.format(Math.round(v));
const mmss = v => { const s = Math.round(v); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const N = DATA.trailers.length, TOTAL = DATA.trailers.reduce((s, t) => s + t.duration, 0);
const RECENT = DATA.trailers.slice(-6).reverse();

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'LAUNCH', subtitle: 'KINETIC STUDIO', hud: 'KINETIC STUDIO — LAUNCH', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#0b0b12', ink: '#12142a', paper: '#eef0ff', accents: ['#6366f1', '#a5f3fc', '#ec4899', '#22c55e', '#8b5cf6', '#f59e0b'], glow: '#6366f1' },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  // the dashboard every ui scene is built from
  app: {
    name: 'KINETIC STUDIO', window: 'KINETIC STUDIO — PANEL', page: 'Panel', search: 'Buscar tráileres, recetas…', button: 'Nuevo tráiler', user: 'KS',
    nav: ['Panel', 'Tráileres', 'Recetas', 'Kit', 'Ajustes'],
    kpis: [
      { label: 'Tráileres publicados', value: N, after: N + 1, format: int, sub: `de ${DATA.ideas} ideas en la lista`, delta: '+1' },
      { label: 'Minutos de película', value: TOTAL, after: s => TOTAL + s.dur, format: mmss, sub: 'sin un solo archivo de video' },
      { label: 'Recetas en el kit', value: DATA.recipes, format: int, sub: `en ${DATA.modules} módulos` },
      { label: 'Líneas de código', value: DATA.lines, format: int, sub: 'JavaScript y CSS del kit' },
    ],
    chart: {
      title: 'Duración por tráiler', sub: 'Segundos, en orden de producción', max: 60,
      data: DATA.trailers.map(t => [t.title, t.duration]), format: v => `${Math.round(v)} s`, self: 'LAUNCH',
    },
    list: {
      title: 'Recientes', sub: 'Publicados en el hub',
      rows: RECENT.map(t => ({ title: t.title, meta: `${t.category} · ${t.duration} s`, pill: 'Publicado', colors: t.palette.slice(1) })),
      self: { title: 'LAUNCH', meta: 'Producto · {dur} s', pill: 'Nuevo', colors: ['#6366f1', '#a5f3fc'] },
    },
  },

  scenes: [
    // ACTO I — un pedido
    { type: 'uiprompt', label: 'PEDIDO', kicker: 'KINETIC STUDIO', placeholder: 'Buscar o crear…', text: 'Crear un tráiler de lanzamiento', typo: { at: 9, char: 'r' }, enter: 'ENTER ⏎' },

    // ACTO II — el producto, trabajando
    { type: 'uibuild', label: 'PANEL', caption: 'Todo tu estudio, <i>en un tablero.</i>' },
    {
      type: 'uiflow', label: 'CREAR', caption: 'Un clic. <i>Un tráiler.</i>',
      modal: {
        title: 'Nuevo tráiler', sub: 'Todo se genera en código: sin video y sin imágenes.', nameLabel: 'Nombre', name: 'LAUNCH',
        chipsLabel: 'Plantilla', chips: ['Producto', 'Datos', 'Tipografía'], pick: 0, switchLabel: 'Con sonido sintetizado',
        go: 'Renderizar', done: 'Listo', progress: 'ESCENA',
      },
    },
    {
      type: 'uinotify', label: 'PUBLICAR', caption: 'Publicado. <i>Ya está en el hub.</i>',
      toasts: [
        { icon: 'check', title: 'LAUNCH renderizado', sub: '{scenes} escenas · 0 archivos de video' },
        { icon: 'up', title: 'Publicado en el hub', sub: 'trailers/launch' },
        { icon: 'spark', title: `Ya son ${N + 1} tráileres`, sub: `de ${DATA.ideas} ideas en la lista` },
      ],
    },
    { type: 'uitheme', label: 'TEMA', caption: 'De día. <i>De noche.</i>' },

    // ACTO III — de qué está hecho, y la marca
    { type: 'uiexplode', label: 'CAPAS', caption: 'Cada capa, <i>puro código.</i>' },
    { type: 'uititle', label: 'KINETIC STUDIO', title: 'KINETIC STUDIO', tagline: 'TRÁILERES HECHOS CON CÓDIGO', cta: 'Abrir el hub' },
    {
      type: 'credits', mark: false,
      stats: [[String(N + 1), 'TRÁILERES EN EL HUB'], [String(DATA.recipes), 'RECETAS EN EL KIT'], [int(DATA.lines), 'LÍNEAS DE CÓDIGO'], ['0', 'ARCHIVOS DE VIDEO']],
      line: 'TODO LO QUE VISTE ES HTML, CSS Y JAVASCRIPT',
    },
  ],
});
