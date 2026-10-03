/* HANDY · Anuncios — el formato de cada película. Las escenas de los dos anuncios (trailers/handy-vertical, 1080×1920
   para Reels, TikTok y Shorts; trailers/handy-anuncio, 1920×1080 para YouTube y Meta) son las mismas recetas: cada una
   pide formato(D) y arma su cuadro con estas medidas, nunca con números fijos de un solo formato.

   formato(D) → {
     vertical       true en 1080×1920
     W, H, CX, CY   tamaño y centro del escenario
     tel            { cx, cy, escala }: el teléfono en reposo (centro y escala del marco de 438×920 de PhoneFrame).
                    telXY(L) da el { x, y, scale } para gsap.set(.hd-telefono, …) con transformOrigin '0 0'.
     titular        { x, y, ancho, tamano, alinear }: la caja del titular en las escenas de app. En vertical va arriba
                    del teléfono, centrado (y = su borde de arriba); en horizontal, en la columna de la izquierda,
                    alineado a la izquierda (y = su centro vertical).
     palabra        { ancho, tamano }: ancho máximo y cuerpo de las palabras de los golpes.
     seguro         { arriba, abajo, izq, der }: el texto nunca sale de esta caja. En vertical deja libres arriba y
                    abajo las zonas que tapan las interfaces de Reels / TikTok / Shorts (perfil, botones, descripción).
     handy          alto de los personajes en los golpes y el final.
   }
   Reglas de las escenas: solo transform y opacity; todo en D.tl en tiempos absolutos desde T; estados iniciales con
   gsap.set; sin from/fromTo; azar solo con D.rand; cada receta devuelve exactamente o.dur. */
import { PHONE } from '../layout.ts';

export function formato(D) {
  const vertical = D.H > D.W;
  if (vertical) {
    return {
      vertical, W: D.W, H: D.H, CX: D.W / 2, CY: D.H / 2,
      tel: { cx: 540, cy: 1170, escala: 1.1 },
      titular: { x: 70, y: 250, ancho: 940, tamano: 92, alinear: 'center' },
      palabra: { ancho: 940, tamano: 250 },
      seguro: { arriba: 220, abajo: 1560, izq: 60, der: 1020 },
      handy: 330,
    };
  }
  return {
    vertical, W: D.W, H: D.H, CX: D.W / 2, CY: D.H / 2,
    tel: { cx: 1380, cy: 540, escala: 1 },
    titular: { x: 200, y: 540, ancho: 780, tamano: 100, alinear: 'left' },
    palabra: { ancho: 1640, tamano: 300 },
    seguro: { arriba: 70, abajo: 1010, izq: 120, der: 1800 },
    handy: 290,
  };
}

/** { x, y, scale } del .hd-telefono (marco en left:0 top:0, transformOrigin '0 0') para dejarlo en L.tel. */
export function telXY(L, tel = L.tel) {
  return { x: tel.cx - (PHONE.w * tel.escala) / 2, y: tel.cy - (PHONE.h * tel.escala) / 2, scale: tel.escala };
}
