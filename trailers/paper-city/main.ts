/* PAPER CITY — Una ciudad de papel
   Entry point. Order matters: the kit scripts are plain modules that talk through window
   (GSAP → audio → engine → recipes → trailer config), so each one must run after the ones it uses. */
import '../../src/lib/gsap.ts'; // GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window
import '../../src/lib/three.ts'; // Three.js r147 + postprocessing as window.THREE
import './js/audio.js';
import './js/engine.js';
import './js/recipes.js';
import './js/recipes-type.js';
import './js/recipes-glitch.js';
import './js/recipes-liquid.js';
import './js/recipes-cosmos.js';
import './js/recipes-swarm.js';
import './js/recipes-3d.js';
import './js/recipes-city.js';
import './js/trailer.js';
