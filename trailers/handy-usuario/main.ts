/* Handy — App de usuario
   Entry point. Order matters: the kit scripts are plain modules that talk through window
   (GSAP → audio → engine → music → Handy player → scenes → cut → trailer config), so each one must run
   after the ones it uses. The scenes of the first version (escenas-a … escenas-d, 90 s) register their recipes;
   js/corte.js runs any recipe at another speed and trimmed ('hdr-corte'), and this trailer adds its own scenes. */
import '../../src/lib/gsap.ts'; // GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window
import './js/audio.js';
import './js/engine.js';
import './js/recipes-music.js';
import '../../src/handy/player.ts'; // labels per scene, tap to pause, chapters, intro logo, ?audit
import './js/escenas-base.js'; // placeholders for the ten scenes of the first version
import './js/escenas-a.js'; // 1 gancho · 2 problema
import './js/escenas-b.js'; // 3 entrada · 4 inicio · 5 tipo de trabajo
import './js/escenas-c.js'; // 6 presupuestos · 7 confirmación
import './js/escenas-d.js'; // 8 seguimiento · 9 reseña · 10 cierre (not used)
import './js/corte.js'; // 'hdr-corte': a recipe, time-warped and trimmed
import './js/escenas-golpes.js'; // 'hdr-golpe': word slams
import './js/escenas-final.js'; // 'hdr-final': the ending
import './js/trailer.js';
