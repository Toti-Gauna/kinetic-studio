/* HANDY · Anuncios — la marca ('ha-marca', 4–6) y el final ('ha-final', 26–30). Las dos arman su cuadro con
   formato(D): las mismas recetas en el vertical (1080×1920) y en el horizontal (1920×1080).

   'ha-marca'  { dur: 2 }  La entrada de los tráileres ('hd-entrada' de trailers/handy-usuario/js/escenas-b.js y
     'he-entrada' de trailers/handy-especialista/js/escenas-esp-b.js) comprimida en dos segundos: los cinco Handys saltan
     a cuadro, cada uno tira su letra de "Handy" y queda el logo con la bajada "Soluciones, no problemas".
       4,0     destello (el golpe en Do de la música) · los cinco salen disparados desde abajo de lo que se ve
       4,375   aterrizan todos juntos en la fila (bombo + plic) · la Gota tira la H
       4,5 · 4,625 · 4,75 · 4,875   el Caño la a, el Engranaje la n, la Lamparita la d, la Llave la y: cada uno pega un
               saltito y la letra le sale de la cabeza, sube girando y se planta en el logo (una campana por letra, las
               cinco notas del gancho)
       5,0     la bajada "Soluciones, no problemas" (palabra por palabra) · caras de festejo, la lamparita se enciende
       5,2     el logo ya se lee entero; desde ≈ 5,4 todo quieto hasta el corte de las 6,0
     Cuadro: vertical, el logo de ~900 px arriba del medio y la fila de los Handys debajo; horizontal, el logo de ~1100 px
     centrado arriba y la fila debajo. La palabra "Handy" va centrada sobre la bajada (en el lockup va a la izquierda).

   'ha-final'  { dur: 4 }  El cierre ('hdr-final' de trailers/handy-usuario/js/escenas-final.js, en cuatro segundos).
       26,0    destello, temblor y "punch" de escala · dos aros desde atrás de la fila · papelitos · los cinco saltan a
               cuadro desde abajo con cara de festejo (el engranaje da una vuelta en el aire)
       26,5    aterrizan juntos en la fila (aplastón) · el logo letra por letra en semicorcheas (H 26,5 … y 27,0, una
               campana por letra) · 27,0 la bajada y un brinco de todos · 27,5 "Mar del Plata · Llegamos el
               28/10" (en vertical en dos líneas: "Mar del Plata" / "Llegamos el 28/10")
       27,4    se agachan y saltan alto con los brazos arriba (el engranaje con otra vuelta)…
       28,0    …y caen en el tiempo: latido del logo, destello suave
       28,5    todo quieto: el último cuadro es la placa del anuncio (los papelitos ya salieron por abajo)
     Cuadro: la fila abajo (en vertical, apoyada arriba de la zona que tapan las interfaces), y arriba, entre la caja
     segura y la fila, el logo y la línea centrados.

   Sangrado (src/handy/layout.ts): sin fondo propio (el #bg ya lo cubre); lo que espera o termina abajo (los Handys
   antes de saltar, los papelitos al caer) va más allá de visible().abajo, el borde de abajo de lo que se ve.
   Solo transform y opacity; todo en D.tl en tiempos absolutos desde T; estados iniciales con gsap.set; sin
   from/fromTo; azar con D.rand. Sonidos en la grilla de semicorcheas (0,125 s). Cada receta devuelve o.dur.
   Clases ha-m- (marca) y ha-f- (final). */
import { gsap } from 'gsap';
import { COLORS } from '../tokens.ts';
import { handy, filaHandys, sombraHandy, piesHandy, HANDY_INFO } from '../handys.ts';
import { humor, salto } from '../handys-anim.ts';
import { handyLogo, logoAlto, LETRAS, LOGO_INFO, letraHacia } from '../logo.ts';
import { titular, prepararTitular, entraTitular } from '../ui/Headline.ts';
import { visible } from '../layout.ts';
import { formato } from './formato.js';

/* ───────────────────────── estilos ───────────────────────── */

const CSS = `
.ha-m, .ha-m-mundo, .ha-f, .ha-f-mundo { position: absolute; inset: 0; }
.ha-m-logo, .ha-f-logo { position: absolute; }
.ha-m-logo svg, .ha-f-logo svg { display: block; }
.ha-m-h, .ha-f-h { position: absolute; }
.ha-f .hd-titular { margin: 0; }
.ha-f-txt.is-vertical .hd-tit-grupo { display: block; }
.ha-f-aro { position: absolute; border-radius: 50%; border: 10px solid var(--hd-blanco); }
.ha-f-confeti { position: absolute; inset: 0; pointer-events: none; }
.ha-f-c { position: absolute; display: block; }
.ha-f-c[data-forma="tira"] { width: 12px; height: 22px; margin: -11px 0 0 -6px; border-radius: 3px; background: currentColor; }
.ha-f-c[data-forma="punto"] { width: 15px; height: 15px; margin: -7.5px 0 0 -7.5px; border-radius: 50%; background: currentColor; }
.ha-f-c[data-forma="tri"] { width: 0; height: 0; margin: -8px 0 0 -9px; border-left: 9px solid transparent;
  border-right: 9px solid transparent; border-bottom: 16px solid currentColor; }
`;
if (!document.getElementById('ha-marca')) {
  const st = document.createElement('style');
  st.id = 'ha-marca';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/* ───────────────────────── utilidades ───────────────────────── */

/** px con dos decimales para los style inline */
const px = n => `${Math.round(n * 100) / 100}px`;
/** frecuencia de una nota midi (69 = La 440) */
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
/** las cinco notas del gancho, una octava arriba (Do6 Re6 Mi6 Sol6 La6): las campanas de las letras */
const PENTA = [84, 86, 88, 91, 93].map(hz);
/** un "plic" por personaje (de grave a agudo, de izquierda a derecha) */
const PLIP = { gota: 660, cano: 392, engranaje: 440, lamparita: 523, llave: 587 };
/** px de aire de más entre vecinos de la fila (sigue centrada) */
const SEPARAR = 6;

/** La fila de handys-grupo.png para un caño de `alto` px, centrada en cx, con los pies de todos en `piso`.
    Devuelve, por tipo y en orden, left / top / ancho / alto / centro de los pies. */
function armarFila(alto, cx, piso) {
  const fila = filaHandys(alto), x0 = cx - fila.ancho / 2, n = fila.handys.length;
  return fila.handys.map((h, i) => {
    const left = x0 + h.x + (i - (n - 1) / 2) * SEPARAR, top = piso - h.altura;
    return { tipo: h.tipo, left, top, ancho: h.ancho, alto: h.altura, cx: left + h.ancho * HANDY_INFO[h.tipo].pies };
  });
}

/** El logo amplio con la palabra centrada sobre la bajada: { x, y, width, alto, corre (u del viewBox que se corre la
    palabra) }. */
function cajaLogo(width, cx, y) {
  const { palabra: P, bajada: { amplia: BJ } } = LOGO_INFO;
  return { x: Math.round(cx - width / 2), y: Math.round(y), width, alto: logoAlto(width), corre: BJ.x + BJ.w / 2 - (P.x + P.w / 2) };
}
const logoHtml = (cls, c) => `<div class="${cls}" style="left:${px(c.x)};top:${px(c.y)};width:${px(c.width)};height:${px(c.alto)}">`
  + handyLogo({ width: c.width, split: true }) + '</div>';

/** Latido (scale) en el tiempo: sube rápido y vuelve con rebote. */
function latido(tl, el, at, escala, { vuelta = 0.36, svgOrigin } = {}) {
  const o = svgOrigin ? { svgOrigin } : {};
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out', ...o }, at);
  tl.to(el, { scale: 1, duration: vuelta, ease: 'back.out(2.2)', ...o }, at + 0.08);
  return at + 0.08 + vuelta;
}

/** Brinco al pulso: se agacha, despega `aire` s antes de `golpe`, aterriza JUSTO en el golpe y se acomoda.
    Mueve y / scaleX / scaleY del .hd-handy (y la sombra). Devuelve cuándo termina. */
function brinco(tl, el, golpe, { alto = 30, aire = 0.26, rec = 0.14, sombra = null } = {}) {
  const t0 = golpe - aire, ant = 0.06;
  tl.to(el, { scaleY: 0.88, scaleX: 1.07, duration: ant, ease: 'power2.out' }, t0 - ant);
  tl.to(el, { y: -alto, duration: aire / 2, ease: 'power2.out' }, t0);
  tl.to(el, { y: 0, duration: aire / 2, ease: 'power2.in' }, t0 + aire / 2);
  tl.to(el, { scaleY: 1.08, scaleX: 0.95, duration: aire * 0.4, ease: 'power2.out' }, t0);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: aire * 0.4, ease: 'sine.inOut' }, t0 + aire * 0.4);
  tl.to(el, { scaleY: 0.84, scaleX: 1.1, duration: 0.06, ease: 'power2.out' }, golpe);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: rec, ease: 'power2.out' }, golpe + 0.06);
  if (sombra) {
    tl.to(sombra, { scale: 0.8, opacity: 0.6, duration: aire / 2, ease: 'power2.out' }, t0);
    tl.to(sombra, { scale: 1, opacity: 1, duration: aire / 2, ease: 'power2.in' }, t0 + aire / 2);
  }
  return golpe + 0.06 + rec;
}

/** Vuelo a cuadro desde abajo de lo que se ve: la caja sube `sobre` px por encima de su lugar y cae en `llega`,
    corriéndose en x desde `dx`; el cuerpo se estira al despegar y se aplasta al aterrizar. */
function vuelo(tl, caja, el, t0, llega, sobre) {
  const d = llega - t0;
  tl.to(caja, { x: 0, duration: d, ease: 'power1.out' }, t0);
  tl.to(caja, { y: -sobre, duration: d * 0.58, ease: 'power2.out' }, t0);
  tl.to(caja, { y: 0, duration: d * 0.42, ease: 'power2.in' }, t0 + d * 0.58);
  tl.to(el, { scaleY: 1.14, scaleX: 0.9, duration: Math.min(0.12, d * 0.4), ease: 'power2.out' }, t0);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: d * 0.4, ease: 'sine.inOut' }, t0 + d * 0.45);
  tl.to(el, { scaleY: 0.8, scaleX: 1.16, duration: 0.07, ease: 'power2.out' }, llega);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: 0.16, ease: 'power2.out' }, llega + 0.07);
}

/** cuánto tarda salto() (handys-anim.ts) de que arranca a que toca el piso: así su aterrizaje cae en un tiempo */
const hastaElPiso = altura => 0.12 + 1.9 * Math.min(0.55, Math.max(0.16, 0.3 * Math.sqrt(altura / 120)));

/* ═════════════════════════════ 'ha-marca' ═════════════════════════════ */

/** cómo entra cada uno: [corrimiento x de partida, cuánto sube por encima de su lugar, salida (s después de T)] */
const VUELO_MARCA = {
  gota: [-220, 150, 0.0625], cano: [-120, 110, 0], engranaje: [0, 170, 0], lamparita: [120, 130, 0.0625], llave: [220, 160, 0.0625],
};
/** la letra de cada uno (orden de la fila = orden de "Handy") */
const LETRA = { gota: 'H', cano: 'a', engranaje: 'n', lamparita: 'd', llave: 'y' };

Trailer.recipe('ha-marca', (D, T, o) => {
  const tl = D.tl, L = formato(D), ABAJO = visible().abajo;
  // el cuadro de cada formato: ancho y top del logo, alto del caño y piso de la fila
  const C = L.vertical
    ? { logo: 900, logoY: 500, cano: 480, piso: 1450 }
    : { logo: 1300, logoY: 90, cano: 470, piso: 995 };
  const caja = cajaLogo(C.logo, L.CX, C.logoY);
  const hs = armarFila(C.cano, L.CX, C.piso);

  const s = D.scene('marca', `<div class="ha-m"><div class="ha-m-mundo">
      ${logoHtml('ha-m-logo', caja)}
      ${hs.map(h => `<div class="ha-m-h" data-tipo="${h.tipo}" style="left:${px(h.left)};top:${px(h.top)}">`
        + handy(h.tipo, { altura: h.alto, humor: 'feliz' }) + '</div>').join('')}
    </div></div>`);
  const mundo = D.$('.ha-m-mundo', s);
  const logoEl = D.$('.ha-m-logo', s);
  const palabra = D.$('.hd-logo-palabra', logoEl);
  const letras = LETRAS.map(l => D.$(`.hd-logo-letra[data-letra="${l}"]`, logoEl));
  const bajadas = D.$$('.hd-logo-bajada-palabra', logoEl);
  const cajas = {}, cuerpos = {};
  hs.forEach(h => {
    cajas[h.tipo] = D.$(`.ha-m-h[data-tipo="${h.tipo}"]`, s);
    cuerpos[h.tipo] = D.$('.hd-handy', cajas[h.tipo]);
    cuerpos[h.tipo].style.willChange = 'transform';
  });

  // ── estados iniciales: la palabra centrada sobre la bajada; cada letra chiquita sobre la cabeza de su Handy; la
  //    bajada abajo y apagada; los Handys esperando más abajo de lo que se ve ──
  gsap.set(palabra, { x: caja.corre });
  gsap.set(mundo, { transformOrigin: `${L.CX}px ${C.piso - C.cano}px` });
  hs.forEach(h => {
    const l = LETRA[h.tipo], b = LOGO_INFO.letras[l], i = LETRAS.indexOf(l);
    const cabeza = { x: h.cx, y: h.tipo === 'cano' ? h.top + h.alto * 0.18 : h.top + 12 };
    const d = letraHacia(l, caja, cabeza, 'base');
    gsap.set(letras[i], {
      x: d.x - caja.corre, y: d.y, scale: 0, rotation: h.cx < L.CX ? 16 : -16,
      svgOrigin: `${b.x + b.w / 2} ${LOGO_INFO.lineaBase.palabra}`,
    });
    const [dx] = VUELO_MARCA[h.tipo];
    gsap.set(cajas[h.tipo], { x: dx, y: ABAJO - h.top + 40 });
  });
  gsap.set(bajadas, { opacity: 0, y: 40 });

  D.show(s, T);

  // ── 4,0 · el golpe: destello, "punch" y los cinco salen disparados desde abajo ──
  D.flash(T, 0.85, 0.45);
  tl.set(mundo, { scale: 1.05 }, T);
  tl.to(mundo, { scale: 1, duration: 0.5, ease: 'expo.out' }, T);
  D.sfx('whoosh', T, 0.5, 0.14);
  const llega = T + 0.375;
  hs.forEach(h => {
    const [, sobre, sale] = VUELO_MARCA[h.tipo];
    humor(tl, cuerpos[h.tipo], 'festejo', T + sale, 0.08);
    vuelo(tl, cajas[h.tipo], cuerpos[h.tipo], T + sale, llega, sobre);
  });
  const eng = D.$('.hd-h-svg', cuerpos.engranaje);
  if (eng) tl.to(eng, { rotation: '+=360', duration: 0.375, ease: 'power1.inOut' }, T);
  D.sfx('kick', llega, 0.12);
  D.sfx('plip', llega, 0.08, 330);

  // ── 4,375–4,875 · cinco Handys, cinco letras: un saltito y la letra sale de la cabeza hasta su lugar del logo ──
  hs.forEach(h => {
    const l = LETRA[h.tipo], i = LETRAS.indexOf(l), el = cuerpos[h.tipo];
    const tira = llega + i * 0.125;
    const alto = h.tipo === 'cano' ? 22 : 40;
    // el que tira se estira para arriba en el tiempo (el de la Gota es el mismo aterrizaje: ahí solo el estirón)
    if (i) {
      tl.to(el, { scaleY: 0.86, scaleX: 1.1, duration: 0.06, ease: 'power2.out' }, tira - 0.06);
      tl.to(el, { y: -alto, scaleY: 1.12, scaleX: 0.92, duration: 0.12, ease: 'power2.out' }, tira);
      tl.to(el, { y: 0, scaleY: 1, scaleX: 1, duration: 0.13, ease: 'power2.in' }, tira + 0.12);
      tl.to(el, { scaleY: 0.88, scaleX: 1.08, duration: 0.05, ease: 'power2.out' }, tira + 0.25);
      tl.to(el, { scaleY: 1, scaleX: 1, duration: 0.18, ease: 'back.out(2.4)' }, tira + 0.3);
      humor(tl, el, 'feliz', tira + 0.3, 0.1);
    } else {
      humor(tl, el, 'feliz', tira + 0.25, 0.1);
    }
    tl.to(letras[i], { scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, tira);
    tl.to(letras[i], { x: 0, duration: 0.34, ease: 'power2.inOut' }, tira);
    tl.to(letras[i], { y: 0, duration: 0.36, ease: 'back.out(1.4)' }, tira);
    tl.to(letras[i], { rotation: 0, duration: 0.34, ease: 'back.out(2.5)' }, tira);
    D.sfx('bell', tira, PENTA[i], 0.06, 1.2);
  });

  // ── 5,0 · la bajada, caras de festejo y la lamparita se enciende; 5,5 quieto ──
  const tBaj = T + 1;
  tl.to(bajadas, { opacity: 1, duration: 0.16, ease: 'power1.out', stagger: 0.06 }, tBaj);
  tl.to(bajadas, { y: 0, duration: 0.36, ease: 'expo.out', stagger: 0.06 }, tBaj);
  D.sfx('whoosh', tBaj - 0.125, 0.35, 0.06);
  [72, 76, 79].forEach((n, k) => D.sfx('bell', tBaj + k * 0.125, hz(n + 12), 0.03, 1.4));
  hs.forEach((h, k) => humor(tl, cuerpos[h.tipo], 'festejo', tBaj + 0.125 + k * 0.03, 0.12));
  const rayos = D.$('.hd-h-rayos', cuerpos.lamparita);
  if (rayos) latido(tl, rayos, tBaj, 1.3, { vuelta: 0.28, svgOrigin: rayos.getAttribute('data-origen') || '0 0' });

  D.hide(s, T + o.dur);
  return o.dur;
});

/* ═════════════════════════════ 'ha-final' ═════════════════════════════ */

/** entrada desde abajo: [salida (s después del golpe), cuánto sube por encima de su lugar, corrimiento x de partida] */
const VUELO_FINAL = {
  engranaje: [0, 150, 0],
  cano: [0.0625, 120, -170],
  lamparita: [0.0625, 128, 60],
  gota: [0.125, 104, -260],
  llave: [0.125, 176, 240],
};
/** el salto alto de cada uno (px): el caño y la lamparita, más bajos */
const SALTO_ALTO = { gota: 60, cano: 56, engranaje: 96, lamparita: 70, llave: 96 };
const FORMAS = ['tira', 'punto', 'tri'];
const COLORES_PAPELITOS = [COLORS.azul, COLORS.azulHandy, COLORS.amarilloAlerta, COLORS.amarillo, COLORS.blanco, '#8EC5FF'];
const N_PAPELITOS = 40;
const TEXTO = 'Mar del Plata · Llegamos el 28/10';
/** en vertical, en dos líneas (cada grupo "|" en su línea; el punto medio sobra al final de una línea) */
const TEXTO_VERTICAL = 'Mar del Plata|Llegamos el 28/10';

Trailer.recipe('ha-final', (D, T, o) => {
  const tl = D.tl, L = formato(D), ABAJO = visible().abajo;
  const quieto = T + 2.5; // 28,5: desde acá, nada se mueve
  // el cuadro de cada formato: alto del caño, piso de la fila, ancho del logo, cuerpo de la línea
  const C = L.vertical
    ? { cano: 480, piso: 1540, logo: 900, txt: 100, gap: 56 }
    : { cano: 430, piso: 1000, logo: 1300, txt: 92, gap: 44 };
  const hs = armarFila(C.cano, L.CX, C.piso);
  const filaArriba = C.piso - C.cano;
  const zona = { y0: L.seguro.arriba, y1: filaArriba - 30 };

  // papelitos del golpe (puestos con D.rand: siempre los mismos)
  const anchoFila = hs[hs.length - 1].left + hs[hs.length - 1].ancho - hs[0].left;
  const papelitos = Array.from({ length: N_PAPELITOS }, (_, i) => ({
    forma: FORMAS[Math.floor(D.rand() * FORMAS.length)],
    color: COLORES_PAPELITOS[i % COLORES_PAPELITOS.length],
    x0: D.rnd(hs[0].left + 100, hs[0].left + anchoFila - 100),
    dx: D.rnd(-520, 520),
    sube: D.rnd(380, 800),
    t0: D.rnd(0, 0.12),
    vuelo: D.rnd(0.38, 0.5),
    cae: D.rnd(0.95, 1.3),
    giro: D.rnd(300, 760) * (D.rand() < 0.5 ? -1 : 1),
    giro0: D.rnd(0, 360),
    flip: D.rnd(0.16, 0.28),
  }));

  // logo y línea: medidos después de armar; el logo arranca con su caja en y 0 y se acomoda abajo
  const caja = cajaLogo(C.logo, L.CX, 0);
  const s = D.scene('final', `<div class="ha-f hd-ui"><div class="ha-f-mundo">
      <div class="ha-f-aros">${[0, 1].map(i => `<i class="ha-f-aro" data-i="${i}"></i>`).join('')}</div>
      <div class="ha-f-confeti">${papelitos.map(p =>
        `<i class="ha-f-c" data-forma="${p.forma}" style="left:${px(p.x0)};top:${px(C.piso - 120)};color:${p.color}"></i>`).join('')}</div>
      ${logoHtml('ha-f-logo', caja)}
      ${titular({ texto: L.vertical ? TEXTO_VERTICAL : TEXTO, tamano: C.txt, ancho: L.seguro.der - L.seguro.izq, alinear: 'center', className: 'ha-f-txt' + (L.vertical ? ' is-vertical' : '') })}
      <div class="ha-f-sombras">${hs.map(h => {
        const pies = piesHandy(h.tipo, h.alto);
        return `<div class="ha-f-sombra" data-tipo="${h.tipo}" style="position:absolute;left:${px(h.left + pies.x)};top:${px(h.top + pies.y)}">`
          + sombraHandy(h.tipo, h.alto) + '</div>';
      }).join('')}</div>
      ${hs.map(h => `<div class="ha-f-h" data-tipo="${h.tipo}" style="left:${px(h.left)};top:${px(h.top)}">`
        + handy(h.tipo, { altura: h.alto }) + '</div>').join('')}
    </div></div>`);
  const mundo = D.$('.ha-f-mundo', s);
  gsap.set(mundo, { transformOrigin: `${L.CX}px ${C.piso - 200}px` });

  const cajaDe = {}, cuerpo = {}, sombra = {};
  hs.forEach(h => {
    cajaDe[h.tipo] = D.$(`.ha-f-h[data-tipo="${h.tipo}"]`, s);
    cuerpo[h.tipo] = D.$('.hd-handy', cajaDe[h.tipo]);
    cuerpo[h.tipo].style.willChange = 'transform';
    sombra[h.tipo] = D.$(`.ha-f-sombra[data-tipo="${h.tipo}"] .hd-handy-sombra`, s);
    // esperan 40 px más abajo de lo que se ve (con sangrado abajo, más allá del sangrado)
    gsap.set(cajaDe[h.tipo], { x: VUELO_FINAL[h.tipo][2], y: ABAJO - h.top + 40 });
    gsap.set(sombra[h.tipo], { opacity: 0, scale: 0.4 });
  });
  const lamp = cuerpo.lamparita;
  const rayos = D.$('.hd-h-rayos', lamp);
  const origenRayos = rayos ? rayos.getAttribute('data-origen') || '0 0' : '0 0';
  const engSvg = D.$('.hd-h-svg', cuerpo.engranaje);

  // ── aros: centrados detrás de la fila
  const aros = D.$$('.ha-f-aro', s);
  const ARO = L.vertical ? 1000 : 900, aroC = { x: L.CX, y: C.piso - C.cano / 2 };
  aros.forEach(a => Object.assign(a.style, { left: px(aroC.x - ARO / 2), top: px(aroC.y - ARO / 2), width: px(ARO), height: px(ARO) }));
  gsap.set(aros, { scale: 0.2, opacity: 0 });

  // ── papelitos: escondidos detrás de la fila
  const conf = D.$$('.ha-f-c', s);
  conf.forEach((el, i) => gsap.set(el, { x: 0, y: 0, rotation: papelitos[i].giro0, opacity: 0 }));

  // ── logo y línea, centrados en la zona de arriba
  const logoEl = D.$('.ha-f-logo', s);
  const txt = D.$('.ha-f-txt', s);
  const altoTxt = txt.offsetHeight;
  const alto = caja.alto + C.gap + altoTxt;
  const logoY = Math.round((zona.y0 + zona.y1) / 2 - alto / 2);
  logoEl.style.top = px(logoY);
  Object.assign(txt.style, { left: px(L.seguro.izq), top: px(logoY + caja.alto + C.gap) });
  gsap.set(logoEl, { transformOrigin: '50% 60%' });
  gsap.set(D.$('.hd-logo-palabra', logoEl), { x: caja.corre });
  const letras = LETRAS.map(l => D.$(`.hd-logo-letra[data-letra="${l}"]`, logoEl));
  LETRAS.forEach((l, i) => {
    const b = LOGO_INFO.letras[l];
    gsap.set(letras[i], { scale: 0, svgOrigin: `${b.x + b.w / 2} ${LOGO_INFO.lineaBase.palabra}` });
  });
  const bajada = D.$('.hd-logo-bajada', logoEl);
  gsap.set(bajada, { opacity: 0, y: 40 });
  prepararTitular(txt);

  const finales = [];
  D.show(s, T);

  // ════════ 26,0 · el golpe: destello, temblor y "punch"
  D.flash(T, 0.6, 0.45);
  D.shake(T, 0.35, 10);
  tl.set(mundo, { scale: 1.07 }, T);
  tl.to(mundo, { scale: 1, duration: 0.6, ease: 'expo.out' }, T);
  [0, 1].forEach(i => {
    tl.set(aros[i], { scale: 0.2, opacity: 0.85 }, T + i * 0.125);
    tl.to(aros[i], { scale: 1.75, duration: 0.7, ease: 'expo.out' }, T + i * 0.125);
    tl.to(aros[i], { opacity: 0, duration: 0.4, ease: 'power1.in' }, T + i * 0.125 + 0.12);
  });
  D.sfx('whoosh', T, 0.55, 0.12);

  // los papelitos salen disparados para arriba y caen girando hasta salir por abajo de lo que se ve (antes de 28,2)
  conf.forEach((el, i) => {
    const p = papelitos[i], t0 = T + 0.04 + p.t0, tCae = t0 + p.vuelo;
    tl.set(el, { opacity: 1 }, t0);
    tl.to(el, { x: p.dx * 0.6, y: -p.sube, rotation: p.giro0 + p.giro * 0.35, duration: p.vuelo, ease: 'power2.out' }, t0);
    tl.to(el, { x: p.dx, y: ABAJO - (C.piso - 120) + 40, rotation: p.giro0 + p.giro, duration: p.cae, ease: 'power1.in' }, tCae);
    tl.to(el, { scaleX: -1, duration: p.flip, ease: 'sine.inOut', repeat: Math.floor(p.cae / p.flip) - 1, yoyo: true }, tCae);
    tl.set(el, { opacity: 0 }, tCae + p.cae);
  });
  D.sfx('bubbles', T, 2, 0.035);

  // los Handys saltan a cuadro desde abajo (en semicorcheas) y aterrizan todos juntos en el 26,5
  const tAterriza = T + 0.5;
  hs.forEach(h => {
    const [dt, sobre] = VUELO_FINAL[h.tipo];
    humor(tl, cuerpo[h.tipo], 'festejo', T + dt, 0.1);
    vuelo(tl, cajaDe[h.tipo], cuerpo[h.tipo], T + dt, tAterriza, sobre);
    tl.to(sombra[h.tipo], { opacity: 1, scale: 1, duration: 0.14, ease: 'power2.out' }, tAterriza - 0.1);
  });
  if (engSvg) tl.to(engSvg, { rotation: '+=360', duration: 0.5, ease: 'power1.inOut' }, T);
  D.sfx('kick', tAterriza, 0.1);
  D.sfx('plip', tAterriza, 0.06, 330);

  // los rayos de la lamparita laten en cada tiempo (26,5 … 28,0; el último, más grande)
  if (rayos) [1, 2, 3, 4].forEach(n => latido(tl, rayos, T + n * 0.5, n === 4 ? 1.4 : 1.2, { vuelta: 0.34, svgOrigin: origenRayos }));

  // 26,5 · el logo, letra por letra en semicorcheas, con una campana por letra · 27,0 la bajada
  letras.forEach((el, i) => tl.to(el, { scale: 1, duration: 0.4, ease: 'back.out(2.4)' }, tAterriza + i * 0.125));
  PENTA.forEach((f, i) => D.sfx('bell', tAterriza + i * 0.125, f, 0.035, 0.8));
  tl.to(bajada, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, T + 1);
  D.sfx('whoosh', T + 0.875, 0.4, 0.05);

  // 27,0 · brinco de todos en el tiempo; vuelve la cara feliz
  [T + 1].forEach(g => hs.forEach(h => {
    brinco(tl, cuerpo[h.tipo], g, { alto: h.tipo === 'gota' ? 24 : 34, sombra: sombra[h.tipo] });
    D.sfx('plip', g, 0.03, PLIP[h.tipo]);
  }));
  hs.forEach(h => humor(tl, cuerpo[h.tipo], 'feliz', T + 1.125, 0.15));

  // 27,5 · "Mar del Plata · Llegamos el 28/10" (termina de entrar antes de las 28,3)
  entraTitular(tl, txt, T + 1.5, { dur: 0.6, stagger: 0.04 });
  D.sfx('whoosh', T + 1.375, 0.45, 0.05);
  D.sfx('bell', T + 1.75, hz(79), 0.035, 1.2);

  // 27,4 · se agachan y saltan alto con cara de festejo; 28,0 caen en el tiempo (el engranaje con otra vuelta)
  const golpe = T + 2;
  hs.forEach(h => {
    const el = cuerpo[h.tipo], altura = SALTO_ALTO[h.tipo], at = golpe - hastaElPiso(altura);
    humor(tl, el, 'festejo', at - 0.08, 0.12);
    const d = salto(tl, el, at, { altura, rot: h.tipo === 'engranaje' ? 360 : 0, sombra: sombra[h.tipo] });
    finales.push(at + d);
  });
  D.sfx('whoosh', golpe - 0.5, 0.4, 0.06);
  D.flash(golpe, 0.2, 0.3);
  finales.push(latido(tl, logoEl, golpe, 1.05));
  D.sfx('plip', golpe, 0.07, 330);
  D.sfx('kick', golpe, 0.08);
  [84, 88, 91].forEach((n, i) => D.sfx('bell', golpe + i * 0.125, hz(n), 0.025, 1));

  const ultimo = Math.max(...finales);
  if (ultimo > quieto + 1e-3) console.warn(`[ha-final] algo se mueve hasta las ${ultimo.toFixed(2)} s (quieto desde ${quieto} s)`);

  // sin salida: el último cuadro queda como placa
  return o.dur;
});
