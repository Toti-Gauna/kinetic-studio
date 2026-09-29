/* ============================================================================
   GLITCH — señal interrumpida (#03 del hub).
   Prueba el módulo de glitch del kit: ráfagas con filtro SVG (desgarro + RGB
   split + bloques), overlay CRT, y las recetas boot / testcard / corrupt /
   datamosh / bsod. Historia: una transmisión que arranca, se cae, se corrompe
   y es secuestrada por el propio error.
   ========================================================================== */
const VOID = '#050505', INK = '#0a0a0a', WHITE = '#eef2ef';
const GREEN = '#00ff9c', MAGENTA = '#ff2e88', CYAN = '#00e5ff', YELLOW = '#ffe600', BLUE = '#2a2aff', RED = '#ff3b30';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  crt: true, // scanlines + flicker + rolling VHS band over the whole film
  meta: {
    title: 'GLITCH',
    subtitle: 'SEÑAL INTERRUMPIDA',
    hud: 'KINETIC TV — CANAL 03',
    back: '../../index.html',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: {
    night: VOID, ink: INK, paper: WHITE,
    accents: [GREEN, MAGENTA, CYAN, YELLOW, BLUE, RED],
    spectrum: [BLUE, CYAN, GREEN, YELLOW, MAGENTA],
    glow: GREEN,
  },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACT I — the transmission boots… and drops
    {
      type: 'boot', label: 'ARRANQUE',
      lines: [
        ['KINETIC OS 2.6 — SECUENCIA DE ARRANQUE', ''],
        ['VERIFICANDO MEMORIA ............ 65536K', 'ok'],
        ['CARGANDO NÚCLEO GRÁFICO', 'ok'],
        ['CALIBRANDO TUBO DE RAYOS CATÓDICOS', 'ok'],
        ['SINCRONIZANDO FASE VERTICAL', 'warn'],
        ['MONTANDO /dev/senal0', 'ok'],
        ['DECODIFICANDO FLUJO DE VIDEO', 'ok'],
        ['VERIFICANDO INTEGRIDAD DE DATOS', 'fail'],
        ['IGNORANDO ERRORES', 'ok'],
      ],
      message: 'SEÑAL ESTABLE', corrupt: 'SEÑAL PERDIDA',
    },
    { type: 'testcard', label: 'SIN SEÑAL', text: 'SIN SEÑAL', sub: 'CANAL 03 · KINETIC TV' },

    // ACT II — corruption
    {
      type: 'corrupt', label: 'CORRUPCIÓN',
      words: ['SEÑAL', 'RUIDO', 'ERROR', 'FALLA', 'VIRUS', 'CAOS'],
      codes: ['E_SEÑAL_DEGRADADA', 'E_RUIDO_BLANCO', 'E_NO_ES_UN_ERROR', 'E_FALLA_EN_CASCADA', 'E_AUTORREPLICANTE', 'E_ENTROPÍA_MÁXIMA'],
    },
    { type: 'datamosh', label: 'DATAMOSH', word: 'DATAMOSH', lost: 'PERDIDO', found: 'RECUPERADO' },
    { type: 'bsod', label: 'PÁNICO' },
    {
      type: 'montage', beat: 0.125, silence: 0.5,
      cards: [
        { bg: GREEN, text: '404', color: INK },
        { bg: INK, text: 'NULL', style: 'outline', color: GREEN },
        { bg: MAGENTA, kind: 'square', color: INK },
        { bg: WHITE, text: 'NaN', style: 'italic', color: INK },
        { bg: BLUE, text: 'RGB', style: 'glow', color: CYAN },
        { bg: INK, kind: 'circle', color: MAGENTA },
        { bg: YELLOW, text: 'EOF', color: INK },
        { bg: INK, text: '0xFF', style: 'thin', color: WHITE },
        { bg: CYAN, kind: 'triangle', color: INK },
        { bg: RED, text: 'ERR', color: INK },
        { bg: INK, text: '¿?', style: 'outline', color: YELLOW },
        { bg: WHITE, text: 'SYNC', style: 'thin', color: BLUE },
      ],
      glitch: [{ at: 0, dur: 0.25, amt: 0.9 }, { at: 0.75, dur: 0.25, amt: 1 }],
    },

    // ACT III — the error takes over
    {
      type: 'title', label: 'GLITCH', title: 'GLITCH', subtitle: 'SEÑAL INTERRUMPIDA',
      glyphs: ['0', '1', '#'], colors: [GREEN, MAGENTA, CYAN],
      glitch: [{ at: 0, dur: 0.5, amt: 1.2 }, { at: 3.05, dur: 0.3, amt: 0.8 }, { at: 4.95, dur: 0.3, amt: 1 }],
    },
    { type: 'statement', text: 'EL ERROR <span>ES ESTILO.</span>', accent: GREEN, glitch: [{ at: 0.05, dur: 0.3, amt: 0.9 }, { at: 2.75, dur: 0.3, amt: 1 }] },
    {
      type: 'credits', mark: false,
      stats: [['0', 'VIDEOS'], ['1', 'FILTRO SVG'], ['100%', 'CÓDIGO']],
      line: 'KINETIC TV — FIN DE LA TRANSMISIÓN',
      glitch: [{ at: 2.3, dur: 0.2, amt: 0.8 }],
    },
  ],
});
