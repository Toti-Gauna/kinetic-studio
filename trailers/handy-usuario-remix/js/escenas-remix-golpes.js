/* HANDY USUARIO REMIX — golpes de palabras ('hdr-golpe') y el sello REMIX (Trailer.remix.sello).

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
       sub     una línea chica debajo (800, 54 px), entra una corchea después
       icono   ícono de src/handy/icons.ts en una ficha redonda antes del sub
       handy   un personaje ('gota' | 'cano' | 'engranaje' | 'lamparita' | 'llave') que asoma desde abajo en `lado`
               ('izq' | 'der') una corchea después y se aplasta en el tiempo siguiente; humor = su cara (default 'feliz';
               con 'feliz' festeja en el tiempo)
       tamano  cuerpo máximo de la letra en px (default 330); la palabra se achica hasta entrar en ANCHO
     salida  'camara': en el último tiempo la escena se tira contra la cámara (escala 1 → 3,4, power4.in) hacia la
             última palabra; el corte cae en el flash de la escena siguiente.
     Cada panel barre en ENTRA s y termina en su tiempo: el primero empieza un poquito antes de T, encima del último
     cuadro de la escena anterior (que se esconde recién en T). Sonido moderado (la música lleva el groove): un whoosh
     que llega al tiempo, un clap por palabra (más un boom en la primera) y un "plic" por personaje.

     22–24  "¿Cuánto sale?" (trailer.js), construye hacia el drop 2:
       21,84  el panel azul barre desde la derecha sobre el teléfono de tipo de trabajo
       22,0   "¿Cuánto" en blanco pega a pantalla completa (boom + clap) · 22,5 bump
       22,84  "¿Cuánto" sube a la mitad de arriba y el panel amarillo barre desde abajo la mitad de abajo
       23,0   "sale?" en azul pega · 23,25 la Gota asoma preocupada a la derecha · 23,5 bump y la Gota se aplasta
       23,7   la escena se tira contra la cámara hacia "sale?" · 24,0 corte al flash de presupuestos
     42–46  "Pedí. Compará. Elegí. Seguí." (el recorrido de la app, una palabra por medio compás):
       41,84  el panel azul barre desde la izquierda sobre la reseña
       42,0   "Pedí." blanco sobre azul · "Lo que necesitás." · la lamparita asoma a la derecha (42,25) · 42,5 bump
       43,0   "Compará." azul sobre amarillo (barre desde abajo) · "Presupuestos de especialistas verificados." con la
              insignia de verificado · el engranaje asoma a la izquierda · 43,5 bump
       44,0   "Elegí." azul sobre blanco (barre desde la derecha) · "Precio final antes de confirmar." · la Gota festeja
       45,0   "Seguí." blanco sobre azul (barre desde arriba) · "Todo queda en Handy." · la llave · 45,5 bump; 45,75 queda
              quieto: es el cuadro limpio del que corta el golpe de las 46,0
   Contratos: la escena se ve desde T − ENTRA (el barrido) y se esconde en T + dur; devuelve exactamente o.dur.

   Trailer.remix.sello(D, at, fin, { x, y, rot, escala, texto })  el sello REMIX
     Una calcomanía: píldora amarillo lamparita con borde azul, "REMIX" en azul Inter 900 y una sombra azul corrida
     (estática), inclinada `rot`° (default −8). Su propia sección (D.scene) encima de la escena de abajo.
       at      pega: entra de escala 2,2 → 1 (back.out) con un tambaleo que se asienta, siete rayitas que saltan hacia arriba y afuera
               y clap + boom moderados; en at + 0,5 un bump
       fin     en fin − 0,22 se infla y se va (back.in); null = queda hasta el final de la película
       x, y    centro en px del escenario (default: arriba a la derecha del wordmark "Handy" de la entrada, que a las
               10,75 encaja en x 320–820, y 136–262; la bajada empieza en y 290: el sello va en 1100, 140, a 45 px de la «y», sin tapar
               letras: la calcomanía mide unos 465 × 150 px a escala 1, con la sombra), escala (default 1), texto (default 'REMIX')
     Se usa a las 11,0 en la entrada (trailer.js: extra sello at 3, el tiempo después de que encaja el logo) y en el final.

   Solo transform y opacity, todo en D.tl en tiempos absolutos, estados iniciales con gsap.set, sin azar. Clases hdr-g- y
   hdr-sello-. */
import { gsap } from 'gsap';
import { COLORS } from '../../../src/handy/tokens.ts';
import { handy, anchoHandy } from '../../../src/handy/handys.ts';
import { humor, mirar } from '../../../src/handy/handys-anim.ts';
import { icon } from '../../../src/handy/icons.ts';

/* ───────────────────────── estilos ───────────────────────── */

const CSS = `
.hdr-g, .hdr-g-tarjeta, .hdr-g-panel, .hdr-g-centro { position: absolute; inset: 0; }
.hdr-g { transform-origin: 50% 50%; }
.hdr-g-panel.is-mitad { top: 540px; }
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
.hdr-sello { position: absolute; width: 0; height: 0; }
.hdr-sello-golpe { position: absolute; left: 0; top: 0; }
.hdr-sello-pildora { position: relative; padding: 16px 44px 18px; border: 7px solid ${COLORS.azul}; border-radius: 999px;
  background: ${COLORS.amarillo}; color: ${COLORS.azul}; font: 900 80px/1 var(--hd-font); letter-spacing: 0.02em;
  white-space: nowrap; }
.hdr-sello-sombra { position: absolute; inset: 0; border-radius: 999px; background: ${COLORS.azul}; transform: translate(9px, 11px); }
.hdr-sello-rayo { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
.hdr-sello-rayo i { position: absolute; left: 0; top: -6px; width: 44px; height: 12px; border-radius: 6px;
  background: ${COLORS.azul}; transform-origin: 0% 50%; }
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
/** dónde arranca el panel (fuera de cuadro, con su filo) según de dónde barre */
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
    // los pies apoyan en el borde de abajo del cuadro (unos px adentro)
    pj = `<div class="hdr-g-handy" style="left:${x.toFixed(1)}px;top:${1080 - 24 - ALTO_HANDY}px">`
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

/** bump en el tiempo: se infla apenas (k) y vuelve a su escala (base) */
function bump(tl, el, at, k = 1.05, base = 1) {
  tl.to(el, { scale: base * k, duration: 0.05, ease: 'power2.out' }, at);
  tl.to(el, { scale: base, duration: 0.32, ease: 'power3.out' }, at + 0.05);
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
    if (c.sub) tl.to(c.sub, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'expo.out' }, a + 0.125);

    // el bump: en cada tiempo libre antes de la palabra siguiente (y antes de la salida)
    const salida = o.salida === 'camara' && i === palabras.length - 1 ? fin - 0.3 : sig;
    for (let b = a + 0.5; b < Math.min(sig, salida) - 0.2; b += 0.5) {
      bump(tl, c.palabra, b);
      if (p.mitad && ant) bump(tl, ant.palabra, b, 1.04);
    }

    // el personaje asoma desde abajo una corchea después, y en el tiempo se aplasta (y festeja, si está feliz)
    if (c.pos) {
      tl.to(c.pos, { y: 0, rotation: 0, duration: 0.34, ease: 'back.out(1.8)' }, a + 0.25);
      tl.to(c.pj, { scaleY: 0.86, scaleX: 1.1, duration: 0.07, ease: 'power2.out' }, a + 0.5);
      tl.to(c.pj, { scaleY: 1, scaleX: 1, duration: 0.3, ease: 'back.out(3)' }, a + 0.57);
      const cara = p.humor || 'feliz';
      if (cara === 'feliz') humor(tl, c.pj, 'festejo', a + 0.5, 0.1);
      else mirar(tl, c.pj, a + 0.5, { hacia: p.lado === 'izq' ? 'der' : 'izq', dur: 0.15 });
      D.sfx('plip', a + 0.25, 0.14, PLIC[i % PLIC.length]);
    }

    // sonido: el whoosh llega al tiempo; clap por palabra, boom en la primera
    if (p.sonido !== false) {
      D.sfx('whoosh', a - 0.25, 0.4, 0.2);
      D.sfx('clap', a, 0.3);
      if (!i) D.sfx('boom', a, 0.32);
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

/* ═════════════════════════════ el sello REMIX ═════════════════════════════ */

/** las rayitas del golpe: ángulo (°) y distancia al centro (salen del borde de la píldora, que es ancha). Solo hacia
    arriba y a la derecha: abajo a la izquierda están las letras y la bajada del logo */
const RAYOS = [[-160, 226], [-122, 120], [-90, 96], [-58, 120], [-22, 214], [8, 232], [36, 200]];

window.Trailer.remix = Object.assign(window.Trailer.remix || {}, {
  /** lo que mide la píldora del sello (sin girar, sin la sombra), en px del escenario: { w, h }. Arma una copia
      invisible en el escenario, la mide y la saca; para ubicar el sello antes de pegarlo (el final centra logo + sello). */
  medirSello({ texto = 'REMIX', escala = 1 } = {}) {
    const p = document.createElement('div');
    p.className = 'hdr-sello-pildora';
    p.textContent = texto;
    Object.assign(p.style, { position: 'absolute', left: '0', top: '0', visibility: 'hidden' });
    document.getElementById('stage').appendChild(p);
    const r = { w: p.offsetWidth * escala, h: p.offsetHeight * escala };
    p.remove();
    return r;
  },

  /** el sello REMIX: pega en `at`, se va en `fin` (null = queda hasta el final). opts = { x, y, rot, escala, texto } */
  sello(D, at, fin = null, opts = {}) {
    const tl = D.tl;
    const x = opts.x ?? 1100, y = opts.y ?? 140, rot = opts.rot ?? -8, escala = opts.escala ?? 1;
    const texto = opts.texto ?? 'REMIX';
    const s = D.scene('sello', `<div class="hdr-sello" style="left:${x}px;top:${y}px">
        <div class="hdr-sello-golpe">
          ${RAYOS.map(([ang]) => `<div class="hdr-sello-rayo" style="transform:rotate(${ang}deg)"><i></i></div>`).join('')}
          <div class="hdr-sello-sombra"></div>
          <div class="hdr-sello-pildora">${esc(texto)}</div>
        </div>
      </div>`);
    const golpe = D.$('.hdr-sello-golpe', s);
    const rayos = D.$$('.hdr-sello-rayo i', s);

    gsap.set(golpe, { xPercent: -50, yPercent: -50, rotation: rot + 10, scale: escala * 2.2, autoAlpha: 0 });
    rayos.forEach((r, i) => gsap.set(r, { x: RAYOS[i][1], scaleX: 0, opacity: 0 }));
    // fuera de la película hasta su golpe (la sección se arma visible si at = 0)
    if (at > 0) gsap.set(s, { autoAlpha: 0 });
    D.show(s, at);

    // pega desde la cámara y se asienta con un tambaleo
    tl.to(golpe, { autoAlpha: 1, duration: 0.06, ease: 'none' }, at);
    tl.to(golpe, { scale: escala, duration: 0.42, ease: 'back.out(1.6)' }, at);
    tl.to(golpe, { rotation: rot - 4, duration: 0.16, ease: 'power2.out' }, at);
    tl.to(golpe, { rotation: rot + 2.5, duration: 0.14, ease: 'sine.inOut' }, at + 0.16);
    tl.to(golpe, { rotation: rot, duration: 0.24, ease: 'sine.out' }, at + 0.3);
    // las rayitas saltan hacia afuera en el impacto
    rayos.forEach((r, i) => {
      const d = RAYOS[i][1];
      tl.set(r, { opacity: 1 }, at + 0.07);
      tl.to(r, { x: d + 40, duration: 0.3, ease: 'expo.out' }, at + 0.07);
      tl.to(r, { scaleX: 1, duration: 0.1, ease: 'power2.out' }, at + 0.07);
      tl.to(r, { scaleX: 0, opacity: 0, duration: 0.16, ease: 'power2.in' }, at + 0.17);
    });
    D.sfx('clap', at, 0.4);
    D.sfx('boom', at, 0.3);

    // un bump en el tiempo siguiente
    if (fin === null || fin - at > 0.9) bump(tl, golpe, at + 0.5, 1.07, escala);

    // se va: se infla y se achica hasta desaparecer, justo antes de `fin`
    if (fin !== null) {
      tl.to(golpe, { scale: escala * 1.12, duration: 0.08, ease: 'power2.out' }, fin - 0.22);
      tl.to(golpe, { scale: 0, autoAlpha: 0, duration: 0.14, ease: 'back.in(2)' }, fin - 0.14);
      D.hide(s, fin);
    }
  },
});
