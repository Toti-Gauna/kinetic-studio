/* Mapa ilustrado de la ciudad para el seguimiento, con aire de Mar del Plata: grilla de manzanas con edificación en el
   borde y pulmón en el medio, una plaza, una avenida y una diagonal, la costa con la avenida costera, la playa, una
   escollera y el mar. Paleta apagada de app de mapas; sin direcciones reales ni nombres de calles.
   mapView({ ancho = 414, alto = 560, ruta = true, estado = 'en-camino', especialista = { iniciales: 'MR' }, className })
     → string <div class="hd-mapa" data-estado="…">.
   Capas: .hd-mapa-fondo (svg estático) + .hd-mapa-capa (HTML encima: lo que se anima, sin repintar el svg).
   Coordenadas: px del mapa de 414×560 (MAPA). Con otro ancho/alto el mapa se recorta/extiende centrado: sumar
   (ancho − 414) / 2 y (alto − 560) / 2 a las coordenadas de MAPA_RUTA / MAPA_CASA.
   Estados (solo cambian opacidades y la posición del especialista; la escena los anima):
     'buscando'  → radar visible alrededor de la casa; ruta y especialista con opacity 0.
     'en-camino' → el especialista al 45 % del recorrido (T_EN_CAMINO, transform x/y) y visibles solo los puntos que le
                   faltan (los ya recorridos, con opacity 0).
     'llego'     → especialista al final de la ruta, al lado de la casa; ruta y radar con opacity 0.
   Ganchos:
     .hd-ruta-punto[data-i][data-t] — puntos de la ruta (data-t = fracción 0..1 del recorrido), en orden del especialista
       a la casa: revelarlos con opacity/scale (nunca con trazo animado).
     .hd-pin-casa — pin de la casa (la punta está en MAPA_CASA; pop con scale y transformOrigin '50% 100%').
     .hd-pin-especialista — círculo con las iniciales; su left/top es SIEMPRE el inicio de la ruta y se mueve con x/y:
       gsap.set(pin, rutaDelta(t)) o moverPorRuta(tl, pin, at, …).
     .hd-radar[data-i="0|1|2"] — anillos del radar, centrados en la casa: animar scale (≈ .15 → 1) y opacity (→ 0).
     .hd-mapa-fondo — el svg (quieto). */
import '../css/base.css';
import '../css/chat.css';
import { icon } from '../icons.ts';
import { avatar } from './Avatar.ts';

export type EstadoSeguimiento = 'buscando' | 'en-camino' | 'llego';

export interface PuntoMapa { x: number; y: number }

export interface MapViewProps {
  ancho?: number;
  alto?: number;
  /** dibujar los puntos de la ruta (default true) */
  ruta?: boolean;
  estado?: EstadoSeguimiento;
  /** iniciales y color del especialista (default MR, naranja) */
  especialista?: { iniciales: string; color?: string };
  className?: string;
}

/** Tamaño de diseño del mapa. */
export const MAPA = { w: 414, h: 560 } as const;

/** Ruta del especialista hasta la casa (vértices, px del mapa de 414×560): por la calle, después la diagonal. */
export const MAPA_RUTA: readonly PuntoMapa[] = [
  { x: 28, y: 410 },
  { x: 104, y: 410 },
  { x: 256, y: 258 },
  { x: 266, y: 258 },
];

/** Punta del pin de la casa (centro del radar). */
export const MAPA_CASA: PuntoMapa = { x: 302, y: 252 };

/** Color por defecto del especialista en el mapa (el de Martín R. en pantallas/usuario-chat.ts). */
const COLOR_ESPECIALISTA = '#EE7A30';

/** Fracción del recorrido donde está el especialista en el estado estático 'en-camino'. */
export const T_EN_CAMINO = 0.45;

// ── geometría de la ruta ─────────────────────────────────────────────────
const TRAMOS = MAPA_RUTA.slice(1).map((p, i) => Math.hypot(p.x - MAPA_RUTA[i].x, p.y - MAPA_RUTA[i].y));
/** largo total de la ruta en px */
export const RUTA_LARGO = TRAMOS.reduce((a, b) => a + b, 0);
/** fracción del recorrido en cada vértice: [0, …, 1] */
const VERTICES_T = TRAMOS.reduce<number[]>((acc, l) => [...acc, acc[acc.length - 1] + l / RUTA_LARGO], [0]);

/** Punto de la ruta a la fracción t (0 = especialista, 1 = casa), en px del mapa. */
export function rutaPunto(t: number): PuntoMapa {
  const k = Math.min(1, Math.max(0, t));
  for (let i = 0; i < TRAMOS.length; i++) {
    if (k <= VERTICES_T[i + 1] || i === TRAMOS.length - 1) {
      const f = TRAMOS[i] === 0 ? 0 : (k - VERTICES_T[i]) / (VERTICES_T[i + 1] - VERTICES_T[i]);
      const a = MAPA_RUTA[i], b = MAPA_RUTA[i + 1];
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
  }
  return { ...MAPA_RUTA[MAPA_RUTA.length - 1] };
}

/** x/y que hay que darle a .hd-pin-especialista para ponerlo a la fracción t (relativo al inicio de la ruta). */
export function rutaDelta(t: number): PuntoMapa {
  const p = rutaPunto(t);
  return { x: Math.round((p.x - MAPA_RUTA[0].x) * 100) / 100, y: Math.round((p.y - MAPA_RUTA[0].y) * 100) / 100 };
}

/** Separación entre puntos de la ruta (px). */
const PASO_PUNTOS = 13;
/** Puntos de la ruta: posición y fracción del recorrido (los mismos que .hd-ruta-punto[data-i]). */
export const RUTA_PUNTOS: readonly (PuntoMapa & { t: number })[] = (() => {
  const n = Math.round(RUTA_LARGO / PASO_PUNTOS);
  return Array.from({ length: n + 1 }, (_, i) => ({ ...rutaPunto(i / n), t: i / n }));
})();

/** Mueve el pin del especialista por la ruta de `desde` a `hasta` (fracciones), a velocidad pareja con un ease global.
    Agrega el tween en `at` y devuelve su duración. El pin tiene que estar ya en rutaDelta(desde). */
export function moverPorRuta(
  tl: GSAPTimeline, el: Element | string, at: number,
  { desde = 0, hasta = 1, dur = 3, ease = 'power1.inOut' }: { desde?: number; hasta?: number; dur?: number; ease?: string } = {},
): number {
  const cortes = [...VERTICES_T.filter(t => t > desde && t < hasta), hasta];
  const keyframes: Record<string, unknown> = { easeEach: 'none' };
  for (const t of cortes) {
    const pct = Math.round(((t - desde) / (hasta - desde)) * 1000) / 10;
    keyframes[`${pct}%`] = rutaDelta(t);
  }
  tl.to(el, { keyframes, duration: dur, ease }, at);
  return dur;
}

// ── dibujo del fondo ─────────────────────────────────────────────────────
const PASO = 76;          // de eje a eje de calle
const CALLE = 12;         // ancho de calle
const X0 = 28, Y0 = 30;   // primer eje de calle
const AV_Y = 334;         // avenida horizontal
const DIAG = 514;         // diagonal: x + y = 514 (pasa por las esquinas)
const PLAZA = { i: 1, j: 1 };

/** costa de norte a sur (el mar queda a la derecha/arriba) */
const COSTA: readonly PuntoMapa[] = [
  { x: 150, y: -260 }, { x: 196, y: -150 }, { x: 236, y: -50 }, { x: 276, y: 24 }, { x: 314, y: 96 }, { x: 342, y: 168 },
  { x: 366, y: 240 }, { x: 392, y: 320 }, { x: 428, y: 410 }, { x: 472, y: 500 }, { x: 526, y: 600 }, { x: 590, y: 720 },
  { x: 660, y: 840 },
];

const C = {
  calle: '#FFFFFF', manzana: '#ECEAE3', borde: '#D9D6CC', edificio: '#E2DFD5', edificioBorde: '#D3CFC3',
  plaza: '#CDE6BD', plazaBorde: '#B7D7A2', sendero: '#E4F1D9', arbol: '#B2D69C',
  avenida: '#FBE6A9', avenidaBorde: '#E2C67E', mar: '#A9CFEB', marClaro: '#BCDAF1', playa: '#F1E4C3',
  escollera: '#D6D0C3', escolleraBorde: '#BAB2A3', etiquetaMar: '#5F8DB5',
} as const;

/** pseudoazar determinístico en [0, 1) */
function azar(a: number, b: number, c: number): number {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const f1 = (n: number) => Math.round(n * 10) / 10;
const rect = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}z`;

/** Catmull-Rom → muestras densas de la costa */
function costaMuestras(): PuntoMapa[] {
  const out: PuntoMapa[] = [];
  for (let i = 0; i < COSTA.length - 1; i++) {
    const p0 = COSTA[Math.max(0, i - 1)], p1 = COSTA[i], p2 = COSTA[i + 1], p3 = COSTA[Math.min(COSTA.length - 1, i + 2)];
    for (let s = 0; s < 8; s++) {
      const t = s / 8, t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push({ ...COSTA[COSTA.length - 1] });
  return out;
}

/** la costa corrida `d` px hacia el mar (d < 0: hacia tierra) */
function costaCorrida(muestras: PuntoMapa[], d: number): PuntoMapa[] {
  return muestras.map((p, i) => {
    const a = muestras[Math.max(0, i - 1)], b = muestras[Math.min(muestras.length - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    // normal hacia el mar: (dy, −dx) apunta al este cuando la costa baja de norte a sur
    return { x: p.x + (dy / l) * d, y: p.y - (dx / l) * d };
  });
}

const linea = (pts: PuntoMapa[]) => 'M' + pts.map(p => `${f1(p.x)} ${f1(p.y)}`).join('L');
/** polígono del lado del mar, cerrado bien lejos */
const ladoMar = (pts: PuntoMapa[]) => linea(pts) + 'L1400 1400L1400 -1400L-400 -1400Z';

/** distancia con signo a la costa (> 0: mar) aproximada con la normal de la muestra más cercana */
function ladoDeCosta(muestras: PuntoMapa[], x: number, y: number): number {
  let best = Infinity, i0 = 0;
  muestras.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < best) { best = d; i0 = i; } });
  const a = muestras[Math.max(0, i0 - 1)], b = muestras[Math.min(muestras.length - 1, i0 + 1)], p = muestras[i0];
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
  return (x - p.x) * (dy / l) - (y - p.y) * (dx / l);
}

function fondoSvg(ancho: number, alto: number): string {
  const ox = (ancho - MAPA.w) / 2, oy = (alto - MAPA.h) / 2;
  const vx0 = -ox, vy0 = -oy, vx1 = vx0 + ancho, vy1 = vy0 + alto;
  const costa = costaMuestras();

  // manzanas y edificación (un solo path cada una)
  let manzanas = '', edificios = '', plaza = '';
  const i0 = Math.floor((vx0 - X0) / PASO) - 1, i1 = Math.ceil((vx1 - X0) / PASO);
  const j0 = Math.floor((vy0 - Y0) / PASO) - 1, j1 = Math.ceil((vy1 - Y0) / PASO);
  const m = CALLE / 2;
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1; j++) {
      const x = X0 + i * PASO + m, y = Y0 + j * PASO + m, w = PASO - CALLE, h = PASO - CALLE;
      if (ladoDeCosta(costa, x + w / 2, y + h / 2) > 70) continue; // en el agua
      if (i === PLAZA.i && j === PLAZA.j) {
        plaza = `<path d="${rect(x, y, w, h)}" fill="${C.plaza}" stroke="${C.plazaBorde}" stroke-width="1"/>`
          + `<path d="M${x + 3} ${y + 3}L${x + w - 3} ${y + h - 3}M${x + w - 3} ${y + 3}L${x + 3} ${y + h - 3}M${x + w / 2} ${y + 2}V${y + h - 2}" stroke="${C.sendero}" stroke-width="3"/>`
          + `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="7" fill="${C.sendero}"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="4" fill="${C.marClaro}"/>`
          + [[11, 22], [22, 11], [44, 11], [53, 24], [11, 44], [24, 53], [42, 54], [54, 42], [32, 20], [20, 36]]
            .map(([a, b], k) => `<circle cx="${x + a}" cy="${y + b}" r="${4 + (k % 3)}" fill="${C.arbol}"/>`).join('');
        continue;
      }
      manzanas += rect(x, y, w, h);
      // lotes sobre la línea municipal: frente arriba y abajo, laterales al medio; pulmón libre en el centro
      const lote = (k: number) => 11 + Math.floor(azar(i, j, k) * 11);
      const fondo = (k: number) => 13 + Math.floor(azar(j, i, k + 7) * 8);
      for (const lado of [0, 1]) {
        let px = x + 1, k = lado * 50;
        while (px < x + w - 4) {
          const lw = Math.min(lote(k), x + w - 1 - px), d = fondo(k);
          edificios += rect(px, lado === 0 ? y + 1 : y + h - 1 - d, lw - 1, d);
          px += lw; k++;
        }
      }
      for (const lado of [0, 1]) {
        let py = y + 22, k = 100 + lado * 50;
        while (py < y + h - 24) {
          const lh = Math.min(lote(k), y + h - 22 - py), d = fondo(k);
          edificios += rect(lado === 0 ? x + 1 : x + w - 1 - d, py, d, lh - 1);
          py += lh; k++;
        }
      }
    }
  }

  // avenida y diagonal (borde + relleno)
  const av = `M${vx0 - 50} ${AV_Y}H${vx1 + 50}`;
  const diag = `M${DIAG - (vy1 + 60)} ${vy1 + 60}L${DIAG - (vy0 - 60)} ${vy0 - 60}`;
  const avenidas = `<path d="${av}M${diag.slice(1)}" stroke="${C.avenidaBorde}" stroke-width="17" fill="none"/>`
    + `<path d="${av}M${diag.slice(1)}" stroke="${C.avenida}" stroke-width="14" fill="none"/>`;

  // costa: playa, mar, agua clara en la orilla, avenida costera y escollera
  const playa = `<path d="${ladoMar(costaCorrida(costa, -19))}" fill="${C.playa}"/>`;
  const mar = `<path d="${ladoMar(costa)}" fill="${C.mar}"/>`
    + `<path d="${linea(costaCorrida(costa, 8))}" fill="none" stroke="${C.marClaro}" stroke-width="16"/>`;
  const costanera = costaCorrida(costa, -27);
  const avCostera = `<path d="${linea(costanera)}" fill="none" stroke="${C.avenidaBorde}" stroke-width="17"/>`
    + `<path d="${linea(costanera)}" fill="none" stroke="${C.avenida}" stroke-width="14"/>`;
  const escollera = `<path d="M318 90 384 58" stroke="${C.escolleraBorde}" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="M318 90 384 58" stroke="${C.escollera}" stroke-width="4.5" stroke-linecap="round"/>`;
  const etiqueta = `<text text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-style="italic" font-weight="600" letter-spacing=".08em" fill="${C.etiquetaMar}">`
    + '<tspan x="374" y="114">Mar</tspan><tspan x="374" y="128">Argentino</tspan></text>';

  return `<svg class="hd-mapa-fondo" viewBox="${f1(vx0)} ${f1(vy0)} ${ancho} ${alto}" width="${ancho}" height="${alto}" aria-hidden="true">`
    + `<rect x="${vx0}" y="${vy0}" width="${ancho}" height="${alto}" fill="${C.calle}"/>`
    + `<path d="${manzanas}" fill="${C.manzana}" stroke="${C.borde}" stroke-width="1"/>`
    + `<path d="${edificios}" fill="${C.edificio}" stroke="${C.edificioBorde}" stroke-width=".6"/>`
    + plaza + avenidas + playa + mar + avCostera + escollera + etiqueta
    + '</svg>';
}

/** Pin de la casa: gota azul con borde blanco y la casita (la punta queda en left/top). */
function pinCasa(): string {
  return '<span class="hd-pin-sombra"></span>'
    + '<svg class="hd-pin-casa-svg" viewBox="0 0 44 56" width="44" height="56" aria-hidden="true">'
    + '<path d="M22 54C22 54 4 34.6 4 21.6a18 18 0 0 1 36 0C40 34.6 22 54 22 54Z" fill="var(--hd-azul)" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>'
    + `<g transform="translate(11.5 11) scale(.875)" color="#FFFFFF">${icon('casa', { size: 24, stroke: 2.4 })}</g>`
    + '</svg>';
}

export function mapView({
  ancho = MAPA.w, alto = MAPA.h, ruta = true, estado = 'en-camino', especialista = { iniciales: 'MR' }, className = '',
}: MapViewProps = {}): string {
  const ox = (ancho - MAPA.w) / 2, oy = (alto - MAPA.h) / 2;
  const at = (p: PuntoMapa) => `left:${f1(p.x + ox)}px;top:${f1(p.y + oy)}px`;
  const cls = ['hd-mapa', className].filter(Boolean).join(' ');

  const tEsp = estado === 'llego' ? 1 : T_EN_CAMINO;
  // en camino se ve solo lo que falta recorrer (los puntos ya pasados quedan en 0, como en las apps de mapas)
  const puntos = ruta
    ? RUTA_PUNTOS.map((p, i) => {
      const ver = estado === 'en-camino' && p.t >= tEsp;
      return `<i class="hd-ruta-punto" data-i="${i}" data-t="${Math.round(p.t * 1000) / 1000}" style="${at(p)}${ver ? '' : ';opacity:0'}"></i>`;
    }).join('')
    : '';

  const verRadar = estado === 'buscando';
  const radar = [0.36, 0.68, 1].map((s, i) =>
    `<span class="hd-radar" data-i="${i}" style="${at(MAPA_CASA)};transform:scale(${s});opacity:${verRadar ? [0.9, 0.55, 0.25][i] : 0}"></span>`).join('');

  const d = rutaDelta(tEsp);
  const esp = `<div class="hd-pin-especialista" style="${at(MAPA_RUTA[0])};transform:translate(${d.x}px,${d.y}px)${estado === 'buscando' ? ';opacity:0' : ''}">`
    + avatar({ iniciales: especialista.iniciales, color: especialista.color ?? COLOR_ESPECIALISTA, tamano: 46, anillo: true })
    + '</div>';

  return `<div class="${cls}" data-estado="${estado}" style="width:${ancho}px;height:${alto}px">`
    + fondoSvg(ancho, alto)
    + `<div class="hd-mapa-capa">${radar}${puntos}<div class="hd-pin-casa" style="${at(MAPA_CASA)}">${pinCasa()}</div>${esp}</div>`
    + '</div>';
}
