# Handy · Anuncios (vertical y horizontal) — storyboard

Dos anuncios de **30 s** con la misma película, armada para cada formato:

| tráiler | escenario | para |
|---|---|---|
| `trailers/handy-vertical` | 1080×1920 (9:16) | Reels, TikTok, Shorts, historias |
| `trailers/handy-anuncio` | 1920×1080 (16:9) | YouTube y Meta (in-stream, feed horizontal) |

Junta los dos tráileres para iPad (usuario y especialista) en un spot comercial: un gancho que les habla a los dos
públicos, la marca, el lado del que necesita, el lado del que sabe, un remate y el cierre. 120 BPM (1 compás = 2 s);
partitura en `partitura.js`, escenas en `pelicula.js`, medidas de cada formato en `formato.js`.

## Reglas
- Voseo rioplatense, pesos `$ 45.000`, **verificados**, nada en inglés, nombres ficticios (Martín R., Carla M.;
  nunca el nombre real de las maquetas). No inventar cifras, funciones ni promesas: todo sale de los storyboards de
  `trailers/handy-usuario` y `trailers/handy-especialista`.
- Comisión: el cliente paga una tarifa de servicio del 5 % (no hace falta mostrarla); al especialista Handy le cobra el
  10 % de su presupuesto: de $ 45.000 recibe **$ 40.500** (`netoEspecialista` de `src/handy/tokens.ts`).
- Se tiene que poder leer: cada texto queda quieto **al menos 1,2 s**; titulares grandes y cortos.
- Vertical: el texto vive entre y 220 y y 1560 (`formato(D).seguro`): arriba y abajo las interfaces de las apps tapan.
- Solo transform y opacity; todo en `D.tl` en tiempos absolutos desde T; estados iniciales con `gsap.set`; sin
  `from`/`fromTo`; azar solo con `D.rand`. Cada receta devuelve exactamente `o.dur` (el reproductor lo controla).
- Sangrado: si la pantalla no es del formato exacto se ve el escenario más allá del cuadro (`src/handy/layout.ts`):
  los fondos de color cubren el sangrado (`--hd-sx` / `--hd-sy`) y lo que entra o sale arranca o termina afuera de lo
  que se ve (`afuera()` / `visible()`).

## Escenas

| película | receta (`id`) | qué pasa |
|---|---|---|
| 0–4 | `ha-golpe` (`gancho`) | Golpes de palabras, uno por tiempo de compás (0 · 1 · 2 · 3): **¿Se rompió** (azul) / **algo?** (amarillo, mitad de abajo, la Gota preocupada) · **¿Sabés** (blanco) / **arreglarlo?** (azul, mitad, la Llave). El anuncio arranca pegando: la primera palabra ya está en el cuadro 0. |
| 4–6 | `ha-marca` (`marca`) | Destello. Los cinco Handys saltan a cuadro y forman el logo **Handy** + **Soluciones, no problemas** (versión corta de la entrada de los tráileres). |
| 6–14 | `ha-usuario` (`usuario`) | El que necesita. Ficha arriba: **Si necesitás**. Titulares: **Pedí lo que necesitás.** (6–8,5: el inicio de la app, el dedo toca Plomería) → **Te llegan presupuestos.** (8,5–11: llegan los tres presupuestos: Martín R. $ 45.000, Lucía G. $ 48.500, Diego P. $ 51.000) → **Elegí el tuyo.** (11–14: el dedo toca Aceptar en el de Martín; **¡Pedido confirmado!**). |
| 14–16 | `ha-golpe` (`giro`) | **¿Y si sos** (azul) / **especialista?** (amarillo, mitad, el Engranaje); sale tirándose contra la cámara. |
| 16–24 | `ha-especialista` (`especialista`) | El que sabe. DROP (destello). Ficha: **Si sabés**. **Te llegan pedidos cerca.** (16–18,5: el inicio del especialista con Trabajando prendido; llega el pedido de Plomería · Jue 15 oct · 16:00) → **Vos ponés el precio.** (18,5–21: la hoja Tu presupuesto: $ 32.000 + $ 13.000 = **$ 45.000** · Comisión Handy 10 % · recibís **$ 40.500**) → **¡Te eligieron!** (21–24: el aviso de Carla M., papelitos). |
| 24–26 | `ha-golpe` (`remate`) | **Para el que necesita.** (azul, la Gota) · **Para el que sabe.** (amarillo, la Llave). |
| 26–30 | `ha-final` (`final`) | Destello. Logo **Handy** · **Soluciones, no problemas**, los cinco Handys en fila festejan, **Mar del Plata · Llegamos el 28/10**. Desde 28,5 todo queda quieto (el último cuadro es la placa del anuncio). |

## Componentes que se reusan
`src/handy/ui/PhoneFrame.ts` (`phoneFrame`), `pantallas/usuario.ts`, `pantallas/usuario-chat.ts` (presupuestos),
`pantallas/especialista.ts` (inicio, pedido, hoja de presupuesto, aviso ¡Te eligieron!), `ui/Finger.ts`,
`ui/Headline.ts`, `handys.ts` / `handys-anim.ts`, `logo.ts`. Las escenas de los tráileres para iPad
(`trailers/handy-usuario/js/escenas-*.js`, `trailers/handy-especialista/js/escenas-*.js`) son la referencia de
coreografía, estética y sonido; acá las medidas salen de `formato(D)`.
