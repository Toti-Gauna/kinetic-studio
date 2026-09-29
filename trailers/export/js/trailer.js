/* ============================================================================
   EXPORT — del navegador a MP4 (#22 del hub).
   El tráiler de tools/export.mjs, la herramienta nueva del kit: cada tráiler del hub a un archivo
   de video, sin instalar nada (Chrome captura y WebCodecs codifica). Todos los números son de
   exportaciones reales, hechas por tools/capture.mjs (js/data/export-data.js):
     · KINETIC → exports/kinetic.mp4 + .wav (cuadros, tiempos, forma de onda, eventos);
     · WRAPPED → exports/wrapped.mp4 (9:16), BEAT → exports/beat.gif;
     · la prueba de determinismo: un cuadro de WRAPPED por 3 caminos, SHA-256 de cada captura.
   La cantidad de tráileres sale de hub/catalog.js y el cuadro de WRAPPED, de sus propios datos.
   ========================================================================== */
const X = window.EXPORT_DATA, K = X.runs.kinetic, WR = X.runs.wrapped, BT = X.runs.beat;
const es = (v, d = 0) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const MB = b => es(b / 1048576, 1);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const trailers = window.HUB_CATALOG.filter(t => t.enabled && t.id !== 'export').length;

// the WRAPPED frame of the determinism test (11,8 s): its third stat card, rebuilt from its data
const test = X.hash.tests[0], rest = X.hash.tests.slice(1);
const wrAnim = window.WRAPPED_DATA.trailers.reduce((a, t) => a + t.animations, 0);
const frameHTML = `<div class="xp-wr" style="background:#ff6437;color:#121212"><small class="mono">LO QUE SE MUEVE</small><p>Se mueven con</p><b class="v">${es(wrAnim)}</b><strong class="v">ANIMACIONES</strong></div>`;
const worst = rest.filter(t => !t.identical).flatMap(t => t.paths.filter(p => p.diff).map(p => p.diff));
const maxPx = Math.max(0, ...worst.map(d => d.pixels)), maxLv = Math.max(0, ...worst.map(d => d.maxLevel)), identicalN = X.hash.tests.filter(t => t.identical).length;
const note = `Probamos ${X.hash.tests.length} cuadros de WRAPPED: <b>${identicalN} idénticos bit a bit</b>` +
  (worst.length ? `; en los otros ${X.hash.tests.length - identicalN}, como mucho <b>${es(maxPx)} píxeles de ${es(worst[0].of)}</b> cambian ${maxLv} nivel${maxLv === 1 ? '' : 'es'} de 255 (invisible).` : '.');

// the console output of the real KINETIC export, coloured
const out = X.log.map(l => {
  const h = esc(l);
  if (l.includes('frames')) return `<span class="tt-c">${h}</span>`;
  if (l.includes('audio:')) return `<span class="tt-m">${h}</span>`;
  if (l.includes('→')) return h.replace('→', '<span class="tt-g">→</span>').replace(/(exports\/\S+)/, '<span class="tt-y">$1</span>');
  return `<span class="tt-w">${h}</span>`;
});

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: { title: 'EXPORT', subtitle: 'DEL NAVEGADOR A MP4', hud: 'KINETIC STUDIO — EXPORT', back: '../../index.html' },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'REPETIR', back: 'HUB',
    keys: 'ESPACIO PAUSA · M SILENCIO · R REPETIR · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SONIDO DESACTIVADO',
  },
  palette: { night: '#111113', ink: '#111113', paper: '#fafafa', accents: ['#ef4444', '#fafafa', '#a1a1aa', '#4ade80', '#f59e0b', '#3b82f6'], glow: '#ef4444' },
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Instrument Serif', stretch: true, preload: ['800 100px "JetBrains Mono"', '500 20px "JetBrains Mono"'] },
  music: {
    bpm: 120, volume: 0.85, chords: Trailer.music.MINOR, riff: Trailer.music.RIFF_MINOR,
    parts: [
      { from: 0, to: 4, style: 'tension' },
      { from: 4, style: 'hit' },
      { from: 4, to: 12, style: 'drive' },
      { from: 12, to: 18, style: 'half' },
      { from: 18, to: 24, style: 'groove' },
      { from: 24, to: 32, style: 'soft', volume: 0.8 },
      { from: 32, style: 'hit', volume: 0.7 },
      { from: 32, to: 38, style: 'house' },
      { from: 38, style: 'hit' },
      { from: 38, to: 44, style: 'soft', volume: 0.7 },
    ],
  },

  scenes: [
    // 0–4 s: lo que había hasta hoy
    { type: 'xpopen', label: 'HASTA HOY', duration: 4, lines: [`${trailers} TRÁILERES.`, '<em>0</em> VIDEOS.', 'TODO EN EL NAVEGADOR.', '<em>HASTA HOY.</em>'] },
    // 4–12 s: el tiempo es un número
    {
      type: 'xpframes', label: 'CUADROS', duration: 8, fps: K.fps, frames: K.frames, filmDuration: K.duration,
      kicker: 'CUADRO POR CUADRO', title: 'El tiempo es un número.', vfLabel: 'KINETIC', countLabel: 'CUADRO',
      stats: `<b>${es(K.frames)}</b> cuadros en <b>${es(K.captureSeconds, 0)} s</b> · ${es(K.frames / K.captureSeconds, 1)} por segundo<span>Cada uno: saltar al segundo exacto, dibujar, fotografiar.</span>`,
    },
    // 12–18 s: el mismo cuadro por tres caminos
    {
      type: 'xphash', label: 'DETERMINISMO', duration: 6, test, same: test.identical, filmDuration: WR.duration,
      kicker: 'DETERMINISMO', title: '3 caminos, 1 cuadro.', frameHTML, frameLabel: `WRAPPED · ${es(test.t, 1)} s`,
      stamp: test.identical ? 'IDÉNTICOS' : 'DISTINTOS', note,
    },
    // 18–24 s: el sonido
    {
      type: 'xpwave', label: 'AUDIO', duration: 6, peaks: X.waveform.peaks, events: X.waveform.events, filmDuration: X.waveform.duration,
      kicker: 'AUDIO OFFLINE', title: 'El sonido, sin micrófono.',
      facts: [[es(K.audio.events), 'EVENTOS'], [`${es(K.duration, 1)} s`, 'DE AUDIO'], [`${es(K.audio.renderSeconds, 1)} s`, 'DE RENDER']],
      file: `exports/kinetic.wav · ${MB(K.wav.bytes)} MB · ${K.audio.sampleRate / 1000} kHz · estéreo · 16 bits`,
    },
    // 24–32 s: el comando de verdad, con su salida de verdad
    {
      type: 'terminal', label: 'TERMINAL', duration: 8, title: 'node — animations', caption: 'del navegador a un archivo, en un comando',
      prompt: '<span class="tt-g">➜</span> <span class="tt-b">animations</span> <span class="tt-m">$</span> ',
      // the real command, as a shell would take it: the kit path in a variable, the long line split with "\"
      cmds: (() => {
        const kit = '~/.claude/trailer-kit', full = X.cmd.replace(kit, '$KIT'), cut = full.indexOf(' --out');
        const fast = { base: 0.008, jitter: 0.012 };
        return [
          { cmd: `KIT=${kit}`, out: [], wait: 0.3, think: 0.1, ...fast },
          { cmd: full.slice(0, cut) + ' \\', out: [], wait: 0.15, think: 0.05, ...fast },
          { cmd: full.slice(cut + 1), prompt: '<span class="tt-m">&gt;</span> ', out, wait: 0.05, think: 0.45, ...fast },
        ];
      })(),
    },
    // 32–38 s: los archivos, a la misma escala
    {
      type: 'xpformats', label: 'FORMATOS', duration: 6,
      kicker: '3 ARCHIVOS · 0 INSTALACIONES', title: 'Todo lo codifica Chrome.', sub: 'WEBCODECS · MP4-MUXER · GIFENC — SIN FFMPEG',
      files: [
        { poster: X.posters.kinetic, badge: 'MP4', width: K.width, height: K.height, fps: K.fps, bytes: K.bytes, codec: 'H.264 + AAC' },
        { poster: X.posters.wrapped, badge: 'MP4', width: WR.width, height: WR.height, fps: WR.fps, bytes: WR.bytes, codec: 'H.264 + AAC · 9:16' },
        { poster: X.posters.beat, badge: 'GIF', width: BT.width, height: BT.height, fps: BT.fps, bytes: BT.bytes, codec: 'GIF · SIN SONIDO' },
      ],
    },
    // 38–44 s: el título
    { type: 'xptitle', label: 'EXPORT', duration: 6, title: 'EXPORT', tagline: 'DEL NAVEGADOR A MP4', cta: 'node $KIT/tools/export.mjs <b>&lt;cualquier tráiler&gt;</b>' },
  ],
});
