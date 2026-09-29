# Tráileres para producir: plan de pruebas de motion graphics

Cada idea está pensada para poner a prueba algo distinto del motor. Las 23 ya figuran en el hub
([hub/catalog.js](hub/catalog.js)): las marcadas con ✅ (de la 01 a la 23, la lista completa) están habilitadas y el
resto aparece como PRÓXIMAMENTE.

**Estados**

- 🟢 **Listo con el kit**: se arma solo con las recetas actuales.
- 🟡 **Recetas nuevas**: hay que escribir una o dos escenas nuevas en el kit.
- 🔴 **Tecnología nueva**: requiere algo que el kit todavía no tiene (WebGL, exportar a video…).

**Cómo producir uno.** Abrí una sesión nueva de Claude Code en esta carpeta y pedí:

> «Usá el agente trailer-director para hacer el tráiler *GLITCH* del hub (ver TRAILER-IDEAS.md) y habilitalo en el catálogo».

El agente lo construye en `trailers/<id>/`, lo verifica cuadro por cuadro y lo habilita en el hub.

---

## Orden de prueba sugerido

| Fase | Tráileres | Qué valida |
|---|---|---|
| 1. Kit tal cual | ~~BAUHAUS 100~~ ✅, una marca real (tipo *Pulso*) | que el agente produce bien solo con las recetas existentes |
| 2. Recetas 2D | ~~MANIFIESTO~~ ✅, ~~DATA STORY~~ ✅, ~~DEPLOY~~ ✅, ~~COUNTDOWN~~ ✅, ~~LAUNCH~~ ✅ | tipografía, datos y UI: lo que más se usa en productos reales |
| 3. Efectos y estilo | ~~GLITCH~~ ✅, ~~NOIR~~ ✅, ~~SYNTHWAVE~~ ✅, ~~OPENING TITLES~~ ✅, ~~LIQUID~~ ✅ | que el sistema no quede atado a un solo look |
| 4. Simulación y audio | ~~ENJAMBRE~~ ✅, ~~GLOBAL~~ ✅, ~~BEAT~~ ✅, ~~PAPER CITY~~ ✅ | física determinista, proyecciones y audio que mueve la imagen |
| 5. Formatos | ~~VERTICAL~~ ✅, ~~WRAPPED~~ ✅, ~~LOWER THIRDS~~ ✅ | escenarios que no son 16:9, contenido desde datos, piezas modulares |
| 6. Tecnología nueva | ~~EXPORT~~ ✅, ~~BIG BANG~~ ✅, ~~HYPERSPACE~~ ✅, ~~BIFURCACIÓN~~ ✅ | MP4/GIF, WebGL/Three.js, interactividad |

---

## Estudio

### 01 · KINETIC 🟢 *(disponible)*
Estudio de movimiento sobre forma, color y tiempo. Es la referencia de calidad y el origen del kit.
**Prueba:** morphing, tipografía variable, partículas, túnel warp, score sintetizado y continuidad entre escenas.

## Tipografía y efectos

### 02 · MANIFIESTO ✅ *(disponible · 48 s · [trailers/manifiesto](trailers/manifiesto/index.html))*
Tráiler 100% tipográfico, en español. Recorre estas escenas:
- una máquina de escribir cuya palabra seleccionada se convierte en la página;
- pósters suizos justificados con el eje de ancho variable;
- un specimen vivo de Archivo con sliders de ejes;
- 4 reglas numeradas con odómetro y serif itálica;
- un ticker que acelera hasta congelarse;
- montaje de glifos, título con letras en órbita y créditos.

**Sumó al kit 5 recetas:** `typewriter`, `stack`, `specimen`, `rules` y `ticker`, más la serif
itálica editorial (`<i>`), el sonido de tecla y `title` con `glyphs`. Eso abarata otras ideas:
- DEPLOY puede usar `typewriter`.
- COUNTDOWN puede reutilizar el odómetro de `rules`.
- LOWER THIRDS y OPENING TITLES pueden partir de `stack` y `rules`.

### 03 · GLITCH ✅ *(disponible · 40 s · [trailers/glitch](trailers/glitch/index.html))*
Una transmisión que arranca, pierde la señal, se corrompe y termina secuestrada por el propio error:
- log de arranque de sistema;
- carta de ajuste con apagado de CRT;
- palabras corruptas en tajadas;
- datamosh en canvas;
- pantalla azul de pánico;
- montaje de 12 cortes a 1/8 de segundo;
- título con ráfagas de glitch.

Todo lleva scanlines y banda VHS.

**Sumó al kit:**
- un módulo con plugin: `D.glitch()`, con desgarro por filtro SVG, RGB split y bloques de
  interferencia, determinista y seekable;
- una opción `glitch` en cualquier escena y el overlay `crt`;
- 5 recetas: `boot`, `testcard`, `corrupt`, `datamosh` y `bsod`;
- 4 sonidos: `glitch`, `beep`, `zap` y `hiss`;
- el sistema de plugins y capas de canvas propias (`D.layer`).

Eso abarata otras ideas: DEPLOY (usa `boot`), SYNTHWAVE (usa `crt`) y cualquier tráiler que quiera
un acento glitch.

## Formas

### 04 · BAUHAUS 100 ✅ *(disponible · 48 s · [trailers/bauhaus](trailers/bauhaus/index.html))*
Homenaje a la Bauhaus (1919–1933) en primarios de imprenta:
- "WEIMAR, 1919. NACE LA BAUHAUS." a máquina de escribir;
- la gramática PUNTO · LÍNEA · PLANO · GRILLA · VOLUMEN con formas propias;
- el cuestionario de Kandinsky de 1923 (triángulo amarillo, cuadrado rojo, círculo azul);
- una composición que se dibuja como un plano y se imprime;
- el póster suizo "ARTE, OFICIO, LETRA Y ARQUITECTURA → una sola escuela";
- los 3 directores;
- "MENOS ES MÁS.";
- el título en tinta sobre papel.

**Cómo se hizo:** fue la **prueba del agente `trailer-director`** con la consigna "solo kit, cero
código nuevo", y la cumplió. El agente encontró 4 bugs del kit y propuso 10 mejoras. Corregí los
bugs y sumé 4 opciones al kit: `title` sobre fondo claro, `credits` con fondo propio, `logo` con
`hold` y mejor documentación de `shift`. Las recetas pendientes quedaron en el roadmap del README
del kit, como la receta `composition` y la línea de tiempo.

### 05 · LIQUID ✅ *(disponible · 47 s · [trailers/liquid](trailers/liquid/index.html))*
"Todo fluye", en una cadena continua donde cada escena nace de la anterior:
- una gota cae al centro y salpica;
- de ese punto brotan blobs 3D brillantes que se separan y se funden mezclando colores;
- la palabra "SÓLIDO" se derrite y gotea;
- el líquido sube con "FLOTAR" flotando en la superficie;
- quedamos bajo el agua con rayos de luz y burbujas;
- las formas GOTA · ONDA · MAREA · ESPUMA;
- un mesh gradient con "SIN BORDES. SIN FORMA FIJA.";
- montaje, título y "TODO FLUYE.".

**Sumó al kit:**
- un módulo líquido con 6 recetas: `drop`, `metaballs` (calculadas por píxel con sombreado 3D),
  `melt` (filtro gooey), `flood`, `underwater` y `mesh`;
- 3 sonidos de agua: `plip`, `bubbles` y `swell`.

Eso abarata otras ideas: `mesh` sirve de fondo para LAUNCH o WRAPPED, `metaballs` para BEAT y
`flood` como transición en cualquier tráiler.

## Partículas

### 06 · BIG BANG ✅ *(disponible · 38 s · [trailers/big-bang](trailers/big-bang/index.html))*
Del vacío al universo con 120.000 partículas:
- "HACE 13.800 MILLONES DE AÑOS / NO HABÍA NADA." y un punto de luz que late;
- el BANG, una bola de fuego que se expande y se enfría;
- la red cósmica;
- una galaxia espiral que la cámara inclina hasta verla de frente;
- un planeta iluminado con anillos;
- "BIG BANG" escrito con estrellas, y el colapso final en un punto;
- "SOMOS POLVO DE ESTRELLAS.".

**Sumó al kit:** la primera tecnología nueva, **una capa WebGL**. La posición de cada partícula
se calcula en la GPU como una fórmula del tiempo, sin simulación, así que se puede saltar a
cualquier cuadro y repetir exacto. Trae cámara 3D, profundidad de campo, 6 formaciones y 5 recetas
(`bigbang`, `cosmicweb`, `galaxy`, `planet`, `starword`). Es la base para HYPERSPACE (#08) y
ENJAMBRE (#07).

### 07 · ENJAMBRE ✅ *(disponible · 39 s · [trailers/enjambre](trailers/enjambre/index.html))*
Del atardecer a la noche con 1.600 estorninos:
- un pájaro solo cruza el cielo, "UNO SOLO / NO ES NADA.";
- llega la bandada en una cinta y se vuelve una murmuración;
- forman "JUNTOS";
- un halcón se lanza y la bandada se abre y se vuelve a cerrar: "NADIE MANDA. TODOS REACCIONAN.";
- dibujan una órbita, una espiral y un corazón;
- de noche forman "ENJAMBRE" brillando como un show de drones y estallan.

**Sumó al kit:**
- una **simulación real de bandada** (boids con los 7 vecinos más cercanos, como los estorninos
  reales), **precalculada al cargar**, así que se puede saltar a cualquier cuadro y repetir exacto;
- 5 recetas (`murmuration`, `flockword`, `predator`, `flockshape` y `flocktitle`), el gancho
  `done` para plugins y los sonidos `flutter` (aleteo) y `cry` (halcón).

## 3D y profundidad

### 08 · HYPERSPACE ✅ *(disponible · 49 s · [trailers/hyperspace](trailers/hyperspace/index.html))*
Un viaje 3D real en 7 planos unidos por destellos:
- un hangar hexagonal cuyas luces se encienden una por una;
- una cuenta regresiva y el salto, con las estrellas estiradas en líneas;
- el túnel del hiperespacio, con "MÁS RÁPIDO / QUE LA LUZ.";
- un planeta con bandas, atmósfera, anillos y luna: "NUEVOS MUNDOS";
- un campo de 450 asteroides iluminados: "NAVEGAR EL CAOS.";
- un portal gigante que se atraviesa;
- el título "HYPERSPACE" hecho de bloques 3D que llegan desde el fondo y que la cámara atraviesa.

**Sumó al kit:** la segunda tecnología nueva, **una capa Three.js** (r147) con geometría sólida,
luces, shaders propios y **bloom**. Cada plano se calcula como una función del tiempo, así que se
puede saltar a cualquier cuadro. Todos los materiales se compilan al cargar para que los cortes no
se traben, y trae 7 recetas. Sirve de base para PAPER CITY (#09) y GLOBAL (#11).

### 09 · PAPER CITY ✅ *(disponible · 43 s · [trailers/paper-city](trailers/paper-city/index.html))*
Una maqueta de papel con sombras reales:
- un plano azul que se dibuja solo y se disuelve, revelando el papel: "TODA CIUDAD EMPIEZA EN UN PAPEL.";
- 123 edificios que crecen piso por piso en ondas desde el centro: "BLOQUE A BLOQUE.";
- tráfico en efecto miniatura (tilt-shift);
- un time-lapse de 13:00 a 23:30 donde las sombras giran, el cielo pasa por dorado y violeta y
  se prenden las ventanas;
- el título "PAPER CITY" desplegándose como un libro pop-up frente a la ciudad de noche.

**Sumó al kit:** el módulo `recipes-city.js` sobre la capa 3D, con:
- sombras suaves;
- ventanas procedurales inyectadas en el material estándar;
- tilt-shift en dos pasadas y un ciclo día/noche con color grading;
- blueprint y letras pop-up, más el sonido `fold` (papel);
- en el núcleo 3D, pases de post-proceso por plano y un color de fondo por plano.

## Datos

### 10 · DATA STORY ✅ *(disponible · 48 s · [trailers/data-story](trailers/data-story/index.html))*
El mundo en números, con **datos reales descargados de Our World in Data** y la fuente citada en
cada gráfico:
- "EN 2023 ÉRAMOS 8.091.734.933 PERSONAS", en un odómetro;
- la población mundial 1800–2023 dibujándose, con los hitos de 1.000, 2.000, 4.000 y 8.000 millones;
- la esperanza de vida de 46,4 a 73,2 años: "+26,8 AÑOS";
- de 16 a 74 de cada 100 personas en internet, en un waffle;
- la capacidad solar, de 1,2 a 2.397 GW: "CASI ×2.000";
- el título "DATA STORY" hecho de barras.

**Sumó al kit:** el módulo `recipes-data.js`, con 5 recetas diseñadas con las reglas de dataviz
(una serie por gráfico, énfasis, etiquetas selectivas, paleta validada con el script) y un flujo
documentado para bajar datos reales. En lugar de donuts usa el waffle, que es la forma correcta
para una proporción; un donut de 2 porciones es un anti-patrón.

### 11 · GLOBAL ✅ *(disponible · 52 s · [trailers/global](trailers/global/index.html))*
El mundo, conectado, con geografía y cifras reales:
- un mapa de puntos (proyección sinusoidal) que se escanea y se envuelve en un globo ortográfico:
  "UN MAPA." → "UN MUNDO.";
- rutas desde Buenos Aires a Nueva York, Madrid, Ciudad del Cabo, Dubái, Tokio y Sídney: la cámara
  sigue cada arco de gran círculo y un tablero anota la distancia calculada (69.262 km en total);
- 24 horas en 7 segundos del 21 de junio: el terminador día/noche, el crepúsculo en ámbar y las
  luces de las ciudades que se encienden: "EN CADA INSTANTE, MEDIO PLANETA ESTÁ DE NOCHE.";
- pasajeros aéreos 1970–2023 (OACI vía Banco Mundial): de 310 a 4.456 millones, la caída del
  −60 % en 2020 y 4.269 millones en 2023, con arcos que se disparan al ritmo de la serie;
- el título "GLOBAL" con el globo como la "O", un anillo orbital y un satélite.

**Sumó al kit:** el módulo `recipes-globe.js` (5 recetas) y `tools/make-land-mask.mjs`, que hornea
la tierra de Natural Earth en una máscara de bits de 42 KB (sin imágenes). Dibuja unos 8.500 puntos
en 1–4 ms por cuadro, calcula distancias con haversine y es 100 % determinista al saltar en el tiempo.

### 21 · WRAPPED ✅ *(disponible · 43 s · [trailers/wrapped](trailers/wrapped/index.html))*
**Tu año en números**, en tarjetas vibrantes de 9:16 armadas desde un JSON. Para no inventar a
nadie, los perfiles son los propios tráileres del hub, con **cifras reales medidas por script**
(`tools/measure.mjs` abre cada tráiler en Chrome y cuenta su duración, escenas, animaciones,
eventos, palabras en pantalla y recetas):
- sin parámetros es **el año del estudio**: 22 tráileres, los minutos de todos seguidos, las
  animaciones y los eventos sumados, la categoría favorita, el top 5 de los que más se mueven, un
  color por tráiler y la tarjeta para compartir;
- con `?who=kinetic` (o `noir`, `beat`…) es **el año de ese tráiler**: su duración, escenas,
  animaciones, eventos y palabras con su puesto entre los 22, sus escenas más largas y su paleta;
- el final reparte las tarjetas de todos, que salen de la misma plantilla con otros datos: "UNA
  PLANTILLA. 22 HISTORIAS."

Los números cuentan, cada tarjeta entra con un barrido distinto y los colores del texto se eligen
por contraste WCAG.

**Sumó al kit:** el módulo `recipes-wrapped.js` (6 recetas y `Trailer.wrapped.scenes(perfil)`), una
barra de historias que sigue la tinta de cada tarjeta y `measure.mjs` como patrón para medir datos
reales de un sitio.

<details><summary>La idea original</summary>

Tu año en números, al estilo Spotify Wrapped: tarjetas vibrantes generadas desde un JSON de stats.
**Prueba:** plantillas alimentadas por datos, así un mismo tráiler sirve para N personas.
**Recetas nuevas:** `statCard`, más la entrada por JSON.
</details>

## Producto

### 12 · LAUNCH ✅ *(disponible · 53 s · [trailers/launch](trailers/launch/index.html))*
El tráiler de producto de **KINETIC STUDIO**, el propio estudio. La interfaz es HTML y CSS de verdad y
cada número del panel es real (lo lee un script del hub y del kit):
- una barra de comandos tipea "Crear un tráiler de lanzamiento" (con un error que se corrige) y, al
  apretar Enter, se expande hasta ser la ventana de la app;
- el panel se arma solo: 11 tráileres, 8:24 de película, 66 recetas, 7.706 líneas de código, la
  duración de cada tráiler y los recientes;
- el cursor crea "LAUNCH": modal con zoom de cámara, tipeo, plantilla, sonido y una barra de
  progreso que cuenta las escenas de este mismo film;
- notificaciones apiladas, la fila nueva que empuja a las demás, 11 → 12 tráileres y la barra de
  LAUNCH con su propia duración, medida del film ya armado;
- el modo oscuro se abre en círculo desde el interruptor, y la interfaz se separa en capas 3D;
- el ícono, "KINETIC STUDIO" y un botón "Abrir el hub" que el cursor aprieta.

**Sumó al kit:** el módulo `recipes-ui.js` (7 recetas): cursor con trayectorias curvas y clics con
onda, tipeo humano, modal, notificaciones, movimientos tipo FLIP, tema oscuro en círculo y vista
explotada con CSS 3D. Los valores que dependen del film terminado (duración, escenas) se completan
solos después de armarlo.

### 13 · DEPLOY ✅ *(disponible · 56 s · [trailers/deploy](trailers/deploy/index.html))*
Para developers, y todo corrió de verdad mientras se armaba:
- una terminal con comandos reales y su salida real (`ls trailers`, las líneas del kit y el
  chequeo de GLOBAL);
- el editor con `recipes-music.js`, las líneas reales que generan el ritmo, y tres líneas que se
  tipean en vivo (bombo, aplauso, hi-hat);
- el treemap del kit: el peso real de cada archivo;
- el deploy: el chequeo real de los 14 tráileres publicados (14/14, 0 errores) antes de sumar este;
- "$ deploy" que compila letra por letra, y "EL CÓDIGO ES LA PELÍCULA."
**Prueba:** typewriter con ritmo humano, resaltado de código y barras de progreso.
**Recetas nuevas:** `terminal`, `code`.

## Encargos

### ECOMMERCE ✅ *(disponible · 1:30 · [trailers/ecommerce](trailers/ecommerce/index.html))*
Encargo: un tráiler de 90 s para un ecommerce argentino, todo manejado con un mouse y con música
divertida. Mezcla KINETIC, MANIFIESTO, BAUHAUS, DATA STORY, GLOBAL y LAUNCH:
- "TODO EMPIEZA CON UN CLICK", formas Bauhaus que mutan (bolsa, carrito, tarjeta, camión, etiqueta:
  ELEGÍ · AGREGÁ · PAGÁ · ENVIÁ · VENDÉ) y pilas de palabras en amarillo;
- la tienda: se arma sola, login con e-mail y contraseña, modo oscuro en círculo, productos que
  vuelan al carrito, checkout con código postal (Córdoba 5000), cinco medios de pago y confeti;
- "PAGÁ COMO QUIERAS" en puntos numerados, Argentina resaltada con envíos a las 24 jurisdicciones
  (coordenadas reales) y los 3.643 km de La Quiaca a Ushuaia (calculados);
- el admin: panel de ventas, carga de un producto arrastrando la foto y la analítica con tooltip;
- el final: "ECOMMERCE · TODO A UN CLICK" con un cursor gigante que hace el clic.

Las ventas, precios y pedidos de la tienda son **datos de ejemplo** y la pantalla lo dice.
**Sumó al kit:** `recipes-shop.js` (8 recetas), `recipes-music.js` (una base pop sintetizada para
todo el film), `globeship` con máscaras de países (`make-land-mask.mjs --countries`) y
`fonts.preload` en el motor.

### ECOMMERCE REMIX ✅ *(disponible · 1:00 · [trailers/ecommerce-remix](trailers/ecommerce-remix/index.html))*
La misma tienda, recortada como tráiler (encargo: "más tráiler, más rápido, más movimiento"):
- cold open: "¿y si vender fuera tan fácil… como un click?" en la oscuridad, el cursor hace clic y
  todo se inunda de celeste; montaje Bauhaus en corcheas y **DROP** con "ECOMMERCE" + sello REMIX;
- la tienda a toda velocidad: cada escena acelerada para caer en su compás, con cámara 3D (la
  vitrina entra volando, zoom al login, el modo oscuro nace del interruptor) y barridos,
  intercalada con golpes de palabras: AGREGÁ. · PAGÁ / COMO / QUIERAS.;
- el corte: Argentina desde el globo y cifras reales (24 jurisdicciones · 3.643 km · 5 medios de
  pago · 1 click); **DROP 2** con el admin volando en 3D, la carga y la analítica;
- el cierre: "ECOMMERCE · TODO A UN CLICK". Música house en La menor, 60 s justos.

**Sumó al kit:** `Trailer.ui.warp` (acelerar cualquier receta sin reescribirla), cámara por
fotogramas clave, barridos, las recetas `clickopen`, `remixtitle`, `slam` y `statpunch`, y los
estilos musicales `tension`, `house` y `stutter`.

## Formatos

### 14 · VERTICAL ✅ *(disponible · 38 s · [trailers/vertical](trailers/vertical/index.html))*
Un Reel del propio hub, en 9:16:
- el gancho: "16 · TRÁILERES · 0 · VIDEOS · TODO · CÓDIGO", una palabra por pulso;
- el feed: un post por tráiler publicado, con su póster real, título, escenas, duración y
  hashtags de sus etiquetas. El dedo hace swipe cada vez más rápido;
- el perfil: pinch al grid, swipe al encabezado (16 tráileres · 89 recetas · 0 videos), tap
  que abre KINETIC, doble tap con corazón y mantener presionado con la hoja de opciones;
- las cifras reales del kit y "KINETIC STUDIO" con un "deslizá y entrá al hub".

**Sumó al kit:** la opción `stage: { w, h }` en el motor (escenarios verticales o cuadrados),
`shoot.mjs` que detecta el tamaño, el módulo `recipes-vertical.js` (5 recetas, barra de
historias, dedo con gestos, subtítulos palabra por palabra) y `hub/motifs.js` (los pósters del
hub, reutilizables).

### 15 · COUNTDOWN ✅ *(disponible · 39 s · [trailers/countdown](trailers/countdown/index.html))*
Una cuenta regresiva **en vivo** hacia el próximo Año Nuevo. Es real para quien la mira, porque se
calcula con su propio reloj:
- 10 → 0 en dígitos de trazo que se transforman unos en otros, con un anillo que se vacía;
- "¿CUÁNTO FALTA PARA 2027?" en golpes de color;
- la hora local real con un reloj analógico y la fecha de hoy;
- un tablero de paletas con los días, horas, minutos y segundos que faltan;
- el año en puntos (un punto por día) con el porcentaje que ya pasó;
- 3 · 2 · 1, "2027" que se dibuja con fuegos artificiales y "AGENDÁ EL 1·1·2027".

**Sumó al kit:** el módulo `recipes-countdown.js` (5 recetas y una tipografía de trazo para los
dígitos) y `--query` en `shoot.mjs` para fijar el reloj en los renders.

<details><summary>La idea original</summary>

Cuenta regresiva para un lanzamiento: números gigantes que se transforman, reloj, fecha y llamado a la
acción.
**Prueba:** morph de dígitos, tiempo real y un final con CTA.
</details>
**Recetas nuevas:** `digits`.

### 16 · LOWER THIRDS ✅ *(disponible · 49 s · [trailers/lower-thirds](trailers/lower-thirds/index.html) · [guía del pack](trailers/lower-thirds/PACK.md))*
Un pack de 13 componentes para editores de video:
- rótulos de nombre en 4 estilos (barra, línea, bloque Bauhaus, cápsula);
- ubicación, redes, en vivo con zócalo corrido, capítulo y llamada de atención;
- 4 transiciones (iris, barras, formas, persianas).

Cada uno se ve solo con `?solo=<id>` y fondo transparente (o croma con `&chroma=00b140`), y se
exporta como **secuencia PNG con alfa** con `tools/frames.mjs`. El showreel los muestra sobre un fondo
que simula video, con un damero que deja ver la transparencia.

**Sumó al kit:** los modos de salida transparente y croma del motor, `tools/frames.mjs` (exportador
de secuencias PNG, que adelanta parte del #22 EXPORT) y el módulo `recipes-lower.js`, con un scramble
determinista.

<details><summary>La idea original</summary>

No es un tráiler: un pack de rótulos, zócalos y transiciones reutilizables para cualquier video.
**Prueba:** componentes sueltos y fondo transparente (chroma o alpha) para usar en editores de video.
**Recetas nuevas:** `lowerThird`, `wipe`.
</details>

## Cine

### 17 · NOIR ✅ *(disponible · 45 s · [trailers/noir](trailers/noir/index.html))*
**NOCTURNO**, un thriller en blanco y negro:
- lluvia que brilla en el cono de un farol que se enciende parpadeando, una silueta y un relámpago;
- intertítulos serif: "Un caso. Una ciudad. Ninguna salida.";
- una oficina con luz de persianas y polvo en los haces, donde el texto se enciende solo donde
  cae la luz y un auto que pasa barre las bandas;
- gotas corriendo por un vidrio con la ciudad desenfocada;
- un reflector que revela el título y **una sola línea roja**, el único color del film;
- créditos técnicos verdaderos ("Lluvia: 1.400 gotas") y un walking bass de jazz sintetizado.

**Sumó al kit:** el módulo `recipes-noir.js` (6 recetas sobre una capa de canvas) y el estilo
musical `walk`.

<details><summary>La idea original</summary>

Thriller en blanco y negro: lluvia, luz de persianas, humo y títulos serif elegantes.
**Prueba:** tipografía serif (fuera del look Bauhaus), partículas de lluvia y luces volumétricas falsas.
**Recetas nuevas:** `rain`, `blinds`.
</details>

### 18 · OPENING TITLES ✅ *(disponible · 41 s · [trailers/opening-titles](trailers/opening-titles/index.html))*
Títulos de apertura en homenaje a Saul Bass, donde la "película" es el propio hub:
- "KINETIC STUDIO presenta" en una banda de papel rasgado;
- una cámara de cine armada con recortes: "una película HECHA CON CÓDIGO";
- una espiral de la que sale "TRAILER HUB";
- el reparto son tráileres reales ("KINETIC como El Primero", "NOCTURNO como El Detective"…);
- el equipo técnico es verdadero ("música: Web Audio, en vivo", "montaje: GSAP");
- "dirigida por UNA LÍNEA DE TIEMPO", con un punto rojo de papel como punto final.

**Sumó al kit:** el módulo `recipes-bass.js` (6 recetas, papel cortado a tijera con clip-path,
letra "recortada a mano" y grano de papel en SVG).

<details><summary>La idea original</summary>

Secuencia de apertura al estilo Saul Bass: recortes de papel, siluetas y créditos de reparto.
**Prueba:** `clip-path` animado, collage y la convención de créditos cinematográficos.
**Recetas nuevas:** `cutout`, `castCredits`.
</details>

### 19 · SYNTHWAVE ✅ *(disponible · 37 s · [trailers/synthwave](trailers/synthwave/index.html))*
Un viaje a los 80 en una cinta VHS que muestra **la fecha real de hoy**:
- "PLAY ▶" sobre estática, y la imagen que se estabiliza;
- el sol de neón que sale detrás de las montañas y la grilla infinita, con "En los 80, esto se
  hacía con cinta de video. Hoy, con código.";
- letras cromadas: SIN CINTA · SIN VIDEO · SOLO CÓDIGO;
- sólidos de alambre con sus datos reales (cubo 8/12, pirámide 5/8, icosaedro 12/30);
- el logo "SYNTHWAVE" cromado con "Kinetic" en neón y un destello, y el final ■ STOP ◀◀ REW · FIN.

**Sumó al kit:** el módulo `recipes-synth.js` (6 recetas y una capa VHS) y el estilo musical
`synth` (arpegios, bajo pulsante, pads de sierras).

<details><summary>La idea original</summary>

Retro años 80: sol de neón, grilla en perspectiva, letras cromadas, distorsión VHS y arpegios de
sintetizador.
**Prueba:** grilla 3D en canvas, texto cromado con gradientes y un score en otro género musical.
**Recetas nuevas:** `retroGrid`, más un patrón de audio `arp`.
</details>

## Audio

### 20 · BEAT ✅ *(disponible · 34 s · [trailers/beat](trailers/beat/index.html))*
Un videoclip generativo donde **la partitura mueve la imagen**:
- el pulso: un disco que late con cada bombo, ondas por golpe y la onda del bajo;
- un secuenciador de 16 pasos con el patrón real, donde lo que ya sonó se enciende y lo que viene
  se ve en contorno;
- 12 notas en un círculo que se encienden con cada acorde, cortes de color en cada caja y chispas
  en los hi-hats;
- "BEAT", donde cada letra es un instrumento;
- una letra que cae palabra por palabra sobre los pulsos y dice la verdad ("Dieciséis pasos por
  compás. Así se ve la partitura.").

El medidor de abajo muestra el **espectro real del AnalyserNode** mientras suena, y el calculado de
la partitura en silencio.

**Sumó al kit:** `Trailer.music.events()` (la partitura como datos), un `AnalyserNode` en el audio,
el estilo `pulse` y el módulo `recipes-beat.js` (4 recetas).

<details><summary>La idea original</summary>

Visualizador musical: cada kick, hat y bajo del score mueve la imagen. Un videoclip generativo con
letras.
**Prueba:** `AnalyserNode` para que la imagen reaccione al audio, sync exacto al beat y letras
cronometradas.
**Cambio en el motor:** bus de análisis en `audio.js`.
</details>

## Técnica

### 22 · EXPORT ✅ *(disponible · 44 s · [trailers/export](trailers/export/index.html))*
**Del navegador a MP4, sin instalar nada.** Sumó `tools/export.mjs` al kit: cada tráiler del hub a MP4
(H.264 + AAC), WebM, GIF o WAV, todo dentro de Chrome:
- cada cuadro se captura en su segundo exacto;
- WebCodecs lo codifica y el MP4 se arma en el navegador;
- el sonido se renderiza offline (`OfflineAudioContext`), en paralelo.

No hizo falta ffmpeg.

El tráiler cuenta el proceso con **números de exportaciones reales** (`tools/capture.mjs`):
- KINETIC → `exports/kinetic.mp4`: 1.563 cuadros en 303 s y 53,1 MB, más el WAV;
- WRAPPED → `exports/wrapped.mp4` en 9:16 (44,0 MB);
- BEAT → `exports/beat.gif` (14,7 MB).

Las escenas:
- el contador de cuadros;
- el mismo cuadro de WRAPPED (11,8 s) alcanzado por 3 caminos, con el mismo SHA-256;
- la forma de onda real de KINETIC con sus 279 eventos;
- la terminal con el comando y su salida;
- los tres archivos a la misma escala.

**Sumó al kit:**
- `tools/export.mjs` + `export-encoder.html`;
- `SFX.render()` y `trailer.renderAudio()`: el audio offline, con semilla fija;
- la sincronización de animaciones CSS al tiempo de la película;
- el módulo `recipes-export.js` (6 recetas);
- en la terminal, un `prompt` por comando.

**Hallazgo:** KINETIC, el tráiler más viejo, da cuadros distintos cuando se lo alcanza hacia atrás en
algunas escenas. No afecta al export (que siempre avanza), pero queda anotado para corregirlo.

<details><summary>La idea original</summary>

Del navegador a MP4: renderizar el tráiler cuadro por cuadro (ya es determinista) y convertirlo a
video o GIF para redes, con el audio aparte.
**Prueba:** el pipeline para compartir fuera del navegador. Es lo más útil a mediano plazo.
**Tecnología nueva:** `tools/export.mjs` (captura por cuadro con Chrome + ffmpeg).
</details>

### 23 · BIFURCACIÓN ✅ *(disponible · 34 s por camino · [trailers/bifurcacion](trailers/bifurcacion/index.html))*
**Un tráiler que se elige.** Una línea de commits (los tráileres del hub) se bifurca, y vos elegís el
camino con un clic o con la tecla:
- **A · LA FORMA:** un mundo de geometría en capas y una forma que se transforma;
- **B · EL DATO:** las cifras reales del hub en capas de profundidad y el tiempo que va y vuelve.

Los dos caminos se juntan en un *merge* que dice cuál elegiste y te ofrece el otro.

**La interacción:**
- el mouse mueve la cámara (parallax por capas, con Observer);
- la rueda es el tiempo: el scroll recorre el camino para adelante y para atrás, con ScrollTrigger;
- si no tocás nada, sigue solo;
- si volvés antes de la bifurcación, elegís de nuevo.

La vista previa del hub y las exportaciones son lineales: `?path=a` o `?path=b`.

**Sumó al kit:**
- el **modo interactivo** del motor: ramas en un mismo timeline, `D.hold`, `D.post`, `D.choose`,
  la cámara `D.cam` con `data-depth` y variantes de texto por camino y por modo;
- `js/interactive.js`;
- música anclada a cada rama;
- el módulo `recipes-branch.js` (7 recetas).

<details><summary>La idea original</summary>

Tráiler interactivo: el espectador elige el camino (A/B), el mouse mueve la cámara y el scroll controla
el tiempo.
**Prueba:** ramas de timeline, ScrollTrigger y Observer: el tráiler como experiencia web.
**Cambio en el motor:** modo interactivo.
</details>

---

## Cómo habilitar un tráiler en el hub

1. El tráiler vive en `trailers/<id>/`, construido con el kit, con `meta.back: '../../index.html'`.
2. En `hub/catalog.js`, su entrada pasa a `enabled: true` y se completan estos campos:
   - `path`
   - `poster`: el segundo que se ve congelado
   - `preview`: desde dónde arranca la vista previa al pasar el mouse
   - `duration` y `scenes`
3. Listo. El hub genera el póster en vivo y la vista previa a partir del tráiler real.

El agente trailer-director hace estos tres pasos solo si le decís que es para el hub.
