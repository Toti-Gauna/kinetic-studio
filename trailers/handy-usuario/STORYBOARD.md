# HANDY · App de usuario — storyboard del tráiler

Duración: **70,0 s** · 12 escenas (10 capítulos) + pantalla inicial · **96 BPM** (1 compás = 2,5 s, 1 tiempo = 0,625 s) ·
escenario **1440×1080 (4:3)** escalado para entrar en pantalla · idioma: español rioplatense (voseo).

Público: mentores de una aceleradora, mirando un iPad. Nadie habla: la película tiene que explicar la idea y venderla sola.
Concepto: *se rompe algo en casa → preguntar en grupos no sirve → Handy: pedís, el especialista presupuesta, vos elegís, seguís
todo en la app → Mar del Plata, 28/10.*

Es un spot: nueve escenas de la primera versión (90 s, en el historial de git) corren **1,6 veces más rápido** y en el
pulso de un pop en Do mayor. Cada tiempo suyo cae en una corchea de la música, así que cada golpe, toque y "ding" sigue en el
pulso. Entre ellas hay **golpes de palabras** a pantalla completa, tres **drops** y un **final con los Handys bailando** en
el tiempo.

## Reglas de contenido (mandan sobre las fotos de referencia)

- Todo en español rioplatense con voseo (Tocá, Elegí, Confirmá, ¿Qué necesitás?, Pedí, Compará, Seguí). Nada en inglés en pantalla.
- Rubros, exactamente seis: **Electricidad · Plomería · Gas · Cerrajería · Albañilería · Aire acondicionado**. "Mecánico" no existe.
- Accesos "Quiero…": **Destapar cañería · Cambiar cerradura · Instalar aire · Arreglar enchufe · Revisar pérdida de gas · Reparar humedad**.
- Moneda: pesos argentinos con formato **$ 45.000** (`formatARS`). Nunca dólares.
- Fechas: octubre de 2026, en español ("Jue 15 oct", "jueves 15 de octubre").
- Especialistas ficticios: **Martín R., Lucía G., Diego P.** Ningún nombre real.
- No hay precios fijos: el precio lo pone el especialista en su presupuesto. Handy suma una **tarifa de servicio del 5%**, siempre visible.
- Prohibido: "matriculados", "despachamos", "te enviamos un especialista". Se dice **verificados**.
- El horario de llegada es el que declara el especialista: **"Llega entre 16:06 y 16:30"**.
- No se muestran tarjetas, saldos, movimientos ni cupones. No se inventan cifras, promesas ni funciones.

## Dirección de arte

- Fondo base: gris Handy **#CFCFCF**; azul principal **#1F57A8**, azul claro de interfaz **#4A72B0**, azul de personajes
  **#2F6BFF**, amarillo lamparita **#F5F59A** (medido: #F8FFA0).
- Tipografía: **Inter** (titulares 800, azules, en frase con punto final; los golpes de palabras en 900). El logo es el
  wordmark vectorizado, con la bajada "Soluciones, no problemas".
- Composición de las escenas de app: titular en la columna izquierda y el teléfono a la derecha (centro 1030, 540). Entre
  escenas seguidas el teléfono queda exactamente en su lugar (y la cámara sigue de una a otra, sin saltos).
- Movimiento: entradas `expo.out`, pops `back.out`, personajes con anticipación y squash & stretch, cámara por claves,
  paneles de color que barren el cuadro y tipografía que pega con un "punch" de escala.
  **Solo se anima transform y opacity** (nada de blur, filtros, clip-path ni sombras animadas): tiene que ir fluido en Safari de iPad.
- Sonido: pop sintetizado en Do mayor (C – G – Am – F) a 96 BPM, con la apertura en La menor y tres drops que crecen; el
  gancho son cinco notas (Do Re Mi Sol La: cinco Handys, cinco notas). Encima, los efectos de cada escena.

## Escenas

| # | escena (`id`) | inicio–fin | de dónde sale | qué pasa | música |
|---|---|---|---|---|---|
| 1 | `gancho` | 0–3,75 | escena 1 de la primera versión, cortada en su segundo 6 | El Caño gotea; cae la Gota (3,1) y el Caño se asusta. **Se rompió algo en casa.** Corte seco. | frío: La menor, pad oscuro y un latido grave |
| 2 | `problema` | 3,75–10 | escena 2 | Los grupos de chat que nadie contesta, el reloj que corre. **Preguntás. Esperás. Nadie confirma.** Todo se cae; un instante de gris antes del drop. | latido que crece · 8,75–10 subida |
| 3 | `entrada` | 10–15 | escena 3 + destello amarillo | **DROP 1.** Destello amarillo a pantalla completa; los cinco Handys entran saltando y tiran las letras de "Handy" en corcheas; el logo encaja con **Soluciones, no problemas**. | golpe + coro: el gancho llama y las letras le contestan |
| 4 | `inicio` | 15–21,25 | escena 4 + cámara | El logo cruza al encabezado de la app. **Pedís lo que necesitás.** La cámara entra al teléfono: los seis rubros (16,56) y los seis accesos (17,66) se levantan uno por semicorchea, de cerca; vuelve (18,75–19,38) y el dedo toca Plomería. | verso |
| 5 | `tipo-de-trabajo` | 21,25–27,5 | escena 5 + empuje | **Urgencia, programado u obra.** Programado, rueda de fecha: Jue 15 oct · 16:00. Pedir presupuestos. | verso |
| — | (golpe) | 27,5–30 | `hdr-golpe` | **¿Cuánto** (27,5, blanco sobre azul) **sale?** (28,75, azul sobre amarillo, con la Gota preocupada); al final todo se tira contra la cámara. | subida |
| 6 | `presupuestos` | 30–37,5 | escena 6, cortada en su segundo 12 (quieta desde el 11,6) + destello y punch | **DROP 2.** Llegan los tres presupuestos (Martín R. $ 45.000 · Lucía G. $ 48.500 · Diego P. $ 51.000) y salen del teléfono en abanico. **El especialista pone su precio. Vos elegís.** Se acepta el de Martín. | golpe + coro con el gancho, debajo de los "ding" |
| 7 | `confirmacion` | 37,5–42,5 | escena 7 + empuje (1 → 1,02) | **Precio final antes de confirmar.** $ 45.000 + Tarifa Handy 5% $ 2.250 = **$ 47.250**. Confirmar ✓. | verso |
| 8 | `seguimiento` | 42,5–50 | escena 8 + empuje (1,02 → 1,045) | Mapa: buscando → en camino → llegó. Chat con Martín. **Tu teléfono no se comparte. Todo queda en Handy.** | verso con pad |
| 9 | `resena` | 50–52,5 | escena 9, cortada en su segundo 4 + empuje (1,045 → 1,06) | Cinco estrellas y los Handys festejan alrededor del teléfono. | coro sin gancho |
| — | (golpe) | 52,5–57,5 | `hdr-golpe` | El resumen, uno cada medio compás (52,5 · 53,75 · 55 · 56,25): **Pedí.** Lo que necesitás. · **Compará.** Especialistas verificados. · **Elegí.** Con el precio final. · **Seguí.** Todo queda en Handy. Un Handy por tarjeta. | quiebre (sin bombo) · 55–57,5 subida |
| 10 | `final` | 57,5–70 | `hdr-final` | **DROP 3.** Los Handys entran de un salto y **bailan en el tiempo**; el logo letra por letra, **Soluciones, no problemas**, **Mar del Plata · Llegamos el 28/10** y el QR si `QR_URL` tiene algo. A las 67,5 caen en la pose final; **desde las 68,1 todo queda quieto** (el cuadro que queda bajo "Ver de nuevo"). | golpe + coro con el gancho entero · 67,5 golpe final y acorde que se desvanece |

## Cómo está hecho

- Todo está **escrito a 120 BPM** y corre **`LENTO` = 1,25 veces más lento** (`js/partitura.js`). Para cambiar el ritmo de
  toda la película alcanza con cambiar `LENTO`: las escenas y la música se mueven juntas.
- `js/escenas-a.js` … `js/escenas-d.js` y `js/escenas-base.js`: las escenas de la primera versión, sin cambios (el cierre,
  `hd-cierre`, no se usa).
- `js/corte.js` — `hdr-corte`: corre una receta a otra velocidad (`k`) y la corta en `hasta`. La receta recibe una fachada
  de `D` cuyo timeline lleva cada posición `p` a `T + (p − T)·k` y multiplica duraciones, delays y staggers por `k`; lo que
  arrancaría después del corte (o de `congela`) no se agrega. Opciones: `empuje` (cámara lenta, con rango para que el corte
  entre escenas seguidas no salte), `golpe` (punch de entrada), `camara` (movimientos por claves), `destello` (flash de
  color), `congela` y `queda` (la última escena no se esconde). Las escenas de la primera versión van con `k = 0,5 × LENTO`
  y las de este tráiler (golpes y final) con `k = LENTO`.
- `js/escenas-golpes.js` — `hdr-golpe` (golpes de palabras). `js/escenas-final.js` — `hdr-final`.
- `js/recipes-music.js` (estilos: frío, latido, subida, coro, verso, quiebre, final; acordes y gancho por parte) y
  `js/partitura.js` (el arreglo).
- `js/engine.js` y `js/audio.js`: el kit con dos arreglos: `padStop` apaga los pads con fundido y, en vivo, cada sonido se
  programa contra el reloj de audio con 30 ms de anticipación (`SFX.play`). El render offline no cambia.
- `js/trailer.js` — la línea de tiempo. Cada escena declara su `dur`; `src/handy/player.ts` corta el build si no coincide.

## Interacción

- Tocar la pantalla pausa y reanuda. En pausa aparece la lista de capítulos: tocar uno salta a esa etiqueta y sigue.
- Teclado: Espacio pausa · ← → capítulo anterior/siguiente · 1–9 y 0 saltan a los capítulos 1–10 · M silencio · F pantalla completa.
- `?t=SEGUNDOS` congela un cuadro; `?embed` es la vista previa muda del hub; `?escena=<id|número>` arranca en un capítulo;
  `?audit` revisa las propiedades animadas.
