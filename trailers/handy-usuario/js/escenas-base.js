/* HANDY · App de usuario — escenas provisorias.
   Registra las diez recetas del tráiler ('hd-gancho' … 'hd-cierre'). Cada una dibuja una tarjeta
   "N · Título · inicio–fin" sobre el gris del escenario, con una barra que avanza durante la escena,
   y devuelve exactamente la duración de su ventana del storyboard:
     8 + 10 + 8 + 10 + 10 + 14 + 8 + 12 + 5 + 5 = 90 s.
   Las escenas de verdad se registran en escenas-a.js … escenas-d.js, que main.ts carga DESPUÉS: una
   receta registrada con el mismo nombre reemplaza a la provisoria (Trailer.recipe pisa la anterior).
   Solo transform y opacity, todo en el timeline maestro (D.tl) en tiempos absolutos desde T. */
import '../css/escenas-base.css';

/** [receta, título, duración en s] en el orden del storyboard */
const ESCENAS = [
  ['hd-gancho', 'Gancho', 8],
  ['hd-problema', 'Problema', 10],
  ['hd-entrada', 'Entrada', 8],
  ['hd-inicio', 'Inicio', 10],
  ['hd-tipo-de-trabajo', 'Tipo de trabajo', 10],
  ['hd-presupuestos', 'Presupuestos', 14],
  ['hd-confirmacion', 'Confirmación', 8],
  ['hd-seguimiento', 'Seguimiento', 12],
  ['hd-resena', 'Reseña', 5],
  ['hd-cierre', 'Cierre', 5],
];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = s => String(s).replace(/[&<>"]/g, c => ESC[c]);
/** segundos con coma decimal: 8 → "8", 12.5 → "12,5" */
const seg = s => String(+s.toFixed(2)).replace('.', ',');

ESCENAS.forEach(([receta, titulo, dur], i) => {
  const ultima = i === ESCENAS.length - 1;
  Trailer.recipe(receta, (D, T, o) => {
    const s = D.scene(receta.replace(/^hd-/, ''), `
      <div class="hd-ph c">
        <p class="hd-ph-linea"><b>${i + 1}</b> · ${esc(o.titulo || titulo)} · <span>${seg(T)}–${seg(T + dur)} s</span></p>
        <p class="hd-ph-nota">Escena provisoria · receta ${receta}</p>
        <div class="hd-ph-barra"><i></i></div>
      </div>`);
    const card = D.$('.hd-ph', s), barra = D.$('.hd-ph-barra i', s);
    gsap.set(card, { autoAlpha: 0, y: 36, scale: 0.97 });
    gsap.set(barra, { scaleX: 0, transformOrigin: '0% 50%' });

    D.show(s, T);
    D.tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, T + 0.1);
    D.tl.to(barra, { scaleX: 1, duration: dur, ease: 'none' }, T);
    // el cierre queda quieto en el último cuadro (storyboard): sin salida
    if (!ultima) {
      D.tl.to(card, { autoAlpha: 0, y: -24, duration: 0.35, ease: 'power3.in' }, T + dur - 0.45);
      D.hide(s, T + dur);
    }
    return dur;
  });
});
