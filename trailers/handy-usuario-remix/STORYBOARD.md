# HANDY · App de usuario — storyboard del tráiler

Duración: **90,0 s** · 10 escenas + pantalla inicial · grilla de 120 BPM (1 compás = 2 s; todos los cortes caen en compás) ·
escenario **1440×1080 (4:3)** escalado para entrar en pantalla · idioma: español rioplatense (voseo).

Público: mentores de una aceleradora, mirando un iPad. Nadie habla: la película tiene que explicar la idea y venderla sola.
Concepto: *se rompe algo en casa → preguntar en grupos no sirve → Handy: pedís, el especialista presupuesta, vos elegís, seguís
todo en la app → Mar del Plata, 28/10.*

## Reglas de contenido (mandan sobre las fotos de referencia)

- Todo en español rioplatense con voseo (Tocá, Elegí, Confirmá, ¿Qué necesitás?). Nada en inglés en pantalla.
- Rubros, exactamente seis: **Electricidad · Plomería · Gas · Cerrajería · Albañilería · Aire acondicionado**. "Mecánico" no existe.
- Accesos "Quiero…": **Destapar cañería · Cambiar cerradura · Instalar aire · Arreglar enchufe · Revisar pérdida de gas · Reparar humedad**.
  Nada de autos, aceite ni cables de internet.
- Moneda: pesos argentinos con formato **$ 45.000** (`formatARS`). Nunca dólares.
- Fechas: octubre de 2026, en español ("Jue 15 oct", "jueves 15 de octubre").
- Especialistas ficticios: **Martín R., Lucía G., Diego P.** Ningún nombre real.
- No hay precios fijos: el precio lo pone el especialista en su presupuesto. Handy suma una **tarifa de servicio del 5%**, siempre visible.
- Prohibido: "matriculados", "despachamos", "te enviamos un especialista". Se dice **verificados**.
- El horario de llegada es el que declara el especialista: **"Llega entre 16:06 y 16:30"**.
- No se muestran tarjetas, saldos, movimientos ni cupones.

## Dirección de arte

- Fondo base: gris Handy **#CFCFCF** en todo el escenario y en el relleno de los bordes (en pantallas que no son 4:3 no se ve
  el borde del escenario). Azul principal **#1F57A8**, azul claro de interfaz **#4A72B0**, azul de personajes **#2F6BFF**,
  amarillo lamparita **#F5F59A**.
- Tipografía: **Inter** para la interfaz y los titulares (titulares 800, azul, en frase con punto final, tal como están escritos
  acá). El logo es el wordmark vectorizado desde la foto, con la bajada "Soluciones, no problemas".
- Composición de las escenas de app: titular en la columna izquierda (x 110–730) y el teléfono a la derecha
  (centro 1030, 540; pantalla de 414×896). Los cortes entre escenas de app dejan el teléfono exactamente en ese lugar.
- Movimiento: entradas `expo.out`, pops `back.out(2)`, personajes con anticipación y squash & stretch, salidas `power3.in`.
  **Solo se anima transform y opacity** (nada de blur, filtros, clip-path ni sombras animadas): tiene que ir fluido en Safari de iPad.
- Sonido: groove pop sintetizado en Do mayor (Do – Sol – Lam – Fa), 120 BPM, más efectos: gotas, toques, mensajes, saltos.

## Escenas

| # | escena (`id` = etiqueta GSAP) | inicio–fin | texto en pantalla | qué pasa | momento sonoro | pase a la siguiente |
|---|---|---|---|---|---|---|
| 0 | pantalla inicial (fuera del timeline) | — | logo · **Tocá para empezar** | Fondo gris, logo centrado, "Tocá para empezar" late suave. Toda la pantalla es el botón. Mientras carga: "Cargando…". | silencio; el toque habilita el audio | el intro se desvanece y arranca la película |
| 1 | `gancho` | 0–8 | **Se rompió algo en casa.** | El Caño (personaje) gotea: dos gotitas crecen en el pico y caen. A la tercera cae la Gota, con cara preocupada; rebota al aterrizar y mira a los costados. El Caño también se preocupa. | pulso grave, "plic" por gota, golpe suave al caer la Gota | los personajes se corren y el titular sale; escenario gris limpio |
| 2 | `problema` | 8–18 | **Preguntás. Esperás. Nadie confirma.** (tres golpes) | Burbujas de grupos de chat genéricos (estilo mensajería, sin marcas): "Vecinos del edificio", "Familia", "Fútbol de los jueves". El mismo mensaje en todos: "¿Alguien tiene un plomero?", con tildes grises. Respuestas que no resuelven ("Tu tío tenía uno, preguntale.", "Ni idea, che.") y "Visto". Un reloj y las horas de los mensajes avanzan (10:02 → 12:47 → 16:30 → 19:15). **Sin cifras.** | tics de reloj, "pop" por burbuja, el ritmo se apaga | las burbujas caen/se apagan; escenario gris limpio |
| 3 | `entrada` | 18–26 | logo **Handy** + **Soluciones, no problemas** | Golpe: entran saltando los cinco Handys (gota, caño, engranaje, lamparita, llave) y aterrizan en fila. Cada uno salta y deja una letra de "Handy" arriba suyo (cinco Handys, cinco letras); las letras se juntan en el wordmark y aparece la bajada. | golpe + groove; un "boing" por salto, campana por letra | el logo se achica y los Handys salen de cuadro |
| 4 | `inicio` | 26–36 | **Pedís lo que necesitás.** | Sube el teléfono con la pantalla de inicio corregida: encabezado (logo, campana, ubicación), "¿Qué necesitás hoy?" + los seis rubros, "Quiero…" + los seis accesos, botón flotante de urgencia y barra inferior (Inicio · Agenda · Mensajes · Cuenta). Las fichas entran en cascada. El dedo toca **Plomería**. | groove suave, toque al tocar | el teléfono queda en su lugar |
| 5 | `tipo-de-trabajo` | 36–46 | **Urgencia, programado u obra.** | Se oscurece la pantalla y sube una hoja: "Plomería · ¿Qué tipo de trabajo es?" con **Urgencia** (Lo antes posible) · **Programado** (Elegís día y horario) · **Obra** (Un trabajo más grande). El dedo elige Programado. Selector de fecha en español: "¿Cuándo te queda bien?", rueda de días (Mar 13 oct … Sáb 17 oct) y horarios; queda **Jue 15 oct · 16:00**. Botón **Pedir presupuestos**. | toques, "clic" de la rueda | toca "Pedir presupuestos"; el teléfono queda en su lugar |
| 6 | `presupuestos` | 46–60 | **El especialista pone su precio. Vos elegís.** | Chat "Presupuestos · Plomería": aviso "Tu pedido llegó a especialistas verificados." Llegan tres mensajes estructurados, estilo cuenta de empresa verificada: avatar, nombre con insignia **Verificado**, rubro y el detalle (trabajo, mano de obra, materiales, total, validez 48 h) con botones **Aceptar** y **Consultar**. Después salen del teléfono y se comparan lado a lado. El dedo acepta el de Martín R. | golpe de sección, "ding" por presupuesto | la tarjeta elegida vuelve al teléfono |
| 7 | `confirmacion` | 60–68 | **Precio final antes de confirmar.** | "Confirmá tu pedido": Martín R., Jue 15 oct, Llega entre 16:06 y 16:30, Casa · Mar del Plata. Desglose: presupuesto **$ 45.000** + tarifa de servicio Handy 5% **$ 2.250** = **$ 47.250**, también grande en el escenario. El dedo toca **Confirmar** y aparece el tilde. | golpe al total, campana de confirmación | el teléfono queda en su lugar |
| 8 | `seguimiento` | 68–80 | **Tu teléfono no se comparte. Todo queda en Handy.** | Mapa ilustrado con tres estados: **Buscando a Martín…** → **Martín está en camino** → **¡Martín llegó!**, siempre con "Llega entre 16:06 y 16:30". Después el chat interno: Martín: "¡Hola! Estoy a unas cuadras." · "¿Me mandás una foto de la pérdida? Así llevo el repuesto justo." · Vos: foto del caño goteando + "Es abajo de la bacha." · Martín: "Perfecto, ya sé qué llevar." | groove, "ding" por mensaje | el chat se cierra |
| 9 | `resena` | 80–85 | **¿Cómo fue tu experiencia con Martín?** | Se completan las 5 estrellas, una por tiempo; "Enviar". Los Handys aparecen y festejan alrededor del teléfono. | campanas ascendentes, golpe de festejo | el teléfono baja y sale |
| 10 | `cierre` | 85–90 | logo · **Mar del Plata · Llegamos el 28/10** · QR | Los Handys juntos, el logo y la fecha de lanzamiento. El QR sale de la constante `QR_URL` (en `js/trailer.js`); si está vacía, solo el texto, centrado. El último cuadro queda quieto. | golpe final y acorde | fin: botón "Ver de nuevo" abajo, sin tapar el cierre |

Datos de los presupuestos (escena 6), pedido del jueves 15 de octubre de 2026 a las 16:00, trabajo "Reparar pérdida en el caño de la bacha":

| especialista | mano de obra | materiales | total | llegada declarada | validez |
|---|---|---|---|---|---|
| Martín R. (elegido) | $ 32.000 | $ 13.000 | **$ 45.000** | Llega entre 16:06 y 16:30 | 48 h |
| Lucía G. | $ 36.000 | $ 12.500 | $ 48.500 | Llega entre 15:40 y 16:10 | 48 h |
| Diego P. | $ 29.000 | $ 22.000 | $ 51.000 | Llega entre 17:00 y 17:30 | 48 h |

Confirmación (escena 7): $ 45.000 + 5% ($ 2.250) = **$ 47.250** (`priceWithFee(45000)`).

## Interacción

- Tocar la pantalla pausa y reanuda. En pausa aparece la lista de escenas: tocar una salta a esa etiqueta y sigue.
- Teclado: Espacio pausa · ← → escena anterior/siguiente · 1–9 y 0 saltan a la escena 1–10 · M silencio · F pantalla completa.
- `?t=SEGUNDOS` congela un cuadro; `?embed` es la vista previa muda del hub.
