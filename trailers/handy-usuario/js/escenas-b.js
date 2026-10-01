/* HANDY · App de usuario — escenas 3, 4 y 5.
   Acá se registran (Trailer.recipe):
     'hd-entrada'          escena 3 · entrada          18–26 s  (devuelve 8)   logo Handy + "Soluciones, no problemas"
     'hd-inicio'           escena 4 · inicio           26–36 s  (devuelve 10)  "Pedís lo que necesitás."
     'hd-tipo-de-trabajo'  escena 5 · tipo de trabajo  36–46 s  (devuelve 10)  "Urgencia, programado u obra."
   Mientras este archivo esté vacío rigen las provisorias de escenas-base.js; una receta registrada
   acá con el mismo nombre las reemplaza. Cada receta recibe (D, T, o): T = inicio absoluto de la
   escena, o = { type, id, titulo, dur } de js/trailer.js; tiene que devolver exactamente o.dur
   (src/handy/player.ts corta el build si no). Ver STORYBOARD.md. */
