/* Burbuja de chat, en dos estilos:
     tema 'handy'      → como las pantallas originales: entrante azul con texto blanco, saliente blanca con texto oscuro
                         (sobre el gris claro del chat), sin colita, texto en semibold.
     tema 'mensajeria' → una app de mensajería genérica (escena 2, sin marcas ni logos): entrante blanca, saliente verde
                         clarito, colita en la primera burbuja, autor en color en los grupos, hora chiquita y tildes grises.
   chatBubble({ lado, texto, hora, tildes, autor, colorAutor, foto, tema = 'handy', visto, cola, id, className })
     → string <div class="hd-burbuja" data-lado="entrante|saliente" data-tema="handy|mensajeria">.
   foto: HTML que va arriba del texto (p. ej. photoCard({ ancho: 190, alto: 220 })); el texto queda como epígrafe.
   visto: true → "Visto" debajo de la burbuja (o el texto que se pase: "Visto 10:05"): "lo vieron y nadie contestó".
   La burbuja se alinea sola a izquierda/derecha dentro de una lista en columna (.hd-chat-lista).
   Ganchos: .hd-burbuja[data-lado][data-id] (la fila entera: entrar/salir) · .hd-burbuja-cuerpo (el globo: para un "pop",
   transformOrigin abajo a la izquierda en las entrantes y abajo a la derecha en las salientes) · .hd-burbuja-autor ·
   .hd-burbuja-texto · .hd-burbuja-hora (cambiarla con tl.set en un corte) · .hd-tildes[data-tildes] ·
   .hd-burbuja-visto (aparece con opacity). marcaVisto() da la misma marca suelta, para ubicarla aparte.
   burbujaEscribiendo({ tema }) → globo entrante con tres puntitos (.hd-escribiendo-punto[data-i]) para antes de cada
   mensaje del otro lado. */
import '../css/base.css';
import '../css/chat.css';

export type TemaChat = 'handy' | 'mensajeria';
export type LadoBurbuja = 'entrante' | 'saliente';
export type Tildes = 'enviado' | 'entregado' | 'leido';

export interface ChatBubbleProps {
  lado: LadoBurbuja;
  texto?: string;
  /** "10:02" */
  hora?: string;
  /** solo en salientes: un tilde gris, dos grises o dos azules */
  tildes?: Tildes;
  /** nombre de quien escribe (grupos, tema 'mensajeria') */
  autor?: string;
  /** color del autor (default: uno de la paleta, según el nombre) */
  colorAutor?: string;
  /** HTML de una foto (photoCard) que va arriba del texto */
  foto?: string;
  tema?: TemaChat;
  /** true → "Visto"; un string → ese texto */
  visto?: boolean | string;
  /** colita del globo (default: sí en 'mensajeria', no en 'handy') */
  cola?: boolean;
  /** data-id para encontrarla desde la escena */
  id?: string;
  /** posición en su lista (data-i) */
  indice?: number;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

/** Colores de autor para los grupos (legibles sobre blanco). */
export const COLORES_AUTOR = ['#C2185B', '#1E7FA8', '#B35C00', '#6A4FC9', '#1F8A4C', '#C0392B'] as const;

function colorPorNombre(nombre: string): string {
  let h = 0;
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORES_AUTOR[h % COLORES_AUTOR.length];
}

/** Tildes de estado de un mensaje saliente, como string <svg class="hd-tildes">. */
export function tildesSvg(tildes: Tildes): string {
  const dos = tildes !== 'enviado';
  return `<svg class="hd-tildes" data-tildes="${tildes}" viewBox="0 0 18 12" width="${dos ? 18 : 13}" height="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`
    + (dos
      ? '<path d="m1.6 6.4 3.3 3.3 6.6-7.6"/><path d="m8.9 9.1.6.6 6.6-7.6"/>'
      : '<path d="m1.6 6.4 3.3 3.3 6.6-7.6"/>')
    + '</svg>';
}

/** Burbuja entrante "escribiendo…" (tres puntitos) para anunciar el próximo mensaje.
    Ganchos: .hd-burbuja--escribiendo > .hd-burbuja-cuerpo > .hd-escribiendo-punto[data-i="0|1|2"] (ola con y/opacity). */
export function burbujaEscribiendo({ tema = 'handy', id }: { tema?: TemaChat; id?: string } = {}): string {
  return `<div class="hd-burbuja hd-burbuja--escribiendo" data-lado="entrante" data-tema="${tema}"${id ? ` data-id="${esc(id)}"` : ''}>`
    + `<div class="hd-burbuja-cuerpo">${[0, 1, 2].map(i => `<i class="hd-escribiendo-punto" data-i="${i}"></i>`).join('')}</div></div>`;
}

/** Marca "Visto" suelta (la misma que va debajo de una burbuja con `visto`). */
export function marcaVisto(texto = 'Visto', tema: TemaChat = 'mensajeria'): string {
  return `<div class="hd-burbuja-visto" data-tema="${tema}">${esc(texto)}</div>`;
}

export function chatBubble({
  lado, texto, hora, tildes, autor, colorAutor, foto, tema = 'handy', visto, cola, id, indice, className = '',
}: ChatBubbleProps): string {
  const conCola = cola ?? tema === 'mensajeria';
  const tieneTildes = lado === 'saliente' && !!tildes;
  const cls = ['hd-burbuja', conCola ? 'hd-burbuja--cola' : '', foto ? 'hd-burbuja--foto' : '', className].filter(Boolean).join(' ');

  // hora + tildes van abajo a la derecha; un hueco invisible al final del texto les reserva lugar en la última línea
  const meta = hora || tieneTildes
    ? `<span class="hd-burbuja-meta">${hora ? `<span class="hd-burbuja-hora">${esc(hora)}</span>` : ''}${tieneTildes ? tildesSvg(tildes!) : ''}</span>`
    : '';
  const anchoMeta = meta ? Math.round(10 + (hora ? hora.length * 6.4 : 0) + (tieneTildes ? 21 : 0)) : 0;
  const hueco = meta ? `<span class="hd-burbuja-hueco" style="width:${anchoMeta}px"></span>` : '';

  const partes = [
    autor && lado === 'entrante' ? `<div class="hd-burbuja-autor" style="color:${colorAutor ?? colorPorNombre(autor)}">${esc(autor)}</div>` : '',
    foto ? `<div class="hd-burbuja-foto">${foto}</div>` : '',
    texto ? `<div class="hd-burbuja-texto">${esc(texto).replace(/\n/g, '<br>')}${hueco}</div>` : '',
    meta,
  ].join('');

  const marca = visto ? marcaVisto(visto === true ? 'Visto' : visto, tema) : '';
  return `<div class="${cls}" data-lado="${lado}" data-tema="${tema}"${id ? ` data-id="${esc(id)}"` : ''}${indice !== undefined ? ` data-i="${indice}"` : ''}>`
    + `<div class="hd-burbuja-cuerpo${!texto && foto ? ' hd-burbuja-cuerpo--solo-foto' : ''}">${partes}</div>${marca}</div>`;
}
