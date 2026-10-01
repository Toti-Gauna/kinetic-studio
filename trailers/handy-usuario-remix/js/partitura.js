/* HANDY USUARIO REMIX — la partitura (cfg.music de js/trailer.js). Estilos y gancho: js/recipes-music.js.

   120 BPM · 1 compás = 2 s · todo en la grilla de semicorcheas. Pop en Do mayor (C – G – Am – F), salvo el
   arranque: el problema (0–8) va en La menor (Am – F – Dm – G) y el drop de los 8 s sube a Do mayor (del
   problema a la solución). El gancho "cinco Handys, cinco notas" (Trailer.music.HOOK) usa las cinco notas
   de la pentatónica de Do, C D E G A: las mismas que suenan en menor en la apertura y las mismas cinco que
   tocan las letras del logo en la escena 3. Las escenas ponen sus efectos (gotas, toques, "ding", golpes de
   palabras); la partitura pone el groove y el acorde final.

    0–3   frío       Am – F: pad oscuro, latido grave y el eco del gancho en menor (A C E · D C), bajito
    3–7   latido     F – Dm – G: el bombo en negras crece, bajo sincopado, aparecen los hats (los chats). Es
                     `ligado`: el pad de Fa del frío sigue sonando en 3 (sin cortarse a mitad de compás) y el
                     próximo entra en 4
    7–8   subida     G: riser de 1 s, redoble de palmas corcheas → semicorcheas, campanitas B4 D5 E5 G5
    8     GOLPE      DROP 1: crash + boom + acorde de Do (volumen 0,85)
    8–12  coro       C – F: el llamado del gancho (do re mi sol la, 8–9) y las letras lo contestan una octava
                     arriba (9,25–10,25); cierre la sol re do (11–11,75) cuando el logo ya está armado. Volumen
                     0,7: el drop más liviano de los tres (las letras y el logo traen lo suyo)
   12–22  verso      C – G – Am – F – G: liviano bajo la app, sobre una cama de pad muy baja; una respuesta de dos
                     notas en los compases impares
   22–24  subida     G: riser de 2 s ("¿Cuánto sale?" pone sus golpes en 22 y 23)
   24     GOLPE      DROP 2
   24–30  coro       C – G – Am: el gancho (sus tres primeros compases), un poco más bajo que los "ding"; volumen 1,12
   30–34  verso      F – G: confirmación ($ 47.250, el acorde de Sol de la escena en 33), con la cama de pad
   34–40  verso full C – Am – F: seguimiento, con pad y hats en semicorcheas (la variación)
   40–42  coro       C: el festejo de la reseña, sin gancho (la escena trae su escalera de campanas)
   42–44  quiebre    F: pad + el llamado del gancho largo, sin bombo ("Pedí." "Compará.")
   44–46  subida     G: riser de 2 s ("Elegí." "Seguí.")
   46     GOLPE      DROP 3
   46–54  coro       C – G – Am – F: el gancho entero, doblado a la octava desde 48 (46–48 sin doblar: ahí suenan
                     las campanas de las letras del logo, C6 D6 E6 G6 C7, de 47 a 48); `lleno`: pad en dos octavas
                     con el filtro abierto y el bajo que galopa; volumen 1,25; remate de palmas a 53,625
   54–56  final      C: golpe final, acorde sostenido y las cinco notas en semicorcheas arriba; el pad se
                     apaga de 55,375 a 55,925 (un fundido desde su nivel) y nada queda programado en 56

   Los tres drops crecen (RMS del render offline): 8–12 ≈ −17,9 dB · 24–30 ≈ −17,2 · 46–54 ≈ −16,4; los versos
   quedan en −21/−22 dB y el pico de la película en −1,9 dBFS. */

const { C, G, Am, F, Dm } = Trailer.music.ACORDES;

// la apertura en menor: las cinco notas de siempre, leídas desde La
const INTRO = [Am, F, Dm, G];
const ECO = [[0, 69, 4], [4, 72, 4], [8, 76, 8], [16, 74, 4], [20, 72, 12]];

// drop 1: el llamado (do re mi sol la) deja lugar a las letras (C6 D6 E6 G6 A6, 9,25–10,25) y cierra después del logo
const LLAMADO = [[0, 72, 2], [2, 74, 2], [4, 76, 2], [6, 79, 2], [8, 81, 2], [24, 81, 2], [26, 79, 2], [28, 74, 2], [30, 72, 4]];

// el final: las cinco notas en semicorcheas, una octava arriba, sobre el acorde de Do
const FIRMA = [[0, 84, 1], [1, 86, 1], [2, 88, 1], [3, 91, 1], [4, 93, 12]];

export const PARTITURA = {
  bpm: 120, volume: 0.8,
  parts: [
    // ── el problema, en La menor (0–8)
    { from: 0, to: 3, style: 'frio', anchor: 0, chords: INTRO, hook: ECO, hookVol: 0.04 },
    { from: 3, to: 7, style: 'latido', anchor: 0, chords: INTRO, ligado: true }, // el pad de Fa sigue: el próximo entra en 4
    { from: 7, to: 8, style: 'subida', chords: [G] },
    // ── DROP 1: Handy (8–12) — el más liviano de los tres drops (crecen: 1 < 2 < 3)
    { from: 8, style: 'hit', chords: [C], volume: 0.85 },
    { from: 8, to: 12, style: 'coro', chords: [C, F], hook: LLAMADO, volume: 0.7 },
    // ── la app (12–22) y la subida a "¿Cuánto sale?"
    { from: 12, to: 22, style: 'verso', chords: [C, G, Am, F, G], answer: true },
    { from: 22, to: 24, style: 'subida', chords: [G] },
    // ── DROP 2: presupuestos (24–30), confirmación y seguimiento (30–40)
    { from: 24, style: 'hit', chords: [C] },
    { from: 24, to: 30, style: 'coro', chords: [C, G, Am], hookVol: 0.065, volume: 1.12 }, // gancho ≈ el de antes (0,065 × 1,12)
    { from: 30, to: 34, style: 'verso', chords: [F, G] },
    { from: 34, to: 40, style: 'verso', chords: [C, Am, F], full: true },
    // ── reseña, el quiebre del resumen y la subida
    { from: 40, to: 42, style: 'coro', chords: [C], hook: false },
    { from: 42, to: 44, style: 'quiebre', chords: [F] },
    { from: 44, to: 46, style: 'subida', chords: [G] },
    // ── DROP 3: el final (46–56) — el más grande: `lleno` y volumen 1,25; el doblado del gancho, desde 48
    { from: 46, style: 'hit', chords: [C] },
    { from: 46, to: 54, style: 'coro', chords: [C, G, Am, F], hookOct: [0, 12], hookOctDesde: 48, lleno: true, volume: 1.25 },
    { from: 54, to: 56, style: 'final', chords: [C], hook: FIRMA, hookVol: 0.05 },
  ],
};
