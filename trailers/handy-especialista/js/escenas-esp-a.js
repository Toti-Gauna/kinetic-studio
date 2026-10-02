/* HANDY · App del especialista — escenas 1 y 2 (grupo a).
   Acá se registran (Trailer.recipe), reemplazando a las provisorias de escenas-esp-base.js. Están ESCRITAS a 120 BPM
   (un tiempo = 0,5 s) y js/trailer.js las corre con 'hdr-corte' LENTO = 1,25 veces más lentas: un tiempo escrito t
   cae en la película en T + t × 1,25. Los golpes y los sonidos van en múltiplos de 0,25 escritos (corcheas a 96 BPM).

     'he-gancho'    escena 1 · gancho    escrita 0–3 (película 0–3,75)   "Tenés el oficio."
       El espejo del Caño que gotea del tráiler de usuario: el Engranaje y la Llave, listos para trabajar, a los dos
       lados de un teléfono apoyado con la pantalla apagada. Cuadro 0 ya compuesto (el grupo centrado).
         0 · 0,5 · 1 · … 2,5   el engranaje gira a golpes de 45°, uno por tiempo (y se sacude apenas en cada uno)
         0,29 → 1,0            la llave hace un floreo: salta, da una vuelta entera en el aire y cae en el tiempo 2
         0,75 → 1,35           la "cámara" se corre a la izquierda; 1,0 entra el titular a la derecha
         1,25                  los dos miran el teléfono
         1,5 · 2 · 2,5         la llave golpea el pie en los tiempos (tic)
         1,75 → 2,25           un brillo cruza la pantalla apagada: no hay nada
         2,25 → 2,7            se inclinan hacia el teléfono, esperando; parpadean (2,4 · 2,7)
         3                     corte seco (no hay salida: el corte la tapa)
     'he-problema'  escena 2 · problema  escrita 0–5 (película 3,75–10)  "Presupuestás. Esperás. Te dejan en visto."
       El espejo de los grupos del tráiler de usuario: tres chats de mensajería genéricos (grupoMensajeria, sin marcas)
       de Martín con clientes y una llamada perdida entran desde la derecha y se apilan; un reloj gira las agujas y la
       hora salta 09:15 → 13:05 → 18:30 → 23:40. Las tarjetas esperan y la caída termina más allá del borde de la
       pantalla, no del cuadro (afuera() de src/handy/layout.ts: en 4:3 es 0 y queda como siempre).
         0       "Referido de Ana" entra; 0,25 el presupuesto ($ 40.000, dos tildes grises) + "Presupuestás."
         0,625   el reloj corre a las 13:05
         0,875   "Cliente nuevo": 1,125 "Te paso el presupuesto." · escribiendo… · 1,5 "Lo consulto y te aviso."
         1,75    "Esperás." + el reloj corre a las 18:30
         2,125   "Consorcio Alberti 2300": 2,5 "¿No me lo hacés más barato?"
         2,625   el reloj corre a las 23:40; 3,0 vibra la "Llamada perdida · 23:40"
         3,5     "Te dejan en visto.": las tildes del presupuesto se ponen azules y aparece "Visto"
         3,75 · 4 · 4,25   tic… tic… tic… (solo el reloj)
         4,375   todo se cae; desde ~4,85 escrito (película ~9,8) el escenario queda gris y vacío hasta el drop (10,0)
   Sangrado (pantallas que no son 4:3): el fondo de las dos es el #bg del reproductor, que ya lo cubre, y el gancho no
   tiene nada afuera del cuadro.
   Reglas: solo transform y opacity; todo en D.tl en tiempos absolutos desde T; estados iniciales con gsap.set;
   sin from/fromTo ni azar. Clases propias con prefijo he-a1- / he-a2-. */
import { gsap } from 'gsap';
import { handy, anchoHandy, piesHandy, sombraHandy, HANDY_INFO } from '../../../src/handy/handys.ts';
import { parpadeo, salto, mirar } from '../../../src/handy/handys-anim.ts';
import { titular, prepararTitular, entraTitular } from '../../../src/handy/ui/Headline.ts';
import { burbujaEscribiendo, tildesSvg } from '../../../src/handy/ui/ChatBubble.ts';
import { phoneFrame } from '../../../src/handy/ui/PhoneFrame.ts';
import { grupoMensajeria } from '../../../src/handy/pantallas/usuario-chat.ts';
import { icon } from '../../../src/handy/icons.ts';
import { PHONE, afuera } from '../../../src/handy/layout.ts';
import { formatARS } from '../../../src/handy/tokens.ts';

/* ───────────────────────── estilos de las dos escenas ───────────────────────── */

const CSS = `
.he-a1, .he-a2 { position: absolute; inset: 0; }
.he-a1-mundo { position: absolute; inset: 0; will-change: transform; }
.he-a1-pj, .he-a1-tel { position: absolute; }
.he-a1-tel .hd-telefono { transform-origin: 0 0; }
.he-a1 .hd-barra-estado { display: none; }
.he-a1-apagada { background: #15171C; }
.he-a1-reflejo { position: absolute; left: -40px; top: -120px; width: 150px; height: 1200px; background: #FFFFFF;
  opacity: 0.07; transform-origin: 50% 50%; }
.he-a1-brillo { position: absolute; left: 0; top: -200px; width: 90px; height: 1300px; background: #FFFFFF; opacity: 0; }
.he-a1-sombra-tel { position: absolute; border-radius: 50%; background: rgba(0, 0, 0, .1); }
.he-a1-tit .hd-tit-grupo, .he-a2-tit .hd-tit-grupo { display: block; }
.he-a2-tarjeta { position: absolute; }
.he-a2-zoom { zoom: 1.4; }
.he-a2-reloj { position: absolute; }
.he-a2-reloj svg { display: block; overflow: visible; }
.he-a2-hora { position: absolute; width: 300px; height: 96px; overflow: hidden; font: 800 72px/96px var(--hd-font);
  letter-spacing: -0.03em; color: var(--hd-tinta-suave); font-variant-numeric: tabular-nums; white-space: nowrap; }
.he-a2-hora-capa { position: absolute; left: 0; top: 0; }
.he-a2-escr { position: absolute; left: 0; top: 0; }
.he-a2-leido { position: absolute; right: 0; top: 50%; margin-top: -6px; }
.he-a2-llamada { box-sizing: border-box; display: flex; align-items: center; gap: 12px; width: 380px; padding: 12px 16px 12px 12px;
  border-radius: 22px; background: #FFFFFF; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10); font-family: var(--hd-font); }
.he-a2-llamada-icono { display: flex; align-items: center; justify-content: center; flex: none; width: 44px; height: 44px;
  border-radius: 50%; background: var(--hd-rojo); color: #FFFFFF; }
.he-a2-llamada-icono svg { display: block; }
.he-a2-llamada-texto { flex: 1; font-size: 16.5px; font-weight: 700; color: #111B21; letter-spacing: -0.005em; white-space: nowrap; }
.he-a2-llamada-hora { font-weight: 600; color: var(--hd-rojo); }
`;
if (!document.getElementById('he-escenas-a')) {
  const st = document.createElement('style');
  st.id = 'he-escenas-a';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/** px con dos decimales para los style inline */
const px = n => `${Math.round(n * 100) / 100}px`;

/* ══════════════════════════ ESCENA 1 · GANCHO (escrita 0–3) ══════════════════════════ */

const A1 = {
  piso: 868,                    // donde apoyan los pies (y del escenario)
  engranaje: { x: 60, alto: 280 },
  llave: { x: 505, alto: 262 },
  tel: { x: 290, escala: 0.6 }, // el teléfono apoyado entre los dos (438×920 × 0,6 = 263×552), detrás de ellos
  paneo: 300,                   // x del "mundo" al arrancar: el grupo (60–784) queda centrado
  tit: { x: 860, y: 486, tamano: 88, ancho: 520 },
};
A1.telAncho = PHONE.w * A1.tel.escala;
A1.telAlto = PHONE.h * A1.tel.escala;

/** centro del engranaje en su viewBox: los dientes giran alrededor del agujero */
const EJE_ENGRANAJE = '173.45 150.3';

function htmlGancho() {
  const { piso } = A1;
  const pj = (tipo, { x, alto }) => {
    const pies = piesHandy(tipo, alto);
    return `<div class="he-a1-pj" style="left:${px(x + pies.x)};top:${px(piso)}">${sombraHandy(tipo, alto, { className: `he-a1-sombra-${tipo}` })}</div>`
      + `<div class="he-a1-pj" data-pj="${tipo}" style="left:${px(x)};top:${px(piso - alto)}">${handy(tipo, { altura: alto })}</div>`;
  };
  // el teléfono: el mismo marco de la app, con la pantalla apagada (sin barra de estado) y un reflejo quieto
  const pantalla = '<div class="hd-capa he-a1-apagada"><i class="he-a1-reflejo"></i><i class="he-a1-brillo"></i></div>';
  const tel = phoneFrame({ pantalla, isla: true });
  const ts = A1.tel;
  return `<div class="he-a1 hd-ui">
    <div class="he-a1-mundo">
      <div class="he-a1-sombra-tel" style="left:${px(ts.x - 14)};top:${px(piso - 9)};width:${px(A1.telAncho + 28)};height:18px"></div>
      <div class="he-a1-tel" style="left:${px(ts.x)};top:${px(piso - A1.telAlto)};width:${px(A1.telAncho)};height:${px(A1.telAlto)}">${tel}</div>
      ${pj('engranaje', A1.engranaje)}
      ${pj('llave', A1.llave)}
    </div>
    <div style="position:absolute;left:${px(A1.tit.x)};top:${px(A1.tit.y)}">${titular({ texto: 'Tenés el|oficio.', tamano: A1.tit.tamano, ancho: A1.tit.ancho, className: 'he-a1-tit' })}</div>
  </div>`;
}

Trailer.recipe('he-gancho', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('gancho', htmlGancho());
  const mundo = D.$('.he-a1-mundo', s);
  const eng = D.$('[data-pj="engranaje"] .hd-handy', s);
  const engCuerpo = eng.querySelector('.hd-h-cuerpo');
  const llave = D.$('[data-pj="llave"] .hd-handy', s);
  const sombraLlave = D.$('.he-a1-sombra-llave', s);
  const pie = llave.querySelector('.hd-h-pierna[data-lado="der"]');
  const telefono = D.$('.he-a1-tel .hd-telefono', s);
  const reflejo = D.$('.he-a1-reflejo', s);
  const brillo = D.$('.he-a1-brillo', s);
  const tit = D.$('.he-a1-tit', s);

  // ── estados iniciales ──
  gsap.set(mundo, { x: A1.paneo });
  gsap.set(telefono, { scale: A1.tel.escala });
  gsap.set(reflejo, { rotation: 24 });
  gsap.set(brillo, { x: -160, rotation: 24 });
  prepararTitular(tit);

  // primera escena: visible desde el armado, así el cuadro 0 ya está compuesto cuando se desvanece la pantalla
  // inicial (corte.js solo la esconde si T > 0; un tl.set justo en t = 0 recién se aplica cuando el cabezal se mueve)
  gsap.set(s, { autoAlpha: 1 });
  D.show(s, T);

  // ── el engranaje gira a golpes, uno por tiempo: listo para trabajar ──
  [0, 0.5, 1, 1.5, 2, 2.5].forEach((b, i) => {
    tl.to(engCuerpo, { rotation: 45 * (i + 1), duration: 0.24, ease: 'back.out(2.4)', svgOrigin: EJE_ENGRANAJE }, T + b);
    tl.to(eng, { scaleY: 0.96, scaleX: 1.02, duration: 0.06, ease: 'power2.out' }, T + b);
    tl.to(eng, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'back.out(2)' }, T + b + 0.06);
  });
  parpadeo(tl, eng, T + 0.65);

  // ── la llave: floreo (salta y da una vuelta en el aire) y cae en el tiempo 2 (1,0) ──
  const alturaSalto = 130;
  const sube = 0.3 * Math.sqrt(alturaSalto / 120), aire = sube * 1.9;
  const aterriza = T + 1;
  parpadeo(tl, llave, T + 0.1);
  salto(tl, llave, aterriza - 0.12 - aire, { altura: alturaSalto, rot: 360, sombra: sombraLlave });
  D.sfx('whoosh', T + 0.375, 0.35, 0.05);
  D.sfx('fold', aterriza, 0.12);

  // ── la cámara se corre: lugar para el titular ──
  tl.to(mundo, { x: 0, duration: 0.6, ease: 'expo.inOut' }, T + 0.75);
  entraTitular(tl, tit, T + 1, { dur: 0.7, stagger: 0.07 });

  // ── los dos miran el teléfono ──
  mirar(tl, eng, T + 1.25, { hacia: 'der', dur: 0.2 });
  mirar(tl, llave, T + 1.25, { hacia: 'izq', dur: 0.2 });

  // ── la llave golpea el pie en los tiempos (lo levanta antes y lo apoya justo en el tiempo) ──
  const recoge = parseFloat(pie.getAttribute('data-recoger') || '30');
  [1.5, 2, 2.5].forEach(b => {
    tl.to(pie, { y: -recoge * 0.9, duration: 0.14, ease: 'power2.out' }, T + b - 0.22);
    tl.to(pie, { y: 0, duration: 0.08, ease: 'power2.in' }, T + b - 0.08);
    tl.to(llave, { scaleY: 0.975, scaleX: 1.012, duration: 0.05, ease: 'power2.out' }, T + b);
    tl.to(llave, { scaleY: 1, scaleX: 1, duration: 0.16, ease: 'power2.out' }, T + b + 0.05);
    D.sfx('tick', T + b, 0.04);
  });

  // ── un brillo cruza la pantalla apagada: no hay nada ──
  tl.to(brillo, { opacity: 0.12, duration: 0.1, ease: 'none' }, T + 1.75);
  tl.to(brillo, { x: 560, duration: 0.5, ease: 'power1.inOut' }, T + 1.75);
  tl.to(brillo, { opacity: 0, duration: 0.12, ease: 'none' }, T + 2.13);

  // ── esperan: se inclinan hacia el teléfono y parpadean ──
  tl.to(eng, { rotation: 5, duration: 0.45, ease: 'sine.inOut' }, T + 2.25);
  tl.to(llave, { rotation: -4, duration: 0.45, ease: 'sine.inOut' }, T + 2.25);
  parpadeo(tl, eng, T + 2.4);
  parpadeo(tl, llave, T + 2.7);

  // corte seco en 3 (película 3,75): la escena siguiente arranca en otro cuadro
  D.hide(s, T + o.dur);
  return o.dur;
});

/* ══════════════════════════ ESCENA 2 · PROBLEMA (escrita 0–5) ══════════════════════════ */

const A2 = {
  tit: { x: 110, y: 152, tamano: 76, ancho: 660 },
  reloj: { x: 110, y: 560, d: 220 },
  hora: { x: 362, y: 622 },     // la caja de 96 px queda centrada con el reloj (centro y 670)
  // tres chats y la llamada: x, y, giro en reposo (px del escenario; la tarjeta mide 380 × 1,4 = 532 de ancho)
  tarjetas: [{ x: 790, y: 92, rot: -1.6 }, { x: 830, y: 322, rot: 1.3 }, { x: 772, y: 610, rot: -0.9 }, { x: 812, y: 832, rot: 1.1 }],
};
const HORAS = ['09:15', '13:05', '18:30', '23:40'];
/** ángulo de las agujas a m minutos de las 09:15 (giran de corrido, varias vueltas) */
const agujas = m => ({ h: 277.5 + m * 0.5, m: 90 + m * 6 });
const MINUTOS = [0, 230, 555, 865]; // 09:15 · 13:05 · 18:30 · 23:40

/** los chats de Martín con clientes (genéricos, sin marcas; uno a uno, así que sin autor en las burbujas) */
const CHATS = [
  {
    id: 'referido', nombre: 'Referido de Ana', miembros: 'en línea', avatar: { icono: 'cuenta', color: '#8FA3AD' },
    mensajes: [{ lado: 'saliente', texto: `Hola, te paso el presupuesto: ${formatARS(40000)}.`, hora: '09:15', tildes: 'entregado', visto: true }],
  },
  {
    id: 'nuevo', nombre: 'Cliente nuevo', miembros: 'últ. vez hoy', avatar: { icono: 'cuenta', color: '#A79A8B' },
    mensajes: [
      { lado: 'saliente', texto: 'Te paso el presupuesto.', hora: '12:40', tildes: 'leido' },
      { lado: 'entrante', texto: 'Lo consulto y te aviso.', hora: '13:05' },
    ],
  },
  {
    id: 'consorcio', nombre: 'Consorcio Alberti 2300', miembros: 'en línea', avatar: { icono: 'casa', color: '#7E9AA8' },
    mensajes: [{ lado: 'entrante', texto: '¿No me lo hacés más barato?', hora: '18:30' }],
  },
];

function relojSvg(d) {
  const marcas = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6, q = i % 3 === 0;
    const p = r => `${(Math.sin(a) * r).toFixed(2)} ${(-Math.cos(a) * r).toFixed(2)}`;
    return `<path d="M${p(q ? 68 : 76)}L${p(86)}" stroke-width="${q ? 7 : 4}"/>`;
  }).join('');
  return `<svg viewBox="-120 -120 240 240" width="${d}" height="${d}" aria-hidden="true">
    <circle r="106" fill="#FFFFFF" stroke="#1F57A8" stroke-width="14"/>
    <g stroke="#141414" stroke-linecap="round" fill="none">${marcas}</g>
    <g class="he-a2-aguja" data-aguja="h"><path d="M0 12L0 -46" stroke="#141414" stroke-width="12" stroke-linecap="round"/></g>
    <g class="he-a2-aguja" data-aguja="m"><path d="M0 14L0 -72" stroke="#141414" stroke-width="7" stroke-linecap="round"/></g>
    <circle r="10" fill="#1F57A8"/><circle r="3.6" fill="#FFFFFF"/>
  </svg>`;
}

/** la llamada perdida: una notificación suelta, del ancho de los chats */
function llamadaPerdida() {
  return `<div class="he-a2-llamada">
    <span class="he-a2-llamada-icono">${icon('telefono', { size: 22, stroke: 2.2 })}</span>
    <span class="he-a2-llamada-texto">Llamada perdida <span class="he-a2-llamada-hora">· 23:40</span></span>
  </div>`;
}

function htmlProblema() {
  const tarjeta = (i, id, html) => {
    const p = A2.tarjetas[i];
    return `<div class="he-a2-tarjeta" data-id="${id}" style="left:${px(p.x)};top:${px(p.y)};z-index:${i + 1}"><div class="he-a2-zoom">${html}</div></div>`;
  };
  return `<div class="he-a2 hd-ui">
    <div style="position:absolute;left:${px(A2.tit.x)};top:${px(A2.tit.y)}">${titular({ texto: 'Presupuestás.|Esperás.|Te dejan en visto.', tamano: A2.tit.tamano, ancho: A2.tit.ancho, className: 'he-a2-tit' })}</div>
    <div class="he-a2-reloj" style="left:${px(A2.reloj.x)};top:${px(A2.reloj.y)}">${relojSvg(A2.reloj.d)}</div>
    <div class="he-a2-hora" style="left:${px(A2.hora.x)};top:${px(A2.hora.y)}">${HORAS.map((h, i) => `<span class="he-a2-hora-capa" data-i="${i}">${h}</span>`).join('')}</div>
    ${CHATS.map((c, i) => tarjeta(i, c.id, grupoMensajeria(c))).join('')}
    ${tarjeta(3, 'llamada', llamadaPerdida())}
  </div>`;
}

Trailer.recipe('he-problema', (D, T, o) => {
  const tl = D.tl;
  const s = D.scene('problema', htmlProblema());
  const tit = D.$('.he-a2-tit', s);
  const reloj = D.$('.he-a2-reloj', s);
  const aguja = { h: D.$('.he-a2-aguja[data-aguja="h"]', reloj), m: D.$('.he-a2-aguja[data-aguja="m"]', reloj) };
  const hora = D.$('.he-a2-hora', s);
  const capas = D.$$('.he-a2-hora-capa', s);
  const [referido, nuevo, consorcio, llamada] = ['referido', 'nuevo', 'consorcio', 'llamada'].map(id => D.$(`.he-a2-tarjeta[data-id="${id}"]`, s));
  const globo = (card, i) => card.querySelector(`.hd-burbuja[data-i="${i}"] .hd-burbuja-cuerpo`);

  // el presupuesto de Martín: sobre las dos tildes grises van las azules (leído); ellas y el "Visto" aparecen al final
  const presu = referido.querySelector('.hd-burbuja[data-i="0"]');
  const meta = presu.querySelector('.hd-burbuja-meta');
  const gris = meta.querySelector('.hd-tildes');
  meta.insertAdjacentHTML('beforeend', `<span class="he-a2-leido">${tildesSvg('leido')}</span>`);
  const azul = meta.querySelector('.he-a2-leido');
  const visto = presu.querySelector('.hd-burbuja-visto');

  // "escribiendo…" encima del lugar de la respuesta del cliente nuevo (en la misma burbuja: no hay que medir con el zoom)
  const fila = nuevo.querySelector('.hd-burbuja[data-i="1"]');
  fila.style.position = 'relative';
  fila.insertAdjacentHTML('beforeend', `<div class="he-a2-escr">${burbujaEscribiendo({ tema: 'mensajeria' })}</div>`);
  const escribiendo = fila.querySelector('.he-a2-escr');

  // ── estados iniciales ──
  const tarjetas = [referido, nuevo, consorcio, llamada];
  // afuera, a la derecha: más allá del borde de la pantalla (+ sangrado), no estacionadas a la vista en el sangrado
  gsap.set(tarjetas, { x: 760 + afuera('x'), rotation: 9 });
  D.$$('.hd-grupo-lista > .hd-burbuja > .hd-burbuja-cuerpo', s).forEach(c => { // los mensajes (no el "escribiendo…")
    const sale = c.closest('.hd-burbuja').getAttribute('data-lado') === 'saliente';
    gsap.set(c, { opacity: 0, scale: 0.3, transformOrigin: sale ? '100% 0%' : '0% 0%' });
  });
  gsap.set(azul, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
  gsap.set(visto, { opacity: 0, scale: 0.5, transformOrigin: '100% 0%' });
  gsap.set(escribiendo, { opacity: 0, scale: 0.6, transformOrigin: '0% 100%' });
  gsap.set(reloj, { scale: 0, rotation: -25, transformOrigin: '50% 50%' });
  const a0 = agujas(0);
  gsap.set(aguja.h, { rotation: a0.h, svgOrigin: '0 0' });
  gsap.set(aguja.m, { rotation: a0.m, svgOrigin: '0 0' });
  gsap.set(capas, { yPercent: 100 });                                         // debajo de la ventana del contador
  prepararTitular(tit);

  D.show(s, T);

  const entrar = (card, i, at) => {
    tl.to(card, { x: 0, rotation: A2.tarjetas[i].rot, duration: 0.5, ease: 'expo.out' }, at);
    D.sfx('whoosh', at, 0.35, 0.07);
  };
  const pop = (el, at, sale = true) => {
    tl.to(el, { opacity: 1, duration: 0.06, ease: 'none' }, at);
    tl.to(el, { scale: 1, duration: 0.3, ease: 'back.out(2.2)' }, at);
    D.sfx('plip', at, sale ? 0.1 : 0.08, sale ? 980 : 640);
  };
  const tipea = (el, desde, hasta) => {
    tl.to(el, { opacity: 1, scale: 1, duration: 0.12, ease: 'back.out(2)' }, desde);
    const puntos = el.querySelectorAll('.hd-escribiendo-punto');
    for (let t = desde + 0.06; t < hasta - 0.1; t += 0.16) {
      tl.to(puntos, { y: -4, duration: 0.07, ease: 'sine.out', stagger: 0.035 }, t);
      tl.to(puntos, { y: 0, duration: 0.07, ease: 'sine.in', stagger: 0.035 }, t + 0.07);
    }
    tl.to(el, { opacity: 0, scale: 0.8, duration: 0.06, ease: 'power1.in' }, hasta - 0.04);
  };
  /** las agujas corren de la hora i-1 a la i (con tics de reloj en semicorcheas) y la hora digital cambia al llegar */
  const barrido = (i, at, dur) => {
    const a = agujas(MINUTOS[i]);
    tl.to(aguja.h, { rotation: a.h, duration: dur, ease: 'power2.inOut', svgOrigin: '0 0' }, at);
    tl.to(aguja.m, { rotation: a.m, duration: dur, ease: 'power2.inOut', svgOrigin: '0 0' }, at);
    for (let t = at; t < at + dur - 0.01; t += 0.125) D.sfx('tick', t, 0.02);
    // contador: la hora vieja sube y sale por arriba de la ventana mientras la nueva entra desde abajo
    const fin = at + dur - 0.1;
    tl.to(capas[i - 1], { yPercent: -100, duration: 0.22, ease: 'power3.inOut' }, fin);
    tl.to(capas[i], { yPercent: 0, duration: 0.22, ease: 'power3.inOut' }, fin);
    D.sfx('key', at + dur, 0.06);
  };

  // ── 1 · Presupuestás. (09:15, el referido de Ana) ──
  entrar(referido, 0, T);
  tl.to(reloj, { scale: 1, rotation: 0, duration: 0.35, ease: 'back.out(1.8)' }, T + 0.125);
  D.sfx('fold', T + 0.125, 0.1);
  tl.to(capas[0], { yPercent: 0, duration: 0.3, ease: 'expo.out' }, T + 0.125);
  pop(globo(referido, 0), T + 0.25);
  entraTitular(tl, tit, T + 0.25, { grupo: 0, dur: 0.5 });
  D.sfx('kick', T + 0.25, 0.18);

  // ── 13:05: el cliente nuevo ("Lo consulto y te aviso.") ──
  barrido(1, T + 0.625, 0.375);
  entrar(nuevo, 1, T + 0.875);
  pop(globo(nuevo, 0), T + 1.125);
  tipea(escribiendo, T + 1.25, T + 1.5);
  pop(globo(nuevo, 1), T + 1.5, false);

  // ── 2 · Esperás. (18:30: el consorcio pide rebaja) ──
  entraTitular(tl, tit, T + 1.75, { grupo: 1, dur: 0.5 });
  D.sfx('kick', T + 1.75, 0.18);
  barrido(2, T + 1.75, 0.5);
  entrar(consorcio, 2, T + 2.125);
  pop(globo(consorcio, 0), T + 2.5, false);

  // ── 23:40: la llamada perdida entra y vibra (vibra lo de adentro: la tarjeta todavía está entrando) ──
  barrido(3, T + 2.625, 0.375);
  entrar(llamada, 3, T + 2.75);
  const vibra = llamada.querySelector('.he-a2-zoom');
  [3, 3.125].forEach(t => {
    tl.to(vibra, { x: -6, duration: 0.03, ease: 'none' }, T + t);
    tl.to(vibra, { x: 5, duration: 0.03, ease: 'none' }, T + t + 0.03);
    tl.to(vibra, { x: -3, duration: 0.03, ease: 'none' }, T + t + 0.06);
    tl.to(vibra, { x: 0, duration: 0.03, ease: 'none' }, T + t + 0.09);
    D.sfx('beep', T + t, 1320, 0.07, 0.035);
  });

  // ── 3 · Te dejan en visto. Las tildes se ponen azules, "Visto", y quietud: solo el tic del reloj ──
  entraTitular(tl, tit, T + 3.5, { grupo: 2, dur: 0.5 });
  D.sfx('kick', T + 3.5, 0.22);
  D.sfx('boom', T + 3.5, 0.08);
  tl.to(gris, { opacity: 0, duration: 0.08, ease: 'none' }, T + 3.5);
  tl.to(azul, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2.5)' }, T + 3.5);
  tl.to(visto, { opacity: 1, duration: 0.06, ease: 'none' }, T + 3.5);
  tl.to(visto, { scale: 1.3, duration: 0.3, ease: 'back.out(2.5)' }, T + 3.5);   // un poco más grande: es el remate
  tl.to(referido, { scale: 1.035, duration: 0.08, ease: 'power2.out' }, T + 3.5);
  tl.to(referido, { scale: 1, duration: 0.3, ease: 'power2.inOut' }, T + 3.58);
  D.sfx('plip', T + 3.5, 0.06, 1200);
  [3.75, 4, 4.25].forEach(t => {                                               // tic… tic… tic…
    tl.to(reloj, { scale: 1.04, duration: 0.05, ease: 'power2.out' }, T + t);
    tl.to(reloj, { scale: 1, duration: 0.15, ease: 'power2.inOut' }, T + t + 0.05);
    D.sfx('tick', T + t, 0.035);
  });

  // ── la pila flota apenas mientras se espera (nada queda muerto en la pausa) ──
  tarjetas.forEach((card, i) => {
    const desde = T + [0.5, 1.375, 2.625, 3.375][i];
    tl.to(card, { y: -8 - 3 * i, duration: T + 4.375 - desde, ease: 'sine.inOut' }, desde);
  });

  // ── todo se cae (4,375 escrito = película 9,22) y queda el gris vacío antes del drop ──
  // caen hasta pasar el borde de abajo de lo que se ve (+ sangrado: en vertical sobra pantalla abajo), no el del
  // cuadro: no quedan tiradas a la vista debajo
  const cae = T + 4.375;
  const caer = (el, at, rot, dy = 1150) => {
    tl.to(el, { y: '-=14', duration: 0.08, ease: 'power2.out' }, at);
    tl.to(el, { y: dy + afuera('y'), rotation: rot, duration: 0.3, ease: 'power2.in' }, at + 0.08);
  };
  caer(llamada, cae, -9);
  caer(consorcio, cae + 0.025, 10);
  caer(nuevo, cae + 0.05, -8);
  caer(referido, cae + 0.06, 12, 1250);
  caer(reloj, cae + 0.015, 40, 900);
  caer(hora, cae + 0.035, -6, 900);
  tl.to(tit.querySelectorAll('.hd-tit-in'), { yPercent: 115, duration: 0.24, ease: 'power3.in', stagger: 0.02 }, cae);
  D.sfx('whoosh', cae, 0.45, 0.08);

  D.hide(s, T + o.dur);
  return o.dur;
});
