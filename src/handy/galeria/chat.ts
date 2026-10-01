/* Galería · chat, presupuesto, mapa y seguimiento (solo desarrollo).
   ?seccion=chat · ?t=SEGUNDOS congela la demo de seguimiento (0–9 s: radar → en camino → llegó). */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import { avatar } from '../ui/Avatar.ts';
import { verifiedBadge } from '../ui/VerifiedBadge.ts';
import { chatHeader } from '../ui/ChatHeader.ts';
import { burbujaEscribiendo, chatBubble, marcaVisto } from '../ui/ChatBubble.ts';
import { chatInput } from '../ui/ChatInput.ts';
import { systemChip } from '../ui/SystemChip.ts';
import { photoCard } from '../ui/PhotoCard.ts';
import { chatPresupuesto } from '../ui/ChatPresupuesto.ts';
import { mapView, moverPorRuta, RUTA_PUNTOS, type EstadoSeguimiento } from '../ui/MapView.ts';
import { trackingPanel } from '../ui/TrackingPanel.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import {
  ESPECIALISTAS, GRUPOS_PROBLEMA, PRESUPUESTOS, grupoMensajeria, pantallaChatEspecialista, pantallaPresupuestos,
  pantallaSeguimiento, presupuestoProps,
} from '../pantallas/usuario-chat.ts';

const ESTADOS: EstadoSeguimiento[] = ['buscando', 'en-camino', 'llego'];

/** bloque con etiqueta */
function bloque(titulo: string, html: string, estilo = ''): string {
  return `<div style="display:flex;flex-direction:column;gap:10px;${estilo}">`
    + `<div style="font:700 13px/1.2 var(--hd-font);color:#3A3A3A;letter-spacing:.02em">${titulo}</div>${html}</div>`;
}
const fila = (html: string, gap = 16, extra = '') => `<div style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:${gap}px;${extra}">${html}</div>`;
const columna = (html: string, fondo: string, ancho = 386, gap = 10) =>
  `<div style="display:flex;flex-direction:column;gap:${gap}px;width:${ancho}px;padding:14px 12px;border-radius:20px;background:${fondo}">${html}</div>`;
const telefono = (pantalla: string, estado: 'oscuro' | 'claro' = 'oscuro', hora = '10:41') =>
  `<div style="position:relative;width:438px;height:920px;flex:none">${phoneFrame({ pantalla, estado, hora })}</div>`;

const seccion: Seccion = {
  id: 'chat',
  titulo: 'Chat, mapa y seguimiento',
  render(root, tl) {
    const m = ESPECIALISTAS.martin;
    const html: string[] = [];

    html.push(bloque('Avatar · insignia Verificado', fila(
      avatar({ iniciales: 'MR', color: m.color })
      + avatar({ iniciales: 'LG', color: ESPECIALISTAS.lucia.color })
      + avatar({ iniciales: 'DP', color: ESPECIALISTAS.diego.color })
      + avatar({ icono: 'plomeria', color: 'var(--hd-azul)' })
      + avatar({})
      + avatar({ iniciales: 'MR', color: m.color, tamano: 64 })
      + `<span style="display:inline-flex;padding:8px;border-radius:12px;background:#ECEAE3">${avatar({ iniciales: 'MR', color: m.color, tamano: 46, anillo: true })}</span>`
      + verifiedBadge()
      + verifiedBadge({ conTexto: false, tamano: 20 })
      + `<span style="display:inline-flex;padding:8px 12px;border-radius:12px;background:var(--hd-azul)">${verifiedBadge({ sobreAzul: true })}</span>`,
      14, 'align-items:center')));

    html.push(bloque('Encabezados de chat', fila(
      `<div style="width:386px;border-radius:20px;overflow:hidden">${chatHeader({ nombre: 'Presupuestos · Plomería', subtitulo: 'Jue 15 oct · 16:00', avatar: { icono: 'plomeria', color: 'var(--hd-azul)' } })}</div>`
      + `<div style="width:386px;border-radius:20px;overflow:hidden">${chatHeader({ nombre: m.nombre, verificado: true, subtitulo: 'Plomería · en camino', avatar: { iniciales: 'MR', color: m.color } })}</div>`
      + `<div style="width:386px;border-radius:20px;overflow:hidden">${chatHeader({ nombre: 'Vecinos del edificio', subtitulo: 'Vos, Ana, Carlos y más', tema: 'mensajeria', avatar: { icono: 'casa', color: '#7E9AA8' } })}</div>`)));

    html.push(bloque('Burbujas · tema handy', columna(
      chatBubble({ lado: 'entrante', texto: '¡Hola! Estoy a unas cuadras.', hora: '16:04' })
      + chatBubble({ lado: 'entrante', texto: '¿Me mandás una foto de la pérdida? Así llevo el repuesto justo.', hora: '16:04' })
      + chatBubble({ lado: 'saliente', texto: 'Dale, ahí va.', hora: '16:05', tildes: 'leido' })
      + chatBubble({ lado: 'saliente', texto: 'Sin hora ni tildes, como las pantallas originales.' })
      + chatBubble({ lado: 'saliente', foto: photoCard({ ancho: 200, alto: 240 }), texto: 'Es abajo de la bacha.', hora: '16:05', tildes: 'entregado' })
      + burbujaEscribiendo(),
      '#DDDDDD')));

    html.push(bloque('Burbujas · tema mensajería', columna(
      chatBubble({ tema: 'mensajeria', lado: 'saliente', texto: '¿Alguien tiene un plomero?', hora: '10:02', tildes: 'entregado' })
      + chatBubble({ tema: 'mensajeria', lado: 'saliente', texto: 'Enviado, sin entregar.', hora: '10:03', tildes: 'enviado', cola: false })
      + chatBubble({ tema: 'mensajeria', lado: 'entrante', autor: 'Mamá', texto: 'Tu tío tenía uno, preguntale.', hora: '12:52' })
      + chatBubble({ tema: 'mensajeria', lado: 'entrante', autor: 'Carlos', texto: 'Ni idea, che.', hora: '16:41' })
      + chatBubble({ tema: 'mensajeria', lado: 'saliente', texto: '¿Alguien tiene un plomero?', hora: '19:15', tildes: 'leido', visto: true })
      + `<div style="align-self:flex-end">${marcaVisto('Visto 19:20')}</div>`
      + burbujaEscribiendo({ tema: 'mensajeria' }),
      '#EFEAE2', 386, 8)));

    html.push(bloque('Barra para escribir · avisos del sistema', columna(
      systemChip({ icono: 'escudo', texto: 'Tu pedido llegó a especialistas verificados.' })
      + systemChip({ icono: 'candado', texto: 'Tu teléfono no se comparte' })
      + systemChip({ icono: 'candado', texto: 'Tu teléfono no se comparte', tono: 'neutro' })
      + `<div style="margin:6px -12px -14px;border-radius:0 0 20px 20px;overflow:hidden">${chatInput()}</div>`,
      '#DDDDDD')));

    html.push(bloque('Foto del problema (SVG)', fila(
      photoCard({ ancho: 190, alto: 230, pie: 'Es abajo de la bacha.' })
      + photoCard({ ancho: 320, alto: 400, radio: 18 }))));

    html.push(bloque('Presupuesto · ×1 (340 px) en el chat', columna(
      systemChip({ icono: 'escudo', texto: 'Tu pedido llegó a especialistas verificados.' })
      + PRESUPUESTOS.map(d => chatPresupuesto(presupuestoProps(d))).join(''),
      '#DDDDDD', 386, 12)));

    html.push(bloque('Presupuesto · ×1,4 (elegido) · ×1 atenuado · sin acciones', fila(
      chatPresupuesto(presupuestoProps(PRESUPUESTOS[0], { escala: 1.4, elegido: true }))
      + chatPresupuesto(presupuestoProps(PRESUPUESTOS[1], { atenuado: true }))
      + chatPresupuesto(presupuestoProps(PRESUPUESTOS[2], { acciones: false })),
      24, 'padding:20px;border-radius:20px;background:var(--hd-gris)')));

    html.push(bloque('Comparación lado a lado en el escenario (1440 px, ×1,28)', `<div style="display:flex;justify-content:center;align-items:flex-start;gap:28px;width:1440px;padding:40px 0;border-radius:20px;background:var(--hd-gris)">${
      PRESUPUESTOS.map(d => chatPresupuesto(presupuestoProps(d, { escala: 1.28, elegido: d.elegido, acciones: true }))).join('')}</div>`));

    html.push(bloque('Mapa (414×560) + panel de seguimiento · tres estados', fila(
      ESTADOS.map(e => `<div style="display:flex;flex-direction:column;gap:12px">${mapView({ estado: e })}${trackingPanel({ nombre: 'Martín R.', estado: e, avatar: { iniciales: 'MR', color: m.color } })}</div>`).join(''),
      24)));

    html.push(bloque('Pantallas en el teléfono', fila(
      telefono(pantallaPresupuestos())
      + telefono(pantallaPresupuestos({ elegido: true }).replace('class="hd-chat-lista"', 'class="hd-chat-lista" style="transform:translateY(-420px)"'))
      + telefono(pantallaChatEspecialista(), 'oscuro', '16:05')
      + ESTADOS.map(e => telefono(pantallaSeguimiento(e), 'claro', '16:04')).join(''),
      24)));

    html.push(bloque('Escena 2 · grupos de mensajería genéricos', fila(
      GRUPOS_PROBLEMA.map(g => grupoMensajeria(g)).join(''), 24, 'padding:24px;border-radius:20px;background:var(--hd-gris)')));

    // demo animada: radar → en camino (puntos + recorrido) → llegó, con el panel cruzando estados
    html.push(bloque('Demo de seguimiento (timeline de la galería · ?t= congela)', `<div class="hd-gal-demo-seg" style="position:relative;width:414px;height:860px;border-radius:28px;overflow:hidden;background:#fff">`
      + `<div style="position:absolute;left:0;top:0">${mapView({ estado: 'buscando', alto: 600 })}</div>`
      + `<div style="position:absolute;left:0;bottom:0">${trackingPanel({ nombre: 'Martín R.', estado: 'buscando', avatar: { iniciales: 'MR', color: m.color } })}</div></div>`));

    root.innerHTML = html.join('');

    // ── timeline de la demo ──
    const demo = root.querySelector<HTMLElement>('.hd-gal-demo-seg')!;
    const q = <T extends Element = HTMLElement>(s: string) => Array.from(demo.querySelectorAll<T>(s));
    const anillos = q('.hd-radar');
    const puntos = q('.hd-ruta-punto');
    const pin = demo.querySelector<HTMLElement>('.hd-pin-especialista')!;
    const casa = demo.querySelector<HTMLElement>('.hd-pin-casa')!;
    const capa = (e: EstadoSeguimiento) => demo.querySelector<HTMLElement>(`.hd-seg-estado[data-estado="${e}"]`)!;
    const relleno = (i: number) => demo.querySelector<HTMLElement>(`.hd-seg-tramo[data-i="${i}"] .hd-seg-relleno`)!;

    gsap.set(anillos, { scale: 0.15, opacity: 0 });
    gsap.set(puntos, { opacity: 0, scale: 0 });
    gsap.set(pin, { x: 0, y: 0, opacity: 0, scale: 0.4 });
    gsap.set([relleno(0), relleno(1), relleno(2)], { scaleX: 0 });

    // buscando: el primer tramo se llena mientras el radar late
    tl.to(relleno(0), { scaleX: 1, duration: 3.2, ease: 'none' }, 0.1);
    for (let k = 0; k < 3; k++) {
      anillos.forEach((a, i) => {
        const at = 0.1 + k * 1.1 + i * 0.36;
        tl.set(a, { scale: 0.15, opacity: 0.9 }, at);
        tl.to(a, { scale: 1, opacity: 0, duration: 1.1, ease: 'power1.out' }, at);
      });
    }
    // en camino: aparece Martín, se dibuja la ruta punto a punto y la recorre
    tl.to(capa('buscando'), { opacity: 0, duration: 0.3 }, 3.6);
    tl.to(capa('en-camino'), { opacity: 1, duration: 0.3 }, 3.7);
    tl.to(pin, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 3.6);
    tl.to(puntos, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)', stagger: 0.03 }, 3.8);
    const T = 4.7, DUR = 3;
    moverPorRuta(tl, pin, T, { dur: DUR });
    tl.to(relleno(1), { scaleX: 1, duration: DUR, ease: 'power1.inOut' }, T);
    // los puntos ya recorridos se apagan cuando pasa el pin (inversa de power1.inOut)
    const inv = (p: number) => (p < 0.5 ? Math.sqrt(p / 2) : 1 - Math.sqrt((1 - p) / 2));
    puntos.forEach((p, i) => tl.to(p, { opacity: 0, scale: 0.4, duration: 0.2 }, T + DUR * inv(RUTA_PUNTOS[i].t)));
    // llegó
    tl.to(capa('en-camino'), { opacity: 0, duration: 0.3 }, T + DUR);
    tl.to(capa('llego'), { opacity: 1, duration: 0.3 }, T + DUR + 0.1);
    tl.to(relleno(2), { scaleX: 1, duration: 0.5, ease: 'power2.out' }, T + DUR);
    tl.to(casa, { scale: 1.15, duration: 0.18, ease: 'power2.out', transformOrigin: '50% 100%' }, T + DUR + 0.1);
    tl.to(casa, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, T + DUR + 0.28);
    tl.to({}, { duration: 1.2 }, T + DUR + 0.8);
  },
};
export default seccion;
