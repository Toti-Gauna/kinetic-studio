/* HANDY · App de usuario — el final ('hdr-final'), DROP 3 (devuelve o.dur = 10). La última escena de la película.
   Escrita a 120 BPM con tiempos de 46 a 56 s: js/trailer.js la corre a través de 'hdr-corte' LENTO = 1,25 veces más
   lenta (96 BPM, 57,5–70 s en la película). Los tiempos de abajo son los de la escritura; en la película, T + (t − 46)·1,25.
   Los cinco Handys entran de un salto con el golpe, se arman en la fila de handys-grupo.png (filaHandys, como el cierre
   del original en escenas-d.js) y BAILAN AL PULSO: 120 BPM, un tiempo = 0,5 s, compases en 46 · 48 · 50 · 52 · 54.
   Cada brinco aterriza justo en un tiempo (el aplastón es el acento); arriba se arman el logo y la fecha.

     46,0   DROP 3 (la música pega el golpe y el gancho entero): destello, temblor de cámara, la escena entra con un
            "punch" de escala y dos aros que se abren desde atrás de la fila. Los Handys salen disparados desde abajo
            del cuadro (la gota y el caño desde la izquierda, la llave desde la derecha; el engranaje da una vuelta en el
            aire), con cara de festejo, y papelitos de colores vuelan desde atrás de la fila.
     46,5   aterrizan todos juntos en la fila, en el tiempo (aplastón). Los rayos de la lamparita laten en cada tiempo
            desde acá hasta el 54,0.
   Frase 1 (47–50)
     47,0 · 47,5   brinco de todos en los tiempos. El logo entra letra por letra en corcheas: H 47,0 · a 47,25 · n 47,5 ·
            d 47,75 · y 48,0 (pop con back.out y una campana por letra: Do6 Re6 Mi6 Sol6 La6, las cinco notas del
            gancho); 47,75 vuelve la cara feliz.
     48,0   la bajada "Soluciones, no problemas". Llamada y respuesta: la izquierda (gota, caño) brinca en 48,0 y 49,0,
            la derecha (engranaje, lamparita, llave) en 48,5; el grupo que no salta se hamaca hacia el otro (poco: los
            vecinos están cerca; cuánto, en HAMACA).
     49,0   "Mar del Plata · Llegamos el 28/10" (titular) · 49,5 el QR, si D.cfg.qrUrl tiene algo (tarjeta blanca al lado
            del texto; si no, el texto va centrado debajo del logo, como en el cierre).
     49,3   se agachan todos y saltan alto con los brazos arriba (festejo; el engranaje da una vuelta entera)…
   Frase 2 (50–54)
     50,0   …y caen en el tiempo fuerte: el logo late (campanitas Do Mi Sol). 50,5 todos se hamacan para afuera;
            50,7 el caño y la lamparita saludan (saludo).
     51,0 · 51,5   brincos cruzados: caño y lamparita en 51,0, engranaje y llave en 51,5; la gota rebota en cada tiempo;
            el engranaje se mece en los tiempos como un metrónomo.
     52,0   todos juntos (el logo late) · 52,5–53,0 la ola: brincan de izquierda a derecha en semicorcheas (las letras
            de "Handy" la hacen un poco antes, en fusas: la ola cruza el logo y baja a la fila).
     53,4   cara de festejo, se agachan y saltan alto (el engranaje con otra vuelta)…
     54,0   GOLPE FINAL (la música toca el acorde): caen todos en la pose de la fila; destello suave, latido del logo,
            temblor corto.
     54,5–56,0 todo quieto: es el cuadro que queda bajo "↺ Ver de nuevo" (franja y > 960 entre x 470 y 970 libre).

   Composición: la fila de handys-grupo.png, centrada en 720, con 6 px más de aire entre vecinos (SEPARAR) y cada uno
   con lo más bajo de los pies justo en PISO (948): sentarEnElPiso() mide la suela de cada dibujo (la gota, que en el
   dibujo flota debajo del pico, acá baila en el piso, así el caño puede aplastarse sin pisarla); la sombra va
   centrada en el piso. Arriba, el logo y la línea centrados en la zona libre (el mismo armado del cierre, con el logo
   más grande), centrados en 720 como el par texto + QR y la fila. Los brincos son de esta escena (brinco: despega
   `aire` s antes del tiempo y aterriza en él);
   los saltos altos, el festejo y el saludo son los de src/handy/handys-anim.ts, ubicados para que su aterrizaje caiga
   en el tiempo.
   Cada personaje anima su .hd-handy (y, escala, rotación) y su caja (.hdr-f-h: solo la entrada desde abajo); `agenda`
   avisa si dos movimientos del mismo personaje se pisan. Sonido: pies, campanas y "plips" bajitos (el groove es de la
   música). Solo transform y opacity; todo en D.tl en tiempos absolutos desde T; estados iniciales con gsap.set; azar con
   D.rand. Clases propias con prefijo hdr-f-. */
import { gsap } from 'gsap';
import { COLORS } from '../../../src/handy/tokens.ts';
import { handy, filaHandys, sombraHandy, piesHandy, HANDY_INFO } from '../../../src/handy/handys.ts';
import { humor, salto, festejo, saludo } from '../../../src/handy/handys-anim.ts';
import { handyLogo, logoAlto, LETRAS, LOGO_INFO } from '../../../src/handy/logo.ts';
import { titular, prepararTitular, entraTitular } from '../../../src/handy/ui/Headline.ts';
import { qrSvg, qrModulos } from '../../../src/handy/qr.ts';

/* ───────────────────────── estilos ───────────────────────── */

const CSS = `
.hdr-f, .hdr-f-mundo { position: absolute; inset: 0; }
.hdr-f .hd-titular { margin: 0; }
.hdr-f-aro { position: absolute; border-radius: 50%; border: 10px solid var(--hd-blanco); }
.hdr-f-confeti { position: absolute; inset: 0; pointer-events: none; }
.hdr-f-c { position: absolute; display: block; }
.hdr-f-c[data-forma="tira"] { width: 12px; height: 22px; margin: -11px 0 0 -6px; border-radius: 3px; background: currentColor; }
.hdr-f-c[data-forma="punto"] { width: 15px; height: 15px; margin: -7.5px 0 0 -7.5px; border-radius: 50%; background: currentColor; }
.hdr-f-c[data-forma="tri"] { width: 0; height: 0; margin: -8px 0 0 -9px; border-left: 9px solid transparent;
  border-right: 9px solid transparent; border-bottom: 16px solid currentColor; }
.hdr-f-logo { position: absolute; }
.hdr-f-logo svg { display: block; }
.hdr-f-qr { position: absolute; border-radius: 28px; background: var(--hd-blanco); }
.hdr-f-qr svg { position: absolute; display: block; }
.hdr-f-h { position: absolute; }
`;
if (!document.getElementById('hdr-escenas-final')) {
  const st = document.createElement('style');
  st.id = 'hdr-escenas-final';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/** px con dos decimales para los style inline */
const px = n => `${Math.round(n * 100) / 100}px`;

/* ───────────────────────── la fila ───────────────────────── */

/** la fila de handys-grupo.png, un poco más grande que en el cierre; los pies del caño en PISO */
const ALTO_CANO = 384;
const FILA = filaHandys(ALTO_CANO);
const PISO = 948;
const FILA_X0 = 720 - FILA.ancho / 2;
const FILA_Y0 = PISO - ALTO_CANO;
/** px de aire de más entre vecinos (la fila sigue centrada en 720): con los pies en el piso, la mano izquierda de la
    lamparita quedaba a 1 px de la derecha del engranaje; así queda a unos 6 y los brincos casi no los tocan */
const SEPARAR = 6;
/** x, ancho y alto de cada uno salen de la fila (más SEPARAR); la y la pone sentarEnElPiso() al armar la escena */
const POS = Object.fromEntries(FILA.handys.map((h, i) => [h.tipo, {
  x: FILA_X0 + h.x + (i - (FILA.handys.length - 1) / 2) * SEPARAR, y: FILA_Y0 + h.y, w: h.ancho, h: h.altura, pies: h.altura,
}]));
/** orden de la fila, de izquierda a derecha (y del DOM) */
const TIPOS = FILA.handys.map(h => h.tipo);

/** px desde el borde de arriba del wrapper hasta lo más bajo del personaje: la suela de los pies (la gota, que no tiene
    piernas, el fondo de su panza). El dibujo puede salirse del viewBox (overflow visible): en la fila, los pies de la
    lamparita y de la llave bajan unos px más que su caja y los del engranaje quedan uno más arriba. Mide una copia
    invisible (getBBox de cada pieza + medio trazo); si no puede, el borde de abajo del wrapper (piesHandy). */
function asiento(tipo, altura) {
  const vb = HANDY_INFO[tipo].viewBox, k = altura / vb.h;
  const copia = document.createElement('div');
  copia.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden';
  copia.innerHTML = handy(tipo, { altura });
  (document.getElementById('stage') || document.body).appendChild(copia);
  const piernas = [...copia.querySelectorAll('.hd-h-pierna > *')];
  const piezas = piernas.length ? piernas : [...copia.querySelectorAll('.hd-h-cuerpo > *')];
  let fondo = -Infinity;
  piezas.forEach(el => {
    const b = el.getBBox(), trazo = el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none' ? +el.getAttribute('stroke-width') || 0 : 0;
    fondo = Math.max(fondo, b.y + b.height + trazo / 2);
  });
  copia.remove();
  return Number.isFinite(fondo) && fondo > vb.y ? (fondo - vb.y) * k : piesHandy(tipo, altura).y;
}

/** Todos con lo más bajo de los pies justo en PISO (y la gota, que en el dibujo flota debajo del pico, acá baila en el
    piso con los demás, abajo del pico: así el caño puede aplastarse y saltar sin pisarla). POS[tipo].pies = px del
    wrapper hasta el piso (ahí va el centro de su sombra). Se llama al armar la escena (necesita el DOM). */
function sentarEnElPiso() {
  TIPOS.forEach(tipo => {
    const p = POS[tipo];
    p.pies = asiento(tipo, p.h);
    p.y = Math.round((PISO - p.pies) * 100) / 100;
  });
}
const IZQ = ['gota', 'cano'];
const DER = ['engranaje', 'lamparita', 'llave'];
/** todos pisan el piso: todos tienen sombra */
const CON_SOMBRA = TIPOS;
/** cuánto se hamaca cada uno (°) [hacia la izquierda, hacia la derecha]. Los vecinos están muy cerca: el caño, alto y
    con el pico en voladizo, apenas; el engranaje, entre el caño y la lamparita, apenas; la lamparita hacia la llave y la
    llave hacia la lamparita, poco. Medido cada 0,025 s: en las hamacas (48,0 · 48,5 · 49,0 · 50,5) ninguna mano se mete
    en el vecino (antes, el engranaje se metía en el caño y la hoja de la llave rozaba a la lamparita); los roces de un
    cuadro que quedan son de los aplastones de los brincos */
const HAMACA = { gota: [8, 8], cano: [3, 2], engranaje: [2, 2], lamparita: [2, 1.5], llave: [6, 2] };
/** el salto alto de cada uno (px): el caño y la lamparita, más bajos para no llegar al texto */
const SALTO_ALTO = { gota: 54, cano: 56, engranaje: 96, lamparita: 70, llave: 96 };
/** zona de arriba (logo + texto + QR), entre el margen seguro y la fila */
const ZONA = { y0: 72, y1: FILA_Y0 - 26 };
const TEXTO = 'Mar del Plata · Llegamos el 28/10';

/** entrada desde abajo: [salida (s después del golpe), cuánto sube por encima de su lugar, corrimiento x de partida] */
const VUELO = {
  engranaje: [0, 150, 0],
  cano: [0.0625, 120, -170],
  lamparita: [0.0625, 128, 60],
  gota: [0.125, 104, -260],
  llave: [0.125, 176, 240],
};

/** notas (Hz): Do mayor, la tonalidad del groove */
const HZ = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760 };
/** un "plip" por personaje (de grave a agudo, de izquierda a derecha) */
const PLIP = { gota: 660, cano: 392, engranaje: 440, lamparita: 523, llave: 587 };

const FORMAS = ['tira', 'punto', 'tri'];
const COLORES_PAPELITOS = [COLORS.azul, COLORS.azulHandy, COLORS.amarilloAlerta, COLORS.amarillo, COLORS.blanco, '#8EC5FF'];
const N_PAPELITOS = 40;

/* ───────────────────────── movimientos al pulso ───────────────────────── */

/** Brinco al pulso: se agacha, despega `aire` s antes de `golpe`, aterriza JUSTO en el golpe (el aplastón es el acento)
    y se acomoda en `rec` s. Mueve y/scaleX/scaleY del .hd-handy (y achica la sombra en el aire). Devuelve cuándo termina. */
function brinco(tl, el, golpe, { alto = 30, aire = 0.26, rec = 0.12, sombra = null } = {}) {
  const t0 = golpe - aire, ant = 0.06;
  tl.to(el, { scaleY: 0.88, scaleX: 1.07, duration: ant, ease: 'power2.out' }, t0 - ant);
  tl.to(el, { y: -alto, duration: aire / 2, ease: 'power2.out' }, t0);
  tl.to(el, { y: 0, duration: aire / 2, ease: 'power2.in' }, t0 + aire / 2);
  tl.to(el, { scaleY: 1.08, scaleX: 0.95, duration: aire * 0.4, ease: 'power2.out' }, t0);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: aire * 0.4, ease: 'sine.inOut' }, t0 + aire * 0.4);
  tl.to(el, { scaleY: 0.84, scaleX: 1.1, duration: 0.06, ease: 'power2.out' }, golpe);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: rec, ease: rec > 0.2 ? 'back.out(2.4)' : 'power2.out' }, golpe + 0.06);
  if (sombra) {
    tl.to(sombra, { scale: 0.8, opacity: 0.6, duration: aire / 2, ease: 'power2.out' }, t0);
    tl.to(sombra, { scale: 1, opacity: 1, duration: aire / 2, ease: 'power2.in' }, t0 + aire / 2);
  }
  return golpe + 0.06 + rec;
}

/** cuánto tarda salto() (handys-anim.ts) de que arranca a que toca el piso: así su aterrizaje cae en un tiempo */
const hastaElPiso = altura => 0.12 + 1.9 * Math.min(0.55, Math.max(0.16, 0.3 * Math.sqrt(altura / 120)));

/** Se hamaca desde los pies (rotation del .hd-handy) hacia un lado en el tiempo y vuelve antes del siguiente. */
function hamaca(tl, el, at, grados) {
  tl.to(el, { rotation: grados, duration: 0.14, ease: 'power2.out' }, at);
  tl.to(el, { rotation: 0, duration: 0.3, ease: 'sine.inOut' }, at + 0.18);
  return at + 0.48;
}

/** Latido (scale) en el tiempo: sube rápido y vuelve con rebote. */
function latido(tl, el, at, escala, { vuelta = 0.36, svgOrigin } = {}) {
  const o = svgOrigin ? { svgOrigin } : {};
  tl.to(el, { scale: escala, duration: 0.08, ease: 'power2.out', ...o }, at);
  tl.to(el, { scale: 1, duration: vuelta, ease: 'back.out(2.2)', ...o }, at + 0.08);
  return at + 0.08 + vuelta;
}

/* ════════════════════════════════════ 'hdr-final' ════════════════════════════════════ */

Trailer.recipe('hdr-final', (D, T, o) => {
  const tl = D.tl;
  const B = n => T + n * 0.5; // el tiempo n de la escena (B(0) = 46,0 · B(16) = 54,0)
  const quieto = T + 8.5;     // 54,5: desde acá, nada se mueve
  sentarEnElPiso();

  // ── el QR (como en el cierre): solo si hay URL
  const url = String(D.cfg.qrUrl || '').trim();
  const modulos = url ? qrModulos(url) : 0;
  const qrLado = modulos ? modulos * Math.max(4, Math.floor(176 / modulos)) : 0;
  const qr = url ? qrSvg(url, { size: qrLado, color: COLORS.azul }) : '';
  const conQr = !!qr;
  const LOGO_W = conQr ? 600 : 680;
  const TXT = conQr ? 50 : 58;

  // ── papelitos del drop (puestos con D.rand: siempre los mismos)
  const papelitos = Array.from({ length: N_PAPELITOS }, (_, i) => ({
    forma: FORMAS[Math.floor(D.rand() * FORMAS.length)],
    color: COLORES_PAPELITOS[i % COLORES_PAPELITOS.length],
    x0: D.rnd(FILA_X0 + 120, FILA_X0 + FILA.ancho - 120),
    dx: D.rnd(-520, 520),
    sube: D.rnd(380, 800),
    t0: D.rnd(0, 0.12),
    vuelo: D.rnd(0.38, 0.5),
    cae: D.rnd(0.95, 1.3),
    giro: D.rnd(300, 760) * (D.rand() < 0.5 ? -1 : 1),
    giro0: D.rnd(0, 360),
    flip: D.rnd(0.16, 0.28),
  }));

  const s = D.scene('final', `<div class="hdr-f hd-ui"><div class="hdr-f-mundo">
      <div class="hdr-f-aros">${[0, 1].map(i => `<i class="hdr-f-aro" data-i="${i}"></i>`).join('')}</div>
      <div class="hdr-f-confeti">${papelitos.map(p =>
        `<i class="hdr-f-c" data-forma="${p.forma}" style="left:${px(p.x0)};top:${px(PISO - 120)};color:${p.color}"></i>`).join('')}</div>
      <div class="hdr-f-logo">${handyLogo({ width: LOGO_W, split: true })}</div>
      ${titular({ texto: TEXTO, tamano: TXT, ancho: 1296, alinear: conQr ? 'left' : 'center', className: 'hdr-f-txt' })}
      ${conQr ? `<div class="hdr-f-qr">${qr}</div>` : ''}
      <div class="hdr-f-sombras">${CON_SOMBRA.map(tipo => {
        const p = POS[tipo], pies = piesHandy(tipo, p.h);
        return `<div class="hdr-f-sombra" data-tipo="${tipo}" style="position:absolute;left:${px(p.x + pies.x)};top:${px(p.y + p.pies)}">`
          + sombraHandy(tipo, p.h) + '</div>';
      }).join('')}</div>
      <div class="hdr-f-handys">${TIPOS.map(tipo => {
        const p = POS[tipo];
        return `<div class="hdr-f-h" data-tipo="${tipo}" style="left:${px(p.x)};top:${px(p.y)};width:${px(p.w)};height:${px(p.h)}">`
          + handy(tipo, { altura: p.h }) + '</div>';
      }).join('')}</div>
    </div></div>`);
  const mundo = D.$('.hdr-f-mundo', s);
  gsap.set(mundo, { transformOrigin: `720px ${PISO - 200}px` });

  // ── Handys: caja (la entrada) y cuerpo (el baile); sombras escondidas hasta que aterrizan
  const caja = tipo => D.$(`.hdr-f-h[data-tipo="${tipo}"]`, s);
  const cuerpo = tipo => D.$('.hd-handy', caja(tipo));
  const sombra = tipo => (CON_SOMBRA.includes(tipo) ? D.$(`.hdr-f-sombra[data-tipo="${tipo}"] .hd-handy-sombra`, s) : null);
  TIPOS.forEach(tipo => gsap.set(caja(tipo), { x: VUELO[tipo][2], y: 1080 - POS[tipo].y + 40 }));
  CON_SOMBRA.forEach(tipo => gsap.set(sombra(tipo), { opacity: 0, scale: 0.4 }));
  const lamp = cuerpo('lamparita');
  const rayos = D.$('.hd-h-rayos', lamp);
  const origenRayos = rayos ? rayos.getAttribute('data-origen') || '0 0' : '0 0';
  const engSvg = D.$('.hd-h-svg', cuerpo('engranaje'));

  // ── aros: centrados detrás de la fila, chicos y transparentes
  const aros = D.$$('.hdr-f-aro', s);
  const ARO = 900, aroC = { x: 720, y: PISO - 190 };
  aros.forEach(a => Object.assign(a.style, { left: px(aroC.x - ARO / 2), top: px(aroC.y - ARO / 2), width: px(ARO), height: px(ARO) }));
  gsap.set(aros, { scale: 0.2, opacity: 0 });

  // ── papelitos: escondidos detrás de la fila
  const conf = D.$$('.hdr-f-c', s);
  conf.forEach((el, i) => gsap.set(el, { x: 0, y: 0, rotation: papelitos[i].giro0, opacity: 0 }));

  // ── logo, texto y QR: medidos y ubicados en la zona de arriba (el armado del cierre)
  const logoEl = D.$('.hdr-f-logo', s);
  const LOGO_H = logoAlto(LOGO_W);
  const txt = D.$('.hdr-f-txt', s);
  const palabras = D.$$('.hd-tit-palabra', txt);
  const anchoTxt = palabras[palabras.length - 1].offsetLeft + palabras[palabras.length - 1].offsetWidth - palabras[0].offsetLeft;
  const altoTxt = txt.offsetHeight;
  const qrEl = conQr ? D.$('.hdr-f-qr', s) : null;
  let logoY;
  if (!conQr) {
    // logo arriba y la línea abajo, todo centrado
    const GAP = 34, alto = LOGO_H + GAP + altoTxt;
    logoY = Math.round((ZONA.y0 + ZONA.y1) / 2 - alto / 2) + 6;
    Object.assign(txt.style, { left: '72px', top: px(logoY + LOGO_H + GAP) });
  } else {
    // logo centrado arriba; abajo, la línea y la tarjeta del QR lado a lado, el par centrado
    const PAD = 16, CARD = qrLado + 2 * PAD, GAP_H = 44, GAP_V = 28;
    const anchoPar = anchoTxt + GAP_H + CARD;
    const x0 = Math.round(720 - anchoPar / 2);
    const alto = LOGO_H + GAP_V + CARD;
    logoY = Math.round((ZONA.y0 + ZONA.y1) / 2 - alto / 2);
    const yPar = logoY + LOGO_H + GAP_V;
    Object.assign(txt.style, { left: px(x0), top: px(Math.round(yPar + CARD / 2 - altoTxt / 2)), width: px(Math.ceil(anchoTxt) + 4) });
    Object.assign(qrEl.style, { left: px(x0 + anchoPar - CARD), top: px(yPar), width: px(CARD), height: px(CARD) });
    Object.assign(D.$('svg', qrEl).style, { left: px(PAD), top: px(PAD) });
    gsap.set(qrEl, { opacity: 0, scale: 0.8, transformOrigin: '50% 50%' });
  }
  Object.assign(logoEl.style, { left: px(Math.round(720 - LOGO_W / 2)), top: px(logoY), width: px(LOGO_W), height: px(LOGO_H) });
  gsap.set(logoEl, { transformOrigin: '50% 60%' });
  const letras = LETRAS.map(l => D.$(`.hd-logo-letra[data-letra="${l}"]`, logoEl));
  const bajada = D.$('.hd-logo-bajada', logoEl);
  LETRAS.forEach((l, i) => {
    const b = LOGO_INFO.letras[l];
    gsap.set(letras[i], { scale: 0, svgOrigin: `${b.x + b.w / 2} ${LOGO_INFO.lineaBase.palabra}` });
  });
  gsap.set(bajada, { opacity: 0, y: 40 });
  prepararTitular(txt);

  // ── agenda: avisa si dos movimientos de la misma pista de un personaje se pisan
  const agenda = {};
  const ocupar = (tipo, pista, desde, hasta) => {
    const k2 = `${tipo}·${pista}`, lista = (agenda[k2] = agenda[k2] || []);
    const choca = lista.find(([a, b]) => desde < b - 1e-3 && hasta > a + 1e-3);
    if (choca) console.warn(`[hdr-final] ${k2}: ${desde.toFixed(2)}–${hasta.toFixed(2)} pisa ${choca[0].toFixed(2)}–${choca[1].toFixed(2)}`);
    lista.push([desde, hasta]);
  };
  const brincar = (tipo, golpe, op = {}) => {
    const aire = op.aire ?? 0.26;
    ocupar(tipo, 'cuerpo', golpe - aire - 0.06, brinco(tl, cuerpo(tipo), golpe, { sombra: sombra(tipo), ...op }));
    const vol = op.vol ?? 0.035;
    if (vol) D.sfx('plip', golpe, vol, PLIP[tipo]);
  };
  /** se hamaca hacia un lado (signo: −1 izquierda, +1 derecha), cada uno con su amplitud */
  const hamacar = (tipo, at, lado) => ocupar(tipo, 'giro', at, hamaca(tl, cuerpo(tipo), at, lado * HAMACA[tipo][lado < 0 ? 0 : 1]));
  const finales = [];

  D.show(s, T);

  // ════════ 46,0 · DROP 3: destello, temblor y "punch"
  D.flash(T, 0.6, 0.45);
  D.shake(T, 0.4, 12);
  tl.set(mundo, { scale: 1.07 }, T);
  tl.to(mundo, { scale: 1, duration: 0.6, ease: 'expo.out' }, T);
  // dos aros se abren desde atrás de la fila
  [0, 1].forEach(i => {
    tl.set(aros[i], { scale: 0.2, opacity: 0.85 }, T + i * 0.125);
    tl.to(aros[i], { scale: 1.75, duration: 0.7, ease: 'expo.out' }, T + i * 0.125);
    tl.to(aros[i], { opacity: 0, duration: 0.4, ease: 'power1.in' }, T + i * 0.125 + 0.12);
  });
  D.sfx('whoosh', T, 0.55, 0.12);

  // los papelitos salen disparados para arriba y caen girando hasta salir por abajo del cuadro (antes de las 48,6)
  conf.forEach((el, i) => {
    const p = papelitos[i], t0 = T + 0.04 + p.t0, tCae = t0 + p.vuelo;
    tl.set(el, { opacity: 1 }, t0);
    tl.to(el, { x: p.dx * 0.6, y: -p.sube, rotation: p.giro0 + p.giro * 0.35, duration: p.vuelo, ease: 'power2.out' }, t0);
    tl.to(el, { x: p.dx, y: 1080 - (PISO - 120) + 40, rotation: p.giro0 + p.giro, duration: p.cae, ease: 'power1.in' }, tCae);
    tl.to(el, { scaleX: -1, duration: p.flip, ease: 'sine.inOut', repeat: Math.floor(p.cae / p.flip) - 1, yoyo: true }, tCae);
    tl.set(el, { opacity: 0 }, tCae + p.cae);
  });
  D.sfx('bubbles', T, 7, 0.035);

  // los Handys saltan a cuadro desde abajo (en semicorcheas) y aterrizan todos juntos en el 46,5
  const tAterriza = B(1);
  TIPOS.forEach(tipo => {
    const [dt, sobre] = VUELO[tipo], c = caja(tipo), el = cuerpo(tipo), t0 = T + dt, vuelo = tAterriza - t0;
    humor(tl, el, 'festejo', t0, 0.1);
    tl.to(c, { x: 0, duration: vuelo, ease: 'power1.out' }, t0);
    tl.to(c, { y: -sobre, duration: vuelo * 0.58, ease: 'power2.out' }, t0);
    tl.to(c, { y: 0, duration: vuelo * 0.42, ease: 'power2.in' }, t0 + vuelo * 0.58);
    tl.to(el, { scaleY: 1.14, scaleX: 0.9, duration: 0.12, ease: 'power2.out' }, t0);
    tl.to(el, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'sine.inOut' }, t0 + 0.16);
    tl.to(el, { scaleY: 0.8, scaleX: 1.16, duration: 0.07, ease: 'power2.out' }, tAterriza);
    tl.to(el, { scaleY: 1, scaleX: 1, duration: 0.1, ease: 'power2.out' }, tAterriza + 0.07);
    ocupar(tipo, 'cuerpo', t0, tAterriza + 0.17);
    const sb = sombra(tipo);
    if (sb) tl.to(sb, { opacity: 1, scale: 1, duration: 0.14, ease: 'power2.out' }, tAterriza - 0.1);
  });
  tl.to(engSvg, { rotation: '+=360', duration: tAterriza - T, ease: 'power1.inOut' }, T);
  D.sfx('kick', tAterriza, 0.1);
  D.sfx('plip', tAterriza, 0.06, 330);

  // los rayos de la lamparita laten en cada tiempo (46,5 … 54,0; el del final, más grande)
  if (rayos) for (let n = 1; n <= 16; n++) latido(tl, rayos, B(n), n === 16 ? 1.4 : n % 4 === 0 ? 1.3 : 1.2, { vuelta: 0.34, svgOrigin: origenRayos });

  // ════════ Frase 1 (47–50)
  // 47,0 · 47,5 · brinco de todos en los tiempos
  [B(2), B(3)].forEach(g => TIPOS.forEach(tipo => brincar(tipo, g, { alto: tipo === 'gota' ? 22 : 30 })));
  TIPOS.forEach(tipo => humor(tl, cuerpo(tipo), 'feliz', B(3) + 0.25, 0.15));

  // 47,0 · el logo, letra por letra en corcheas, con una campana por letra · 48,0 la bajada
  const tLogo = B(2);
  letras.forEach((el, i) => tl.to(el, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, tLogo + i * 0.25));
  [HZ.C6, HZ.D6, HZ.E6, HZ.G6, HZ.A6].forEach((f, i) => D.sfx('bell', tLogo + i * 0.25, f, 0.03, 0.8));
  tl.to(bajada, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, B(4));
  D.sfx('whoosh', B(4) - 0.125, 0.4, 0.05);

  // 48,0 · llamada y respuesta: la izquierda brinca en 48,0 y 49,0, la derecha en 48,5; el que no salta se hamaca
  IZQ.forEach(tipo => { brincar(tipo, B(4), { alto: 40 }); brincar(tipo, B(6), { alto: 40 }); });
  DER.forEach(tipo => { brincar(tipo, B(5), { alto: 40 }); });
  DER.forEach(tipo => { hamacar(tipo, B(4), -1); hamacar(tipo, B(6), -1); });
  IZQ.forEach(tipo => hamacar(tipo, B(5), 1));

  // 49,0 · "Mar del Plata · Llegamos el 28/10" · 49,5 el QR
  entraTitular(tl, txt, B(6), { dur: 0.8, stagger: 0.05 });
  D.sfx('whoosh', B(6) - 0.125, 0.45, 0.05);
  D.sfx('bell', B(6) + 0.25, HZ.G5, 0.035, 1.2);
  if (qrEl) {
    tl.to(qrEl, { opacity: 1, duration: 0.2, ease: 'power1.out' }, B(7));
    tl.to(qrEl, { scale: 1, duration: 0.55, ease: 'back.out(1.8)' }, B(7));
    D.sfx('fold', B(7), 0.08);
  }

  // 49,3 · se agachan y saltan alto con los brazos arriba: caen en el 50,0 (el engranaje da una vuelta entera)
  const saltoAlto = (tipo, golpe, festeja) => {
    const el = cuerpo(tipo), sb = sombra(tipo), altura = SALTO_ALTO[tipo], previo = hastaElPiso(altura);
    if (tipo === 'engranaje') {
      const at = golpe - previo;
      humor(tl, el, 'festejo', at - 0.08, 0.12);
      const d = salto(tl, el, at, { altura, rot: 360, sombra: sb });
      humor(tl, el, 'feliz', golpe + 0.2, 0.15);
      ocupar(tipo, 'cuerpo', at, at + d);
      return at + d;
    }
    if (festeja) {
      // festejo(): la cara y los brazos 0,08 s antes de su salto
      const at = golpe - previo - 0.08;
      const d = festejo(tl, el, at, { saltos: 1, altura, sombra: sb });
      ocupar(tipo, 'cuerpo', at + 0.08, golpe + 0.38);
      ocupar(tipo, 'brazos', at, at + d);
      return at + d;
    }
    const at = golpe - previo;
    humor(tl, el, 'festejo', at - 0.08, 0.12);
    const d = salto(tl, el, at, { altura, sombra: sb });
    humor(tl, el, 'feliz', golpe + 0.1, 0.15);
    ocupar(tipo, 'cuerpo', at, at + d);
    return at + d;
  };
  TIPOS.forEach(tipo => saltoAlto(tipo, B(8), true));
  D.sfx('whoosh', B(8) - 0.625, 0.4, 0.06);

  // ════════ Frase 2 (50–54)
  // 50,0 · caen en el tiempo fuerte: el logo late
  latido(tl, logoEl, B(8), 1.05);
  D.sfx('plip', B(8), 0.07, 330);
  [HZ.C6, HZ.E6, HZ.G6].forEach((f, i) => D.sfx('bell', B(8) + i * 0.125, f, 0.025, 1));

  // 50,5 · todos se hamacan para afuera · 50,7 el caño y la lamparita saludan
  IZQ.forEach(tipo => hamacar(tipo, B(9), -1));
  DER.forEach(tipo => hamacar(tipo, B(9), 1));
  [['cano', 'izq'], ['lamparita', 'der']].forEach(([tipo, lado]) => {
    const at = B(9) + 0.2;
    ocupar(tipo, 'brazos', at, at + saludo(tl, cuerpo(tipo), at, { lado, veces: 3 }));
  });

  // 51,0 · 51,5 · brincos cruzados; la gota rebota en cada tiempo; el engranaje se mece como un metrónomo
  ['cano', 'lamparita', 'gota'].forEach(tipo => brincar(tipo, B(10), { alto: tipo === 'gota' ? 30 : 38 }));
  ['engranaje', 'llave', 'gota'].forEach(tipo => brincar(tipo, B(11), { alto: tipo === 'gota' ? 30 : 38 }));
  // (giros relativos: el SVG ya lleva sus vueltas enteras; +16 −32 +32 −16 = 0, vuelve derecho)
  [[B(9), 16], [B(10), -32], [B(11), 32], [B(12), -16]].forEach(([at, g]) =>
    tl.to(engSvg, { rotation: `+=${g}`, duration: 0.22, ease: 'back.out(2)' }, at));

  // 52,0 · todos juntos (el logo late) · 52,5–53,0 la ola, de izquierda a derecha en semicorcheas
  TIPOS.forEach(tipo => brincar(tipo, B(12), { alto: tipo === 'gota' ? 24 : 34, vol: 0.03 }));
  latido(tl, logoEl, B(12), 1.035);
  // (las letras de "Handy" hacen la misma ola, un poco antes: la ola cruza el logo y baja a la fila)
  TIPOS.forEach((tipo, i) => {
    const g = B(13) + i * 0.125;
    brincar(tipo, g, { alto: tipo === 'gota' ? 30 : 46, aire: 0.22, rec: 0.16, vol: 0 });
    D.sfx('plip', g, 0.05, [HZ.C5, HZ.D5, HZ.E5, HZ.G5, HZ.A5][i]);
  });
  letras.forEach((el, i) => {
    const g = B(13) - 0.25 + i * 0.0625;
    tl.to(el, { y: -34, duration: 0.11, ease: 'power2.out' }, g - 0.22);
    tl.to(el, { y: 0, duration: 0.11, ease: 'power2.in' }, g - 0.11);
  });

  // 53,4 · cara de festejo, se agachan y saltan alto… 54,0 GOLPE FINAL: caen en la pose de la fila
  TIPOS.forEach(tipo => finales.push(saltoAlto(tipo, B(16), false)));
  D.sfx('whoosh', B(16) - 0.625, 0.4, 0.06);
  D.flash(B(16), 0.22, 0.35);
  latido(tl, logoEl, B(16), 1.05);
  tl.set(mundo, { scale: 1.025 }, B(16));
  tl.to(mundo, { scale: 1, duration: 0.4, ease: 'expo.out' }, B(16));
  D.shake(B(16), 0.3, 6);
  D.sfx('plip', B(16), 0.07, 330);
  D.sfx('kick', B(16), 0.08);

  const ultimo = Math.max(...finales);
  if (ultimo > quieto) console.warn(`[hdr-final] algo se mueve hasta las ${ultimo.toFixed(2)} s (quieto desde ${quieto} s)`);

  // sin salida: el cuadro de las 56,0 queda bajo los botones del final
  return o.dur;
});
