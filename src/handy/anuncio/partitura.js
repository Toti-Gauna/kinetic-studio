/* HANDY · Anuncios — la partitura de los dos anuncios (30 s, 120 BPM: 1 compás = 2 s, grilla de semicorcheas).
   Estilos: js/recipes-music.js de cada tráiler (la copia de Handy). Pop en Do mayor; el gancho arranca en La menor
   (el problema) y el logo sube a Do.

    0      GOLPE     crash + boom: el anuncio arranca pegando (las primeras palabras ya están en pantalla)
    0–4    latido    Am – F: bombo en negras, bajo sincopado ("¿Se rompió algo?" / "¿Sabés arreglarlo?")
    4      GOLPE     Do: el logo
    4–6    coro      C: el llamado del gancho (do re mi sol la) bajo el logo
    6–14   verso     C – G – Am – F: el lado del usuario
   14–16   subida    G: "¿Y si sos especialista?"
   16      GOLPE     DROP
   16–24   coro      C – G – Am – F: el lado del especialista, con el gancho
   24–26   quiebre   F: "Para el que necesita." / "Para el que sabe."
   26      GOLPE     Do: el final
   26–28   coro      C, lleno
   28–30   final     C: el último acorde y la firma (las cinco notas); nada queda sonando después de 30. */

const { C, G, Am, F } = Trailer.music.ACORDES;

const LLAMADO = [[0, 72, 2], [2, 74, 2], [4, 76, 2], [6, 79, 2], [8, 81, 6], [16, 79, 2], [18, 76, 2], [20, 74, 2], [22, 72, 8]];
const FIRMA = [[0, 84, 1], [1, 86, 1], [2, 88, 1], [3, 91, 1], [4, 93, 12]];

export const PARTITURA = {
  bpm: 120, volume: 0.85,
  parts: [
    { from: 0, style: 'hit', chords: [Am], volume: 0.8 },
    { from: 0, to: 4, style: 'latido', anchor: 0, chords: [Am, F] },
    { from: 4, style: 'hit', chords: [C], volume: 0.9 },
    { from: 4, to: 6, style: 'coro', chords: [C], hook: LLAMADO, volume: 0.8 },
    { from: 6, to: 14, style: 'verso', chords: [C, G, Am, F], answer: true },
    { from: 14, to: 16, style: 'subida', chords: [G] },
    { from: 16, style: 'hit', chords: [C] },
    { from: 16, to: 24, style: 'coro', chords: [C, G, Am, F], hookVol: 0.06, volume: 1.1 },
    { from: 24, to: 26, style: 'quiebre', chords: [F] },
    { from: 26, style: 'hit', chords: [C] },
    { from: 26, to: 28, style: 'coro', chords: [C], lleno: true, volume: 1.2 },
    { from: 28, to: 30, style: 'final', chords: [C], hook: FIRMA, hookVol: 0.05 },
  ],
};
