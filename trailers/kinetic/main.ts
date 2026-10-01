/* KINETIC — A Motion Study
   Entry point. Order matters: the kit scripts are plain modules that talk through window
   (GSAP → audio → engine → recipes → trailer config), so each one must run after the ones it uses. */
import '../../src/lib/gsap.ts'; // GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window
import './js/audio.js';
import './js/engine.js';
import './js/recipes.js';
import './js/trailer.js';
