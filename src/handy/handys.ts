/* Handys: los cinco personajes de Handy (gota, caño, engranaje, lamparita y llave) como SVG animable.
   Redibujados a mano en vectores a partir de las ilustraciones originales (handy-png/handy-*.png, solo referencia: no se
   importan). Cada personaje usa las coordenadas en píxeles de su PNG, así el dibujo se puede superponer al original.

   handy(tipo, { altura = 240, humor = 'feliz', className, id }) → string
     <div class="hd-handy hd-handy--<tipo>" data-handy="<tipo>" style="width;height;transform-origin:<pies>% 100%">
       <svg class="hd-h-svg" viewBox=…>              overflow visible · transform-origin 50% 50% (giros en el aire)
         .hd-h-pierna[data-lado="izq|der"]            pierna + pie · data-cadera="x y" (pivote) · data-recoger (cuánto sube en el salto)
         .hd-h-brazo[data-lado="izq|der"]             brazo + mano · data-hombro="x y" (pivote) · data-angulo (° en reposo)
                                                       · data-arriba / data-saludo / data-amp (poses seguras, sin esconderse)
         .hd-h-rayos                                   lamparita: los tres rayos · data-origen="x y" (centro del foco)
         .hd-h-cuerpo                                  el cuerpo
         .hd-h-pico                                    caño: la tuerca azul · data-goteo="x y" (donde se forma la gota)
         .hd-h-cara                                    data-origen="x y" (centro) · data-mirar (corrimiento al mirar de costado)
           .hd-h-humor[data-humor="feliz|preocupado|festejo"]   solo la activa se ve (opacity 1, las otras 0)
             .hd-h-ojos[data-origen="x y"]            ojos abiertos: blanco del parpadeo (no existe en caras de ojos cerrados)
   Piernas y brazos van detrás del cuerpo. La gota no tiene brazos ni piernas, como en el dibujo original.
   Las coordenadas de los data-* son del viewBox. El wrapper es HTML: los movimientos de cuerpo entero (saltos, squash
   & stretch) son transforms de CSS que escalan desde los pies. Las animaciones están en handys-anim.ts.

   HANDY_INFO[tipo]: viewBox, aspecto, alturaGrupo y posición en la fila de handys-grupo.png, pies, sombra, pivotes y
   poses de brazos y piernas, cara y ojos, punto de goteo (caño), punta (gota), rayos (lamparita).
   Medidas en px del wrapper: anchoHandy, escalaHandy, puntoHandy, puntoGoteo, piesHandy, filaHandys.
   Extras: sombraHandy (sombra chata en el piso, opcional) y gotita (gota de agua sin cara, para la escena 1).
   El contorno del engranaje y de la llave es algo más grueso que en sus PNG sueltos (GROSOR): punto medio con
   handys-grupo.png, donde esos dos tienen la línea más gruesa, para que la fila se vea pareja. */
import './css/base.css';
import './css/handys.css';

export type HandyTipo = 'gota' | 'cano' | 'engranaje' | 'lamparita' | 'llave';
export type HandyHumor = 'feliz' | 'preocupado' | 'festejo';
export type HandyLado = 'izq' | 'der';

/** Orden de la fila de handys-grupo.png, de izquierda a derecha. */
export const HANDY_TIPOS: readonly HandyTipo[] = ['gota', 'cano', 'engranaje', 'lamparita', 'llave'];
export const HANDY_HUMORES: readonly HandyHumor[] = ['feliz', 'preocupado', 'festejo'];

export interface HandyOptions {
  /** alto del wrapper en px (el ancho sale del aspecto); default 240 */
  altura?: number;
  /** cara visible al empezar; default 'feliz' */
  humor?: HandyHumor;
  className?: string;
  id?: string;
}

export interface Punto { x: number; y: number }

export interface HandyBrazo {
  /** pivote del brazo (coordenadas del viewBox), escondido detrás del cuerpo */
  hombro: Punto;
  /** dirección del brazo en reposo, del hombro a la mano: 0° = derecha, 90° = abajo, -90° = arriba */
  angulo: number;
  /** dirección del brazo levantado (festejo) */
  arriba: number;
  /** dirección central del saludo y amplitud del vaivén (°) */
  saludo: number;
  amp: number;
}

export interface HandyPierna {
  /** pivote de la pierna (coordenadas del viewBox), escondido detrás del cuerpo */
  cadera: Punto;
  /** cuánto sube la pierna (unidades del viewBox) para recogerla en el aire */
  recoger: number;
}

export interface HandyInfo {
  /** viewBox del SVG, en px del PNG de referencia */
  viewBox: { x: number; y: number; w: number; h: number };
  /** ancho / alto del wrapper */
  aspecto: number;
  /** alto del wrapper en la fila de handys-grupo.png, con el caño = 1 */
  alturaGrupo: number;
  /** esquina superior izquierda del wrapper en la fila de handys-grupo.png, en altos del caño */
  grupo: { x: number; y: number };
  /** x del centro de los pies en fracción del ancho (0..1): transform-origin del wrapper = pies·100% 100% */
  pies: number;
  /** ancho de la sombra en el piso (unidades del viewBox; ver sombraHandy) */
  sombra: number;
  /** centro de la cara */
  cara: Punto;
  /** cuánto se corre la cara para mirar a un costado (unidades del viewBox; mirar() en handys-anim.ts) */
  mirar: number;
  /** centro entre los ojos (pivote del parpadeo) */
  ojos: Punto;
  brazos: Partial<Record<HandyLado, HandyBrazo>>;
  piernas: Partial<Record<HandyLado, HandyPierna>>;
  /** caño: punto de goteo, abajo de la tuerca */
  goteo?: Punto;
  /** gota: la punta de arriba */
  punta?: Punto;
  /** lamparita: centro de los rayos (el foco) */
  rayos?: Punto;
}

/* ───────────────────────────── utilidades de dibujo ───────────────────────────── */

type V2 = readonly [number, number];

const n = (v: number): string => String(Math.round(v * 100) / 100);
const pt = (p: V2): string => n(p[0]) + ' ' + n(p[1]);

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Polígono cerrado con las esquinas redondeadas (radio por vértice, 0 = esquina viva). */
function poligonoRedondeado(p: readonly V2[], radios: readonly number[]): string {
  const k = p.length;
  let d = '';
  for (let i = 0; i < k; i++) {
    const a = p[(i + k - 1) % k], b = p[i], c = p[(i + 1) % k];
    const l1 = Math.hypot(a[0] - b[0], a[1] - b[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const u1: V2 = [(a[0] - b[0]) / l1, (a[1] - b[1]) / l1], u2: V2 = [(c[0] - b[0]) / l2, (c[1] - b[1]) / l2];
    const ang = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
    let r = radios[i] ?? 0;
    let t = r > 0 ? r / Math.tan(ang / 2) : 0;
    const tMax = Math.min(l1, l2) / 2;
    if (t > tMax) { t = tMax; r = t * Math.tan(ang / 2); }
    const s: V2 = [b[0] + u1[0] * t, b[1] + u1[1] * t];
    d += (i === 0 ? 'M' : 'L') + pt(s);
    if (t > 0.01) {
      const e: V2 = [b[0] + u2[0] * t, b[1] + u2[1] * t];
      const giro = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      d += 'A' + n(r) + ' ' + n(r) + ' 0 0 ' + (giro > 0 ? 1 : 0) + ' ' + pt(e);
    }
  }
  return d + 'Z';
}

/** Desplaza una poligonal abierta d unidades hacia su derecha (el interior de un contorno horario en pantalla). */
function desplazar(p: readonly V2[], d: number): V2[] {
  const t: V2[] = [], nr: V2[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const dx = p[i + 1][0] - p[i][0], dy = p[i + 1][1] - p[i][1], l = Math.hypot(dx, dy);
    t.push([dx / l, dy / l]);
    nr.push([-dy / l, dx / l]);
  }
  const out: V2[] = [[p[0][0] + nr[0][0] * d, p[0][1] + nr[0][1] * d]];
  for (let i = 1; i < p.length - 1; i++) {
    const A: V2 = [p[i][0] + nr[i][0] * d, p[i][1] + nr[i][1] * d];
    const B: V2 = [p[i][0] + nr[i - 1][0] * d, p[i][1] + nr[i - 1][1] * d];
    const den = t[i][0] * t[i - 1][1] - t[i][1] * t[i - 1][0];
    if (Math.abs(den) < 1e-9) { out.push(A); continue; }
    const s = ((B[0] - A[0]) * t[i - 1][1] - (B[1] - A[1]) * t[i - 1][0]) / den;
    out.push([A[0] + t[i][0] * s, A[1] + t[i][1] * s]);
  }
  const m = p.length - 1, q = nr[m - 1];
  out.push([p[m][0] + q[0] * d, p[m][1] + q[1] * d]);
  return out;
}

/** Punto donde el segmento a→b cruza la circunferencia (centro c, radio r). */
function cruceCirculo(a: V2, b: V2, c: V2, r: number): V2 {
  const dx = b[0] - a[0], dy = b[1] - a[1], fx = a[0] - c[0], fy = a[1] - c[1];
  const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - r * r;
  const disc = Math.sqrt(Math.max(0, B * B - 4 * A * C));
  for (const s of [(-B - disc) / (2 * A), (-B + disc) / (2 * A)]) {
    if (s >= 0 && s <= 1) return [a[0] + dx * s, a[1] + dy * s];
  }
  return b;
}

/* ───────────────────────────── piezas de cara ───────────────────────────── */

const NEGRO = '#0A0A0A';
const BLANCO = '#FFFFFF';
const BOCA_ADENTRO = '#3B1218';
const LENGUA = '#FF8A9B';
const SUDOR = { relleno: '#DDF3FF', trazo: '#5DB6F6' };

/** brillo de un ojo: [dx, dy, radio] en radios del ojo */
type Brillo = readonly [number, number, number];

interface EstiloCara {
  /** radio de los ojos abiertos */
  r: number;
  /** los dos brillos blancos */
  brillos: readonly [Brillo, Brillo];
  /** grosor de los trazos negros (cejas, arcos, bocas de línea) */
  trazo: number;
}

const linea = (d: string, sw: number, color = NEGRO): string =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${n(sw)}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** ojo negro brillante */
function ojo(c: V2, e: EstiloCara): string {
  const [b1, b2] = e.brillos;
  return `<circle cx="${n(c[0])}" cy="${n(c[1])}" r="${n(e.r)}" fill="${NEGRO}"/>`
    + `<circle cx="${n(c[0] + b1[0] * e.r)}" cy="${n(c[1] + b1[1] * e.r)}" r="${n(b1[2] * e.r)}" fill="${BLANCO}"/>`
    + `<circle cx="${n(c[0] + b2[0] * e.r)}" cy="${n(c[1] + b2[1] * e.r)}" r="${n(b2[2] * e.r)}" fill="${BLANCO}"/>`;
}

/** los dos ojos abiertos, agrupados para el parpadeo */
function ojosAbiertos(izq: V2, der: V2, e: EstiloCara): string {
  const o: V2 = [(izq[0] + der[0]) / 2, (izq[1] + der[1]) / 2];
  return `<g class="hd-h-ojos" data-origen="${pt(o)}">${ojo(izq, e)}${ojo(der, e)}</g>`;
}

/** ojo cerrado feliz "^": arco de ancho w (entre centros de las puntas) y alto h */
const arco = (c: V2, w: number, h: number, sw: number): string =>
  linea(`M${pt([c[0] - w / 2, c[1] + h / 2])}Q${pt([c[0], c[1] - 1.5 * h])} ${pt([c[0] + w / 2, c[1] + h / 2])}`, sw);

/** sonrisa "U" de línea: puntas en c.y - h/2, fondo en c.y + h/2 */
const sonrisa = (c: V2, w: number, h: number, sw: number): string =>
  linea(`M${pt([c[0] - w / 2, c[1] - h / 2])}Q${pt([c[0], c[1] + 1.5 * h])} ${pt([c[0] + w / 2, c[1] - h / 2])}`, sw);

/** forma de una boca en "D": lado = cuánto se cierran los costados hacia abajo (fracción del ancho),
    fondo = semiancho del fondo redondeado (fracción del ancho), alto = dónde empieza a curvarse (fracción del alto) */
interface FormaBoca { lado: number; fondo: number; alto: number }
const BOCA_REDONDA: FormaBoca = { lado: 0, fondo: 0.26, alto: 0.62 };

/** boca en "D" (borde de arriba recto, abajo redondo): top = borde superior, w × h entre ejes del trazo */
function bocaD(cx: number, top: number, w: number, h: number, f: FormaBoca = BOCA_REDONDA): string {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  return `M${pt([x0, top])}L${pt([x1, top])}C${pt([x1 - w * f.lado, top + h * f.alto])} ${pt([cx + w * f.fondo, top + h])} ${pt([cx, top + h])}`
    + `C${pt([cx - w * f.fondo, top + h])} ${pt([x0 + w * f.lado, top + h * f.alto])} ${pt([x0, top])}Z`;
}

/** sonrisa abierta con dientes (gota y lamparita) */
const bocaDientes = (cx: number, top: number, w: number, h: number, sw: number, f: FormaBoca): string =>
  `<path d="${bocaD(cx, top, w, h, f)}" fill="${BLANCO}" stroke="${NEGRO}" stroke-width="${n(sw)}" stroke-linejoin="round"/>`;

/** boca de festejo: grande y abierta, con dientes arriba y lengua */
function bocaFestejo(cx: number, top: number, w: number, h: number, sw: number): string {
  const d = bocaD(cx, top, w, h);
  return `<path d="${d}" fill="${BOCA_ADENTRO}"/>`
    + `<rect x="${n(cx - w / 2)}" y="${n(top)}" width="${n(w)}" height="${n(h * 0.3)}" fill="${BLANCO}"/>`
    + `<ellipse cx="${n(cx)}" cy="${n(top + h * 0.84)}" rx="${n(w * 0.27)}" ry="${n(h * 0.2)}" fill="${LENGUA}"/>`
    + `<path d="${d}" fill="none" stroke="${NEGRO}" stroke-width="${n(sw)}" stroke-linejoin="round"/>`;
}

/** boca ondulada de preocupación "∽", centrada en c */
const bocaOndulada = (c: V2, w: number, a: number, sw: number): string =>
  linea(`M${pt([c[0] - w / 2, c[1]])}Q${pt([c[0] - w / 4, c[1] - a * 2])} ${pt(c)}T${pt([c[0] + w / 2, c[1]])}`, sw);

/** cejas preocupadas "/ \" (la punta de adentro más alta) sobre dos ojos de radio r; alto = cuánto suben (1 = normal) */
function cejas(izq: V2, der: V2, r: number, sw: number, alto = 1): string {
  const una = (o: V2, s: number): string => {
    const a: V2 = [o[0] - s * 0.9 * r, o[1] - 1.36 * r * alto], b: V2 = [o[0] + s * 0.48 * r, o[1] - 2.08 * r * alto];
    const m: V2 = [(a[0] + b[0]) / 2 + s * 0.04 * r, (a[1] + b[1]) / 2 + 0.1 * r];
    return `M${pt(a)}Q${pt(m)} ${pt(b)}`;
  };
  return linea(una(izq, 1) + una(der, -1), sw);
}

/** gotita de sudor (punta arriba): c = centro de la panza, h = alto total */
function sudor(c: V2, h: number, sw: number): string {
  const r = h * 0.34, top = c[1] - h + r;
  const d = `M${pt([c[0], top])}C${pt([c[0] + r * 0.35, top + r * 0.9])} ${pt([c[0] + r, c[1] - r * 0.55])} ${pt([c[0] + r, c[1]])}`
    + `A${n(r)} ${n(r)} 0 0 1 ${pt([c[0] - r, c[1]])}C${pt([c[0] - r, c[1] - r * 0.55])} ${pt([c[0] - r * 0.35, top + r * 0.9])} ${pt([c[0], top])}Z`;
  return `<path d="${d}" fill="${SUDOR.relleno}" stroke="${SUDOR.trazo}" stroke-width="${n(sw)}" stroke-linejoin="round"/>`
    + `<ellipse cx="${n(c[0] - r * 0.38)}" cy="${n(c[1] - r * 0.1)}" rx="${n(r * 0.17)}" ry="${n(r * 0.3)}" fill="${BLANCO}"/>`;
}

interface CarasDef {
  /** ojos (centros) */
  ojoIzq: V2;
  ojoDer: V2;
  estilo: EstiloCara;
  /** cara feliz tal como el dibujo original */
  feliz: string;
  /** centro de la boca de preocupación y su ancho */
  bocaPre: V2;
  anchoPre: number;
  /** dónde va la gotita de sudor (centro de la panza) y su alto */
  sudor: V2;
  altoSudor: number;
  /** boca de festejo: centro x, borde superior, ancho, alto */
  festejo: readonly [number, number, number, number];
  /** altura de las cejas de preocupación (1 = normal; menos si los ojos están pegados al borde) */
  cejas?: number;
}

function caras(c: CarasDef): Record<HandyHumor, string> {
  const e = c.estilo;
  const preocupado = ojosAbiertos(c.ojoIzq, c.ojoDer, e)
    + cejas(c.ojoIzq, c.ojoDer, e.r, e.trazo, c.cejas)
    + bocaOndulada(c.bocaPre, c.anchoPre, c.anchoPre * 0.11, e.trazo)
    + sudor(c.sudor, c.altoSudor, Math.max(1.6, c.altoSudor * 0.09));
  const [fx, ft, fw, fh] = c.festejo;
  const arcos = arco(c.ojoIzq, e.r * 1.75, e.r * 0.62, e.trazo) + arco(c.ojoDer, e.r * 1.75, e.r * 0.62, e.trazo);
  const festejo = arcos + bocaFestejo(fx, ft, fw, fh, e.trazo);
  return { feliz: c.feliz, preocupado, festejo };
}

/* ───────────────────────────── brazos y piernas ───────────────────────────── */

type Rect5 = readonly [number, number, number, number, number];

interface BrazoDef {
  /** pivote: donde el brazo entra al contorno del cuerpo */
  hombro: V2;
  /** muñeca: donde se cruzan los dedos */
  muneca: V2;
  /** punta del dedo que sigue la línea del brazo */
  punta: V2;
  /** los otros dos dedos (puntas) */
  dedos: readonly [V2, V2];
  /** grosor de la mano si es más gorda que el brazo (caño) */
  mano?: number;
  /** ángulos de pose (0° = derecha, -90° = arriba): brazo arriba del festejo, centro del saludo y su amplitud.
      Por defecto ARRIBA/SALUDO/AMPLITUD; la lamparita y la llave los ajustan para que la mano no se esconda detrás
      del foco o de la cabeza redonda. */
  arriba?: number;
  saludo?: number;
  amp?: number;
}

const ARRIBA: Record<HandyLado, number> = { izq: -118, der: -62 };
const SALUDO: Record<HandyLado, number> = { izq: -128, der: -52 };
const AMPLITUD = 17;

interface PiernaDef {
  x: number;
  /** arranque de la pierna, escondido detrás del cuerpo (pivote) */
  cadera: number;
  /** pie: rectángulo exterior [x, y, ancho, alto, radio] */
  pie: Rect5;
  /** cuánto sube la pierna para recogerla en el aire */
  recoger: number;
}

const anguloDe = (b: BrazoDef): number =>
  Math.round(Math.atan2(b.muneca[1] - b.hombro[1], b.muneca[0] - b.hombro[0]) * 1800 / Math.PI) / 10;

function brazo(lado: HandyLado, b: BrazoDef, color: string, sw: number): string {
  // el trazo arranca adentro del cuerpo para que la punta redonda nunca asome al girar
  const dx = b.hombro[0] - b.muneca[0], dy = b.hombro[1] - b.muneca[1], l = Math.hypot(dx, dy);
  const adentro: V2 = [b.hombro[0] + (dx / l) * sw * 1.4, b.hombro[1] + (dy / l) * sw * 1.4];
  const mano = `M${pt(b.muneca)}L${pt(b.punta)}M${pt(b.dedos[0])}L${pt(b.muneca)}L${pt(b.dedos[1])}`;
  const trazos = b.mano
    ? linea(`M${pt(adentro)}L${pt(b.muneca)}`, sw, color) + linea(mano, b.mano, color)
    : linea(`M${pt(adentro)}L${pt(b.muneca)}` + mano, sw, color);
  const poses = `data-arriba="${n(b.arriba ?? ARRIBA[lado])}" data-saludo="${n(b.saludo ?? SALUDO[lado])}" data-amp="${n(b.amp ?? AMPLITUD)}"`;
  return `<g class="hd-h-brazo" data-lado="${lado}" data-hombro="${pt(b.hombro)}" data-angulo="${n(anguloDe(b))}" ${poses}>${trazos}</g>`;
}

function pierna(lado: HandyLado, p: PiernaDef, color: string, sw: number, pie: string): string {
  const fondo = p.pie[1] + p.pie[3] / 2;
  return `<g class="hd-h-pierna" data-lado="${lado}" data-cadera="${pt([p.x, p.cadera])}" data-recoger="${n(p.recoger)}">`
    + `<path d="M${pt([p.x, p.cadera])}L${pt([p.x, fondo])}" stroke="${color}" stroke-width="${n(sw)}" fill="none"/>`
    + pie + '</g>';
}

const rect = (r: Rect5, attrs: string): string =>
  `<rect x="${n(r[0])}" y="${n(r[1])}" width="${n(r[2])}" height="${n(r[3])}" rx="${n(r[4])}" ${attrs}/>`;

/** rectángulo exterior → rectángulo del eje de un trazo de grosor t */
const adentroDe = (r: Rect5, t: number): Rect5 => [r[0] + t / 2, r[1] + t / 2, r[2] - t, r[3] - t, Math.max(0, r[4] - t / 2)];

/** pie tipo bota: más redondeado del lado de afuera (izquierda en el pie izquierdo) que del lado de la pierna */
function bota(r: Rect5, lado: HandyLado, afuera: number, adentroR: number, attrs: string): string {
  const [x, y, w, h] = r, x1 = x + w, y1 = y + h;
  const rad = lado === 'izq' ? [afuera, adentroR, adentroR, afuera] : [adentroR, afuera, afuera, adentroR];
  return `<path d="${poligonoRedondeado([[x, y], [x1, y], [x1, y1], [x, y1]], rad)}" ${attrs}/>`;
}

/* ───────────────────────────── los cinco ───────────────────────────── */

interface Personaje {
  viewBox: HandyInfo['viewBox'];
  /** grosor de brazos y piernas (en el PNG, el mismo del contorno) */
  trazo: number;
  colorMiembros: string;
  /** color de las piernas si no es el de los brazos (lamparita: brazos amarillos, piernas grises) */
  colorPiernas?: string;
  brazos?: Record<HandyLado, BrazoDef>;
  piernas?: Record<HandyLado, PiernaDef>;
  /** dibuja un pie a partir de su rectángulo exterior */
  pie?: (r: Rect5, lado: HandyLado) => string;
  /** antes del cuerpo (rayos) */
  atras?: string;
  cuerpo: string;
  /** después del cuerpo (pico) */
  delante?: string;
  cara: V2;
  /** corrimiento de la cara al mirar a un costado (sin que los ojos toquen el borde) */
  mirar: number;
  ojos: V2;
  caras: Record<HandyHumor, string>;
  /** x del centro de los pies (unidades del viewBox) */
  piesX: number;
  /** ancho de la sombra en el piso (unidades del viewBox) */
  sombra: number;
  goteo?: V2;
  punta?: V2;
  rayos?: V2;
}

/** Grosor del contorno del cuerpo relativo al PNG suelto. En handys-grupo.png el engranaje y la llave tienen el
    contorno bastante más grueso que en sus PNG (los brazos y piernas no); se toma un punto medio para que la fila se
    vea pareja sin alejarse de los dibujos sueltos. */
const GROSOR: Record<HandyTipo, number> = { gota: 1, cano: 1, engranaje: 1.35, lamparita: 1, llave: 1.5 };

/* ── gota (handy-gota-y-cano.png) ── */
function gota(): Personaje {
  const C = { relleno: '#92CEFE', trazo: '#66BEF8' };
  const o = 8.5 * GROSOR.gota;
  // contorno ajustado al PNG: círculo de abajo (62.7, 279.1) r 45.4 por fuera y punta redondeada en y 202.6
  const cx = 62.7, cy = 279.1, R = 45.4 - o / 2, top = 202.6 + o / 2 - 1.85, al = (14.84 * Math.PI) / 180;
  const q: V2 = [cx + R * Math.cos(al), cy - R * Math.sin(al)], tq: V2 = [-Math.sin(al), -Math.cos(al)];
  const c2: V2 = [q[0] + tq[0] * 22.96, q[1] + tq[1] * 22.96];
  const d = `M${pt([cx, top])}C${pt([cx + 5.2, top])} ${pt(c2)} ${pt(q)}A${n(R)} ${n(R)} 0 1 1 ${pt([2 * cx - q[0], q[1]])}`
    + `C${pt([2 * cx - c2[0], c2[1]])} ${pt([cx - 5.2, top])} ${pt([cx, top])}Z`;
  const ojoIzq: V2 = [46.5, 255.4], ojoDer: V2 = [76.9, 255.4];
  const estilo: EstiloCara = { r: 7.4, brillos: [[-0.45, -0.3, 0.24], [0.08, -0.62, 0.12]], trazo: 2.8 };
  const feliz = arco(ojoIzq, 15, 2.7, 2.5) + arco(ojoDer, 15, 2.7, 2.5)
    + bocaDientes(60.6, 269.3, 16.2, 8.4, 2.6, { lado: 0.1, fondo: 0.15, alto: 0.55 });
  return {
    viewBox: { x: 14, y: 199.5, w: 97.4, h: 125 },
    trazo: o, colorMiembros: C.trazo,
    cuerpo: `<path d="${d}" fill="${C.relleno}" stroke="${C.trazo}" stroke-width="${n(o)}" stroke-linejoin="round"/>`,
    cara: [61.7, 262], mirar: 6, ojos: [61.7, 255.4],
    caras: caras({
      ojoIzq, ojoDer, estilo, feliz,
      bocaPre: [61.7, 274.5], anchoPre: 12,
      sudor: [101, 236], altoSudor: 13,
      festejo: [61.5, 266.5, 21, 15],
    }),
    piesX: cx, sombra: 84, punta: [cx, 202.6],
  };
}

/* ── caño (handy-gota-y-cano.png) ── */
function cano(): Personaje {
  const C = { tubo: '#E0E0E0', tuboTrazo: '#AAAAAA', azul: '#7298FE', azulTrazo: '#4A75EE' };
  const o = 8 * GROSOR.cano, ancho = 82.9;
  // eje del tubo en U invertida: patas en x 60 y 275.5, techo en y 43.1 (ajustado al PNG: más cuadrado que un círculo)
  const xl = 60, xr = 275.5, yt = 43.1, yb = 155, k = 0.608, xc = (xl + xr) / 2;
  const eje = `M${pt([xl, 176])}L${pt([xl, yb])}C${pt([xl, yb - k * (yb - yt)])} ${pt([xc - k * (xc - xl), yt])} ${pt([xc, yt])}`
    + `C${pt([xc + k * (xr - xc), yt])} ${pt([xr, yb - k * (yb - yt)])} ${pt([xr, yb])}L${pt([xr, 340])}`;
  const tubo = `<path d="${eje}" fill="none" stroke="${C.tuboTrazo}" stroke-width="${n(ancho)}"/>`
    + `<path d="${eje}" fill="none" stroke="${C.tubo}" stroke-width="${n(ancho - 2 * o)}"/>`;
  const caja = rect(adentroDe([220, 320, 110.5, 50.5, 4], o), `fill="${C.azul}" stroke="${C.azulTrazo}" stroke-width="${n(o)}"`);
  const pico = rect(adentroDe([3, 136.5, 119, 45.5, 4], o), `fill="${C.azul}" stroke="${C.azulTrazo}" stroke-width="${n(o)}"`);
  const ojoIzq: V2 = [250.5, 290], ojoDer: V2 = [299.6, 290];
  const estilo: EstiloCara = { r: 10.2, brillos: [[-0.47, -0.26, 0.25], [0.02, -0.6, 0.15]], trazo: 2.4 };
  const omega = linea('M267.4 294.6C268.1 300.4 273.9 300.8 275.1 295.3C276.3 300.8 282.1 300.4 282.8 294.6', 2.4);
  return {
    viewBox: { x: 0, y: 0, w: 354, h: 402 },
    trazo: 7, colorMiembros: C.azulTrazo,
    // manos chiquitas y gorditas: una cruz de cuatro lóbulos
    brazos: {
      izq: { hombro: [223.8, 333], muneca: [207.6, 345.4], punta: [203.4, 350], dedos: [[205.2, 339.4], [211.2, 351.6]], mano: 8.4 },
      der: { hombro: [326.7, 333], muneca: [342.9, 345.4], punta: [347.1, 350], dedos: [[345.3, 339.4], [339.3, 351.6]], mano: 8.4 },
    },
    piernas: {
      izq: { x: 239.3, cadera: 360, pie: [224, 386.1, 19.1, 16.1, 5], recoger: 11 },
      der: { x: 309.3, cadera: 360, pie: [305.5, 385.7, 19.1, 15.8, 5.5], recoger: 11 },
    },
    pie: r => rect(r, `fill="${C.azulTrazo}"`),
    cuerpo: tubo + caja,
    delante: `<g class="hd-h-pico" data-goteo="62.5 182">${pico}</g>`,
    cara: [275, 293], mirar: 3.5, ojos: [275, 290],
    caras: caras({
      ojoIzq, ojoDer, estilo, feliz: ojosAbiertos(ojoIzq, ojoDer, estilo) + omega,
      bocaPre: [275, 303], anchoPre: 15,
      sudor: [302, 263], altoSudor: 15,
      festejo: [275, 296, 23, 16],
    }),
    piesX: 274.4, sombra: 128, goteo: [62.5, 182],
  };
}

/* ── engranaje (handy-engranaje.png) ── */
function engranaje(): Personaje {
  const C = { relleno: '#3071FF', trazo: '#034BFD', pie: '#80ADFF' };
  const t = 9.6, o = t * GROSOR.engranaje;
  const cx = 173.45, cy = 150.3;
  // 8 dientes cada 45°, ajustados al borde exterior del PNG: punta r 147.7, valle r 121.8,
  // flanco a v = 33.4 - 0.341·(u - 122.2) del eje del diente; esquinas bien redondeadas como en el dibujo
  const rTip = 147.7 - o / 2, rVal = 121.8 - o / 2, taper = 0.341, sec = Math.hypot(1, taper);
  const vAt = (u: number) => 33.4 - taper * (u - 122.2) - (o / 2) * sec;
  let uB = rVal;
  for (let i = 0; i < 40; i++) uB = Math.sqrt(rVal * rVal - vAt(uB) ** 2);
  const vB = vAt(uB), vT = vAt(rTip);
  const P = (phi: number, u: number, v: number): V2 =>
    [cx + u * Math.cos(phi) - v * Math.sin(phi), cy + u * Math.sin(phi) + v * Math.cos(phi)];
  const pts: V2[] = [], radios: number[] = [];
  for (let k = 0; k < 8; k++) {
    const phi = (k * Math.PI) / 4;
    pts.push(P(phi, uB, -vB), P(phi, rTip, -vT), P(phi, rTip, vT), P(phi, uB, vB), P(phi + Math.PI / 8, rVal, 0));
    radios.push(24, 10, 10, 24, 40);
  }
  const rH = 28.5 + o / 2;
  const agujero = `M${pt([cx + rH, cy])}A${n(rH)} ${n(rH)} 0 1 0 ${pt([cx - rH, cy])}A${n(rH)} ${n(rH)} 0 1 0 ${pt([cx + rH, cy])}Z`;
  const ojoIzq: V2 = [105.5, 81.2], ojoDer: V2 = [242.2, 81.2];
  const estilo: EstiloCara = { r: 21, brillos: [[-0.55, -0.36, 0.19], [-0.19, -0.72, 0.095]], trazo: 7.6 };
  return {
    viewBox: { x: 0, y: 0, w: 338, h: 338.5 },
    trazo: t, colorMiembros: C.trazo,
    brazos: {
      izq: { hombro: [49, 123.5], muneca: [19.8, 88.4], punta: [7, 75.9], dedos: [[27.1, 77.7], [10.7, 98.5]] },
      der: { hombro: [297.6, 121], muneca: [320.4, 88.5], punta: [330.7, 76.9], dedos: [[312.5, 79.8], [329, 96.2]] },
    },
    piernas: {
      izq: { x: 121.3, cadera: 255, pie: [96.2, 306.9, 30, 30, 12.5], recoger: 26 },
      der: { x: 227, cadera: 255, pie: [222.2, 306.8, 29.1, 30.2, 12.5], recoger: 26 },
    },
    pie: (r, lado) => bota(adentroDe(r, t), lado, 8, 2.5, `fill="${C.pie}" stroke="${C.trazo}" stroke-width="${n(t)}" stroke-linejoin="round"`),
    cuerpo: `<path d="${poligonoRedondeado(pts, radios)}${agujero}" fill="${C.relleno}" fill-rule="evenodd" stroke="${C.trazo}" stroke-width="${n(o)}" stroke-linejoin="round"/>`,
    cara: [173.8, 90], mirar: 20, ojos: [173.85, 81.2],
    caras: caras({
      ojoIzq, ojoDer, estilo, feliz: ojosAbiertos(ojoIzq, ojoDer, estilo) + sonrisa([173.2, 94.2], 32.4, 9.4, 7.6),
      bocaPre: [173.5, 99], anchoPre: 34,
      sudor: [276, 50], altoSudor: 32,
      festejo: [173.5, 88, 50, 38],
      cejas: 0.84,
    }),
    piesX: 173.8, sombra: 196,
  };
}

/* ── lamparita (handy-lamparita.png) ── */
function lamparita(): Personaje {
  const C = { relleno: '#F8FFA0', trazo: '#DEDE67', rayo: '#F2F36E', rosca: '#CECECE', roscaTrazo: '#999999' };
  const o = 6.2 * GROSOR.lamparita;
  // foco: círculo (101.6, 132.35) r 90.85 por fuera + cuello x 52.3..150.9 hasta y 252.5, con filetes en la unión
  const cx = 101.6, cy = 132.35, R = 90.85 - o / 2;
  const xl = 52.3 + o / 2, xr = 150.9 - o / 2, fondo = 252.5 - o / 2, rEsq = 7, rf = 6;
  const filete = (x: number, s: number): { linea: V2; circ: V2 } => {
    const fx = x - s * rf, dx = fx - cx, dy = Math.sqrt((R + rf) ** 2 - dx * dx), fy = cy + dy;
    const u: V2 = [dx / (R + rf), dy / (R + rf)];
    return { linea: [x, fy], circ: [cx + u[0] * R, cy + u[1] * R] };
  };
  const fi = filete(xl, 1), fd = filete(xr, -1);
  const foco = `M${pt(fi.linea)}A${rf} ${rf} 0 0 0 ${pt(fi.circ)}A${n(R)} ${n(R)} 0 1 1 ${pt(fd.circ)}A${rf} ${rf} 0 0 0 ${pt(fd.linea)}`
    + `L${pt([xr, fondo - rEsq])}A${rEsq} ${rEsq} 0 0 1 ${pt([xr - rEsq, fondo])}L${pt([xl + rEsq, fondo])}A${rEsq} ${rEsq} 0 0 1 ${pt([xl, fondo - rEsq])}Z`;
  // rosca: arriba casi recta, abajo con esquinas muy redondeadas, y dos vueltas de rosca
  const rosca = poligonoRedondeado([[53.9, 259], [150.7, 259], [150.7, 302], [53.9, 302]], [2, 2, 30, 30]);
  const cuerpo = `<path d="${foco}" fill="${C.relleno}" stroke="${C.trazo}" stroke-width="${n(o)}" stroke-linejoin="round"/>`
    + `<path d="${rosca}" fill="${C.rosca}" stroke="${C.roscaTrazo}" stroke-width="6" stroke-linejoin="round"/>`
    + linea('M58.5 284.9L147.5 263.5M77 300L148 283.7', 6, C.roscaTrazo);
  const ojoIzq: V2 = [52.6, 126.7], ojoDer: V2 = [145.6, 129.7];
  const estilo: EstiloCara = { r: 13.1, brillos: [[-0.62, -0.43, 0.16], [-0.34, -0.73, 0.075]], trazo: 3.6 };
  return {
    viewBox: { x: 0, y: 0, w: 202, h: 343.5 },
    trazo: 6.3, colorMiembros: C.trazo, colorPiernas: C.roscaTrazo,
    brazos: {
      // los brazos salen del cuello, justo debajo del foco: si suben mucho la mano queda detrás del vidrio
      izq: { hombro: [56.5, 223], muneca: [18.6, 241.5], punta: [5.3, 247.8], dedos: [[12.4, 233.6], [19.2, 251.4]], arriba: -152, saludo: -170, amp: 11 },
      der: { hombro: [147, 222.4], muneca: [182.6, 204.4], punta: [196.5, 198], dedos: [[182.6, 194.3], [189.1, 211.9]], arriba: -31, saludo: -20, amp: 11 },
    },
    piernas: {
      izq: { x: 69.9, cadera: 296, pie: [58.6, 330, 14.2, 13.4, 6], recoger: 13 },
      der: { x: 137.2, cadera: 296, pie: [134, 330.1, 14.9, 13.6, 6.5], recoger: 13 },
    },
    pie: r => rect(r, `fill="${C.roscaTrazo}"`),
    atras: `<g class="hd-h-rayos" data-origen="${pt([cx, cy])}">`
      + linea('M100.25 6.6L100.25 32.2M38.9 23.9L51.7 42.1M160.4 23.9L149.6 42.2', 6.5, C.rayo) + '</g>',
    cuerpo,
    cara: [99, 133], mirar: 14, ojos: [99.1, 128.2],
    caras: caras({
      ojoIzq, ojoDer, estilo, feliz: ojosAbiertos(ojoIzq, ojoDer, estilo) + bocaDientes(99, 135.4, 24, 9.2, 3.5, { lado: 0.12, fondo: 0.2, alto: 0.5 }),
      bocaPre: [99, 145], anchoPre: 21,
      sudor: [172, 98], altoSudor: 20,
      festejo: [99, 136, 30, 22],
    }),
    piesX: 103.6, sombra: 118, rayos: [cx, cy],
  };
}

/* ── llave (handy-llave.png) ── */
function llave(): Personaje {
  const C = { relleno: '#BCBCBC', trazo: '#7D7D7D', brillo: '#9A9A9A', ojal: '#CDCDCD', pieBrillo: '#B9B9B9' };
  const o = 13.3 * GROSOR.llave;
  const centro: V2 = [362, 352.25], R = 160.6 - o / 2;
  // borde exterior de la paleta, en sentido horario: desde adentro de la cabeza (abajo), la punta y los dientes
  const borde: V2[] = [[240, 308.5], [3.1, 85], [3.1, 10.8], [74.5, 1.6], [131, 58.1], [126.5, 90], [163, 89.4], [160.9, 123.6],
    [197.8, 120.9], [234, 151.6], [229, 187.1], [264, 181.9], [295, 205.1], [350, 187.6]];
  const eje = desplazar(borde, o / 2);
  const abajo = cruceCirculo(eje[0], eje[1], centro, R), arriba = cruceCirculo(eje[eje.length - 2], eje[eje.length - 1], centro, R);
  const d = `M${pt(abajo)}` + eje.slice(1, -1).map(p => 'L' + pt(p)).join('') + `L${pt(arriba)}A${n(R)} ${n(R)} 0 1 1 ${pt(abajo)}Z`;
  const cuerpo = `<path d="${d}" fill="${C.relleno}" stroke="${C.trazo}" stroke-width="${n(o)}" stroke-linejoin="round"/>`
    + linea('M63 84L229 242.5', 13, C.brillo)
    + `<ellipse cx="428.5" cy="417.75" rx="31" ry="22.6" transform="rotate(-42.7 428.5 417.75)" fill="${C.ojal}" stroke="${C.trazo}" stroke-width="${n(7.5 * GROSOR.llave)}"/>`;
  const ojoIzq: V2 = [282.5, 327], ojoDer: V2 = [440, 328];
  const estilo: EstiloCara = { r: 23, brillos: [[-0.5, -0.36, 0.2], [-0.12, -0.7, 0.1]], trazo: 12 };
  const feliz = linea('M262 312L303 327L262 342M461 313L419 328L461 343', 12.5)
    + sonrisa([362.5, 348.2], 38, 14.5, 12);
  return {
    viewBox: { x: 0, y: 0, w: 581, h: 545.5 },
    trazo: 13.8, colorMiembros: C.trazo,
    brazos: {
      // la cabeza es redonda: levantados de más, los brazos se esconden detrás de ella
      izq: { hombro: [214, 392.2], muneca: [186.2, 421.8], punta: [161.4, 444.3], dedos: [[153.4, 410.2], [193.7, 446.9]], arriba: -150, saludo: -162, amp: 14 },
      der: { hombro: [513, 347.2], muneca: [544.6, 308.7], punta: [568.3, 287.8], dedos: [[535.4, 284.1], [571.4, 320.4]], arriba: -60, saludo: -44, amp: 14 },
    },
    piernas: {
      izq: { x: 283.2, cadera: 470, pie: [247.3, 514.1, 44.1, 31, 13], recoger: 30 },
      der: { x: 441.4, cadera: 470, pie: [433.9, 514.1, 42.9, 30.7, 11], recoger: 30 },
    },
    pie: (r, lado) => bota(r, lado, 15.5, 6, `fill="${C.trazo}"`)
      + rect([r[0] + r[2] / 2 - 6.5, r[1] + 12, 13, 4.8, 2.4], `fill="${C.pieBrillo}"`),
    cuerpo,
    cara: [361, 335], mirar: 22, ojos: [361.2, 327.5],
    caras: caras({
      ojoIzq, ojoDer, estilo, feliz,
      bocaPre: [362, 372], anchoPre: 52,
      sudor: [486, 268], altoSudor: 42,
      festejo: [362, 350, 66, 48],
    }),
    piesX: 362.3, sombra: 292,
  };
}

/** el SVG de cada uno, armado una sola vez */
interface Dibujo {
  p: Personaje;
  piernas: string;
  brazos: string;
}

function dibujar(p: Personaje): Dibujo {
  const lados = ['izq', 'der'] as const;
  const brazos = p.brazos ? lados.map(l => brazo(l, p.brazos![l], p.colorMiembros, p.trazo)).join('') : '';
  const piernas = p.piernas && p.pie
    ? lados.map(l => pierna(l, p.piernas![l], p.colorPiernas ?? p.colorMiembros, p.trazo, p.pie!(p.piernas![l].pie, l))).join('') : '';
  return { p, piernas, brazos };
}

const DIBUJOS: Record<HandyTipo, Dibujo> = {
  gota: dibujar(gota()),
  cano: dibujar(cano()),
  engranaje: dibujar(engranaje()),
  lamparita: dibujar(lamparita()),
  llave: dibujar(llave()),
};

/* ───────────────────────────── fila de handys-grupo.png ───────────────────────────── */

/** Cómo aparece cada uno en handys-grupo.png: su escala respecto del PNG suelto y el punto medio entre los ojos en los
    dos dibujos. De ahí salen el tamaño relativo y la posición de cada wrapper en la fila. */
const EN_GRUPO: Record<HandyTipo, { escala: number; grupo: V2; suelto: V2 }> = {
  gota: { escala: 1.223, grupo: [76.6, 306.05], suelto: [61.7, 254.8] },
  cano: { escala: 1.2, grupo: [345.6, 348.5], suelto: [275.4, 290.5] },
  engranaje: { escala: 0.531, grupo: [511.85, 345.35], suelto: [174.15, 81.55] },
  lamparita: { escala: 1.25, grupo: [713.65, 218.8], suelto: [99.5, 128.3] },
  llave: { escala: 0.282, grupo: [895.3, 430.65], suelto: [361, 327.9] },
};

const P = (v: V2): Punto => ({ x: v[0], y: v[1] });

function infoDe(tipo: HandyTipo): HandyInfo {
  const p = DIBUJOS[tipo].p, vb = p.viewBox;
  const g = EN_GRUPO[tipo], altoCano = DIBUJOS.cano.p.viewBox.h * EN_GRUPO.cano.escala;
  const brazos: HandyInfo['brazos'] = {}, piernas: HandyInfo['piernas'] = {};
  for (const l of ['izq', 'der'] as const) {
    const b = p.brazos?.[l], q = p.piernas?.[l];
    if (b) {
      brazos[l] = {
        hombro: P(b.hombro), angulo: anguloDe(b),
        arriba: b.arriba ?? ARRIBA[l], saludo: b.saludo ?? SALUDO[l], amp: b.amp ?? AMPLITUD,
      };
    }
    if (q) piernas[l] = { cadera: { x: q.x, y: q.cadera }, recoger: q.recoger };
  }
  return {
    viewBox: { ...vb },
    aspecto: vb.w / vb.h,
    alturaGrupo: (vb.h * g.escala) / altoCano,
    grupo: {
      x: (g.grupo[0] - (g.suelto[0] - vb.x) * g.escala) / altoCano,
      y: (g.grupo[1] - (g.suelto[1] - vb.y) * g.escala) / altoCano,
    },
    pies: (p.piesX - vb.x) / vb.w,
    sombra: p.sombra,
    cara: P(p.cara),
    mirar: p.mirar,
    ojos: P(p.ojos),
    brazos,
    piernas,
    ...(p.goteo ? { goteo: P(p.goteo) } : {}),
    ...(p.punta ? { punta: P(p.punta) } : {}),
    ...(p.rayos ? { rayos: P(p.rayos) } : {}),
  };
}

/** Datos de cada personaje (coordenadas en unidades del viewBox; puntoHandy las pasa a px del wrapper). */
export const HANDY_INFO: Record<HandyTipo, HandyInfo> = {
  gota: infoDe('gota'),
  cano: infoDe('cano'),
  engranaje: infoDe('engranaje'),
  lamparita: infoDe('lamparita'),
  llave: infoDe('llave'),
};

/* ───────────────────────────── API ───────────────────────────── */

/** px del wrapper por unidad del viewBox, para un alto dado */
export function escalaHandy(tipo: HandyTipo, altura: number): number {
  return altura / HANDY_INFO[tipo].viewBox.h;
}

/** ancho del wrapper para un alto dado */
export function anchoHandy(tipo: HandyTipo, altura: number): number {
  return altura * HANDY_INFO[tipo].aspecto;
}

/** convierte un punto del viewBox (p. ej. HANDY_INFO[tipo].ojos) a px dentro del wrapper (origen arriba a la izquierda) */
export function puntoHandy(tipo: HandyTipo, altura: number, p: Punto): Punto {
  const vb = HANDY_INFO[tipo].viewBox, s = altura / vb.h;
  return { x: (p.x - vb.x) * s, y: (p.y - vb.y) * s };
}

/** caño: punto de goteo (debajo de la tuerca, al centro del tubo) en px del wrapper, para un caño de alto altura */
export function puntoGoteo(altura: number): Punto {
  return puntoHandy('cano', altura, HANDY_INFO.cano.goteo ?? { x: 62.5, y: 182 });
}

/** centro de los pies en px del wrapper (abajo de todo): donde va el centro de la sombra */
export function piesHandy(tipo: HandyTipo, altura: number): Punto {
  return { x: altura * HANDY_INFO[tipo].aspecto * HANDY_INFO[tipo].pies, y: altura };
}

/** Sombra chata en el piso (una elipse; opcional, como en handys-grupo.png). Es un hermano del wrapper que la escena
    ubica con left/top en el centro de los pies (piesHandy): el div se centra solo con márgenes negativos.
    Los saltos la achican si se la pasan en la opción `sombra` (handys-anim.ts). */
export function sombraHandy(tipo: HandyTipo, altura: number, { className = '' }: { className?: string } = {}): string {
  const w = HANDY_INFO[tipo].sombra * escalaHandy(tipo, altura), h = w * 0.14;
  return `<div class="hd-handy-sombra${className ? ' ' + esc(className) : ''}" data-handy="${tipo}" `
    + `style="width:${n(w)}px;height:${n(h)}px;margin:${n(-h / 2)}px 0 0 ${n(-w / 2)}px"></div>`;
}

/** Gotita de agua sin cara (los mismos colores que la Gota), para las gotas que crecen y caen del pico en la escena 1.
    La punta queda arriba al centro: con transform-origin 50% 0 (ya puesto) crece colgada del punto de goteo. */
export function gotita(altura: number, { className = '' }: { className?: string } = {}): string {
  const g = DIBUJOS.gota.p, vb = HANDY_INFO.gota.viewBox;
  // misma silueta que la Gota, recortada a su caja (de la punta al fondo)
  const top = HANDY_INFO.gota.punta?.y ?? 202.6, x0 = 17.3, w = 108.1 - x0, h = vb.y + vb.h - top;
  return `<svg class="hd-gotita${className ? ' ' + esc(className) : ''}" viewBox="${n(x0)} ${n(top)} ${n(w)} ${n(h)}" `
    + `width="${n((altura * w) / h)}" height="${n(altura)}" overflow="visible" aria-hidden="true" focusable="false">${g.cuerpo}</svg>`;
}

export interface HandyEnFila {
  tipo: HandyTipo;
  /** alto y ancho del wrapper en px */
  altura: number;
  ancho: number;
  /** esquina superior izquierda del wrapper, relativa a la caja de la fila */
  x: number;
  y: number;
}

/** Los cinco ordenados y medidos como en handys-grupo.png, para un caño de alto alturaCano (px).
    Devuelve la caja de la fila y la posición de cada wrapper dentro de ella. La gota queda flotando debajo del pico, como
    en el dibujo; para apoyarla en el piso usá y = alto - altura. */
export function filaHandys(alturaCano: number): { ancho: number; alto: number; handys: HandyEnFila[] } {
  const items = HANDY_TIPOS.map(tipo => {
    const i = HANDY_INFO[tipo], altura = alturaCano * i.alturaGrupo;
    return { tipo, altura, ancho: altura * i.aspecto, x: i.grupo.x * alturaCano, y: i.grupo.y * alturaCano };
  });
  const x0 = Math.min(...items.map(h => h.x)), y0 = Math.min(...items.map(h => h.y));
  const x1 = Math.max(...items.map(h => h.x + h.ancho)), y1 = Math.max(...items.map(h => h.y + h.altura));
  return { ancho: x1 - x0, alto: y1 - y0, handys: items.map(h => ({ ...h, x: h.x - x0, y: h.y - y0 })) };
}

/** Un Handy como HTML: <div class="hd-handy hd-handy--<tipo>"> con el SVG por partes adentro. */
export function handy(tipo: HandyTipo, { altura = 240, humor = 'feliz', className = '', id }: HandyOptions = {}): string {
  const { p, piernas, brazos } = DIBUJOS[tipo], info = HANDY_INFO[tipo], vb = p.viewBox;
  const capas = HANDY_HUMORES.map(h =>
    `<g class="hd-h-humor" data-humor="${h}"${h === humor ? '' : ' style="opacity:0"'}>${p.caras[h]}</g>`).join('');
  const style = `width:${n(altura * info.aspecto)}px;height:${n(altura)}px;transform-origin:${n(info.pies * 100)}% 100%`;
  return `<div class="hd-handy hd-handy--${tipo}${className ? ' ' + esc(className) : ''}"${id ? ` id="${esc(id)}"` : ''} data-handy="${tipo}" style="${style}">`
    + `<svg class="hd-h-svg" viewBox="${n(vb.x)} ${n(vb.y)} ${n(vb.w)} ${n(vb.h)}" overflow="visible" aria-hidden="true" focusable="false">`
    + piernas + brazos + (p.atras ?? '')
    + `<g class="hd-h-cuerpo">${p.cuerpo}</g>`
    + (p.delante ?? '')
    + `<g class="hd-h-cara" data-origen="${pt(p.cara)}" data-mirar="${n(p.mirar)}">${capas}</g>`
    + '</svg></div>';
}
