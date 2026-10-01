/* Handy — App de usuario
   Entry point. Order matters: the kit scripts are plain modules that talk through window
   (GSAP → audio → engine → music → Handy player → scenes → trailer config), so each one must run
   after the ones it uses. The scene modules register their recipes with Trailer.recipe(); a recipe
   registered later with the same name replaces the placeholder from escenas-base.js. */
import '../../src/lib/gsap.ts'; // GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window
import './js/audio.js';
import './js/engine.js';
import './js/recipes-music.js';
import '../../src/handy/player.ts'; // labels per scene, tap to pause, chapters, intro logo, ?audit
import './js/escenas-base.js'; // placeholders for the ten scenes (8 + 10 + 8 + 10 + 10 + 14 + 8 + 12 + 5 + 5 = 90 s)
import './js/escenas-a.js'; // 1 gancho · 2 problema
import './js/escenas-b.js'; // 3 entrada · 4 inicio · 5 tipo de trabajo
import './js/escenas-c.js'; // 6 presupuestos · 7 confirmación
import './js/escenas-d.js'; // 8 seguimiento · 9 reseña · 10 cierre
import './js/trailer.js';
