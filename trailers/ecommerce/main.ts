/* ECOMMERCE — Todo a un click
   Entry point. Order matters: the kit scripts are plain modules that talk through window
   (GSAP → audio → engine → recipes → trailer config), so each one must run after the ones it uses. */
import '../../src/lib/gsap.ts'; // GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window
// import '../../src/lib/three.ts'; // 3D recipes (js/recipes-3d.js) need Three.js: uncomment to load it
import './js/audio.js';
import './js/engine.js';
import './js/recipes.js';
import './js/recipes-type.js';
import './js/recipes-glitch.js';
import './js/recipes-liquid.js';
import './js/recipes-data.js';
import './js/recipes-cosmos.js';
import './js/recipes-swarm.js';
import './js/recipes-3d.js';
import './js/recipes-city.js';
import './js/data/land.js';
import './js/data/hl-032-238.js';
import './js/recipes-globe.js';
import './js/recipes-ui.js';
import './js/recipes-dev.js';
import './js/recipes-shop.js';
import './js/recipes-music.js';
import './js/trailer.js';
