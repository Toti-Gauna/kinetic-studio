# BAUHAUS 100 — storyboard del tráiler

Duración: **48,0 s** (47,5 s de escenas + 0,5 s de negro final) · grilla de 120 BPM (1 tiempo = 0,5 s) ·
idioma: español · 1920×1080.
Concepto: *todo se construye con tres formas*. Un documento se escribe en la oscuridad y funda la
escuela; de ahí en más la película es una clase de la Bauhaus: la gramática de la forma (punto,
línea, plano, grilla, volumen), el cuestionario de Kandinsky, una composición que primero es un
plano y después se imprime, un póster suizo, los tres directores y los catorce años en ocho cortes.

Prueba de "solo kit": ninguna receta nueva, sin `custom.js` y sin tocar `engine.js`, `recipes*.js`,
`audio.js` ni `style.css`. Todo sale de `js/trailer.js`.

| # | escena | inicio–fin | texto en pantalla | colores | momento sonoro | pase a la siguiente |
|---|---|---|---|---|---|---|
| 1 | `typewriter` | 0,00–6,72 | WEIMAR, 1919. / NACE LA **BAUHAUS**. | fondo night, texto papel, selección roja | drone grave, una tecla por letra; campana al seleccionar (4,64 s) | se borra todo menos BAUHAUS; la caja roja de la selección crece hasta ser el cuadro (6,12 s) |
| 2 | `shift` | 6,72–11,72 | PUNTO · LÍNEA · PLANO · GRILLA · VOLUMEN (1 palabra cada 2 tiempos) | rojo / papel / amarillo / azul / ink. Formas propias: disco negro, diagonal azul, cuadrado rojo, retícula 3×3 papel, cubo isométrico amarillo | bombo + palmas + bajo por paso, melodía de campanas | el cubo se pliega en un punto papel que viaja al centro |
| 3 | `forms` | 11,72–17,22 | 1923 (contorno gigante) · 01 — CÍRCULO · AZUL / 02 — CUADRADO · ROJO / 03 — TRIÁNGULO · AMARILLO | papel; círculo azul, cuadrado rojo, triángulo amarillo en multiply | bombo + campanas al llenarse cada forma, hats, riser | el círculo azul se traga el cuadro → fondo azul |
| 4 | `logo` | 17,22–21,42 | TRIÁNGULO AMARILLO · CUADRADO ROJO · CÍRCULO AZUL | sobre azul: primero trazos papel (un plano), después la hoja crema "impresa" con los colores del cuestionario | whoosh del trazado, boom + flash al imprimirse, "bip" del compás que se dibuja encima | la hoja se desenfoca; corte a amarillo |
| 5 | `stack` | 21,42–26,42 | ARTE, OFICIO, / LETRA Y / **ARQUITECTURA** → una sola / **escuela** | amarillo, texto ink, acento azul | bombo en negras, palmas en 2 y 4, ticks por línea | las líneas salen hacia los costados; corte a negro |
| 6 | `rules` | 26,42–32,42 | 01 WALTER GROPIUS 1919–1928 · 02 HANNES MEYER 1928–1930 · 03 LUDWIG MIES VAN DER ROHE 1930–1933 | ink (odómetro amarillo) → rojo (odómetro ink, barrido hacia arriba) → azul (odómetro amarillo) | ticks del odómetro, campana por director, bombo y bajo | el número y el riel se apagan; corte a papel |
| 7 | `statement` | 32,42–35,72 | MENOS **ES MÁS.** (HUD: MIES VAN DER ROHE) | papel, texto ink, acento rojo | solo una tríada de campanas: el respiro antes del montaje | las letras suben y salen |
| 8 | `montage` | 35,72–38,22 | 1919 · WEIMAR · ● · DESSAU · ■ · BERLÍN · ▲ · 1933, después **1 tiempo de silencio** (37,72–38,22) | ink, rojo, papel, azul, amarillo, papel, rojo, ink | un golpe por corchea, luego silencio total | negro |
| 9 | `title` | 38,22–43,82 | BAUHAUS · WEIMAR 1919 · DESSAU 1925 · BERLÍN 1932 | night con halo azul; órbita círculo azul / cuadrado rojo / triángulo amarillo | BRAAAM + boom + crash; respiración del eje de ancho con bombo en 42,3 s | los caracteres se van por los bordes |
| 10 | `credits` | 43,82–47,52 | 3 CIUDADES · 3 DIRECTORES · 14 AÑOS · CERRADA EN 1933 BAJO PRESIÓN NAZI | night, cifras papel, marca con el trío de Kandinsky | ticks, conteo, boom final | el letterbox se cierra como un telón |

Forma de 3 actos: **gancho** 0–6,7 s (el documento funda la escuela), **escalada** 6,7–38,2 s
(gramática → cuestionario → composición → escuela → directores → la frase → los catorce años en
ocho cortes), **desenlace** 38,2–48 s (silencio, título, cifras reales).

## Notas

- **Hechos usados** (todos de la lista verificada del brief): fundada en Weimar en 1919 por Walter
  Gropius; Dessau en 1925; Berlín en 1932; cerrada en 1933 bajo presión nazi; directores Gropius
  (1919–1928), Hannes Meyer (1928–1930) y Ludwig Mies van der Rohe (1930–1933); 3 ciudades,
  3 directores, 14 años; el cuestionario de Kandinsky de 1923 (triángulo → amarillo, cuadrado →
  rojo, círculo → azul); "menos es más", atribuida comúnmente a Mies; el alfabeto universal en
  minúsculas de Herbert Bayer (1925), como guiño en "una sola escuela".
- **Copy inventado (no son datos):** "NACE LA BAUHAUS", PUNTO / LÍNEA / PLANO / GRILLA / VOLUMEN,
  "ARTE, OFICIO, LETRA Y ARQUITECTURA → una sola escuela", las leyendas del HUD y los FIG.
  La composición de la escena 4 es original: no reproduce ninguna obra real.
- **Paleta** (tres primarios de imprenta + negro cálido + papel, sin neón; distinta de KINETIC):
  - `night` #0f0e0d · `ink` #1a1816 · `paper` #efe8d8
  - `accents[0..2]` en el orden del cuestionario: azul #1f3f99 (círculo), rojo #d62e1f (cuadrado),
    amarillo #f4bd12 (triángulo); `[3]` amarillo (brillo del título), `[4]` azul y `[1]` rojo
    (split cromático), `[5]` rojo
  - `glow` azul (halo del título; sobre el azul de la escena 4 la sombra del logo no se ve)
- **Tipografía:** Archivo (ejes wdth + wght: los necesita `stack` para justificar), JetBrains Mono
  para HUD y leyendas. Instrument Serif queda cargada por el template pero no se usa.
- **Paths propios de `shift`** (viewBox −250..250, `spin: 0`): disco r=118, diagonal de 60 u de
  espesor, retícula 3×3 de cuadrados de 124 u, cubo isométrico en tres rombos separados.
