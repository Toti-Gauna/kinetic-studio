/* ============================================================================
   DATA STORY — el mundo en números (#10 del hub).
   Prueba el módulo data del kit: gráficos animados con DATOS REALES (nada
   inventado), descargados de Our World in Data el 2026-09-28. Fuentes originales
   citadas en cada gráfico. Reglas de dataviz: una serie por gráfico, marcas finas,
   grilla hairline, etiquetas selectivas, texto en tinta, paleta validada.
   ========================================================================== */
const NIGHT = '#0f1117', INK = '#16181d', PAPER = '#f3efe6';
const BLUE = '#2356d1', ORANGE = '#e0570f', GRAY = '#9a968d', SAND = '#ffc46b', TEAL = '#1f9e8f', PLUM = '#7a4fd0';
const OWID = 'VÍA OUR WORLD IN DATA';
const es0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const es1 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Población mundial 1800–2023, millones de personas (HYDE 2023; Gapminder 2022; ONU WPP 2024 — vía OWID)
const POP = [[1800,983],[1801,986],[1802,990],[1803,993],[1804,997],[1805,1000],[1806,1004],[1807,1007],[1808,1011],[1809,1015],[1810,1020],[1811,1026],[1812,1032],[1813,1038],[1814,1045],[1815,1052],[1816,1060],[1817,1067],[1818,1075],[1819,1082],[1820,1090],[1821,1097],[1822,1103],[1823,1111],[1824,1118],[1825,1125],[1826,1133],[1827,1141],[1828,1148],[1829,1156],[1830,1162],[1831,1169],[1832,1175],[1833,1180],[1834,1186],[1835,1191],[1836,1197],[1837,1203],[1838,1208],[1839,1214],[1840,1220],[1841,1225],[1842,1231],[1843,1237],[1844,1242],[1845,1248],[1846,1254],[1847,1260],[1848,1266],[1849,1271],[1850,1276],[1851,1279],[1852,1281],[1853,1283],[1854,1285],[1855,1286],[1856,1288],[1857,1290],[1858,1293],[1859,1295],[1860,1298],[1861,1301],[1862,1305],[1863,1309],[1864,1313],[1865,1317],[1866,1321],[1867,1325],[1868,1330],[1869,1335],[1870,1340],[1871,1346],[1872,1353],[1873,1360],[1874,1368],[1875,1375],[1876,1382],[1877,1390],[1878,1398],[1879,1406],[1880,1415],[1881,1424],[1882,1434],[1883,1444],[1884,1455],[1885,1466],[1886,1477],[1887,1488],[1888,1499],[1889,1510],[1890,1521],[1891,1531],[1892,1542],[1893,1552],[1894,1562],[1895,1572],[1896,1583],[1897,1593],[1898,1604],[1899,1615],[1900,1627],[1901,1640],[1902,1653],[1903,1667],[1904,1681],[1905,1695],[1906,1710],[1907,1725],[1908,1739],[1909,1754],[1910,1767],[1911,1780],[1912,1793],[1913,1805],[1914,1817],[1915,1829],[1916,1841],[1917,1854],[1918,1867],[1919,1881],[1920,1895],[1921,1911],[1922,1927],[1923,1944],[1924,1961],[1925,1979],[1926,1997],[1927,2015],[1928,2033],[1929,2052],[1930,2072],[1931,2092],[1932,2113],[1933,2135],[1934,2157],[1935,2179],[1936,2202],[1937,2225],[1938,2248],[1939,2271],[1940,2292],[1941,2312],[1942,2331],[1943,2349],[1944,2367],[1945,2385],[1946,2402],[1947,2421],[1948,2442],[1949,2468],[1950,2493],[1951,2537],[1952,2584],[1953,2634],[1954,2686],[1955,2740],[1956,2795],[1957,2853],[1958,2911],[1959,2966],[1960,3015],[1961,3065],[1962,3123],[1963,3193],[1964,3264],[1965,3335],[1966,3404],[1967,3473],[1968,3545],[1969,3619],[1970,3695],[1971,3770],[1972,3845],[1973,3921],[1974,3996],[1975,4071],[1976,4144],[1977,4218],[1978,4292],[1979,4369],[1980,4448],[1981,4529],[1982,4613],[1983,4697],[1984,4782],[1985,4869],[1986,4958],[1987,5050],[1988,5142],[1989,5234],[1990,5328],[1991,5419],[1992,5506],[1993,5592],[1994,5676],[1995,5759],[1996,5842],[1997,5925],[1998,6007],[1999,6089],[2000,6172],[2001,6255],[2002,6338],[2003,6420],[2004,6503],[2005,6587],[2006,6671],[2007,6757],[2008,6844],[2009,6933],[2010,7022],[2011,7111],[2012,7201],[2013,7292],[2014,7382],[2015,7470],[2016,7559],[2017,7646],[2018,7730],[2019,7811],[2020,7887],[2021,7954],[2022,8021],[2023,8092]];
// Misma serie cada 10 años, para el sparkline del título
const SPARK = [983,1020,1090,1162,1220,1276,1298,1340,1415,1521,1627,1767,1895,2072,2292,2493,3015,3695,4448,5328,6172,7022,7887,8092];

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'DATA STORY', subtitle: 'EL MUNDO EN NÚMEROS', hud: 'KINETIC STUDIO — DATA STORY', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: NIGHT, ink: INK, paper: PAPER, accents: [ORANGE, BLUE, SAND, TEAL, PLUM, GRAY], glow: BLUE },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACTO I — un número
    { type: 'datahero', label: 'HOY', pre: 'EN 2023 ÉRAMOS', value: '8.091.734.933', post: 'PERSONAS EN EL PLANETA.', source: `FUENTE: ONU, WORLD POPULATION PROSPECTS 2024 · ${OWID}` },

    // ACTO II — cuatro gráficos, cuatro historias
    {
      type: 'dataline', label: 'POBLACIÓN', kicker: '01 · POBLACIÓN', title: 'Población mundial, 1800–2023', subtitle: 'Millones de personas',
      data: POP, yMax: 8000, yTicks: [0, 2000, 4000, 6000, 8000], xTicks: [1800, 1850, 1900, 1950, 2000, 2023],
      yFormat: v => es0.format(v), readout: v => `${Math.round(v.x)} · ${es0.format(v.y)} M`,
      milestones: [
        { x: 1805, y: 1000, label: '1.000 M · 1805', anchor: 'start', dx: 14 },
        { x: 1926, y: 2000, label: '2.000 M · 1926' },
        { x: 1974, y: 4000, label: '4.000 M · 1974' },
        { x: 2022, y: 8000, label: '8.000 M · 2022' },
      ],
      source: `FUENTE: HYDE (2023); GAPMINDER (2022); ONU WPP (2024) · ${OWID}`,
    },
    {
      type: 'databars', label: 'VIDA', kicker: '02 · VIDA', title: 'Esperanza de vida al nacer, mundo', subtitle: 'Años',
      data: [['1950', 46.4], ['1960', 47.8], ['1970', 56.3], ['1980', 60.5], ['1990', 64.0], ['2000', 66.4], ['2010', 70.1], ['2023', 73.2]],
      yMax: 80, yTicks: [0, 20, 40, 60, 80], values: 'ends', valueFormat: v => es1.format(v),
      callout: '+26,8 AÑOS<span>de esperanza de vida desde 1950</span>', calloutX: 1080, calloutY: 300,
      source: `FUENTE: RILEY (2005); ZIJDEMAN ET AL. (2015); HMD (2025); ONU WPP (2024) · ${OWID}`,
    },
    {
      type: 'datawaffle', label: 'CONEXIÓN', kicker: '03 · CONEXIÓN', title: 'Personas que usan internet, mundo', subtitle: 'De cada 100 habitantes',
      from: { year: 2005, value: 15.6 }, to: { year: 2025, value: 73.6 }, of: 'DE CADA 100 PERSONAS', what: 'usan internet',
      source: `FUENTE: UIT, VÍA BANCO MUNDIAL (2026) · ${OWID}`,
    },
    {
      type: 'databars', label: 'ENERGÍA', kicker: '04 · ENERGÍA', title: 'Capacidad solar fotovoltaica instalada, mundo', subtitle: 'Gigavatios (GW)',
      data: [[2000, 1.2], [2001, 1.3], [2002, 1.6], [2003, 2.3], [2004, 3.4], [2005, 4.9], [2006, 6.5], [2007, 9], [2008, 15.2], [2009, 23.5], [2010, 41.5], [2011, 72.7], [2012, 102.8], [2013, 139.7], [2014, 178.8], [2015, 226.6], [2016, 298.5], [2017, 392.3], [2018, 487.8], [2019, 590.1], [2020, 721.2], [2021, 865.9], [2022, 1057.9], [2023, 1424], [2024, 1883.2], [2025, 2396.7]].map(([y, v]) => [String(y), v]),
      yMax: 2500, yTicks: [0, 500, 1000, 1500, 2000, 2500], yFormat: v => es0.format(v),
      values: 'ends', valueFormat: v => (v < 10 ? es1.format(v) : es0.format(v)) + ' GW', labelEvery: 5,
      color: ORANGE, highlight: 25, barWidth: 30, growSpan: 3.4, duration: 7.5,
      callout: 'CASI ×2.000<span>en 25 años (de 1,2 a 2.397 GW)</span>', calloutX: 700, calloutY: 330,
      source: `FUENTE: IRENA (2026) · ${OWID}`,
    },

    // ACTO III — el título, hecho de barras
    { type: 'datatitle', label: 'DATA STORY', title: 'DATA STORY', subtitle: 'EL MUNDO EN NÚMEROS', spark: SPARK, color: ORANGE },
    { type: 'statement', text: 'LOS DATOS <span>CUENTAN HISTORIAS.</span>', accent: ORANGE },
    {
      type: 'credits', mark: false,
      stats: [['8.092', 'MILLONES DE PERSONAS'], ['73,2', 'AÑOS DE VIDA'], ['74', 'DE CADA 100 EN LÍNEA'], ['2.397', 'GW SOLARES']],
      line: 'FUENTES: ONU WPP · HYDE · GAPMINDER · HMD · UIT · IRENA — VÍA OUR WORLD IN DATA',
    },
  ],
});
