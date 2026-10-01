/* "Foto" del problema dibujada en SVG (sin imágenes): primer plano del sifón de PVC debajo de la bacha del baño,
   con la descarga cromada, la llave de paso con su flexible, gotas que caen de la unión y un charquito en el piso.
   Sombreado plano pero fotográfico (degradés, viñeta y brillo de flash), en un marco redondeado.
   photoCard({ ancho = 190, alto = 230, pie, radio = 14, className }) → string <figure class="hd-foto">.
   El dibujo es de 240×300 (4:5) y se recorta centrado (slice) para cualquier ancho/alto; lo importante (sifón, gotas y
   charco) queda entre y 20 y 285 del dibujo: con ancho/alto ≤ 0,9 (vertical, p. ej. 200×240) se ve todo; más apaisada
   recorta el charco.
   pie: epígrafe debajo de la foto (si la foto va dentro de una burbuja, el texto de la burbuja hace de epígrafe).
   Ganchos: .hd-foto · .hd-foto-img (svg) · .hd-foto-gota[data-i="0|1"] (gota colgando y gota cayendo: moverlas con y,
   transformOrigin arriba) · .hd-foto-charco · .hd-foto-pie. */
import '../css/base.css';
import '../css/chat.css';

export interface PhotoCardProps {
  ancho?: number;
  alto?: number;
  pie?: string;
  /** radio de las esquinas de la foto (default 14) */
  radio?: number;
  className?: string;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESC[c] ?? c);

let serie = 0; // ids únicos de los degradés de cada foto de la página

/** recorrido del sifón: baja de la descarga, hace la U, sube y dobla hacia la pared */
const SIFON = 'M120 122V180A28 28 0 0 0 176 180V166A22 22 0 0 1 198 144H226';
const FLEXIBLE = 'M47 136C47 108 63 96 68 78S74 56 76 46';

function fotoSvg(ancho: number, alto: number): string {
  const s = `hdf${++serie}`;
  const u = (n: string) => `url(#${n}-${s})`;
  const gota = (x: number, y: number, k: number) =>
    `<path d="M${x} ${y}c0 0-${5.5 * k} ${7.4 * k}-${5.5 * k} ${11.2 * k}a${5.5 * k} ${5.5 * k} 0 0 0 ${11 * k} 0c0-${3.8 * k}-${5.5 * k}-${11.2 * k}-${5.5 * k}-${11.2 * k}z" fill="${u('agua')}" stroke="#6E9FC6" stroke-width=".8"/>`
    + `<ellipse cx="${x - 2 * k}" cy="${y + 11.4 * k}" rx="${1.4 * k}" ry="${2.3 * k}" fill="#FFFFFF" opacity=".85"/>`;

  const defs = '<defs>'
    + `<linearGradient id="pared-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A8379"/><stop offset=".3" stop-color="#C6C0B5"/><stop offset=".6" stop-color="#DAD5CB"/><stop offset="1" stop-color="#E3DFD7"/></linearGradient>`
    + `<linearGradient id="piso-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9C1B3"/><stop offset="1" stop-color="#AFA696"/></linearGradient>`
    + `<linearGradient id="bacha-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFDFB"/><stop offset=".5" stop-color="#ECEAE5"/><stop offset=".82" stop-color="#D2CFC8"/><stop offset="1" stop-color="#B4B0A7"/></linearGradient>`
    + `<linearGradient id="cromo-${s}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5F676F"/><stop offset=".2" stop-color="#A5ADB4"/><stop offset=".4" stop-color="#F5F8FA"/><stop offset=".56" stop-color="#C3CAD0"/><stop offset=".82" stop-color="#7F878F"/><stop offset="1" stop-color="#565E66"/></linearGradient>`
    + `<linearGradient id="agua-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF7FD"/><stop offset="1" stop-color="#86B7DC"/></linearGradient>`
    + `<radialGradient id="charco-${s}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#D5E8F5" stop-opacity=".9"/><stop offset="1" stop-color="#93BCDB" stop-opacity=".6"/></radialGradient>`
    + `<radialGradient id="flash-${s}" cx=".46" cy=".5" r=".55"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="vineta-${s}" cx=".5" cy=".48" r=".72"><stop offset=".55" stop-color="#1A140C" stop-opacity="0"/><stop offset="1" stop-color="#1A140C" stop-opacity=".42"/></radialGradient>`
    + '</defs>';

  // pared de azulejos y piso (lo importante queda entre y 20 y 285: la foto se puede recortar arriba y abajo)
  const pared = `<rect width="240" height="300" fill="${u('pared')}"/>`
    + '<path d="M24 50V250M72 50V250M120 50V250M168 50V250M216 50V250M0 92H240M0 140H240M0 188H240M0 236H240" stroke="#B5AEA2" stroke-width="1.3" opacity=".55"/>'
    + '<path d="M25.4 50V250M73.4 50V250M121.4 50V250M169.4 50V250M217.4 50V250M0 93.4H240M0 141.4H240M0 189.4H240M0 237.4H240" stroke="#F1EEE8" stroke-width=".8" opacity=".45"/>';
  const piso = `<path d="M0 250H240V300H0Z" fill="${u('piso')}"/>`
    + '<path d="M0 250.5H240" stroke="#8E877B" stroke-width="2.2"/>'
    + '<path d="M46 251 10 300M104 251 90 300M162 251 174 300M222 251 258 300" stroke="#9C9486" stroke-width="1.1" opacity=".7"/>';

  // la bacha vista desde abajo y su sombra sobre la pared
  const bacha = '<path d="M-10 42C40 94 200 94 250 42V106C200 124 40 124-10 106Z" fill="#3A3228" opacity=".12"/>'
    + '<path d="M-10 36C40 82 200 82 250 36V86C200 104 40 104-10 86Z" fill="#3A3228" opacity=".12"/>'
    + `<path d="M-10 0H250V24C206 56 162 66 120 66S34 56-10 24Z" fill="${u('bacha')}"/>`
    + '<path d="M-6 20C38 52 80 61 120 61S202 52 246 20" fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity=".7"/>';

  // llave de paso en la pared y flexible de malla metálica hasta la canilla
  const llave = `<path d="${FLEXIBLE}" fill="none" stroke="#8D949B" stroke-width="6.5" stroke-linecap="round"/>`
    + `<path d="${FLEXIBLE}" fill="none" stroke="#E6E9EC" stroke-width="1.5" stroke-dasharray="1.1 1.1" opacity=".9" transform="translate(-1.5 0)"/>`
    + `<path d="${FLEXIBLE}" fill="none" stroke="#5E656C" stroke-width="1.2" stroke-dasharray="1.1 1.1" stroke-dashoffset="1.1" opacity=".7" transform="translate(1.8 0)"/>`
    + `<rect x="70" y="40" width="12" height="11" rx="2" fill="${u('cromo')}"/>`
    + `<circle cx="47" cy="157" r="12" fill="${u('cromo')}" stroke="#58606A" stroke-width=".6"/>`
    + `<rect x="40" y="135" width="14" height="24" rx="4" fill="${u('cromo')}" stroke="#58606A" stroke-width=".6"/>`
    + `<ellipse cx="47" cy="132" rx="11" ry="5" fill="${u('cromo')}" stroke="#58606A" stroke-width=".6"/>`;

  // descarga cromada, sifón de PVC (trazos apilados = cilindro), tuercas y roseta en la pared
  const sifon = `<path d="${SIFON}" fill="none" stroke="#3A3228" stroke-width="30" opacity=".2" transform="translate(7 9)"/>`
    + `<path d="${SIFON}" fill="none" stroke="#A3A098" stroke-width="28"/>`
    + `<path d="${SIFON}" fill="none" stroke="#D3D2CC" stroke-width="25"/>`
    + `<path d="${SIFON}" fill="none" stroke="#EAE9E5" stroke-width="16"/>`
    + `<path d="${SIFON}" fill="none" stroke="#FFFFFF" stroke-width="5" opacity=".9" transform="translate(-5 -1)"/>`
    + `<rect x="160" y="158" width="32" height="14" rx="3" fill="#E4E3DE" stroke="#A3A098" stroke-width=".8"/>`
    + '<path d="M166 159V171M172 159V171M178 159V171M184 159V171" stroke="#B9B7B0" stroke-width=".8"/>'
    + `<ellipse cx="229" cy="144" rx="9" ry="19" fill="${u('cromo')}" stroke="#58606A" stroke-width=".6"/>`
    + `<rect x="103" y="60" width="34" height="9" rx="2" fill="${u('cromo')}"/>`
    + `<rect x="110" y="67" width="20" height="52" fill="${u('cromo')}"/>`
    + `<rect x="104" y="112" width="32" height="17" rx="3.5" fill="${u('cromo')}" stroke="#58606A" stroke-width=".6"/>`
    + '<path d="M110 113V128M116 113V128M122 113V128M128 113V128" stroke="#6F7780" stroke-width=".7" opacity=".55"/>';

  // la pérdida: brillo húmedo por el caño, gotas y charco
  const agua = '<path d="M133 130C135 146 133 164 134 182C135 198 140 208 148 210" fill="none" stroke="#8DBADB" stroke-width="2.8" opacity=".6"/>'
    + '<path d="M132.2 132C134 146 132.2 164 133.2 182" fill="none" stroke="#FFFFFF" stroke-width=".9" opacity=".7"/>'
    + gota(132, 129, 0.55)
    + `<g class="hd-foto-gota" data-i="0">${gota(148, 219, 1)}</g>`
    + `<g class="hd-foto-gota" data-i="1">${gota(148, 236, 0.85)}</g>`
    + `<g class="hd-foto-charco"><path d="M96 267C99 259 132 256 156 258S206 263 202 271 158 283 128 280 92 274 96 267Z" fill="${u('charco')}" stroke="#7FAACB" stroke-width=".8" opacity=".95"/>`
    + '<ellipse cx="148" cy="265" rx="13" ry="3.2" fill="none" stroke="#F2F8FC" stroke-width="1.1" opacity=".85"/>'
    + '<ellipse cx="124" cy="263" rx="10" ry="1.6" fill="#FFFFFF" opacity=".75"/>'
    + '<ellipse cx="176" cy="273" rx="7" ry="1.3" fill="#FFFFFF" opacity=".6"/></g>';

  const luz = `<rect width="240" height="300" fill="${u('flash')}"/><rect width="240" height="300" fill="${u('vineta')}"/>`;

  return `<svg class="hd-foto-img" viewBox="0 0 240 300" width="${ancho}" height="${alto}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">`
    + defs + pared + piso + bacha + llave + sifon + agua + luz + '</svg>';
}

export function photoCard({ ancho = 190, alto = 230, pie, radio = 14, className = '' }: PhotoCardProps = {}): string {
  const cls = ['hd-foto', className].filter(Boolean).join(' ');
  return `<figure class="${cls}" style="width:${ancho}px">`
    + `<div class="hd-foto-marco" style="width:${ancho}px;height:${alto}px;border-radius:${radio}px">${fotoSvg(ancho, alto)}</div>`
    + (pie ? `<figcaption class="hd-foto-pie">${esc(pie)}</figcaption>` : '')
    + '</figure>';
}
