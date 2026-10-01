/* Galería · interfaz de la app de usuario: cada pantalla dentro de un teléfono a 1:1, cada componente suelto y una demo del
   dedo en el timeline (toca Plomería → hoja → Programado → rueda de fecha → "Pedir presupuestos").
   ?seccion=app&t=SEGUNDOS congela la demo en ese segundo. */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import { appHeader } from '../ui/AppHeader.ts';
import { bottomNav } from '../ui/BottomNav.ts';
import { tile } from '../ui/Tile.ts';
import { button } from '../ui/Button.ts';
import { bottomSheet, opcionTrabajo } from '../ui/BottomSheet.ts';
import { dateWheel, girarRueda, ponerRueda } from '../ui/DateWheel.ts';
import { starRating, prepararEstrellas, llenarEstrellas } from '../ui/StarRating.ts';
import { priceBreakdown } from '../ui/PriceBreakdown.ts';
import { finger, prepararDedo, entrarDedo, tocar, salirDedo, centro } from '../ui/Finger.ts';
import { pantallaInicio, hojaTipoTrabajo, pantallaFecha, pantallaConfirmar, hojaResena, FECHA } from '../pantallas/usuario.ts';
import { priceWithFee } from '../tokens.ts';

const bloque = (titulo: string, html: string) =>
  `<div style="flex:1 1 100%"><h3 style="margin:0 0 14px;font:700 18px/1.2 var(--hd-font);color:var(--hd-tinta)">${titulo}</h3>`
  + `<div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">${html}</div></div>`;

const muestra = (rotulo: string, html: string, estilo = '') =>
  `<figure style="margin:0;display:flex;flex-direction:column;gap:8px"><div style="position:relative;${estilo}">${html}</div>`
  + `<figcaption style="font:600 13px/1.3 var(--hd-font);color:#4A4A4A">${rotulo}</figcaption></figure>`;

const telefono = (rotulo: string, pantalla: string, id?: string, estado: 'oscuro' | 'claro' = 'oscuro') =>
  muestra(rotulo, phoneFrame({ pantalla, id, estado }), 'width:438px;height:920px');

/** caja del ancho de la pantalla, para los componentes que viven dentro del teléfono */
const caja = (html: string, fondo = '#FFFFFF', extra = '') =>
  `<div style="width:414px;background:${fondo};border-radius:24px;padding:20px 22px;box-sizing:border-box;${extra}">${html}</div>`;

const seccion: Seccion = {
  id: 'app',
  titulo: 'Interfaz de la app',
  render(root, tl) {
    const p = priceWithFee(45000);
    root.innerHTML = [
      bloque('Pantallas (1:1, 414×896 dentro del marco de 438×920)', [
        telefono('Inicio · escena 4', pantallaInicio()),
        telefono('Tipo de trabajo · escena 5', pantallaInicio({ seleccion: 'plomeria' }) + hojaTipoTrabajo({ seleccion: 'programado' })),
        telefono('Fecha · escena 5', pantallaFecha()),
        telefono('Confirmá tu pedido · escena 7', pantallaConfirmar({ exito: false })),
        telefono('Pedido confirmado · escena 7', pantallaConfirmar()),
        telefono('Reseña · escena 9', pantallaInicio() + hojaResena()),
        telefono("appHeader({ variante: 'azul' }) + phoneFrame({ estado: 'claro' })",
          `<div class="hd-capa hd-app">${appHeader({ variante: 'azul', atras: true, titulo: 'Presupuestos · Plomería', ubicacion: false })}</div>`, undefined, 'claro'),
      ].join('')),

      bloque('Demo del dedo (timeline)', telefono('toca Plomería → Programado → fecha → Pedir presupuestos',
        pantallaInicio() + hojaTipoTrabajo() + pantallaFecha(), 'hd-gal-demo')),

      bloque('Componentes', [
        muestra('appHeader() · appHeader({ atras, titulo, ubicacion: false })',
          caja(appHeader(), '#FFFFFF', 'padding:0') + '<div style="height:12px"></div>'
          + caja(appHeader({ ubicacion: false, atras: true, titulo: 'Confirmá tu pedido' }), '#FFFFFF', 'padding:0')),
        muestra("appHeader({ variante: 'azul', atras, titulo })",
          `<div style="width:414px;border-radius:24px;overflow:hidden;padding-top:44px;background:var(--hd-azul)">${appHeader({ variante: 'azul', atras: true, titulo: 'Presupuestos · Plomería', ubicacion: false })}</div>`),
        muestra('bottomNav({ activo })',
          ['inicio', 'agenda', 'mensajes', 'cuenta'].map(a => `<div style="border-radius:20px;overflow:hidden;margin-bottom:10px">${bottomNav({ activo: a as 'inicio' })}</div>`).join('')),
        muestra('tile() · seleccionada', `<div style="display:flex;gap:16px">${tile({ id: 'plomeria', icono: 'plomeria', texto: 'Plomería' })}`
          + `${tile({ id: 'aire', icono: 'aire', texto: 'Aire acondicionado' })}${tile({ id: 'perdida-gas', icono: 'perdida-gas', texto: 'Revisar pérdida de gas' })}`
          + `${tile({ id: 'plomeria-sel', icono: 'plomeria', texto: 'Plomería', seleccionada: true })}</div>`),
        muestra('button({ variante })', caja([
          button({ texto: 'Pedir presupuestos' }),
          button({ texto: 'Consultar', variante: 'secundario', icono: 'mensajes' }),
          button({ texto: 'Confirmar', variante: 'exito' }),
          button({ texto: 'Cancelar pedido', variante: 'peligro' }),
          button({ texto: 'Ver detalle', variante: 'contorno' }),
          `<div style="display:flex;gap:10px">${button({ texto: 'Aceptar', ancho: 'auto' })}${button({ texto: 'Consultar', variante: 'contorno', ancho: 'auto' })}</div>`,
        ].join('<div style="height:12px"></div>'))),
        muestra('opcionTrabajo() · seleccionada', caja(`<div class="hd-opciones">${[
          opcionTrabajo({ id: 'urgencia', icono: 'urgencia', titulo: 'Urgencia', detalle: 'Lo antes posible' }),
          opcionTrabajo({ id: 'programado', icono: 'programado', titulo: 'Programado', detalle: 'Elegís día y horario', seleccionada: true }),
        ].join('')}</div>`, 'var(--hd-hoja-fondo)')),
        muestra('bottomSheet({ titulo, subtitulo, contenido, cerrar })',
          `<div style="position:relative;width:414px;height:420px;border-radius:24px;overflow:hidden;background:#FFFFFF">${bottomSheet({
            titulo: 'Plomería', subtitulo: '¿Qué tipo de trabajo es?', cerrar: true,
            contenido: `<div class="hd-opciones">${opcionTrabajo({ id: 'obra', icono: 'obra', titulo: 'Obra', detalle: 'Un trabajo más grande' })}</div>`,
          })}</div>`),
        muestra('dateWheel() · sobre blanco y sobre hoja gris', caja(dateWheel({
          columnas: [
            { id: 'dia', items: [...FECHA.dias], indice: 2, ancho: 1.45, alinear: 'derecha' },
            { id: 'hora', items: [...FECHA.horas], indice: 2 },
          ],
        })) + '<div style="height:12px"></div>' + caja(dateWheel({
          fondo: '#DEDEDE',
          columnas: [
            { id: 'dia', items: [...FECHA.dias], indice: 0, ancho: 1.45, alinear: 'derecha' },
            { id: 'hora', items: [...FECHA.horas], indice: 4 },
          ],
        }), 'var(--hd-hoja-fondo)')),
        muestra('starRating({ valor: 5 | 3 | 0 }) · demo: llenarEstrellas',
          caja([starRating(), starRating({ valor: 3 }), starRating({ valor: 0, tamano: 44, className: 'hd-gal-estrellas' })].join('<div style="height:14px"></div>'))),
        muestra('priceBreakdown() · priceWithFee(45000)', caja(priceBreakdown({
          filas: [
            { etiqueta: 'Presupuesto de Martín R.', valor: p.budget },
            { etiqueta: 'Tarifa de servicio Handy (5%)', valor: p.fee },
          ],
          total: { etiqueta: 'Total', valor: p.total },
        }))),
        muestra('finger() · yema en (0,0) = cruz roja',
          '<div style="position:absolute;left:70px;top:40px;width:14px;height:2px;margin:-1px 0 0 -7px;background:#E5322D;z-index:70"></div>'
          + '<div style="position:absolute;left:70px;top:40px;width:2px;height:14px;margin:-7px 0 0 -1px;background:#E5322D;z-index:70"></div>'
          + `<div style="position:absolute;left:70px;top:40px">${finger()}</div>`,
          'width:260px;height:300px;background:#FFFFFF;border-radius:24px'),
      ].join('')),
    ].join('');

    // ── demo del dedo ─────────────────────────────────────────────────────
    const tel = root.querySelector<HTMLElement>('#hd-gal-demo')!;
    tel.insertAdjacentHTML('beforeend', finger({ id: 'hd-gal-dedo' }));
    const dedo = tel.querySelector<HTMLElement>('#hd-gal-dedo')!;
    const ficha = tel.querySelector<HTMLElement>('.hd-ficha[data-id="plomeria"]')!;
    const hoja = tel.querySelector<HTMLElement>('[data-pantalla="tipo-de-trabajo"]')!;
    const velo = hoja.querySelector<HTMLElement>('.hd-velo')!;
    const panel = hoja.querySelector<HTMLElement>('.hd-hoja')!;
    const opcion = hoja.querySelector<HTMLElement>('.hd-opcion[data-id="programado"]')!;
    const fecha = tel.querySelector<HTMLElement>('[data-pantalla="fecha"]')!;
    const rueda = fecha.querySelector<HTMLElement>('.hd-rueda')!;
    const pedir = fecha.querySelector<HTMLElement>('.hd-boton[data-accion="pedir-presupuestos"]')!;
    const resumen = fecha.querySelector<HTMLElement>('.hd-resumen')!;

    // estados iniciales
    prepararDedo(dedo);
    gsap.set(velo, { opacity: 0 });
    gsap.set(panel, { yPercent: 100 });
    gsap.set(fecha, { xPercent: 100 });
    ponerRueda(rueda, 'dia', 0);
    ponerRueda(rueda, 'hora', 4);
    gsap.set(resumen, { opacity: 0, y: 12 });

    const apretar = (el: HTMLElement, t: number) => {
      tl.to(el, { scale: 0.94, duration: 0.08, ease: 'power2.out' }, t);
      tl.to(el, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.14);
    };

    const a = centro(ficha, tel);
    entrarDedo(tl, dedo, 330, 760, 0.3);
    const t1 = tocar(tl, dedo, a.x, a.y, 1.1);
    apretar(ficha, t1.toque);
    tl.to(ficha.querySelector('.hd-ficha-sel'), { opacity: 1, duration: 0.18 }, t1.toque);

    tl.to(velo, { opacity: 1, duration: 0.4, ease: 'power1.out' }, 2.1);
    tl.to(panel, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 2.1);

    const b = centro(opcion, tel);
    const t2 = tocar(tl, dedo, b.x, b.y, 2.9);
    apretar(opcion, t2.toque);
    tl.to(opcion.querySelector('.hd-opcion-sel'), { opacity: 1, duration: 0.18 }, t2.toque);
    tl.set(opcion.querySelector('.hd-opcion-sel .hd-opcion-marca'), { scale: 0.3 }, t2.toque);
    tl.to(opcion.querySelector('.hd-opcion-sel .hd-opcion-marca'), { scale: 1, duration: 0.4, ease: 'back.out(3)' }, t2.toque);

    tl.to(fecha, { xPercent: 0, duration: 0.7, ease: 'expo.inOut' }, 4.1);
    girarRueda(tl, rueda, 'dia', FECHA.dia, 5.0, { dur: 0.9 });
    girarRueda(tl, rueda, 'hora', FECHA.hora, 5.25, { dur: 0.8 });
    tl.to(resumen, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 6.0);

    const c = centro(pedir, tel);
    const t3 = tocar(tl, dedo, c.x, c.y, 6.3);
    apretar(pedir, t3.toque);
    salirDedo(tl, dedo, t3.toque + 0.6);

    // estrellas que se completan (muestra de llenarEstrellas)
    const est = root.querySelector<HTMLElement>('.hd-gal-estrellas')!;
    prepararEstrellas(est);
    llenarEstrellas(tl, est, 1.0, { paso: 0.5 });
  },
};
export default seccion;
