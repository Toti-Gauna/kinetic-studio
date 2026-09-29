/* ============================================================================
   ECOMMERCE REMIX — the same store, cut as a trailer. 60 s, 120 BPM, A minor.
   Built on ECOMMERCE (v1): same catalogue, same Argentina, same honesty rules, but
   · a cold open (a question in the dark, one click), a Bauhaus montage on the eighths,
   · a DROP with the title + REMIX stamp,
   · the store at speed: every UI scene time-warped to fit its bar, a moving 3D camera
     and whip-pans, interleaved with full-frame word slams,
   · a breakdown over Argentina, a stat punch of REAL figures, a second DROP for the admin,
   · the line: "ECOMMERCE · TODO A UN CLICK".
   Real: 24 jurisdicciones, capital coordinates, La Quiaca–Ushuaia 3.643 km (computed here).
   Demo (labelled on screen): prices, sales, orders.
   ========================================================================== */
const CELESTE = '#74acdf', SOL = '#f6b40e', ROJO = '#e63922', AZUL = '#1d4ed8', INK = '#0f1b2d', PAPER = '#f5f8fc', DEEP = '#1f7bc6', WHITE = '#ffffff';
const es = new Intl.NumberFormat('es-AR'), es2 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const int = v => es.format(Math.round(v)), peso = v => `$ ${int(v)}`;

Object.assign(Trailer.ui.THEMES.light, { accent: DEEP, chip: '#e3f0fb', hot: ROJO });

// ---- store (demo catalogue; prices are sample data)
const PRODUCTS = [
  { name: 'Mate de calabaza', price: 18900, art: 'mate', bg: '#fde8c8' },
  { name: 'Termo acero 1 L', price: 42500, art: 'termo', bg: '#dbeaf7' },
  { name: 'Yerba orgánica 1 kg', price: 6800, art: 'yerba', bg: '#fff1c2' },
  { name: 'Alfajores x 12', price: 14400, art: 'alfajor', bg: '#f3e2d6' },
];
const IN_CART = 3, TOTAL = PRODUCTS.slice(0, IN_CART).reduce((s, p) => s + p.price, 0);
const METHODS = [
  { icon: 'card', name: 'Tarjeta de crédito', sub: 'En cuotas' },
  { icon: 'debit', name: 'Tarjeta de débito', sub: 'En un pago' },
  { icon: 'bank', name: 'Transferencia', sub: 'CBU o alias' },
  { icon: 'qr', name: 'Billetera virtual', sub: 'Con QR' },
  { icon: 'cash', name: 'Efectivo', sub: 'En puntos de pago' },
];

// ---- real geography: CABA + the 23 provincial capitals
const CABA = { name: 'CABA', lat: -34.6037, lon: -58.3816 };
const CAPITALS = [
  ['La Plata', -34.9214, -57.9545], ['Catamarca', -28.4696, -65.7852], ['Resistencia', -27.4514, -58.9867], ['Rawson', -43.3002, -65.1023],
  ['Córdoba', -31.4201, -64.1888], ['Corrientes', -27.4692, -58.8306], ['Paraná', -31.7413, -60.5115], ['Formosa', -26.1775, -58.1781],
  ['San Salvador de Jujuy', -24.1858, -65.2995], ['Santa Rosa', -36.6203, -64.2906], ['La Rioja', -29.4131, -66.8558], ['Mendoza', -32.8895, -68.8458],
  ['Posadas', -27.3671, -55.8961], ['Neuquén', -38.9516, -68.0591], ['Viedma', -40.8135, -62.9967], ['Salta', -24.7821, -65.4232],
  ['San Juan', -31.5375, -68.5364], ['San Luis', -33.295, -66.3356], ['Río Gallegos', -51.623, -69.2168], ['Santa Fe', -31.6333, -60.7],
  ['Santiago del Estero', -27.7834, -64.2642], ['Ushuaia', -54.8019, -68.303], ['San Miguel de Tucumán', -26.8083, -65.2176],
].map(([name, lat, lon]) => ({ name, lat, lon }))
  .sort((a, b) => Trailer.geo.dist(CABA, a) - Trailer.geo.dist(CABA, b));
const KM = Math.round(Trailer.geo.dist({ lat: -22.1056, lon: -65.593 }, { lat: -54.8019, lon: -68.303 })); // La Quiaca → Ushuaia

// ---- demo sales (sample data, labelled on screen)
const MONTH = 4820000, ORDERS = 312;
const raw = Array.from({ length: 30 }, (_, d) => 1 + 0.22 * Math.sin((2 * Math.PI * (d + 2)) / 7) + 0.018 * d + 0.06 * Math.sin(d * 2.7));
const kk = MONTH / raw.reduce((a, b) => a + b, 0);
const SERIES = raw.map(v => Math.round(v * kk));
SERIES[29] += MONTH - SERIES.reduce((a, b) => a + b, 0);
const PROV = [['BUENOS AIRES', 1.52], ['CABA', 1.08], ['CÓRDOBA', 0.61], ['SANTA FE', 0.47], ['MENDOZA', 0.29], ['TUCUMÁN', 0.18], ['SALTA', 0.15], ['NEUQUÉN', 0.14], ['ENTRE RÍOS', 0.13], ['CHUBUT', 0.13], ['OTRAS', 0.12]];
const SHOP_BG = '<div class="sh-bg"><i class="sh-b1"></i><i class="sh-b2"></i><i class="sh-b3"></i></div>';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'ECOMMERCE REMIX', subtitle: 'TODO A UN CLICK', hud: 'ECOMMERCE REMIX — TODO A UN CLICK', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#05070d', ink: INK, paper: PAPER, accents: [CELESTE, SOL, ROJO, AZUL, '#12a150', DEEP], glow: DEEP },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
  globe: { rows: 230, colors: { land: '#4f7fae', hl: WHITE, arc: SOL, atmo: CELESTE, grat: CELESTE, head: WHITE, pin: WHITE } },

  // house in A minor: tension → build → DROP → store → breakdown → build → DROP → stutter → finale
  music: {
    bpm: 120, volume: 0.9, chords: Trailer.music.MINOR, riff: Trailer.music.RIFF_MINOR,
    parts: [
      { from: 0, to: 4, style: 'tension' },
      { from: 4, to: 8, style: 'build' },
      { from: 8, style: 'hit' },
      { from: 8, to: 32, style: 'house' },
      { from: 32, to: 38, style: 'half' },
      { from: 38, to: 42, style: 'build' },
      { from: 42, style: 'hit' },
      { from: 42, to: 53.5, style: 'house' },
      { from: 53.5, to: 54, style: 'stutter' },
      { from: 54, style: 'hit' },
      { from: 54, to: 57, style: 'house' },
      { from: 57, style: 'hit' },
      { from: 57, to: 59, style: 'soft' },
    ],
  },

  shop: {
    name: 'tu tienda', window: 'TU TIENDA', nav: ['Inicio', 'Mate', 'Almacén', 'Regalos'], search: 'Buscar productos…',
    loginLabel: 'Ingresar', user: { initial: 'S', hello: 'Hola, Sofía' },
    hero: { kicker: 'HECHO EN ARGENTINA', title: 'Lo mejor del país, <i>en tu casa.</i>', sub: 'Envíos a todo el país · Pagá como quieras', cta: 'Ver productos' },
    section: 'Destacados', seeAll: 'Ver todo', addLabel: 'Agregar', addedLabel: 'Listo',
    products: PRODUCTS.map(p => ({ ...p, price: peso(p.price) })),
    login: { title: 'Ingresá a tu cuenta', sub: 'Tus compras y tus envíos, en un solo lugar.', emailLabel: 'E-mail', email: 'sofia@example.com', passLabel: 'Contraseña', password: 'mate1234', go: 'Ingresar', alt: '¿No tenés cuenta? Registrate' },
    checkout: {
      title: 'Tu carrito', count: n => `${n} productos`, unit: '1 unidad',
      shipLabel: 'Envío', postcode: '5000', calc: 'Calcular', shipTo: 'Córdoba · CP 5000', shipSub: 'Envío a domicilio', shipPrice: 'Gratis',
      payLabel: 'Pagá con', methods: METHODS,
      totalLabel: 'Total', total: peso(TOTAL), payGo: 'Pagar', doneTitle: '¡Compra confirmada!', doneSub: 'Te avisamos cuando salga tu envío.',
    },
  },
  app: {
    name: 'TU TIENDA', window: 'TU TIENDA — ADMIN', page: 'Panel de ventas', search: 'Buscar pedidos, productos…', button: 'Nuevo producto', user: 'S',
    nav: ['Panel', 'Productos', 'Pedidos', 'Clientes', 'Ajustes'],
    kpis: [
      { label: 'Ventas del mes', value: MONTH / 1e6, format: v => `$ ${es2.format(v)} M`, sub: 'Datos de ejemplo' },
      { label: 'Pedidos', value: ORDERS, format: int, sub: 'Datos de ejemplo' },
      { label: 'Ticket promedio', value: MONTH / ORDERS, format: peso, sub: 'Ventas ÷ pedidos' },
      { label: 'Provincias con envíos', value: 24, format: int, sub: 'de 24 jurisdicciones' },
    ],
    chart: { title: 'Ventas por provincia', sub: 'Millones de pesos · datos de ejemplo', max: 1.6, data: PROV, format: v => `${es2.format(v)} M` },
    list: {
      title: 'Productos', sub: 'Publicados en la tienda',
      rows: [
        { title: 'Mate de calabaza', meta: 'Stock 24 · $ 18.900', pill: 'Activo', colors: ['#a0522d', '#7a9a2e'] },
        { title: 'Termo acero 1 L', meta: 'Stock 12 · $ 42.500', pill: 'Activo', colors: ['#3a4a60', CELESTE] },
        { title: 'Yerba orgánica 1 kg', meta: 'Stock 60 · $ 6.800', pill: 'Activo', colors: [SOL, '#2e7d32'] },
        { title: 'Alfajores x 12', meta: 'Stock 35 · $ 14.400', pill: 'Activo', colors: ['#4e3322', '#e9c38b'] },
        { title: 'Bombilla de alpaca', meta: 'Stock 50 · $ 9.800', pill: 'Activo', colors: ['#cfd6de', '#7a889c'] },
        { title: 'Poncho norteño', meta: 'Stock 8 · $ 58.000', pill: 'Activo', colors: [ROJO, '#7a1f12'] },
      ],
      self: { title: 'Dulce de leche 1 kg', meta: 'Stock 40 · $ 7.900', pill: 'Nuevo', colors: ['#c8793a', ROJO] },
    },
  },

  scenes: [
    // ── COLD OPEN (0–8): a question in the dark, one click, a Bauhaus montage on the eighths
    { type: 'clickopen', label: 'CLICK', lines: ['¿y si vender fuera tan fácil…', '…como un click?'], color: CELESTE },
    {
      type: 'montage', beat: 0.25,
      cards: [
        { bg: CELESTE, text: 'ELEGÍ', color: INK }, { bg: INK, kind: 'circle', color: SOL },
        { bg: SOL, text: 'AGREGÁ', color: INK, style: 'outline' }, { bg: ROJO, kind: 'triangle', color: WHITE },
        { bg: AZUL, text: 'PAGÁ', color: WHITE, style: 'italic' }, { bg: CELESTE, kind: 'square', color: ROJO },
        { bg: INK, text: 'RECIBÍ', color: CELESTE, style: 'glow' }, { bg: WHITE, kind: 'star', color: AZUL },
        { bg: ROJO, text: 'VENDÉ', color: WHITE }, { bg: SOL, text: 'COBRÁ', color: INK, style: 'thin' },
        { bg: CELESTE, text: 'ENVIÁ', color: INK }, { bg: AZUL, text: 'CRECÉ', color: SOL, style: 'outline' },
        { bg: INK, kind: 'circle', color: CELESTE }, { bg: WHITE, text: 'CLICK', color: INK },
      ],
    },

    // ── DROP 1 (8–12)
    { type: 'remixtitle', label: 'ECOMMERCE', title: 'ECOMMERCE', stamp: 'REMIX', colors: [INK, CELESTE, SOL, ROJO, AZUL, WHITE] },

    // ── THE STORE AT SPEED (12–32)
    { type: 'shopfront', label: 'VITRINA', fit: 3.5, whipOut: 'left', camera: { origin: [960, 486], keys: [{ t: 0, s: 1.5, rx: 24, ry: -18, y: 120 }, { t: 0.45, s: 1.02, ease: 'expo.out' }, { t: 1, s: 1.07, ease: 'sine.inOut' }] } },
    { type: 'shoplogin', label: 'INGRESO', fit: 3.5, whipIn: 'left', camera: { focus: '.sh-modal', keys: [{ t: 0, s: 1.08 }, { t: 0.28, s: 1.08 }, { t: 0.5, s: 1.4, ease: 'power3.inOut' }, { t: 1, s: 1.24, ease: 'sine.inOut' }] } },
    { type: 'shoptheme', label: 'MODO OSCURO', fit: 2.5, camera: { focus: '.sh-toggle', keys: [{ t: 0, s: 1.9 }, { t: 0.4, s: 1.9 }, { t: 1, s: 1, ease: 'expo.inOut' }] } },
    { type: 'slam', label: 'AGREGÁ', words: [{ text: 'AGREGÁ.', bg: SOL, fg: INK, shape: 'circle', sc: ROJO }] },
    { type: 'shopcart', label: 'CARRITO', fit: 3.5, count: IN_CART, camera: { origin: [960, 560], keys: [{ t: 0, s: 1.18, x: 140, ry: -9 }, { t: 1, s: 1.12, x: -140, ry: 9, ease: 'sine.inOut' }] } },
    {
      type: 'slam', label: 'PAGÁ',
      words: [
        { text: 'PAGÁ', bg: AZUL, fg: WHITE, shape: 'square', sc: SOL },
        { text: 'COMO', bg: ROJO, fg: WHITE, shape: 'triangle', sc: CELESTE },
        { text: 'QUIERAS.', bg: CELESTE, fg: INK, shape: 'circle', sc: WHITE },
      ],
    },
    { type: 'shopcheckout', label: 'PAGO', fit: 5, count: IN_CART, pick: 0, camera: { origin: [1420, 500], keys: [{ t: 0, s: 1 }, { t: 0.12, s: 1.2, ease: 'power3.inOut' }, { t: 0.8, s: 1.2 }, { t: 1, s: 1.04, ease: 'power2.inOut' }] } },

    // ── BREAKDOWN: ARGENTINA (32–42)
    {
      type: 'globeship', label: 'ENVÍOS', duration: 6, gap: 0.07, from: CABA, to: CAPITALS, view: { lon: -64.5, lat: -38.5 }, r: 1500, cx: 1290, cy: 540,
      kicker: 'ARGENTINA', title: 'ENVÍOS A<br>TODO EL PAÍS', unit: '/ 24 JURISDICCIONES', startAt: 1,
    },
    {
      type: 'statpunch', label: 'CIFRAS', step: 1,
      stats: [
        { value: 24, label: 'JURISDICCIONES · 23 PROVINCIAS + CABA', bg: CELESTE, fg: INK },
        { value: KM, format: int, label: 'KM DE LA QUIACA A USHUAIA', note: 'EN LÍNEA RECTA · CALCULADO CON LAS COORDENADAS DE AMBAS CIUDADES', bg: SOL, fg: INK },
        { value: METHODS.length, label: 'MEDIOS DE PAGO', list: METHODS.map(m => m.name.toUpperCase()), bg: ROJO, fg: WHITE },
        { value: 1, label: 'CLICK', bg: INK, fg: WHITE },
      ],
    },

    // ── DROP 2: THE ADMIN (42–54)
    { type: 'uibuild', label: 'ADMIN', duration: 4, backdrop: SHOP_BG, bg: '#dcebf8', camera: { origin: [960, 486], keys: [{ t: 0, s: 1.35, rx: -20, ry: 16, y: -80 }, { t: 0.5, s: 1, rx: 0, ry: 0, y: 0, ease: 'expo.out' }, { t: 1, s: 1 }] } },
    {
      type: 'shopupload', label: 'PRODUCTOS', fit: 4, typeSpeed: 0.04,
      camera: { origin: [960, 460], keys: [{ t: 0, s: 1 }, { t: 0.45, s: 1 }, { t: 0.58, s: 1.2, ease: 'power3.inOut' }, { t: 0.9, s: 1.2 }, { t: 1, s: 1.02, ease: 'power2.inOut' }] }, whipOut: 'left',
      product: {
        title: 'Nuevo producto', drop: 'Arrastrá la foto acá', file: 'dulce-de-leche.png', art: 'dulce', bg: '#fde8c8',
        nameLabel: 'Nombre', name: 'Dulce de leche 1 kg', priceLabel: 'Precio', price: '$ 7.900', stockLabel: 'Stock', stock: '40',
        publish: 'Publicar', toast: 'Producto publicado en la tienda',
      },
    },
    {
      type: 'shopsales', label: 'VENTAS', fit: 4, whipIn: 'left',
      camera: { focus: '.sh-anc', keys: [{ t: 0, s: 1.25, rx: 14 }, { t: 0.4, s: 1.06, rx: 0, ease: 'expo.out' }, { t: 1, s: 1.14, ease: 'sine.inOut' }] },
      analytics: {
        window: 'TU TIENDA — ANALÍTICA', title: 'Ventas', ranges: ['7 días', '30 días', '90 días'], range: 1, demo: 'DATOS DE EJEMPLO',
        stats: [
          { label: 'Ventas del mes', value: MONTH, format: v => `$ ${es2.format(v / 1e6)} M` },
          { label: 'Pedidos', value: ORDERS, format: int },
          { label: 'Ticket promedio', value: MONTH / ORDERS, format: peso },
        ],
        chartTitle: 'Ventas diarias', chartSub: 'Pesos · últimos 30 días', series: SERIES, max: 250000, ticks: [0, 125000, 250000],
        tickFormat: v => (v ? `$ ${int(v / 1000)} mil` : '$ 0'), xTicks: [0, 9, 19, 29], format: peso, dayLabel: k => `DÍA ${k + 1}`,
        mixTitle: 'Medios de pago', mixSub: 'Porcentaje de las ventas · datos de ejemplo',
        mix: [['Tarjeta de crédito', 46], ['Tarjeta de débito', 21], ['Billetera virtual', 18], ['Transferencia', 11], ['Efectivo', 4]],
        hoverFrom: 5, hoverTo: 25,
      },
    },

    // ── THE LINE (54–60)
    { type: 'shopfinale', label: 'TODO A UN CLICK', duration: 6, title: 'ECOMMERCE', subtitle: 'TODO A UN <span>CLICK</span>', colors: [INK, SOL, ROJO, AZUL, CELESTE] },
  ],
});
