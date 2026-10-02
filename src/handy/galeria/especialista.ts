/* Galería · app del especialista (pantallas/especialista.ts): cada pantalla dentro de un teléfono a 1:1, las piezas sueltas
   (interruptor, cronómetro, calendario, avisos) y una demo en el timeline (se prende Trabajando, el pulso, el cronómetro
   salta de 00:00 a 42:15 y los dígitos del presupuesto entran de a uno).
   ?seccion=especialista&t=SEGUNDOS congela la demo en ese segundo. */
import type { Seccion } from './tipos.ts';
import { phoneFrame } from '../ui/PhoneFrame.ts';
import { interruptor, ponerInterruptor, prenderInterruptor } from '../ui/Interruptor.ts';
import { cronometro, ponerCrono, saltarCrono } from '../ui/Cronometro.ts';
import { calendario } from '../ui/Calendario.ts';
import { handy } from '../handys.ts';
import {
  pantallaInicioEsp, tarjetaPedido, hojaPresupuesto, avisoElegido, pantallaAgenda, pantallaChatCliente, pantallaEnCamino,
  pantallaTrabajo, pantallaFin, avisoCobro, resenaCliente, tarjetaElegido, tarjetaCobro, tarjetaResena, HORAS, CRONO,
  FIN_ESCENARIO, prepararMonto, escribirMonto, prepararPulso, pulsar,
} from '../pantallas/especialista.ts';

const bloque = (titulo: string, html: string) =>
  `<div style="flex:1 1 100%"><h3 style="margin:0 0 14px;font:700 18px/1.2 var(--hd-font);color:var(--hd-tinta)">${titulo}</h3>`
  + `<div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">${html}</div></div>`;

const muestra = (rotulo: string, html: string, estilo = '') =>
  `<figure style="margin:0;display:flex;flex-direction:column;gap:8px"><div style="position:relative;${estilo}">${html}</div>`
  + `<figcaption style="font:600 13px/1.3 var(--hd-font);color:#4A4A4A">${rotulo}</figcaption></figure>`;

const telefono = (rotulo: string, pantalla: string, { id, hora, estado = 'oscuro' }: { id?: string; hora?: string; estado?: 'oscuro' | 'claro' } = {}) =>
  muestra(rotulo, phoneFrame({ pantalla, id, hora, estado }), 'width:438px;height:920px');

const caja = (html: string, fondo = '#FFFFFF', extra = '') =>
  `<div style="width:414px;background:${fondo};border-radius:24px;padding:20px 22px;box-sizing:border-box;${extra}">${html}</div>`;

/** Gota y Caño festejando en el escenario de pantallaFin (lo que hará la escena 8), para ver la medida. */
const handysFin = () => {
  const e = FIN_ESCENARIO;
  return `<div style="position:absolute;left:${e.x + 46}px;top:${e.y + e.piso - 150}px">${handy('gota', { altura: 150, humor: 'festejo' })}</div>`
    + `<div style="position:absolute;left:${e.x + 160}px;top:${e.y + e.piso - 230}px">${handy('cano', { altura: 230, humor: 'festejo' })}</div>`;
};

const seccion: Seccion = {
  id: 'especialista',
  titulo: 'App del especialista',
  render(root, tl) {
    root.innerHTML = [
      bloque('Pantallas (1:1, 414×896 dentro del marco de 438×920)', [
        telefono('1 · pantallaInicioEsp({ trabajando: false })', pantallaInicioEsp({ trabajando: false }), { hora: HORAS.pedido }),
        telefono('1 · pantallaInicioEsp() · Trabajando', pantallaInicioEsp(), { hora: HORAS.pedido }),
        telefono('2 · + tarjetaPedido()', pantallaInicioEsp() + tarjetaPedido(), { hora: HORAS.pedido }),
        telefono('3 · + hojaPresupuesto({ enviado: false })', pantallaInicioEsp() + tarjetaPedido() + hojaPresupuesto({ enviado: false }), { hora: HORAS.pedido }),
        telefono('3 · hojaPresupuesto() · enviado', pantallaInicioEsp() + tarjetaPedido() + hojaPresupuesto(), { hora: HORAS.pedido }),
        telefono('4 · + avisoElegido()', pantallaInicioEsp() + avisoElegido(), { hora: HORAS.manana }),
        telefono('5 · pantallaAgenda()', pantallaAgenda(), { hora: HORAS.manana }),
        telefono('6 · pantallaChatCliente()', pantallaChatCliente(), { hora: HORAS.chat }),
        telefono("7 · pantallaEnCamino() · phoneFrame({ estado: 'claro' })", pantallaEnCamino(), { hora: HORAS.camino, estado: 'claro' }),
        telefono("7 · pantallaEnCamino({ estado: 'llego' })", pantallaEnCamino({ estado: 'llego' }), { hora: HORAS.llego, estado: 'claro' }),
        telefono('8 · pantallaTrabajo()', pantallaTrabajo(), { hora: HORAS.trabajo }),
        telefono('9 · pantallaFin() (con Gota y Caño de muestra)', pantallaFin() + `<div class="hd-capa">${handysFin()}</div>`, { hora: HORAS.trabajo }),
        telefono('10 · pantallaFin() + resenaCliente() + avisoCobro()', pantallaFin() + resenaCliente() + avisoCobro(), { hora: HORAS.cobro }),
      ].join('')),

      bloque('Demo (timeline): Trabajando → pulso · cronómetro · dígitos del presupuesto', [
        telefono('inicio: se prende Trabajando', pantallaInicioEsp({ trabajando: false }), { id: 'hd-gal-esp-inicio', hora: HORAS.manana }),
        telefono('trabajo: 00:00 → 42:15', pantallaTrabajo(), { id: 'hd-gal-esp-trabajo', hora: HORAS.trabajo }),
        telefono('presupuesto: dígito por semicorchea', pantallaInicioEsp() + tarjetaPedido() + hojaPresupuesto({ enviado: false }), { id: 'hd-gal-esp-presu', hora: HORAS.manana }),
      ].join('')),

      bloque('Piezas sueltas', [
        muestra('interruptor() · prendido', caja(`<div style="display:flex;gap:18px;align-items:center">${interruptor()}${interruptor({ prendido: true })}${interruptor({ prendido: true, ancho: 84, alto: 48 })}</div>`)),
        muestra("cronometro({ valor: '42:15' }) · '00:00'", caja(`<div style="color:#FFFFFF;background:var(--hd-azul);border-radius:20px;padding:10px 0">${cronometro()}</div>`
          + '<div style="height:12px"></div>' + `<div style="color:var(--hd-azul)">${cronometro({ valor: '00:00', tamano: 56 })}</div>`)),
        muestra('calendario({ marcados: [15] }) · octubre 2026', caja(calendario({ marcados: [15] }))),
        muestra('tarjetaElegido()', `<div style="width:354px">${tarjetaElegido()}</div>`),
        muestra('tarjetaCobro() · tarjetaResena()', `<div style="width:390px">${tarjetaCobro()}</div><div style="height:16px"></div><div style="width:354px">${tarjetaResena()}</div>`),
      ].join('')),
    ].join('');

    // ── demo: se prende Trabajando y el mapa se despierta ─────────────────
    const ini = root.querySelector<HTMLElement>('#hd-gal-esp-inicio')!;
    const llave = ini.querySelector<HTMLElement>('.hd-interruptor')!;
    const velo = ini.querySelector<HTMLElement>('.hd-esp-mapa-velo')!;
    ponerInterruptor(llave, false);
    prepararPulso(ini);
    prenderInterruptor(tl, llave, 1.0);
    tl.to(velo, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.0);
    pulsar(tl, ini, 1.2);

    // ── demo: el cronómetro salta ─────────────────────────────────────────
    const crono = root.querySelector<HTMLElement>('#hd-gal-esp-trabajo .hd-crono')!;
    ponerCrono(crono, CRONO.inicio);
    ['00:07', '05:32', '18:49', '31:04', CRONO.final].forEach((v, i) => saltarCrono(tl, crono, v, 1.0 + i * 0.5, { dur: 0.3 }));

    // ── demo: los dígitos del presupuesto entran de a uno ─────────────────
    const presu = root.querySelector<HTMLElement>('#hd-gal-esp-presu [data-pantalla="presupuesto"]')!;
    const mo = presu.querySelector('.hd-esp-monto[data-monto="mano-de-obra"]')!;
    const mat = presu.querySelector('.hd-esp-monto[data-monto="materiales"]')!;
    prepararMonto(mo);
    prepararMonto(mat);
    const t = escribirMonto(tl, mo, 1.0);
    escribirMonto(tl, mat, t[t.length - 1] + 0.375);
  },
};
export default seccion;
