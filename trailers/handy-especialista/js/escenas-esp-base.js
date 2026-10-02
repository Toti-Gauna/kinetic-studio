/* HANDY · App del especialista — escenas provisorias.
   Registra las nueve recetas propias del tráiler ('he-gancho' … 'he-cobro'). Cada una dibuja una tarjeta
   "N · Título · inicio–fin" sobre el gris del escenario, con una barra que avanza durante la escena, y devuelve
   exactamente su duración ESCRITA (a 120 BPM; js/trailer.js las corre LENTO = 1,25 veces más lentas con 'hdr-corte'):
     3 + 5 + 4 + 5 + 5 + 6 + 4 + 6 + 2 = 40 s escritos (con los golpes y el final, 56 escritos = 70 s en la película).
   Las escenas de verdad se registran en escenas-esp-a.js … escenas-esp-d.js, que main.ts carga DESPUÉS: una receta
   registrada con el mismo nombre reemplaza a la provisoria (Trailer.recipe pisa la anterior). Hoy las nueve están
   reemplazadas: este archivo queda como andamio (si una escena nueva todavía no existe, se ve su tarjeta en su lugar).
   Solo transform y opacity, todo en el timeline maestro (D.tl) en tiempos absolutos desde T. */
import '../css/escenas-base.css';

/** [receta, título, duración escrita en s] en el orden del storyboard */
const ESCENAS = [
  ['he-gancho', 'Gancho', 3],
  ['he-problema', 'Problema', 5],
  ['he-entrada', 'Handy', 4],
  ['he-inicio', 'Inicio', 5],
  ['he-pedido', 'Pedido', 5],
  ['he-elegido', 'Te eligieron', 6],
  ['he-camino', 'En camino', 4],
  ['he-trabajo', 'Trabajo', 6],
  ['he-cobro', 'Cobro', 2],
];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = s => String(s).replace(/[&<>"]/g, c => ESC[c]);

ESCENAS.forEach(([receta, titulo, dur], i) => {
  Trailer.recipe(receta, (D, T, o) => {
    const s = D.scene(receta.replace(/^he-/, ''), `
      <div class="hd-ph c">
        <p class="hd-ph-linea"><b>${i + 1}</b> · ${esc(o.titulo || titulo)}</p>
        <p class="hd-ph-nota">Escena provisoria · receta ${receta}</p>
        <div class="hd-ph-barra"><i></i></div>
      </div>`);
    const card = D.$('.hd-ph', s), barra = D.$('.hd-ph-barra i', s);
    gsap.set(card, { autoAlpha: 0, y: 36, scale: 0.97 });
    gsap.set(barra, { scaleX: 0, transformOrigin: '0% 50%' });
    D.show(s, T);
    D.tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' }, T + 0.05);
    D.tl.to(barra, { scaleX: 1, duration: dur, ease: 'none' }, T);
    D.tl.to(card, { autoAlpha: 0, y: -24, duration: 0.3, ease: 'power3.in' }, T + dur - 0.35);
    D.hide(s, T + dur);
    return dur;
  });
});
