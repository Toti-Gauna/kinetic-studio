/* Botones de la app 2026. Los "3D" son dos capas: el canto (color más oscuro, corrido hacia abajo) y la cara encima;
   apretar el botón es bajar la cara con y = canto (el canto queda tapado), nada de cambiar colores ni alturas.
   Solo los azules y los grises llevan canto: el verde y el amarillo de las fotos son planos ("Confirmar turno" y "Cancelar"
   en 09-u-confirmar, "Permitir" y "Ahora no" en 13-e-en-camino, "Pagar $ 47.250" en 13-u-terminado).
   boton({ texto, icono, iconoLado = 'izq', variante = 'azul', tam = 'grande', ancho, accion, className, id }) → string
     variante  'azul' (canto azul oscuro) · 'gris' (canto gris) · 'blanco' (canto gris, texto tinta) ·
               'verde' y 'amarillo' (planos; con `canto` explícito llevan canto verde / amarillo oscuro) ·
               'contorno' (borde punteado gris, sin canto: "Prefiero elegir la fecha") ·
               'celeste' (sin canto, texto azul: atajos del chat) · 'texto-azul' (blanco sin canto, texto azul: "Escribir otro monto")
     tam       'grande' 52 + canto 4,7 (radio 20, texto 16,5: "Ponerme disponible", "Terminar trabajo") ·
               'medio' 48 + 4 (radio 24, texto 15: "Confirmar turno", "Cancelar", "Enviar") ·
               'pildora' 46 + 4 (radio total, texto 15: "Dejar el sugerido", "+ $ 1.000", "Listo")
     ancho     px (sin ancho: se ajusta al texto con el relleno del tamaño; 'lleno' = 100 % del contenedor)
     alto/canto  px de la cara y del canto, para los que no siguen la tabla (03-e-precio: "Dejar el sugerido" 49,6 + 2;
               "Listo" 49,5 + 2,2; los punteados de 49,2 sin canto)
   Medido en 01-e-inicio ("Ponerme disponible": 340,5 × 52 + canto 4,7, x 36,7 y 726,9) y 03…09-e-precio.
   Ganchos: .ap-boton[data-variante][data-tam][data-accion] · .ap-boton-canto (solo si tiene) · .ap-boton-cara (apretar: y = canto;
     sin canto, apretarBoton lo achica un poco) ·
     .ap-boton-texto · .ap-boton .ap-icono. Ayuda: apretarBoton(tl, boton, at) → duración (baja y vuelve). */
import { icono as dibujarIcono, type Icono } from '../iconos.ts';
import { cls, esc, idAttr } from './comun.ts';
import '../css/botones.css';

export type VarianteBoton = 'azul' | 'verde' | 'gris' | 'blanco' | 'amarillo' | 'contorno' | 'celeste' | 'texto-azul';
export type TamBoton = 'grande' | 'medio' | 'pildora';

export interface BotonProps {
  texto: string;
  icono?: Icono;
  iconoLado?: 'izq' | 'der';
  variante?: VarianteBoton;
  tam?: TamBoton;
  /** ancho en px, o 'lleno' (100 %); sin ancho se ajusta al contenido */
  ancho?: number | 'lleno';
  /** alto de la cara y del canto en px (default: los del tamaño) */
  alto?: number;
  canto?: number;
  /** data-accion (para que la escena lo encuentre) */
  accion?: string;
  className?: string;
  id?: string;
}

/** Alto de la cara y del canto de cada tamaño (px). */
export const BOTON_TAM: Record<TamBoton, { cara: number; canto: number; icono: number }> = {
  grande: { cara: 52, canto: 4.7, icono: 21 },
  medio: { cara: 48, canto: 4, icono: 19 },
  pildora: { cara: 46, canto: 4, icono: 18 },
};

/** Nunca llevan canto. */
const SIN_CANTO: VarianteBoton[] = ['contorno', 'celeste', 'texto-azul'];
/** Planos salvo que se pida un `canto` explícito. */
const PLANOS: VarianteBoton[] = ['verde', 'amarillo'];

export function boton({ texto, icono, iconoLado = 'izq', variante = 'azul', tam = 'grande', ancho, alto, canto: cantoPx, accion, className = '', id }: BotonProps): string {
  const t = BOTON_TAM[tam];
  const canto = SIN_CANTO.includes(variante) ? 0 : (cantoPx ?? (PLANOS.includes(variante) ? 0 : t.canto));
  const cara = alto ?? t.cara;
  const w = ancho === 'lleno' ? 'width:100%;' : ancho ? `width:${ancho}px;` : '';
  const ic = icono ? dibujarIcono(icono, { tam: t.icono, trazo: 2.3 }) : '';
  return `<span class="${cls('ap-boton', className)}" data-variante="${variante}" data-tam="${tam}"${accion ? ` data-accion="${esc(accion)}"` : ''}${idAttr(id)}`
    + ` style="${w}height:${cara + canto}px">`
    + (canto ? `<span class="ap-boton-canto" style="top:${canto}px${alto ? `;height:${alto}px` : ''}"></span>` : '')
    + `<span class="ap-boton-cara"${alto ? ` style="height:${alto}px"` : ''}>${iconoLado === 'izq' ? ic : ''}<span class="ap-boton-texto">${esc(texto)}</span>${iconoLado === 'der' ? ic : ''}</span>`
    + '</span>';
}

/** Aprieta el botón (baja la cara hasta tapar el canto y vuelve; si es plano, la achica un poco). Devuelve la duración. */
export function apretarBoton(tl: GSAPTimeline, el: Element, at: number, { dur = 0.22 }: { dur?: number } = {}): number {
  const canto = el.querySelector<HTMLElement>('.ap-boton-canto');
  const cara = el.querySelector('.ap-boton-cara');
  const baja = canto ? { y: parseFloat(canto.style.top) || 4 } : { scale: 0.96 };
  const vuelve = canto ? { y: 0 } : { scale: 1 };
  tl.to(cara, { ...baja, duration: dur * 0.4, ease: 'power2.out' }, at);
  tl.to(cara, { ...vuelve, duration: dur * 0.6, ease: 'back.out(2)' }, at + dur * 0.4);
  return dur;
}
