/* ============================================================================
   HYPERSPACE — el viaje empieza ahora (#08 del hub).
   Prueba el módulo 3D del kit (Three.js r147 + bloom): geometría sólida, luces,
   shaders propios y una cámara que recorre 7 planos: hangar, salto, túnel del
   hiperespacio, planeta con anillos, campo de asteroides, portal y el título
   hecho de bloques 3D que la cámara atraviesa.
   ========================================================================== */
const NIGHT = '#02030a', INK = '#05070f', PAPER = '#eaf6ff';
const CYAN = '#3ee6ff', VIOLET = '#7a5cff', AMBER = '#ffb347', LIME = '#b8ff5c', MAGENTA = '#ff3ea5', BLUE = '#2f6bff';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'HYPERSPACE',
    subtitle: 'EL VIAJE EMPIEZA AHORA',
    hud: 'KINETIC STUDIO — HYPERSPACE',
    back: '../../index.html',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: {
    night: NIGHT, ink: INK, paper: PAPER,
    accents: [CYAN, VIOLET, AMBER, LIME, MAGENTA, BLUE],
    glow: CYAN,
  },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true },

  scenes: [
    // ACTO I — el hangar se enciende, cuenta regresiva, salto
    { type: 'corridor', label: 'HANGAR', status: 'SISTEMAS EN LÍNEA', lines: ['PREPARADOS', 'PARA EL SALTO.'] },
    { type: 'jump', label: 'SALTO', caption: 'SALTO ACTIVADO' },

    // ACTO II — el viaje
    { type: 'hypertunnel', label: 'HIPERESPACIO', lines: ['MÁS RÁPIDO', 'QUE LA LUZ.'], colors: [CYAN, MAGENTA] },
    { type: 'planet3d', label: 'DESTINO', word: 'NUEVOS MUNDOS', caption: 'MUNDO 01 · SIN NOMBRE' },
    { type: 'asteroids', label: 'CINTURÓN', lines: ['NAVEGAR', 'EL CAOS.'], caption: '450 ASTEROIDES · NINGUNO SE REPITE' },
    { type: 'gate', label: 'PORTAL', lines: ['EL ÚLTIMO', 'SALTO.'] },

    // ACTO III — el título hecho de bloques, y la cámara lo atraviesa
    { type: 'voxeltitle', label: 'HYPERSPACE', word: 'HYPERSPACE', subtitle: 'EL VIAJE EMPIEZA AHORA', colors: [CYAN, VIOLET, MAGENTA] },
    { type: 'statement', text: 'EL VIAJE ES <span>EL DESTINO.</span>', accent: CYAN },
    {
      type: 'credits', mark: false,
      stats: [['7', 'ESCENAS 3D'], ['450', 'ASTEROIDES'], ['0', 'MODELOS IMPORTADOS']],
      line: 'HYPERSPACE — KINETIC STUDIO · THREE.JS + GSAP · TODA LA GEOMETRÍA SE GENERA EN VIVO',
    },
  ],
});
