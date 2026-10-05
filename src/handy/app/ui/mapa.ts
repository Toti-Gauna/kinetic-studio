/* Mapa de La Perla (Mar del Plata) de la app 2026: manzanas, avenidas con nombre, plaza, la costa con la arena y el
   MAR ARGENTINO, el punto "yo", el radar, un pin de destino y una ruta. Medido en 01/02-e-inicio (la vista de inicio) y
   pensado también para 04-u-buscando, 10-u-seguimiento y 13-e-en-camino (con `vista` se corre o se acerca la ciudad).
   mapa({ estado = 'color', ambos = true, vista, yo, radar, pin, ruta, rutaHasta, className, id }) → <div class="ap-mapa">
     estado  'color' (manzanas #E6E9EE, calles blancas, mar #CFE3F7, arena #F6E2A8, plaza #D7EBCF) ·
             'gris' (todo en grises: el especialista "No disponible").
     ambos   dibuja las DOS capas apiladas (la del estado visible con opacity 1, la otra con 0): prender el mapa es
             cruzarlas con opacity (ver cruzarMapa). Con ambos: false, solo la del estado.
     vista   { x, y, escala } corre la ciudad (px) y la acerca desde (0,0): la vista de inicio es { x: 0, y: 0, escala: 1 }.
     yo      { x, y } punto propio (default 109,5 · 394,5: en La Perla, como en las fotos) o false.
     radar   anillos azules alrededor de `yo` (02-e-inicio: halo r 20,5, brillo r 39,5, anillos r 97,5 y 153).
     pin     { x, y } pin rojo de destino (la punta en x,y) · ruta: puntos [x, y][] de una ruta azul (la dibuja entera).
   El mapa ocupa la pantalla entera (414×896, absoluto en 0,0); el encabezado y las tarjetas van encima.
   Ganchos: .ap-mapa[data-estado] · .ap-mapa-capa[data-capa="gris|color"] (opacity) · .ap-mapa-ciudad (el <g> de la vista) ·
     .ap-mapa-etiqueta[data-etiqueta="colon|luro|plaza|perla|mar"] · .ap-mapa-yo (div centrado en el punto: moverlo con x/y) ·
     .ap-mapa-yo-punto[data-capa] · .ap-radar · .ap-radar-anillo[data-anillo="halo|brillo|1|2"] (pulsar con scale/opacity:
     el origen ya es el centro) · .ap-mapa-pin · .ap-mapa-ruta.
   Ayudas: cruzarMapa(tl, mapa, 'color', at, dur) → duración (cruza las capas, el punto y prende el radar). */
import { cls, idAttr } from './comun.ts';
import '../css/mapa.css';

export type EstadoMapa = 'gris' | 'color';
type P = readonly [number, number];

export interface MapaProps {
  estado?: EstadoMapa;
  ambos?: boolean;
  vista?: { x?: number; y?: number; escala?: number };
  yo?: { x: number; y: number } | false;
  radar?: boolean;
  pin?: { x: number; y: number } | false;
  ruta?: readonly P[];
  className?: string;
  id?: string;
}

/** Comienzo de cada columna y fila de manzanas (px de la vista de inicio). Hay avenidas más anchas (15 px). */
const COLUMNAS = [-103.6, -48.7, 6.2, 61.1, 116.1, 172.8, 226.3, 281.2, 336.1, 391.0, 445.9] as const;
const FILAS = [-14.8, 40.2, 95.4, 150.6, 205.9, 262.7, 315.8, 371.1, 426.0, 480.9, 536.2, 593.0, 646.5, 701.5, 756.5, 811.5, 866.5, 921.5] as const;
const ANCHO = (i: number) => [42.9, 42.9, 42.9, 43.3, 41.4, 41.5, 43.3, 43.3, 43.3, 43.3, 43.3][i] ?? 43.3;
const ALTO = (y: number) => (y === 205.9 || y === 262.7 || y === 536.2 ? 41.5 : 43.3);

/** Plazas: [columna, fila, columnas que ocupa] */
const PLAZAS: readonly [number, number, number][] = [[4, 6, 1], [3, 10, 2]];

/** Borde izquierdo de la arena (la costa), de arriba abajo, medido en 02-e-inicio. */
const COSTA: readonly P[] = [
  [288, -80], [289, 0], [290, 100], [291, 160], [293, 200], [294.3, 220], [298.3, 260], [301.2, 300], [301.6, 320],
  [300.9, 340], [298.7, 360], [294.7, 380], [292.5, 400], [292.5, 420], [293.6, 440], [296.5, 460], [300.5, 480],
  [304.9, 500], [310, 520], [314.7, 540], [319.4, 560], [323.4, 580], [326.7, 600], [328.5, 620], [328.9, 640],
  [328.4, 660], [329.5, 700], [337, 740], [349, 780], [360, 820], [369, 860], [375, 900], [381, 980],
];
const ARENA = 10;

/** Olas: grupos de rayitas blancas sobre el mar [x, y] (la primera rayita). */
const OLAS: readonly P[] = [[346, 312], [366, 468], [372, 626]];

const COLORES: Record<EstadoMapa, Record<string, string>> = {
  color: { calle: '#FFFFFF', manzana: '#E6E9EE', plaza: '#D7EBCF', arena: '#F6E2A8', mar: '#CFE3F7', ola: '#FFFFFF',
    // barrio: queda debajo del tinte del radar; así se ve #ACB6CD como en 02-e-inicio
    avenida: '#8E8E8E', plazaTexto: '#5A8B63', barrio: '#B5BBCA', marTexto: '#6B90C4' },
  gris: { calle: '#F5F5F5', manzana: '#E2E2E2', plaza: '#E2E2E2', arena: '#DCDCDC', mar: '#DADADA', ola: '#F7F7F7',
    avenida: '#8E8E8E', plazaTexto: '#8C8C8C', barrio: '#BABABA', marTexto: '#909090' },
};

const n = (v: number) => Math.round(v * 10) / 10;

/** Curva suave (Catmull-Rom → Bézier) por los puntos. */
function curva(p: readonly P[], dx = 0): string {
  let d = `M${n(p[0][0] + dx)} ${n(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
    const c1: P = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2: P = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += `C${n(c1[0] + dx)} ${n(c1[1])} ${n(c2[0] + dx)} ${n(c2[1])} ${n(c[0] + dx)} ${n(c[1])}`;
  }
  return d;
}

function capa(estado: EstadoMapa, visible: boolean, vista: Required<NonNullable<MapaProps['vista']>>): string {
  const c = COLORES[estado];
  const plazas = new Set<string>();
  PLAZAS.forEach(([ci, fi, k]) => { for (let j = 0; j < k; j++) plazas.add(`${ci + j},${fi}`); });
  let manzanas = '';
  FILAS.forEach((y, fi) => COLUMNAS.forEach((x, ci) => {
    if (plazas.has(`${ci},${fi}`)) return;
    manzanas += `<rect x="${x}" y="${y}" width="${ANCHO(ci)}" height="${ALTO(y)}" rx="7"/>`;
  }));
  const verdes = PLAZAS.map(([ci, fi, k]) => {
    const x = COLUMNAS[ci], w = COLUMNAS[ci + k - 1] + ANCHO(ci + k - 1) - x;
    return `<rect x="${x}" y="${FILAS[fi]}" width="${n(w)}" height="${ALTO(FILAS[fi])}" rx="${k > 1 ? 3 : 7}"/>`;
  }).join('');
  const ult = COSTA[COSTA.length - 1], pri = COSTA[0];
  const cierre = (dx: number) => `${curva(COSTA, dx)}L${700} ${ult[1]}L700 ${pri[1]}Z`;
  const olas = OLAS.map(([x, y]) => [0, 1, 2, 3].map(i => {
    const ox = x + i * 14, oy = y + (i % 2 ? 3 : 0);
    return `<path d="M${ox} ${oy}q3.5 ${i % 2 ? 2.6 : -2.6} 7 0"/>`;
  }).join('')).join('');
  const t = `translate(${vista.x} ${vista.y}) scale(${vista.escala})`;
  return `<svg class="ap-mapa-capa" data-capa="${estado}" viewBox="0 0 414 896" width="414" height="896" style="opacity:${visible ? 1 : 0}" aria-hidden="true">`
    + `<rect width="414" height="896" fill="${c.calle}"/>`
    + `<g class="ap-mapa-ciudad" transform="${t}">`
    + `<g fill="${c.manzana}">${manzanas}</g><g fill="${c.plaza}">${verdes}</g>`
    + `<path d="${cierre(0)}" fill="${c.arena}"/><path d="${cierre(ARENA)}" fill="${c.mar}"/>`
    + `<g fill="none" stroke="${c.ola}" stroke-width="2.2" stroke-linecap="round">${olas}</g>`
    + `<g class="ap-mapa-textos">`
    + `<text class="ap-mapa-etiqueta" data-etiqueta="colon" x="12" y="250.3" fill="${c.avenida}">Av. Colón</text>`
    + `<text class="ap-mapa-etiqueta" data-etiqueta="luro" x="12" y="580.6" fill="${c.avenida}">Av. Luro</text>`
    + `<text class="ap-mapa-etiqueta" data-etiqueta="plaza" x="131.3" y="342" text-anchor="middle" fill="${c.plazaTexto}">Plaza</text>`
    + `<text class="ap-mapa-etiqueta" data-etiqueta="perla" x="46.4" y="434" fill="${c.barrio}">LA PERLA</text>`
    + `<text class="ap-mapa-etiqueta" data-etiqueta="mar" x="0" y="0" transform="translate(335.6 399.4) rotate(78.9)" fill="${c.marTexto}">MAR ARGENTINO</text>`
    + '</g></g></svg>';
}

/** Punto "yo" de la vista de inicio (02-e-inicio). */
export const YO_INICIO = { x: 109.5, y: 394.5 } as const;

export function mapa({
  estado = 'color', ambos = true, vista = {}, yo = YO_INICIO, radar = false, pin = false, ruta, className = '', id,
}: MapaProps = {}): string {
  const v = { x: vista.x ?? 0, y: vista.y ?? 0, escala: vista.escala ?? 1 };
  const capas = (ambos || estado === 'gris' ? capa('gris', estado === 'gris', v) : '')
    + (ambos || estado === 'color' ? capa('color', estado === 'color', v) : '');
  const rutaSvg = ruta && ruta.length > 1
    ? `<svg class="ap-mapa-ruta" viewBox="0 0 414 896" width="414" height="896" aria-hidden="true"><path d="M${ruta.map(p => `${n(p[0])} ${n(p[1])}`).join('L')}" fill="none" stroke="#1F57A8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : '';
  const radarHtml = yo && (radar || ambos)
    ? `<span class="ap-radar" style="left:${yo.x}px;top:${yo.y}px;opacity:${radar ? 1 : 0}">`
      + ['2', '1', 'brillo', 'halo'].map(a => `<span class="ap-radar-anillo" data-anillo="${a}"></span>`).join('')
      + '</span>'
    : '';
  const yoHtml = yo
    ? `<span class="ap-mapa-yo" style="left:${yo.x}px;top:${yo.y}px">`
      + (ambos || estado === 'gris' ? `<span class="ap-mapa-yo-punto" data-capa="gris" style="opacity:${estado === 'gris' ? 1 : 0}"></span>` : '')
      + (ambos || estado === 'color' ? `<span class="ap-mapa-yo-punto" data-capa="color" style="opacity:${estado === 'color' ? 1 : 0}"></span>` : '')
      + '</span>'
    : '';
  const pinHtml = pin
    ? `<span class="ap-mapa-pin" style="left:${pin.x}px;top:${pin.y}px"><svg viewBox="0 0 28 36" width="28" height="36" aria-hidden="true">`
      + '<path d="M14 35C8 27.5 1.5 21.6 1.5 13.8a12.5 12.5 0 0 1 25 0C26.5 21.6 20 27.5 14 35z" fill="#E5322D" stroke="#FFFFFF" stroke-width="2.5"/>'
      + '<circle cx="14" cy="13.6" r="4.6" fill="#FFFFFF"/></svg></span>'
    : '';
  return `<div class="${cls('ap-mapa', className)}" data-estado="${estado}"${idAttr(id)}>`
    + capas + rutaSvg + radarHtml + yoHtml + pinHtml + '</div>';
}

/** Cruza el mapa al estado pedido: capas, punto "yo" y radar (solo opacity). Devuelve la duración. */
export function cruzarMapa(tl: GSAPTimeline, el: Element, a: EstadoMapa, at: number, dur = 0.5): number {
  for (const e of ['gris', 'color'] as const) {
    tl.to(el.querySelectorAll(`.ap-mapa-capa[data-capa="${e}"], .ap-mapa-yo-punto[data-capa="${e}"]`), { opacity: e === a ? 1 : 0, duration: dur, ease: 'power1.inOut' }, at);
  }
  const radar = el.querySelector('.ap-radar');
  if (radar) tl.to(radar, { opacity: a === 'color' ? 1 : 0, duration: dur, ease: 'power1.inOut' }, at);
  return dur;
}

export const MAPA_INFO = { columnas: COLUMNAS, filas: FILAS, costa: COSTA, yo: YO_INICIO } as const;
