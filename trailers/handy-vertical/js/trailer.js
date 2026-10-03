/* HANDY · Anuncio vertical (1080×1920, 30 s) para Reels, TikTok y Shorts. La película es la de
   src/handy/anuncio/pelicula.js (la misma del anuncio horizontal, armada para este formato). */
import { pelicula } from '../../../src/handy/anuncio/pelicula.js';

Trailer.run(pelicula({
  stage: { w: 1080, h: 1920 },
  meta: { subtitle: 'Anuncio vertical', pageTitle: 'Handy — Anuncio vertical' },
}));
