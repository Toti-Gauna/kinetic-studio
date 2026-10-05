# Handy · diseño 2026 de la app (para los tráileres)

Las pantallas de la app que se ven dentro del teléfono en **todos** los tráileres de Handy (`handy-usuario`,
`handy-especialista`, `handy-vertical`, `handy-anuncio`) se rehacen con el diseño nuevo. Referencia: las fotos de
`handy-2026/usuario/pantallas/*.png` y `handy-2026/especialista/pantallas/*.png` (≈1138×2513, pantalla sola), más
`pestanas/` (las cuatro pestañas) y `errores/`. **No se pegan imágenes**: cada pantalla es HTML + CSS armado con
componentes, para que las escenas animen sus partes (escribir un monto, llegar una propuesta, prender un interruptor).

Esta carpeta (`src/handy/app/`) es la biblioteca nueva. La vieja (`src/handy/pantallas/`, la mayor parte de
`src/handy/ui/` y sus CSS) sigue hasta que las escenas migren; después se borra.

## Geometría
- Pantalla del teléfono: **414×896** px (`SCREEN`, marco `PhoneFrame` de 438×920). Escala del diseño:
  **px del diseño × 0,3638 = px nuestros** (1138 → 414). Ej.: un botón de 120 px de alto en la foto mide 44 px acá.
- Las fotos son un poco más altas (2513 × 0,3638 = 914): lo que sobra se resuelve en el aire vertical, nunca
  achicando texto.
- Barra de estado: la de `PhoneFrame` (la hora la eligen las escenas: es parte de la historia; el diseño dice 9:41).

## Tokens (medidos en las fotos)
| token | valor | dónde |
|---|---|---|
| azul | `#1F57A8` | logo, títulos de hojas, botones, barra inferior, paneles azules |
| azul oscuro | `#183E78` | el canto 3D de los botones azules (sombra sólida abajo), encabezado azul en hojas |
| azul medio | `#3E6EB4` | íconos y textos secundarios sobre azul, tarjetas sobre azul |
| azul tinta | `#0E1D36` / `#1D2C4A` | textos principales y títulos negros, íconos de línea |
| gris ficha | `#ECECEC` | fichas de rubros, chips apagados, teclas (con canto `#D5D7DE`) |
| celeste chip | `#E9EFF9` | píldoras de dirección, chips "Plomería", cajas de info |
| fondo de sección | `#F4F5F8` | cajas dentro de hojas (precio, horarios) |
| verde | `#1E9E57` / fondo `#E3F5EA` | "Verificado", montos que cobra el especialista, éxito, botón Confirmar/Pagar |
| amarillo | `#F5F59A` | el subrayado de títulos, chips "Hoy", "Vos decidís", avisos, la lamparita |
| rojo | `#D93025` | botón cerrar (círculo), "Cancelar turno", montos negativos, advertencias (fondo `#FDECEA`) |
| mapa | `#E6E9EE` manzanas · `#CFE3F7` mar · `#D7EBCF` plaza · `#F5E9C8` avenidas |
| aviso (toast) | negro `#0B0B0C`, radio ≈ 28, ícono en cuadradito de color | notificaciones arriba |

## Tipografía
- **DM Sans** (variable, `@fontsource-variable/dm-sans`): todo el texto de la interfaz. Pesos 400/500/700/800.
- **Archivo expandida** (`@fontsource-variable/archivo`, `font-stretch: 125%`, peso 800–900): títulos grandes
  ("¿Qué necesitás hoy?", "Tu agenda", "Contanos qué pasó", "Tu precio", "Te llegaron 3", "¡Listo, quedó arreglado!",
  "Estás disponible", montos grandes "$ 47.250" / "$ 45.000").
- Subrayado amarillo: una banda `#F5F59A` detrás de la parte baja de una palabra (≈ 45 % del alto del texto,
  corrida hacia abajo), como "hoy", "agenda", "Perla", "elige", "trabajo".
- Rótulos de sección: DM Sans 700, mayúsculas, tracking ≈ 0,12 em, color `#5B6575` ("TU PRÓXIMO TURNO",
  "¿CUÁNDO PODÉS IR?").
- El logo "Handy · Soluciones, no problemas" del encabezado es `handyLogo()` de `src/handy/logo.ts` (ya existe).
- Las fuentes se importan con `src/handy/app/fuentes.ts` (empaquetadas: funcionan sin red, también al exportar MP4).
  Variables: `--hd-app-font` (DM Sans) y `--hd-app-display` (Archivo 125 %). Los titulares del tráiler (fuera del
  teléfono) siguen en Inter: no se tocan.

## Componentes (src/handy/app/ui)
Encabezado (logo + campana con globito amarillo de número + ubicación; versión blanca y versión azul), barra inferior
azul (Inicio · Agenda · Mensajes · Cuenta, la activa con punto), hoja (asa gris, título azul Archivo, X roja en
círculo, línea debajo del título), aviso negro (toast) arriba, botón primario azul con canto 3D, botón verde, botón
gris, botón contorno punteado ("Prefiero elegir la fecha"), chips (horario, rubro, "Vos decidís"), avatar con
iniciales ("E1", "LP", "TN") y tilde verde, píldora "Verificado", tarjeta blanca con sombra suave, caja de sección
`#F4F5F8`, título con subrayado amarillo, desglose de precios (filas, subtotal, total en Archivo), barra de progreso
de pasos (Confirmado · En camino · Llegó · Trabajando / Saliste · En camino · Llegaste), mapa (manzanas, mar,
avenidas con nombre, "LA PERLA", "MAR ARGENTINO"), interruptor (No disponible / Disponible), teclado numérico,
calendario de mes y tira de días, burbujas de chat y tarjetas de chat (solicitud de turno, propuesta, foto), acciones
rápidas del chat, campo de mensaje, estrellas grandes en cuadraditos amarillos.

## La historia (datos de las fotos: la misma en todos los tráileres)
Ningún nombre propio: el diseño los oculta. **Especialista 1** (avatar "E1", Plomería · Gas, Verificado por Handy),
**Especialista 2** ("E2", Plomería · Electricidad), **Especialista 3** ("E3", Plomería · Albañilería). Del otro
lado, **Cliente · La Perla** ("LP"). Ciudad: Mar del Plata, barrio **La Perla**, dirección **Catamarca 1650**.
- Pedido: **Plomería · Urgencia · Hoy (martes 17/11)**. Lo que pasó: «Se rompió el caño de abajo de la pileta de la
  cocina y pierde agua.» Trabajo: **Cambiar el caño de abajo de la pileta de la cocina**. Dónde: **Casa ·
  Catamarca 1650, Mar del Plata**.
- Propuestas (llegan en este orden): **Especialista 1**: mano de obra $ 32.000 + materiales $ 13.000 = subtotal
  **$ 45.000** + tarifa de Handy · cliente (5 %) $ 2.250 = **Total final para vos $ 47.250**, horario que propone
  **Hoy · 16 a 18 h**, vence en 24 h. **Especialista 2**: $ 36.000 + $ 12.500 = $ 48.500 → $ 50.925.
  **Especialista 3**: $ 29.000 + $ 22.000 = $ 51.000 → $ 53.550. El usuario elige a Especialista 1.
- Especialista: le llega «Nuevo pedido de plomería · La Perla, a 2,3 km. Handy sugiere $ 44.000.» Elige
  **Hoy, de 16 a 18 h**, escribe **$ 45.000** (Handy sugiere $ 44.000 · *Vos decidís*); recibe **$ 40.500**
  (Handy retiene solo su tarifa del 10 %: $ 4.500). «Presupuesto enviado · Ahora elige el cliente». «¡El cliente te
  eligió! Plomería en La Perla. Ya podés ir para allá.»
- Chat (usuario ↔ Especialista 1, «Chat del trabajo. Tu número no se comparte: hablan por acá.»): usuario «¡Hola! Te
  elegí para arreglar la pérdida de la cocina.» + foto «Así está el caño de abajo de la pileta» · especialista
  «¡Hola! Gracias. Voy en la franja que te marqué.» · usuario «¡Genial, gracias!» (del lado del especialista:
  cliente «¿Venís hoy? Te espero.» · «¡Hola! Salgo para allá en la franja que te marqué.» · «¡Genial! Te espero.»).
- En camino: «Vas para allá · Catamarca 1650, La Perla · Hoy, de 16 a 18 h · a 2,3 km». Del lado del usuario:
  «Especialista 1 va para tu casa», pasos Confirmado · En camino · Llegó · Trabajando, «Horario que declaró: Hoy ·
  16 a 18 h», «Total vigente para vos $ 47.250».
- Trabajo: «Trabajo en curso · Plomería en La Perla», cronómetro en la píldora de arriba, «Tu cuenta del trabajo»
  (mano de obra $ 32.000, materiales $ 13.000, tu presupuesto $ 45.000, tarifa Handy (10 %) − $ 4.500, recibís
  $ 40.500), «Terminar trabajo». Sin adicionales en los tráileres.
- Fin (especialista): «¡Terminaste el trabajo! · Ganaste **$ 40.500**» con el caño y la gota en la caja amarilla y
  el tilde verde; aviso «Cobro registrado · $ 40.500 directo a tu cuenta.»; «Cobros»: CBU / CVU •••• 4521, alias
  tu.alias.de.siempre, movimiento «Plomería · Hoy, 17/11 · + $ 40.500 · A tu cuenta».
- Fin (usuario): «¡Listo, quedó arreglado!» con los Handys, Especialista 1, «Total a pagar $ 47.250», «Pagar
  $ 47.250», «Calificar a Especialista 1»; reseña «¿Cómo te fue?» cinco estrellas, chips Puntual · Prolijo ·
  Explicó todo · Buen trato; «¡Gracias por calificar!».
- Agenda: noviembre 2026, el martes 17 marcado.

## De dónde sale cada pantalla de los tráileres
| hoy (pantallas viejas) | diseño nuevo |
|---|---|
| usuario: `pantallaInicio` | `01-u-inicio` (con la pestaña Inicio activa) |
| usuario: `hojaTipoTrabajo` | `02-u-opciones` (hoja ¿Para cuándo lo necesitás? Urgencia · Programado · Obra) |
| usuario: `pantallaFecha` (rueda de fecha) | `03-u-describir` (Contanos qué pasó → Pedir presupuestos); `27-u-programar` si una escena programa |
| usuario: `pantallaPresupuestos` + `chatPresupuesto` | `04-u-buscando` (mapa + «Te llegó 1 propuesta 1/3») y `05-u-presupuestos` (tarjetas de propuesta, Elegir) |
| usuario: `pantallaConfirmar` | `09-u-confirmar` (Confirmá el turno) + aviso «Turno confirmado» |
| usuario: `pantallaSeguimiento` | `10/11-u-seguimiento` |
| usuario: `pantallaChatEspecialista` | `12-u-chat` |
| usuario: `hojaResena` | `13-u-terminado`, `15/16/17-u-resena` |
| especialista: `pantallaInicioEsp` | `01/02-e-inicio` (No disponible → Disponible, «Buscando pedidos») |
| especialista: `tarjetaPedido` | aviso «Nuevo pedido de plomería» (`03-e-precio`) + tarjeta de pedido (`29-e-pedido-programado`, con los datos de la urgencia) |
| especialista: `hojaPresupuesto` | hoja «Tu precio» (`03…09-e-precio`: chips de horario, Handy sugiere, monto con − / +, teclado, Recibís) |
| especialista: «Presupuesto enviado» | `10-e-aceptado` (Ahora elige el cliente) |
| especialista: `avisoElegido` | aviso «¡El cliente te eligió!» (`11-e-chat`) |
| especialista: `pantallaAgenda` | `20/21-e-turnos` (Tu agenda) |
| especialista: `pantallaChatCliente` | `11/12-e-chat` |
| especialista: `pantallaEnCamino` | `13/14-e-en-camino` |
| especialista: `pantallaTrabajo` | `15-e-trabajo` |
| especialista: `pantallaFin` | `19-e-fin` |
| especialista: `avisoCobro` | aviso «Cobro registrado» (`19-e-fin`) y `41-e-caja` (Cobros) |
| especialista: `resenaCliente` | hoja de calificación al estilo `16-u-resena`, vista del especialista («Cliente · La Perla te calificó») |

Lo que no está en esta tabla (HandIA, pagos, contactos, notificaciones, cambiar fecha) se arma solo si una escena lo
usa.
