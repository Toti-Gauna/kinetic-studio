/* HANDY · Anuncios — golpes de palabras ('ha-golpe'). La versión para los dos formatos de 'hdr-golpe'
   (trailers/handy-usuario/js/escenas-golpes.js): mismo look, misma coreografía y mismo sonido, con las medidas de
   formato(D) en vez de los números del cuadro de 1440×1080.

   'ha-golpe'  { dur, salida, palabras: [{ texto, at, fondo, color, desde, mitad, handy, humor, lado, tamano }] }
     Tipografía a pantalla completa, en el pulso (120 BPM): cada palabra es dueña de un panel de color de borde a borde
     que barre el cuadro (xPercent / yPercent) y aterriza justo en su tiempo; la palabra (Inter 900) pega de grande a
     su tamaño (escala 1,4 → 1, expo.out) con las letras subiendo en cascada, y medio tiempo después da un "bump".
       texto   la palabra o frase corta
       at      SEGUNDOS desde T en los que aterriza (en la película va una palabra por segundo: 0 · 1 · 2 · 3; la
               referencia iba en tiempos de 0,5 s). Todo lo demás cae en la grilla de semicorcheas (0,125 s).
       fondo   'azul' | 'amarillo' | 'blanco' | 'gris' (o un color); default: azul, amarillo, blanco, gris en ronda
       color   color de la letra (default: blanco sobre azul, azul sobre los claros)
       desde   de dónde barre el panel: 'der' | 'izq' | 'abajo' | 'arriba' (default en ronda; la mitad, desde abajo)
       mitad   true: el panel tapa solo el piso de abajo y la palabra anterior sube al piso de arriba (pregunta en dos
               pisos, se leen juntas)
       handy   un personaje ('gota' | 'cano' | 'engranaje' | 'lamparita' | 'llave') que asoma desde abajo en `lado`
               ('izq' | 'der') una corchea después y se aplasta en el contratiempo; humor = su cara (default 'feliz';
               con 'feliz' festeja)
       tamano  cuerpo máximo en px (default formato(D).palabra.tamano)
     salida  'camara': en los últimos 0,3 s la escena se tira contra la cámara (escala 1 → 3,4, power4.in) hacia la
             última palabra; el corte cae en el destello de la escena siguiente.

   El formato (formato.js): la palabra entra en formato(D).palabra.ancho (se achica con D.fit) y queda centrada en el
   medio de formato(D).seguro (en vertical, entre y 220 y 1560: arriba y abajo las interfaces tapan). Los dos pisos de
   una "mitad" parten esa caja segura en dos (la raya del panel va en su medio: y 890 en vertical, 540 en horizontal).
   Frases largas: si en una línea la letra quedaría más chica que lineaMin (150 px en vertical, 220 en horizontal: así
   "Para el que necesita." y "Para el que sabe." van las dos en dos líneas, parejas), la frase se parte en dos líneas antes de la última palabra ("Para el que / necesita.") y
   se centra (si así la letra no llega a lineaMin, en el corte que la deja más grande); solo si en dos líneas la letra
   queda al menos un 25 % más grande. Las dos líneas comparten cuerpo. Si un personaje asoma
   debajo de la palabra y la palabra le llega encima, la palabra se angosta hasta dejarle lugar.

   El arranque: si el barrido del primer panel caería antes del cuadro 0 de la película (el gancho, en T = 0), el panel
   ya está en su lugar y la primera palabra ya está en el cuadro 0, grande de más y entera (escala 1,08 → 1): el anuncio
   arranca pegando. En las demás escenas el primer panel barre ENTRA s antes de T, encima del último cuadro de la
   escena anterior (que se esconde recién en T).
   Sangrado (src/handy/layout.ts): el panel cubre también lo que se ve fuera del cuadro (--hd-sx / --hd-sy) y espera
   más allá del borde de la pantalla; la palabra sigue centrada en el cuadro y el personaje se apoya en el borde de abajo
   de lo que se ve (afuera('y')).
   Sin salida, la última tarjeta queda quieta QUIETO (0,25) s antes del corte: el cuadro del que corta queda limpio.
   Sonido (como la referencia): un whoosh que llega al tiempo, un clap por palabra, boom en la primera y bombo en las
   demás, y un "plic" por personaje.

     0–4    gancho (pelicula.js): 0 "¿Se rompió" (azul, ya en el cuadro 0, boom + clap) · 0,5 bump · 0,84 el panel
            amarillo barre desde abajo el piso de abajo y "¿Se rompió" sube · 1 "algo?" · 1,25 la Gota preocupada asoma
            a la derecha y mira · 1,5 bump · 1,84 el panel blanco barre desde la izquierda · 2 "¿Sabés" · 3 "arreglarlo?"
            (azul, mitad, la Llave a la izquierda) · 3,75 quieto.
    14–16   giro: 13,84 barre el azul sobre el teléfono · 14 "¿Y si sos" · 15 "especialista?" (amarillo, el Engranaje)
            · 15,7 la escena se tira contra la cámara · 16 corte al DROP.
    24–26   remate: 24 "Para el que / necesita." (la Gota festeja a la derecha) · 25 "Para el que / sabe." (la Llave a
            la izquierda) · 25,75 quieto.
   Contratos: la escena se ve desde T − ENTRA (el barrido; desde T si es el arranque) y se esconde en T + dur; devuelve
   exactamente o.dur. Solo transform y opacity, todo en D.tl en tiempos absolutos, estados iniciales con gsap.set, sin
   azar. Clases ha-g-. */
import { gsap } from 'gsap';
import { COLORS } from '../tokens.ts';
import { handy, anchoHandy } from '../handys.ts';
import { humor, mirar } from '../handys-anim.ts';
import { afuera } from '../layout.ts';
import { formato } from './formato.js';

/* ───────────────────────── estilos ───────────────────────── */

// el panel se estira hasta el borde de la pantalla (el sangrado, --hd-sx / --hd-sy); el .ha-g-centro de cada panel
// es una franja del ancho del cuadro, centrada en la altura de su palabra (la pone la receta con top / height)
const CSS = `
.ha-g, .ha-g-tarjeta, .ha-g-panel { position: absolute; inset: 0; }
.ha-g { transform-origin: 50% 50%; }
.ha-g-panel { inset: calc(-1 * var(--hd-sy, 0px)) calc(-1 * var(--hd-sx, 0px)); }
.ha-g-filo { position: absolute; }
.ha-g-centro { position: absolute; left: var(--hd-sx, 0px); display: flex; align-items: center; justify-content: center; }
.ha-g-palabra { display: inline-block; white-space: nowrap; text-align: center; font-family: var(--hd-font); font-weight: 900;
  line-height: 0.98; letter-spacing: -0.045em; transform-origin: 50% 55%; }
.ha-g-palabra .ha-g-linea { display: block; }
.ha-g-linea > span { display: inline-block; }
.ha-g-handy { position: absolute; top: 0; }
`;
if (!document.getElementById('ha-golpes')) {
  const st = document.createElement('style');
  st.id = 'ha-golpes';
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
/** dónde espera el panel (fuera de lo que se ve, con su filo) según de dónde barre */
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

const ENTRA = 0.16;      // el barrido del panel: termina en el tiempo de la palabra
const QUIETO = 0.25;     // la última tarjeta (sin salida) termina de moverse QUIETO s antes del corte
const BOMBO = 0.45;      // el bombo de las palabras que no llevan boom
/** notas de los "plic" de los personajes (Do mayor pentatónica, sube con cada tarjeta) */
const PLIC = [523.25, 587.33, 659.25, 783.99, 880];

/** Las medidas del golpe en este formato: la caja segura, la raya de la mitad y el centro de cada piso. */
function medidas(D) {
  const L = formato(D), seg = L.seguro;
  const raya = Math.round((seg.arriba + seg.abajo) / 2);
  return {
    L,
    ancho: L.palabra.ancho,
    tamano: L.palabra.tamano,
    /** cuerpo mínimo de una línea: por debajo, la frase va en dos líneas */
    lineaMin: L.vertical ? 150 : 220,
    raya,
    /** centro (y) de la palabra a pantalla completa, del piso de arriba y del de abajo */
    cyLleno: raya,
    cyArriba: Math.round((seg.arriba + raya) / 2),
    cyAbajo: Math.round((raya + seg.abajo) / 2),
    /** alto de cada piso */
    piso: raya - seg.arriba,
    altoHandy: L.handy,
  };
}

/** alto del personaje: en horizontal, el de una "mitad" va un poco más chico (el piso de abajo es bajo y la palabra
    le pasa por encima: así la palabra casi no se tiene que angostar) */
const altoHandy = (p, M) => Math.round(M.altoHandy * (p.mitad && !M.L.vertical ? 0.8 : 1));
/** distancia del personaje al borde del cuadro: en horizontal, la mitad de la del margen seguro (es dibujo, no texto) */
const margenHandy = (p, M) => (M.L.vertical ? M.L.seguro.izq : Math.round(M.L.seguro.izq / 2));

/** las letras de una línea, cada una en su span (los espacios quedan sueltos) */
const letrasDe = t => Array.from(t).map(c => (c === ' ' ? ' ' : `<span>${esc(c)}</span>`)).join('');
const lineasHtml = lineas => lineas.map(l => `<span class="ha-g-linea">${letrasDe(l)}</span>`).join('');

/** una tarjeta: panel (con su filo), la palabra en letras sueltas y el personaje */
function htmlTarjeta(p, i, M, D) {
  const fondo = p.fondo || RONDA_FONDO[i % RONDA_FONDO.length];
  const [panel, letra, filo] = FONDOS[fondo] || [fondo, COLORS.azul, COLORS.azul];
  const color = p.color || letra;
  const desde = p.desde || (p.mitad ? 'abajo' : RONDA_DESDE[i % RONDA_DESDE.length]);
  // la franja del centro: del ancho del cuadro, alto de un piso (o de la caja segura), centrada en su palabra. El panel
  // de la mitad arranca en la raya (su top); el lleno, en −sangrado: por eso el top lleva --hd-sy
  const cy = p.mitad ? M.cyAbajo : M.cyLleno;
  const altoFranja = p.mitad ? M.piso : 2 * M.piso;
  const top = p.mitad ? `${cy - M.raya - altoFranja / 2}px` : `calc(var(--hd-sy, 0px) + ${cy - altoFranja / 2}px)`;
  const panelStyle = p.mitad ? `top:${M.raya}px;` : '';
  let pj = '';
  if (p.handy) {
    const alto = altoHandy(p, M), ancho = anchoHandy(p.handy, alto), m = margenHandy(p, M);
    const x = p.lado === 'izq' ? m : D.W - m - ancho;
    // los pies apoyan en el borde de abajo de lo que se ve (unos px adentro): con sangrado abajo, el de la pantalla
    pj = `<div class="ha-g-handy" style="left:${x.toFixed(1)}px;top:${D.H - 24 - alto + afuera('y')}px">`
      + handy(p.handy, { altura: alto, humor: p.humor || 'feliz' }) + '</div>';
  }
  return { desde, cy, html: `<div class="ha-g-tarjeta" data-i="${i}">
      <div class="ha-g-panel" style="${panelStyle}background:${panel}">
        <i class="ha-g-filo" style="${LADO_FILO[desde]};background:${filo}"></i>
        <div class="ha-g-centro" style="top:${top};width:${D.W}px;height:${altoFranja}px">
          <div class="ha-g-mueve"><div class="ha-g-palabra" style="font-size:${p.tamano || M.tamano}px;color:${color}">${lineasHtml([p.texto])}</div></div>
        </div>
      </div>
      ${pj}
    </div>` };
}

/** Mide la palabra y la deja entrar: en una línea si la letra queda de LINEA_MIN o más; si no, en dos líneas (antes de
    la última palabra si así alcanza, si no en el corte que deja la letra más grande). Achica hasta que entre en
    `ancho` y en `altoMax`. Devuelve el cuerpo final (px). */
function acomodar(D, el, texto, maximo, ancho, altoMax, lineaMin) {
  const poner = lineas => {
    el.innerHTML = lineasHtml(lineas);
    el.style.fontSize = maximo + 'px';
    D.fit(el, ancho);
    if (el.offsetHeight > altoMax) el.style.fontSize = (parseFloat(el.style.fontSize) * altoMax / el.offsetHeight).toFixed(1) + 'px';
    return parseFloat(el.style.fontSize);
  };
  const una = poner([texto]);
  const partes = texto.split(' ');
  if (una >= lineaMin || partes.length < 2) return una;
  const cortes = partes.slice(1).map((_, k) => [partes.slice(0, k + 1).join(' '), partes.slice(k + 1).join(' ')]);
  const ultimo = cortes[cortes.length - 1];
  let mejor = ultimo, tam = poner(ultimo);
  if (tam < lineaMin) cortes.forEach(c => { const t = poner(c); if (t > tam) { tam = t; mejor = c; } });
  // dos líneas solo si la letra crece de verdad (un 25 % o más); si no, queda en una
  return tam >= una * 1.25 ? poner(mejor) : poner([texto]);
}

/** bump: se infla apenas (k) y vuelve a su escala (base) en `vuelta` s */
function bump(tl, el, at, k = 1.05, base = 1, vuelta = 0.32) {
  tl.to(el, { scale: base * k, duration: 0.05, ease: 'power2.out' }, at);
  tl.to(el, { scale: base, duration: vuelta, ease: 'power3.out' }, at + 0.05);
}

/* ═════════════════════════════ 'ha-golpe' ═════════════════════════════ */

Trailer.recipe('ha-golpe', (D, T, o) => {
  const tl = D.tl, palabras = o.palabras || [], fin = T + o.dur;
  const M = medidas(D);
  const armadas = palabras.map((p, i) => htmlTarjeta(p, i, M, D));
  const s = D.scene('golpe', `<div class="ha-g">${armadas.map(a => a.html).join('')}</div>`);
  const raiz = D.$('.ha-g', s);
  const tarjetas = D.$$('.ha-g-tarjeta', s).map(el => ({
    el,
    panel: D.$('.ha-g-panel', el),
    mueve: D.$('.ha-g-mueve', el),
    palabra: D.$('.ha-g-palabra', el),
    pos: D.$('.ha-g-handy', el),
    pj: D.$('.ha-g-handy .hd-handy', el),
  }));

  // ── medir: cada palabra entra en el ancho (y en su piso); si un personaje asoma debajo y la palabra le llega
  //    encima, se angosta hasta dejarle lugar ──
  tarjetas.forEach((c, i) => {
    const p = palabras[i], max = p.tamano || M.tamano;
    const altoMax = (p.mitad ? M.piso : 2 * M.piso) * 0.86;
    acomodar(D, c.palabra, p.texto, max, M.ancho, altoMax, M.lineaMin);
    if (p.handy) {
      const alto = altoHandy(p, M), techo = D.H - 24 - alto - 16, cy = armadas[i].cy;
      if (cy + c.palabra.offsetHeight / 2 > techo) {
        const libre = D.W - 2 * (margenHandy(p, M) + anchoHandy(p.handy, alto) + 24);
        acomodar(D, c.palabra, p.texto, max, Math.min(M.ancho, libre), altoMax, M.lineaMin);
      }
    }
  });
  tarjetas.forEach(c => { c.letras = D.$$('.ha-g-linea > span', c.el); });

  // ── estados iniciales ──
  const arranque = palabras.length && T + palabras[0].at - ENTRA < 0; // el gancho: la primera ya está en el cuadro 0
  tarjetas.forEach((c, i) => {
    if (i === 0 && arranque) {
      gsap.set(c.panel, { xPercent: 0, yPercent: 0, x: 0, y: 0 });
      gsap.set(c.palabra, { scale: 1.08, autoAlpha: 1 });
      gsap.set(c.letras, { yPercent: 16, opacity: 1 });
    } else {
      gsap.set(c.panel, AFUERA[armadas[i].desde]);
      gsap.set(c.palabra, { scale: 1.4, autoAlpha: 0 });
      gsap.set(c.letras, { yPercent: 38, opacity: 0 });
    }
    // el personaje espera debajo de lo que se ve (su caja ya está apoyada en el borde de abajo de lo que se ve)
    if (c.pos) gsap.set(c.pos, { y: altoHandy(palabras[i], M) + 60, rotation: palabras[i].lado === 'izq' ? 8 : -8 });
  });

  const t0 = T + (palabras[0] ? palabras[0].at : 0) - ENTRA;
  // en el arranque la escena ya se ve antes del primer cuadro (el set en 0 solo se dibuja cuando el cabezal avanza)
  if (arranque) gsap.set(s, { autoAlpha: 1 });
  D.show(s, Math.max(0, Math.min(T, t0)));

  palabras.forEach((p, i) => {
    const c = tarjetas[i], a = T + p.at, sig = palabras[i + 1] ? T + palabras[i + 1].at : fin;
    const ant = i ? tarjetas[i - 1] : null;
    const primera = i === 0 && arranque;

    // el panel barre y aterriza en el tiempo (acelera hacia el golpe)
    if (!primera) tl.to(c.panel, { xPercent: 0, yPercent: 0, x: 0, y: 0, duration: ENTRA, ease: 'power3.in' }, a - ENTRA);
    // las tarjetas de antes se esconden cuando ya están tapadas; en una "mitad", la palabra de antes sube al piso de
    // arriba (y se achica si no entra en su piso)
    if (ant && !p.mitad) tarjetas.slice(0, i).forEach(t => D.hide(t.el, a + 0.04));
    if (ant && p.mitad) {
      tarjetas.slice(0, i - 1).forEach(t => D.hide(t.el, a + 0.04));
      const k = Math.min(1, (M.piso * 0.86) / ant.palabra.offsetHeight);
      const dy = M.cyArriba - armadas[i - 1].cy;
      tl.to(ant.mueve, { y: dy, scale: k, duration: 0.3, ease: 'expo.inOut' }, a - 0.22);
    }

    // la palabra pega: de grande a su tamaño, las letras suben en cascada (arrancan un cuadro antes del tiempo, así el
    // cuadro del golpe ya tiene letra). En el arranque ya está entera: solo se asienta
    const p0 = primera ? a : a - 0.04;
    if (!primera) tl.set(c.palabra, { autoAlpha: 1 }, p0);
    tl.to(c.palabra, { scale: 1, duration: 0.5, ease: 'expo.out' }, p0);
    tl.to(c.letras, { yPercent: 0, duration: 0.42, ease: 'expo.out', stagger: primera ? 0.012 : 0.024 }, p0);
    if (!primera) tl.to(c.letras, { opacity: 1, duration: 0.08, ease: 'none', stagger: 0.024 }, p0);

    // el bump: en cada contratiempo libre antes de la palabra siguiente (y antes de la salida)
    const ultima = i === palabras.length - 1;
    const salida = o.salida === 'camara' && ultima ? fin - 0.3 : sig;
    // la última tarjeta sin salida queda quieta QUIETO s antes del corte: su cuadro final es limpio
    const quieto = ultima && o.salida !== 'camara' ? fin - QUIETO : Infinity;
    for (let b = a + 0.5; b < Math.min(sig, salida) - 0.2; b += 0.5) {
      const vuelta = Math.min(0.32, quieto - b - 0.05);
      bump(tl, c.palabra, b, 1.05, 1, vuelta);
      if (p.mitad && ant) bump(tl, ant.palabra, b, 1.04, 1, vuelta);
    }

    // el personaje asoma desde abajo una corchea después, y en el contratiempo se aplasta (y festeja, si está feliz)
    if (c.pos) {
      tl.to(c.pos, { y: 0, rotation: 0, duration: 0.34, ease: 'back.out(1.8)' }, a + 0.25);
      tl.to(c.pj, { scaleY: 0.86, scaleX: 1.1, duration: 0.07, ease: 'power2.out' }, a + 0.5);
      tl.to(c.pj, { scaleY: 1, scaleX: 1, duration: Math.min(0.3, quieto - a - 0.57), ease: 'back.out(3)' }, a + 0.57);
      const cara = p.humor || 'feliz';
      if (cara === 'feliz') humor(tl, c.pj, 'festejo', a + 0.5, 0.1);
      else mirar(tl, c.pj, a + 0.5, { hacia: p.lado === 'izq' ? 'der' : 'izq', dur: 0.15 });
      D.sfx('plip', a + 0.25, 0.14, PLIC[i % PLIC.length]);
    }

    // sonido: el whoosh llega al tiempo (no en el arranque: no hay nada antes del cuadro 0); clap por palabra, boom
    // en la primera y bombo en las demás (así todas pegan parejo, también en el quiebre, que no lleva bombo)
    if (p.sonido !== false) {
      if (a - 0.25 >= 0) D.sfx('whoosh', a - 0.25, 0.4, 0.2);
      D.sfx('clap', a, 0.3);
      if (!i) D.sfx('boom', a, 0.32);
      else D.sfx('kick', a, BOMBO);
    }
  });

  // ── salida contra la cámara: la escena se agranda hacia la última palabra y corta en el destello de la siguiente ──
  if (o.salida === 'camara' && tarjetas.length) {
    const cy = armadas[armadas.length - 1].cy;
    tl.set(raiz, { transformOrigin: `${D.W / 2}px ${cy}px` }, fin - 0.3);
    tl.to(raiz, { scale: 3.4, duration: 0.3, ease: 'power4.in' }, fin - 0.3);
    D.sfx('whoosh', fin - 0.5, 0.5, 0.3);
  }

  D.hide(s, fin);
  return o.dur;
});
