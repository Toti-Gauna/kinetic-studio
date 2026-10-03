/* HANDY · Anuncios — escenas provisorias: una tarjeta "nombre · inicio–fin" por receta ('ha-golpe', 'ha-marca',
   'ha-usuario', 'ha-especialista', 'ha-final'), para que la película corra entera mientras se escriben las de verdad.
   golpes.js, marca.js, usuario.js y especialista.js se cargan después y las reemplazan (Trailer.recipe pisa la
   anterior con el mismo nombre). Devuelven exactamente o.dur. */
import { gsap } from 'gsap';

for (const nombre of ['ha-golpe', 'ha-marca', 'ha-usuario', 'ha-especialista', 'ha-final']) {
  Trailer.recipe(nombre, (D, T, o) => {
    const s = D.scene(nombre, `<div style="position:absolute;inset:0;display:grid;place-items:center;font:800 64px/1.2 Inter,sans-serif;color:#1F57A8;text-align:center">${nombre}<br><span style="font-size:36px">${o.titulo || ''} · ${T.toFixed(1)}–${(T + o.dur).toFixed(1)} s</span></div>`);
    gsap.set(s, { autoAlpha: 0 });
    D.show(s, T);
    D.hide(s, T + o.dur);
    return o.dur;
  });
}
