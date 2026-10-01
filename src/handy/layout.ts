/* Composición compartida del escenario 1440×1080 de los tráileres de Handy.
   Las escenas de app dejan el teléfono en PHONE_HOME para que los cortes entre escenas sean invisibles. */
import { SCREEN } from './tokens.ts';

/** Marco del teléfono alrededor de la pantalla de 414×896. */
export const PHONE = {
  bezel: 12,
  w: SCREEN.w + 24,
  h: SCREEN.h + 24,
  radius: 60,
  screenRadius: 48,
} as const;

/** Centro del teléfono en reposo (escenas de app): la columna izquierda queda para el titular. */
export const PHONE_HOME = { cx: 1030, cy: 540 } as const;

/** Columna del titular en las escenas de app. */
export const HEADLINE = { x: 110, w: 620 } as const;

/** Margen seguro del escenario. */
export const SAFE = 72;

/** Posición (x, y) de la esquina del teléfono en PHONE_HOME, para gsap.set(telefono, PHONE_XY) con el marco en left:0 top:0. */
export const PHONE_XY = { x: PHONE_HOME.cx - PHONE.w / 2, y: PHONE_HOME.cy - PHONE.h / 2 } as const;
