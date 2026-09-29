/* ============================================================================
   BAUHAUS 100 — homenaje a la Bauhaus (#04 del hub). Storyboard: ../STORYBOARD.md
   Prueba de "solo kit": ninguna receta nueva, ningún cambio al motor. Todo sale
   de la config: orden de escenas, paleta de imprenta, copy, paths propios para
   `shift` y una composición SVG inline para `logo`.
   ========================================================================== */

// Paleta de imprenta: tres primarios + negro cálido + papel crema (nada de neón)
const NIGHT = '#0f0e0d', INK = '#1a1816', PAPER = '#efe8d8';
const RED = '#d62e1f', BLUE = '#1f3f99', YELLOW = '#f4bd12';

// Formas propias para `shift` (viewBox -250..250, spin: 0 → quedan derechas)
const PUNTO = 'M0,-118C65.2,-118 118,-65.2 118,0C118,65.2 65.2,118 0,118C-65.2,118 -118,65.2 -118,0C-118,-65.2 -65.2,-118 0,-118Z';
const LINEA = 'M-239.2,196.8L196.8,-239.2L239.2,-196.8L-196.8,239.2Z'; // diagonal constructivista, sube a la derecha
const GRILLA = 'M-212,-212L-88,-212L-88,-88L-212,-88ZM-62,-212L62,-212L62,-88L-62,-88ZM88,-212L212,-212L212,-88L88,-88Z' +
  'M-212,-62L-88,-62L-88,62L-212,62ZM-62,-62L62,-62L62,62L-62,62ZM88,-62L212,-62L212,62L88,62Z' +
  'M-212,88L-88,88L-88,212L-212,212ZM-62,88L62,88L62,212L-62,212ZM88,88L212,88L212,212L88,212Z';            // retícula 3×3
const VOLUMEN = 'M0,-227.7L190.1,-118L0,-8.3L-190.1,-118Z' +
  'M-197.2,-105.6L-7.2,4.1L-7.2,223.6L-197.2,113.9ZM7.2,4.1L197.2,-105.6L197.2,113.9L7.2,223.6Z';           // cubo isométrico: 3 rombos

// Composición original (no es una obra real) con los colores del cuestionario de Kandinsky.
// Sobre el azul se dibuja primero como un plano (trazos papel) y después se "imprime" en una hoja crema.
const COMPOSICION = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 480">
  <rect x="0" y="0" width="680" height="480" fill="${PAPER}"/>
  <g transform="translate(20 20)">
    <rect x="0" y="108" width="640" height="2" fill="${INK}" opacity=".22"/>
    <rect x="0" y="328" width="640" height="2" fill="${INK}" opacity=".22"/>
    <rect x="158" y="0" width="2" height="440" fill="${INK}" opacity=".22"/>
    <rect x="478" y="0" width="2" height="440" fill="${INK}" opacity=".22"/>
    <circle cx="250" cy="230" r="150" fill="${BLUE}"/>
    <rect x="318" y="108" width="160" height="160" fill="${RED}"/>
    <path d="M488,330A72,72 0 0,0 632,330Z" fill="${INK}"/>
    <polygon points="478,328 632,328 555,158" fill="${YELLOW}"/>
    <polygon points="64.7,415.2 434.7,75.2 425.3,64.8 55.3,404.8" fill="${INK}"/>
    <circle cx="110" cy="72" r="15" fill="${RED}"/>
    <circle cx="250" cy="230" r="180" fill="none" stroke="${INK}" stroke-width="2"/>
  </g>
</svg>`;

// Marca final: el trío de Kandinsky (círculo azul, cuadrado rojo, triángulo amarillo), un poco más
// grande que el trío por defecto del kit.
const MARCA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 64">
  <circle cx="22" cy="32" r="12" fill="${BLUE}"/>
  <rect x="49" y="21" width="22" height="22" fill="${RED}"/>
  <polygon points="87,43 111,43 99,21" fill="${YELLOW}"/>
</svg>`;

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'BAUHAUS 100',
    subtitle: 'UN HOMENAJE · 1919 — 1933',
    hud: 'BAUHAUS 100 — HOMENAJE',
    pageTitle: 'BAUHAUS 100 — Homenaje',
    back: '../../index.html',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
    particles: '{n} PARTÍCULAS · 1 CANVAS · 0 IMÁGENES',
  },
  // accents[0..2] = trío protagonista en el orden de Kandinsky: círculo azul, cuadrado rojo, triángulo amarillo
  palette: {
    night: NIGHT, ink: INK, paper: PAPER,
    accents: [BLUE, RED, YELLOW, YELLOW, BLUE, RED],
    spectrum: [BLUE, RED, YELLOW],
    glow: BLUE,
  },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACTO I — gancho: un documento se escribe en la oscuridad; la palabra elegida se vuelve rojo
    { type: 'typewriter', label: 'WEIMAR', lines: ['WEIMAR, 1919.', 'NACE LA <em>BAUHAUS</em>.'], to: RED },

    // ACTO II — la gramática de la forma, de 0 a 3 dimensiones
    {
      type: 'shift', label: 'GRAMÁTICA', spin: 0, collapse: false, // el cubo se va escalando, sin morph a círculo
      steps: [
        { word: 'PUNTO', form: PUNTO, fx: 'bloom', bg: RED, shape: INK, cut: false, name: 'CÍRCULO' },
        { word: 'LÍNEA', form: LINEA, fx: 'slide', bg: PAPER, shape: BLUE, cut: 'right', name: 'DIAGONAL' },
        { word: 'PLANO', form: 'square', fx: 'build', bg: YELLOW, shape: RED, cut: false, name: 'CUADRADO' },
        { word: 'GRILLA', form: GRILLA, fx: 'flip', bg: BLUE, shape: PAPER, cut: 'up', name: 'RETÍCULA 3×3' },
        { word: 'VOLUMEN', form: VOLUMEN, fx: 'evolve', bg: INK, shape: YELLOW, cut: false, name: 'CUBO ISOMÉTRICO' },
      ],
    },
    // el cuestionario de Kandinsky (1923): triángulo amarillo, cuadrado rojo, círculo azul
    {
      type: 'forms', label: 'KANDINSKY, 1923', word: '1923', bg: PAPER,
      colors: [BLUE, RED, YELLOW],
      labels: ['01 — CÍRCULO · AZUL', '02 — CUADRADO · ROJO', '03 — TRIÁNGULO · AMARILLO'],
    },
    // el círculo azul se traga el cuadro: sobre ese azul se dibuja un plano y se imprime la respuesta
    { type: 'logo', label: 'COMPOSICIÓN', svg: COMPOSICION, bg: BLUE, size: 540, hold: 0.5, caption: 'TRIÁNGULO AMARILLO · CUADRADO ROJO · CÍRCULO AZUL' },
    // guiño a Herbert Bayer: la lista grita en mayúsculas, la respuesta llega en minúsculas
    {
      type: 'stack', label: 'ESCUELA', bg: YELLOW, fg: INK, accent: BLUE, maxSize: 420, height: 720,
      stacks: [
        ['ARTE, OFICIO,', 'LETRA Y', '*ARQUITECTURA'],
        ['una sola', '*escuela'],
      ],
    },
    {
      type: 'rules', label: 'DIRECTORES', head: 'BAUHAUS', unit: 'DIRECTOR',
      rules: [
        { text: 'WALTER GROPIUS<br>1919–1928', bg: INK, num: YELLOW },
        { text: 'HANNES MEYER<br>1928–1930', bg: RED, num: INK },
        { text: 'LUDWIG MIES<br>VAN DER ROHE<br>1930–1933', bg: BLUE, num: YELLOW },
      ],
    },
    // la frase que se le atribuye a Mies, justo después de su tarjeta: una hoja crema casi vacía
    { type: 'statement', label: 'MIES VAN DER ROHE', text: 'MENOS <span>ES MÁS.</span>', bg: PAPER, accent: RED },
    // 14 años en 8 cortes: 1919 y 1933 como paréntesis negros, después un tiempo de silencio
    {
      type: 'montage',
      cards: [
        { bg: INK, text: '1919', color: PAPER },
        { bg: RED, text: 'WEIMAR', color: PAPER },
        { bg: PAPER, kind: 'circle', color: BLUE },
        { bg: BLUE, text: 'DESSAU', style: 'italic', color: PAPER },
        { bg: YELLOW, kind: 'square', color: RED },
        { bg: PAPER, text: 'BERLÍN', style: 'thin', color: INK },
        { bg: RED, kind: 'triangle', color: YELLOW },
        { bg: INK, text: '1933', style: 'outline', color: PAPER },
      ],
    },

    // ACTO III — silencio, título, los números. Tinta sobre papel, como un impreso de la escuela.
    {
      type: 'title', label: 'BAUHAUS', title: 'BAUHAUS', bg: PAPER,
      subtitle: 'WEIMAR 1919 · DESSAU 1925 · BERLÍN 1932',
      colors: [BLUE, RED, YELLOW],
    },
    {
      type: 'credits', label: 'EN NÚMEROS', mark: MARCA, bg: PAPER,
      stats: [['3', 'CIUDADES'], ['3', 'DIRECTORES'], ['14', 'AÑOS']],
      line: 'CERRADA EN 1933 BAJO PRESIÓN NAZI',
    },
  ],
});
