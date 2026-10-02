/* Handy — App del especialista
   Entry point. Order matters: the kit scripts are plain modules that talk through window
   (GSAP → audio → engine → music → Handy player → scenes → cut → trailer config), so each one must run
   after the ones it uses. escenas-esp-base.js registers a placeholder for every scene ('he-…'); the real scenes
   (escenas-esp-a … escenas-esp-d) register later with the same names and replace them. js/corte.js runs every recipe
   at the film's speed ('hdr-corte', LENTO) and escenas-golpes / escenas-final are the word slams and the ending. */
import '../../src/lib/gsap.ts'; // GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window
import './js/audio.js';
import './js/engine.js';
import './js/recipes-music.js';
import '../../src/handy/player.ts'; // labels per scene, tap to pause, chapters, intro logo, ?audit
import './js/escenas-esp-base.js'; // placeholders for the nine 'he-…' scenes
import './js/escenas-esp-a.js'; // gancho · problema
import './js/escenas-esp-b.js'; // entrada · inicio · pedido
import './js/escenas-esp-c.js'; // elegido · camino
import './js/escenas-esp-d.js'; // trabajo · cobro
import './js/corte.js'; // 'hdr-corte': a recipe, time-warped and trimmed
import './js/escenas-golpes.js'; // 'hdr-golpe': word slams
import './js/escenas-final.js'; // 'hdr-final': the ending
import './js/trailer.js';
