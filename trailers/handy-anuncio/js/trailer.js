/* HANDY · Anuncio horizontal (1920×1080, 30 s) para YouTube y Meta. La película es la de
   src/handy/anuncio/pelicula.js (la misma del anuncio vertical, armada para este formato). */
import { pelicula } from '../../../src/handy/anuncio/pelicula.js';

Trailer.run(pelicula({
  stage: { w: 1920, h: 1080 },
  meta: { subtitle: 'Anuncio para YouTube y Meta', pageTitle: 'Handy — Anuncio' },
}));
