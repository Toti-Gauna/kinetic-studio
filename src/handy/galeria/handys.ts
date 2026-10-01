/* Galería · Handys: los cinco en fila como en handys-grupo.png, cada uno con sus tres caras (feliz, preocupado,
   festejo) y demos en el timeline de la galería: entrarSaltando, salto, vuelta carnero, saludo, idle, festejo,
   cambios de cara y una gotita que se forma en el punto de goteo del caño y cae. Las sombras son sombraHandy.
   ?seccion=handys&t=SEGUNDOS congela las demos en ese segundo. */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import {
  handy, sombraHandy, gotita, filaHandys, puntoGoteo, piesHandy, HANDY_TIPOS, HANDY_HUMORES, HANDY_INFO, type HandyTipo,
} from '../handys.ts';
import { idle, saludo, salto, festejo, humor, parpadeo, entrarSaltando, mirarCostados } from '../handys-anim.ts';

const bloque = (titulo: string, html: string) =>
  `<div style="flex:1 1 100%"><h3 style="margin:0 0 14px;font:700 18px/1.2 var(--hd-font);color:var(--hd-tinta)">${titulo}</h3>`
  + `<div style="display:flex;flex-wrap:wrap;gap:28px 40px;align-items:flex-end">${html}</div></div>`;

const rotulo = (texto: string) => `<figcaption style="font:600 13px/1.3 var(--hd-font);color:#4A4A4A">${texto}</figcaption>`;

const NOMBRES: Record<HandyTipo, string> = { gota: 'Gota', cano: 'Caño', engranaje: 'Engranaje', lamparita: 'Lamparita', llave: 'Llave' };

/** alto de muestra de cada uno, proporcional a la fila de handys-grupo.png pero sin que la gota quede diminuta */
const altoMuestra = (tipo: HandyTipo, base: number) => Math.max(110, base * HANDY_INFO[tipo].alturaGrupo);

/** escenario de las demos: piso en y = PISO, cada personaje parado con los pies en el piso */
const ESCENARIO = { w: 1240, h: 430 }, PISO = 390;
const DEMO: { tipo: HandyTipo; x: number; texto: string }[] = [
  { tipo: 'gota', x: 70, texto: 'entrarSaltando 0,3 s · preocupado + mirarCostados 2,2 s · feliz 3,9 s · idle' },
  { tipo: 'cano', x: 190, texto: 'gotita en puntoGoteo 0,2 s · humor: preocupado 0,9 s · festejo 2,1 s · feliz 3,3 s · parpadeo' },
  { tipo: 'engranaje', x: 560, texto: 'salto 0,4 s · salto con vuelta (rot 360) 1,9 s' },
  { tipo: 'lamparita', x: 760, texto: 'idle 0–4,4 s + saludo 0,6 s' },
  { tipo: 'llave', x: 1060, texto: 'festejo 0,5 s (2 saltos)' },
];

const seccion: Seccion = {
  id: 'handys',
  titulo: 'Handys',
  render(root, tl) {
    // 1 · la fila de handys-grupo.png
    const fila = filaHandys(400);
    const filaHtml = `<figure style="margin:0;display:flex;flex-direction:column;gap:10px">`
      + `<div style="position:relative;width:${fila.ancho}px;height:${fila.alto}px">`
      + fila.handys.map(h => `<div style="position:absolute;left:${h.x}px;top:${h.y}px">${handy(h.tipo, { altura: h.altura })}</div>`).join('')
      + `</div>${rotulo(`filaHandys(400) → ${Math.round(fila.ancho)}×${Math.round(fila.alto)} px · alturaGrupo: `
        + HANDY_TIPOS.map(t => `${NOMBRES[t].toLowerCase()} ${HANDY_INFO[t].alturaGrupo.toFixed(3)}`).join(' · '))}</figure>`;

    // 2 · las tres caras de cada uno
    const caras = HANDY_TIPOS.map(tipo => HANDY_HUMORES.map(h =>
      `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:8px">`
      + handy(tipo, { altura: altoMuestra(tipo, 300), humor: h }) + rotulo(`${NOMBRES[tipo]} · ${h}`) + '</figure>').join('')).join('');

    // 3 · demos en el timeline
    const demo = filaHandys(300);
    const alturas = Object.fromEntries(demo.handys.map(h => [h.tipo, h.altura])) as Record<HandyTipo, number>;
    const goteo = puntoGoteo(alturas.cano), xCano = DEMO.find(d => d.tipo === 'cano')!.x;
    const escena = `<div class="hd-gal-handys-demo" style="position:relative;width:${ESCENARIO.w}px;height:${ESCENARIO.h}px;`
      + `background:var(--hd-gris);border-radius:20px;overflow:hidden">`
      + `<div style="position:absolute;left:0;right:0;top:${PISO}px;height:2px;background:rgba(0,0,0,.08)"></div>`
      + DEMO.map(d => {
        const pies = piesHandy(d.tipo, alturas[d.tipo]);
        return `<div id="hd-gal-sombra-${d.tipo}" style="position:absolute;left:${d.x + pies.x}px;top:${PISO}px">${sombraHandy(d.tipo, alturas[d.tipo])}</div>`;
      }).join('')
      + `<div id="hd-gal-gotita" style="position:absolute;left:${xCano + goteo.x - 7}px;top:${PISO - alturas.cano + goteo.y - 2}px">${gotita(20)}</div>`
      + DEMO.map(d => `<div style="position:absolute;left:${d.x}px;top:${PISO - alturas[d.tipo]}px">`
        + handy(d.tipo, { altura: alturas[d.tipo], id: `hd-gal-${d.tipo}` })
        + (d.tipo === 'cano'
          ? `<div title="puntoGoteo" style="position:absolute;left:${goteo.x - 3}px;top:${goteo.y - 3}px;width:6px;height:6px;border-radius:50%;background:#E5322D"></div>`
          : '')
        + '</div>').join('')
      + '</div>';
    const leyenda = DEMO.map(d => `<b>${NOMBRES[d.tipo]}</b>: ${d.texto}`).join(' &nbsp;·&nbsp; ')
      + ' &nbsp;·&nbsp; el punto rojo es puntoGoteo() del caño';

    root.innerHTML = bloque('Fila como en handys-grupo.png', filaHtml)
      + bloque('Caras: feliz · preocupado · festejo', caras)
      + bloque('Demos en el timeline (?t= congela)', `<figure style="margin:0;display:flex;flex-direction:column;gap:10px">${escena}${rotulo(leyenda)}</figure>`);

    const el = (tipo: HandyTipo) => root.querySelector<HTMLElement>(`#hd-gal-${tipo}`)!;
    const sombra = (tipo: HandyTipo) => root.querySelector<HTMLElement>(`#hd-gal-sombra-${tipo} .hd-handy-sombra`);
    // gota: entra saltando desde la izquierda (con su sombra) y después respira
    const dGota = entrarSaltando(tl, el('gota'), { desdeX: -260, hastaX: 0, saltos: 3, sombra: sombra('gota') }, 0.3);
    idle(tl, el('gota'), 0.3 + dGota, 4.6 - (0.3 + dGota));
    humor(tl, el('gota'), 'preocupado', 2.05);
    mirarCostados(tl, el('gota'), 2.2);
    humor(tl, el('gota'), 'feliz', 3.9);
    // caño: una gotita se forma en el pico y cae; cambia de cara y parpadea
    const gota = root.querySelector('#hd-gal-gotita .hd-gotita')!;
    gsap.set(gota, { scale: 0 });
    tl.to(gota, { scale: 1, duration: 0.7, ease: 'sine.inOut' }, 0.2);
    tl.to(gota, { y: PISO - (PISO - alturas.cano + goteo.y) - 20, duration: 0.42, ease: 'power2.in' }, 1.0);
    tl.set(gota, { autoAlpha: 0 }, 1.42);
    idle(tl, el('cano'), 0, 4.6, { amp: 0.015 });
    humor(tl, el('cano'), 'preocupado', 0.9);
    parpadeo(tl, el('cano'), 1.5);
    humor(tl, el('cano'), 'festejo', 2.1);
    humor(tl, el('cano'), 'feliz', 3.3);
    // engranaje: un salto y otro con vuelta carnero
    salto(tl, el('engranaje'), 0.4, { altura: 110, sombra: sombra('engranaje') });
    salto(tl, el('engranaje'), 1.9, { altura: 150, rot: 360, sombra: sombra('engranaje') });
    // lamparita: respira y saluda
    idle(tl, el('lamparita'), 0, 4.4);
    saludo(tl, el('lamparita'), 0.6, { lado: 'der', veces: 3 });
    // llave: festeja
    festejo(tl, el('llave'), 0.5, { saltos: 2, sombra: sombra('llave') });
  },
};
export default seccion;
