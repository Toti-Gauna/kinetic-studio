/* Handy usuario Remix
   Entry point. Order matters: the kit scripts are plain modules that talk through window
   (GSAP → audio → engine → music → Handy player → scenes → remix → trailer config), so each one must run
   after the ones it uses. The scenes of the original trailer (escenas-a … escenas-d, unchanged copies) register
   their recipes; js/remix.js runs them faster and trimmed ('hdr-corte'), and the remix adds its own scenes. */
import '../../src/lib/gsap.ts'; // GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window
import './js/audio.js';
import './js/engine.js';
import './js/recipes-music.js';
import '../../src/handy/player.ts'; // labels per scene, tap to pause, chapters, intro logo, ?audit
import './js/escenas-base.js'; // placeholders for the ten scenes of the original
import './js/escenas-a.js'; // 1 gancho · 2 problema
import './js/escenas-b.js'; // 3 entrada · 4 inicio · 5 tipo de trabajo
import './js/escenas-c.js'; // 6 presupuestos · 7 confirmación
import './js/escenas-d.js'; // 8 seguimiento · 9 reseña · 10 cierre
import './js/remix.js'; // 'hdr-corte': an original scene, time-warped and trimmed
import './js/escenas-remix-golpes.js'; // 'hdr-golpe': word slams · Trailer.remix.sello: the REMIX stamp
import './js/escenas-remix-final.js'; // 'hdr-final': the ending
import './js/trailer.js';
