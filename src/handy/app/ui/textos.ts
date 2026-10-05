/* Textos de la app 2026: titulares en Archivo con el subrayado amarillo y rótulos de sección.
   tituloResaltado({ texto, resaltar, tam = 31, color, alto = 1, ancho, etiqueta = 'h2', className }) → string
     Titular en Archivo (ancho --ap-display-ancho, 900). `resaltar` es la palabra (o el pedazo exacto) que lleva la banda
     amarilla #F5F59A detrás de su parte baja (≈ 0,44 del cuerpo, desde 0,33 bajo la línea media hasta 0,12 bajo la base),
     como "hoy" en 01-u-inicio o "pedidos" en 01-e-inicio. Con \n en el texto parte las líneas.
   rotulo(texto, { className }) → DM Sans 700 12 px, mayúsculas, tracking 0,1 em, gris (TU PRÓXIMO TURNO).
   Ganchos: .ap-titulo · .ap-resalte (la palabra) · .ap-resalte-banda (dibujarla: gsap.fromTo(banda, { scaleX: 0 },
     { scaleX: 1 }) — el origen ya está a la izquierda) · .ap-rotulo. */
import { cls, esc } from './comun.ts';

export interface TituloProps {
  texto: string;
  /** palabra con subrayado amarillo (la primera aparición) */
  resaltar?: string;
  /** cuerpo en px (default 31, el de "¿Qué necesitás hoy?") */
  tam?: number;
  /** color del texto (default tinta) */
  color?: string;
  /** interlineado (default 1; número = proporción del cuerpo, o string con unidad: '24.5px') */
  alto?: number | string;
  /** ancho de Archivo (font-stretch, %): las fotos no son parejas — medido 110 en los titulares de inicio, 115–120 en
      las tarjetas, 125 en los títulos de las hojas. Default: --ap-display-ancho. */
  ancho?: number;
  etiqueta?: 'h1' | 'h2' | 'h3' | 'span';
  className?: string;
}

export function tituloResaltado({ texto, resaltar, tam = 31, color, alto = 1, ancho, etiqueta = 'h2', className = '' }: TituloProps): string {
  let html = esc(texto);
  if (resaltar) {
    const i = texto.indexOf(resaltar);
    if (i >= 0) {
      html = esc(texto.slice(0, i))
        + `<span class="ap-resalte"><span class="ap-resalte-banda"></span>${esc(resaltar)}</span>`
        + esc(texto.slice(i + resaltar.length));
    }
  }
  html = html.replace(/\n/g, '<br>');
  const estilo = `font-size:${tam}px;line-height:${alto}${ancho ? `;font-stretch:${ancho}%` : ''}${color ? `;color:${color}` : ''}`;
  return `<${etiqueta} class="${cls('ap-titulo', 'ap-display', className)}" style="${estilo}">${html}</${etiqueta}>`;
}

export function rotulo(texto: string, { className = '' }: { className?: string } = {}): string {
  return `<span class="${cls('ap-rotulo', className)}">${esc(texto)}</span>`;
}
