/* ============================================================================
   ECOMMERCE — todo a un click. 90 s, 120 BPM, una tienda argentina manejada con
   un solo mouse. Mezcla los lenguajes del hub:
   · KINETIC  — apertura "todo empieza con un click", formas que mutan, final con slam
   · BAUHAUS  — formas y colores primarios (bolsa, carrito, tarjeta, camión, etiqueta)
   · MANIFIESTO — pilas de palabras y los medios de pago como puntos numerados
   · LAUNCH   — la tienda y el admin: login, modo oscuro, carrito, checkout, carga
   · GLOBAL   — Argentina resaltada y envíos a las 24 jurisdicciones
   · DATA STORY — una distancia real en odómetro + la analítica de ventas
   Datos reales: coordenadas de las 23 capitales provinciales y de CABA, la
   distancia La Quiaca–Ushuaia (calculada acá). Las ventas, precios y pedidos de
   la tienda son DATOS DE EJEMPLO y la pantalla lo dice.
   ========================================================================== */
const CELESTE = '#74acdf', SOL = '#f6b40e', ROJO = '#e63922', AZUL = '#1d4ed8', INK = '#0f1b2d', PAPER = '#f5f8fc', DEEP = '#1f7bc6';
const es = new Intl.NumberFormat('es-AR'), es2 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const int = v => es.format(Math.round(v)), peso = v => `$ ${int(v)}`;

// the admin speaks the store's colours
Object.assign(Trailer.ui.THEMES.light, { accent: DEEP, chip: '#e3f0fb', hot: ROJO });

// ---- store (demo catalogue; prices are sample data)
const PRODUCTS = [
  { name: 'Mate de calabaza', price: 18900, art: 'mate', bg: '#fde8c8' },
  { name: 'Termo acero 1 L', price: 42500, art: 'termo', bg: '#dbeaf7' },
  { name: 'Yerba orgánica 1 kg', price: 6800, art: 'yerba', bg: '#fff1c2' },
  { name: 'Alfajores x 12', price: 14400, art: 'alfajor', bg: '#f3e2d6' },
];
const IN_CART = 3, TOTAL = PRODUCTS.slice(0, IN_CART).reduce((s, p) => s + p.price, 0);

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
  .sort((a, b) => Trailer.geo.dist(CABA, a) - Trailer.geo.dist(CABA, b)); // near to far: the burst ripples outward
const LA_QUIACA = { lat: -22.1056, lon: -65.593 }, USHUAIA = { lat: -54.8019, lon: -68.303 };
const KM = Math.round(Trailer.geo.dist(LA_QUIACA, USHUAIA));

// ---- demo sales (sample data, labelled on screen): 30 days that add up to the admin's month
const MONTH = 4820000, ORDERS = 312;
const raw = Array.from({ length: 30 }, (_, d) => 1 + 0.22 * Math.sin((2 * Math.PI * (d + 2)) / 7) + 0.018 * d + 0.06 * Math.sin(d * 2.7));
const kk = MONTH / raw.reduce((a, b) => a + b, 0);
const SERIES = raw.map(v => Math.round(v * kk));
SERIES[29] += MONTH - SERIES.reduce((a, b) => a + b, 0);
const PROV = [['BUENOS AIRES', 1.52], ['CABA', 1.08], ['CÓRDOBA', 0.61], ['SANTA FE', 0.47], ['MENDOZA', 0.29], ['TUCUMÁN', 0.18], ['SALTA', 0.15], ['NEUQUÉN', 0.14], ['ENTRE RÍOS', 0.13], ['CHUBUT', 0.13], ['OTRAS', 0.12]];

// ---- shapes for the Bauhaus shift (viewBox −250..250)
const BAG = 'M-160,-70 L160,-70 L185,200 L-185,200 Z M-95,-70 C-95,-215 95,-215 95,-70 L62,-70 C62,-172 -62,-172 -62,-70 Z';
const CART = 'M-220,-170 L-140,-170 L-115,-110 L210,-110 L170,70 L-70,70 Z M-106,130 a36,36 0 1,0 72,0 a36,36 0 1,0 -72,0 M94,130 a36,36 0 1,0 72,0 a36,36 0 1,0 -72,0';
const CARD = 'M-220,-140 Q-220,-160 -200,-160 L200,-160 Q220,-160 220,-140 L220,140 Q220,160 200,160 L-200,160 Q-220,160 -220,140 Z M-220,-100 L-220,-50 L220,-50 L220,-100 Z';
const TRUCK = 'M-230,-110 L60,-110 L60,90 L-230,90 Z M60,-50 L150,-50 L220,20 L220,90 L60,90 Z M-190,130 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0 M100,130 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0';
const TAG = 'M-200,-80 L-60,-200 L200,-200 L200,200 L-60,200 L-200,80 Z M-140,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0';
const SHOP_BG = '<div class="sh-bg"><i class="sh-b1"></i><i class="sh-b2"></i><i class="sh-b3"></i></div>';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'VELMAR', subtitle: 'TRAILER 10 S', hud: 'VELMAR — MUY PRONTO', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#0b1220', ink: INK, paper: PAPER, accents: [CELESTE, SOL, ROJO, AZUL, '#12a150', DEEP], glow: DEEP },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
  globe: { rows: 230, colors: { land: '#4f7fae', hl: '#ffffff', arc: SOL, atmo: CELESTE, grat: CELESTE, head: '#ffffff', pin: '#ffffff' } },

  // a pop groove under everything (synthesized): C – G – Am – F at 120 BPM
  music: {
    bpm: 120, volume: 0.85,
    parts: [
      { from: 0, to: 9, style: 'drive' },{ from: 9, style: 'hit' },
      { from: 28, to: 32, style: 'drive' },
      { from: 32, to: 46, style: 'groove' },
      { from: 46, to: 51, style: 'drive' },
      { from: 51, to: 58.5, style: 'half' },
      { from: 58.5, to: 64, style: 'soft' },
      { from: 64, to: 82.5, style: 'groove' },
      { from: 82.5, to: 84.5, style: 'build' },
      { from: 84.5, style: 'hit' },
      { from: 84.5, to: 87.5, style: 'drive' },
      { from: 87.5, style: 'hit' },
    ],
  },

  // the storefront
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
      payLabel: 'Pagá con',
      methods: [
        { icon: 'card', name: 'Tarjeta de crédito', sub: 'En cuotas' },
        { icon: 'debit', name: 'Tarjeta de débito', sub: 'En un pago' },
        { icon: 'bank', name: 'Transferencia', sub: 'CBU o alias' },
        { icon: 'qr', name: 'Billetera virtual', sub: 'Con QR' },
        { icon: 'cash', name: 'Efectivo', sub: 'En puntos de pago' },
      ],
      totalLabel: 'Total', total: peso(TOTAL), payGo: 'Pagar', doneTitle: '¡Compra confirmada!', doneSub: 'Te avisamos cuando salga tu envío.',
    },
  },

  // the admin (UI module window)
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
    { type: 'origin', label: 'VELMAR', duration: 2, lines: ['TU TIENDA', '<em>VIVE</em> EL AÑO'], to: CELESTE },
    {
      type: 'shift', label: 'TEMPORADAS', duration: 3.5, collapse: false, spin: 0,
      steps: [
        { word: 'HALLOWEEN', form: BAG, bg: '#f97316', fg: INK, shape: INK, fx: 'rise' },
        { word: 'NAVIDAD', form: TAG, bg: ROJO, fg: '#ffffff', shape: '#12a150', fx: 'slide', cut: 'right' },
        { word: 'AÑO NUEVO', form: CARD, bg: INK, fg: SOL, shape: SOL, fx: 'bloom', cut: 'up' },
      ],
    },
    { type: 'stack', label: 'AGENTE IA', duration: 2.5, bg: '#25d366', fg: INK, accent: '#ffffff', stacks: [['AGENTE IA', 'EN *WHATSAPP'], ['VENDE', '*24/7']] },
    { type: 'shopfinale', label: 'VELMAR', duration: 2, title: 'VELMAR', subtitle: 'MUY <span>PRONTO</span>', colors: [INK, SOL, ROJO, AZUL, CELESTE] },
  ],
});
