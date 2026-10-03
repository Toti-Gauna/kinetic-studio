/* HANDY · App de usuario — golpes de palabras ('hdr-golpe').
   Escritos a 120 BPM (un tiempo = 0,5 s; los tiempos de abajo son los de la escritura): js/trailer.js los corre a
   través de 'hdr-corte' LENTO = 1,25 veces más lentos (96 BPM). En la película, T + (t − inicio)·1,25.

   'hdr-golpe'  { dur, salida, palabras: [{ texto, at, fondo, color, desde, mitad, sub, icono, handy, humor, lado, tamano }] }
     Tipografía a pantalla completa, en el pulso: cada palabra es dueña de un panel de color de borde a borde que
     barre el cuadro (xPercent / yPercent) y aterriza justo en su tiempo; la palabra (Inter 900, medida al armar para que
     entre en ANCHO px) pega de grande a su tamaño (escala 1,4 → 1, expo.out) con las letras subiendo en cascada, y en el
     tiempo siguiente da un "bump" para que nada quede quieto.
       texto   la palabra (o frase corta)
       at      segundos desde T en los que aterriza (en un tiempo: múltiplos de 0,5)
       fondo   'azul' | 'amarillo' | 'blanco' | 'gris' (o un color); default: azul, amarillo, blanco, gris en ronda
       color   color de la letra (default: blanco sobre azul, azul sobre los claros)
       desde   de dónde barre el panel: 'der' | 'izq' | 'abajo' | 'arriba' (default en ronda)
       mitad   true: el panel tapa solo la mitad de abajo y la palabra anterior sube a la mitad de arriba (pregunta en
               dos pisos, se leen juntas)
       sub     una línea chica debajo (800, 54 px), pega con la palabra (mismo punch que las letras): se lee ~0,8 s,
               hasta que el panel siguiente lo empieza a tapar (en el tiempo siguiente − ENTRA)
       icono   ícono de src/handy/icons.ts en una ficha redonda antes del sub
       handy   un personaje ('gota' | 'cano' | 'engranaje' | 'lamparita' | 'llave') que asoma desde abajo en `lado`
               ('izq' | 'der') una corchea después y se aplasta en el tiempo siguiente; humor = su cara (default 'feliz';
               con 'feliz' festeja en el tiempo)
       tamano  cuerpo máximo de la letra en px (default 330); la palabra se achica hasta entrar en ANCHO
     salida  'camara': en el último tiempo la escena se tira contra la cámara (escala 1 → 3,4, power4.in) hacia la
             última palabra; el corte cae en el flash de la escena siguiente.
     Cada panel barre en ENTRA s y termina en su tiempo: el primero empieza un poquito antes de T, encima del último
     cuadro de la escena anterior (que se esconde recién en T). Sangrado (src/handy/layout.ts): el panel cubre también
     lo que se ve fuera del cuadro (--hd-sx / --hd-sy) y espera y barre desde más allá del borde de la pantalla; la
     palabra y el sub siguen centrados en el cuadro de 1440×1080 y el personaje se apoya en el borde de abajo de lo que
     se ve (afuera('y')): en vertical asoma desde el borde de la pantalla.
     En 4:3 el sangrado es 0 y todo queda como antes. Sin salida, la última tarjeta termina de moverse QUIETO
     (0,25) s antes del corte: el cuadro del que corta queda limpio. Sonido moderado (la música lleva el groove): un
     whoosh que llega al tiempo, un clap por palabra, low end en todas (boom 0,32 en la primera, bombo BOMBO = 0,45 en
     las demás: así pegan parejo aunque la música no traiga bombo, como en el quiebre 42–44; picos de 100 ms entre
     −2,8 y −4,2 dBFS) y un "plic" por personaje.

     22–24  "¿Cuánto sale?" (trailer.js), construye hacia el drop 2:
       21,84  el panel azul barre desde la derecha sobre el teléfono de tipo de trabajo
       22,0   "¿Cuánto" en blanco pega a pantalla completa (boom + clap) · 22,5 bump
       22,78  "¿Cuánto" sube a la mitad de arriba (hasta 23,08) · 22,84 el panel amarillo barre desde abajo la mitad de abajo
       23,0   "sale?" en azul pega (bombo + clap) · 23,25 la Gota asoma preocupada a la derecha · 23,5 bump y la Gota se aplasta
       23,7   la escena se tira contra la cámara hacia "sale?" · 24,0 corte al flash de presupuestos
     42–46  "Pedí. Compará. Elegí. Seguí." (el recorrido de la app, una palabra por medio compás):
       41,84  el panel azul barre desde la izquierda sobre la reseña
       42,0   "Pedí." blanco sobre azul con "Lo que necesitás." (boom + clap) · la lamparita asoma a la derecha (42,25)
              · 42,5 bump · 42,84 el panel siguiente empieza a taparlo
       43,0   "Compará." azul sobre amarillo (barre desde abajo) con "Especialistas verificados." y la insignia de
              verificado (bombo + clap, en el quiebre sin bombo) · el engranaje asoma a la izquierda · 43,5 bump
       44,0   "Elegí." azul sobre blanco (barre desde la derecha) con "Con el precio final." · la Gota festeja · 44,5 bump
       45,0   "Seguí." blanco sobre azul (barre desde arriba) con "Todo queda en Handy." · la llave · 45,5 bump (más
              corto); 45,75 queda quieto: es el cuadro limpio del que corta el golpe de las 46,0
   Contratos: la escena se ve desde T − ENTRA (el barrido) y se esconde en T + dur; devuelve exactamente o.dur.

   Solo transform y opacity, todo en D.tl en tiempos absolutos, estados iniciales con gsap.set, sin azar. Clases hdr-g-. */
import { gsap } from 'gsap';
import { COLORS } from '../../../src/handy/tokens.ts';
import { handy, anchoHandy } from '../../../src/handy/handys.ts';
import { humor, mirar } from '../../../src/handy/handys-anim.ts';
import { icon } from '../../../src/handy/icons.ts';
import { afuera } from '../../../src/handy/layout.ts';

/* ───────────────────────── estilos ───────────────────────── */

// el panel se estira hasta el borde de la pantalla (el sangrado, --hd-sx / --hd-sy de src/handy/player.ts) y su centro
// vuelve al cuadro de 1440×1080: la palabra no se mueve. Como el panel es más grande, su xPercent / yPercent de ±100
// (AFUERA) lo deja esperando más allá de lo que se ve, con el filo pegado afuera del borde de la pantalla.
const CSS = `
.hdr-g, .hdr-g-tarjeta, .hdr-g-panel, .hdr-g-centro { position: absolute; inset: 0; }
.hdr-g { transform-origin: 50% 50%; }
.hdr-g-panel { inset: calc(-1 * var(--hd-sy, 0px)) calc(-1 * var(--hd-sx, 0px)); }
.hdr-g-panel.is-mitad { top: 540px; }
.hdr-g-centro { inset: var(--hd-sy, 0px) var(--hd-sx, 0px); }
.hdr-g-panel.is-mitad .hdr-g-centro { top: 0; }
.hdr-g-filo { position: absolute; }
.hdr-g-centro { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.hdr-g-palabra { display: inline-block; white-space: nowrap; font-family: var(--hd-font); font-weight: 900; line-height: 1;
  letter-spacing: -0.045em; transform-origin: 50% 55%; }
.hdr-g-palabra span { display: inline-block; }
.hdr-g-sub { display: flex; align-items: center; gap: 18px; margin-top: 30px; white-space: nowrap;
  font: 800 54px/1.1 var(--hd-font); letter-spacing: -0.02em; }
.hdr-g-ficha { display: flex; align-items: center; justify-content: center; width: 70px; height: 70px; border-radius: 50%; }
.hdr-g-ficha .hd-icon { width: 42px; height: 42px; }
.hdr-g-handy { position: absolute; top: 0; }
`;
if (!document.getElementById('hdr-escenas-golpes')) {
  const st = document.createElement('style');
  st.id = 'hdr-escenas-golpes';
  st.textContent = CSS;
  document.head.appendChild(st);
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = s => String(s).replace(/[&<>"]/g, c => ESC[c]);

/** fondos de marca: [panel, letra, filo (la franja que encabeza el barrido)] */
const FONDOS = {
  azul: [COLORS.azul, COLORS.blanco, COLORS.amarillo],
  amarillo: [COLORS.amarillo, COLORS.azul, COLORS.azul],
  blanco: [COLORS.blanco, COLORS.azul, COLORS.azulHandy],
  gris: [COLORS.gris, COLORS.azul, COLORS.azul],
};
const RONDA_FONDO = ['azul', 'amarillo', 'blanco', 'gris'];
const RONDA_DESDE = ['der', 'abajo', 'izq', 'arriba'];
/** la franja del filo va del lado que entra primero */
const FILO = 34;
/** dónde arranca el panel (fuera de lo que se ve, con su filo: el panel cubre el sangrado) según de dónde barre */
const AFUERA = {
  der: { xPercent: 100, x: FILO }, izq: { xPercent: -100, x: -FILO },
  abajo: { yPercent: 100, y: FILO }, arriba: { yPercent: -100, y: -FILO },
};
const LADO_FILO = {
  der: `left:-${FILO}px;top:0;width:${FILO}px;height:100%`,
  izq: `right:-${FILO}px;top:0;width:${FILO}px;height:100%`,
  abajo: `top:-${FILO}px;left:0;width:100%;height:${FILO}px`,
  arriba: `bottom:-${FILO}px;left:0;width:100%;height:${FILO}px`,
};

const ANCHO = 1240;      // ancho máximo de la palabra (px del escenario)
const TAMANO = 330;      // cuerpo máximo de la letra
const ENTRA = 0.16;      // el barrido del panel: termina en el tiempo de la palabra
const ALTO_HANDY = 290;  // alto de los personajes de las tarjetas
const QUIETO = 0.25;     // la última tarjeta (sin salida) termina de moverse QUIETO s antes del corte
const BOMBO = 0.45;      // el bombo de las palabras que no llevan boom
/** notas de los "plic" de los personajes (Do mayor pentatónica, sube con cada tarjeta) */
const PLIC = [523.25, 587.33, 659.25, 783.99, 880];

/** una tarjeta: panel (con su filo), la palabra en letras sueltas, el sub y el personaje */
function htmlTarjeta(p, i) {
  const fondo = p.fondo || RONDA_FONDO[i % RONDA_FONDO.length];
  const [panel, letra, filo] = FONDOS[fondo] || [fondo, COLORS.azul, COLORS.azul];
  const color = p.color || letra;
  const desde = p.desde || (p.mitad ? 'abajo' : RONDA_DESDE[i % RONDA_DESDE.length]);
  const letras = Array.from(p.texto).map(c => (c === ' ' ? ' ' : `<span>${esc(c)}</span>`)).join('');
  const ficha = p.icono
    ? `<span class="hdr-g-ficha" style="background:${color};color:${panel}">${icon(p.icono, { size: 38, stroke: 2.4 })}</span>` : '';
  const sub = p.sub ? `<div class="hdr-g-sub" style="color:${color}">${ficha}<span>${esc(p.sub)}</span></div>` : '';
  let pj = '';
  if (p.handy) {
    const ancho = anchoHandy(p.handy, ALTO_HANDY);
    const x = p.lado === 'izq' ? 70 : 1440 - 70 - ancho;
    // los pies apoyan en el borde de abajo de lo que se ve (unos px adentro): el del cuadro en 4:3 y apaisado; con
    // sangrado abajo (pantalla vertical), el de la pantalla, así asoman desde el borde y no quedan flotando
    pj = `<div class="hdr-g-handy" style="left:${x.toFixed(1)}px;top:${1080 - 24 - ALTO_HANDY + afuera('y')}px">`
      + handy(p.handy, { altura: ALTO_HANDY, humor: p.humor || 'feliz' }) + '</div>';
  }
  return { desde, html: `<div class="hdr-g-tarjeta" data-i="${i}">
      <div class="hdr-g-panel${p.mitad ? ' is-mitad' : ''}" style="background:${panel}">
        <i class="hdr-g-filo" style="${LADO_FILO[desde]};background:${filo}"></i>
        <div class="hdr-g-centro">
          <div class="hdr-g-mueve"><div class="hdr-g-palabra" style="font-size:${p.tamano || TAMANO}px;color:${color}">${letras}</div></div>
          ${sub}
        </div>
      </div>
      ${pj}
    </div>` };
}

/** bump en el tiempo: se infla apenas (k) y vuelve a su escala (base) en `vuelta` s */
function bump(tl, el, at, k = 1.05, base = 1, vuelta = 0.32) {
  tl.to(el, { scale: base * k, duration: 0.05, ease: 'power2.out' }, at);
  tl.to(el, { scale: base, duration: vuelta, ease: 'power3.out' }, at + 0.05);
}

/* ═════════════════════════════ 'hdr-golpe' ═════════════════════════════ */

Trailer.recipe('hdr-golpe', (D, T, o) => {
  const tl = D.tl, palabras = o.palabras || [], fin = T + o.dur;
  const armadas = palabras.map(htmlTarjeta);
  const s = D.scene('golpe', `<div class="hdr-g">${armadas.map(a => a.html).join('')}</div>`);
  const raiz = D.$('.hdr-g', s);
  const tarjetas = D.$$('.hdr-g-tarjeta', s).map(el => ({
    el,
    panel: D.$('.hdr-g-panel', el),
    mueve: D.$('.hdr-g-mueve', el),
    palabra: D.$('.hdr-g-palabra', el),
    letras: D.$$('.hdr-g-palabra span', el),
    sub: D.$('.hdr-g-sub', el),
    pos: D.$('.hdr-g-handy', el),
    pj: D.$('.hdr-g-handy .hd-handy', el),
  }));

  // ── medir: cada palabra entra en ANCHO (o en la mitad, más chica) ──
  tarjetas.forEach((c, i) => D.fit(c.palabra, palabras[i].mitad ? ANCHO * 0.82 : ANCHO));

  // ── estados iniciales ──
  tarjetas.forEach((c, i) => {
    gsap.set(c.panel, AFUERA[armadas[i].desde]);
    gsap.set(c.palabra, { scale: 1.4, autoAlpha: 0 });
    gsap.set(c.letras, { yPercent: 38, opacity: 0 });
    if (c.sub) gsap.set(c.sub, { y: 34, autoAlpha: 0 });
    // el personaje espera debajo de lo que se ve (su caja ya está apoyada en el borde de abajo de lo que se ve)
    if (c.pos) gsap.set(c.pos, { y: ALTO_HANDY + 60, rotation: palabras[i].lado === 'izq' ? 8 : -8 });
  });

  const t0 = T + (palabras[0] ? palabras[0].at : 0) - ENTRA;
  D.show(s, Math.min(T, t0));

  palabras.forEach((p, i) => {
    const c = tarjetas[i], a = T + p.at, sig = palabras[i + 1] ? T + palabras[i + 1].at : fin;
    const ant = i ? tarjetas[i - 1] : null;

    // el panel barre y aterriza en el tiempo (acelera hacia el golpe)
    tl.to(c.panel, { xPercent: 0, yPercent: 0, x: 0, y: 0, duration: ENTRA, ease: 'power3.in' }, a - ENTRA);
    // la tarjeta de antes se esconde cuando ya está tapada; en una "mitad", la palabra de antes sube al piso de arriba
    if (ant && !p.mitad) D.hide(ant.el, a + 0.04);
    if (ant && p.mitad) {
      const k = Math.min(1, (480 / ant.palabra.offsetHeight) * 0.92);
      tl.to(ant.mueve, { y: -270, scale: k, duration: 0.3, ease: 'expo.inOut' }, a - 0.22);
    }

    // la palabra pega: de grande a su tamaño, las letras suben en cascada (arrancan un cuadro antes del tiempo, así
    // el cuadro del golpe ya tiene letra)
    const p0 = a - 0.04;
    tl.set(c.palabra, { autoAlpha: 1 }, p0);
    tl.to(c.palabra, { scale: 1, duration: 0.5, ease: 'expo.out' }, p0);
    tl.to(c.letras, { yPercent: 0, duration: 0.42, ease: 'expo.out', stagger: 0.024 }, p0);
    tl.to(c.letras, { opacity: 1, duration: 0.08, ease: 'none', stagger: 0.024 }, p0);
    // el sub pega con la palabra (mismo punch que las letras): se lee desde el tiempo hasta que lo tapa el panel siguiente
    if (c.sub) {
      tl.to(c.sub, { autoAlpha: 1, duration: 0.08, ease: 'none' }, p0);
      tl.to(c.sub, { y: 0, duration: 0.42, ease: 'expo.out' }, p0);
    }

    // el bump: en cada tiempo libre antes de la palabra siguiente (y antes de la salida)
    const ultima = i === palabras.length - 1;
    const salida = o.salida === 'camara' && ultima ? fin - 0.3 : sig;
    // la última tarjeta sin salida queda quieta una corchea antes del corte (QUIETO): su cuadro final es limpio
    const quieto = ultima && o.salida !== 'camara' ? fin - QUIETO : Infinity;
    for (let b = a + 0.5; b < Math.min(sig, salida) - 0.2; b += 0.5) {
      const vuelta = Math.min(0.32, quieto - b - 0.05);
      bump(tl, c.palabra, b, 1.05, 1, vuelta);
      if (p.mitad && ant) bump(tl, ant.palabra, b, 1.04, 1, vuelta);
    }

    // el personaje asoma desde abajo una corchea después, y en el tiempo se aplasta (y festeja, si está feliz)
    if (c.pos) {
      tl.to(c.pos, { y: 0, rotation: 0, duration: 0.34, ease: 'back.out(1.8)' }, a + 0.25);
      tl.to(c.pj, { scaleY: 0.86, scaleX: 1.1, duration: 0.07, ease: 'power2.out' }, a + 0.5);
      tl.to(c.pj, { scaleY: 1, scaleX: 1, duration: Math.min(0.3, quieto - a - 0.57), ease: 'back.out(3)' }, a + 0.57);
      const cara = p.humor || 'feliz';
      if (cara === 'feliz') humor(tl, c.pj, 'festejo', a + 0.5, 0.1);
      else mirar(tl, c.pj, a + 0.5, { hacia: p.lado === 'izq' ? 'der' : 'izq', dur: 0.15 });
      D.sfx('plip', a + 0.25, 0.14, PLIC[i % PLIC.length]);
    }

    // sonido: el whoosh llega al tiempo; clap por palabra, boom en la primera y un bombo en las demás (así todas
    // pegan parejo, también en el quiebre de la música, que no lleva bombo)
    if (p.sonido !== false) {
      D.sfx('whoosh', a - 0.25, 0.4, 0.2);
      D.sfx('clap', a, 0.3);
      if (!i) D.sfx('boom', a, 0.32);
      else D.sfx('kick', a, BOMBO);
    }
  });

  // ── salida contra la cámara: la escena se agranda hacia la última palabra y corta en el flash de la siguiente ──
  if (o.salida === 'camara' && tarjetas.length) {
    const ult = tarjetas[tarjetas.length - 1];
    const cy = ult.panel.classList.contains('is-mitad') ? 810 : 540;
    tl.set(raiz, { transformOrigin: `720px ${cy}px` }, fin - 0.3);
    tl.to(raiz, { scale: 3.4, duration: 0.3, ease: 'power4.in' }, fin - 0.3);
    D.sfx('whoosh', fin - 0.5, 0.5, 0.3);
  }

  D.hide(s, fin);
  return o.dur;
});
