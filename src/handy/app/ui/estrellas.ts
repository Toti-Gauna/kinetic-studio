/* Estrellas grandes de la reseña (16/17-u-resena): cinco cuadraditos amarillos con canto y la estrella dorada.
   estrellas({ total = 5, llenas = 5, className }) → <div class="ap-estrellas"> de 5 × 55 con 7,8 de separación.
     Cada estrella: cara cuadrada de 55 × 55 (radio 16) + canto de 4, y la estrella de 25 × 24 al centro. Dos capas
     apiladas por estrella: apagada (gris ficha con la estrella solo en contorno #B9C0CC, como en 15-u-resena) y llena
     (amarillo #F5F59A, canto #D8D65E, estrella rellena #E0A800): llenarla es subir su opacity (y un pop con scale en
     .ap-estrella).
   Ganchos: .ap-estrellas · .ap-estrella[data-estrella="1".."5"] (pop: scale, origen al centro) · .ap-estrella-apagada ·
     .ap-estrella-llena (opacity). Ayuda: llenarEstrellas(tl, el, at, { hasta = 5, paso = .12 }) → duración. */
import { icono } from '../iconos.ts';
import { cls } from './comun.ts';
import '../css/estrellas.css';

export function estrellas({ total = 5, llenas = 5, className = '' }: { total?: number; llenas?: number; className?: string } = {}): string {
  const una = (i: number) => {
    // la apagada es solo el contorno (mismo tamaño por fuera que la llena: 25 × 24)
    const estrella = (llena: boolean) => llena ? icono('estrella', { tam: 29, trazo: 1.2, relleno: 'currentColor' }) : icono('estrella', { tam: 27.8, trazo: 2 });
    const capa = (llena: boolean) => `<span class="${llena ? 'ap-estrella-llena' : 'ap-estrella-apagada'}" style="opacity:${(i <= llenas) === llena ? 1 : 0}">`
      + `<span class="ap-estrella-canto"></span><span class="ap-estrella-cara">${estrella(llena)}</span></span>`;
    return `<span class="ap-estrella" data-estrella="${i}">${capa(false)}${capa(true)}</span>`;
  };
  return `<div class="${cls('ap-estrellas', className)}">${Array.from({ length: total }, (_, k) => una(k + 1)).join('')}</div>`;
}

/** Llena las estrellas de a una (opacity + pop). Devuelve la duración. */
export function llenarEstrellas(tl: GSAPTimeline, el: Element, at: number, { hasta = 5, paso = 0.12 }: { hasta?: number; paso?: number } = {}): number {
  for (let i = 1; i <= hasta; i++) {
    const e = el.querySelector(`.ap-estrella[data-estrella="${i}"]`);
    if (!e) continue;
    const t = at + (i - 1) * paso;
    tl.to(e.querySelector('.ap-estrella-llena'), { opacity: 1, duration: 0.1, ease: 'none' }, t);
    tl.fromTo(e, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t);
  }
  return (hasta - 1) * paso + 0.3;
}
