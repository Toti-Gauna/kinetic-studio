# HANDY USUARIO REMIX — storyboard

El tráiler de la app de usuario de Handy (`trailers/handy-usuario/`, 90 s) cortado como un spot: **más comercial, más
rápido y con más música**. El original queda intacto: esta carpeta es una copia aparte.

Duración: **56,0 s** · 12 escenas (10 capítulos) + pantalla inicial · **120 BPM** (1 compás = 2 s, 1 tiempo = 0,5 s) ·
escenario **1440×1080 (4:3)** para iPad · español rioplatense (voseo).

Idea del remix: nueve escenas del original, **sin cambiar una línea**, corren **al doble de velocidad** (el cierre del
original no se usa: el final es nuevo). A 120 BPM cada
tiempo del original (0,5 s) cae en una corchea (0,25 s), así que cada golpe, toque y "ding" sigue en el pulso. Arriba de eso:
un arreglo de pop con **tres drops**, un gancho de **cinco notas** (cinco Handys, cinco notas), **golpes de palabras** a
pantalla completa, el sello **REMIX** y un **final nuevo con los Handys bailando** en el tiempo.

## Reglas de contenido (las mismas del original)

- Todo en español rioplatense con voseo (Pedí, Compará, Elegí, Seguí, ¿Cuánto sale?). Nada en inglés en pantalla, salvo
  el nombre pedido para el tráiler: "Remix" (el sello REMIX).
- Rubros, exactamente seis: **Electricidad · Plomería · Gas · Cerrajería · Albañilería · Aire acondicionado**.
- Moneda: pesos con formato **$ 45.000**. Especialistas ficticios: **Martín R., Lucía G., Diego P.**
- El precio lo pone el especialista; Handy suma una **tarifa de servicio del 5 %**, siempre visible. Se dice **verificados**.
- Lanzamiento: **Mar del Plata · Llegamos el 28/10**. No se inventan cifras, promesas ni funciones.

## Dirección de arte

- La del original: gris Handy **#CFCFCF**, azul **#1F57A8**, amarillo lamparita **#F8FFA0**, Inter (800 en titulares,
  900 en los golpes de palabras), los personajes y el logo de `src/handy/`.
- Lo nuevo del remix: paneles de color a pantalla completa que barren en el tiempo, tipografía gigante que pega con un
  "punch" de escala, una calcomanía amarilla **REMIX**, destellos blancos en los drops y los Handys bailando.
- **Solo se anima transform y opacity** (como el original: tiene que ir fluido en Safari de iPad). `?audit` lo verifica.

## Escenas

| # | escena (`id`) | inicio–fin | de dónde sale | qué pasa | música |
|---|---|---|---|---|---|
| 1 | `gancho` | 0–3 | escena 1 del original al doble, cortada en su segundo 6 | El Caño gotea; cae la Gota (2,5) y el Caño se asusta. **Se rompió algo en casa.** Corte seco. | frío: La menor, pad oscuro y un latido grave |
| 2 | `problema` | 3–8 | escena 2 al doble | Los grupos de chat que nadie contesta, el reloj que corre. **Preguntás. Esperás. Nadie confirma.** Todo se cae; un instante de gris vacío antes del drop. | latido que crece · 7–8 subida (riser) |
| 3 | `entrada` | 8–12 | escena 3 al doble + destello amarillo | **DROP 1.** Destello amarillo a pantalla completa. Los cinco Handys entran saltando y tiran las letras de "Handy" en corcheas; el logo encaja (10,75) y a las **11,0 pega el sello REMIX**. | golpe + coro: el gancho llama y las letras le contestan una octava arriba |
| 4 | `inicio` | 12–17 | escena 4 al doble + cámara | El logo cruza al encabezado de la app. **Pedís lo que necesitás.** La cámara entra al teléfono: los seis rubros (13,25) y los seis accesos (14,125) se levantan uno por semicorchea, bien de cerca; vuelve (15,0–15,5) y el dedo toca Plomería. | verso |
| 5 | `tipo-de-trabajo` | 17–22 | escena 5 al doble + empuje | **Urgencia, programado u obra.** Programado, rueda de fecha: Jue 15 oct · 16:00. Pedir presupuestos. | verso |
| — | (golpe) | 22–24 | `hdr-golpe` | **¿Cuánto** (22, blanco sobre azul) **sale?** (23, azul sobre amarillo, con la Gota preocupada); a las 23,7 todo se tira contra la cámara. | subida de 2 s |
| 6 | `presupuestos` | 24–30 | escena 6 al doble, cortada en su segundo 12 (quieta desde el 11,6) + destello y punch | **DROP 2.** Llegan los tres presupuestos (Martín R. $ 45.000 · Lucía G. $ 48.500 · Diego P. $ 51.000), salen del teléfono en abanico. **El especialista pone su precio. Vos elegís.** Se acepta el de Martín. | golpe + coro con el gancho, debajo de los "ding" |
| 7 | `confirmacion` | 30–34 | escena 7 al doble + empuje (1 → 1,02) | **Precio final antes de confirmar.** $ 45.000 + Tarifa Handy 5 % $ 2.250 = **$ 47.250**. Confirmar ✓. | verso |
| 8 | `seguimiento` | 34–40 | escena 8 al doble + empuje (1,02 → 1,045) | Mapa: buscando → en camino → llegó. Chat con Martín. **Tu teléfono no se comparte. Todo queda en Handy.** | verso con pad (la variación) |
| 9 | `resena` | 40–42 | escena 9 al doble, cortada en su segundo 4 + empuje (1,045 → 1,06) | Cinco estrellas y los Handys festejan alrededor del teléfono. | coro sin gancho |
| — | (golpe) | 42–46 | `hdr-golpe` | El resumen, uno cada medio compás (42 · 43 · 44 · 45): **Pedí.** Lo que necesitás. · **Compará.** Especialistas verificados. · **Elegí.** Con el precio final. · **Seguí.** Todo queda en Handy. Un Handy por tarjeta. | quiebre (sin bombo) · 44–46 subida |
| 10 | `final` | 46–56 | `hdr-final` | **DROP 3.** Los Handys entran de un salto y **bailan en el tiempo**; el logo letra por letra, **Soluciones, no problemas**, **Mar del Plata · Llegamos el 28/10**, el sello REMIX (50,0) y el QR si `QR_URL` tiene algo. A las 54,0 caen en la pose final; **desde las 54,5 todo queda quieto**. | golpe + coro con el gancho entero · 54 golpe final y acorde que suena hasta el final |

Los tiempos de cada golpe están en el encabezado de cada archivo: `js/escenas-remix-golpes.js`, `js/escenas-remix-final.js`
y `js/partitura.js`.

## Cómo está hecho

- `js/escenas-a.js` … `js/escenas-d.js`, `js/escenas-base.js`, `js/engine.js` y `js/audio.js`: copias **sin cambios** del original.
- `js/remix.js` — `hdr-corte`: corre una receta del original a otra velocidad (`k`) y la corta en `hasta`. La receta recibe
  una fachada de `D` cuyo timeline lleva cada posición `p` a `T + (p − T)·k` y multiplica duraciones, delays y staggers por
  `k`; lo que arrancaría después del corte (o de `congela`) no se agrega. Opciones del remix: `empuje` (cámara lenta,
  con rango para que el corte entre escenas seguidas no salte), `golpe` (punch de entrada), `camara` (movimientos por
  claves), `destello` (flash de color en un drop), `congela` y `extra` (superposiciones, como el sello).
- `js/escenas-remix-golpes.js` — `hdr-golpe` (golpes de palabras) y `Trailer.remix.sello` (la calcomanía REMIX).
- `js/escenas-remix-final.js` — `hdr-final`.
- `js/recipes-music.js` (estilos nuevos: frío, latido, subida, coro, verso, quiebre, final; acordes y gancho por parte) y
  `js/partitura.js` (el arreglo).
- `js/trailer.js` — la línea de tiempo. Cada escena declara su `dur`; `src/handy/player.ts` corta el build si no coincide.

## Interacción

La del original: tocar la pantalla pausa y reanuda (en pausa, la lista de capítulos); Espacio pausa · ← → capítulo anterior
o siguiente · 1–9 y 0 saltan a los capítulos 1–10 · M silencio · F pantalla completa. `?t=SEGUNDOS` congela un cuadro,
`?embed` es la vista previa muda del hub, `?escena=<id|número>` arranca en un capítulo, `?audit` revisa las propiedades animadas.
