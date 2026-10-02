# HANDY · App del especialista — storyboard del tráiler

Duración: **70,0 s** · 12 escenas (10 capítulos) + pantalla inicial · **96 BPM** · escenario **1440×1080 (4:3)** para iPad ·
español rioplatense (voseo). Público: mentores de una aceleradora, en un iPad, y especialistas que podrían sumarse. Nadie habla.

**Concepto: la misma historia del tráiler de usuario (`trailers/handy-usuario`), del otro lado.** Martín R., plomero
verificado, es el especialista que el cliente eligió en ese tráiler. Acá lo vemos desde su teléfono:
*tenés el oficio pero el trabajo depende del boca en boca → Handy: activás, te llegan pedidos cerca tuyo, vos ponés el
precio, te eligen, hablás con el cliente sin dar tu número, hacés el trabajo y cobrás en tu CBU o alias → Mar del Plata, 28/10.*

**Misma estética y misma forma que el de usuario:** gris Handy, los cinco Handys, la app en un teléfono a la derecha con el
titular a la izquierda, golpes de palabras a pantalla completa, tres drops con destello, los Handys bailando en el final.
La música es la del tráiler de usuario (misma partitura: las secciones caen en los mismos tiempos).

## Cómo se escribe cada escena

- Cada receta (`he-…`) se **escribe a 120 BPM** (un tiempo = 0,5 s, un compás = 2 s) con su duración escrita, y
  `js/trailer.js` la corre con `hdr-corte` **LENTO = 1,25 veces más lenta** (96 BPM: un tiempo = 0,625 s). En la película,
  un tiempo escrito `t` (desde el inicio T de la escena) cae en `T + t × 1,25`. Los golpes visuales y los sonidos van en
  tiempos escritos múltiplos de 0,25 (corcheas) o 0,125 (semicorcheas), así siguen en el pulso.
- Reglas del kit (las mismas del tráiler de usuario): `Trailer.recipe(nombre, (D, T, o) => dur)`, todo en `D.tl` en tiempos
  absolutos desde T (`tl.to` / `tl.set`, sin from/fromTo), estados iniciales con `gsap.set`, azar solo con `D.rand`,
  devuelve exactamente `o.dur`. **Solo se anima transform y opacity** (`?audit` tiene que dar `ok: true`).
- Componentes compartidos en `src/handy/` (personajes, animaciones, logo, titulares, íconos, UI de la app, mapa, chat). Las
  pantallas nuevas de la app del especialista van en `src/handy/pantallas/especialista.ts` (como `usuario.ts` y
  `usuario-chat.ts`), reutilizando `src/handy/ui/`.
- Composición de las escenas de app (igual que en el de usuario): titular en la columna izquierda (x 110–730, 800, azul,
  frase con punto final) y el teléfono a la derecha en `PHONE_XY` (centro 1030, 540). Entre escenas seguidas el teléfono queda
  exactamente en su lugar (contratos de corte: el último cuadro de una escena = el primero de la siguiente).

## Reglas de contenido (mandan sobre las maquetas de `handy-especialistas-png/`, que están en inglés y en dólares)

- Todo en español rioplatense con voseo (Activá, Presupuestá, Trabajá, Cobrá, Trabajás cuando querés). **Nada en inglés en
  pantalla.** Traducciones: Working → **Trabajando**; Home · Meetups · Messages · Account → **Inicio · Agenda · Mensajes ·
  Cuenta**; Plumber Job → **Plomería**; Instant / Scheduled order → **Urgencia / Programado**; Accept job → **Aceptar**;
  Accept job & change price → **Cambiar precio**; Finish work → **Terminar trabajo**; Your CBU or Alias → **Tu CBU o alias**.
- Moneda: pesos argentinos con formato **$ 45.000** (`formatARS`). **Nunca dólares.**
- Rubros, exactamente los seis del tráiler de usuario: Electricidad · Plomería · Gas · Cerrajería · Albañilería · Aire
  acondicionado. Se dice **verificados** (nunca "matriculados").
- Nombres ficticios. Especialista: **Martín R.** (iniciales MR, avatar naranja #EE7A30, Plomería, ★ 4,9, Verificado; los
  datos están en `ESPECIALISTAS.martin` de `src/handy/pantallas/usuario-chat.ts`). Cliente: **Carla M.** (iniciales CM).
  Ningún nombre real (las maquetas tienen el nombre del desarrollador: no usarlo).
- El pedido es el mismo del tráiler de usuario: **Plomería · Programado · Jue 15 oct · 16:00 · "Reparar pérdida en el caño
  de la bacha" · Casa · Mar del Plata**. El presupuesto de Martín: **Mano de obra $ 32.000 · Materiales $ 13.000 · Total
  $ 45.000 · "Llego entre 16:06 y 16:30" · Validez 48 h** (`PRESUPUESTOS[0]` de `usuario-chat.ts`).
- El precio lo pone el especialista ("Vos ponés el precio."). Handy le suma al cliente su tarifa de servicio del 5 %: el
  cliente paga $ 47.250 y **Martín gana su presupuesto: $ 45.000**. No mostrar la tarifa como un descuento al especialista.
- El chat es el mismo del tráiler de usuario, con los lados al revés (Martín escribe a la derecha): Martín "¡Hola! Estoy a
  unas cuadras." (16:04) · Martín "¿Me mandás una foto de la pérdida? Así llevo el repuesto justo." (16:04) · Carla: foto del
  caño goteando + "Es abajo de la bacha." (16:05) · Martín "Perfecto, ya sé qué llevar." (16:05). Aviso: **"Tu número no se
  comparte"**.
- Cobro: Handy le transfiere al especialista a su **CBU o alias** (alias ficticio **martin.r.plomero**; un CBU, si aparece,
  enmascarado: **CBU •••• 4821**). Sin plazos ni promesas ("en 24 h", "sin comisión", "al instante": no).
- Prohibido inventar cifras, funciones o promesas que no estén en este storyboard o en el de usuario.

## Escenas

Tiempos de la columna "escrito" = desde el inicio de la escena, a 120 BPM; "película" = tiempo real del tráiler.

| # | receta (`id`) | escrito → película | titular / texto | qué pasa | pase a la siguiente |
|---|---|---|---|---|---|
| 1 | `he-gancho` (`gancho`) | 3 s → 0–3,75 | **Tenés el oficio.** | El Engranaje y la Llave (los Handys "de las herramientas") listos para trabajar: el engranaje gira, la llave hace un floreo (salta y gira en el aire) — y al lado, un teléfono apoyado que no suena (pantalla apagada, sin notificaciones). Los dos lo miran, esperando; la llave golpea el pie en los tiempos. Titular a la derecha (como "Se rompió algo en casa." en el de usuario). | corte seco en 3,75 |
| 2 | `he-problema` (`problema`) | 5 s → 3,75–10 | **Presupuestás. Esperás. Te dejan en visto.** (tres golpes) | El espejo de los grupos del tráiler de usuario: tres chats de mensajería genéricos (estilo `grupoMensajeria`, sin marcas) del especialista con clientes: "Referido de Ana" — Martín: "Hola, te paso el presupuesto: $ 40.000." con tildes y **Visto**; "Cliente nuevo" — "Lo consulto y te aviso." ; "Consorcio Alberti 2300" — "¿No me lo hacés más barato?"; y una **Llamada perdida · 23:40**. Un reloj con las horas que avanzan (como el de usuario). El titular entra en tres golpes. A los 4,4 escritos todo se cae. | gris vacío, un instante antes del drop |
| 3 | `he-entrada` (`entrada`) | 4 s → 10–15 | logo **Handy** + **Soluciones, no problemas** + ficha **Para especialistas** | **DROP 1** (destello amarillo en `trailer.js`). Igual que la entrada del de usuario (`hd-entrada` de `trailers/handy-usuario/js/escenas-b.js`: los cinco Handys entran saltando y cada uno tira su letra de "Handy"; las letras se juntan en el wordmark y aparece la bajada), y al final aparece debajo una ficha azul **Para especialistas** (pop, back.out). | el logo queda solo (contrato con `he-inicio`) |
| 4 | `he-inicio` (`inicio`) | 5 s → 15–21,25 | **Trabajás cuando querés.** | Match cut: el logo cruza al encabezado de la app y sube el teléfono con el inicio del especialista: encabezado (logo, campana, ubicación), mapa de Mar del Plata con su ubicación, la ficha **Trabajando** con el interruptor apagado (gris) y la barra inferior (Inicio · Agenda · Mensajes · Cuenta). El dedo toca el interruptor: se prende (azul, la perilla cruza), el mapa se "despierta" (un pulso alrededor de su ubicación). | el teléfono queda en su lugar, Trabajando prendido |
| 5 | `he-pedido` (`pedido`) | 5 s → 21,25–27,5 | **Te llegan pedidos cerca tuyo.** → **Vos ponés el precio.** | Suena una notificación y sube la tarjeta del pedido sobre el mapa: ícono de Plomería, **Pedido programado**, **Jue 15 oct · 16:00**, "Reparar pérdida en el caño de la bacha", "Casa · Mar del Plata · a 15 min", botones **Mandar presupuesto** y **Ahora no**. El dedo toca "Mandar presupuesto": entra la hoja **Tu presupuesto** — Mano de obra **$ 32.000** (los dígitos entran uno por semicorchea), Materiales **$ 13.000**, Llegada **Entre 16:06 y 16:30**, Total **$ 45.000** (golpe) y **Enviar presupuesto**. El dedo toca Enviar: tilde y "Presupuesto enviado". | el teléfono queda con "Presupuesto enviado" (lo tapa el golpe) |
| — | `hdr-golpe` | 2 s → 27,5–30 | **¿Te** · **eligen?** | Golpes de palabras (como "¿Cuánto sale?"): el engranaje asoma preocupado. Al final todo se tira contra la cámara. | corte al destello del drop 2 |
| 6 | `he-elegido` (`elegido`) | 6 s → 30–37,5 | **¡Te eligieron!** → **Tu agenda, en orden.** | **DROP 2** (destello y punch en `trailer.js`). En el teléfono cae el aviso grande: **¡Te eligieron!** — Carla M. aceptó tu presupuesto · Plomería · Jue 15 oct · 16:00 · **$ 45.000** (con papelitos que saltan desde el aviso). El aviso se mete en la pestaña Agenda: calendario de **octubre 2026** con el **jueves 15** marcado (pop) y la lista **Próximas visitas**: Jue 15 oct · 16:00 · Plomería · Reparar pérdida en el caño de la bacha · Carla M. · $ 45.000. | el teléfono queda en la agenda |
| 7 | `he-camino` (`camino`) | 4 s → 37,5–42,5 | **Tu número no se comparte.** | El chat con Carla M. (aviso "Tu número no se comparte", los cuatro mensajes de la regla de arriba, la foto del caño). Después, **En camino**: el mapa con la ruta hasta la casa de Carla y **Llegás entre 16:06 y 16:30**. | el teléfono queda en el mapa |
| 8 | `he-trabajo` (`trabajo`) | 6 s → 42,5–50 | **Todo queda en Handy.** | **Trabajo en curso**: Plomería · Carla M., un cronómetro que corre (00:00 → 42:15 en saltos), el detalle — Mano de obra $ 32.000 · Materiales $ 13.000 · Total **$ 45.000** — y **Terminar trabajo**. El dedo toca Terminar: **¡Terminaste el trabajo!** con la Gota y el Caño festejando adentro de la pantalla (como la maqueta "You finished rightly the job!") y **Ganaste $ 45.000**. | el teléfono queda con "¡Terminaste el trabajo!" |
| 9 | `he-cobro` (`cobro`) | 2 s → 50–52,5 | **Cobrás en tu CBU o alias.** | El aviso **Te transferimos $ 45.000** a **martin.r.plomero**, y la reseña de Carla: ★★★★★ (una por semicorchea) "¡Excelente! Rápido y prolijo." Los Handys asoman y festejan alrededor del teléfono (como la reseña del de usuario). | lo tapa el golpe del resumen |
| — | `hdr-golpe` | 4 s → 52,5–57,5 | **Activá.** Trabajás cuando querés. · **Presupuestá.** Vos ponés el precio. · **Trabajá.** Con tu agenda en orden. · **Cobrá.** En tu CBU o alias. | El resumen, una palabra por medio compás, un Handy por tarjeta. | corte al drop 3 |
| 10 | `hdr-final` (`final`) | 10 s → 57,5–70 | logo · **Sumate como especialista.** · **Mar del Plata · Llegamos el 28/10** · QR | **DROP 3.** El final del tráiler de usuario (los Handys bailan en el tiempo, el logo letra por letra con la palabra "Handy" centrada), con una línea más: **Sumate como especialista.** El último cuadro queda quieto desde las 68,1 (franja y > 960 entre x 470 y 970 libre para "Ver de nuevo"). | fin |

## Interacción

La del tráiler de usuario (la da `src/handy/player.ts`): tocar la pantalla pausa y reanuda; en pausa, la lista de
capítulos; ← → capítulos; 1–9 y 0; M silencio; F pantalla completa. `?t=SEGUNDOS` congela un cuadro, `?embed` es la vista
previa del hub, `?escena=<id|número>`, `?audit`.
