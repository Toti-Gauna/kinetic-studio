/* HANDY · Anuncios — la película (la misma en los dos formatos). trailers/handy-vertical y trailers/handy-anuncio
   llaman pelicula({ stage, meta }) desde su js/trailer.js. Ver STORYBOARD.md (en esta carpeta).

     0–4    gancho        'ha-golpe'  ¿Se rompió / algo? · ¿Sabés / arreglarlo?
     4–6    marca         'ha-marca'  los cinco Handys saltan y arman el logo: Handy · Soluciones, no problemas
     6–14   usuario       'ha-usuario'  Pedí lo que necesitás → Te llegan presupuestos → Elegí el tuyo
    14–16   giro          'ha-golpe'  ¿Y si sos / especialista?
    16–24   especialista  'ha-especialista'  Te llegan pedidos cerca → Vos ponés el precio → ¡Te eligieron!
    24–26   remate        'ha-golpe'  Para el que necesita. · Para el que sabe.
    26–30   final         'ha-final'  logo, los Handys y "Mar del Plata · Llegamos el 28/10"; el último cuadro queda
   Cada escena declara `dur`: src/handy/player.ts corta el build si la receta devuelve otra. */
import { PARTITURA } from './partitura.js';

export function pelicula({ stage, meta }) {
  return {
    stage,
    lang: 'es',
    locale: 'es-AR',
    meta: { title: 'Handy', hud: 'HANDY', back: '../../index.html', ...meta },
    ui: {
      play: 'Tocá para empezar', seconds: 'segundos', sound: 'con sonido', replay: 'Ver de nuevo', back: 'Volver',
      keys: 'Tocá la pantalla para pausar', paused: 'En pausa', soundOn: 'Sonido activado', soundOff: 'Sin sonido',
      particles: '',
    },
    palette: {
      night: '#CFCFCF', ink: '#141414', paper: '#FFFFFF',
      accents: ['#1F57A8', '#2F6BFF', '#F5F59A', '#4A72B0', '#8EC5FF', '#9C9C9C'],
    },
    fonts: { display: 'Inter', mono: 'Inter', serif: 'Inter', stretch: false },
    qrUrl: '',
    music: PARTITURA,
    scenes: [
      { type: 'ha-golpe', id: 'gancho', titulo: 'Gancho', dur: 4, palabras: [
        { texto: '¿Se rompió', at: 0, fondo: 'azul', desde: 'der' },
        { texto: 'algo?', at: 1, fondo: 'amarillo', mitad: true, handy: 'gota', humor: 'preocupado', lado: 'der' },
        { texto: '¿Sabés', at: 2, fondo: 'blanco', desde: 'izq' },
        { texto: 'arreglarlo?', at: 3, fondo: 'azul', mitad: true, handy: 'llave', lado: 'izq' },
      ] },
      { type: 'ha-marca', id: 'marca', titulo: 'Handy', dur: 2 },
      { type: 'ha-usuario', id: 'usuario', titulo: 'Si necesitás', dur: 8 },
      { type: 'ha-golpe', id: 'giro', titulo: '¿Y si sos especialista?', dur: 2, salida: 'camara', palabras: [
        { texto: '¿Y si sos', at: 0, fondo: 'azul', desde: 'der' },
        { texto: 'especialista?', at: 1, fondo: 'amarillo', mitad: true, handy: 'engranaje', lado: 'der' },
      ] },
      { type: 'ha-especialista', id: 'especialista', titulo: 'Si sabés', dur: 8 },
      { type: 'ha-golpe', id: 'remate', titulo: 'Para los dos', dur: 2, palabras: [
        { texto: 'Para el que necesita.', at: 0, fondo: 'azul', desde: 'izq', handy: 'gota', lado: 'der' },
        { texto: 'Para el que sabe.', at: 1, fondo: 'amarillo', desde: 'der', handy: 'llave', lado: 'izq' },
      ] },
      { type: 'ha-final', id: 'final', titulo: 'Final', dur: 4 },
    ],
  };
}
