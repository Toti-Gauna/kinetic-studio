/* HANDY · App de usuario — escenas 8, 9 y 10.
   Acá se registran (Trailer.recipe):
     'hd-seguimiento'  escena 8 · seguimiento  68–80 s  (devuelve 12)  "Tu teléfono no se comparte. Todo queda en Handy."
     'hd-resena'       escena 9 · reseña       80–85 s  (devuelve 5)   "¿Cómo fue tu experiencia con Martín?"
     'hd-cierre'       escena 10 · cierre      85–90 s  (devuelve 5)   logo · "Mar del Plata · Llegamos el 28/10" · QR
   El QR del cierre sale de D.cfg.qrUrl (la constante QR_URL de js/trailer.js; en desarrollo, ?qr=<url>
   la pisa); vacío = solo el texto, centrado. El último cuadro queda quieto: abajo al centro aparecen
   "↺ Ver de nuevo" y "← Volver", así que esa franja (y > 960, x 470–970) no lleva nada importante.
   Mientras este archivo esté vacío rigen las provisorias de escenas-base.js; una receta registrada
   acá con el mismo nombre las reemplaza. Cada receta recibe (D, T, o): T = inicio absoluto de la
   escena, o = { type, id, titulo, dur } de js/trailer.js; tiene que devolver exactamente o.dur
   (src/handy/player.ts corta el build si no). Ver STORYBOARD.md. */
