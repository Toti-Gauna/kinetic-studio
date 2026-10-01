/* Galería · marca: el logo en sus tres variantes y colores, la demo "cinco Handys, cinco letras" en el timeline
   (cada letra aparece arriba de un personaje y después se juntan en el wordmark; al final entra la bajada)
   y un QR de muestra. ?seccion=logo&t=SEGUNDOS congela la demo en ese segundo. */
import type { Seccion } from './tipos.ts';
import { handyLogo, letraHacia, logoAlto, LETRAS, LOGO_INFO } from '../logo.ts';
import { qrModulos, qrSvg } from '../qr.ts';
import { COLORS } from '../tokens.ts';

const bloque = (titulo: string, html: string) =>
  `<div style="flex:1 1 100%"><h3 style="margin:0 0 14px;font:700 18px/1.2 var(--hd-font);color:var(--hd-tinta)">${titulo}</h3>`
  + `<div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">${html}</div></div>`;

const muestra = (rotulo: string, html: string, estilo = '') =>
  `<figure style="margin:0;display:flex;flex-direction:column;gap:8px"><div style="position:relative;${estilo}">${html}</div>`
  + `<figcaption style="font:600 13px/1.3 var(--hd-font);color:#4A4A4A">${rotulo}</figcaption></figure>`;

const panel = (fondo: string, html: string, extra = '') =>
  `<div style="background:${fondo};border-radius:24px;padding:28px 32px;${extra}">${html}</div>`;

// demo: escenario chico con cinco "personajes" (círculos de colores de los Handys) y el logo con split
const DEMO = { w: 760, h: 380, logoX: 160, logoY: 36, logoW: 440 } as const;
const PERSONAJES = [COLORS.azulHandy, '#92CEFE', '#E0E0E0', COLORS.amarillo, '#BCBCBC'];
const persX = (i: number) => 96 + i * 142;
const PERS_Y = 318;

const seccion: Seccion = {
  id: 'logo',
  titulo: 'Marca: logo y QR',
  render(root, tl) {
    const url = 'https://handy.com.ar';
    const qrLado = qrModulos(url) * 6;
    const personajes = PERSONAJES.map((c, i) =>
      `<span class="hd-gal-pers" style="position:absolute;left:${persX(i) - 34}px;top:${PERS_Y - 34}px;width:68px;height:68px;border-radius:50%;background:${c};box-shadow:inset 0 0 0 4px rgba(0,0,0,.12)"></span>`).join('');
    root.innerHTML = [
      bloque('Lockup amplio (como el logo original): handyLogo()', [
        muestra(`azul sobre el gris del escenario · ${LOGO_INFO.viewBox.amplia.w} × ${LOGO_INFO.viewBox.amplia.h} u`,
          panel('var(--hd-gris)', handyLogo({ width: 560 }))),
        muestra("blanco sobre azul · color: COLORS.blanco",
          panel('var(--hd-azul)', handyLogo({ width: 560, color: COLORS.blanco }))),
      ].join('')),
      bloque('Sin bajada y lockup compacto', [
        muestra(`tagline: false · ${LOGO_INFO.viewBox.palabra.w} × ${LOGO_INFO.viewBox.palabra.h} u`,
          panel('#FFFFFF', handyLogo({ tagline: false, width: 360 }))),
        muestra("tagline: 'compacta' a 150 px, como en el encabezado de la app (414 px de ancho)",
          `<div style="width:414px;box-sizing:border-box;background:#FFFFFF;border-radius:24px;padding:18px 22px;display:flex;align-items:center;justify-content:space-between">`
          + handyLogo({ tagline: 'compacta', width: 150 })
          + `<span style="display:flex;gap:10px"><i style="width:56px;height:56px;border-radius:16px;background:var(--hd-azul)"></i><i style="width:56px;height:56px;border-radius:16px;background:var(--hd-azul)"></i></span></div>`),
        muestra("tagline: 'compacta' grande (300 px), blanco sobre azul",
          panel('var(--hd-azul)', handyLogo({ tagline: 'compacta', width: 300, color: COLORS.blanco }))),
      ].join('')),
      bloque('Cinco Handys, cinco letras (split: true + letraHacia) — demo en el timeline', [
        muestra('cada letra salta arriba de su personaje y después se juntan en el wordmark; al final entra la bajada',
          `<div class="hd-gal-demo-logo" style="position:relative;width:${DEMO.w}px;height:${DEMO.h}px;background:var(--hd-gris);border-radius:24px;overflow:hidden">`
          + `<div style="position:absolute;left:${DEMO.logoX}px;top:${DEMO.logoY}px;width:${DEMO.logoW}px;height:${logoAlto(DEMO.logoW).toFixed(1)}px">${handyLogo({ width: DEMO.logoW, split: true })}</div>`
          + personajes + `</div>`),
      ].join('')),
      bloque('QR: qrSvg(url, opts)', [
        muestra(`qrSvg('${url}', { size: ${qrLado}, color: COLORS.azul }) · ${qrModulos(url)} módulos (6 px c/u) · corrección M`,
          panel('#FFFFFF', qrSvg(url, { size: qrLado, color: COLORS.azul }), 'display:inline-block;padding:20px')),
        muestra("color por defecto (tinta) y background: 'none' sobre el gris",
          panel('var(--hd-gris)', qrSvg(url, { size: qrLado, background: 'none' }), 'display:inline-block;padding:20px')),
        muestra("qrSvg('') → '' (sin QR: el cierre muestra solo el texto)",
          panel('#FFFFFF', `<code style="font:600 15px/1.4 ui-monospace,monospace;color:#4A4A4A">${JSON.stringify(qrSvg(''))}</code>`)),
      ].join('')),
    ].join('');

    // --- demo en el timeline (tiempos absolutos; solo transform y opacity)
    const demo = root.querySelector<HTMLElement>('.hd-gal-demo-logo');
    if (!demo) return;
    const letras = LETRAS.map(l => demo.querySelector<SVGGElement>(`.hd-logo-letra[data-letra="${l}"]`)!);
    const bajada = demo.querySelector<SVGGElement>('.hd-logo-bajada')!;
    const pers = [...demo.querySelectorAll<HTMLElement>('.hd-gal-pers')];
    const caja = { x: DEMO.logoX, y: DEMO.logoY, width: DEMO.logoW };
    tl.set(bajada, { autoAlpha: 0, y: 30 }, 0);
    letras.forEach((el, i) => {
      const b = LOGO_INFO.letras[LETRAS[i]];
      // apoyadas en una línea común 52 px arriba del centro de cada personaje; saltan desde su línea de base
      const arriba = letraHacia(LETRAS[i], caja, { x: persX(i), y: PERS_Y - 52 }, 'base');
      tl.set(el, { svgOrigin: `${b.x + b.w / 2} ${LOGO_INFO.lineaBase.palabra}`, x: arriba.x, y: arriba.y, scale: 0 }, 0);
      const t = 0.3 + i * 0.32;
      tl.to(pers[i], { y: -26, duration: 0.16, ease: 'power2.out' }, t);
      tl.to(pers[i], { y: 0, duration: 0.22, ease: 'power2.in' }, t + 0.16);
      tl.to(el, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, t + 0.08);
    });
    tl.to(letras, { x: 0, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 2.3);
    tl.to(bajada, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 3.2);
    tl.to(pers, { y: 70, autoAlpha: 0, duration: 0.5, ease: 'power3.in', stagger: 0.05 }, 4.2);
    tl.to({}, { duration: 0.8 }, 4.9); // pausa al final
  },
};
export default seccion;
