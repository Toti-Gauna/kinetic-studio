/* ============================================================================
   GLOBAL — el mundo, conectado (#11 del hub).
   Prueba el módulo globe del kit: globo de puntos en proyección ortográfica
   (canvas 2D), mapa sinusoidal que se envuelve en esfera, arcos de gran círculo,
   terminador día/noche y datos geográficos. Nada inventado:
   · tierra: Natural Earth 1:110m (dominio público), horneada en js/data/land.js
   · distancias: calculadas acá (haversine, radio medio 6.371 km) con las
     coordenadas reales de cada ciudad
   · pasajeros aéreos: OACI vía Banco Mundial (IS.AIR.PSGR), descargado el
     2026-09-28 — los arcos de esa escena son ilustrativos, su frecuencia es el dato
   · sol: declinación del solsticio de junio (+23,44°)
   ========================================================================== */
const NIGHT = '#031525', INK = '#0b1220', PAPER = '#eef6fb';
const SKY = '#38bdf8', PINK = '#f472b6', AMBER = '#fb923c', GOLD = '#fcd34d';
const es0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

// Pasajeros transportados por avión, mundo — millones (OACI vía Banco Mundial, IS.AIR.PSGR; 1972 sin dato)
const AIR = [[1970,310.4],[1971,331.6],[1973,401.6],[1974,421.1],[1975,432.3],[1976,471.8],[1977,513.3],[1978,576.1],[1979,648.4],[1980,641.9],[1981,640.6],[1982,654.5],[1983,685.1],[1984,732.4],[1985,783.2],[1986,842.6],[1987,904.8],[1988,953.9],[1989,983.2],[1990,1025],[1991,1133.2],[1992,1145.4],[1993,1142.3],[1994,1233.2],[1995,1302.9],[1996,1391],[1997,1455.1],[1998,1467],[1999,1562.3],[2000,1674.1],[2001,1655.2],[2002,1627.4],[2003,1665.3],[2004,1888.7],[2005,1969.6],[2006,2072.4],[2007,2209.1],[2008,2208.2],[2009,2249.7],[2010,2669.4],[2011,2833.2],[2012,2943.2],[2013,3100.2],[2014,3285.1],[2015,3525.1],[2016,3760.8],[2017,4025.6],[2018,4293.9],[2019,4455.7],[2020,1771.9],[2021,2280],[2022,3230.3],[2023,4269]];
const air = y => AIR.find(p => p[0] === y)[1];
const DROP = Math.round((air(2020) / air(2019) - 1) * 100); // caída 2019 → 2020, calculada
const MINUS = '−';

// Coordenadas reales (centro de cada ciudad)
const BA = { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 };
const ROUTES = [
  { name: 'Nueva York', lat: 40.7128, lon: -74.006 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Ciudad del Cabo', lat: -33.9249, lon: 18.4241 },
  { name: 'Dubái', lat: 25.2048, lon: 55.2708 },
  { name: 'Tokio', lat: 35.6762, lon: 139.6503 },
  { name: 'Sídney', lat: -33.8688, lon: 151.2093 },
];
const CITIES = [
  [51.5074, -0.1278], [48.8566, 2.3522], [50.1109, 8.6821], [41.0082, 28.9784], [55.7558, 37.6173], [30.0444, 31.2357],
  [6.5244, 3.3792], [-1.2921, 36.8219], [-26.2041, 28.0473], [25.2048, 55.2708], [25.2854, 51.531], [28.6139, 77.209],
  [19.076, 72.8777], [13.7563, 100.5018], [1.3521, 103.8198], [-6.2088, 106.8456], [22.3193, 114.1694], [31.2304, 121.4737],
  [39.9042, 116.4074], [37.5665, 126.978], [35.6762, 139.6503], [-33.8688, 151.2093], [-36.8485, 174.7633], [34.0522, -118.2437],
  [37.7749, -122.4194], [41.8781, -87.6298], [33.749, -84.388], [40.7128, -74.006], [43.6532, -79.3832], [19.4326, -99.1332],
  [4.711, -74.0721], [-12.0464, -77.0428], [-23.5505, -46.6333], [-34.6037, -58.3816], [-33.4489, -70.6693], [40.4168, -3.7038],
].map(([lat, lon]) => ({ lat, lon }));
const KM_TOTAL = ROUTES.reduce((s, c) => s + Trailer.geo.dist(BA, c), 0);

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'GLOBAL', subtitle: 'EL MUNDO, CONECTADO', hud: 'KINETIC STUDIO — GLOBAL', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: NIGHT, ink: INK, paper: PAPER, accents: [SKY, PINK, AMBER, GOLD, '#a78bfa', '#7dd3fc'], glow: SKY },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },
  globe: { rows: 150, colors: { land: '#7dd3fc', arc: PINK, atmo: SKY, twilight: AMBER, light: GOLD, rim: PAPER } },

  scenes: [
    // ACTO I — un mapa que se vuelve mundo
    {
      type: 'globeintro', label: 'MAPA', map: 'UN MAPA.', world: 'UN MUNDO.', view: { lon: -20, lat: 14 },
      kicker: 'NATURAL EARTH 1:110M · PROYECCIÓN SINUSOIDAL', kicker2: 'PROYECCIÓN ORTOGRÁFICA · {n} PUNTOS DE TIERRA',
    },

    // ACTO II — distancias reales
    {
      type: 'globeroutes', label: 'RUTAS', from: BA, to: ROUTES,
      kicker: 'RUTAS · DISTANCIA ORTODRÓMICA', title: 'DESDE BUENOS AIRES', sub: 'GRAN CÍRCULO · RADIO MEDIO 6.371 KM', total: 'TOTAL',
    },

    // ACTO III — el planeta gira bajo el sol
    {
      type: 'globeclock', label: 'DÍA Y NOCHE', kicker: '21 DE JUNIO · SOLSTICIO', decl: 23.44, cities: CITIES,
      text: 'EN CADA INSTANTE,<br>MEDIO PLANETA<br><span>ESTÁ DE NOCHE.</span>',
    },

    // ACTO IV — la cifra que sube (y se desploma en 2020)
    {
      type: 'globepulse', label: 'PASAJEROS', kicker: 'AVIACIÓN · 1970–2023', title: 'Pasajeros transportados por avión, mundo',
      unit: 'MILLONES DE PASAJEROS', data: AIR, yMax: 5000, yTicks: [0, 2500, 5000], cities: CITIES,
      notes: [{ x: 2020, text: `2020 · ${MINUS}${Math.abs(DROP)} %`, anchor: 'end', dx: -14, dy: 36 }],
      source: 'FUENTE: OACI, CIVIL AVIATION STATISTICS OF THE WORLD · VÍA BANCO MUNDIAL (IS.AIR.PSGR). LOS ARCOS SON ILUSTRATIVOS: SU FRECUENCIA SIGUE LA SERIE.',
    },

    // ACTO V — el título, con el mundo como "O"
    { type: 'globetitle', label: 'GLOBAL', title: 'GLOBAL', subtitle: 'EL MUNDO, CONECTADO', cities: CITIES },
    { type: 'statement', text: 'TODO QUEDA <span>CERCA.</span>', accent: PINK },
    {
      type: 'credits', mark: false,
      stats: [
        [es0.format(Math.round(KM_TOTAL)), 'KM EN GRAN CÍRCULO'],
        [es0.format(Math.round(air(2023))), 'MILLONES DE PASAJEROS · 2023'],
        [`${MINUS}${Math.abs(DROP)} %`, 'PASAJEROS EN 2020'],
        ['1', 'PLANETA'],
      ],
      line: 'DATOS: NATURAL EARTH · OACI VÍA BANCO MUNDIAL · DISTANCIAS CALCULADAS EN CÓDIGO',
    },
  ],
});
