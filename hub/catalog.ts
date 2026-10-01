/* ============================================================================
   CATÁLOGO DEL HUB — una entrada por tráiler.
   Para habilitar uno nuevo: construirlo en trailers/<id>/ (agente trailer-director),
   adoptarlo en Vite (npm run adopt -- trailers/<id>), poner enabled: true y completar
   path, poster, preview, duration, scenes.

   Campos
     id        slug (= carpeta en trailers/)
     enabled   true = se puede ver; false = "PRÓXIMAMENTE"
     title     nombre en el póster        logline   una o dos frases
     category  filtro de la biblioteca     tags      capacidades que pone a prueba
     status    kit | recetas | tech  → qué hace falta para producirlo
     palette   [fondo, acento, detalle] del póster      motif  glifo del póster
     path      ruta al index.html del tráiler (solo habilitados)
     poster    segundo que se usa como póster en vivo
     preview   segundo desde el que arranca la vista previa al pasar el mouse
   Node (>= 22.18) lo importa directo (sin tipos) desde las herramientas de trailers/<id>/tools.
   ========================================================================== */
import type { MotifName } from './motifs.ts';

export type TrailerStatus = 'kit' | 'recetas' | 'tech';

interface TrailerBase {
  id: string;
  title: string;
  category: string;
  logline: string;
  tags: string[];
  status: TrailerStatus;
  palette: [bg: string, accent: string, detail: string];
  motif: MotifName;
}

/** Un tráiler publicado: se puede ver y previsualizar. */
export interface ReadyTrailer extends TrailerBase {
  enabled: true;
  path: string;
  poster: number;
  preview: number;
  duration: number;
  scenes: number;
}

/** Un tráiler en producción: aparece como PRÓXIMAMENTE. */
export interface UpcomingTrailer extends TrailerBase {
  enabled: false;
}

export type TrailerEntry = ReadyTrailer | UpcomingTrailer;

export const catalog: TrailerEntry[] = [
  {
    id: 'kinetic', enabled: true,
    title: 'KINETIC', category: 'Estudio',
    logline: 'Un estudio de movimiento sobre forma, color y tiempo. El tráiler que dio origen al kit.',
    tags: ['morphing', 'tipografía variable', 'partículas', 'túnel warp', 'score sintetizado'],
    status: 'kit', palette: ['#0e0e10', '#ff4d2e', '#2b50ff'], motif: 'shapes',
    path: 'trailers/kinetic/index.html', poster: 42.3, preview: 11, duration: 52, scenes: 10,
  },
  {
    id: 'manifiesto', enabled: true, title: 'MANIFIESTO', category: 'Tipografía',
    logline: 'Un tráiler hecho solo de letras: máquina de escribir, pósters suizos justificados con el eje de ancho, un specimen vivo y reglas numeradas.',
    tags: ['máquina de escribir', 'justificado por eje wdth', 'specimen variable', 'odómetro', 'ticker', 'serif itálica'],
    status: 'kit', palette: ['#f2ede4', '#0e0e10', '#ff4d2e'], motif: 'type',
    path: 'trailers/manifiesto/index.html', poster: 7.6, preview: 6.1, duration: 48, scenes: 9,
  },
  {
    id: 'glitch', enabled: true, title: 'GLITCH', category: 'Efectos',
    logline: 'Una transmisión que arranca, pierde la señal, se corrompe y termina secuestrada por el propio error.',
    tags: ['desgarro con filtro SVG', 'RGB split', 'datamosh en canvas', 'carta de ajuste', 'apagado CRT', 'scanlines'],
    status: 'kit', palette: ['#0a0a0a', '#00ff9c', '#ff2e88'], motif: 'glitch',
    path: 'trailers/glitch/index.html', poster: 30.45, preview: 9.8, duration: 40, scenes: 9,
  },
  {
    id: 'bauhaus', enabled: true, title: 'BAUHAUS 100', category: 'Formas',
    logline: 'Homenaje a la Bauhaus (1919–1933): punto, línea y plano en primarios de imprenta, el cuestionario de Kandinsky y una composición que se dibuja como un plano y después se imprime.',
    tags: ['paths propios en MorphSVG', 'DrawSVG: plano → impresión', 'póster suizo con eje wdth', 'primarios de imprenta', 'solo kit, 0 código nuevo'],
    status: 'kit', palette: ['#f2ede4', '#e63922', '#1d4ed8'], motif: 'bauhaus',
    path: 'trailers/bauhaus/index.html', poster: 20.4, preview: 4.6, duration: 48, scenes: 10,
  },
  {
    id: 'liquid', enabled: true, title: 'LIQUID', category: 'Formas',
    logline: 'Todo fluye: una gota que salpica, blobs 3D que se funden, una palabra sólida que se derrite, una marea que sube y quedamos bajo el agua.',
    tags: ['metaballs por píxel', 'filtro gooey', 'olas en SVG', 'refracción en canvas', 'mesh gradient', 'sonido de agua sintetizado'],
    status: 'kit', palette: ['#1e0b3a', '#7c3aed', '#22d3ee'], motif: 'blob',
    path: 'trailers/liquid/index.html', poster: 9.45, preview: 5.0, duration: 47, scenes: 11,
  },
  {
    id: 'big-bang', enabled: true, title: 'BIG BANG', category: 'Partículas',
    logline: 'Del vacío al universo: 120.000 partículas en la GPU que explotan, forman la red cósmica, una galaxia, un planeta con anillos y el título escrito con estrellas.',
    tags: ['WebGL', '120k partículas en la GPU', 'cámara 3D', 'profundidad de campo', 'galaxia espiral', 'planeta iluminado'],
    status: 'kit', palette: ['#0b1026', '#8b5cf6', '#fbbf24'], motif: 'particles',
    path: 'trailers/big-bang/index.html', poster: 23.2, preview: 3.6, duration: 38, scenes: 7,
  },
  {
    id: 'enjambre', enabled: true, title: 'ENJAMBRE', category: 'Partículas',
    logline: 'Del atardecer a la noche: 1.600 estorninos simulados que llegan en bandada, forman palabras, esquivan un halcón y terminan en un show de drones.',
    tags: ['boids con 7 vecinos', 'simulación precalculada', 'seek exacto', 'formaciones', 'depredador', 'cielo del atardecer a la noche'],
    status: 'kit', palette: ['#0f172a', '#22d3ee', '#f8fafc'], motif: 'swarm',
    path: 'trailers/enjambre/index.html', poster: 29.0, preview: 3.0, duration: 39, scenes: 7,
  },
  {
    id: 'hyperspace', enabled: true, title: 'HYPERSPACE', category: '3D',
    logline: 'Un viaje 3D real: un hangar que se enciende, el salto, el túnel del hiperespacio, un planeta con anillos, un campo de asteroides, un portal y el título hecho de bloques que la cámara atraviesa.',
    tags: ['Three.js', 'bloom', 'shaders propios', 'cámara 3D', 'geometría procedural', 'luces dinámicas'],
    status: 'kit', palette: ['#020617', '#3b82f6', '#e879f9'], motif: 'tunnel',
    path: 'trailers/hyperspace/index.html', poster: 22.4, preview: 8.4, duration: 49, scenes: 9,
  },
  {
    id: 'paper-city', enabled: true, title: 'PAPER CITY', category: '3D',
    logline: 'Una ciudad de papel con sombras reales: un plano que se dibuja solo, edificios que crecen piso por piso, tráfico en miniatura, un time-lapse de día a noche y el título como un libro pop-up.',
    tags: ['Three.js + sombras suaves', 'tilt-shift (miniatura)', 'ventanas procedurales', 'ciclo día/noche', 'blueprint', 'letras pop-up'],
    status: 'kit', palette: ['#fde68a', '#f97316', '#1e293b'], motif: 'iso',
    path: 'trailers/paper-city/index.html', poster: 23.4, preview: 6.0, duration: 43, scenes: 7,
  },
  {
    id: 'data-story', enabled: true, title: 'DATA STORY', category: 'Datos',
    logline: 'El mundo en números, con datos reales: 8.092 millones de personas, la curva de la población desde 1800, la esperanza de vida, 74 de cada 100 en internet y la explosión solar.',
    tags: ['datos reales (Our World in Data)', 'línea que se dibuja', 'barras con énfasis', 'waffle 10×10', 'odómetro', 'paleta validada'],
    status: 'kit', palette: ['#0f172a', '#10b981', '#f59e0b'], motif: 'bars',
    path: 'trailers/data-story/index.html', poster: 12.9, preview: 5.6, duration: 48, scenes: 8,
  },
  {
    id: 'global', enabled: true, title: 'GLOBAL', category: 'Datos',
    logline: 'Un mapa que se envuelve en un globo de puntos: rutas desde Buenos Aires con distancias reales, 24 horas de día y noche en siete segundos y 50 años de pasajeros aéreos.',
    tags: ['proyección ortográfica', 'mapa → globo', 'arcos de gran círculo', 'terminador día/noche', 'datos reales (OACI)', 'Natural Earth'],
    status: 'kit', palette: ['#031525', '#38bdf8', '#f472b6'], motif: 'globe',
    path: 'trailers/global/index.html', poster: 42.6, preview: 3.0, duration: 52, scenes: 7,
  },
  {
    id: 'launch', enabled: true, title: 'LAUNCH', category: 'Producto',
    logline: 'El tráiler de producto de KINETIC STUDIO: un panel que se arma solo con cifras reales del hub, un cursor que crea y publica este mismo tráiler, modo oscuro en círculo y la interfaz explotada en 3D.',
    tags: ['UI en HTML/CSS', 'cursor con clics', 'tipeo humano', 'FLIP', 'modo oscuro', 'vista explotada 3D', 'datos reales del hub'],
    status: 'kit', palette: ['#0b0b12', '#6366f1', '#a5f3fc'], motif: 'ui',
    path: 'trailers/launch/index.html', poster: 33.3, preview: 6.4, duration: 53, scenes: 8,
  },
  {
    id: 'ecommerce', enabled: true, title: 'ECOMMERCE', category: 'Producto',
    logline: 'Una tienda argentina manejada con un solo mouse: login, modo oscuro, carrito, checkout con envío y medios de pago, envíos a las 24 jurisdicciones y el panel de ventas. "Todo a un click."',
    tags: ['primera versión', '90 s', 'mezcla de 6 tráileres', 'tienda en HTML/CSS', 'carrito y checkout', 'Argentina resaltada', 'música pop sintetizada', 'datos de ejemplo rotulados'],
    status: 'kit', palette: ['#0b1220', '#74acdf', '#f6b40e'], motif: 'cart',
    path: 'trailers/ecommerce/index.html', poster: 88.6, preview: 15.5, duration: 90, scenes: 15,
  },
  {
    id: 'ecommerce-remix', enabled: true, title: 'ECOMMERCE REMIX', category: 'Producto',
    logline: 'La misma tienda, cortada como tráiler: un click en la oscuridad, un drop, la tienda a toda velocidad con cámara 3D, Argentina, cifras reales, el admin y "todo a un click". Un minuto de house en La menor.',
    tags: ['remix', '60 s', 'cold open', 'dos drops', 'cámara 3D y barridos', 'escenas aceleradas (warp)', 'house sintetizado'],
    status: 'kit', palette: ['#0f1b2d', '#e63922', '#f6b40e'], motif: 'cart',
    path: 'trailers/ecommerce-remix/index.html', poster: 10.2, preview: 8.0, duration: 60, scenes: 16,
  },
  {
    id: 'deploy', enabled: true, title: 'DEPLOY', category: 'Producto',
    logline: 'Para developers: una terminal con comandos reales, el código que genera la música con resaltado en vivo, el treemap del kit y el chequeo real de los 14 tráileres antes de publicar este.',
    tags: ['terminal real', 'tipeo humano', 'syntax highlight', 'treemap', 'pipeline', 'todo corrió de verdad'],
    status: 'kit', palette: ['#0d1117', '#3fb950', '#58a6ff'], motif: 'terminal',
    path: 'trailers/deploy/index.html', poster: 41.8, preview: 32.5, duration: 56, scenes: 7,
  },
  {
    id: 'vertical', enabled: true, title: 'VERTICAL', category: 'Formatos',
    logline: 'Un Reel del propio hub en 9:16: el feed de los tráileres con sus pósters reales, un dedo que hace swipe, pinch, doble tap y mantener, subtítulos grandes y las cifras del kit.',
    tags: ['escenario 1080×1920', 'barra de historias', 'swipe · pinch · doble tap', 'subtítulos palabra por palabra', 'feed y perfil', 'datos del hub'],
    status: 'kit', palette: ['#111827', '#ff2e88', '#fde047'], motif: 'phone',
    path: 'trailers/vertical/index.html', poster: 20.2, preview: 3.0, duration: 38, scenes: 5,
  },
  {
    id: 'countdown', enabled: true, title: 'COUNTDOWN', category: 'Formatos',
    logline: 'Una cuenta regresiva en vivo hacia el próximo Año Nuevo: dígitos que se transforman, tu hora real, un tablero de paletas, el año en puntos y fuegos artificiales.',
    tags: ['morph de dígitos', 'tiempo real', 'tablero de paletas', 'el año en puntos', 'fuegos en canvas', 'CTA'],
    status: 'kit', palette: ['#0e0e10', '#ff4d2e', '#f2ede4'], motif: 'clock',
    path: 'trailers/countdown/index.html', poster: 36.2, preview: 0.2, duration: 39, scenes: 6,
  },
  {
    id: 'lower-thirds', enabled: true, title: 'LOWER THIRDS', category: 'Formatos',
    logline: 'No es un tráiler: un pack de 13 rótulos, zócalos y transiciones que se exportan con fondo transparente (secuencia PNG con alfa) para cualquier editor de video.',
    tags: ['13 componentes', 'fondo transparente', 'croma', 'secuencia PNG con alfa', '?solo=<id>', 'área segura'],
    status: 'kit', palette: ['#f2ede4', '#2b50ff', '#0e0e10'], motif: 'lower',
    path: 'trailers/lower-thirds/index.html', poster: 5.8, preview: 4.0, duration: 49, scenes: 15,
  },
  {
    id: 'noir', enabled: true, title: 'NOIR', category: 'Cine',
    logline: 'NOCTURNO, un thriller en blanco y negro: lluvia bajo un farol, luz de persianas que revela el texto, gotas en un vidrio, un reflector sobre el título y una sola línea roja.',
    tags: ['tipografía serif', 'lluvia en canvas', 'luces volumétricas', 'texto revelado por la luz', 'walking bass', 'un solo color'],
    status: 'kit', palette: ['#0a0a0a', '#e5e5e5', '#737373'], motif: 'noir',
    path: 'trailers/noir/index.html', poster: 36.5, preview: 0.5, duration: 45, scenes: 6,
  },
  {
    id: 'opening-titles', enabled: true, title: 'OPENING TITLES', category: 'Cine',
    logline: 'Títulos de apertura en homenaje a Saul Bass: papel cortado a tijera, una espiral, barras y una grilla. El reparto son tráileres del hub y el equipo técnico es real.',
    tags: ['homenaje a Saul Bass', 'papel recortado (clip-path)', 'tipografía cortada a mano', 'créditos de cine', 'grano de papel', 'walking bass'],
    status: 'kit', palette: ['#f97316', '#111111', '#f5f5f4'], motif: 'cutout',
    path: 'trailers/opening-titles/index.html', poster: 19.4, preview: 0.3, duration: 41, scenes: 6,
  },
  {
    id: 'synthwave', enabled: true, title: 'SYNTHWAVE', category: 'Cine',
    logline: 'Un viaje a los 80 en una cinta VHS con la fecha de hoy: sol de neón, grilla infinita, sólidos de alambre, letras cromadas y "Kinetic" en neón. En los 80 esto se hacía con cinta; hoy, con código.',
    tags: ['grilla en perspectiva', 'texto cromado', 'neón', 'VHS con fecha real', 'sólidos de alambre', 'música synthwave'],
    status: 'kit', palette: ['#1a0536', '#ff2e97', '#ffd319'], motif: 'sun',
    path: 'trailers/synthwave/index.html', poster: 27.6, preview: 3.0, duration: 37, scenes: 6,
  },
  {
    id: 'beat', enabled: true, title: 'BEAT', category: 'Audio',
    logline: 'Un videoclip generativo donde la partitura mueve la imagen: el pulso, un secuenciador de 16 pasos con el patrón real, 12 notas en un círculo y una letra que cae sobre cada bombo. Con espectro en vivo (AnalyserNode).',
    tags: ['la partitura como datos', 'sync exacto', 'secuenciador 16 pasos', 'círculo de 12 notas', 'AnalyserNode en vivo', 'letras sobre el pulso'],
    status: 'kit', palette: ['#111111', '#d4ff3a', '#ff4d2e'], motif: 'wave',
    path: 'trailers/beat/index.html', poster: 17.2, preview: 8.0, duration: 34, scenes: 4,
  },
  {
    id: 'wrapped', enabled: true, title: 'WRAPPED', category: 'Datos',
    logline: 'Tu año en números en tarjetas vibrantes de 9:16, armadas desde un JSON con las cifras reales de los 22 tráileres del hub. Una plantilla, 22 historias: sumá ?who=noir y es el año de NOIR.',
    tags: ['plantilla desde JSON', 'datos medidos por script', '?who= para cada tráiler', 'cifras que cuentan', 'top 5 y paleta', 'vertical 1080×1920'],
    status: 'kit', palette: ['#121212', '#1ed760', '#ff90e8'], motif: 'cards',
    path: 'trailers/wrapped/index.html', poster: 32.5, preview: 4.0, duration: 43, scenes: 10,
  },
  {
    id: 'export', enabled: true, title: 'EXPORT', category: 'Técnica',
    logline: 'Del navegador a MP4 sin instalar nada: cada cuadro se captura en su segundo exacto, Chrome lo codifica (WebCodecs) y el sonido se renderiza offline. Con los números reales de exportar KINETIC, WRAPPED y BEAT.',
    tags: ['captura cuadro por cuadro', 'WebCodecs H.264 + AAC', 'audio offline', 'SHA-256 por 3 caminos', 'MP4 · 9:16 · GIF', 'sin ffmpeg'],
    status: 'kit', palette: ['#111113', '#ef4444', '#fafafa'], motif: 'film',
    path: 'trailers/export/index.html', poster: 17.5, preview: 4.0, duration: 44, scenes: 7,
  },
  {
    id: 'bifurcacion', enabled: true, title: 'BIFURCACIÓN', category: 'Técnica',
    logline: 'Un tráiler que se elige: en la bifurcación elegís A · LA FORMA o B · EL DATO, el mouse mueve la cámara por capas y la rueda mueve el tiempo, para adelante y para atrás. Abrilo para jugarlo; la vista previa sigue el camino A.',
    tags: ['modo interactivo', 'ramas de timeline', 'ScrollTrigger: scroll = tiempo', 'Observer: parallax', 'A / B con clic o tecla', 'música por rama'],
    status: 'kit', palette: ['#0e0e10', '#a78bfa', '#34d399'], motif: 'branch',
    path: 'trailers/bifurcacion/index.html', poster: 8.5, preview: 4.0, duration: 34, scenes: 6,
  },
  {
    id: 'handy-usuario', enabled: true, title: 'HANDY · USUARIO', category: 'Producto',
    logline: 'Handy conecta a quien tiene un problema en casa con especialistas verificados de Mar del Plata: el especialista pone su precio, vos elegís y seguís todo en la app. Un tráiler de 90 segundos para iPad, sin que nadie hable.',
    tags: ['4:3 para iPad', 'tocá para pausar', 'escenas con etiqueta', 'personajes en SVG', 'app en HTML/CSS', 'solo transform y opacity'],
    status: 'kit', palette: ['#cfcfcf', '#1f57a8', '#f5f59a'], motif: 'handy',
    path: 'trailers/handy-usuario/index.html', poster: 52, preview: 18, duration: 90, scenes: 10,
  },
];
