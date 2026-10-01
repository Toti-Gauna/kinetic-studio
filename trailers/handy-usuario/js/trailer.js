/* HANDY · App de usuario — el tráiler (90 s, escenario 4:3 de 1440×1080 para iPad).
   Configuración del Trailer Kit: paleta y textos de Handy, la música y las diez escenas del storyboard
   (STORYBOARD.md). Cada escena declara su `dur`: src/handy/player.ts pone una etiqueta GSAP con su `id`
   al inicio de la escena (los capítulos del modo pausa y de las teclas 1–9 y 0) y corta el build si la
   receta devuelve otra duración, así ninguna escena se corre de su ventana. */

// URL del QR del cierre (escena 10). Vacía = solo el texto, centrado. En desarrollo, ?qr=<url> la pisa.
const QR_URL = '';

Trailer.run({
  stage: { w: 1440, h: 1080 },
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'Handy', subtitle: 'App de usuario', hud: 'HANDY',
    pageTitle: 'Handy — App de usuario', back: '../../index.html',
  },
  ui: {
    play: 'Tocá para empezar', seconds: 'segundos', sound: 'con sonido', replay: 'Ver de nuevo', back: 'Volver',
    keys: 'Tocá la pantalla para pausar', paused: 'En pausa', soundOn: 'Sonido activado', soundOff: 'Sin sonido',
    particles: '',
  },
  // night = fondo del escenario (gris Handy) · ink / paper = texto oscuro / claro
  // accents: azul principal, azul de personajes, amarillo lamparita, azul claro de interfaz, celeste gota, gris caño
  palette: {
    night: '#CFCFCF', ink: '#141414', paper: '#FFFFFF',
    accents: ['#1F57A8', '#2F6BFF', '#F5F59A', '#4A72B0', '#8EC5FF', '#9C9C9C'],
  },
  fonts: { display: 'Inter', mono: 'Inter', serif: 'Inter', stretch: false },
  qrUrl: QR_URL,

  // Groove pop sintetizado en Do mayor (Do – Sol – Lam – Fa, un acorde por compás de 2 s), 120 BPM.
  // Primer plan: lo afinan las escenas con sus propios efectos encima. Amable, no muy fuerte.
  music: {
    bpm: 120, volume: 0.7,
    parts: [
      { from: 0, to: 8, style: 'tension', volume: 0.8 },   // 1 gancho: pulso grave
      { from: 8, to: 14, style: 'soft' },                   // 2 problema: tics, burbujas…
      { from: 14, to: 17.5, style: 'soft', volume: 0.5 },   // …y el ritmo se apaga (un tiempo de silencio)
      { from: 18, style: 'hit' },                           // 3 entrada: golpe
      { from: 18, to: 26, style: 'groove' },                //   + groove
      { from: 26, to: 36, style: 'half', volume: 0.8 },     // 4 inicio: groove suave
      { from: 36, to: 46, style: 'soft' },                  // 5 tipo de trabajo: toques y la rueda
      { from: 46, style: 'hit', volume: 0.8 },              // 6 presupuestos: golpe de sección
      { from: 46, to: 58, style: 'drive', volume: 0.85 },   //   sin el gancho de campanas: lugar para los "ding"
      { from: 58, to: 60, style: 'build' },
      { from: 60, style: 'hit' },                           // 7 confirmación
      { from: 60, to: 68, style: 'soft' },
      { from: 68, to: 78, style: 'groove', volume: 0.85 },  // 8 seguimiento
      { from: 78, to: 80, style: 'build' },
      { from: 80, style: 'hit' },                           // 9 reseña: festejo
      { from: 80, to: 85, style: 'groove' },
      { from: 85, style: 'hit' },                           // 10 cierre: golpe final y acorde
      { from: 85, to: 90, style: 'soft', volume: 0.7 },
    ],
  },

  // las diez escenas del storyboard: 8 + 10 + 8 + 10 + 10 + 14 + 8 + 12 + 5 + 5 = 90 s
  scenes: [
    { type: 'hd-gancho', id: 'gancho', titulo: 'Gancho', dur: 8 },                              //  0–8
    { type: 'hd-problema', id: 'problema', titulo: 'Problema', dur: 10 },                       //  8–18
    { type: 'hd-entrada', id: 'entrada', titulo: 'Entrada', dur: 8 },                           // 18–26
    { type: 'hd-inicio', id: 'inicio', titulo: 'Inicio', dur: 10 },                             // 26–36
    { type: 'hd-tipo-de-trabajo', id: 'tipo-de-trabajo', titulo: 'Tipo de trabajo', dur: 10 },  // 36–46
    { type: 'hd-presupuestos', id: 'presupuestos', titulo: 'Presupuestos', dur: 14 },           // 46–60
    { type: 'hd-confirmacion', id: 'confirmacion', titulo: 'Confirmación', dur: 8 },            // 60–68
    { type: 'hd-seguimiento', id: 'seguimiento', titulo: 'Seguimiento', dur: 12 },              // 68–80
    { type: 'hd-resena', id: 'resena', titulo: 'Reseña', dur: 5 },                             // 80–85
    { type: 'hd-cierre', id: 'cierre', titulo: 'Cierre', dur: 5 },                              // 85–90
  ],
});
