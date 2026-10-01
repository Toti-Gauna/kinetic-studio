/* HANDY · App de usuario — escenas 1 y 2.
   Acá se registran (Trailer.recipe):
     'hd-gancho'    escena 1 · gancho    0–8 s    (devuelve 8)   "Se rompió algo en casa."
     'hd-problema'  escena 2 · problema  8–18 s   (devuelve 10)  "Preguntás. Esperás. Nadie confirma."
   Mientras este archivo esté vacío rigen las provisorias de escenas-base.js; una receta registrada
   acá con el mismo nombre las reemplaza. Cada receta recibe (D, T, o): T = inicio absoluto de la
   escena, o = { type, id, titulo, dur } de js/trailer.js; tiene que devolver exactamente o.dur
   (src/handy/player.ts corta el build si no). Ver STORYBOARD.md. */
