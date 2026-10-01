/* Animaciones de los Handys (handys.ts) sobre el timeline: solo transform y opacity.
   Cada helper recibe (tl, el, at, …), con el = el wrapper .hd-handy, agrega tweens en el tiempo absoluto `at`
   y DEVUELVE su duración en segundos. Arman objetos de vars nuevos en cada llamada y no usan from/fromTo
   (entrarSaltando fija su estado inicial con gsap.set al armarse, fuera de pantalla).

   Qué mueve cada uno (dos helpers que mueven lo mismo no se superponen en el tiempo sobre el mismo personaje):
     idle            wrapper scaleX/scaleY (respira desde los pies) + parpadeos
     parpadeo        .hd-h-ojos scaleY (todas las caras; solo se ve en la activa)
     saludo          un .hd-h-brazo rotation; la gota, que no tiene brazos, se hamaca (wrapper rotation)
     salto           wrapper x/y/scaleX/scaleY, .hd-h-svg rotation (giro en el aire), piernas y, brazos rotation
     festejo         cara de festejo, brazos arriba y saltos (los de salto), vuelve a feliz
     humor           .hd-h-humor opacity (fundido entre caras)
     mirar           .hd-h-cara x (mira a un costado); mirarCostados = izquierda, derecha y al centro
     entrarSaltando  wrapper x/y/scaleX/scaleY + piernas, en saltitos desde fuera de cuadro
   salto, festejo y entrarSaltando aceptan `sombra` (el div de sombraHandy): la achican en el aire y la llevan en x.
   Los pivotes y poses salen de los data-* del SVG (data-hombro, data-angulo, data-arriba, data-saludo, data-amp,
   data-cadera, data-recoger, data-origen): ver handys.ts. */
import { gsap } from 'gsap';
import type { HandyHumor, HandyLado } from './handys.ts';

/* ───────────── lectura del DOM del personaje ───────────── */

const todos = (el: Element, sel: string): SVGGElement[] => Array.from(el.querySelectorAll<SVGGElement>(sel));
const brazosDe = (el: Element, lado?: HandyLado): SVGGElement[] =>
  todos(el, lado ? `.hd-h-brazo[data-lado="${lado}"]` : '.hd-h-brazo');
const piernasDe = (el: Element): SVGGElement[] => todos(el, '.hd-h-pierna');
const hombro = (b: Element): string => b.getAttribute('data-hombro') ?? '0 0';
const ladoDe = (b: Element): HandyLado => (b.getAttribute('data-lado') === 'izq' ? 'izq' : 'der');
/** +1 si "hacia arriba" es girar en sentido horario (brazo izquierdo), -1 si es antihorario (derecho) */
const arriba = (b: Element): number => (ladoDe(b) === 'izq' ? 1 : -1);

/** alto del wrapper en px de layout (sin la escala del escenario) */
function altoDe(el: Element): number {
  const h = el as HTMLElement;
  return parseFloat(h.style.height) || h.offsetHeight || 240;
}

/** Giro (°) que lleva un brazo de su reposo a apuntar hacia `objetivo` (0° = derecha, -90° = arriba), pasando siempre
    por afuera del cuerpo: el izquierdo se mueve en la mitad izquierda, el derecho en la derecha. */
function giroHacia(b: Element, objetivo: number): number {
  const reposo = parseFloat(b.getAttribute('data-angulo') ?? '0');
  const norm = ladoDe(b) === 'izq'
    ? (a: number) => ((a % 360) + 360) % 360
    : (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
  return norm(objetivo) - norm(reposo);
}

/** ángulos de pose guardados en el brazo (handys.ts): brazo levantado, centro del saludo y amplitud */
const pose = (b: Element, attr: 'data-arriba' | 'data-saludo' | 'data-amp', def: number): number =>
  parseFloat(b.getAttribute(attr) ?? '') || def;
const giroArriba = (b: Element): number => giroHacia(b, pose(b, 'data-arriba', ladoDe(b) === 'izq' ? -118 : -62));

const limitar = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

/* ───────────── caras ───────────── */

/** Fundido a la cara `humor` (las otras a opacity 0). dur = 0 → cambio seco. */
export function humor(tl: GSAPTimeline, el: Element, h: HandyHumor, at: number, dur = 0.15): number {
  for (const capa of todos(el, '.hd-h-humor')) {
    const opacity = capa.getAttribute('data-humor') === h ? 1 : 0;
    if (dur > 0) tl.to(capa, { opacity, duration: dur, ease: 'none' }, at);
    else tl.set(capa, { opacity }, at);
  }
  return dur;
}

export interface MirarOptions {
  /** hacia dónde mira: 'izq', 'der' o 'centro' (vuelve) */
  hacia?: HandyLado | 'centro';
  dur?: number;
}

/** Mira a un costado: corre toda la cara (ojos y boca) hacia ese lado, o la vuelve al centro. */
export function mirar(tl: GSAPTimeline, el: Element, at: number, { hacia = 'izq', dur = 0.2 }: MirarOptions = {}): number {
  const cara = el.querySelector('.hd-h-cara');
  if (!cara) return 0;
  const d = parseFloat(cara.getAttribute('data-mirar') ?? '0') || 0;
  tl.to(cara, { x: hacia === 'centro' ? 0 : hacia === 'izq' ? -d : d, duration: dur, ease: 'power2.inOut' }, at);
  return dur;
}

/** Mira a un costado, al otro y vuelve al centro (≈1,4 s con la pausa default). */
export function mirarCostados(tl: GSAPTimeline, el: Element, at: number, { pausa = 0.32 }: { pausa?: number } = {}): number {
  let t = at;
  t += mirar(tl, el, t, { hacia: 'izq' }) + pausa;
  t += mirar(tl, el, t, { hacia: 'der', dur: 0.28 }) + pausa;
  t += mirar(tl, el, t, { hacia: 'centro' });
  return t - at;
}

/** Parpadeo (0,16 s): cierra y abre los ojos abiertos de todas las caras. */
export function parpadeo(tl: GSAPTimeline, el: Element, at: number): number {
  for (const ojos of todos(el, '.hd-h-ojos')) {
    const svgOrigin = ojos.getAttribute('data-origen') ?? '0 0';
    tl.to(ojos, { scaleY: 0.08, duration: 0.06, ease: 'power2.in', svgOrigin }, at);
    tl.to(ojos, { scaleY: 1, duration: 0.1, ease: 'power2.out', svgOrigin }, at + 0.06);
  }
  return 0.16;
}

/* ───────────── reposo ───────────── */

export interface IdleOptions {
  /** amplitud de la respiración (estiramiento vertical, 0.03 = 3 %) */
  amp?: number;
}

/** Respira desde los pies (estira y achica en ciclos de ~1,8 s que terminan justo en at + dur) y parpadea una o dos
    veces. Usa scaleX/scaleY del wrapper: no superponer con salto, festejo ni entrarSaltando. */
export function idle(tl: GSAPTimeline, el: Element, at: number, dur: number, { amp = 0.03 }: IdleOptions = {}): number {
  if (dur <= 0) return 0;
  const ciclos = Math.max(1, Math.round(dur / 1.8));
  const medio = dur / (ciclos * 2);
  tl.to(el, { scaleY: 1 + amp, scaleX: 1 - amp * 0.5, duration: medio, ease: 'sine.inOut', repeat: ciclos * 2 - 1, yoyo: true }, at);
  if (dur >= 1.2) parpadeo(tl, el, at + dur * 0.38);
  if (dur >= 2.6) parpadeo(tl, el, at + dur * 0.8);
  return dur;
}

/* ───────────── brazos ───────────── */

export interface SaludoOptions {
  lado?: HandyLado;
  /** cuántas idas y vueltas */
  veces?: number;
}

/** Saluda con un brazo: lo levanta, lo agita `veces` veces y lo baja. La gota (sin brazos) se hamaca de contenta. */
export function saludo(tl: GSAPTimeline, el: Element, at: number, { lado = 'der', veces = 3 }: SaludoOptions = {}): number {
  const ida = 0.15, subir = 0.24, bajar = 0.3;
  const [b] = brazosDe(el, lado);
  if (!b) {
    const s = lado === 'izq' ? -1 : 1;
    let t = at;
    for (let i = 0; i < veces; i++) {
      tl.to(el, { rotation: 6 * s, duration: ida, ease: 'sine.inOut' }, t);
      tl.to(el, { rotation: -6 * s, duration: ida, ease: 'sine.inOut' }, t + ida);
      t += ida * 2;
    }
    tl.to(el, { rotation: 0, duration: ida, ease: 'sine.out' }, t);
    return t + ida - at;
  }
  const svgOrigin = hombro(b);
  const alto = giroHacia(b, pose(b, 'data-saludo', lado === 'izq' ? -128 : -52)), amp = pose(b, 'data-amp', 17) * arriba(b);
  let t = at;
  tl.to(b, { rotation: alto, duration: subir, ease: 'back.out(1.8)', svgOrigin }, t);
  t += subir;
  for (let i = 0; i < veces; i++) {
    tl.to(b, { rotation: alto + amp, duration: ida, ease: 'sine.inOut', svgOrigin }, t);
    tl.to(b, { rotation: alto - amp, duration: ida, ease: 'sine.inOut', svgOrigin }, t + ida);
    t += ida * 2;
  }
  tl.to(b, { rotation: 0, duration: bajar, ease: 'power2.inOut', svgOrigin }, t);
  return t + bajar - at;
}

/* ───────────── saltos ───────────── */

export interface SaltoOptions {
  /** altura del salto en px */
  altura?: number;
  /** desplazamiento horizontal durante el salto, en px */
  dx?: number;
  /** giro del cuerpo en el aire en grados (360 = vuelta carnero; alrededor del centro del personaje) */
  rot?: number;
  /** los brazos acompañan el salto (default true) */
  brazos?: boolean;
  /** sombra del piso (sombraHandy): se achica y se aclara mientras el personaje está en el aire */
  sombra?: Element | null;
}

/** sombra: se achica y se aclara mientras sube, vuelve mientras baja */
function sombraEnSalto(tl: GSAPTimeline, sombra: Element, at: number, sube: number, baja: number, h: number): void {
  const k = limitar(1 - h / 380, 0.45, 0.85);
  tl.to(sombra, { scale: k, opacity: 0.45, duration: sube, ease: 'power2.out' }, at);
  tl.to(sombra, { scale: 1, opacity: 1, duration: baja, ease: 'power2.in' }, at + sube);
}

/** Salto con anticipación: se agacha, se estira y sube, cae, se aplasta al aterrizar y rebota hasta quedar quieto.
    Recoge las piernas en el aire. y/x son relativos a donde esté el personaje. */
export function salto(tl: GSAPTimeline, el: Element, at: number, { altura = 120, dx = 0, rot = 0, brazos = true, sombra }: SaltoOptions = {}): number {
  const h = Math.max(0, altura);
  const sube = limitar(0.3 * Math.sqrt(h / 120), 0.16, 0.55), baja = sube * 0.9;
  const agacha = 0.12, aplasta = 0.08, asienta = 0.3;
  const t0 = at + agacha, tAire = sube + baja, tSuelo = t0 + tAire;
  // anticipación
  tl.to(el, { scaleY: 0.82, scaleX: 1.12, duration: agacha, ease: 'power2.out' }, at);
  // impulso: se estira rápido y llega redondo a la cima
  tl.to(el, { y: `-=${h}`, duration: sube, ease: 'power2.out' }, t0);
  tl.to(el, { scaleY: 1.14, scaleX: 0.9, duration: sube * 0.35, ease: 'power2.out' }, t0);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: sube * 0.5, ease: 'sine.inOut' }, t0 + sube * 0.35);
  // caída, estirándose un poco antes de tocar el piso
  tl.to(el, { y: `+=${h}`, duration: baja, ease: 'power2.in' }, t0 + sube);
  tl.to(el, { scaleY: 1.08, scaleX: 0.94, duration: baja * 0.5, ease: 'sine.in' }, t0 + sube + baja * 0.5);
  // aterrizaje y rebote
  tl.to(el, { scaleY: 0.8, scaleX: 1.16, duration: aplasta, ease: 'power2.out' }, tSuelo);
  tl.to(el, { scaleY: 1, scaleX: 1, duration: asienta, ease: 'back.out(2.2)' }, tSuelo + aplasta);
  if (dx) tl.to(el, { x: `+=${dx}`, duration: tAire, ease: 'none' }, t0);
  if (sombra) sombraEnSalto(tl, sombra, t0, sube, baja, h);
  if (sombra && dx) tl.to(sombra, { x: `+=${dx}`, duration: tAire, ease: 'none' }, t0);
  if (rot) {
    const svg = el.querySelector('.hd-h-svg');
    if (svg) tl.to(svg, { rotation: `+=${rot}`, duration: tAire, ease: 'power1.inOut' }, t0);
  }
  // piernas recogidas en el aire
  for (const p of piernasDe(el)) {
    const r = parseFloat(p.getAttribute('data-recoger') ?? '0');
    tl.to(p, { y: -r, duration: sube * 0.45, ease: 'power2.out' }, t0 + 0.02);
    tl.to(p, { y: 0, duration: baja * 0.5, ease: 'power2.in' }, t0 + sube + baja * 0.45);
  }
  // los brazos suben con el impulso y bajan al asentarse
  if (brazos) {
    for (const b of brazosDe(el)) {
      const svgOrigin = hombro(b), margen = giroArriba(b) * arriba(b);
      tl.to(b, { rotation: Math.max(0, Math.min(24, margen)) * arriba(b), duration: sube * 0.6, ease: 'power2.out', svgOrigin }, t0);
      tl.to(b, { rotation: 0, duration: asienta, ease: 'power2.inOut', svgOrigin }, tSuelo);
    }
  }
  return agacha + tAire + aplasta + asienta;
}

export interface FestejoOptions {
  /** cuántos saltos */
  saltos?: number;
  /** altura de cada salto en px (default: un tercio del alto del personaje) */
  altura?: number;
  /** sombra del piso (sombraHandy), ver salto */
  sombra?: Element | null;
}

/** Festejo: cara de festejo, brazos arriba agitándose, `saltos` saltos y vuelta a la cara feliz con los brazos abajo. */
export function festejo(tl: GSAPTimeline, el: Element, at: number, { saltos = 2, altura, sombra }: FestejoOptions = {}): number {
  const brazos = brazosDe(el);
  const h = altura ?? limitar(altoDe(el) * 0.32, 36, 150);
  humor(tl, el, 'festejo', at, 0.12);
  for (const b of brazos) {
    tl.to(b, { rotation: giroArriba(b), duration: 0.22, ease: 'back.out(2)', svgOrigin: hombro(b) }, at);
  }
  let t = at + 0.08;
  for (let i = 0; i < saltos; i++) {
    const d = salto(tl, el, t, { altura: h * (i % 2 ? 0.8 : 1), brazos: false, sombra });
    for (const b of brazos) {
      // se agitan hacia afuera (abajo) desde la pose de arriba, así nunca se meten detrás del cuerpo
      const base = giroArriba(b), svgOrigin = hombro(b), vaiven = Math.min(16, pose(b, 'data-amp', 17));
      tl.to(b, { rotation: base - vaiven * arriba(b), duration: d * 0.28, ease: 'sine.inOut', svgOrigin }, t + d * 0.2);
      tl.to(b, { rotation: base, duration: d * 0.28, ease: 'sine.inOut', svgOrigin }, t + d * 0.5);
    }
    t += d;
  }
  for (const b of brazos) tl.to(b, { rotation: 0, duration: 0.3, ease: 'power2.inOut', svgOrigin: hombro(b) }, t);
  humor(tl, el, 'feliz', t + 0.12, 0.15);
  return t + 0.3 - at;
}

export interface EntrarSaltandoOptions {
  /** x de partida (px, relativa a la posición de reposo; fuera de cuadro) */
  desdeX: number;
  /** x de llegada (px, relativa a la posición de reposo; normalmente 0) */
  hastaX: number;
  /** cuántos saltitos */
  saltos?: number;
  /** altura del primer saltito en px (los siguientes, más bajos); default: casi la mitad del alto del personaje */
  altura?: number;
  /** sombra del piso (sombraHandy): viaja con el personaje y se achica en cada saltito */
  sombra?: Element | null;
}

/** Entra a cuadro en saltitos desde desdeX hasta hastaX, aplastándose en cada pique y rebotando al final.
    Fija el estado inicial (x = desdeX, también en la sombra) con gsap.set al armarse: antes de `at` el personaje queda
    fuera de cuadro. */
export function entrarSaltando(tl: GSAPTimeline, el: Element, { desdeX, hastaX, saltos = 3, altura, sombra }: EntrarSaltandoOptions, at: number): number {
  gsap.set(el, { x: desdeX });
  if (sombra) gsap.set(sombra, { x: desdeX });
  const n = Math.max(1, Math.round(saltos));
  const h0 = altura ?? limitar(altoDe(el) * 0.45, 50, 170);
  const piernas = piernasDe(el);
  let t = at;
  for (let i = 0; i < n; i++) {
    const ultimo = i === n - 1;
    const h = h0 * (1 - 0.22 * i);
    const vuelo = limitar(0.46 * Math.sqrt(h / 120), 0.26, 0.6);
    const x1 = desdeX + ((hastaX - desdeX) * (i + 1)) / n;
    tl.to(el, { x: x1, duration: vuelo, ease: 'none' }, t);
    if (sombra) {
      tl.to(sombra, { x: x1, duration: vuelo, ease: 'none' }, t);
      sombraEnSalto(tl, sombra, t, vuelo / 2, vuelo / 2, h);
    }
    tl.to(el, { y: `-=${h}`, duration: vuelo / 2, ease: 'power2.out' }, t);
    tl.to(el, { y: `+=${h}`, duration: vuelo / 2, ease: 'power2.in' }, t + vuelo / 2);
    tl.to(el, { scaleY: 1.1, scaleX: 0.92, duration: vuelo * 0.3, ease: 'power2.out' }, t);
    tl.to(el, { scaleY: 1, scaleX: 1, duration: vuelo * 0.3, ease: 'sine.inOut' }, t + vuelo * 0.35);
    tl.to(el, { scaleY: 1.06, scaleX: 0.95, duration: vuelo * 0.25, ease: 'sine.in' }, t + vuelo * 0.75);
    for (const p of piernas) {
      const r = parseFloat(p.getAttribute('data-recoger') ?? '0') * 0.7;
      tl.to(p, { y: -r, duration: vuelo * 0.3, ease: 'power2.out' }, t + 0.02);
      tl.to(p, { y: 0, duration: vuelo * 0.3, ease: 'power2.in' }, t + vuelo * 0.62);
    }
    const suelo = t + vuelo;
    tl.to(el, { scaleY: ultimo ? 0.8 : 0.86, scaleX: ultimo ? 1.15 : 1.1, duration: 0.07, ease: 'power2.out' }, suelo);
    tl.to(el, { scaleY: 1, scaleX: 1, duration: ultimo ? 0.32 : 0.1, ease: ultimo ? 'back.out(2.4)' : 'power2.out' }, suelo + 0.07);
    t = suelo + (ultimo ? 0.39 : 0.17);
  }
  return t - at;
}
