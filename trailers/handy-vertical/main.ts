/* Handy — anuncio (Entry point). Order matters: GSAP → audio → engine → music → Handy player → scenes → trailer config.
   The scenes are shared by both ad formats (src/handy/anuncio/: each recipe lays itself out with formato(D)). */
import '../../src/lib/gsap.ts'; // GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window
import './js/audio.js';
import './js/engine.js';
import './js/recipes-music.js';
import '../../src/handy/player.ts'; // labels per scene, tap to pause, chapters, intro logo, ?audit, bleed
import '../../src/handy/anuncio/base.js'; // placeholders for the 'ha-…' scenes
import '../../src/handy/anuncio/golpes.js'; // 'ha-golpe': word slams
import '../../src/handy/anuncio/marca.js'; // 'ha-marca' · 'ha-final'
import '../../src/handy/anuncio/usuario.js'; // 'ha-usuario'
import '../../src/handy/anuncio/especialista.js'; // 'ha-especialista'
import './js/trailer.js';
