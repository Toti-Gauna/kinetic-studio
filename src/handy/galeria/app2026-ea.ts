/* Galería · App 2026 · especialista: pedido y precio (app/especialista-pedido.ts). ?seccion=app2026-ea
   Cada pantalla (y cada estado) dentro del teléfono a 1:1 con data-captura="ea-<nombre>" en la pantalla de 414×896, para
   compararla con su foto (galeria.mjs del scratchpad guarda una PNG por pieza), y las piezas sueltas.
   Demo en el timeline (&t=SEGUNDOS la congela): baja el aviso, llega el pedido, "Aceptar con otro precio", sube la hoja
   "Tu precio", escribe $ 45.000 (advertencia con los montos bajos), Listo, Recibís $ 40.500, Enviar presupuesto y entra
   "Presupuesto enviado" con los puntitos. Marcas: 0,6 baja el aviso · 1,4 llega el pedido · 2,75 «Aceptar con otro
   precio» · 3 sube la hoja · 4,1 teclado en $ 0 · 4,9 / 5,3 / 5,7 / 6,1 / 6,6 teclas 4 · 5 · 0 · 0 · 0 (el teclado no se
   mueve) · 7,2 Listo · 8,2 desplaza · 9 Enviar · 9,4 Presupuesto enviado · 10,5 puntitos.
   Segunda demo (el camino corto): 1,2 «+ $ 1.000» → $ 45.000 y Recibís $ 40.500 · 2,2 desplaza y Enviar.
   ea-calibra-29 es la tarjeta con los datos de la foto 29 (Gas · Programado), solo para medirla contra la foto. */
import { gsap } from 'gsap';
import type { Seccion } from './tipos.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import { pantallaInicioEspecialista } from '../app/especialista.ts';
import {
  avisoNuevoPedido, tarjetaPedido, rutaPedido, pantallaPedido, llegaPedido, hojaTuPrecio, escribirPrecio, confirmarPrecio,
  sumarRapido, enviarPresupuesto, pantallaAceptado, tarjetaResumen, latirPuntos, entrarAceptado, MONTOS_PRECIO,
  DESPLAZAMIENTO_ENVIAR,
} from '../app/especialista-pedido.ts';
import { barraDelAviso, bajarAviso, subirAviso } from '../app/ui/aviso.ts';
import { apretarBoton } from '../app/ui/botones.ts';
import { subirHoja } from '../app/ui/hoja.ts';
import { acomodarMonto } from '../app/ui/teclado.ts';

const bloque = (titulo: string, html: string) =>
  `<div style="flex:1 1 100%"><h3 style="margin:0 0 14px;font:700 18px/1.2 var(--hd-font);color:var(--hd-tinta)">${titulo}</h3>`
  + `<div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">${html}</div></div>`;

const muestra = (rotulo: string, html: string, estilo = '') =>
  `<figure style="margin:0;display:flex;flex-direction:column;gap:8px"><div style="position:relative;${estilo}">${html}</div>`
  + `<figcaption style="font:600 13px/1.3 var(--hd-font);color:#4A4A4A;max-width:440px">${rotulo}</figcaption></figure>`;

/** Teléfono con la pantalla; la pantalla (414×896, con la barra de estado) lleva data-captura. */
const telefono = (rotulo: string, captura: string, pantalla: string, estado: 'oscuro' | 'claro' = 'claro', id?: string) =>
  muestra(rotulo, phoneFrame({ pantalla, hora: '9:41', estado, id }).replace('class="hd-pantalla"', `class="hd-pantalla"${captura ? ` data-captura="${captura}"` : ''}`),
    'width:438px;height:920px');

/** Pieza suelta en una caja con data-captura. */
const pieza = (rotulo: string, captura: string, html: string, { w = 414, h, fondo = '#FFFFFF', pad = 0 }: { w?: number; h?: number; fondo?: string; pad?: number } = {}) =>
  muestra(rotulo, `<div class="ap-ui"${captura ? ` data-captura="${captura}"` : ''} style="position:relative;width:${w}px;${h ? `height:${h}px;` : ''}background:${fondo};padding:${pad}px;box-sizing:border-box;overflow:hidden">${html}</div>`);

/** Los datos de la foto 29-e-pedido-programado, solo para medir la tarjeta contra la foto. */
const CALIBRA_29 = {
  rubro: 'Gas', icono: 'llama', tipo: { texto: 'Programado', tono: 'celeste', icono: 'agenda' },
  cita: '«Quiero instalar un anafe nuevo en la cocina.»', renglones: 1, sugerido: '$ 36.000',
  datos: [
    { id: 'dia', rotulo: 'Día que eligió el cliente', icono: 'calendario', valor: 'Jueves 26/11', ancho: 188.1 },
    { id: 'franja', rotulo: 'Franja', icono: 'reloj', valor: 'de 9 a 11 h', ancho: 146.6 },
  ],
  ubicacion: 'Los Troncos · a 3,1 km',
} as const;

const inicio = () => pantallaInicioEspecialista({ disponible: true });

const seccion: Seccion = {
  id: 'app2026-ea',
  titulo: 'App 2026 · especialista: pedido y precio',
  render(root, tl) {
    root.innerHTML = [
      bloque('Pantallas (1:1, 414×896 dentro del marco de 438×920)', [
        telefono('ea-aviso · avisoNuevoPedido() sobre e-inicio-2 (03-e-precio, arriba)', 'ea-aviso', inicio() + avisoNuevoPedido()),
        telefono('ea-pedido · pantallaPedido() = 29-e-pedido-programado con la urgencia', 'ea-pedido', pantallaPedido()),
        telefono('ea-calibra-29 · calibración: pantallaPedido() con los datos de la foto 29 (Gas · Programado), en su lugar', 'ea-calibra-29',
          pantallaPedido({ abajo: 801.6, pedido: CALIBRA_29 })),
        telefono('ea-precio · hojaTuPrecio() + aviso = 03-e-precio', 'ea-precio', inicio() + hojaTuPrecio() + avisoNuevoPedido()),
        ...[1, 2, 3, 4, 5, 6].map(i => telefono(`ea-precio-${i + 1} · hojaTuPrecio({ modo: 'teclado', monto: ${i} }) «${MONTOS_PRECIO[i].replace('!', '')}» = 0${i + 3}-e-precio-${i + 1}`,
          `ea-precio-${i + 1}`, inicio() + hojaTuPrecio({ modo: 'teclado', monto: i }))),
        telefono("ea-precio-listo · hojaTuPrecio({ monto: 6, rapido: -1, recibis: 1 }) (después de Listo)", 'ea-precio-listo',
          inicio() + hojaTuPrecio({ monto: 6, rapido: -1, recibis: 1 })),
        telefono(`ea-precio-enviar · … desplazado: ${DESPLAZAMIENTO_ENVIAR} (Recibís $ 40.500 + Enviar presupuesto)`, 'ea-precio-enviar',
          inicio() + hojaTuPrecio({ monto: 6, rapido: -1, recibis: 1, desplazado: DESPLAZAMIENTO_ENVIAR })),
        telefono('ea-precio-mil · hojaTuPrecio({ monto: 6, rapido: 1, recibis: 1 }) (el camino corto: + $ 1.000)', 'ea-precio-mil',
          inicio() + hojaTuPrecio({ monto: 6, rapido: 1, recibis: 1 })),
        telefono('ea-aceptado · pantallaAceptado() = 10-e-aceptado', 'ea-aceptado', pantallaAceptado()),
      ].join('')),

      bloque('Demos (timeline)', [
        telefono('demo: aviso → pedido → Tu precio → $ 45.000 → Listo → Enviar → Presupuesto enviado', '',
          inicio() + pantallaPedido() + hojaTuPrecio() + pantallaAceptado() + avisoNuevoPedido(), 'claro', 'ap-ea-demo'),
        telefono('demo: el camino corto (+ $ 1.000)', '', inicio() + hojaTuPrecio(), 'claro', 'ap-ea-demo-mil'),
      ].join('')),

      bloque('Piezas', [
        pieza('avisoNuevoPedido({ capa: false })', 'ea-pieza-aviso', avisoNuevoPedido({ capa: false }), { h: 100, fondo: '#5F6B84' }),
        pieza('tarjetaPedido()', 'ea-pieza-tarjeta', tarjetaPedido({ estilo: 'left:16px;top:16px' }), { h: 436, fondo: '#E6E9EE' }),
        pieza('rutaPedido() (recortada: y 180 → 360)', 'ea-pieza-ruta', `<div style="position:absolute;left:0;top:-180px">${rutaPedido()}</div>`, { h: 180, fondo: '#E6E9EE' }),
        pieza('tarjetaResumen()', 'ea-pieza-resumen', tarjetaResumen({ estilo: 'left:24px;top:16px' }), { h: 300, fondo: '#FFFFFF' }),
      ].join('')),
    ].join('');

    // los avisos ya bajaron en las capturas: la barra de estado y la isla quedan apagadas (como al final de bajarAviso)
    root.querySelectorAll('[data-captura] .ap-aviso-capa').forEach(a => gsap.set(barraDelAviso(a), { opacity: 0 }));
    // los montos se acomodan midiendo (el + sigue al valor, como en las fotos)
    root.querySelectorAll('.ap-monto').forEach(m => acomodarMonto(m));

    // ── demo larga ───────────────────────────────────────────────────────
    const demo = root.querySelector('#ap-ea-demo');
    if (demo) {
      const capa = (p: string) => demo.querySelector(`[data-pantalla="${p}"]`)!;
      const pedido = capa('e-pedido'), precio = capa('hoja-tu-precio'), aceptado = capa('e-aceptado'), avisoCapa = capa('aviso-nuevo-pedido');
      gsap.set(pedido, { opacity: 0 });
      gsap.set(aceptado, { opacity: 0 });
      gsap.set(precio.querySelector('.ap-velo'), { opacity: 0 });
      gsap.set(precio.querySelector('.ap-hoja'), { y: 820 });
      gsap.set(avisoCapa.querySelector('.ap-aviso'), { y: -110 });
      bajarAviso(tl, avisoCapa, 0.6);
      tl.to(pedido, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 1.4);
      llegaPedido(tl, pedido, 1.4);
      subirAviso(tl, avisoCapa, 2.3);
      apretarBoton(tl, pedido.querySelector('[data-accion="aceptar-otro-precio"]')!, 2.75);
      subirHoja(tl, precio, 3.0);
      const d = escribirPrecio(tl, precio, 3.9);
      const t = 3.9 + d + 0.25;
      const d2 = confirmarPrecio(tl, precio, t);
      const t2 = t + d2 + 0.3;
      const d3 = enviarPresupuesto(tl, precio, t2);
      const t3 = t2 + d3 + 0.15;
      tl.to(aceptado, { opacity: 1, duration: 0.3, ease: 'power1.out' }, t3);
      entrarAceptado(tl, aceptado, t3);
      latirPuntos(tl, aceptado, t3 + 1.1, { vueltas: 4 });
    }

    // ── demo corta: + $ 1.000 ────────────────────────────────────────────
    const mil = root.querySelector('#ap-ea-demo-mil [data-pantalla="hoja-tu-precio"]');
    if (mil) {
      sumarRapido(tl, mil, 1.2);
      enviarPresupuesto(tl, mil, 2.2);
    }
  },
};
export default seccion;
