# LOWER THIRDS — pack de rótulos, zócalos y transiciones

13 componentes hechos 100 % con código (HTML, CSS y GSAP), listos para usar en cualquier editor de
video. Todos respetan el área segura de títulos (márgenes del 10 %) y tienen entrada, permanencia y
salida.

## Verlos

- `index.html`: el showreel. Muestra cada componente sobre un fondo que simula video, y en algunos
  un damero a la derecha que deja ver la transparencia.
- `index.html?solo=<id>`: un componente solo, con fondo transparente.
- `index.html?solo=<id>&chroma=00b140`: el mismo componente sobre croma verde (o el color que
  quieras).

| id | componente | duración |
|---|---|---|
| `nombre-barra` | Nombre · barra de color | 3,5 s |
| `nombre-linea` | Nombre · línea | 3,5 s |
| `nombre-bloque` | Nombre · bloque Bauhaus | 3,5 s |
| `nombre-capsula` | Nombre · cápsula con avatar | 3,5 s |
| `ubicacion` | Ubicación | 3,5 s |
| `redes` | Redes sociales | 3,5 s |
| `en-vivo` | En vivo + zócalo corrido | 5 s |
| `capitulo` | Capítulo | 3,5 s |
| `llamada` | Llamada de atención | 3,5 s |
| `transicion-iris` | Transición · iris | 1,5 s |
| `transicion-barras` | Transición · barras | 1,5 s |
| `transicion-formas` | Transición · formas | 1,5 s |
| `transicion-persianas` | Transición · persianas | 1,5 s |

Las transiciones tapan todo el cuadro justo en la mitad (0,75 s): cortá los dos clips ahí.

## Exportarlos para un editor de video

Con Node y Chrome instalados:

```bash
node ~/.claude/trailer-kit/tools/frames.mjs trailers/lower-thirds/index.html --alpha --query solo=nombre-barra --fps 30 --out ./nombre-barra
```

Genera una **secuencia PNG con canal alfa** (`frame_00001.png`, `frame_00002.png`, …). Importala como
secuencia de imágenes:

- **Premiere Pro:** Importar → marcar "Secuencia de imágenes".
- **DaVinci Resolve:** el Media Pool la reconoce sola; interpretá el alfa como "straight".
- **After Effects:** Importar → "Secuencia PNG".
- **Final Cut Pro:** importá la carpeta o convertila antes a ProRes 4444.

Otras opciones:
- `--chroma 00b140` en vez de `--alpha`: fondo verde para keying.
- `--fps 25` o `--fps 60`.
- `--from` y `--to`: exportar solo un tramo, en segundos.

## Cambiar textos y colores

Todo está en `js/trailer.js`:
- los textos de cada componente (nombre, cargo, lugar, usuario, titulares…) están en la lista `PACK`;
- los colores del pack están en `lower: { accent, accent2, ink, paper, glass }`.

Los nombres de personas del showreel son de ejemplo.
